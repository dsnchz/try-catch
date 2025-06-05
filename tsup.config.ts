import { defineConfig } from "tsup";

import { name } from "./package.json";

export default defineConfig({
  name,
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "esnext",
  dts: true,
  clean: true,
});
