import { fileURLToPath } from "node:url";

import alpinejs from "@astrojs/alpinejs";
import mdx from "@astrojs/mdx";
import preact from "@astrojs/preact";
import react from "@astrojs/react";
import solid from "@astrojs/solid-js";
import svelte from "@astrojs/svelte";
import vue from "@astrojs/vue";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// Astro 7.3 still emits this directive on MDX propagation modules. Head metadata
// is chosen from the ?astroPropagatedAssets id, and Rolldown warns that it may
// drop the directive. Remove it so production builds stay quiet.
function stripUnusedHeadInjectDirective() {
  return {
    name: "strip-unused-astro-head-inject",
    enforce: "post",
    transform(code, id) {
      if (!id.includes("astroPropagatedAssets") || !code.includes("use astro:head-inject")) {
        return;
      }
      return code.replaceAll(/["']use astro:head-inject["'];?/g, "");
    },
  };
}

export default defineConfig({
  vite: {
    plugins: [tailwindcss(), stripUnusedHeadInjectDirective()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  },
  integrations: [
    mdx(),
    alpinejs({ entrypoint: "/src/alpine.ts" }),
    vue(),
    svelte(),
    preact({ include: ["**/preact/*"] }),
    react({ include: ["**/react/*"] }),
    solid({ include: ["**/solid/*"] }),
  ],
});
