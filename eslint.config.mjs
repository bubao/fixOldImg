import globals from "globals";
import pluginJs from "@eslint/js";

export default [
	{ files: ["./app.js", "**/*.js"], languageOptions: { sourceType: "commonjs" } },
	{ languageOptions: { globals: globals.node } },
	pluginJs.configs.recommended,
	{
		rules: {
			semi: [
				"error",
				"always"
			],
			quotes: [
				"error",
				"double"
			],
			"comma-dangle": [
				"error",
				{
					arrays: "never",
					objects: "never",
					imports: "never",
					exports: "never",
					functions: "never"
				}
			],
			"newline-per-chained-call": [
				"error",
				{
					ignoreChainWithDepth: 1
				}
			],
			"array-bracket-spacing": ["error", "never"],
			// "node/no-missing-import": "off",
			"no-multiple-empty-lines": "error",
			"no-var": "error",
			// "no-template-curly-in-string": "off",
			// "node/no-deprecated-api": "off",
			// camelcase: "off",
			// "no-bitwise": "off",
			// "no-case-declarations": "off",
			"no-new": "off",
			// "new-cap": "off",
			// "no-unmodified-loop-condition": "off",
			// "no-loop-func": "off",
			// "prefer-promise-reject-errors": "off",
			// "node/no-unsupported-features/es-syntax": "off",
			// "standard/no-callback-literal": "off",
			"no-tabs": "off",
			indent: [
				"error",
				"tab"
			],
			"space-before-function-paren": [
				"error",
				{
					anonymous: "never",
					named: "never",
					asyncArrow: "always"
				}
			],
			"arrow-parens": [
				"error",
				"as-needed"
			]
		}
	}
];
