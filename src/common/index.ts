import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { Options } from "@typings";
import ignore from "ignore";

export const optionsDefault: Required<Options> = {
  entry: "/",
  output: "auto-import.js",
  resolvers: "element-ui",
  ignorePath: ".generatorignore",
  logLevel: "info",
  check: true,
};

let options = optionsDefault;
const importedComponents = new Set<string>();

// 项目根路径
export const projectPath = process.cwd(); // 替换为你的项目路径

export const ignoreFile = ignore().add("node_modules");

export const setOptions = async (params?: Options) => {
  options = Object.assign({}, options, params);

  const projectIgnorePath = resolve(projectPath, options.ignorePath);

  if (existsSync(projectIgnorePath)) {
    const ignoreContext = readFileSync(projectIgnorePath)
      .toString()
      .replace(/\/$/gm, "");
    ignoreFile.add(ignoreContext);
  }
};

export const getOptions = () => options;

export const getImportedComponents = () => importedComponents;
