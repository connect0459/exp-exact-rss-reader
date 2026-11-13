import type { Answer, Result, Sources, Storage } from './app.contract.d.ts';
import { entryIdOf } from './entryId.ts';
import { feedIdOf } from './feedId.ts';
import { INITIAL_FEEDS } from './fixtures.ts';
import { parseFeed } from './rss.ts';
import { fetchFeed } from './source.ts';

const FILE = 'app:/data/state.json';
export const grants = [`fs.read ${FILE}`, `fs.write ${FILE}`, 'net.fetch https://zenn.dev'].join('\n');

type Feed = Result<'loadFeeds'>[number];
type Article = Result<'loadEntries'>[number];
type Reply = Result<'markRead'>;
type Saved = Omit<Article, 'read' | 'starred'>;

type State = { read: string[]; starred: Saved[]; added: Feed[] };

let state: State | null = null;
const seen = new Map<string, Saved>();

async function load(storage: Storage): Promise<State> {
  if (!state) {
    state = await storage.fs.readFile(FILE).then(
      (bytes) => ({ read: [], starred: [], added: [], ...JSON.parse(new TextDecoder().decode(bytes)) }) as State,
      (e) => {
        if (e.code === 'ENOENT') return { read: [], starred: [], added: [] };
        throw e;
      });
  }
  return state;
}

async function save(storage: Storage, current: State): Promise<Reply> {
  await storage.fs.atomicWriteFile(FILE, new TextEncoder().encode(JSON.stringify(current)));
  return { ok: true, error: '' };
}

const feedsOf = (current: State): Feed[] => [...INITIAL_FEEDS, ...current.added];

const byNewest = (a: Saved, b: Saved): number => Date.parse(b.published) - Date.parse(a.published);

const sources: Sources = {
  loadFeeds: async (_args, _store, storage) => feedsOf(await load(storage)),

  loadEntries: async ([feedId], _store, storage) => {
    const current = await load(storage);
    const feed = feedsOf(current).find((f) => f.id === feedId);
    if (!feed) return [];
    const parsed = parseFeed(await fetchFeed(feed.url));
    const starred = new Set(current.starred.map((s) => s.id));
    const read = new Set(current.read);
    return parsed.entries
      .map((e) => {
        const id = entryIdOf(e.id);
        const saved: Saved = { id, feedId, title: e.title, summary: e.summary, link: e.link, published: e.published };
        seen.set(id, saved);
        return { ...saved, publishedMs: e.publishedMs, read: read.has(id), starred: starred.has(id) };
      })
      .sort((a, b) => b.publishedMs - a.publishedMs)
      .map(({ publishedMs: _drop, ...article }) => article);
  },

  loadStarred: async (_args, _store, storage) => {
    const current = await load(storage);
    const read = new Set(current.read);
    return [...current.starred]
      .sort(byNewest)
      .map((s) => ({ ...s, read: read.has(s.id), starred: true }));
  },

  markRead: async ([id], _store, storage) => {
    const current = await load(storage);
    if (!current.read.includes(id)) current.read.push(id);
    return save(storage, current);
  },

  flipStar: async ([id], _store, storage) => {
    const current = await load(storage);
    if (current.starred.some((s) => s.id === id)) {
      current.starred = current.starred.filter((s) => s.id !== id);
      return save(storage, current);
    }
    const entry = seen.get(id);
    if (!entry) return { ok: false, error: 'That entry is no longer available.' };
    current.starred.push(entry);
    return save(storage, current);
  },

  subscribe: async ([url], _store, storage) => {
    const current = await load(storage);
    const id = feedIdOf(url);
    const existing = feedsOf(current).find((f) => f.id === id || f.url === url);
    if (existing) return { ok: false, error: `Already subscribed to ${existing.title}.` };
    let title: string;
    try {
      title = parseFeed(await fetchFeed(url)).title || id;
    } catch {
      return { ok: false, error: 'No feed was found at that address.' };
    }
    current.added.push({ id, title, url });
    return save(storage, current);
  },
};

export const answer: Answer = (source, args, store, storage, native) => sources[source](args, store, storage, native);
