module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: "standard",
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: 6
  },
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module"
  },
  rules: {}
};
