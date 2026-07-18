import js from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier"
import onlyWarn from "eslint-plugin-only-warn"
import turboPlugin from "eslint-plugin-turbo"
import tseslint from "typescript-eslint"

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "no-restricted-syntax": [
        "warn",
        {
          selector: "Literal[value=/flex-shrink-0/]",
          message:
            'Use "shrink-0" instead of "flex-shrink-0" (Tailwind shorthand).',
        },
        {
          selector: "Literal[value=/flex-grow-0/]",
          message:
            'Use "grow-0" instead of "flex-grow-0" (Tailwind shorthand).',
        },
        {
          selector: "Literal[value=/flex-grow /]",
          message:
            'Use "grow" instead of "flex-grow" (Tailwind shorthand).',
        },
        {
          selector: "Literal[value=/\\[var\\(--/]",
          message:
            'Use "utility-(--varname)" instead of "utility-[var(--varname)]" (Tailwind v4 CSS variable syntax).',
        },
      ],
    },
  },
  {
    ignores: ["dist/**", ".next/**", "**/.turbo/**", "**/coverage/**"],
  },
]
