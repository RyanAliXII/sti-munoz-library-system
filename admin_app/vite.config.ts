import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import compression from "vite-plugin-compression2";
export default defineConfig({
  server: {
    port: 5201,
  },
  resolve: {
    alias: {
      // "@":path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@layouts": path.resolve(__dirname, "./src/layouts"),
      "@definitions": path.resolve(__dirname, "./src/definitions"),
      "@internal": path.resolve(__dirname, "./src/internal"),
      "@contexts": path.resolve(__dirname, "./src/contexts"),
    },
  },

  plugins: [react(), compression({ algorithm: "brotliCompress" })],
});
