// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

import tailwindcss from "@tailwindcss/vite";

import umami from "@yeskunall/astro-umami";

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    umami({
      id: "4997ea8f-edf7-485b-aa1d-3ce9af56ca28",
      endpointUrl: "https://stats.tatli.me",
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
