import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import monacoEditorPlugin from "vite-plugin-monaco-editor";

export default defineConfig(async () => ({
  base: "./",
  plugins: [
    tsconfigPaths(),
    monacoEditorPlugin.default({}) // Even tho this gives error, this is right! Do not change it.
  ],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
}));
