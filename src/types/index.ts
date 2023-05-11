export interface ProgramOptions {
  input: string;
  output: string;
  resolvers: "element-ui" | "tdesign-vue-next";
  ignorePath: string;
}

export const optionsDefault: ProgramOptions = {
  input: "/",
  output: "auto-import.js",
  ignorePath: ".genaratorignore",
  resolvers: "element-ui",
};
