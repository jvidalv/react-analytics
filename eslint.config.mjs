import tseslint from "typescript-eslint";

export default tseslint.config(
  // Ignore patterns
  {
    ignores: [
      ".next/",
      "packages/*/dist/",
      "packages/*/test/",
      "node_modules/",
      "*.config.js",
      "*.config.mjs",
    ],
  },
  // TypeScript files
  ...tseslint.configs.recommended,
  {
    rules: {
      // Disable rules that conflict with Prettier or are too strict
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/ban-ts-comment": "off",
      "no-console": "off",
      // Disable React hooks rules (not configured yet)
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/rules-of-hooks": "off",
    },
  },
);
