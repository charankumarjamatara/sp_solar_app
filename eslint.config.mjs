import expoConfig from 'eslint-config-expo/flat.js';
import prettierConfig from 'eslint-config-prettier';

export default [
  ...expoConfig,
  prettierConfig,
  {
    settings: {
      react: {
        version: '19.2.3',
      },
    },
    ignores: ['node_modules/**', '.expo/**', 'dist/**', 'web-build/**', '*.config.js'],
  },
  {
    rules: {
      'prettier/prettier': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },
  },
];
