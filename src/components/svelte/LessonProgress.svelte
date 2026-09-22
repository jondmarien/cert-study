<script lang="ts">
  import { onMount } from "svelte";

  import { markOpened, readProgress, setLessonStatus, subscribeProgress } from "../../lib/browser-progress";
  import { statusFor, type VisibleStatus } from "../../lib/progress";
  import type { TrackId } from "../../lib/types";

  let { track, slug, title }: { track: TrackId; slug: string; title: string } = $props();

  let current = $state<VisibleStatus>("new");

  const options: { id: VisibleStatus; label: string }[] = [
    { id: "new", label: "Not started" },
    { id: "reading", label: "In progress" },
    { id: "done", label: "Done" },
  ];

  onMount(() => {
    const href = `/${track}/${slug}`;
    markOpened({ track, slug, title, href });
    const sync = () => {
      current = statusFor(readProgress(), track, slug);
    };
    sync();
    return subscribeProgress(sync);
  });

  function choose(status: VisibleStatus) {
    setLessonStatus(track, slug, status);
  }
</script>

<div class="mt-5" role="group" aria-label="Study progress">
  <div class="flex flex-wrap gap-2">
    {#each options as option (option.id)}
      <button
        type="button"
        aria-pressed={current === option.id}
        onclick={() => choose(option.id)}
        class={`rounded-full border px-3 py-1.5 text-sm ${
          current === option.id
            ? "border-accent bg-soft text-ink"
            : "border-line text-muted hover:text-ink"
        }`}
      >
        {option.label}
      </button>
    {/each}
  </div>
</div>
