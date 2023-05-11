import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";

import ignore from "ignore";

import { scanComponents, setGeneratorContent } from "./common/element-ui";
import { optionsDefault, ProgramOptions } from "./types";
import logger from "./utils/logger";
import { run, step } from "./utils/utils";

const ignoreFile = ignore().add("node_modules");
let options = optionsDefault;
const importedComponents = new Set<string>();

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
  options = Object.assign({}, optionsDefault, scanOptions, options);
  step("扫描项目文件...");
  const vueFiles = getVueFiles(
    resolve(projectPath, (options.input || "").replace(/^\//, ""))
  );
  let hasNewItems = false; // 添加一个标志位，默认为 false
  if (options.resolvers === "element-ui") {
    vueFiles.forEach((file) => {
      const componentsSet = scanComponents(file);
      const componentsArray = Array.from(componentsSet);
      const hasNewComponent = componentsArray.some(
        (item) => !importedComponents.has(item)
      );
      if (hasNewComponent) {
        hasNewItems = true; // 如果有新增组件，将标志位设置为 true
        for (const component of componentsSet) {
          importedComponents.add(component);
        }
      }
    });
  }

  if (!hasNewItems) return;
  await generateAutoImportFile(importedComponents);
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
  } else {
    // 确保目标目录存在
    const targetDir = dirname(autoImportPath);
    if (targetDir !== projectPath) {
      mkdirSync(targetDir, { recursive: true });
    }
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

const setOptions = async (params?: ProgramOptions) => {
  options = Object.assign({}, params, options);

  const projectIgnorePath = resolve(projectPath, options.ignorePath);

  if (existsSync(projectIgnorePath)) {
    const ignoreContext = readFileSync(projectIgnorePath)
      .toString()
      .replace(/\/$/gm, "");
    ignoreFile.add(ignoreContext);
  }
};

const main = async (params?: ProgramOptions) => {
  await setOptions(params);
  await scanProjectFiles();
};

export { scanProjectFiles, setOptions };

export default main;
