module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true
  },
  // extends: ['prettier'],
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off"
  },
  parserOptions: {
    parser: "babel-eslint",
    sourceType: "module"
  }
}
