var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw new Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/.pnpm/ignore@5.2.4/node_modules/ignore/index.js
var require_ignore = __commonJS({
  "node_modules/.pnpm/ignore@5.2.4/node_modules/ignore/index.js"(exports, module) {
    function makeArray(subject) {
      return Array.isArray(subject) ? subject : [subject];
    }
    var EMPTY = "";
    var SPACE = " ";
    var ESCAPE = "\\";
    var REGEX_TEST_BLANK_LINE = /^\s+$/;
    var REGEX_INVALID_TRAILING_BACKSLASH = /(?:[^\\]|^)\\$/;
    var REGEX_REPLACE_LEADING_EXCAPED_EXCLAMATION = /^\\!/;
    var REGEX_REPLACE_LEADING_EXCAPED_HASH = /^\\#/;
    var REGEX_SPLITALL_CRLF = /\r?\n/g;
    var REGEX_TEST_INVALID_PATH = /^\.*\/|^\.+$/;
    var SLASH = "/";
    var TMP_KEY_IGNORE = "node-ignore";
    if (typeof Symbol !== "undefined") {
      TMP_KEY_IGNORE = Symbol.for("node-ignore");
    }
    var KEY_IGNORE = TMP_KEY_IGNORE;
    var define = (object, key, value) => Object.defineProperty(object, key, { value });
    var REGEX_REGEXP_RANGE = /([0-z])-([0-z])/g;
    var RETURN_FALSE = () => false;
    var sanitizeRange = (range) => range.replace(
      REGEX_REGEXP_RANGE,
      (match, from, to) => from.charCodeAt(0) <= to.charCodeAt(0) ? match : EMPTY
    );
    var cleanRangeBackSlash = (slashes) => {
      const { length } = slashes;
      return slashes.slice(0, length - length % 2);
    };
    var REPLACERS = [
      // > Trailing spaces are ignored unless they are quoted with backslash ("\")
      [
        // (a\ ) -> (a )
        // (a  ) -> (a)
        // (a \ ) -> (a  )
        /\\?\s+$/,
        (match) => match.indexOf("\\") === 0 ? SPACE : EMPTY
      ],
      // replace (\ ) with ' '
      [
        /\\\s/g,
        () => SPACE
      ],
      // Escape metacharacters
      // which is written down by users but means special for regular expressions.
      // > There are 12 characters with special meanings:
      // > - the backslash \,
      // > - the caret ^,
      // > - the dollar sign $,
      // > - the period or dot .,
      // > - the vertical bar or pipe symbol |,
      // > - the question mark ?,
      // > - the asterisk or star *,
      // > - the plus sign +,
      // > - the opening parenthesis (,
      // > - the closing parenthesis ),
      // > - and the opening square bracket [,
      // > - the opening curly brace {,
      // > These special characters are often called "metacharacters".
      [
        /[\\$.|*+(){^]/g,
        (match) => `\\${match}`
      ],
      [
        // > a question mark (?) matches a single character
        /(?!\\)\?/g,
        () => "[^/]"
      ],
      // leading slash
      [
        // > A leading slash matches the beginning of the pathname.
        // > For example, "/*.c" matches "cat-file.c" but not "mozilla-sha1/sha1.c".
        // A leading slash matches the beginning of the pathname
        /^\//,
        () => "^"
      ],
      // replace special metacharacter slash after the leading slash
      [
        /\//g,
        () => "\\/"
      ],
      [
        // > A leading "**" followed by a slash means match in all directories.
        // > For example, "**/foo" matches file or directory "foo" anywhere,
        // > the same as pattern "foo".
        // > "**/foo/bar" matches file or directory "bar" anywhere that is directly
        // >   under directory "foo".
        // Notice that the '*'s have been replaced as '\\*'
        /^\^*\\\*\\\*\\\//,
        // '**/foo' <-> 'foo'
        () => "^(?:.*\\/)?"
      ],
      // starting
      [
        // there will be no leading '/'
        //   (which has been replaced by section "leading slash")
        // If starts with '**', adding a '^' to the regular expression also works
        /^(?=[^^])/,
        function startingReplacer() {
          return !/\/(?!$)/.test(this) ? "(?:^|\\/)" : "^";
        }
      ],
      // two globstars
      [
        // Use lookahead assertions so that we could match more than one `'/**'`
        /\\\/\\\*\\\*(?=\\\/|$)/g,
        // Zero, one or several directories
        // should not use '*', or it will be replaced by the next replacer
        // Check if it is not the last `'/**'`
        (_, index, str) => index + 6 < str.length ? "(?:\\/[^\\/]+)*" : "\\/.+"
      ],
      // normal intermediate wildcards
      [
        // Never replace escaped '*'
        // ignore rule '\*' will match the path '*'
        // 'abc.*/' -> go
        // 'abc.*'  -> skip this rule,
        //    coz trailing single wildcard will be handed by [trailing wildcard]
        /(^|[^\\]+)(\\\*)+(?=.+)/g,
        // '*.js' matches '.js'
        // '*.js' doesn't match 'abc'
        (_, p1, p2) => {
          const unescaped = p2.replace(/\\\*/g, "[^\\/]*");
          return p1 + unescaped;
        }
      ],
      [
        // unescape, revert step 3 except for back slash
        // For example, if a user escape a '\\*',
        // after step 3, the result will be '\\\\\\*'
        /\\\\\\(?=[$.|*+(){^])/g,
        () => ESCAPE
      ],
      [
        // '\\\\' -> '\\'
        /\\\\/g,
        () => ESCAPE
      ],
      [
        // > The range notation, e.g. [a-zA-Z],
        // > can be used to match one of the characters in a range.
        // `\` is escaped by step 3
        /(\\)?\[([^\]/]*?)(\\*)($|\])/g,
        (match, leadEscape, range, endEscape, close) => leadEscape === ESCAPE ? `\\[${range}${cleanRangeBackSlash(endEscape)}${close}` : close === "]" ? endEscape.length % 2 === 0 ? `[${sanitizeRange(range)}${endEscape}]` : "[]" : "[]"
      ],
      // ending
      [
        // 'js' will not match 'js.'
        // 'ab' will not match 'abc'
        /(?:[^*])$/,
        // WTF!
        // https://git-scm.com/docs/gitignore
        // changes in [2.22.1](https://git-scm.com/docs/gitignore/2.22.1)
        // which re-fixes #24, #38
        // > If there is a separator at the end of the pattern then the pattern
        // > will only match directories, otherwise the pattern can match both
        // > files and directories.
        // 'js*' will not match 'a.js'
        // 'js/' will not match 'a.js'
        // 'js' will match 'a.js' and 'a.js/'
        (match) => /\/$/.test(match) ? `${match}$` : `${match}(?=$|\\/$)`
      ],
      // trailing wildcard
      [
        /(\^|\\\/)?\\\*$/,
        (_, p1) => {
          const prefix = p1 ? `${p1}[^/]+` : "[^/]*";
          return `${prefix}(?=$|\\/$)`;
        }
      ]
    ];
    var regexCache = /* @__PURE__ */ Object.create(null);
    var makeRegex = (pattern, ignoreCase) => {
      let source = regexCache[pattern];
      if (!source) {
        source = REPLACERS.reduce(
          (prev, current) => prev.replace(current[0], current[1].bind(pattern)),
          pattern
        );
        regexCache[pattern] = source;
      }
      return ignoreCase ? new RegExp(source, "i") : new RegExp(source);
    };
    var isString = (subject) => typeof subject === "string";
    var checkPattern = (pattern) => pattern && isString(pattern) && !REGEX_TEST_BLANK_LINE.test(pattern) && !REGEX_INVALID_TRAILING_BACKSLASH.test(pattern) && pattern.indexOf("#") !== 0;
    var splitPattern = (pattern) => pattern.split(REGEX_SPLITALL_CRLF);
    var IgnoreRule = class {
      constructor(origin, pattern, negative, regex) {
        this.origin = origin;
        this.pattern = pattern;
        this.negative = negative;
        this.regex = regex;
      }
    };
    var createRule = (pattern, ignoreCase) => {
      const origin = pattern;
      let negative = false;
      if (pattern.indexOf("!") === 0) {
        negative = true;
        pattern = pattern.substr(1);
      }
      pattern = pattern.replace(REGEX_REPLACE_LEADING_EXCAPED_EXCLAMATION, "!").replace(REGEX_REPLACE_LEADING_EXCAPED_HASH, "#");
      const regex = makeRegex(pattern, ignoreCase);
      return new IgnoreRule(
        origin,
        pattern,
        negative,
        regex
      );
    };
    var throwError = (message, Ctor) => {
      throw new Ctor(message);
    };
    var checkPath = (path2, originalPath, doThrow) => {
      if (!isString(path2)) {
        return doThrow(
          `path must be a string, but got \`${originalPath}\``,
          TypeError
        );
      }
      if (!path2) {
        return doThrow(`path must not be empty`, TypeError);
      }
      if (checkPath.isNotRelative(path2)) {
        const r = "`path.relative()`d";
        return doThrow(
          `path should be a ${r} string, but got "${originalPath}"`,
          RangeError
        );
      }
      return true;
    };
    var isNotRelative = (path2) => REGEX_TEST_INVALID_PATH.test(path2);
    checkPath.isNotRelative = isNotRelative;
    checkPath.convert = (p) => p;
    var Ignore = class {
      constructor({
        ignorecase = true,
        ignoreCase = ignorecase,
        allowRelativePaths = false
      } = {}) {
        define(this, KEY_IGNORE, true);
        this._rules = [];
        this._ignoreCase = ignoreCase;
        this._allowRelativePaths = allowRelativePaths;
        this._initCache();
      }
      _initCache() {
        this._ignoreCache = /* @__PURE__ */ Object.create(null);
        this._testCache = /* @__PURE__ */ Object.create(null);
      }
      _addPattern(pattern) {
        if (pattern && pattern[KEY_IGNORE]) {
          this._rules = this._rules.concat(pattern._rules);
          this._added = true;
          return;
        }
        if (checkPattern(pattern)) {
          const rule = createRule(pattern, this._ignoreCase);
          this._added = true;
          this._rules.push(rule);
        }
      }
      // @param {Array<string> | string | Ignore} pattern
      add(pattern) {
        this._added = false;
        makeArray(
          isString(pattern) ? splitPattern(pattern) : pattern
        ).forEach(this._addPattern, this);
        if (this._added) {
          this._initCache();
        }
        return this;
      }
      // legacy
      addPattern(pattern) {
        return this.add(pattern);
      }
      //          |           ignored : unignored
      // negative |   0:0   |   0:1   |   1:0   |   1:1
      // -------- | ------- | ------- | ------- | --------
      //     0    |  TEST   |  TEST   |  SKIP   |    X
      //     1    |  TESTIF |  SKIP   |  TEST   |    X
      // - SKIP: always skip
      // - TEST: always test
      // - TESTIF: only test if checkUnignored
      // - X: that never happen
      // @param {boolean} whether should check if the path is unignored,
      //   setting `checkUnignored` to `false` could reduce additional
      //   path matching.
      // @returns {TestResult} true if a file is ignored
      _testOne(path2, checkUnignored) {
        let ignored = false;
        let unignored = false;
        this._rules.forEach((rule) => {
          const { negative } = rule;
          if (unignored === negative && ignored !== unignored || negative && !ignored && !unignored && !checkUnignored) {
            return;
          }
          const matched = rule.regex.test(path2);
          if (matched) {
            ignored = !negative;
            unignored = negative;
          }
        });
        return {
          ignored,
          unignored
        };
      }
      // @returns {TestResult}
      _test(originalPath, cache, checkUnignored, slices) {
        const path2 = originalPath && checkPath.convert(originalPath);
        checkPath(
          path2,
          originalPath,
          this._allowRelativePaths ? RETURN_FALSE : throwError
        );
        return this._t(path2, cache, checkUnignored, slices);
      }
      _t(path2, cache, checkUnignored, slices) {
        if (path2 in cache) {
          return cache[path2];
        }
        if (!slices) {
          slices = path2.split(SLASH);
        }
        slices.pop();
        if (!slices.length) {
          return cache[path2] = this._testOne(path2, checkUnignored);
        }
        const parent = this._t(
          slices.join(SLASH) + SLASH,
          cache,
          checkUnignored,
          slices
        );
        return cache[path2] = parent.ignored ? parent : this._testOne(path2, checkUnignored);
      }
      ignores(path2) {
        return this._test(path2, this._ignoreCache, false).ignored;
      }
      createFilter() {
        return (path2) => !this.ignores(path2);
      }
      filter(paths) {
        return makeArray(paths).filter(this.createFilter());
      }
      // @returns {TestResult}
      test(path2) {
        return this._test(path2, this._testCache, true);
      }
    };
    var factory = (options2) => new Ignore(options2);
    var isPathValid = (path2) => checkPath(path2 && checkPath.convert(path2), path2, RETURN_FALSE);
    factory.isPathValid = isPathValid;
    factory.default = factory;
    module.exports = factory;
    if (
      // Detect `process` so that it can run in browsers.
      typeof process !== "undefined" && (process.env && process.env.IGNORE_TEST_WIN32 || process.platform === "win32")
    ) {
      const makePosix = (str) => /^\\\\\?\\/.test(str) || /["<>|\u0000-\u001F]+/u.test(str) ? str : str.replace(/\\/g, "/");
      checkPath.convert = makePosix;
      const REGIX_IS_WINDOWS_PATH_ABSOLUTE = /^[a-z]:\//i;
      checkPath.isNotRelative = (path2) => REGIX_IS_WINDOWS_PATH_ABSOLUTE.test(path2) || isNotRelative(path2);
    }
  }
});

// node_modules/.pnpm/picocolors@1.0.0/node_modules/picocolors/picocolors.js
var require_picocolors = __commonJS({
  "node_modules/.pnpm/picocolors@1.0.0/node_modules/picocolors/picocolors.js"(exports, module) {
    var tty = __require("tty");
    var isColorSupported = !("NO_COLOR" in process.env || process.argv.includes("--no-color")) && ("FORCE_COLOR" in process.env || process.argv.includes("--color") || process.platform === "win32" || tty.isatty(1) && process.env.TERM !== "dumb" || "CI" in process.env);
    var formatter = (open, close, replace = open) => (input) => {
      let string = "" + input;
      let index = string.indexOf(close, open.length);
      return ~index ? open + replaceClose(string, close, replace, index) + close : open + string + close;
    };
    var replaceClose = (string, close, replace, index) => {
      let start = string.substring(0, index) + replace;
      let end = string.substring(index + close.length);
      let nextIndex = end.indexOf(close);
      return ~nextIndex ? start + replaceClose(end, close, replace, nextIndex) : start + end;
    };
    var createColors = (enabled = isColorSupported) => ({
      isColorSupported: enabled,
      reset: enabled ? (s) => `\x1B[0m${s}\x1B[0m` : String,
      bold: enabled ? formatter("\x1B[1m", "\x1B[22m", "\x1B[22m\x1B[1m") : String,
      dim: enabled ? formatter("\x1B[2m", "\x1B[22m", "\x1B[22m\x1B[2m") : String,
      italic: enabled ? formatter("\x1B[3m", "\x1B[23m") : String,
      underline: enabled ? formatter("\x1B[4m", "\x1B[24m") : String,
      inverse: enabled ? formatter("\x1B[7m", "\x1B[27m") : String,
      hidden: enabled ? formatter("\x1B[8m", "\x1B[28m") : String,
      strikethrough: enabled ? formatter("\x1B[9m", "\x1B[29m") : String,
      black: enabled ? formatter("\x1B[30m", "\x1B[39m") : String,
      red: enabled ? formatter("\x1B[31m", "\x1B[39m") : String,
      green: enabled ? formatter("\x1B[32m", "\x1B[39m") : String,
      yellow: enabled ? formatter("\x1B[33m", "\x1B[39m") : String,
      blue: enabled ? formatter("\x1B[34m", "\x1B[39m") : String,
      magenta: enabled ? formatter("\x1B[35m", "\x1B[39m") : String,
      cyan: enabled ? formatter("\x1B[36m", "\x1B[39m") : String,
      white: enabled ? formatter("\x1B[37m", "\x1B[39m") : String,
      gray: enabled ? formatter("\x1B[90m", "\x1B[39m") : String,
      bgBlack: enabled ? formatter("\x1B[40m", "\x1B[49m") : String,
      bgRed: enabled ? formatter("\x1B[41m", "\x1B[49m") : String,
      bgGreen: enabled ? formatter("\x1B[42m", "\x1B[49m") : String,
      bgYellow: enabled ? formatter("\x1B[43m", "\x1B[49m") : String,
      bgBlue: enabled ? formatter("\x1B[44m", "\x1B[49m") : String,
      bgMagenta: enabled ? formatter("\x1B[45m", "\x1B[49m") : String,
      bgCyan: enabled ? formatter("\x1B[46m", "\x1B[49m") : String,
      bgWhite: enabled ? formatter("\x1B[47m", "\x1B[49m") : String
    });
    module.exports = createColors();
    module.exports.createColors = createColors;
  }
});

// src/main.ts
import fs from "node:fs";
import path from "node:path";

// src/library/element-ui.ts
import { readFileSync as readFileSync3 } from "node:fs";

// src/utils/common.ts
var import_ignore = __toESM(require_ignore());
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
var projectPath = process.cwd();
var ignoreFile = (0, import_ignore.default)().add("node_modules").add("/.*");
var optionsDefault = {
  entry: ".",
  output: "auto-import.js",
  resolvers: "element-ui",
  ignorePath: ".generatorignore",
  logLevel: "info"
};
var options = optionsDefault;
var setOptions = async (params) => {
  Object.assign(options, params);
  const projectIgnorePath = resolve(projectPath, options.ignorePath);
  if (existsSync(projectIgnorePath)) {
    const ignoreContext = readFileSync(projectIgnorePath).toString().replace(/\/$/gm, "");
    ignoreFile.add(ignoreContext);
  }
};
var getOptions = () => options;
var getEntryPath = () => {
  return resolve(process.cwd(), options.entry);
};
var getOutputPath = () => {
  return resolve(projectPath, options.output);
};

// src/utils/logger.ts
var logger_exports = {};
__export(logger_exports, {
  default: () => logger_default,
  error: () => error,
  gray: () => gray,
  info: () => info,
  log: () => log,
  success: () => success,
  warn: () => warn
});
var import_picocolors = __toESM(require_picocolors());
var error = (msg) => {
  const { logLevel } = getOptions();
  if (["error", "warn", "info"].indexOf(logLevel) > -1) {
    console.log(import_picocolors.default.red(msg));
  }
};
var warn = (msg) => {
  const { logLevel } = getOptions();
  if (["warn", "info"].indexOf(logLevel) > -1) {
    console.log(import_picocolors.default.yellow(msg));
  }
};
var info = (msg) => {
  const { logLevel } = getOptions();
  if (["info"].indexOf(logLevel) > -1) {
    console.log(import_picocolors.default.blue(msg));
  }
};
var success = (msg) => {
  const { logLevel } = getOptions();
  if (["info"].indexOf(logLevel) > -1) {
    console.log(import_picocolors.default.green(msg));
  }
};
var log = (...arg) => {
  const { logLevel } = getOptions();
  if (["info"].indexOf(logLevel) > -1) {
    console.log(...arg);
  }
};
var gray = (msg) => {
  const { logLevel } = getOptions();
  if (["info"].indexOf(logLevel) > -1) {
    console.log(import_picocolors.default.gray(msg));
  }
};
var logger_default = {
  error,
  warn,
  info,
  success,
  log,
  gray
};

// src/utils/utils.ts
import { existsSync as existsSync2, readdirSync, readFileSync as readFileSync2, statSync } from "node:fs";
import { resolve as resolve2 } from "node:path";
var step = (msg) => logger_exports.success(`
[AUTO] ${msg}`);
var toPascalCase = (str) => {
  return str.replace(/^\w/, (c2) => c2.toUpperCase());
};
var getImportedComponents = () => {
  const outputPath = getOutputPath();
  const importedComponents = /* @__PURE__ */ new Set();
  if (existsSync2(outputPath)) {
    const outputContent = readFileSync2(outputPath, "utf8");
    const importPattern = /import\s*{([^}]*)}\s*from\s*['"]([^'"]*)['"]/g;
    const matches = outputContent.matchAll(importPattern);
    for (const match of matches) {
      const componentNames = match[1].split(",").map((name) => name.trim());
      componentNames.forEach((componentName) => {
        importedComponents.add(componentName);
      });
    }
  }
  return importedComponents;
};
var getVueFiles = (directory) => {
  const files = readdirSync(directory, { withFileTypes: true });
  const vueFiles = [];
  files.forEach((file) => {
    if (ignoreFile.ignores(file.name))
      return;
    const filePath = resolve2(directory, file.name);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      vueFiles.push(...getVueFiles(filePath));
    } else if (stat.isFile() && file.name.endsWith(".vue")) {
      logger_exports.gray(filePath);
      vueFiles.push(filePath);
    }
  });
  return vueFiles;
};

// src/library/element-ui.ts
var specialComponents = {
  Loading: {
    use: "Loading.directive",
    prototype: {
      loading: "Loading.service"
    }
  },
  MessageBox: {
    prototype: {
      msgbox: "MessageBox",
      alert: "MessageBox.alert",
      confirm: "MessageBox.confirm",
      prompt: "MessageBox.prompt"
    }
  },
  Notification: {
    prototype: {
      notify: "Notification"
    }
  },
  Message: {
    prototype: {
      message: "Message"
    }
  }
};
var scanComponents = (file) => {
  const vueComponents = /* @__PURE__ */ new Set();
  const fileContent = readFileSync3(file, "utf-8");
  const componentRegex = /<(?:el-|El)([^>\s]+)(?=[\s>])/g;
  const directiveRegex = /\bv-loading(?::[^=>\s]+)?/g;
  const propertyRegex = /\$(?:msgbox|alert|confirm|prompt|notify|message)/g;
  const componentMatches = fileContent.matchAll(componentRegex);
  for (const match of componentMatches) {
    const componentName = match[1];
    const importedComponent = toPascalCase(componentName);
    vueComponents.add(importedComponent);
  }
  const directiveMatches = fileContent.match(directiveRegex);
  if (directiveMatches?.length)
    vueComponents.add("Loading");
  const propertyMatches = fileContent.matchAll(propertyRegex);
  for (const match of propertyMatches) {
    const propertyName = match[0].substring(1);
    if (propertyName === "msgbox" || propertyName === "alert" || propertyName === "confirm" || propertyName === "prompt") {
      vueComponents.add("MessageBox");
    } else if (propertyName === "notify") {
      vueComponents.add("Notification");
    } else if (propertyName === "message") {
      vueComponents.add("Message");
    }
  }
  return vueComponents;
};
var handleSpecialComponents = (component) => {
  const componentConfig = specialComponents[component];
  if (!componentConfig) {
    return `Vue.use(${component})`;
  }
  const { use, prototype } = componentConfig;
  const importStatements = [];
  if (use) {
    importStatements.push(`Vue.use(${use});`);
  }
  if (prototype) {
    const prototypeStatements = Object.entries(prototype).map(
      ([key, value]) => `Vue.prototype.$${key} = ${value};`
    );
    importStatements.push(...prototypeStatements);
  }
  return importStatements.join("\n");
};
var setGeneratorContent = (vueComponents) => {
  const importStatement = `import { ${Array.from(
    vueComponents
  ).join()} } from "element-ui"`;
  const componentsList = Array.from(vueComponents).map(handleSpecialComponents);
  let fileContent = `
    ${importStatement}
    import Vue from "vue"
    
    // \u5168\u5C40\u6309\u9700\u5BFC\u5165\u7684\u7EC4\u4EF6\u5217\u8868
    ${componentsList.join("\n")}
  `;
  return fileContent;
};

// src/main.ts
var scanProjectFiles = async () => {
  const options2 = getOptions();
  step("scanning files...");
  const importedComponents = getImportedComponents();
  const vueFiles = getVueFiles(getEntryPath());
  const vueComponents = /* @__PURE__ */ new Set();
  if (options2.resolvers === "element-ui") {
    vueFiles.forEach((file) => {
      const componentsSet = scanComponents(file);
      for (const component of componentsSet) {
        vueComponents.add(component);
      }
    });
  }
  let hasComponentChanged = vueComponents.size !== importedComponents.size;
  if (!hasComponentChanged) {
    for (const component of vueComponents) {
      if (!importedComponents.has(component)) {
        hasComponentChanged = true;
        break;
      }
    }
  }
  if (!hasComponentChanged) {
    step("no update required");
    return;
  }
  await generateAutoImportFile(vueComponents);
};
var generateAutoImportFile = async (vueComponents) => {
  const options2 = getOptions();
  step(`generating ${options2.output}...`);
  const outputPath = getOutputPath();
  let fileContent = "";
  if (options2.resolvers === "element-ui") {
    fileContent = setGeneratorContent(vueComponents);
  }
  const prettier = __require("prettier");
  fileContent = prettier.format(fileContent, {
    parser: "babel"
  });
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  } else {
    const targetDir = path.dirname(outputPath);
    if (targetDir !== projectPath) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
  }
  fs.writeFileSync(outputPath, fileContent);
  step(`${options2.output} genarated!`);
};

// src/plugin/index.ts
var AutoImportPlugin = class {
  #options;
  constructor(options2) {
    this.#options = Object.assign({}, optionsDefault, options2);
  }
  async apply(compiler) {
    await setOptions(this.#options);
    compiler.hooks.beforeCompile.tapAsync(
      AutoImportPlugin.name,
      (_compiler, callback) => {
        scanProjectFiles().then(() => {
          callback();
        }).catch((err) => {
          callback(err);
        });
      }
    );
  }
};
var plugin_default = AutoImportPlugin;
export {
  plugin_default as default
};
