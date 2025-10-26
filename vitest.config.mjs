import { defineConfig } from "vitest/config";

/**
 * @type {import('vitest/config').ViteUserConfig}
 */
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
    },
  },
});
