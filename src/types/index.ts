export interface Options {
  entry?: string;
  output?: string;
  ignorePath?: string;
  resolvers?: "element-ui";
  logLevel?: "error" | "wran" | "info" | "none";
}

export type RequiredOptions = Required<Options>;
