import eslint from "@eslint/js";
import { globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default tseslint.config(
  globalIgnores(["dist/**", "node_modules/**", ".venv/**", "frontend/**"]),
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
        Buffer: "readonly",
        require: "readonly",
        URL: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
      },
    },
  },
  {
    files: ["tools/ws-debugger/**/*.js"],
    languageOptions: {
      globals: {
        WebSocket: "readonly",
        window: "readonly",
        document: "readonly",
        chrome: "readonly",
        setTimeout: "readonly",
      },
    },
  },
  {
    files: ["public/js/**/*.js"],
    languageOptions: {
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
);
