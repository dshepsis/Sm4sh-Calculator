module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "node": true
  },
  "extends": "eslint:recommended",
  "rules": {
    "no-console": "off", //@OVERRIDE
    "indent": [
      "error",
      2,
      {'SwitchCase': 1} //Switch statements require indentation
    ],
    "linebreak-style": [
      "error",
      "windows"
    ],
    "for-direction": "error",
    "semi": [
      "error",
      "always"
    ],
    "no-template-curly-in-string": "error",
    "array-callback-return": "error",
    "class-methods-use-this": "error",
    "consistent-return": "error",
    "default-case": "warn",
    "dot-notation": "error",
    "guard-for-in": "error",
    "eqeqeq": "warn",
    "no-else-return": "error",
    "no-extend-native": "error",
    "no-extra-bind": "error",
    "no-invalid-this": "error",
    "no-loop-func": "error",
    "no-multi-str": "error",
    "no-new-func": "error",
    "no-new-wrappers": "error",
    "no-return-assign": "error",
    "no-self-compare": "error",
    "no-throw-literal": "error",
    "no-unmodified-loop-condition": "warn",
    "no-unused-expressions": "error",
    "no-useless-call": "error",
    "no-useless-concat": "warn",
    "wrap-iife": "error",
    "no-shadow-restricted-names": "error",
    //Functions can be used before they are defined:
    "no-use-before-define": ["error", {"functions": false}],
    "array-bracket-spacing": "warn",
    "comma-spacing": "warn",
    "eol-last": "error",
    "func-call-spacing": "error",
    "key-spacing": "error",
    "linebreak-style": ["error", "windows"],
    "new-parens": "error",
    "no-bitwise": "error",
    "no-lonely-if": "error",
    "no-multiple-empty-lines": "warn",
    "no-negated-condition": "warn",
    "no-nested-ternary": "error",
    "no-unneeded-ternary": ["error", {"defaultAssignment": false}],
    "no-useless-constructor": "error",
    "no-var": "error",
    "prefer-const": "error",
    "symbol-description": "warn",
  }
};
