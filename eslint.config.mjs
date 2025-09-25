// eslint.config.mjs
import { FlatCompat } from "@eslint/eslintrc";
import jsxA11y from "eslint-plugin-jsx-a11y";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default [
  // 無視リスト（フラット構成ではここに書く）
  {
    ignores: ["**/node_modules/**", ".next/**", "dist/**", "build/**", "coverage/**"],
  },

  // Next.js + TS + a11y + Prettier互換（format系はPrettierに委譲）
  ...compat.config({
    extends: [
      "next",
      "next/core-web-vitals",
      "next/typescript",
      "plugin:jsx-a11y/recommended",
      "prettier", // ← これが eslint-config-prettier（競合ルールを無効化）
    ],
  }),

  // 追加ルールや上書き（最終ブロックでまとめて定義）
  {
    plugins: {
      "jsx-a11y": jsxA11y,
    },
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
    },
    rules: {
      // React 17+ / Next では不要
      "react/react-in-jsx-scope": "off",

      // a11y は軽めに警告運用
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/aria-props": "warn",
      "jsx-a11y/aria-proptypes": "warn",
      "jsx-a11y/aria-unsupported-elements": "warn",
      "jsx-a11y/role-has-required-aria-props": "warn",
      "jsx-a11y/role-supports-aria-props": "warn",

      // 必要ならここに独自ルールを追加
      // 例: import順を統一したいなら import/order を入れる等
    },
  },

  // 型情報を厳密に使いたいとき（tscのproject参照）
  // {
  //   files: ["**/*.{ts,tsx}"],
  //   languageOptions: {
  //     parserOptions: { project: "./tsconfig.json" },
  //   },
  // },
];
