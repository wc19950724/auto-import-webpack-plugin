import { Compiler } from "webpack";

import main from ".";
import { optionsDefault, ProgramOptions } from "./types";
import { step } from "./utils/utils";

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
    step("运行了插件");
    compiler.hooks.run.tapAsync("AutoImportPlugin", (compiler, callback) => {
      step("执行自定义脚本");
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
