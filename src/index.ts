import { Compiler } from "webpack";

import scanProjectFiles from "./cli";
import { optionsDefault, ProgramOptions } from "./types";

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
    compiler.hooks.run.tapAsync("AutoImportPlugin", (compiler, callback) => {
      // 在这里执行你的自定义脚本
      scanProjectFiles().finally(callback);
    });
  }
}

export default AutoImportPlugin;
