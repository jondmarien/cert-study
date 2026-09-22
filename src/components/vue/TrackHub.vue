<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref } from "vue";

  import { readProgress, subscribeProgress } from "@/lib/browser-progress";
  import { statusFor, tallyProgress, type ProgressState, type VisibleStatus } from "@/lib/progress";
  import type { LessonStatus, TrackId } from "@/lib/types";

  export type HubLesson = {
    slug: string;
    href: string;
    title: string;
    summary: string;
    family: string;
    order: number;
    status: LessonStatus;
    minutes: number;
  };

  export type HubFamily = {
    name: string;
    blurb: string;
  };

  const props = defineProps<{
    track: TrackId;
    title: string;
    detail: string;
    families: HubFamily[];
    lessons: HubLesson[];
  }>();

  const progress = ref<ProgressState>({ statuses: {}, last: null });
  const query = ref("");
  const family = ref("All");
  const noteStatus = ref<"all" | LessonStatus>("all");
  const progressFilter = ref<"all" | VisibleStatus>("all");

  let stop = () => {};

  function sync() {
    progress.value = readProgress();
  }

  onMounted(() => {
    sync();
    stop = subscribeProgress(sync);
  });

  onUnmounted(() => stop());

  const slugs = computed(() => props.lessons.map((lesson) => lesson.slug));
  const tally = computed(() => tallyProgress(progress.value, props.track, slugs.value));
  const width = computed(() =>
    props.lessons.length === 0 ? 0 : (tally.value.done / props.lessons.length) * 100,
  );

  const visible = computed(() => {
    const needle = query.value.trim().toLowerCase();
    return props.lessons.filter((lesson) => {
      if (family.value !== "All" && lesson.family !== family.value) return false;
      if (noteStatus.value !== "all" && lesson.status !== noteStatus.value) return false;
      if (
        progressFilter.value !== "all" &&
        statusFor(progress.value, props.track, lesson.slug) !== progressFilter.value
      ) {
        return false;
      }
      if (!needle) return true;
      const haystack = `${lesson.title} ${lesson.summary} ${lesson.family}`.toLowerCase();
      return needle.split(/\s+/).every((word) => haystack.includes(word));
    });
  });

  const groups = computed(() =>
    props.families
      .map((item) => ({
        ...item,
        lessons: visible.value.filter((lesson) => lesson.family === item.name),
      }))
      .filter((item) => item.lessons.length > 0),
  );

  const familyOptions = computed(() => ["All", ...props.families.map((item) => item.name)]);

  const noteOptions = [
    ["all", "All notes"],
    ["ready", "Ready"],
    ["outline", "Outlines"],
  ] as const;

  const progressOptions = [
    ["all", "Any progress"],
    ["new", "Not started"],
    ["reading", "In progress"],
    ["done", "Done"],
  ] as const;

  function slugify(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function progressLabel(state: VisibleStatus): string {
    if (state === "done") return "Done";
    if (state === "reading") return "In progress";
    return "Not started";
  }
</script>

<template>
  <div>
    <header class="max-w-3xl">
      <p class="text-xs uppercase tracking-[0.16em] text-muted">Track</p>
      <h1 class="mt-2 font-display text-5xl leading-none">{{ title }}</h1>
      <p class="mt-4 text-lg leading-8 text-ink">{{ detail }}</p>
      <div class="mt-5">
        <div
          class="h-1.5 overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-valuemin="0"
          :aria-valuemax="lessons.length"
          :aria-valuenow="tally.done"
          aria-label="Modules marked done"
        >
          <div class="h-full bg-accent" :style="{ width: `${width}%` }" />
        </div>
        <p class="mt-2 text-sm text-muted">
          {{ tally.done }} done · {{ tally.reading }} in progress · {{ tally.fresh }} not started
        </p>
      </div>
    </header>

    <div class="mt-8 space-y-4 rounded-2xl border border-line bg-card p-4">
      <div>
        <label for="module-filter" class="text-sm font-medium">Filter modules</label>
        <input
          id="module-filter"
          v-model="query"
          placeholder="Title, summary, or family"
          class="mt-2 w-full rounded-xl border border-line bg-paper px-3 py-2 text-base"
        />
      </div>
      <div>
        <p id="family-label" class="text-sm font-medium">Family</p>
        <div class="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="family-label">
          <button
            v-for="option in familyOptions"
            :key="option"
            type="button"
            :aria-pressed="family === option"
            class="rounded-full border px-3 py-1 text-sm"
            :class="
              family === option
                ? 'border-accent bg-soft text-ink'
                : 'border-line text-muted hover:text-ink'
            "
            @click="family = option"
          >
            {{ option }}
          </button>
        </div>
      </div>
      <div>
        <p id="notes-label" class="text-sm font-medium">Notes</p>
        <div class="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="notes-label">
          <button
            v-for="option in noteOptions"
            :key="option[0]"
            type="button"
            :aria-pressed="noteStatus === option[0]"
            class="rounded-full border px-3 py-1 text-sm"
            :class="
              noteStatus === option[0]
                ? 'border-accent bg-soft text-ink'
                : 'border-line text-muted hover:text-ink'
            "
            @click="noteStatus = option[0]"
          >
            {{ option[1] }}
          </button>
        </div>
      </div>
      <div>
        <p id="progress-label" class="text-sm font-medium">Progress</p>
        <div class="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="progress-label">
          <button
            v-for="option in progressOptions"
            :key="option[0]"
            type="button"
            :aria-pressed="progressFilter === option[0]"
            class="rounded-full border px-3 py-1 text-sm"
            :class="
              progressFilter === option[0]
                ? 'border-accent bg-soft text-ink'
                : 'border-line text-muted hover:text-ink'
            "
            @click="progressFilter = option[0]"
          >
            {{ option[1] }}
          </button>
        </div>
      </div>
      <p class="text-sm text-muted">Showing {{ visible.length }} of {{ lessons.length }}</p>
    </div>

    <p v-if="groups.length === 0" class="mt-8 text-muted">Nothing matches those filters.</p>
    <div v-else class="mt-8 space-y-10">
      <section
        v-for="group in groups"
        :key="group.name"
        :aria-labelledby="`family-${slugify(group.name)}`"
      >
        <h2 :id="`family-${slugify(group.name)}`" class="font-display text-3xl">{{ group.name }}</h2>
        <p class="mt-1 max-w-2xl text-sm text-muted">{{ group.blurb }}</p>
        <ul class="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
          <li v-for="lesson in group.lessons" :key="lesson.slug">
            <a
              :href="lesson.href"
              :data-lesson="lesson.slug"
              class="flex flex-col gap-2 px-4 py-4 hover:bg-soft sm:flex-row sm:items-start sm:justify-between"
            >
              <span>
                <span class="flex flex-wrap items-center gap-2">
                  <span class="font-medium">{{ lesson.title }}</span>
                  <span class="flex flex-wrap gap-1 text-xs">
                    <span
                      class="rounded-full px-2 py-0.5"
                      :class="
                        lesson.status === 'outline'
                          ? 'bg-warn-soft text-warn'
                          : 'bg-soft text-accent'
                      "
                    >
                      {{ lesson.status === "outline" ? "Outline" : "Ready" }}
                    </span>
                    <span class="rounded-full bg-paper px-2 py-0.5 text-muted">
                      {{ progressLabel(statusFor(progress, track, lesson.slug)) }}
                    </span>
                  </span>
                </span>
                <span class="mt-1 block text-sm text-muted">{{ lesson.summary }}</span>
              </span>
              <span class="shrink-0 text-sm text-muted">{{ lesson.minutes }} min</span>
            </a>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
