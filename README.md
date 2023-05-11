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
      input: "/",
      output: "auto-import.js",
      ignorePath: ".genaratorignore",
      resolvers: "element-ui",
    }),
  ],
};
```

## License

[MIT](./LICENSE)
