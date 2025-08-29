import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Use repo base only for production build (GitHub Pages project site)
  base: command === "build" ? "/css-shiritori-frontend/" : "/",
  plugins: [react(), tailwindcss()],
}));

