import fs from "node:fs";
import path from "node:path";

import arg from "arg";
import c from "picocolors";

import main from "@/main";
import { argsTips, formatArgs, logger, spec } from "@/utils";

const cli = async () => {
  const args = arg(spec, {
    permissive: true,
  });

  if (args["--help"]) {
    const transformedSpec = new Map<string, string>();
    for (const key in spec) {
      const value = spec[key as keyof typeof spec];
      const existingValue = spec[value as keyof typeof spec];
      if (existingValue) {
        transformedSpec.set(`${key}, ${value}`, key);
        transformedSpec.delete(key);
        transformedSpec.delete(`${value}`);
      } else {
        transformedSpec.set(key, key);
      }
    }
    for (const [key, value] of transformedSpec) {
      logger.warn(`\t${key}: ${c.bold(argsTips(value))}`);
    }
  } else if (args["--version"]) {
    const pkgPath = path.resolve(path.dirname(__dirname), "..", "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    logger.success(c.bold(pkg.version));
  } else {
    const options = formatArgs(args);

    main(options)
      .catch((err: Error) => {
        logger.error(`${err.name}: ${err.message}`);
      })
      .finally(() => {
        process.exit(0);
      });
  }
};

cli().catch((err: Error) => {
  logger.error(`${err.name}: ${err.message}`);
});
