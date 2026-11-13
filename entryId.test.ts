import { expect, test } from 'bun:test';
import { entryIdOf } from './entryId.ts';

test('a plain token keeps its own id, so fixture ids stay readable', () => {
  expect(entryIdOf('a1')).toBe('a1');
  expect(entryIdOf('post_2-b')).toBe('post_2-b');
});

test('a URL becomes an id with no path separator, so a route can carry it', () => {
  const id = entryIdOf('https://zenn.dev/example/articles/a-long-article-slug-with-dashes');
  expect(id).toMatch(/^[a-z0-9.]+$/);
  expect(id).not.toContain('/');
});

test('the same guid always gives the same id', () => {
  const guid = 'https://zenn.dev/connect0459/articles/example';
  expect(entryIdOf(guid)).toBe(entryIdOf(guid));
});

test('different guids give different ids', () => {
  const guids = [
    'https://zenn.dev/connect0459/articles/one',
    'https://zenn.dev/connect0459/articles/two',
    'https://zenn.dev/example/articles/one',
    'tag:example.com,2026:1',
  ];
  expect(new Set(guids.map(entryIdOf)).size).toBe(guids.length);
});

test('an id made from a guid never collides with a plain token', () => {
  expect(entryIdOf('https://example.com/a1')).not.toBe('a1');
});
