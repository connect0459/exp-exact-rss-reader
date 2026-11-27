export type FixtureFeed = { id: string; title: string; url: string };

const rss = (title: string, items: string[]) =>
  `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${title}</title><link>https://example.com</link>${items.join('')}</channel></rss>`;

const item = (guid: string, title: string, pubDate: string, description: string) =>
  `<item><guid>${guid}</guid><title>${title}</title><link>https://example.com/posts/${guid}</link><pubDate>${pubDate}</pubDate><description>${description}</description></item>`;

export const INITIAL_FEEDS: FixtureFeed[] = [
  { id: 'alpha', title: 'Alpha Dispatch', url: 'https://example.com/alpha.xml' },
  { id: 'beta', title: 'Beta Weekly', url: 'https://example.com/beta.xml' },
  { id: 'delta', title: 'Delta Digest', url: 'https://example.com/delta.xml' },
  { id: 'zenn', title: 'Zenn', url: 'https://zenn.dev/connect0459/feed' },
];

export const FIXTURE_FEEDS: Record<string, string> = {
  'https://example.com/alpha.xml': rss('Alpha Dispatch', [
    item('a3', 'Alpha three', 'Thu, 05 Nov 2026 09:00:00 GMT', 'The third alpha post.'),
    item('a1', 'Alpha one', 'Tue, 03 Nov 2026 09:00:00 GMT', 'The first alpha post.'),
    item('a2', 'Alpha two', 'Wed, 04 Nov 2026 09:00:00 +0000', '&lt;p&gt;Second &lt;b&gt;post&lt;/b&gt; &amp;amp; more&lt;/p&gt;'),
  ]),
  'https://example.com/beta.xml': rss('Beta Weekly', [
    item('b1', 'Beta one', 'Fri, 06 Nov 2026 09:00:00 GMT', 'The first beta post.'),
    item('b2', 'Beta two', 'Sat, 07 Nov 2026 09:00:00 GMT', '<![CDATA[<p>The second beta post.</p>]]>'),
  ]),
  'https://example.com/delta.xml': rss('Delta Digest', [
    item('https://example.com/posts/d2', 'Delta two', 'Tue, 10 Nov 2026 09:00:00 GMT', 'The second delta post.'),
    item('https://example.com/posts/d1', 'Delta one', 'Mon, 09 Nov 2026 09:00:00 GMT', 'The first delta post.'),
  ]),
  'https://example.com/gamma.xml': rss('Gamma Gazette', [
    item('g1', 'Gamma one', 'Sun, 08 Nov 2026 09:00:00 GMT', 'The only gamma post.'),
  ]),
};
