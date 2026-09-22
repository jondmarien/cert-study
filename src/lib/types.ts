export const TRACK_IDS = ["bscp", "security-plus"] as const;

export type TrackId = (typeof TRACK_IDS)[number];

export type LessonStatus = "ready" | "outline";

export type RelatedLink = {
  track: TrackId;
  slug: string;
  label?: string;
};

export type LessonFrontmatter = {
  title: string;
  family: string;
  order: number;
  status: LessonStatus;
  minutes: number;
  summary: string;
  objectives: string[];
  academy?: string;
  related: RelatedLink[];
  tags: string[];
};

export type LessonMeta = LessonFrontmatter & {
  track: TrackId;
  slug: string;
  href: string;
};

export type Lesson = LessonMeta & {
  body: string;
};

export type Heading = {
  id: string;
  text: string;
};

export type SearchDocument = {
  track: TrackId;
  trackTitle: string;
  slug: string;
  href: string;
  title: string;
  summary: string;
  family: string;
  status: LessonStatus;
  minutes: number;
  tags: string[];
  text: string;
};

export type ResolvedRelated = {
  track: TrackId;
  slug: string;
  href: string;
  title: string;
  summary: string;
  family: string;
};

export type LessonNeighbor = {
  href: string;
  title: string;
  family: string;
};
