import { Compiler } from "webpack";

import { scanProjectFiles, setOptions } from ".";
import { optionsDefault, ProgramOptions } from "./types";
import logger from "./utils/logger";

class AutoImportPlugin {
  #input: string;
  #output: string;
  #resolvers: ProgramOptions["resolvers"];
  #ignorePath: string;

  constructor(options: ProgramOptions) {
    options = Object.assign({}, optionsDefault, options);
    this.#input = options.input;
    this.#output = options.output;
    this.#resolvers = options.resolvers;
    this.#ignorePath = options.ignorePath;
  }

  apply(compiler: Compiler) {
    compiler.hooks.beforeRun.tapAsync(
      "AutoImportPlugin",
      (compiler, callback) => {
        // 在这里执行你的自定义脚本
        setOptions({
          input: this.#input,
          output: this.#output,
          resolvers: this.#resolvers,
          ignorePath: this.#ignorePath,
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
