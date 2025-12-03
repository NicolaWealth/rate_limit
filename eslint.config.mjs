import tseslint from 'typescript-eslint';

export default tseslint.config({
    files: ['**/*.ts'],
    ignores: ["**/*test.tsx", "**/*test_*.tsx", "**/*test.ts", "**/*test_*.ts", "**/*.js"],
    extends: [
        tseslint.configs.recommended,
    ],
    rules: {
        "@typescript-eslint/no-unused-vars": ["error", {
            "ignoreRestSiblings": true,
            "argsIgnorePattern": "^_",
            "varsIgnorePattern": "^_"
        }],
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "curly": "error"
    },
});
