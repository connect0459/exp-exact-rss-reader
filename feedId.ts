const GENERIC_SEGMENTS = new Set(['feed', 'rss', 'atom', 'index']);

const withoutExtension = (segment: string): string => segment.replace(/\.[A-Za-z0-9]+$/, '');

const routeSafe = (text: string): string => text.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');

export function feedIdOf(url: string): string {
  const withoutScheme = url.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '');
  const [authority, ...path] = withoutScheme.split('#')[0].split('?')[0].split('/');
  const segments = path.filter(Boolean).map(withoutExtension);
  while (segments.length > 0 && GENERIC_SEGMENTS.has(segments[segments.length - 1].toLowerCase())) segments.pop();
  const name = segments.length > 0 ? segments[segments.length - 1] : authority;
  return routeSafe(name) || routeSafe(authority);
}
