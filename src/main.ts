import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import { scanComponents, setGeneratorContent } from "@/library/element-ui";
import { Options } from "@/types";
import {
  getEntryPath,
  getOptions,
  getOutputPath,
  projectPath,
  setOptions,
} from "@/utils/common";
import { getImportedComponents, getVueFiles, step } from "@/utils/utils";

// 扫描项目文件
const scanProjectFiles = async () => {
  const options = getOptions();
  step("scanning files...");
  const importedComponents = getImportedComponents();
  const vueFiles = getVueFiles(getEntryPath());
  const vueComponents = new Set<string>();
  if (options.resolvers === "element-ui") {
    vueFiles.forEach((file) => {
      const componentsSet = scanComponents(file);
      for (const component of componentsSet) {
        vueComponents.add(component);
      }
    });
  }
  let hasComponentChanged = vueComponents.size !== importedComponents.size;
  if (!hasComponentChanged) {
    for (const component of vueComponents) {
      if (!importedComponents.has(component)) {
        hasComponentChanged = true;
        break;
      }
    }
  }
  if (!hasComponentChanged) {
    step("no update required");
    return;
  }
  await generateAutoImportFile(vueComponents);
};

// 生成文件
const generateAutoImportFile = async (vueComponents: Set<string>) => {
  const options = getOptions();
  step(`generating ${options.output}...`);
  const outputPath = getOutputPath();

  let fileContent = "";
  if (options.resolvers === "element-ui") {
    fileContent = setGeneratorContent(vueComponents);
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
