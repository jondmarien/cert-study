import { useEffect, useState } from "react";

import { readCustomQuiz } from "@/lib/browser-quizzes";
import type { StoredQuiz } from "@/lib/quiz-schema";

import QuizPlayer from "./QuizPlayer";

function quizIdFromHash(hash: string) {
  const raw = hash.replace(/^#/, "");
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return null;
  }
}

export default function LocalQuizPlayer() {
  const [quiz, setQuiz] = useState<StoredQuiz | null | undefined>(undefined);

  useEffect(() => {
    function load() {
      const id = quizIdFromHash(location.hash);
      setQuiz(id ? readCustomQuiz(id) : null);
    }
    load();
    window.addEventListener("hashchange", load);
    return () => window.removeEventListener("hashchange", load);
  }, []);

  if (quiz === undefined) {
    return <p className="text-sm text-muted">Loading the quiz saved in this browser.</p>;
  }

  if (!quiz) {
    return (
      <p className="text-sm leading-6">
        This browser does not have a quiz for that link.{" "}
        <a className="underline decoration-line underline-offset-4" href="/quizzes">
          Back to quizzes
        </a>
        .
      </p>
    );
  }

  return <QuizPlayer key={quiz.id} quiz={quiz} />;
}
