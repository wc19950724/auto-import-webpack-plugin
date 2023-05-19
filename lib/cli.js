"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
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

// node_modules/.pnpm/arg@5.0.2/node_modules/arg/index.js
var require_arg = __commonJS({
  "node_modules/.pnpm/arg@5.0.2/node_modules/arg/index.js"(exports, module2) {
    var flagSymbol = Symbol("arg flag");
    var ArgError = class extends Error {
      constructor(msg, code) {
        super(msg);
        this.name = "ArgError";
        this.code = code;
        Object.setPrototypeOf(this, ArgError.prototype);
      }
    };
    function arg2(opts, {
      argv = process.argv.slice(2),
      permissive = false,
      stopAtPositional = false
    } = {}) {
      if (!opts) {
        throw new ArgError(
          "argument specification object is required",
          "ARG_CONFIG_NO_SPEC"
        );
      }
      const result = { _: [] };
      const aliases = {};
      const handlers = {};
      for (const key of Object.keys(opts)) {
        if (!key) {
          throw new ArgError(
            "argument key cannot be an empty string",
            "ARG_CONFIG_EMPTY_KEY"
          );
        }
        if (key[0] !== "-") {
          throw new ArgError(
            `argument key must start with '-' but found: '${key}'`,
            "ARG_CONFIG_NONOPT_KEY"
          );
        }
        if (key.length === 1) {
          throw new ArgError(
            `argument key must have a name; singular '-' keys are not allowed: ${key}`,
            "ARG_CONFIG_NONAME_KEY"
          );
        }
        if (typeof opts[key] === "string") {
          aliases[key] = opts[key];
          continue;
        }
        let type = opts[key];
        let isFlag = false;
        if (Array.isArray(type) && type.length === 1 && typeof type[0] === "function") {
          const [fn] = type;
          type = (value, name, prev = []) => {
            prev.push(fn(value, name, prev[prev.length - 1]));
            return prev;
          };
          isFlag = fn === Boolean || fn[flagSymbol] === true;
        } else if (typeof type === "function") {
          isFlag = type === Boolean || type[flagSymbol] === true;
        } else {
          throw new ArgError(
            `type missing or not a function or valid array type: ${key}`,
            "ARG_CONFIG_VAD_TYPE"
          );
        }
        if (key[1] !== "-" && key.length > 2) {
          throw new ArgError(
            `short argument keys (with a single hyphen) must have only one character: ${key}`,
            "ARG_CONFIG_SHORTOPT_TOOLONG"
          );
        }
        handlers[key] = [type, isFlag];
      }
      for (let i = 0, len = argv.length; i < len; i++) {
        const wholeArg = argv[i];
        if (stopAtPositional && result._.length > 0) {
          result._ = result._.concat(argv.slice(i));
          break;
        }
        if (wholeArg === "--") {
          result._ = result._.concat(argv.slice(i + 1));
          break;
        }
        if (wholeArg.length > 1 && wholeArg[0] === "-") {
          const separatedArguments = wholeArg[1] === "-" || wholeArg.length === 2 ? [wholeArg] : wholeArg.slice(1).split("").map((a) => `-${a}`);
          for (let j = 0; j < separatedArguments.length; j++) {
            const arg3 = separatedArguments[j];
            const [originalArgName, argStr] = arg3[1] === "-" ? arg3.split(/=(.*)/, 2) : [arg3, void 0];
            let argName = originalArgName;
            while (argName in aliases) {
              argName = aliases[argName];
            }
            if (!(argName in handlers)) {
              if (permissive) {
                result._.push(arg3);
                continue;
              } else {
                throw new ArgError(
                  `unknown or unexpected option: ${originalArgName}`,
                  "ARG_UNKNOWN_OPTION"
                );
              }
            }
            const [type, isFlag] = handlers[argName];
            if (!isFlag && j + 1 < separatedArguments.length) {
              throw new ArgError(
                `option requires argument (but was followed by another short argument): ${originalArgName}`,
                "ARG_MISSING_REQUIRED_SHORTARG"
              );
            }
            if (isFlag) {
              result[argName] = type(true, argName, result[argName]);
            } else if (argStr === void 0) {
              if (argv.length < i + 2 || argv[i + 1].length > 1 && argv[i + 1][0] === "-" && !(argv[i + 1].match(/^-?\d*(\.(?=\d))?\d*$/) && (type === Number || // eslint-disable-next-line no-undef
              typeof BigInt !== "undefined" && type === BigInt))) {
                const extended = originalArgName === argName ? "" : ` (alias for ${argName})`;
                throw new ArgError(
                  `option requires argument: ${originalArgName}${extended}`,
                  "ARG_MISSING_REQUIRED_LONGARG"
                );
              }
              result[argName] = type(argv[i + 1], argName, result[argName]);
              ++i;
            } else {
              result[argName] = type(argStr, argName, result[argName]);
            }
          }
        } else {
          result._.push(wholeArg);
        }
      }
      return result;
    }
    arg2.flag = (fn) => {
      fn[flagSymbol] = true;
      return fn;
    };
    arg2.COUNT = arg2.flag((v, name, existingCount) => (existingCount || 0) + 1);
    arg2.ArgError = ArgError;
    module2.exports = arg2;
  }
});

// node_modules/.pnpm/picocolors@1.0.0/node_modules/picocolors/picocolors.js
var require_picocolors = __commonJS({
  "node_modules/.pnpm/picocolors@1.0.0/node_modules/picocolors/picocolors.js"(exports, module2) {
    var tty = require("tty");
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
    module2.exports = createColors();
    module2.exports.createColors = createColors;
  }
});

// node_modules/.pnpm/ignore@5.2.4/node_modules/ignore/index.js
var require_ignore = __commonJS({
  "node_modules/.pnpm/ignore@5.2.4/node_modules/ignore/index.js"(exports, module2) {
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
    var checkPath = (path3, originalPath, doThrow) => {
      if (!isString(path3)) {
        return doThrow(
          `path must be a string, but got \`${originalPath}\``,
          TypeError
        );
      }
      if (!path3) {
        return doThrow(`path must not be empty`, TypeError);
      }
      if (checkPath.isNotRelative(path3)) {
        const r = "`path.relative()`d";
        return doThrow(
          `path should be a ${r} string, but got "${originalPath}"`,
          RangeError
        );
      }
      return true;
    };
    var isNotRelative = (path3) => REGEX_TEST_INVALID_PATH.test(path3);
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
      _testOne(path3, checkUnignored) {
        let ignored = false;
        let unignored = false;
        this._rules.forEach((rule) => {
          const { negative } = rule;
          if (unignored === negative && ignored !== unignored || negative && !ignored && !unignored && !checkUnignored) {
            return;
          }
          const matched = rule.regex.test(path3);
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
        const path3 = originalPath && checkPath.convert(originalPath);
        checkPath(
          path3,
          originalPath,
          this._allowRelativePaths ? RETURN_FALSE : throwError
        );
        return this._t(path3, cache, checkUnignored, slices);
      }
      _t(path3, cache, checkUnignored, slices) {
        if (path3 in cache) {
          return cache[path3];
        }
        if (!slices) {
          slices = path3.split(SLASH);
        }
        slices.pop();
        if (!slices.length) {
          return cache[path3] = this._testOne(path3, checkUnignored);
        }
        const parent = this._t(
          slices.join(SLASH) + SLASH,
          cache,
          checkUnignored,
          slices
        );
        return cache[path3] = parent.ignored ? parent : this._testOne(path3, checkUnignored);
      }
      ignores(path3) {
        return this._test(path3, this._ignoreCache, false).ignored;
      }
      createFilter() {
        return (path3) => !this.ignores(path3);
      }
      filter(paths) {
        return makeArray(paths).filter(this.createFilter());
      }
      // @returns {TestResult}
      test(path3) {
        return this._test(path3, this._testCache, true);
      }
    };
    var factory = (options2) => new Ignore(options2);
    var isPathValid = (path3) => checkPath(path3 && checkPath.convert(path3), path3, RETURN_FALSE);
    factory.isPathValid = isPathValid;
    factory.default = factory;
    module2.exports = factory;
    if (
      // Detect `process` so that it can run in browsers.
      typeof process !== "undefined" && (process.env && process.env.IGNORE_TEST_WIN32 || process.platform === "win32")
    ) {
      const makePosix = (str) => /^\\\\\?\\/.test(str) || /["<>|\u0000-\u001F]+/u.test(str) ? str : str.replace(/\\/g, "/");
      checkPath.convert = makePosix;
      const REGIX_IS_WINDOWS_PATH_ABSOLUTE = /^[a-z]:\//i;
      checkPath.isNotRelative = (path3) => REGIX_IS_WINDOWS_PATH_ABSOLUTE.test(path3) || isNotRelative(path3);
    }
  }
});

// src/cli/index.ts
var import_node_fs5 = __toESM(require("fs"));
var import_node_path4 = __toESM(require("path"));
var import_arg = __toESM(require_arg());
var import_picocolors2 = __toESM(require_picocolors());

// src/main.ts
var import_node_fs4 = __toESM(require("fs"));
var import_node_path3 = __toESM(require("path"));

// src/library/element-ui.ts
var import_node_fs3 = require("fs");

// src/utils/cli.ts
var spec = {
  "--help": Boolean,
  "--version": Boolean,
  "--entry": String,
  "--output": String,
  "--resolvers": String,
  "--ignore-path": String,
  "--log-level": String,
  "-h": "--help",
  "-v": "--version",
  "-e": "--entry",
  "-o": "--output",
  "-r": "--resolvers",
  "-i": "--ignore-path",
  "-l": "--log-level"
};
var formatArgs = (args) => {
  const options2 = {};
  for (const key in args) {
    const value = args[key];
    switch (key) {
      case "--entry":
        options2.entry = value;
        break;
      case "--output":
        options2.output = value;
        break;
      case "--resolvers":
        options2.resolvers = value;
        break;
      case "--ignore-path":
        options2.ignorePath = value;
        break;
      case "--log-level":
        options2.logLevel = value;
        break;
      default:
        break;
    }
  }
  return options2;
};
var argsTips = (key) => {
  let tip = "";
  switch (key) {
    case "-h":
      tip = " ".repeat(7) + "cli help";
      break;
    case "-v":
      tip = " ".repeat(4) + "package version";
      break;
    case "-e":
      tip = " ".repeat(6) + "scan entry default: '.'";
      break;
    case "-o":
      tip = " ".repeat(5) + "generator file path default: 'auto-import.js'";
      break;
    case "-r":
      tip = " ".repeat(2) + "library name now only: 'element-ui'";
      break;
    case "-i":
      tip = "ignore config path default: '.generatorignore'";
      break;
    case "-l":
      tip = " ".repeat(2) + "log level default: 'info'";
      break;
    default:
      break;
  }
  return tip;
};

// src/utils/common.ts
var import_node_fs = require("fs");
var import_node_path = require("path");
var import_ignore = __toESM(require_ignore());
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
  const projectIgnorePath = (0, import_node_path.resolve)(projectPath, options.ignorePath);
  if ((0, import_node_fs.existsSync)(projectIgnorePath)) {
    const ignoreContext = (0, import_node_fs.readFileSync)(projectIgnorePath).toString().replace(/\/$/gm, "");
    ignoreFile.add(ignoreContext);
  }
};
var getOptions = () => options;
var getEntryPath = () => {
  return (0, import_node_path.resolve)(process.cwd(), options.entry);
};
var getOutputPath = () => {
  return (0, import_node_path.resolve)(projectPath, options.output);
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
var log = (...arg2) => {
  const { logLevel } = getOptions();
  if (["info"].indexOf(logLevel) > -1) {
    console.log(...arg2);
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
var import_node_fs2 = require("fs");
var import_node_path2 = require("path");
var step = (msg) => logger_exports.success(`
[AUTO] ${msg}`);
var toPascalCase = (str) => {
  return str.replace(/^\w/, (c3) => c3.toUpperCase());
};
var getImportedComponents = () => {
  const outputPath = getOutputPath();
  const importedComponents = /* @__PURE__ */ new Set();
  if ((0, import_node_fs2.existsSync)(outputPath)) {
    const outputContent = (0, import_node_fs2.readFileSync)(outputPath, "utf8");
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
  const files = (0, import_node_fs2.readdirSync)(directory, { withFileTypes: true });
  const vueFiles = [];
  files.forEach((file) => {
    if (ignoreFile.ignores(file.name))
      return;
    const filePath = (0, import_node_path2.resolve)(directory, file.name);
    const stat = (0, import_node_fs2.statSync)(filePath);
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
  const fileContent = (0, import_node_fs3.readFileSync)(file, "utf-8");
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
  const prettier = require("prettier");
  fileContent = prettier.format(fileContent, {
    parser: "babel"
  });
  if (import_node_fs4.default.existsSync(outputPath)) {
    import_node_fs4.default.unlinkSync(outputPath);
  } else {
    const targetDir = import_node_path3.default.dirname(outputPath);
    if (targetDir !== projectPath) {
      import_node_fs4.default.mkdirSync(targetDir, { recursive: true });
    }
  }
  import_node_fs4.default.writeFileSync(outputPath, fileContent);
  step(`${options2.output} genarated!`);
};
var main = async (params) => {
  await setOptions(params);
  await scanProjectFiles();
};
var main_default = main;

// src/cli/index.ts
var cli = async () => {
  const args = (0, import_arg.default)(spec, {
    permissive: true
  });
  if (args["--help"]) {
    const transformedSpec = /* @__PURE__ */ new Map();
    for (const key in spec) {
      const value = spec[key];
      const existingValue = spec[value];
      if (existingValue) {
        transformedSpec.set(`${key}, ${value}`, key);
        transformedSpec.delete(key);
        transformedSpec.delete(`${value}`);
      } else {
        transformedSpec.set(key, key);
      }
    }
    for (const [key, value] of transformedSpec) {
      logger_exports.warn(`	${key}: ${import_picocolors2.default.bold(argsTips(value))}`);
    }
  } else if (args["--version"]) {
    const pkgPath = import_node_path4.default.resolve(import_node_path4.default.dirname(__dirname), "..", "package.json");
    const pkg = JSON.parse(import_node_fs5.default.readFileSync(pkgPath, "utf-8"));
    logger_exports.success(import_picocolors2.default.bold(pkg.version));
  } else {
    const options2 = formatArgs(args);
    main_default(options2).catch((err) => {
      logger_exports.error(`${err.name}: ${err.message}`);
    }).finally(() => {
      process.exit(0);
    });
  }
};
cli().catch((err) => {
  logger_exports.error(`${err.name}: ${err.message}`);
});
