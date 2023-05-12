import { Options } from "@typings";
import { Compiler } from "webpack";

import { optionsDefault } from "@/common";
import { scanProjectFiles, setOptions } from "@/index";

class AutoImportPlugin {
  #options: Options;

  constructor(options?: Options) {
    this.#options = Object.assign({}, optionsDefault, options);
  }

  async apply(compiler: Compiler) {
    await setOptions(this.#options);
    compiler.hooks.beforeCompile.tapAsync(
      AutoImportPlugin.name,
      (compiler, callback) => {
        // 在这里执行你的自定义脚本
        scanProjectFiles()
          .then(() => {
            callback();
          })
          .catch((err: Error) => {
            callback(err);
          });
      }
    );
  }
}

export default AutoImportPlugin;
