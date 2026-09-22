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
function readRequestBody(request, limit = 260_000) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error("body too large"));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    request.on("error", reject);
  });
}

// Writes lesson MDX only while `astro dev` is running. A static build has no
// server to receive the save, and the deployed filesystem is not the repo.
function devLessonWriter() {
  return {
    name: "dev-lesson-writer",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const url = request.url?.split("?")[0];
        if (url !== "/api/dev/lesson") return next();
        if (request.method !== "POST") {
          response.statusCode = 405;
          response.end("Method not allowed");
          return;
        }
        try {
          const raw = await readRequestBody(request);
          const payload = JSON.parse(raw);
          const curriculum = await server.ssrLoadModule(
            fileURLToPath(new URL("./src/lib/curriculum.ts", import.meta.url)),
          );
          const errors = curriculum.saveLessonSource(payload.track, payload.slug, payload.source);
          response.setHeader("content-type", "application/json");
          response.statusCode = errors.length ? 400 : 200;
          response.end(JSON.stringify({ errors }));
        } catch (error) {
          console.error(error);
          response.statusCode = 400;
          response.setHeader("content-type", "application/json");
          response.end(JSON.stringify({ errors: ["The editor could not save that note."] }));
        }
      });
    },
  };
}

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
    plugins: [tailwindcss(), stripUnusedHeadInjectDirective(), devLessonWriter()],
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
