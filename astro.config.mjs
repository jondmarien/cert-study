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

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
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
