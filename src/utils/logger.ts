import c from "picocolors";

import { getOptions } from "@/utils";

export const error = (msg?: string) => {
  const { logLevel } = getOptions();
  if (!logLevel) return;
  if (["error", "warn", "info", true].indexOf(logLevel) > -1) {
    console.log(c.red(msg));
  }
};

export const warn = (msg?: string) => {
  const { logLevel } = getOptions();
  if (!logLevel) return;
  if (["warn", "info", true].indexOf(logLevel) > -1) {
    console.log(c.yellow(msg));
  }
};

export const info = (msg?: string) => {
  const { logLevel } = getOptions();
  if (!logLevel) return;
  if (["info", true].indexOf(logLevel) > -1) {
    console.log(c.blue(msg));
  }
};

export const success = (msg?: string) => {
  const { logLevel } = getOptions();
  if (!logLevel) return;
  if (["info", true].indexOf(logLevel) > -1) {
    console.log(c.green(msg));
  }
};

export const log = (...arg: any[]) => {
  const { logLevel } = getOptions();
  if (!logLevel) return;
  if (["info", true].indexOf(logLevel) > -1) {
    console.log(...arg);
  }
};

export const gray = (msg?: string) => {
  const { logLevel } = getOptions();
  if (!logLevel) return;
  if (["info", true].indexOf(logLevel) > -1) {
    console.log(c.gray(msg));
  }
};

export default {
  error,
  warn,
  info,
  success,
  log,
  gray,
};
