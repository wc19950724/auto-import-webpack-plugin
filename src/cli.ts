import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { Options } from "@typings";
import { program } from "commander";

import main from "@/index";
import logger from "@/utils/logger";

import { optionsDefault } from "./common";

const { input, output, resolvers, ignorePath, logLevel } = optionsDefault;

const pkgPath = resolve(__dirname, "..", "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
program.name(pkg.name).version(pkg.version).description(pkg.description);

program
  .option("-i, --input <name>", "input path", input)
  .option("-o, --output <name>", "output file", output)
  .option(
    "-r, --resolvers <value>",
    "components library: element-ui",
    resolvers
  )
  .option("-n, --ignore-path <name>", "ignore files config", ignorePath)
  .option(
    "-l, --log-level <value>",
    "log level: error | wran | info | none | true | false",
    logLevel
  )
  .parse(process.argv);

const options = program.opts<Options>();

main(options).catch((err: Error) => {
  logger.error(err.stack ?? err);
});
