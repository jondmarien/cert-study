import { useState } from "react";

import { saveCustomQuiz } from "@/lib/browser-quizzes";
import {
  QUIZ_TRACKS,
  QUIZ_TRACK_LABELS,
  quizFileBody,
  quizSchema,
  slugifyTitle,
  type QuizTrack,
} from "@/lib/quiz-schema";

type DraftQuestion = {
  prompt: string;
  choices: string[];
  answer: number;
  explain: string;
};

type Draft = {
  title: string;
  slug: string;
  track: QuizTrack;
  summary: string;
  questions: DraftQuestion[];
};

const fieldClass = "mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm";

function blankQuestion(): DraftQuestion {
  return { prompt: "", choices: ["", ""], answer: 0, explain: "" };
}

function issueLines(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  return error.issues.map((issue) => {
    const path = issue.path.map(String).join(".") || "quiz";
    return `${path}: ${issue.message}`;
  });
}

export default function QuizEditor({ fileIds }: { fileIds: string[] }) {
  const [draft, setDraft] = useState<Draft>({
    title: "",
    slug: "",
    track: "mixed",
    summary: "",
    questions: [blankQuestion()],
  });
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  function updateQuestion(index: number, next: DraftQuestion) {
    setDraft((current) => ({
      ...current,
      questions: current.questions.map((question, questionIndex) =>
        questionIndex === index ? next : question,
      ),
    }));
  }

  function buildQuiz() {
    return quizSchema.safeParse({
      title: draft.title,
      track: draft.track,
      summary: draft.summary,
      questions: draft.questions.map((question) => ({
        ...question,
        choices: question.choices.map((choice) => choice.trim()).filter(Boolean),
      })),
    });
  }

  function save() {
    const parsed = buildQuiz();
    if (!parsed.success) {
      setErrors(issueLines(parsed.error));
      return;
    }
    const id = draft.slug || slugifyTitle(parsed.data.title);
    if (!/^[a-z0-9-]+$/.test(id)) {
      setErrors(["slug: use lowercase letters, numbers, and hyphens"]);
      return;
    }
    const message = saveCustomQuiz(
      { ...parsed.data, id, createdAt: new Date().toISOString() },
      fileIds,
    );
    if (message) {
      setErrors([message]);
      return;
    }
    window.location.assign(`/quizzes/local#${id}`);
  }

  function download() {
    const parsed = buildQuiz();
    if (!parsed.success) {
      setErrors(issueLines(parsed.error));
      return;
    }
    const id = draft.slug || slugifyTitle(parsed.data.title) || "quiz";
    const blob = new Blob([`${JSON.stringify(quizFileBody({ ...parsed.data, id }), null, 2)}\n`], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${id}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setErrors([]);
  }

  async function importFile(file: File) {
    try {
      const parsed = quizSchema.safeParse(JSON.parse(await file.text()));
      if (!parsed.success) {
        setErrors(issueLines(parsed.error));
        return;
      }
      const slug = file.name.replace(/\.json$/i, "").toLowerCase();
      setSlugTouched(true);
      setDraft({
        title: parsed.data.title,
        slug: /^[a-z0-9-]+$/.test(slug) ? slug : slugifyTitle(parsed.data.title),
        track: parsed.data.track,
        summary: parsed.data.summary,
        questions: parsed.data.questions.map((question) => ({
          prompt: question.prompt,
          choices: question.choices,
          answer: question.answer,
          explain: question.explain,
        })),
      });
      setErrors([]);
    } catch {
      setErrors(["That file is not JSON."]);
    }
  }

  return (
    <form
      className="mx-auto max-w-3xl space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <label className="block text-sm">
        Title
        <input
          className={fieldClass}
          value={draft.title}
          onChange={(event) => {
            const title = event.target.value;
            setDraft((current) => ({
              ...current,
              title,
              slug: slugTouched ? current.slug : slugifyTitle(title),
            }));
          }}
        />
      </label>
      <label className="block text-sm">
        Slug
        <input
          className={fieldClass}
          value={draft.slug}
          onChange={(event) => {
            setSlugTouched(true);
            setDraft((current) => ({ ...current, slug: event.target.value }));
          }}
        />
      </label>
      <label className="block text-sm">
        Track
        <select
          className={fieldClass}
          value={draft.track}
          onChange={(event) => {
            const track = event.target.value;
            if (QUIZ_TRACKS.includes(track as QuizTrack)) {
              setDraft((current) => ({ ...current, track: track as QuizTrack }));
            }
          }}
        >
          {QUIZ_TRACKS.map((track) => (
            <option key={track} value={track}>
              {QUIZ_TRACK_LABELS[track]}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        Summary
        <textarea
          className={fieldClass}
          rows={3}
          value={draft.summary}
          onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))}
        />
      </label>
      {draft.questions.map((question, index) => (
        <fieldset key={index} className="rounded-2xl border border-line bg-card p-4">
          <legend className="px-1 text-sm">Question {index + 1}</legend>
          <label className="mt-2 block text-sm">
            Prompt
            <textarea
              className={fieldClass}
              rows={3}
              value={question.prompt}
              onChange={(event) => updateQuestion(index, { ...question, prompt: event.target.value })}
            />
          </label>
          <div className="mt-3 space-y-2">
            {question.choices.map((choice, choiceIndex) => (
              <div key={choiceIndex} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`answer-${index}`}
                  aria-label={`Mark choice ${choiceIndex + 1} correct`}
                  checked={question.answer === choiceIndex}
                  onChange={() => updateQuestion(index, { ...question, answer: choiceIndex })}
                />
                <input
                  className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm"
                  aria-label={`Choice ${choiceIndex + 1}`}
                  value={choice}
                  onChange={(event) => {
                    const choices = question.choices.map((item, itemIndex) =>
                      itemIndex === choiceIndex ? event.target.value : item,
                    );
                    updateQuestion(index, { ...question, choices });
                  }}
                />
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-full border border-line px-3 py-1 text-sm"
              onClick={() =>
                updateQuestion(index, {
                  ...question,
                  choices: question.choices.length < 5 ? [...question.choices, ""] : question.choices,
                })
              }
            >
              Add choice
            </button>
            <button
              type="button"
              className="rounded-full border border-line px-3 py-1 text-sm"
              onClick={() => {
                if (question.choices.length <= 2) return;
                const choices = question.choices.slice(0, -1);
                updateQuestion(index, {
                  ...question,
                  choices,
                  answer: Math.min(question.answer, choices.length - 1),
                });
              }}
            >
              Remove choice
            </button>
          </div>
          <label className="mt-3 block text-sm">
            Explanation
            <textarea
              className={fieldClass}
              rows={3}
              value={question.explain}
              onChange={(event) => updateQuestion(index, { ...question, explain: event.target.value })}
            />
          </label>
          {draft.questions.length > 1 ? (
            <button
              type="button"
              className="mt-3 rounded-full border border-line px-3 py-1 text-sm"
              onClick={() =>
                setDraft((current) => ({
                  ...current,
                  questions: current.questions.filter((_, questionIndex) => questionIndex !== index),
                }))
              }
            >
              Remove question
            </button>
          ) : null}
        </fieldset>
      ))}
      {errors.length > 0 ? (
        <ul className="rounded-2xl border border-copper bg-soft-copper px-4 py-3 text-sm" role="alert">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-full border border-line px-4 py-2 text-sm"
          onClick={() =>
            setDraft((current) =>
              current.questions.length >= 20
                ? current
                : { ...current, questions: [...current.questions, blankQuestion()] },
            )
          }
        >
          Add question
        </button>
        <button type="submit" className="rounded-full bg-accent px-4 py-2 text-sm text-accent-ink">
          Save in this browser
        </button>
        <button type="button" className="rounded-full border border-line px-4 py-2 text-sm" onClick={download}>
          Download JSON
        </button>
        <label className="rounded-full border border-line px-4 py-2 text-sm">
          Import JSON
          <input
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void importFile(file);
            }}
          />
        </label>
      </div>
    </form>
  );
}
