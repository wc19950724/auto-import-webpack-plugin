import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import { Options } from "@typings";
import { ESLint } from "eslint";
import { format } from "prettier";

import { getOptions, projectPath, setOptions } from "@/common";
import { scanComponents, setGeneratorContent } from "@/library/element-ui";
import logger from "@/utils/logger";
import {
  checkExportName,
  getEntryPath,
  getImportedComponents,
  getOutputPath,
  getVueFiles,
  step,
} from "@/utils/utils";

// 扫描项目文件
const scanProjectFiles = async () => {
  const options = getOptions();
  step("scanning files...");
  const importedComponents = getImportedComponents();
  const vueFiles = getVueFiles(getEntryPath());
  let hasNewItems = false; // 添加一个标志位，默认为 false
  if (options.resolvers === "element-ui") {
    vueFiles.forEach((file) => {
      const componentsSet = scanComponents(file);
      const componentsArray = Array.from(componentsSet).filter((component) =>
        checkExportName(component, options.resolvers)
      );
      const hasNewComponent = componentsArray.some(
        (item) => !importedComponents.has(item)
      );
      if (hasNewComponent) {
        if (!hasNewItems) {
          hasNewItems = true; // 如果有新增组件，将标志位设置为 true
        }
        for (const component of componentsSet) {
          importedComponents.add(component);
        }
      }
    });
  }

  if (!hasNewItems) {
    step("no update required");
    return;
  }
  await generateAutoImportFile(importedComponents);
};

// 生成文件
const generateAutoImportFile = async (importedComponents: Set<string>) => {
  const options = getOptions();
  step(`generating ${options.output}...`);
  const outputPath = getOutputPath();

  let fileContent = "";
  if (options.resolvers === "element-ui") {
    fileContent = setGeneratorContent(importedComponents);
  }
  try {
    step(`formatting ${options.output}...`);
    fileContent = format(fileContent, {
      parser: "babel",
    });
    if (options.check) {
      step(`checking ${options.output}...`);
      const lint = new ESLint({
        fix: true,
      });
      const [result] = await lint.lintText(fileContent);
      if (result.output) {
        fileContent = result.output;
      }
    }
  } catch (error) {
    logger.error((error as Error).stack ?? error);
  }

  // 清空或删除现有的 生成文件
  if (existsSync(outputPath)) {
    unlinkSync(outputPath);
  } else {
    // 确保目标目录存在
    const targetDir = dirname(outputPath);
    if (targetDir !== projectPath) {
      mkdirSync(targetDir, { recursive: true });
    }
  }

  writeFileSync(outputPath, fileContent);
  step(`${options.output} genarated!`);
};

const main = async (params?: Options) => {
  await setOptions(params);
  await scanProjectFiles();
};

export { scanProjectFiles, setOptions };

export default main;
