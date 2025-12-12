import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { defineConfig as defineViteConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

const viteConfig = defineViteConfig({
  plugins: [tailwindcss(), solidPlugin()],
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
  },
  resolve: {
    conditions: ["development", "browser"],
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
});

export default viteConfig;
