import site from '../data/site.json';

export const base = import.meta.env.BASE_URL;

/** A url that is either absolute (https:, mailto:, ...) or relative to the site root. */
export const href = (url: string) =>
  /^[a-z][a-z0-9+.-]*:/i.test(url) ? url : `${base}${url.replace(/^\//, '')}`;

// There is no sign-up form: subscribers are added by hand to the mailing list.
export const subscribeHref =
  `mailto:${site.contact}` +
  `?subject=${encodeURIComponent(`${site.digest}: subscribe`)}` +
  `&body=${encodeURIComponent(`Please add this address to the ${site.digest}.`)}`;

/** The build date, so a rebuild moves finished events to "Past". */
export const today = new Date().toISOString().slice(0, 10);

// Event dates are "YYYY-MM-DD", or "YYYY-MM" while the days are not known yet.
type Dated = { start: string; end?: string };
const isExact = (date: string) => date.length === 10;

/** Whether the event's days are known (and so it can have a calendar file). */
export const hasExactDays = ({ start, end = start }: Dated) => isExact(start) && isExact(end);

/** The last day of an event; a "YYYY-MM" date runs to the end of its month. */
const lastDay = ({ start, end = start }: Dated) => (isExact(end) ? end : `${end}-31`);

export const isUpcoming = (event: Dated) => lastDay(event) >= today;

const monthFormat = new Intl.DateTimeFormat('en-GB', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
const firstOfMonth = (date: string) => new Date(`${date.slice(0, 7)}-01T00:00:00Z`);

/** "2026-09-14" -> "14/09/2026", or "14/09" without the year. */
const dayMonth = (date: string, withYear = true) => {
  const [year, month, day] = date.split('-');
  return withYear ? `${day}/${month}/${year}` : `${day}/${month}`;
};

/** "03/12/2026", "14/09 – 19/09/2026", "30/12/2026 – 02/01/2027", or "September 2027". */
export const dateRange = (start: string, end = start) => {
  if (!hasExactDays({ start, end })) {
    return start.slice(0, 7) === end.slice(0, 7)
      ? monthFormat.format(firstOfMonth(start))
      : monthFormat.formatRange(firstOfMonth(start), firstOfMonth(end));
  }
  if (start === end) return dayMonth(start);
  return `${dayMonth(start, start.slice(0, 4) !== end.slice(0, 4))} – ${dayMonth(end)}`;
};

/** "Talks & events" -> "talks-events", for section anchors. */
export const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
