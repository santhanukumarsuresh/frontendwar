import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tailwindCanonical from 'eslint-plugin-tailwind-canonical-classes'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'src/routeTree.gen.ts', '.claude/worktrees'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    // TanStack Router file-based routes export a `Route` object (not a
    // component) while defining the route component locally. That is the
    // framework's required pattern and HMR is handled by the router plugin,
    // so the fast-refresh export rule does not apply here.
    files: ['src/routes/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // shadcn/ui primitives export a component plus its `cva` variants (e.g.
    // `Button` + `buttonVariants`) from one file — the library's standard
    // shape, reproduced by every `shadcn add`. These are leaf components, so
    // the fast-refresh export rule adds no value here.
    files: ['src/components/ui/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // Enforce Tailwind "canonical" class names project-wide (e.g. w-4 h-4 ->
    // size-4, border-1 -> border, flex-grow -> grow). This is the lint/CI
    // equivalent of the Tailwind IntelliSense "suggestCanonicalClasses" hint.
    // Auto-fixable: `pnpm lint --fix`.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/routeTree.gen.ts'],
    plugins: {
      'tailwind-canonical-classes': tailwindCanonical,
    },
    rules: {
      'tailwind-canonical-classes/tailwind-canonical-classes': [
        'warn',
        {
          // Tailwind v4 entry stylesheet — the rule reads it to resolve the
          // canonical form of every utility.
          cssPath: './src/styles/globals.css',
          rootFontSize: 16,
          // Class-string helpers whose arguments should also be checked.
          calleeFunctions: ['cn', 'clsx', 'classNames', 'twMerge', 'cva'],
        },
      ],
    },
  },
)
