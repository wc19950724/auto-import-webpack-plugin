export interface ProgramOptions {
  input: string;
  output: string;
  resolvers: "element-ui";
  ignorePath: string;
}

export const optionsDefault: ProgramOptions = {
  input: "/",
  output: "auto-import.js",
  ignorePath: ".genaratorignore",
  resolvers: "element-ui",
};
