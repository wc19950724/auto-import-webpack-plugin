import fs from "node:fs";
import path from "node:path";

import { scanComponents, setGeneratorContent } from "@/library/element-ui";
import { Options } from "@/types";
import {
  getEntryPath,
  getImportedComponents,
  getOptions,
  getOutputPath,
  getVueFiles,
  projectPath,
  setOptions,
  step,
} from "@/utils";

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
  const prettier = require("prettier");

  fileContent = prettier.format(fileContent, {
    parser: "babel",
  });

  // 清空或删除现有的 生成文件
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  } else {
    // 确保目标目录存在
    const targetDir = path.dirname(outputPath);
    if (targetDir !== projectPath) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
  }

  fs.writeFileSync(outputPath, fileContent);
  step(`${options.output} genarated!`);
};

const main = async (params?: Options) => {
  await setOptions(params);
  await scanProjectFiles();
};

export { scanProjectFiles, setOptions };

export default main;
