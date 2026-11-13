import { FIXTURE_FEEDS } from './fixtures.ts';

export async function fetchFeed(url: string): Promise<string> {
  const text = FIXTURE_FEEDS[url];
  if (text === undefined) throw new Error(`no feed at ${url}`);
  return text;
}
