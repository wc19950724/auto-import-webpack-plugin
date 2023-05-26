import fs from "node:fs";
import path from "node:path";

import { ArgsOptions, Options } from "@/types";
import {
  argsOptionsDefault,
  formatStr,
  logger,
  optionsDefault,
  projectPath,
  replacer,
  step,
} from "@/utils";

export const spec = {
  "--help": Boolean,
  "--version": Boolean,
  "--config": String,
  "-h": "--help",
  "-v": "--version",
  "-c": "--config",
};

export const writeConfig = async (configPath: string) => {
  const options: Options = {};

  const fullPath = path.join(projectPath, configPath);
  const fileExtension = path.extname(configPath).slice(1);
  if (!fs.existsSync(fullPath)) {
    let writeData = "";
    const defaultWriteData = JSON.stringify(optionsDefault, replacer, 2);
    if (fileExtension === "json") {
      writeData = defaultWriteData;
    } else if (fileExtension === "js") {
      writeData = `module.exports = ${defaultWriteData
        .replace(/"([^"]+)":/g, "$1:")
        .replace(/"([^"]+)"/g, (match, p1) => {
          if (p1.startsWith("/") && p1.lastIndexOf("/") > 0) {
            const flags = p1.slice(p1.lastIndexOf("/") + 1);
            const pattern = p1.slice(1, p1.lastIndexOf("/"));
            return `/${pattern}/${flags}`;
          } else {
            return match;
          }
        })}`;
    }
    if (!writeData) {
      throw new Error(`${configPath}: write config is failed`);
    }
    const { ESLint } = require("eslint");

    const lint = new ESLint({ fix: true, cache: true });

    const result = await lint.lintText(writeData);
    // 输出修复后的代码
    writeData = result?.[0]?.output || writeData;
    fs.writeFileSync(fullPath, writeData);
    step("generating default config");
    logger.gray(fullPath);
    Object.assign(options, optionsDefault);
  } else {
    if (fileExtension === "json") {
      // 读取 JSON 文件
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const jsonContents = JSON.parse(fileContents);
      for (const key in jsonContents) {
        jsonContents[key] = formatStr(jsonContents[key]);
      }
      Object.assign(options, jsonContents);
    } else if (fileExtension === "js") {
      // require JS 文件
      const requiredModule: Options = require(fullPath);
      Object.assign(options, requiredModule);
    }
  }
  return options;
};

export const formatArgs = async (args: ArgsOptions) => {
  const options: Options = {};
  for (const key in args) {
    if (key === "config") {
      const configPath = args[key] || argsOptionsDefault.config;
      Object.assign(options, await writeConfig(configPath));
    }
  }

  if (!Object.keys(options).length) {
    const configPath = argsOptionsDefault.config;
    Object.assign(options, await writeConfig(configPath));
  }

  return options;
};
