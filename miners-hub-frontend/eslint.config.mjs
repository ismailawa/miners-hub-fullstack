import nextConfig from 'eslint-config-next';

const eslintConfig = [
  // eslint-config-next v16 exports a flat config array directly
  ...nextConfig,
  {
    rules: {
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',
      'react/no-unescaped-entities': 'off',
      'react/display-name': 'off',
    },
  },
  {
    ignores: ['node_modules/', '.next/', 'dist/', 'build/'],
  },
];

export default eslintConfig;
