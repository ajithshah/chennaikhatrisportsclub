module.exports = {
    extends: ['next/core-web-vitals'],
    parser: '@babel/eslint-parser',
    parserOptions: {
      requireConfigFile: false,
      babelOptions: {
        presets: ['next/babel'],
      },
    },
    rules: {
      'react/no-unescaped-entities': 'off',
      '@next/next/no-page-custom-font': 'off',
      '@next/next/no-sync-scripts': 'off'
    },
    env: {
      browser: true,
      node: true,
      es6: true
    }
  }