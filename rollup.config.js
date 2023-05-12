const nodeResolve = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const babel = require("@rollup/plugin-babel");
const typescript = require("@rollup/plugin-typescript");
const terser = require("@rollup/plugin-terser");

const { defineConfig } = require("rollup");

const baseConfig = {
  plugins: [
    nodeResolve({
      preferBuiltins: true,
    }),
    commonjs(),
    typescript(),
    babel({
      babelHelpers: "bundled",
      exclude: ["node_modules/**"],
      presets: ["@babel/preset-env"],
    }),
    terser(),
  ],
  external: ["prettier", "eslint"], // 确保模块作为外部依赖项
};

module.exports = defineConfig([
  {
    ...baseConfig,
    input: "src/cli.ts",
    output: {
      file: "lib/cli.js",
      format: "cjs",
      banner: "#!/usr/bin/env node", // 添加 Node.js 环境运行的标识
    },
  },
  {
    ...baseConfig,
    input: "src/plugin.ts",
    output: {
      file: "lib/plugin.js",
      format: "cjs",
      banner: "#!/usr/bin/env node", // 添加 Node.js 环境运行的标识
    },
  },
]);
