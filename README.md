<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200"
      src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>
</div>

# auto-import-webpack-plugin

## Getting Started

To begin, you'll need to install `auto-import-webpack-plugin`:

```console
npm install auto-import-webpack-plugin --save-dev
```

or

```console
yarn add -D auto-import-webpack-plugin
```

or

```console
pnpm add -D auto-import-webpack-plugin
```

Then add the plugin to your `webpack` config. For example:

**webpack.config.js**

```js
const AutoImport = require("auto-import-webpack-plugin");

module.exports = {
  plugins: [
    new AutoImport({
      entry: "/", // entry path
      output: "auto-import.js", // output path
      resolvers: "element-ui", // library name
      ignorePath: ".generatorignore", // entry ignore files config
      logLevel: "info", // log level
      check: true, // check output file
    }),
  ],
};
```

or

Then add the scripts to your `package.json` config. For example:

**package.json**

```js
"scripts": {
  "generator": "auto-import"
},
"devDependencies": {
  "auto-import-webpack-plugin": "latest"
}
```

**auto-import Description**

```markdown
-V, --version output the version number
-i, --input <name> input path
-o, --output <name> output file
-r, --resolvers <value> components library: element-ui
-n, --ignore-path <name> ignore files config
-l, --log-level <value> log level: error | wran | info | none | true | false
-c, --check check output file
-h, --help display help for command
```

## License

[MIT](./LICENSE)
