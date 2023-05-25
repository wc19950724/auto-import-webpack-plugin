import { scanProjectFiles, setOptions } from "@/main";
import { Options } from "@/types";
import { optionsDefault } from "@/utils";

class AutoImportPlugin {
  #options: Options;

  constructor(options?: Options) {
    this.#options = Object.assign({}, optionsDefault, options);
  }

  async apply(compiler: any) {
    await setOptions(this.#options);
    compiler.hooks.beforeCompile.tapAsync(
      AutoImportPlugin.name,
      (_compiler: any, callback: any) => {
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

export { AutoImportPlugin, AutoImportPlugin as default };
