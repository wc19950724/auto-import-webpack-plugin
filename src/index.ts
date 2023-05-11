import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";

import ignore from "ignore";

import { scanComponents, setGeneratorContent } from "./common/element-ui";
import { optionsDefault, ProgramOptions } from "./types";
import logger from "./utils/logger";
import { run, step } from "./utils/utils";

const ignoreFile = ignore().add("node_modules");
const options = optionsDefault;

// 项目根路径
const projectPath = process.cwd(); // 替换为你的项目路径

// 获取项目中的所有Vue文件路径
const getVueFiles = (directory: string) => {
  const files = readdirSync(directory, { withFileTypes: true });

  const vueFiles: string[] = [];

  files.forEach((file) => {
    if (ignoreFile.ignores(file.name)) return;

    const filePath = resolve(directory, file.name);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      vueFiles.push(...getVueFiles(filePath));
    } else if (stat.isFile() && file.name.endsWith(".vue")) {
      logger.path(filePath);
      vueFiles.push(filePath);
    }
  });

  return vueFiles;
};

// 扫描项目文件
const scanProjectFiles = async (scanOptions?: ProgramOptions) => {
  Object.assign(options, scanOptions, optionsDefault);
  step("扫描项目文件...");
  try {
    const vueFiles = getVueFiles(
      resolve(projectPath, (options.input || "").replace(/^\//, ""))
    );
    let importedComponents = new Set<string>();

    vueFiles.forEach((file) => {
      if (options.resolvers === "element-ui") {
        importedComponents = scanComponents(file);
      }
    });

    await generateAutoImportFile(importedComponents);
  } catch (err) {
    logger.error((err as Error).stack ?? err);
  }
};

// 生成文件
const generateAutoImportFile = async (importedComponents: Set<string>) => {
  step(`正在生成${options.output}`);
  const autoImportPath = resolve(projectPath, options.output);

  let fileContent = "";
  if (options.resolvers === "element-ui") {
    fileContent = setGeneratorContent(importedComponents);
  }
  // 清空或删除现有的 生成文件
  if (existsSync(autoImportPath)) {
    unlinkSync(autoImportPath);
  }

  writeFileSync(autoImportPath, fileContent);
  step(`${options.output} 文件已生成`);

  if (ignoreFile.ignores(options.output)) return;
  step("正在格式化文件");
  await run("npx", ["prettier", autoImportPath, "--write"], {
    stdio: "inherit",
  });
  await run("npx", ["eslint", autoImportPath, "--fix"]);
};

const main = async (params?: ProgramOptions) => {
  Object.assign(options, params);

  const projectIgnorePath = resolve(projectPath, options.ignorePath);

  if (existsSync(projectIgnorePath)) {
    const ignoreContext = readFileSync(projectIgnorePath)
      .toString()
      .replace(/\/$/gm, "");
    ignoreFile.add(ignoreContext);
  }
  scanProjectFiles();
};

export default main;
