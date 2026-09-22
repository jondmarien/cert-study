import { useEffect, useState } from "react";

import { saveQuizScore } from "@/lib/browser-quizzes";
import { QUIZ_TRACK_LABELS, quizFileBody, type PlayableQuiz } from "@/lib/quiz-schema";

export default function QuizPlayer({ quiz }: { quiz: PlayableQuiz }) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const question = quiz.questions[index];
  const total = quiz.questions.length;

  useEffect(() => {
    if (!finished) return;
    saveQuizScore(quiz.id, correctCount, total);
  }, [correctCount, finished, quiz.id, total]);

  function check() {
    if (picked === null || checked || !question) return;
    setChecked(true);
    if (picked === question.answer) setCorrectCount((count) => count + 1);
  }

  function next() {
    if (!checked) return;
    if (index + 1 >= total) {
      setFinished(true);
      return;
    }
    setIndex((current) => current + 1);
    setPicked(null);
    setChecked(false);
  }

  function retry() {
    setIndex(0);
    setPicked(null);
    setChecked(false);
    setCorrectCount(0);
    setFinished(false);
  }

  function download() {
    const blob = new Blob([`${JSON.stringify(quizFileBody(quiz), null, 2)}\n`], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${quiz.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <article className="mx-auto max-w-3xl">
      <p className="text-xs uppercase tracking-[0.16em] text-muted">{QUIZ_TRACK_LABELS[quiz.track]}</p>
      <h1 className="mt-2 font-display text-5xl leading-none">{quiz.title}</h1>
      <p className="mt-4 text-lg leading-8">{quiz.summary}</p>
      <p className="mt-3 text-sm text-muted">
        Original concept check. Not an official exam item.
        {quiz.lesson ? (
          <>
            {" "}
            Related note:{" "}
            <a className="underline decoration-line underline-offset-4" href={`/${quiz.lesson.track}/${quiz.lesson.slug}`}>
              {quiz.lesson.slug.replaceAll("-", " ")}
            </a>
            .
          </>
        ) : null}
      </p>
      {finished ? (
        <section className="mt-8 rounded-2xl border border-line bg-card p-5">
          <h2 className="font-display text-3xl">
            {correctCount} of {total}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            That score stays in this browser. The explanations above are the part worth rereading.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="rounded-full bg-accent px-4 py-2 text-sm text-accent-ink" onClick={retry}>
              Try again
            </button>
            <a href="/quizzes" className="rounded-full border border-line px-4 py-2 text-sm">
              All quizzes
            </a>
            <button type="button" className="rounded-full border border-line px-4 py-2 text-sm" onClick={download}>
              Download JSON
            </button>
          </div>
        </section>
      ) : question ? (
        <section className="mt-8 rounded-2xl border border-line bg-card p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">
            Question {index + 1} of {total}
          </p>
          <h2 className="mt-2 font-display text-3xl leading-tight">{question.prompt}</h2>
          <fieldset className="mt-4 space-y-2">
            <legend className="sr-only">Choices</legend>
            {question.choices.map((choice, choiceIndex) => {
              const selected = picked === choiceIndex;
              const isAnswer = checked && choiceIndex === question.answer;
              const missed = checked && selected && choiceIndex !== question.answer;
              return (
                <label
                  key={choice}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2 text-sm leading-6 ${
                    isAnswer
                      ? "border-good bg-soft"
                      : missed
                        ? "border-copper bg-soft-copper"
                        : selected
                          ? "border-accent bg-soft"
                          : "border-line"
                  }`}
                >
                  <input
                    type="radio"
                    name={`choice-${index}`}
                    className="mt-1"
                    checked={selected}
                    disabled={checked}
                    onChange={() => setPicked(choiceIndex)}
                  />
                  <span>{choice}</span>
                </label>
              );
            })}
          </fieldset>
          {checked ? (
            <p className="mt-4 text-sm leading-6" role="status">
              {picked === question.answer ? "That matches the note. " : "Not this one. "}
              {question.explain}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-full bg-accent px-4 py-2 text-sm text-accent-ink disabled:opacity-50"
              disabled={picked === null || checked}
              onClick={check}
            >
              Check
            </button>
            <button
              type="button"
              className="rounded-full border border-line px-4 py-2 text-sm disabled:opacity-50"
              disabled={!checked}
              onClick={next}
            >
              {index + 1 === total ? "See score" : "Next"}
            </button>
          </div>
        </section>
      ) : null}
    </article>
  );
}
