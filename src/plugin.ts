import { Options } from "@typings";
import { Compiler } from "webpack";

import { scanProjectFiles, setOptions } from "@/index";
import logger from "@/utils/logger";

import { optionsDefault } from "./common";

class AutoImportPlugin {
  #entry: Options["entry"];
  #output: Options["output"];
  #resolvers: Options["resolvers"];
  #ignorePath: Options["ignorePath"];
  #logLevel: Options["logLevel"];
  #check: Options["check"];

  constructor(options?: Options) {
    options = Object.assign({}, optionsDefault, options);
    this.#entry = options.entry;
    this.#output = options.output;
    this.#resolvers = options.resolvers;
    this.#ignorePath = options.ignorePath;
    this.#logLevel = options.logLevel;
    this.#check = options.check;
  }

  apply(compiler: Compiler) {
    compiler.hooks.beforeRun.tapAsync(
      "AutoImportPlugin",
      (compiler, callback) => {
        // 在这里执行你的自定义脚本
        setOptions({
          entry: this.#entry,
          output: this.#output,
          resolvers: this.#resolvers,
          ignorePath: this.#ignorePath,
          logLevel: this.#logLevel,
          check: this.#check,
        })
          .catch((err: Error) => {
            logger.error(err.stack ?? err);
          })
          .finally(callback);
      }
    );
    compiler.hooks.beforeCompile.tapAsync(
      "AutoImportPlugin",
      (compiler, callback) => {
        // 在这里执行你的自定义脚本
        scanProjectFiles()
          .catch((err: Error) => {
            logger.error(err.stack ?? err);
          })
          .finally(callback);
      }
    );
  }
}

export default AutoImportPlugin;
