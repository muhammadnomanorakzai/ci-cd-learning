const js = require("@eslint/js");

module.exports = [
  js.configs.recommended,
  {
    // Normal JS files ke liye
    rules: {
      "no-unused-vars": "error",
      "no-console": "off",        // console.log allow
      "prefer-const": "error",
      "no-var": "error",
    },
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        __dirname: "readonly",
        console: "readonly",      // ← console add karo
      }
    }
  },
  {
    // Sirf test files ke liye — Jest globals
    files: ["**/*.test.js"],      // ← sirf .test.js files pe apply ho
    languageOptions: {
      globals: {
        test: "readonly",         // ← Jest globals
        expect: "readonly",
        describe: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        it: "readonly",
      }
    }
  }
];



// rule define for CI

// // eslint.config.js
// const js = require("@eslint/js");

// module.exports = [
//   js.configs.recommended,
//   {
//     rules: {
//       "no-unused-vars": "error",   // unused variables nahi
//       "no-console": "off",         // console.log allow hai
//       "prefer-const": "error",     // const prefer karo
//       "no-var": "error",           // var use mat karo
//     },
//     languageOptions: {
//       ecmaVersion: 2022,
//       globals: {
//         require: "readonly",
//         module: "readonly",
//         exports: "readonly",
//         __dirname: "readonly",
//       }
//     }
//   }
// ];