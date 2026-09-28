import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Cloudflare build output (scripts/cf.sh): ~80 MB of bundled JS that
    // runs ESLint out of memory.
    ".open-next/**",
    ".wrangler/**",
  ]),
]);

export default eslintConfig;
