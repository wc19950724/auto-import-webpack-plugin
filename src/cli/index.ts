import arg from "arg";

import main from "@/main";
import { formatArgs, helpHandler, logger, spec, versionHandler } from "@/utils";

const cli = async () => {
  const args = arg(spec, {
    permissive: true,
  });

  if (args["--help"]) {
    helpHandler();
  } else if (args["--version"]) {
    versionHandler();
  } else {
    const options = await formatArgs(args);

    await main(options);
  }
};

cli()
  .catch((err: Error) => {
    logger.error(err.stack ?? `${err.name}: ${err.message}`);
  })
  .finally(() => {
    process.exit(0);
  });
