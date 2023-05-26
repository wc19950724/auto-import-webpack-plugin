import { cac } from "cac";

import { version as pkgVersion } from "@/../package.json";
import main from "@/main";
import { argsOptionsDefault, formatArgs, logger } from "@/utils";

const cli = async () => {
  const program = cac("auto-import");
  program
    .command("")
    .option("-c, --config <filename>", "config file name", {
      default: argsOptionsDefault.config,
    })
    .example(`auto-import -c ${argsOptionsDefault.config}`)
    .action(async (args) => {
      const options = await formatArgs(args);
      await main(options)
        .catch((err: Error) => {
          logger.error(`${err.name}: ${err.message}`);
        })
        .finally(() => {
          process.exit(0);
        });
    });
  program.help();
  program.version(pkgVersion);
  program.parse(process.argv);
};

cli().catch((err) => {
  if (err instanceof Error) {
    logger.error(`${err.name}: ${err.message}`);
  } else {
    logger.log(err);
  }
});
