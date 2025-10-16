// eslint.config.mjs
import js from "@eslint/js";
import * as tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  // 0) ignore（元 .eslintignore 相当）
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "prisma/generated/**",
      "src/generated/prisma/**",
      "public/**",
      "**/*.d.ts",
    ],
  },

  // 1) JS/JSX用（必要なら）
  {
    files: ["**/*.{js,jsx}"],
    ...js.configs.recommended,
  },

  // 2) TS/TSX用：配列を map で files を付与してからトップレベル展開
  ...tseslint.configs.recommended.map((c) => ({
    ...c,
    files: ["**/*.{ts,tsx}"],
  })),

  // 3) 追加のReact/Hooksやプロジェクト固有ルール
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { react, "react-hooks": reactHooks },
    languageOptions: {
      // parser は recommended 側で設定済み。追加で JSX 有効化など
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "error",
      "react/jsx-uses-react": "off", // React 17+
      "react/react-in-jsx-scope": "off", // React 17+
      ...reactHooks.configs.recommended.rules,
    },
    settings: { react: { version: "detect" } },
  },
];
