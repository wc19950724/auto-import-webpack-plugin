import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";

import { program } from "commander";
import ignore from "ignore";

import { scanComponents, setGeneratorContent } from "./common/element-ui";
import { optionsDefault, ProgramOptions } from "./types";
import logger from "./utils/logger";
import { run, step } from "./utils/utils";

const pkgPath = resolve(__dirname, "..", "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
program.name(pkg.name).version(pkg.version).description(pkg.description);

program
  .option("-i, --input <entry>", "entry [file | folder] path")
  .option("-o, --output <output>", "output file")
  .option("-r, --resolvers <resolvers>", "element-ui")
  .option("-n, --ignore-path <ignore path>", "ignore scan files config")
  .parse(process.argv);

const options = program.opts<ProgramOptions>();

const { input, output, ignorePath, resolvers } = Object.assign(
  {},
  options,
  optionsDefault
);

// 项目根路径
const projectPath = process.cwd(); // 替换为你的项目路径

const projectIgnorePath = resolve(projectPath, ignorePath);
const ig = ignore();

if (existsSync(projectIgnorePath)) {
  const ignoreContext = readFileSync(projectIgnorePath)
    .toString()
    .replace(/\/$/gm, "");
  ig.add(ignoreContext);
}
const ignoreFile = ig.add("node_modules");

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
  step("扫描项目文件...");
  try {
    const vueFiles = getVueFiles(
      resolve(projectPath, (input || "").replace(/^\//, ""))
    );
    let importedComponents = new Set<string>();

    vueFiles.forEach((file) => {
      if (resolvers === "element-ui") {
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
  step(`正在生成${output}`);
  const autoImportPath = resolve(projectPath, output);

  let fileContent = "";
  if (resolvers === "element-ui") {
    fileContent = setGeneratorContent(importedComponents);
  }
  // 清空或删除现有的 生成文件
  if (existsSync(autoImportPath)) {
    unlinkSync(autoImportPath);
  }

  writeFileSync(autoImportPath, fileContent);
  step(`${output} 文件已生成`);

  if (ignoreFile.ignores(output)) return;
  step("正在格式化文件");
  await run("npx", ["prettier", autoImportPath, "--write"], {
    stdio: "inherit",
  });
  await run("npx", ["eslint", autoImportPath, "--fix"]);
};

export default scanProjectFiles;
