import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { hasExactDays, href } from '../../lib/site';

// Fixed so rebuilds produce a byte-identical file: a changing DTSTAMP would make
// every deploy look like an edit to calendar clients. Bump it by hand (together
// with SEQUENCE) whenever an event's dates actually change.
const DTSTAMP = '20261029T000000Z';
const SEQUENCE = 0;

/** Escape an RFC 5545 TEXT value. */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** Fold a content line to 75 octets, continuations prefixed with one space. */
function fold(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;

  const out: string[] = [];
  let current = '';
  let currentBytes = 0;
  // 75 octets on the first line, 74 after that: the leading space counts too.
  let limit = 75;

  for (const char of line) {
    const size = encoder.encode(char).length;
    if (currentBytes + size > limit) {
      out.push(current);
      current = '';
      currentBytes = 0;
      limit = 74;
    }
    current += char;
    currentBytes += size;
  }
  out.push(current);

  return out.join('\r\n ');
}

/** "2027-05-24" -> "20270524", with an optional day offset. */
function toDateValue(iso: string, addDays = 0): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + addDays);
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

// Only events whose days are known: a "YYYY-MM" date has nothing to put in a calendar.
export const getStaticPaths = (async () =>
  (await getCollection('events'))
    .filter((event) => hasExactDays(event.data))
    .map((event) => ({
      params: { id: event.id },
      props: { event },
    }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props, site }) => {
  const { event } = props as { event: CollectionEntry<'events'> };
  const e = event.data;
  const url = new URL(e.url ? href(e.url) : `${href('events/')}#${event.id}`, site).href;
  const location = [e.venue, e.city].filter(Boolean).join(', ');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AGM2//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@agm-2.github.io`,
    `DTSTAMP:${DTSTAMP}`,
    `SEQUENCE:${SEQUENCE}`,
    `DTSTART;VALUE=DATE:${toDateValue(e.start)}`,
    // DTEND is exclusive, so it is the day after the last day.
    `DTEND;VALUE=DATE:${toDateValue(e.end ?? e.start, 1)}`,
    `SUMMARY:${escapeText(e.title)}`,
    `DESCRIPTION:${escapeText(e.summary ? `${e.summary}\n\n${url}` : url)}`,
    `URL:${url}`,
    ...(location ? [`LOCATION:${escapeText(location)}`] : []),
    'TRANSP:OPAQUE',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return new Response(lines.map(fold).join('\r\n') + '\r\n', {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });
};
