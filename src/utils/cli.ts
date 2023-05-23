import fs from "node:fs";
import path from "node:path";

import arg from "arg";
import c from "picocolors";

import { Options } from "@/types";
import { createFormat, logger, optionsDefault, PADDING } from "@/utils";

export const spec: arg.Spec = {
  "--help": Boolean,
  "--version": Boolean,
  "--entry": String,
  "--output": String,
  "--resolvers": String,
  "--ignore-path": String,
  "--log-level": String,
  "-h": "--help",
  "-v": "--version",
  "-e": "--entry",
  "-o": "--output",
  "-r": "--resolvers",
  "-i": "--ignore-path",
  "-l": "--log-level",
};

export const formatArgs = (args: arg.Result<typeof spec>): Options => {
  const options: Options = {};
  for (const key in args) {
    const value = args[key];
    switch (key) {
      case "--entry":
        options.entry = value;
        break;
      case "--output":
        options.output = value;
        break;
      case "--resolvers":
        options.resolvers = value;
        break;
      case "--ignore-path":
        options.ignorePath = value;
        break;
      case "--log-level":
        options.logLevel = value;
        break;
      default:
        break;
    }
  }

  return options;
};

export const argsTips = (key: string) => {
  let tip = "";
  switch (key) {
    case "-h":
      tip = "cli help";
      break;
    case "-v":
      tip = "package version";
      break;
    case "-e":
      tip = "scan entry".padEnd(PADDING) + `default: '${optionsDefault.entry}'`;
      break;
    case "-o":
      tip =
        "generator file path".padEnd(PADDING) +
        `default: '${optionsDefault.output}'`;
      break;
    case "-r":
      tip =
        "library name now".padEnd(PADDING) +
        `only: '${optionsDefault.resolvers}'`;
      break;
    case "-i":
      tip =
        "ignore config path".padEnd(PADDING) +
        `default: '${optionsDefault.ignorePath}'`;
      break;
    case "-l":
      tip =
        "log level".padEnd(PADDING) + `default: '${optionsDefault.logLevel}'`;
      break;
    default:
      break;
  }
  return tip;
};

export const helpHandler = () => {
  const transformedSpec = new Map<string, string>();
  for (const key in spec) {
    const value = spec[key as keyof typeof spec];
    const existingValue = spec[value as keyof typeof spec];
    if (existingValue) {
      transformedSpec.set(`${key}, ${value}`, key);
      transformedSpec.delete(key);
      transformedSpec.delete(`${value}`);
    } else {
      transformedSpec.set(key, key);
    }
  }
  const formatText = createFormat(Object.fromEntries(transformedSpec));

  for (const [key, value] of transformedSpec) {
    logger.warn(`${formatText(key)}: ${c.bold(argsTips(value))}`);
  }
};

export const versionHandler = () => {
  const pkgPath = path.resolve(path.dirname(__dirname), "..", "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  logger.success(c.bold(pkg.version));
};
