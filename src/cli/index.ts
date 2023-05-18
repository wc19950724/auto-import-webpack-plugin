import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { program } from "commander";

import main from "@/main";
import { Options } from "@/types";
import logger from "@/utils/logger";

const pkgPath = resolve(dirname(__dirname), "..", "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
program.name(pkg.name).version(pkg.version).description(pkg.description);

program
  .option("-e, --entry <name>", "entry path")
  .option("-o, --output <name>", "output file")
  .option("-r, --resolvers <value>", "library name")
  .option("-i, --ignore-path <name>", "entry ignore files config")
  .option("-l, --log-level <value>", "log level")
  .parse(process.argv);

const options = program.opts<Options>();

main(options)
  .catch((err: Error) => {
    logger.error(err.stack);
  })
  .finally(() => {
    process.exit(0);
  });
