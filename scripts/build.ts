import fs from "node:fs";
import path from "node:path";

import { build } from "tsup";

import { step } from "./utils";

const baseOptions = {
  outDir: "lib",
};
const rootPath = path.dirname(__dirname);

const main = async () => {
  await build({
    ...baseOptions,
    entry: {
      cli: "src/cli/index.ts",
      plugin: "src/plugin/index.ts",
    },
    format: ["esm", "cjs"],
    clean: true,
    dts: true,
    splitting: true,
    treeshake: true,
    minify: true,
  });
  await formatLib();
  console.log("\n");
  formatPkgJson();
  copyFiles(["LICENSE", "README.md"]);
  step(baseOptions.outDir, "SIZE");
};

const formatLib = async () => {
  try {
    const ignoreFiles = ["cli.d.ts", "cli.mjs"];
    for (const key of ignoreFiles) {
      fs.unlinkSync(path.join(rootPath, baseOptions.outDir, key));
    }
  } catch (error) {
    console.log(error);
  }
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
