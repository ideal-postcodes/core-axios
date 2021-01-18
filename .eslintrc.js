module.exports = {
  root: true,
  extends: ["@cablanchard", "plugin:compat/recommended"],
  settings: {
    polyfills: ["Promise"],
  },
  env: {
    browser: true,
  },
};
