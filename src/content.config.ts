import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

import { loadCurriculum } from "./lib/curriculum";
import { TRACK_IDS } from "./lib/types";

loadCurriculum();

const lessonSchema = z
  .object({
    title: z.string().min(3),
    family: z.string().min(2),
    order: z.number().int().positive(),
    status: z.enum(["ready", "outline"]),
    minutes: z.number().int().positive().max(90),
    summary: z.string().min(24),
    objectives: z.array(z.string().min(8)).min(2).max(6),
    academy: z.string().min(2).optional(),
    related: z
      .array(
        z
          .object({
            track: z.enum(TRACK_IDS),
            slug: z.string().regex(/^[a-z0-9-]+$/),
            label: z.string().min(2).optional(),
          })
          .strict(),
      )
      .max(6),
    tags: z.array(z.string().regex(/^[a-z0-9-]+$/)).min(1).max(8),
  })
  .strict();

function lessonCollection(base: string) {
  return defineCollection({
    loader: glob({
      base,
      pattern: "*.mdx",
      generateId: ({ entry }) => entry.split("/").pop()?.replace(/\.mdx$/, "") ?? entry,
    }),
    schema: lessonSchema,
  });
}

export const collections = {
  bscp: lessonCollection("./content/bscp"),
  "security-plus": lessonCollection("./content/security-plus"),
};
