import fs from "node:fs";
import path from "node:path";

import { build } from "tsup";

import { step } from "./utils";

const baseOptions = {
  outDir: "lib",
};
const rootPath = path.dirname(__dirname);

const main = async () => {
  await Promise.all([
    build({
      ...baseOptions,
      entry: {
        cli: "src/cli/index.ts",
      },
      format: "cjs",
      clean: true,
    }),
    build({
      ...baseOptions,
      entry: {
        plugin: "src/plugin/index.ts",
      },
      format: ["esm", "cjs"],
      dts: true,
    }),
  ]);
  console.log("\r");
  formatPkgJson();
  copyFiles(["LICENSE", "README.md"]);
};

const formatPkgJson = () => {
  const pkgPath = path.resolve(rootPath, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

  const attrs = [
    "name",
    "version",
    "description",
    "main",
    "module",
    "types",
    "bin",
    "exports",
    "keywords",
    "author",
    "license",
    "repository",
    "bugs",
    "homepage",
    "dependencies",
    "peerDependencies",
  ];

  const npmPkg: {
    [k: string]: unknown;
  } = {};

  attrs.forEach((key) => {
    npmPkg[key] = pkg[key] || "";
  });

  fs.writeFileSync(
    path.resolve(rootPath, baseOptions.outDir, "package.json"),
    JSON.stringify(npmPkg, null, 2),
    "utf-8"
  );
  step(`${baseOptions.outDir}/package.json`, "JSON");
};

const copyFiles = (filesPath: string[]) => {
  for (const filePath of filesPath) {
    const src = path.resolve(rootPath, filePath);
    const dest = `${baseOptions.outDir}/${path.basename(filePath)}`;
    fs.copyFileSync(src, dest);
    step(dest, "COPY");
  }
};

main();
