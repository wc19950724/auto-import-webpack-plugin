import logger from "@/utils/logger";

export const step = (msg: string) => logger.success(`\n${msg}`);

export const toPascalCase = (str: string) => {
  return str.replace(/^\w/, (c) => c.toUpperCase());
};
