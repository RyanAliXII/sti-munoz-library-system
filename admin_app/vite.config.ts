import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
export default defineConfig({
  server: {
    port: 5201,
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-select": ["react-select"],
          "react-router-dom": ["react-router-dom"],
          "@azure/msal-browser": ["@azure/msal-browser"],
          "react-pdf": ["react-pdf"],
        },
      },
    },
  },
  resolve: {
    alias: {
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

  plugins: [react()],
});
