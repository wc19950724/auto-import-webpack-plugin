import { Compiler } from "webpack";

declare class AutoImportPlugin {
  constructor(options?: AutoImportPlugin.Options);
  apply(compiler: Compiler): void;
}

declare namespace AutoImportPlugin {
  interface Options {
    entry?: string;
    output?: string;
    ignorePath?: string;
    resolvers?: "element-ui";
    logLevel?: "error" | "wran" | "info" | "none";
    check?: boolean;
  }
}

export = AutoImportPlugin;
