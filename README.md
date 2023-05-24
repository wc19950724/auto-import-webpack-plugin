<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200"
      src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>
</div>

# auto-import-webpack-plugin

## Getting Started

To begin, you'll need to install `auto-import-webpack-plugin`:

```js
npm install auto-import-webpack-plugin --save-dev
```

or

```js
yarn add -D auto-import-webpack-plugin
```

or

```js
pnpm add -D auto-import-webpack-plugin
```

Then add the plugin to your `webpack` config. For example:

**webpack.config.js**

```js
const AutoImport = require("auto-import-webpack-plugin");

module.exports = {
  plugins: [
    new AutoImport({
      entry: ".", // entry path
      output: "auto-import.js", // output path
      library: "element-ui", // library name
      ignore: ".autoignore", // entry ignore files config
      logLevel: true, // log level
    }),
  ],
};
```

or

```js
import AutoImport from "auto-import-webpack-plugin";

export default {
  plugins: [
    new AutoImport({
      entry: ".", // entry path
      output: "auto-import.js", // output path
      library: "element-ui", // library name
      ignore: ".autoignore", // entry ignore files config
      logLevel: true, // log level
    }),
  ],
};
```

Then add the scripts to your `package.json` config. For example:

**package.json**

```json
"scripts": {
  "generator": "auto-import"
},
"devDependencies": {
  "auto-import-webpack-plugin": "latest"
}
```

**auto-import Description**

```php
-h, --help   : cli help
-v, --version: package version
-c, --config : config filename default: 'atconfig.json'
```

> **auto-import -c atconfig.json**
>
> > **autoconfig.json**
> >
> > > ```php
> > > {
> > >   "entry": ".",
> > >   "output": "auto-import.js",
> > >   "library": "element-ui",
> > >   "ignore": ".autoignore",
> > >   "logLevel": true
> > > }
> > > ```

> **auto-import -c atconfig.js**
>
> > **autoconfig.js**
> >
> > > ```php
> > > module.exports = {
> > >   entry: ".",
> > >   output: "auto-import.js",
> > >   library: "element-ui",
> > >   ignore: ".autoignore",
> > >   logLevel: true,
> > > };
> > > ```

## TypeScript

[.d.ts](./plugin.d.ts)

## License

[MIT](./LICENSE)
