import { Compiler } from "webpack";

import main from ".";
import { optionsDefault, ProgramOptions } from "./types";

class AutoImportPlugin {
  #input: string;
  #output: string;
  #resolvers: ProgramOptions["resolvers"];
  #ignorePath: string;

  constructor(options: ProgramOptions) {
    options = Object.assign({}, options, optionsDefault);
    this.#input = options.input;
    this.#output = options.output;
    this.#resolvers = options.resolvers;
    this.#ignorePath = options.ignorePath;
  }

  apply(compiler: Compiler) {
    compiler.hooks.run.tapAsync("AutoImportPlugin", (compiler, callback) => {
      // 在这里执行你的自定义脚本
      main({
        input: this.#input,
        output: this.#output,
        resolvers: this.#resolvers,
        ignorePath: this.#ignorePath,
      }).finally(callback);
    });
  }
}

export default AutoImportPlugin;
