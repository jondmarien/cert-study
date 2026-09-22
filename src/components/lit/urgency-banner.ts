import { LitElement, html } from "lit";

import { BANNER_KEY } from "@/lib/keys";
import { daysUntil } from "@/lib/study-config";

export class StudyUrgencyBanner extends LitElement {
  static properties = {
    ends: { type: String },
    label: { type: String },
    hidden: { state: true },
    days: { state: true },
  };

  declare ends: string;
  declare label: string;
  declare hidden: boolean;
  declare days: number | null;

  private timer = 0;

  constructor() {
    super();
    this.ends = "";
    this.label = "";
    this.hidden = false;
    this.days = null;
  }

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    this.replaceChildren();
    super.connectedCallback();
    this.sync();
    this.timer = window.setInterval(() => this.sync(), 60 * 60 * 1000);
    window.addEventListener("study-banner", this.onBanner);
    window.addEventListener("storage", this.onBanner);
  }

  disconnectedCallback() {
    window.clearInterval(this.timer);
    window.removeEventListener("study-banner", this.onBanner);
    window.removeEventListener("storage", this.onBanner);
    super.disconnectedCallback();
  }

  private onBanner = () => {
    this.sync();
  };

  private sync() {
    this.hidden = localStorage.getItem(BANNER_KEY) === "dismissed";
    this.days = this.ends ? daysUntil(this.ends) : null;
    if (this.hidden) document.documentElement.dataset.banner = "off";
    else delete document.documentElement.dataset.banner;
  }

  private dismiss() {
    localStorage.setItem(BANNER_KEY, "dismissed");
    window.dispatchEvent(new Event("study-banner"));
  }

  private timingLabel(): string {
    if (this.days === null) return "";
    if (this.days > 1) return ` (${this.days} days from today)`;
    if (this.days === 1) return " (1 day from today)";
    if (this.days === 0) return " (today)";
    return ` (${Math.abs(this.days)} days ago)`;
  }

  render() {
    if (this.hidden) return html``;
    return html`
      <aside
        class="rounded-2xl border border-warn bg-warn-soft px-4 py-3"
        aria-label="BSCP timing reminder"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <p class="max-w-3xl text-sm leading-6 text-ink">
            <span class="font-semibold">BSCP timing. </span>
            This desk assumes Burp Suite Professional access through ${this.label}${this.timingLabel()}.
            The exam is a lab, so use authorized PortSwigger labs while these concepts are fresh. Edit
            the date in <code class="text-xs">src/lib/study-config.ts</code> if your license ends on another
            day.
          </p>
          <button
            type="button"
            class="rounded-full border border-line bg-card px-3 py-1 text-sm"
            @click=${() => this.dismiss()}
          >
            Dismiss reminder
          </button>
        </div>
      </aside>
    `;
  }
}

if (!customElements.get("study-urgency-banner")) {
  customElements.define("study-urgency-banner", StudyUrgencyBanner);
}
