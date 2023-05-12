import { readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

import { ignoreFile } from "@/common";
import logger from "@/utils/logger";

export const step = (msg: string) => logger.success(`\n${msg}`);

export const toPascalCase = (str: string) => {
  return str.replace(/^\w/, (c) => c.toUpperCase());
};

export const getVueFiles = (directory: string) => {
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
