import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import markdown from "@eslint/markdown";
import { defineConfig } from "eslint/config";

/** @type { import("eslint").Linter.Config[] } */
export default defineConfig([
  {
    files: ["**/*.md"],
    plugins: { markdown },
    language: "markdown/commonmark",
    extends: ["markdown/recommended"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    plugins: { js, import: importPlugin },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.node },
    rules: {
      "no-console": "error",
      "import/order": [
        "error",
        {
          named: true,
          alphabetize: {
            order: "asc",
          },
          groups: ["type", "builtin", "parent", "sibling", "index"],
          sortTypesGroup: true,
        },
      ],
    },
  },
  tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/array-type": "error",
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "never" },
      ],
      "@typescript-eslint/explicit-module-boundary-types": "error",
    },
  },
  {
    files: ["src/examples/*"],
    rules: {
      "no-console": "off",
    },
  },
]);
