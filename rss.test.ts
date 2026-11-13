import { expect, test } from 'bun:test';
import { parseFeed } from './rss.ts';

const feed = (items: string, title = 'Alpha Dispatch') =>
  `<?xml version="1.0"?><rss version="2.0"><channel><title>${title}</title><link>https://example.com</link>${items}</channel></rss>`;

const item = (fields: Record<string, string>) =>
  `<item>${Object.entries(fields).map(([tag, value]) => `<${tag}>${value}</${tag}>`).join('')}</item>`;

test('a feed gives its channel title and its items in document order', () => {
  const parsed = parseFeed(feed(
    item({ guid: 'a1', title: 'One', link: 'https://example.com/1' }) +
    item({ guid: 'a2', title: 'Two', link: 'https://example.com/2' })));
  expect(parsed.title).toBe('Alpha Dispatch');
  expect(parsed.entries.map((e) => [e.id, e.title, e.link])).toEqual([
    ['a1', 'One', 'https://example.com/1'],
    ['a2', 'Two', 'https://example.com/2'],
  ]);
});

test('entities and CDATA in titles and summaries are decoded to plain text', () => {
  const parsed = parseFeed(feed(
    item({
      guid: 'a1',
      title: 'Fish &amp; chips &lt;3',
      description: '<![CDATA[<p>Hello &amp; welcome</p>]]>',
    })));
  expect(parsed.entries[0].title).toBe('Fish & chips <3');
  expect(parsed.entries[0].summary).toBe('Hello & welcome');
});

test('an item without a guid is identified by its link', () => {
  const parsed = parseFeed(feed(item({ title: 'One', link: 'https://example.com/1' })));
  expect(parsed.entries[0].id).toBe('https://example.com/1');
});

test('a publication date gives a calendar day and a sortable instant', () => {
  const parsed = parseFeed(feed(
    item({ guid: 'a1', title: 'One', pubDate: 'Mon, 10 Nov 2026 09:00:00 GMT' })));
  expect(parsed.entries[0].published).toBe('2026-11-10');
  expect(parsed.entries[0].publishedMs).toBe(Date.UTC(2026, 10, 10, 9, 0, 0));
});

test('missing optional fields read as empty text, not as undefined', () => {
  const parsed = parseFeed(feed(item({ guid: 'a1' })));
  expect(parsed.entries[0]).toEqual({
    id: 'a1', title: '', link: '', summary: '', published: '', publishedMs: 0,
  });
});

test('text that is not an RSS feed is refused', () => {
  expect(() => parseFeed('<html><body>Not a feed</body></html>')).toThrow('not an RSS feed');
  expect(() => parseFeed('')).toThrow('not an RSS feed');
});
