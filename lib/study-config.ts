/**
 * Planning date for the BSCP urgency note.
 * About 90 days from 22 September 2026, when this desk was set up.
 * Replace with the real Burp Suite Professional end date if it differs.
 */
export const BSCP_LICENSE_ENDS = "2026-12-21";

export function formatLicenseDate(iso: string = BSCP_LICENSE_ENDS): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

export function daysUntil(
  iso: string = BSCP_LICENSE_ENDS,
  now: Date = new Date(),
): number {
  const end = new Date(`${iso}T00:00:00Z`).getTime();
  const start = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((end - start) / 86_400_000);
}
