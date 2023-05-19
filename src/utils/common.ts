import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import ignore from "ignore";

import { Options, RequiredOptions } from "@/types";

/** 项目根路径 */
export const projectPath = process.cwd();

/** 忽略文件 */
export const ignoreFile = ignore().add("node_modules").add("/.*");

export const optionsDefault: RequiredOptions = {
  entry: ".",
  output: "auto-import.js",
  resolvers: "element-ui",
  ignorePath: ".generatorignore",
  logLevel: "info",
};

const options = optionsDefault;

/** 设置配置选项 */
export const setOptions = async (params?: Options) => {
  Object.assign(options, params);

  const projectIgnorePath = resolve(projectPath, options.ignorePath);

  if (existsSync(projectIgnorePath)) {
    const ignoreContext = readFileSync(projectIgnorePath)
      .toString()
      .replace(/\/$/gm, "");
    ignoreFile.add(ignoreContext);
  }
};

/** 获取配置选项 */
export const getOptions = () => options;

/** 扫描入口路径 */
export const getEntryPath = () => {
  return resolve(process.cwd(), options.entry);
};

/** 输出文件路径 */
export const getOutputPath = () => {
  return resolve(projectPath, options.output);
};
