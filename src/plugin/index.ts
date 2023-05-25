import { Compiler } from "webpack";

import { scanProjectFiles, setOptions } from "@/main";
import { Options } from "@/types";
import { optionsDefault } from "@/utils";

class AutoImportPlugin {
  #options: Options;

  constructor(options?: Options) {
    this.#options = Object.assign({}, optionsDefault, options);
  }

  async apply(compiler: Compiler) {
    await setOptions(this.#options);
    if (
      compiler.options.mode === "development" ||
      compiler.options.optimization.nodeEnv === "development"
    ) {
      // 在 watchRun 钩子中执行逻辑（开发服务器模式）
      compiler.hooks.watchRun.tapAsync(
        AutoImportPlugin.name,
        (_compiler, callback) => {
          // 在这里执行你的自定义脚本（每次编译都执行）
          scanProjectFiles()
            .then(() => {
              callback();
            })
            .catch((err: Error) => {
              callback(err);
            });
        }
      );
    } else {
      // 在 beforeRun 钩子中执行逻辑（构建打包模式）
      compiler.hooks.beforeRun.tap(AutoImportPlugin.name, async () => {
        // 在这里执行你的自定义脚本（只执行一次）
        try {
          await scanProjectFiles();
        } catch (error) {
          throw error as Error;
        }
      });
    }
  }
}

export { AutoImportPlugin, AutoImportPlugin as default };
