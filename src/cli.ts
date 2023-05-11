import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { program } from "commander";

import main from ".";
import { optionsDefault, ProgramOptions } from "./types";

const pkgPath = resolve(__dirname, "..", "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
program.name(pkg.name).version(pkg.version).description(pkg.description);

program
  .option("-i, --input <entry>", "entry [file | folder] path")
  .option("-o, --output <output>", "output file")
  .option("-r, --resolvers <resolvers>", "element-ui")
  .option("-n, --ignore-path <ignore path>", "ignore scan files config")
  .parse(process.argv);

const programOptions = program.opts<ProgramOptions>();

const options = Object.assign({}, programOptions, optionsDefault);

main(options);
