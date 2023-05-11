import { Compiler } from "webpack";

declare class AutoImportPlugin {
  constructor(options?: AutoImportPlugin.Options);
  apply(compiler: Compiler): void;
}

declare namespace AutoImportPlugin {
  interface Options {
    input: string;
    output: string;
    ignorePath: string;
    resolvers: string;
  }
}

export = AutoImportPlugin;
