import {
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";

import { Options } from "@typings";
import { ESLint } from "eslint";

import {
  getImportedComponents,
  getOptions,
  ignoreFile,
  projectPath,
  setOptions,
} from "@/common";
import { scanComponents, setGeneratorContent } from "@/library/element-ui";
import logger from "@/utils/logger";
import { step } from "@/utils/utils";

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
const scanProjectFiles = async () => {
  const options = getOptions();
  step("扫描项目文件...");
  const importedComponents = getImportedComponents();
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

  if (!hasNewItems) {
    logger.success("没有需要更新的组件");
    return;
  }
  await generateAutoImportFile(importedComponents);
};

// 生成文件
const generateAutoImportFile = async (importedComponents: Set<string>) => {
  const options = getOptions();
  step(`正在生成${options.output}`);
  const autoImportPath = resolve(projectPath, options.output);

  let fileContent = "";
  if (options.resolvers === "element-ui") {
    fileContent = setGeneratorContent(importedComponents);
  }
  if (!ignoreFile.ignores(options.output)) {
    try {
      step(`check ${options.output}...`);
      const eslint = new ESLint({
        fix: true,
      });
      const [result] = await eslint.lintText(fileContent);
      if (result.output) {
        fileContent = result.output;
      }
    } catch (error) {
      logger.error((error as Error).stack ?? error);
    }
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
};

const main = async (params?: Options) => {
  await setOptions(params);
  await scanProjectFiles();
};

export { scanProjectFiles, setOptions };

export default main;
