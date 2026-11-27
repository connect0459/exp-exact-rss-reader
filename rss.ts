export type ParsedEntry = {
  id: string;
  title: string;
  link: string;
  summary: string;
  published: string;
  publishedMs: number;
};

export type ParsedFeed = {
  title: string;
  entries: ParsedEntry[];
};

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
};

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

const CDATA = /^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/;

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, body: string) => {
    if (body[0] === '#') {
      const code = body[1].toLowerCase() === 'x' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? whole;
  });
}

function stripTags(text: string): string {
  return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function rawField(block: string, tag: string): string | null {
  const found = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'i').exec(block);
  return found ? found[1] : null;
}

function plainText(raw: string | null): string {
  if (raw === null) return '';
  const cdata = CDATA.exec(raw);
  return (cdata ? cdata[1] : decodeEntities(raw)).trim();
}

function summaryText(raw: string | null): string {
  if (raw === null) return '';
  const cdata = CDATA.exec(raw);
  return decodeEntities(stripTags(cdata ? cdata[1] : decodeEntities(raw)));
}

function instantOf(text: string): number {
  const rfc822 = /^(?:[a-z]{3},\s*)?(\d{1,2})\s+([a-z]{3})[a-z]*\s+(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(gmt|ut|z|[+-]\d{4})?/i.exec(text.trim());
  if (rfc822) {
    const month = MONTHS.indexOf(rfc822[2].toLowerCase());
    if (month >= 0) {
      const zone = rfc822[7] ?? 'GMT';
      const sign = zone[0] === '-' ? -1 : 1;
      const offsetMinutes = /^[+-]\d{4}$/.test(zone) ? sign * (Number(zone.slice(1, 3)) * 60 + Number(zone.slice(3, 5))) : 0;
      return Date.UTC(Number(rfc822[3]), month, Number(rfc822[1]), Number(rfc822[4]), Number(rfc822[5]), Number(rfc822[6] ?? 0)) - offsetMinutes * 60000;
    }
  }
  const parsed = Date.parse(text);
  return Number.isFinite(parsed) ? parsed : 0;
}

function dayOf(instant: number): string {
  return instant === 0 ? '' : new Date(instant).toISOString().slice(0, 10);
}

function entryOf(block: string): ParsedEntry {
  const link = plainText(rawField(block, 'link'));
  const guid = plainText(rawField(block, 'guid'));
  const publishedMs = instantOf(plainText(rawField(block, 'pubDate')));
  return {
    id: guid || link,
    title: plainText(rawField(block, 'title')),
    link,
    summary: summaryText(rawField(block, 'description')),
    published: dayOf(publishedMs),
    publishedMs,
  };
}

export function parseFeed(xml: string): ParsedFeed {
  if (!/<rss[\s>]/i.test(xml) || !/<channel[\s>]/i.test(xml)) throw new Error('not an RSS feed');
  const firstItem = xml.search(/<item[\s>]/i);
  const head = firstItem < 0 ? xml : xml.slice(0, firstItem);
  const items = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? [];
  return {
    title: plainText(rawField(head, 'title')),
    entries: items.map(entryOf),
  };
}
