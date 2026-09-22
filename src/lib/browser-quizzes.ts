import { storedQuizSchema, type StoredQuiz } from "./quiz-schema";

export const CUSTOM_QUIZ_KEY = "marien-study-quizzes";
export const QUIZ_SCORE_KEY = "marien-study-quiz-scores";

export type QuizScore = {
  correct: number;
  total: number;
  at: string;
};

function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function readCustomQuizzes(): StoredQuiz[] {
  const value = readJson(CUSTOM_QUIZ_KEY);
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const parsed = storedQuizSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

export function readCustomQuiz(id: string): StoredQuiz | null {
  return readCustomQuizzes().find((quiz) => quiz.id === id) ?? null;
}

export function saveCustomQuiz(quiz: StoredQuiz, fileIds: readonly string[]): string | null {
  if (fileIds.includes(quiz.id)) {
    return "A quiz file in content/quizzes already uses that slug.";
  }
  const next = readCustomQuizzes().filter((item) => item.id !== quiz.id);
  next.push(quiz);
  next.sort((a, b) => a.title.localeCompare(b.title));
  localStorage.setItem(CUSTOM_QUIZ_KEY, JSON.stringify(next));
  return null;
}

export function deleteCustomQuiz(id: string) {
  const next = readCustomQuizzes().filter((quiz) => quiz.id !== id);
  localStorage.setItem(CUSTOM_QUIZ_KEY, JSON.stringify(next));
}

export function readScores(): Record<string, QuizScore> {
  const value = readJson(QUIZ_SCORE_KEY);
  if (!value || typeof value !== "object") return {};
  const scores: Record<string, QuizScore> = {};
  for (const [id, score] of Object.entries(value)) {
    if (!score || typeof score !== "object") continue;
    const correct = Reflect.get(score, "correct");
    const total = Reflect.get(score, "total");
    const at = Reflect.get(score, "at");
    if (typeof correct !== "number" || typeof total !== "number" || typeof at !== "string") continue;
    scores[id] = { correct, total, at };
  }
  return scores;
}

export function saveQuizScore(id: string, correct: number, total: number) {
  const scores = readScores();
  scores[id] = { correct, total, at: new Date().toISOString() };
  localStorage.setItem(QUIZ_SCORE_KEY, JSON.stringify(scores));
}
