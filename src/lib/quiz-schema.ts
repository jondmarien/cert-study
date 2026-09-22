import { z } from "zod";

import { TRACK_IDS } from "./types";

export const QUIZ_TRACKS = ["bscp", "security-plus", "mixed"] as const;

export type QuizTrack = (typeof QUIZ_TRACKS)[number];

export const QUIZ_TRACK_LABELS: Record<QuizTrack, string> = {
  bscp: "BSCP",
  "security-plus": "Security+",
  mixed: "Both tracks",
};

const slugSchema = z.string().regex(/^[a-z0-9-]+$/);

export const quizQuestionSchema = z
  .object({
    prompt: z.string().trim().min(12).max(400),
    choices: z.array(z.string().trim().min(1).max(180)).min(2).max(5),
    answer: z.number().int().nonnegative(),
    explain: z.string().trim().min(12).max(600),
  })
  .strict()
  .superRefine((question, ctx) => {
    if (question.answer >= question.choices.length) {
      ctx.addIssue({
        code: "custom",
        message: "answer index is outside the choice list",
        path: ["answer"],
      });
    }
    const seen = new Set(question.choices.map((choice) => choice.toLocaleLowerCase()));
    if (seen.size !== question.choices.length) {
      ctx.addIssue({
        code: "custom",
        message: "choices must be distinct",
        path: ["choices"],
      });
    }
  });

export const quizSchema = z
  .object({
    title: z.string().trim().min(3).max(80),
    track: z.enum(QUIZ_TRACKS),
    summary: z.string().trim().min(24).max(280),
    lesson: z
      .object({
        track: z.enum(TRACK_IDS),
        slug: slugSchema,
      })
      .strict()
      .optional(),
    questions: z.array(quizQuestionSchema).min(1).max(20),
  })
  .strict();

export const storedQuizSchema = quizSchema.extend({
  id: slugSchema,
  createdAt: z.string().min(4),
});

export type Quiz = z.infer<typeof quizSchema>;
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type StoredQuiz = z.infer<typeof storedQuizSchema>;

export type PlayableQuiz = Quiz & { id: string };

export function quizFileBody(quiz: PlayableQuiz | StoredQuiz): Quiz {
  return {
    title: quiz.title,
    track: quiz.track,
    summary: quiz.summary,
    ...(quiz.lesson ? { lesson: quiz.lesson } : {}),
    questions: quiz.questions,
  };
}

export function slugifyTitle(title: string): string {
  return title
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
