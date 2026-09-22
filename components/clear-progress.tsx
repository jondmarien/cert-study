"use client";

import { clearProgress } from "@/components/progress-store";
import { restoreUrgencyBanner } from "@/components/urgency-banner";

export function ProgressTools() {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <button
        type="button"
        className="rounded-full border border-line px-3 py-1.5 text-sm"
        onClick={() => {
          if (window.confirm("Clear study progress stored in this browser?")) clearProgress();
        }}
      >
        Clear progress in this browser
      </button>
      <button
        type="button"
        className="rounded-full border border-line px-3 py-1.5 text-sm"
        onClick={() => restoreUrgencyBanner()}
      >
        Show BSCP reminder
      </button>
    </div>
  );
}
