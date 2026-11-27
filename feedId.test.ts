import { expect, test } from 'bun:test';
import { feedIdOf } from './feedId.ts';

test('a feed file names its feed by its file name without the extension', () => {
  expect(feedIdOf('https://example.com/gamma.xml')).toBe('gamma');
});

test('a generic feed path is named by what comes before it', () => {
  expect(feedIdOf('https://zenn.dev/connect0459/feed')).toBe('connect0459');
  expect(feedIdOf('https://example.com/blog/rss.xml')).toBe('blog');
  expect(feedIdOf('https://example.com/atom')).toBe('example.com');
});

test('a query string and a trailing slash do not change the name', () => {
  expect(feedIdOf('https://example.com/gamma.xml?lang=ja')).toBe('gamma');
  expect(feedIdOf('https://example.com/blog/')).toBe('blog');
});

test('an address with no path is named by its host', () => {
  expect(feedIdOf('https://example.com')).toBe('example.com');
});

test('a name carries nothing a route cannot hold', () => {
  expect(feedIdOf('https://example.com/a b/c%20d.xml')).toMatch(/^[A-Za-z0-9._-]+$/);
});
