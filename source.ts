import { FIXTURE_FEEDS } from './fixtures.ts';

const FIXTURE_ORIGIN = 'https://example.com/';
const TIMEOUT_MS = 10000;

export async function fetchFeed(url: string): Promise<string> {
  const fixture = FIXTURE_FEEDS[url];
  if (fixture !== undefined) return fixture;
  if (url.startsWith(FIXTURE_ORIGIN)) throw new Error(`no feed at ${url}`);
  const response = await fetch(url, { exactTimeout: TIMEOUT_MS });
  if (!response.ok) throw new Error(`${response.status} from ${url}`);
  return response.text();
}
