import type { Alpine } from "alpinejs";

import { clearProgress } from "./lib/browser-progress";
import { BANNER_KEY } from "./lib/keys";

export default function deskAlpine(Alpine: Alpine) {
  Alpine.store("desk", {
    menuOpen: false,
    clearProgress() {
      if (window.confirm("Clear study progress stored in this browser?")) clearProgress();
    },
    showBanner() {
      localStorage.removeItem(BANNER_KEY);
      delete document.documentElement.dataset.banner;
      window.dispatchEvent(new Event("study-banner"));
    },
  });
}
