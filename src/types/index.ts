export interface ArgsOptions {
  config?: string;
}

export interface IgnoreConfig {
  path?: string;
  components?: Array<string | RegExp>;
}

export type LibraryType = "element-ui";

export type LogLevelType = "error" | "wran" | "info" | boolean;

export interface Options {
  entry?: string;
  output?: string;
  ignore?: IgnoreConfig | string | Array<string | RegExp>;
  library?: LibraryType;
  logLevel?: LogLevelType;
}
