export const calloutSections = {
  Lab: { id: "in-the-lab", title: "In the lab / in Burp" },
  Defend: { id: "defensive-controls", title: "Defensive controls" },
  Pitfall: { id: "common-pitfalls", title: "Common pitfalls" },
  Exam: { id: "exam-lens", title: "Exam lens" },
} as const;

export type CalloutName = keyof typeof calloutSections;
