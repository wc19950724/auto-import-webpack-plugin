import { Compiler } from "webpack";

import { scanProjectFiles, setOptions } from "@/main";
import { Options } from "@/types";
import { optionsDefault } from "@/utils";

class AutoImportPlugin {
  #options: Options;

  constructor(options?: Options) {
    this.#options = Object.assign({}, optionsDefault, options);
  }

  apply(compiler: Compiler) {
    if (
      compiler.options.mode === "development" ||
      compiler.options.optimization.nodeEnv === "development"
    ) {
      // 在 watchRun 钩子中执行逻辑（开发服务器模式）
      compiler.hooks.watchRun.tapAsync(
        AutoImportPlugin.name,
        async (_compiler, callback) => {
          try {
            await setOptions(this.#options);
            await scanProjectFiles();
            callback();
          } catch (error) {
            throw error as Error;
          }
        }
      );
    } else {
      // 在 beforeRun 钩子中执行逻辑（构建打包模式）
      compiler.hooks.beforeRun.tapAsync(
        AutoImportPlugin.name,
        async (_compiler, callback) => {
          try {
            await setOptions(this.#options);
            await scanProjectFiles();
            callback();
          } catch (error) {
            throw error as Error;
          }
        }
      );
    }
  }
}

export { AutoImportPlugin, AutoImportPlugin as default };
