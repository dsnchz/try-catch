import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  //
  // ────────────────────────────────
  // 1️⃣ Ignored paths (like .eslintignore)
  // ────────────────────────────────
  //
  {
    ignores: ["**/build/**", "**/coverage/**", "**/dist/**", "**/node_modules/**"],
  },
  //
  // ────────────────────────────────
  // 2️⃣ Base recommended rules
  // ────────────────────────────────
  //
  js.configs.recommended,
  tseslint.configs.strict,
  //
  // ────────────────────────────────
  // 3️⃣ Import sorting
  // ────────────────────────────────
  //
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
  //
  // ────────────────────────────────
  // 3️⃣ TypeScript (General - Base rules)
  // ────────────────────────────────
  //
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.es2022,
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "TSEnumDeclaration",
          message:
            "Enums are not allowed in this project. Use union types or plain objects instead.",
        },
      ],
    },
  },
  //
  // ────────────────────────────────
  // 5️⃣ Test environment
  // ────────────────────────────────
  //
  {
    files: ["__tests__/**/*.ts", "__tests__/**/*.tsx"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.vitest,
      },
    },
  },
]);
