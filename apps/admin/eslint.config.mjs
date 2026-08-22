import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Flat config imported directly, the same way `apps/web` does it. The FlatCompat
// shim this replaced could not load eslint-config-next 16 at all — it threw
// "Converting circular structure to JSON" before linting a single file, so the admin
// app silently had no lint coverage.
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
