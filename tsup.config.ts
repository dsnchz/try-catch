import { defineConfig } from "tsup";

export default defineConfig({
  name: "try-catch",
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  target: "esnext",
});
