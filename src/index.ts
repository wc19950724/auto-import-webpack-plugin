import { Compiler } from "webpack";

import { optionsDefault, ProgramOptions } from "./typings";
import { run } from "./utils/utils";

class AutoImportPlugin {
  #resolvers: ProgramOptions["resolvers"];
  #input: string;
  #output: string;
  #ignorePath: string;

  constructor(options: ProgramOptions) {
    options = Object.assign({}, options, optionsDefault);
    this.#input = options.input;
    this.#output = options.output;
    this.#ignorePath = options.ignorePath;
    this.#resolvers = options.resolvers;
  }

  apply(compiler: Compiler) {
    compiler.hooks.beforeRun.tapAsync(
      "AutoImportPlugin",
      (compiler, callback) => {
        // 在这里执行你的自定义脚本
        run("node", [
          "lib/cli.js",
          "-i",
          this.#input,
          "-o",
          this.#output,
          "-r",
          this.#resolvers,
          "-n",
          this.#ignorePath,
        ]).finally(callback);
      }
    );
  }
}

module.exports = AutoImportPlugin;
