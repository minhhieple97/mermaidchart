import nextConfig from 'eslint-config-next';

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  ...nextConfig,
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'node_modules/**'],
  },
];

export default eslintConfig;
