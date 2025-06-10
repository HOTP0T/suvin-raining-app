import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/raining/",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true,
  },
  // Rest of config remains the same
});
