// eslint.config.mjs
import { FlatCompat } from "@eslint/eslintrc";
import jsxA11y from "eslint-plugin-jsx-a11y";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default [
  // 1) そもそも見ない場所（ビルド物・静的資産など）
  {
    ignores: [
      "**/node_modules/**",
      ".next/**",
      ".turbo/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "public/**",
      "**/*.d.ts",
      "prisma/migrations/**",
    ],
  },

  // 2) Next.js / TS / a11y / Prettier互換（レガシー拡張はcompatで読み込む）
  ...compat.config({
    extends: [
      "next",
      "next/core-web-vitals",
      "next/typescript",
      "plugin:jsx-a11y/recommended",
      "prettier", // ← eslint-config-prettier: フォーマット系はPrettierに委譲
    ],
  }),

  // 3) 対象ファイルを限定しつつ、追加ルールを一元管理
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: {
      "jsx-a11y": jsxA11y,
    },
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
    },
    rules: {
      // React 17+ / Next は不要
      "react/react-in-jsx-scope": "off",

      // a11y は軽めに警告運用
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/aria-props": "warn",
      "jsx-a11y/aria-proptypes": "warn",
      "jsx-a11y/aria-unsupported-elements": "warn",
      "jsx-a11y/role-has-required-aria-props": "warn",
      "jsx-a11y/role-supports-aria-props": "warn",

      // 日常運用で便利なやつ
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },

  // 4) テスト向け（必要なければ削ってOK）
  {
    files: ["**/*.{test,spec}.{ts,tsx,js,jsx}"],
    languageOptions: {
      globals: {
        jest: "readonly",
      },
    },
    rules: {
      "no-console": "off",
    },
  },
];
