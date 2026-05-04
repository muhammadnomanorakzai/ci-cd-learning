// eslint.config.js
const js = require("@eslint/js");

module.exports = [
  js.configs.recommended,
  {
    rules: {
      "no-unused-vars": "error",   // unused variables nahi
      "no-console": "off",         // console.log allow hai
      "prefer-const": "error",     // const prefer karo
      "no-var": "error",           // var use mat karo
    },
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        __dirname: "readonly",
      }
    }
  }
];