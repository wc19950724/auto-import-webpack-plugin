import fs from "node:fs";
import path from "node:path";

import c from "picocolors";

export const step = (filePath: string, type: string) => {
  filePath = filePath.replace(/\//, "\\");
  const file = path.resolve(path.dirname(__dirname), filePath);
  const { size } = fs.statSync(file);
  console.log(c.green(type), c.bold(filePath), c.green(prettyBytes(size)));
};

export const prettyBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const unit = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const exp = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, exp)).toFixed(2)} ${unit[exp]}`;
};
