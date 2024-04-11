import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import monacoEditorPlugin from "vite-plugin-monaco-editor";

export default defineConfig(async function () {
  return {
    base: "./",
    plugins: [
      tsconfigPaths(),
      monacoEditorPlugin.default({})
    ],
    clearScreen: false,
    server: {
      port: 1420,
      strictPort: true,
      watch: {
        ignored: ["**/src-tauri/**"],
      },
    },
  };
});
