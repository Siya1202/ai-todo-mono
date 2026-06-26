const webEslintConfig = require.resolve('./apps/web/node_modules/eslint-config-next/dist/index.js');
const tsParser = require.resolve('./apps/web/node_modules/@typescript-eslint/parser/dist/index.js');

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true,
    jest: true,
  },
  ignorePatterns: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/coverage/**'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  overrides: [
    {
      files: ['apps/web/**/*.{js,jsx,ts,tsx}'],
      extends: [webEslintConfig],
    },
    {
      files: ['apps/api/**/*.{ts,tsx}'],
      parser: tsParser,
      rules: {
        'no-unused-vars': 'off',
      },
    },
    {
      files: ['**/*.{js,cjs,mjs}'],
      rules: {
        'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      },
    },
  ],
};
