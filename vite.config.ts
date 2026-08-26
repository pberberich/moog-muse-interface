import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Relative base so the build works on GitHub Pages subpaths and when served
// from the JUCE WebView resource provider.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    outDir: "dist",
    assetsDir: "assets"
  },
  test: {
    environment: "jsdom"
  }
});
