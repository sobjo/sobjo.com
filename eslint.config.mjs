import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    ignores: [
      '.next/',
      'node_modules/',
      'next-env.d.ts',
      'src/payload-types.ts',
      'src/migrations/',
      'src/app/(payload)/',
    ],
  },
]

export default eslintConfig
