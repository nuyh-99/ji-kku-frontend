import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // ── 레이어 import 경계 강제 (app → features → lib, data는 순수 leaf) ──
  // 같은 feature 내부는 상대경로로 import 한다.
  {
    files: ["src/lib/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*", "@/features/**", "@/app/*", "@/app/**"],
              message: "lib은 공용 최하층입니다. features/app을 import할 수 없습니다.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*", "@/features/**", "@/app/*", "@/app/**"],
              message:
                "feature 간 교차 import 및 app 참조 금지. 같은 feature 내부는 상대경로로 import 하세요.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/data/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/features/*",
                "@/features/**",
                "@/app/*",
                "@/app/**",
                "@/lib/*",
                "@/lib/**",
              ],
              message: "data는 순수 데이터 leaf입니다. 다른 레이어를 import할 수 없습니다.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*", "@/features/**", "@/app/*", "@/app/**"],
              message:
                "components는 공용 트리입니다. features/app을 import할 수 없습니다 (home 재사용을 위해).",
            },
          ],
        },
      ],
    },
  },

  // Prettier와 충돌하는 포맷 룰 비활성화 (반드시 마지막).
  eslintConfigPrettier,

  // Override default ignores of eslint-config-next.
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
