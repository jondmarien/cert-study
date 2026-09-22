import { useEffect, useState } from "react";

import { deleteCustomQuiz, readCustomQuizzes, readScores, type QuizScore } from "@/lib/browser-quizzes";
import { QUIZ_TRACK_LABELS, type QuizTrack, type StoredQuiz } from "@/lib/quiz-schema";

export type FileQuizCard = {
  id: string;
  href: string;
  title: string;
  summary: string;
  track: QuizTrack;
  questionCount: number;
};

function scoreLabel(score: QuizScore | undefined) {
  if (!score) return "Not tried in this browser";
  return `Last score ${score.correct} of ${score.total}`;
}

export default function QuizIndex({ fileQuizzes }: { fileQuizzes: FileQuizCard[] }) {
  const [custom, setCustom] = useState<StoredQuiz[]>([]);
  const [scores, setScores] = useState<Record<string, QuizScore>>({});

  useEffect(() => {
    setCustom(readCustomQuizzes());
    setScores(readScores());
  }, []);

  function remove(id: string) {
    if (!window.confirm("Remove this quiz from this browser?")) return;
    deleteCustomQuiz(id);
    setCustom(readCustomQuizzes());
  }

  return (
    <div className="mt-8 space-y-10">
      <section>
        <h2 className="font-display text-3xl">In the repo</h2>
        <ul className="mt-4 grid gap-3">
          {fileQuizzes.map((quiz) => (
            <li key={quiz.id} className="rounded-2xl border border-line bg-card p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">{QUIZ_TRACK_LABELS[quiz.track]}</p>
              <a href={quiz.href} className="mt-1 block font-display text-2xl hover:text-accent">
                {quiz.title}
              </a>
              <p className="mt-2 text-sm leading-6 text-muted">{quiz.summary}</p>
              <p className="mt-2 text-xs text-muted">
                {quiz.questionCount} questions · {scoreLabel(scores[quiz.id])}
              </p>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-3xl">Saved in this browser</h2>
          <a href="/quizzes/new" className="rounded-full bg-accent px-4 py-2 text-sm text-accent-ink">
            Write a quiz
          </a>
        </div>
        {custom.length === 0 ? (
          <p className="mt-4 text-sm leading-6 text-muted">
            Nothing saved here yet. A quiz you write stays in this browser until you download the JSON and add it
            under <code>content/quizzes</code>.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {custom.map((quiz) => (
              <li key={quiz.id} className="rounded-2xl border border-line bg-card p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted">{QUIZ_TRACK_LABELS[quiz.track]}</p>
                <a href={`/quizzes/local#${quiz.id}`} className="mt-1 block font-display text-2xl hover:text-accent">
                  {quiz.title}
                </a>
                <p className="mt-2 text-sm leading-6 text-muted">{quiz.summary}</p>
                <p className="mt-2 text-xs text-muted">
                  {quiz.questions.length} questions · {scoreLabel(scores[quiz.id])}
                </p>
                <button
                  type="button"
                  className="mt-3 rounded-full border border-line px-3 py-1 text-sm"
                  onClick={() => remove(quiz.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
