import arg from "arg";

import { Options } from "@/types";

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
      tip = " ".repeat(7) + "cli help";
      break;
    case "-v":
      tip = " ".repeat(4) + "package version";
      break;
    case "-e":
      tip = " ".repeat(6) + "scan entry default: '.'";
      break;
    case "-o":
      tip = " ".repeat(5) + "generator file path default: 'auto-import.js'";
      break;
    case "-r":
      tip = " ".repeat(2) + "library name now only: 'element-ui'";
      break;
    case "-i":
      tip = "ignore config path default: '.generatorignore'";
      break;
    case "-l":
      tip = " ".repeat(2) + "log level default: 'info'";
      break;
    default:
      break;
  }
  return tip;
};
