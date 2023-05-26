import fs from "node:fs";
import path from "node:path";

import ignore from "ignore";

import { ArgsOptions, Options } from "@/types";
import { logger } from "@/utils";

/** 项目根路径 */
export const projectPath = process.cwd();

export const argsOptionsDefault: Required<ArgsOptions> = {
  config: "atconfig.js",
};

export const optionsDefault: Required<Options> = {
  entry: ".",
  output: "auto-import.js",
  library: "element-ui",
  ignore: ".autoignore",
  logLevel: true,
};

const options = optionsDefault;

/** 设置配置选项 */
export const setOptions = async (params?: Options) => {
  Object.assign(options, params);

  if (!Array.isArray(options.ignore)) {
    let projectIgnorePath = "";
    if (typeof options.ignore === "string") {
      projectIgnorePath = path.resolve(projectPath, options.ignore);
    } else if (options.ignore?.path) {
      projectIgnorePath = path.resolve(projectPath, options.ignore.path);
    }

    if (fs.existsSync(projectIgnorePath)) {
      const ignoreContext = fs
        .readFileSync(projectIgnorePath)
        .toString()
        .replace(/\/$/gm, "");
      ignoreFile.add(ignoreContext);
    }
  }
};

/** 获取配置选项 */
export const getOptions = () => options;

/** 忽略文件 */
export const ignoreFile = ignore().add("node_modules").add("/.*");

/** 忽略组件 */
export const ignoreComponent = (component: string) => {
  if (typeof options.ignore === "string") return false;
  let components;
  if (Array.isArray(options.ignore)) {
    components = options.ignore;
  } else if (options.ignore.components) {
    components = options.ignore.components;
  }
  if (components) {
    for (const componentPattern of components) {
      if (componentPattern instanceof RegExp) {
        return componentPattern.test(component);
      } else if (typeof componentPattern === "string") {
        return toPascalCase(componentPattern) === component;
      }
    }
  }
  return false;
};

/** 扫描入口路径 */
export const getEntryPath = () => {
  return path.resolve(process.cwd(), options.entry);
};

/** 输出文件路径 */
export const getOutputPath = () => {
  return path.resolve(projectPath, options.output);
};

/** 步骤日志 */
export const step = (msg: string) => logger.success(`\n[AUTO] ${msg}`);

/** 首字母转大写 */
export const toPascalCase = (str: string) => {
  return str.replace(/(?:^|-)(\w)/g, (_, c) => c.toUpperCase());
};

/** 获取导入组件Set */
export const getImportedComponents = () => {
  const outputPath = getOutputPath();
  const importedComponents = new Set<string>();
  if (fs.existsSync(outputPath)) {
    const outputContent = fs.readFileSync(outputPath, "utf8");

    // 使用正则表达式匹配 import 语句并提取需要的内容
    const importPattern = /import\s*{([^}]*)}\s*from\s*['"]([^'"]*)['"]/g;
    const matches = outputContent.matchAll(importPattern);

    // 遍历匹配结果
    for (const match of matches) {
      const componentNames = match[1]
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean);

      // 判断每个组件是否存在，并添加到 importedComponents 集合中
      componentNames.forEach((componentName) => {
        importedComponents.add(componentName);
      });
    }
  }
  return importedComponents;
};

/** 获取vue文件 */
export const getVueFiles = (directory: string) => {
  const files = fs.readdirSync(directory, { withFileTypes: true });

  const vueFiles: string[] = [];

  files.forEach((file) => {
    if (ignoreFile.ignores(file.name)) return;

    const filePath = path.resolve(directory, file.name);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      vueFiles.push(...getVueFiles(filePath));
    } else if (stat.isFile() && file.name.endsWith(".vue")) {
      logger.gray(filePath);
      vueFiles.push(filePath);
    }
  });

  return vueFiles;
};

/** 自定义序列化函数，处理正则表达式 */
export const replacer = (key: string, value: unknown) => {
  if (value instanceof RegExp) {
    return String(value);
  }
  return value;
};

export const formatStr = (str: unknown) => {
  let result = str;
  if (Array.isArray(str)) {
    result = str.map((item) => formatStr(item)) as unknown[];
  } else if (typeof str === "string") {
    if (str.startsWith("/") && str.lastIndexOf("/") > 0) {
      const flags = str.slice(str.lastIndexOf("/") + 1);
      const pattern = str.slice(1, str.lastIndexOf("/"));
      result = new RegExp(pattern, flags);
    }
  }
  return result;
};
