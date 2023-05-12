import { Options } from "@typings";
import { Compiler } from "webpack";

import { optionsDefault } from "@/common";
import { scanProjectFiles, setOptions } from "@/index";
import logger from "@/utils/logger";

class AutoImportPlugin {
  #options: Options;

  constructor(options?: Options) {
    this.#options = Object.assign({}, optionsDefault, options);
  }

  async apply(compiler: Compiler) {
    try {
      await setOptions(this.#options);
      compiler.hooks.beforeCompile.tapAsync(
        AutoImportPlugin.name,
        (compiler, callback) => {
          // 在这里执行你的自定义脚本
          scanProjectFiles()
            .catch((err: Error) => {
              logger.error(err.stack ?? err);
            })
            .finally(callback);
        }
      );
    } catch (err) {
      logger.error((err as Error).stack ?? err);
    }
  }
}

export default AutoImportPlugin;
