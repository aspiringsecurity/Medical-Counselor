import react from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer";
import path from "path";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";
import svgrPlugin from "vite-plugin-svgr";
import viteTsconfigPaths from "vite-tsconfig-paths";
// https://vitejs.dev/config/

export default defineConfig({
  plugins: [
    react(),
    viteTsconfigPaths(),
    svgrPlugin(),
    checker({
      // e.g. use TypeScript check
      typescript: true,
    }),
  ],
  cacheDir: "./.vite-cache",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  publicDir: "./public",
  build: {
    outDir:
      process.env.RELYING_PARTY === "pocketrides"
        ? "./dist-pocketrides"
        : "./dist-pearbnb",
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "index.css")
            return `css/${process.env.RELYING_PARTY}.css`;
          if (assetInfo.name === "assets/index.js")
            return `${process.env.RELYING_PARTY}.js`;
          return assetInfo.name ?? "";
        },
        entryFileNames: `js/${process.env.RELYING_PARTY}.js`,
      },
    },
  },
  define: {
    "process.env.RP": JSON.stringify(process.env.RELYING_PARTY),
  },
  server: {
    port: 4012,
    hmr: true,
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss({
          config: "./tailwind.config.js",
        }),
        autoprefixer({}),
      ],
    },
  },
});
