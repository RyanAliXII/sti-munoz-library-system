import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5209,
  },
  resolve: {
    alias: {
      "@definitions": path.resolve(__dirname, "./src/definitions"),
    },
  },
  plugins: [react()],
});
