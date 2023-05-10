import { execa } from "execa";

import logger from "./logger";

export const step = (msg: string) => logger.success(`\n${msg}`);

export const run = (bin: string, args: string[], opts = {}) => {
  try {
    return execa(bin, args, { stdio: "inherit", ...opts });
  } catch (error) {
    return Promise.reject(error);
  }
};

export const toPascalCase = (str: string) => {
  return str.replace(/^\w/, (c) => c.toUpperCase());
};
