import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

// "YYYY-MM-DD", or "YYYY-MM" while an event's days are not known yet.
const eventDate = /^\d{4}-\d{2}(-\d{2})?$/;

// One JSON file per digest issue, src/content/digest/<YYYY-MM>.json, written by
// `make publish` in the mailing list repo (tools/publish.py there) with the same
// rendering as the email. Not edited by hand: rerun `make publish` instead.
const digest = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/digest' }),
  schema: z.object({
    number: z.number().int(),
    month: z.string().regex(/^\d{4}-\d{2}$/),
    month_name: z.string(),
    subject: z.string(),
    preheader: z.string(),
    sent_at: z.string().nullable(),
    intro: z.string(), // HTML
    sections: z.array(
      z.object({
        title: z.string(),
        html: z.string(),
        // "In this issue": one line per item, linking to the item's first link.
        contents: z.array(z.object({ label: z.string(), url: z.string().nullable() })),
      }),
    ),
    pdf: z.string(), // file name, in public/digest/<YYYY-MM>/
  }),
});

// Edited by hand: see README.md for the fields.
const events = defineCollection({
  loader: file('src/data/events.json'),
  schema: z.object({
    kind: z.string(),
    title: z.string(),
    summary: z.string().optional(),
    start: z.string().regex(eventDate),
    end: z.string().regex(eventDate).optional(), // defaults to `start`
    venue: z.string().optional(),
    city: z.string().optional(),
    url: z.string().optional(),
    links: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
  }),
});

export const collections = { digest, events };
