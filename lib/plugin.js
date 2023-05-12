#!/usr/bin/env node
'use strict';

var node_fs = require('node:fs');
var node_path = require('node:path');
var eslint = require('eslint');
var prettier = require('prettier');
var require$$0 = require('node:process');
var require$$1 = require('node:os');
var require$$2 = require('node:tty');

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

// A simple implementation of make-array
function makeArray (subject) {
  return Array.isArray(subject)
    ? subject
    : [subject]
}

const EMPTY = '';
const SPACE = ' ';
const ESCAPE = '\\';
const REGEX_TEST_BLANK_LINE = /^\s+$/;
const REGEX_INVALID_TRAILING_BACKSLASH = /(?:[^\\]|^)\\$/;
const REGEX_REPLACE_LEADING_EXCAPED_EXCLAMATION = /^\\!/;
const REGEX_REPLACE_LEADING_EXCAPED_HASH = /^\\#/;
const REGEX_SPLITALL_CRLF = /\r?\n/g;
// /foo,
// ./foo,
// ../foo,
// .
// ..
const REGEX_TEST_INVALID_PATH = /^\.*\/|^\.+$/;

const SLASH = '/';

// Do not use ternary expression here, since "istanbul ignore next" is buggy
let TMP_KEY_IGNORE = 'node-ignore';
/* istanbul ignore else */
if (typeof Symbol !== 'undefined') {
  TMP_KEY_IGNORE = Symbol.for('node-ignore');
}
const KEY_IGNORE = TMP_KEY_IGNORE;

const define = (object, key, value) =>
  Object.defineProperty(object, key, {value});

const REGEX_REGEXP_RANGE = /([0-z])-([0-z])/g;

const RETURN_FALSE = () => false;

// Sanitize the range of a regular expression
// The cases are complicated, see test cases for details
const sanitizeRange = range => range.replace(
  REGEX_REGEXP_RANGE,
  (match, from, to) => from.charCodeAt(0) <= to.charCodeAt(0)
    ? match
    // Invalid range (out of order) which is ok for gitignore rules but
    //   fatal for JavaScript regular expression, so eliminate it.
    : EMPTY
);

// See fixtures #59
const cleanRangeBackSlash = slashes => {
  const {length} = slashes;
  return slashes.slice(0, length - length % 2)
};

// > If the pattern ends with a slash,
// > it is removed for the purpose of the following description,
// > but it would only find a match with a directory.
// > In other words, foo/ will match a directory foo and paths underneath it,
// > but will not match a regular file or a symbolic link foo
// >  (this is consistent with the way how pathspec works in general in Git).
// '`foo/`' will not match regular file '`foo`' or symbolic link '`foo`'
// -> ignore-rules will not deal with it, because it costs extra `fs.stat` call
//      you could use option `mark: true` with `glob`

// '`foo/`' should not continue with the '`..`'
const REPLACERS = [

  // > Trailing spaces are ignored unless they are quoted with backslash ("\")
  [
    // (a\ ) -> (a )
    // (a  ) -> (a)
    // (a \ ) -> (a  )
    /\\?\s+$/,
    match => match.indexOf('\\') === 0
      ? SPACE
      : EMPTY
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
    match => `\\${match}`
  ],

  [
    // > a question mark (?) matches a single character
    /(?!\\)\?/g,
    () => '[^/]'
  ],

  // leading slash
  [

    // > A leading slash matches the beginning of the pathname.
    // > For example, "/*.c" matches "cat-file.c" but not "mozilla-sha1/sha1.c".
    // A leading slash matches the beginning of the pathname
    /^\//,
    () => '^'
  ],

  // replace special metacharacter slash after the leading slash
  [
    /\//g,
    () => '\\/'
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
    () => '^(?:.*\\/)?'
  ],

  // starting
  [
    // there will be no leading '/'
    //   (which has been replaced by section "leading slash")
    // If starts with '**', adding a '^' to the regular expression also works
    /^(?=[^^])/,
    function startingReplacer () {
      // If has a slash `/` at the beginning or middle
      return !/\/(?!$)/.test(this)
        // > Prior to 2.22.1
        // > If the pattern does not contain a slash /,
        // >   Git treats it as a shell glob pattern
        // Actually, if there is only a trailing slash,
        //   git also treats it as a shell glob pattern

        // After 2.22.1 (compatible but clearer)
        // > If there is a separator at the beginning or middle (or both)
        // > of the pattern, then the pattern is relative to the directory
        // > level of the particular .gitignore file itself.
        // > Otherwise the pattern may also match at any level below
        // > the .gitignore level.
        ? '(?:^|\\/)'

        // > Otherwise, Git treats the pattern as a shell glob suitable for
        // >   consumption by fnmatch(3)
        : '^'
    }
  ],

  // two globstars
  [
    // Use lookahead assertions so that we could match more than one `'/**'`
    /\\\/\\\*\\\*(?=\\\/|$)/g,

    // Zero, one or several directories
    // should not use '*', or it will be replaced by the next replacer

    // Check if it is not the last `'/**'`
    (_, index, str) => index + 6 < str.length

      // case: /**/
      // > A slash followed by two consecutive asterisks then a slash matches
      // >   zero or more directories.
      // > For example, "a/**/b" matches "a/b", "a/x/b", "a/x/y/b" and so on.
      // '/**/'
      ? '(?:\\/[^\\/]+)*'

      // case: /**
      // > A trailing `"/**"` matches everything inside.

      // #21: everything inside but it should not include the current folder
      : '\\/.+'
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
      // 1.
      // > An asterisk "*" matches anything except a slash.
      // 2.
      // > Other consecutive asterisks are considered regular asterisks
      // > and will match according to the previous rules.
      const unescaped = p2.replace(/\\\*/g, '[^\\/]*');
      return p1 + unescaped
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
    (match, leadEscape, range, endEscape, close) => leadEscape === ESCAPE
      // '\\[bar]' -> '\\\\[bar\\]'
      ? `\\[${range}${cleanRangeBackSlash(endEscape)}${close}`
      : close === ']'
        ? endEscape.length % 2 === 0
          // A normal case, and it is a range notation
          // '[bar]'
          // '[bar\\\\]'
          ? `[${sanitizeRange(range)}${endEscape}]`
          // Invalid range notaton
          // '[bar\\]' -> '[bar\\\\]'
          : '[]'
        : '[]'
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
    match => /\/$/.test(match)
      // foo/ will not match 'foo'
      ? `${match}$`
      // foo matches 'foo' and 'foo/'
      : `${match}(?=$|\\/$)`
  ],

  // trailing wildcard
  [
    /(\^|\\\/)?\\\*$/,
    (_, p1) => {
      const prefix = p1
        // '\^':
        // '/*' does not match EMPTY
        // '/*' does not match everything

        // '\\\/':
        // 'abc/*' does not match 'abc/'
        ? `${p1}[^/]+`

        // 'a*' matches 'a'
        // 'a*' matches 'aa'
        : '[^/]*';

      return `${prefix}(?=$|\\/$)`
    }
  ],
];

// A simple cache, because an ignore rule only has only one certain meaning
const regexCache = Object.create(null);

// @param {pattern}
const makeRegex = (pattern, ignoreCase) => {
  let source = regexCache[pattern];

  if (!source) {
    source = REPLACERS.reduce(
      (prev, current) => prev.replace(current[0], current[1].bind(pattern)),
      pattern
    );
    regexCache[pattern] = source;
  }

  return ignoreCase
    ? new RegExp(source, 'i')
    : new RegExp(source)
};

const isString = subject => typeof subject === 'string';

// > A blank line matches no files, so it can serve as a separator for readability.
const checkPattern = pattern => pattern
  && isString(pattern)
  && !REGEX_TEST_BLANK_LINE.test(pattern)
  && !REGEX_INVALID_TRAILING_BACKSLASH.test(pattern)

  // > A line starting with # serves as a comment.
  && pattern.indexOf('#') !== 0;

const splitPattern = pattern => pattern.split(REGEX_SPLITALL_CRLF);

class IgnoreRule {
  constructor (
    origin,
    pattern,
    negative,
    regex
  ) {
    this.origin = origin;
    this.pattern = pattern;
    this.negative = negative;
    this.regex = regex;
  }
}

const createRule = (pattern, ignoreCase) => {
  const origin = pattern;
  let negative = false;

  // > An optional prefix "!" which negates the pattern;
  if (pattern.indexOf('!') === 0) {
    negative = true;
    pattern = pattern.substr(1);
  }

  pattern = pattern
  // > Put a backslash ("\") in front of the first "!" for patterns that
  // >   begin with a literal "!", for example, `"\!important!.txt"`.
  .replace(REGEX_REPLACE_LEADING_EXCAPED_EXCLAMATION, '!')
  // > Put a backslash ("\") in front of the first hash for patterns that
  // >   begin with a hash.
  .replace(REGEX_REPLACE_LEADING_EXCAPED_HASH, '#');

  const regex = makeRegex(pattern, ignoreCase);

  return new IgnoreRule(
    origin,
    pattern,
    negative,
    regex
  )
};

const throwError = (message, Ctor) => {
  throw new Ctor(message)
};

const checkPath = (path, originalPath, doThrow) => {
  if (!isString(path)) {
    return doThrow(
      `path must be a string, but got \`${originalPath}\``,
      TypeError
    )
  }

  // We don't know if we should ignore EMPTY, so throw
  if (!path) {
    return doThrow(`path must not be empty`, TypeError)
  }

  // Check if it is a relative path
  if (checkPath.isNotRelative(path)) {
    const r = '`path.relative()`d';
    return doThrow(
      `path should be a ${r} string, but got "${originalPath}"`,
      RangeError
    )
  }

  return true
};

const isNotRelative = path => REGEX_TEST_INVALID_PATH.test(path);

checkPath.isNotRelative = isNotRelative;
checkPath.convert = p => p;

class Ignore {
  constructor ({
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

  _initCache () {
    this._ignoreCache = Object.create(null);
    this._testCache = Object.create(null);
  }

  _addPattern (pattern) {
    // #32
    if (pattern && pattern[KEY_IGNORE]) {
      this._rules = this._rules.concat(pattern._rules);
      this._added = true;
      return
    }

    if (checkPattern(pattern)) {
      const rule = createRule(pattern, this._ignoreCase);
      this._added = true;
      this._rules.push(rule);
    }
  }

  // @param {Array<string> | string | Ignore} pattern
  add (pattern) {
    this._added = false;

    makeArray(
      isString(pattern)
        ? splitPattern(pattern)
        : pattern
    ).forEach(this._addPattern, this);

    // Some rules have just added to the ignore,
    // making the behavior changed.
    if (this._added) {
      this._initCache();
    }

    return this
  }

  // legacy
  addPattern (pattern) {
    return this.add(pattern)
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
  _testOne (path, checkUnignored) {
    let ignored = false;
    let unignored = false;

    this._rules.forEach(rule => {
      const {negative} = rule;
      if (
        unignored === negative && ignored !== unignored
        || negative && !ignored && !unignored && !checkUnignored
      ) {
        return
      }

      const matched = rule.regex.test(path);

      if (matched) {
        ignored = !negative;
        unignored = negative;
      }
    });

    return {
      ignored,
      unignored
    }
  }

  // @returns {TestResult}
  _test (originalPath, cache, checkUnignored, slices) {
    const path = originalPath
      // Supports nullable path
      && checkPath.convert(originalPath);

    checkPath(
      path,
      originalPath,
      this._allowRelativePaths
        ? RETURN_FALSE
        : throwError
    );

    return this._t(path, cache, checkUnignored, slices)
  }

  _t (path, cache, checkUnignored, slices) {
    if (path in cache) {
      return cache[path]
    }

    if (!slices) {
      // path/to/a.js
      // ['path', 'to', 'a.js']
      slices = path.split(SLASH);
    }

    slices.pop();

    // If the path has no parent directory, just test it
    if (!slices.length) {
      return cache[path] = this._testOne(path, checkUnignored)
    }

    const parent = this._t(
      slices.join(SLASH) + SLASH,
      cache,
      checkUnignored,
      slices
    );

    // If the path contains a parent directory, check the parent first
    return cache[path] = parent.ignored
      // > It is not possible to re-include a file if a parent directory of
      // >   that file is excluded.
      ? parent
      : this._testOne(path, checkUnignored)
  }

  ignores (path) {
    return this._test(path, this._ignoreCache, false).ignored
  }

  createFilter () {
    return path => !this.ignores(path)
  }

  filter (paths) {
    return makeArray(paths).filter(this.createFilter())
  }

  // @returns {TestResult}
  test (path) {
    return this._test(path, this._testCache, true)
  }
}

const factory = options => new Ignore(options);

const isPathValid = path =>
  checkPath(path && checkPath.convert(path), path, RETURN_FALSE);

factory.isPathValid = isPathValid;

// Fixes typescript
factory.default = factory;

var ignore = factory;

// Windows
// --------------------------------------------------------------
/* istanbul ignore if */
if (
  // Detect `process` so that it can run in browsers.
  typeof process !== 'undefined'
  && (
    process.env && process.env.IGNORE_TEST_WIN32
    || process.platform === 'win32'
  )
) {
  /* eslint no-control-regex: "off" */
  const makePosix = str => /^\\\\\?\\/.test(str)
  || /["<>|\u0000-\u001F]+/u.test(str)
    ? str
    : str.replace(/\\/g, '/');

  checkPath.convert = makePosix;

  // 'C:\\foo'     <- 'C:\\foo' has been converted to 'C:/'
  // 'd:\\foo'
  const REGIX_IS_WINDOWS_PATH_ABSOLUTE = /^[a-z]:\//i;
  checkPath.isNotRelative = path =>
    REGIX_IS_WINDOWS_PATH_ABSOLUTE.test(path)
    || isNotRelative(path);
}

var ignore$1 = /*@__PURE__*/getDefaultExportFromCjs(ignore);

/** 项目根路径 */
const projectPath = process.cwd();
/** 忽略文件 */
const ignoreFile = ignore$1().add("node_modules");
const optionsDefault = {
    entry: "/",
    output: "auto-import.js",
    resolvers: "element-ui",
    ignorePath: ".generatorignore",
    logLevel: "info",
    check: true,
};
let options = optionsDefault;
/** 设置配置选项 */
const setOptions = async (params) => {
    options = Object.assign({}, options, params);
    const projectIgnorePath = node_path.resolve(projectPath, options.ignorePath);
    if (node_fs.existsSync(projectIgnorePath)) {
        const ignoreContext = node_fs.readFileSync(projectIgnorePath)
            .toString()
            .replace(/\/$/gm, "");
        ignoreFile.add(ignoreContext);
    }
};
/** 获取配置选项 */
const getOptions = () => options;

var source = {};

function ownKeys(object,enumerableOnly){var keys=Object.keys(object);if(Object.getOwnPropertySymbols){var symbols=Object.getOwnPropertySymbols(object);enumerableOnly&&(symbols=symbols.filter(function(sym){return Object.getOwnPropertyDescriptor(object,sym).enumerable})),keys.push.apply(keys,symbols);}return keys}function _objectSpread(target){for(var i=1;i<arguments.length;i++){var source=null!=arguments[i]?arguments[i]:{};i%2?ownKeys(Object(source),!0).forEach(function(key){_defineProperty(target,key,source[key]);}):Object.getOwnPropertyDescriptors?Object.defineProperties(target,Object.getOwnPropertyDescriptors(source)):ownKeys(Object(source)).forEach(function(key){Object.defineProperty(target,key,Object.getOwnPropertyDescriptor(source,key));});}return target}function _defineProperty(obj,key,value){key=_toPropertyKey(key);if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj}function _toPropertyKey(arg){var key=_toPrimitive(arg,"string");return typeof key==="symbol"?key:String(key)}function _toPrimitive(input,hint){if(typeof input!=="object"||input===null)return input;var prim=input[Symbol.toPrimitive];if(prim!==undefined){var res=prim.call(input,hint||"default");if(typeof res!=="object")return res;throw new TypeError("@@toPrimitive must return a primitive value.")}return (hint==="string"?String:Number)(input)}Object.defineProperty(source,"__esModule",{value:true});var process$1=require$$0;var os=require$$1;var tty=require$$2;const ANSI_BACKGROUND_OFFSET=10;const wrapAnsi16=(offset=0)=>code=>`\u001B[${code+offset}m`;const wrapAnsi256=(offset=0)=>code=>`\u001B[${38+offset};5;${code}m`;const wrapAnsi16m=(offset=0)=>(red,green,blue)=>`\u001B[${38+offset};2;${red};${green};${blue}m`;const styles$1={modifier:{reset:[0,0],// 21 isn't widely supported and 22 does the same thing
bold:[1,22],dim:[2,22],italic:[3,23],underline:[4,24],overline:[53,55],inverse:[7,27],hidden:[8,28],strikethrough:[9,29]},color:{black:[30,39],red:[31,39],green:[32,39],yellow:[33,39],blue:[34,39],magenta:[35,39],cyan:[36,39],white:[37,39],// Bright color
blackBright:[90,39],gray:[90,39],// Alias of `blackBright`
grey:[90,39],// Alias of `blackBright`
redBright:[91,39],greenBright:[92,39],yellowBright:[93,39],blueBright:[94,39],magentaBright:[95,39],cyanBright:[96,39],whiteBright:[97,39]},bgColor:{bgBlack:[40,49],bgRed:[41,49],bgGreen:[42,49],bgYellow:[43,49],bgBlue:[44,49],bgMagenta:[45,49],bgCyan:[46,49],bgWhite:[47,49],// Bright color
bgBlackBright:[100,49],bgGray:[100,49],// Alias of `bgBlackBright`
bgGrey:[100,49],// Alias of `bgBlackBright`
bgRedBright:[101,49],bgGreenBright:[102,49],bgYellowBright:[103,49],bgBlueBright:[104,49],bgMagentaBright:[105,49],bgCyanBright:[106,49],bgWhiteBright:[107,49]}};const modifierNames=Object.keys(styles$1.modifier);const foregroundColorNames=Object.keys(styles$1.color);const backgroundColorNames=Object.keys(styles$1.bgColor);const colorNames=[...foregroundColorNames,...backgroundColorNames];function assembleStyles(){const codes=new Map;for(const[groupName,group]of Object.entries(styles$1)){for(const[styleName,style]of Object.entries(group)){styles$1[styleName]={open:`\u001B[${style[0]}m`,close:`\u001B[${style[1]}m`};group[styleName]=styles$1[styleName];codes.set(style[0],style[1]);}Object.defineProperty(styles$1,groupName,{value:group,enumerable:false});}Object.defineProperty(styles$1,"codes",{value:codes,enumerable:false});styles$1.color.close="\x1B[39m";styles$1.bgColor.close="\x1B[49m";styles$1.color.ansi=wrapAnsi16();styles$1.color.ansi256=wrapAnsi256();styles$1.color.ansi16m=wrapAnsi16m();styles$1.bgColor.ansi=wrapAnsi16(ANSI_BACKGROUND_OFFSET);styles$1.bgColor.ansi256=wrapAnsi256(ANSI_BACKGROUND_OFFSET);styles$1.bgColor.ansi16m=wrapAnsi16m(ANSI_BACKGROUND_OFFSET);// From https://github.com/Qix-/color-convert/blob/3f0e0d4e92e235796ccb17f6e85c72094a651f49/conversions.js
Object.defineProperties(styles$1,{rgbToAnsi256:{value(red,green,blue){// We use the extended greyscale palette here, with the exception of
// black and white. normal palette only has 4 greyscale shades.
if(red===green&&green===blue){if(red<8){return 16}if(red>248){return 231}return Math.round((red-8)/247*24)+232}return 16+36*Math.round(red/255*5)+6*Math.round(green/255*5)+Math.round(blue/255*5)},enumerable:false},hexToRgb:{value(hex){const matches=/[a-f\d]{6}|[a-f\d]{3}/i.exec(hex.toString(16));if(!matches){return [0,0,0]}let[colorString]=matches;if(colorString.length===3){colorString=[...colorString].map(character=>character+character).join("");}const integer=Number.parseInt(colorString,16);return [/* eslint-disable no-bitwise */integer>>16&255,integer>>8&255,integer&255/* eslint-enable no-bitwise */]},enumerable:false},hexToAnsi256:{value:hex=>styles$1.rgbToAnsi256(...styles$1.hexToRgb(hex)),enumerable:false},ansi256ToAnsi:{value(code){if(code<8){return 30+code}if(code<16){return 90+(code-8)}let red;let green;let blue;if(code>=232){red=((code-232)*10+8)/255;green=red;blue=red;}else {code-=16;const remainder=code%36;red=Math.floor(code/36)/5;green=Math.floor(remainder/6)/5;blue=remainder%6/5;}const value=Math.max(red,green,blue)*2;if(value===0){return 30}// eslint-disable-next-line no-bitwise
let result=30+(Math.round(blue)<<2|Math.round(green)<<1|Math.round(red));if(value===2){result+=60;}return result},enumerable:false},rgbToAnsi:{value:(red,green,blue)=>styles$1.ansi256ToAnsi(styles$1.rgbToAnsi256(red,green,blue)),enumerable:false},hexToAnsi:{value:hex=>styles$1.ansi256ToAnsi(styles$1.hexToAnsi256(hex)),enumerable:false}});return styles$1}const ansiStyles=assembleStyles();// From: https://github.com/sindresorhus/has-flag/blob/main/index.js
function hasFlag(flag,argv=globalThis.Deno?globalThis.Deno.args:process$1.argv){const prefix=flag.startsWith("-")?"":flag.length===1?"-":"--";const position=argv.indexOf(prefix+flag);const terminatorPosition=argv.indexOf("--");return position!==-1&&(terminatorPosition===-1||position<terminatorPosition)}const{env}=process$1;let flagForceColor;if(hasFlag("no-color")||hasFlag("no-colors")||hasFlag("color=false")||hasFlag("color=never")){flagForceColor=0;}else if(hasFlag("color")||hasFlag("colors")||hasFlag("color=true")||hasFlag("color=always")){flagForceColor=1;}function envForceColor(){if("FORCE_COLOR"in env){if(env.FORCE_COLOR==="true"){return 1}if(env.FORCE_COLOR==="false"){return 0}return env.FORCE_COLOR.length===0?1:Math.min(Number.parseInt(env.FORCE_COLOR,10),3)}}function translateLevel(level){if(level===0){return false}return {level,hasBasic:true,has256:level>=2,has16m:level>=3}}function _supportsColor(haveStream,{streamIsTTY,sniffFlags=true}={}){const noFlagForceColor=envForceColor();if(noFlagForceColor!==undefined){flagForceColor=noFlagForceColor;}const forceColor=sniffFlags?flagForceColor:noFlagForceColor;if(forceColor===0){return 0}if(sniffFlags){if(hasFlag("color=16m")||hasFlag("color=full")||hasFlag("color=truecolor")){return 3}if(hasFlag("color=256")){return 2}}// Check for Azure DevOps pipelines.
// Has to be above the `!streamIsTTY` check.
if("TF_BUILD"in env&&"AGENT_NAME"in env){return 1}if(haveStream&&!streamIsTTY&&forceColor===undefined){return 0}const min=forceColor||0;if(env.TERM==="dumb"){return min}if(process$1.platform==="win32"){// Windows 10 build 10586 is the first Windows release that supports 256 colors.
// Windows 10 build 14931 is the first release that supports 16m/TrueColor.
const osRelease=os.release().split(".");if(Number(osRelease[0])>=10&&Number(osRelease[2])>=10586){return Number(osRelease[2])>=14931?3:2}return 1}if("CI"in env){if("GITHUB_ACTIONS"in env){return 3}if(["TRAVIS","CIRCLECI","APPVEYOR","GITLAB_CI","BUILDKITE","DRONE"].some(sign=>sign in env)||env.CI_NAME==="codeship"){return 1}return min}if("TEAMCITY_VERSION"in env){return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION)?1:0}if(env.COLORTERM==="truecolor"){return 3}if(env.TERM==="xterm-kitty"){return 3}if("TERM_PROGRAM"in env){const version=Number.parseInt((env.TERM_PROGRAM_VERSION||"").split(".")[0],10);switch(env.TERM_PROGRAM){case"iTerm.app":{return version>=3?3:2}case"Apple_Terminal":{return 2}// No default
}}if(/-256(color)?$/i.test(env.TERM)){return 2}if(/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)){return 1}if("COLORTERM"in env){return 1}return min}function createSupportsColor(stream,options={}){const level=_supportsColor(stream,_objectSpread({streamIsTTY:stream&&stream.isTTY},options));return translateLevel(level)}const supportsColor={stdout:createSupportsColor({isTTY:tty.isatty(1)}),stderr:createSupportsColor({isTTY:tty.isatty(2)})};// TODO: When targeting Node.js 16, use `String.prototype.replaceAll`.
function stringReplaceAll(string,substring,replacer){let index=string.indexOf(substring);if(index===-1){return string}const substringLength=substring.length;let endIndex=0;let returnValue="";do{returnValue+=string.slice(endIndex,index)+substring+replacer;endIndex=index+substringLength;index=string.indexOf(substring,endIndex);}while(index!==-1);returnValue+=string.slice(endIndex);return returnValue}function stringEncaseCRLFWithFirstIndex(string,prefix,postfix,index){let endIndex=0;let returnValue="";do{const gotCR=string[index-1]==="\r";returnValue+=string.slice(endIndex,gotCR?index-1:index)+prefix+(gotCR?"\r\n":"\n")+postfix;endIndex=index+1;index=string.indexOf("\n",endIndex);}while(index!==-1);returnValue+=string.slice(endIndex);return returnValue}const{stdout:stdoutColor,stderr:stderrColor}=supportsColor;const GENERATOR=Symbol("GENERATOR");const STYLER=Symbol("STYLER");const IS_EMPTY=Symbol("IS_EMPTY");// `supportsColor.level` → `ansiStyles.color[name]` mapping
const levelMapping=["ansi","ansi","ansi256","ansi16m"];const styles=Object.create(null);const applyOptions=(object,options={})=>{if(options.level&&!(Number.isInteger(options.level)&&options.level>=0&&options.level<=3)){throw new Error("The `level` option should be an integer from 0 to 3")}// Detect level if not set manually
const colorLevel=stdoutColor?stdoutColor.level:0;object.level=options.level===undefined?colorLevel:options.level;};class Chalk{constructor(options){// eslint-disable-next-line no-constructor-return
return chalkFactory(options)}}const chalkFactory=options=>{const chalk=(...strings)=>strings.join(" ");applyOptions(chalk,options);Object.setPrototypeOf(chalk,createChalk.prototype);return chalk};function createChalk(options){return chalkFactory(options)}Object.setPrototypeOf(createChalk.prototype,Function.prototype);for(const[styleName,style]of Object.entries(ansiStyles)){styles[styleName]={get(){const builder=createBuilder(this,createStyler(style.open,style.close,this[STYLER]),this[IS_EMPTY]);Object.defineProperty(this,styleName,{value:builder});return builder}};}styles.visible={get(){const builder=createBuilder(this,this[STYLER],true);Object.defineProperty(this,"visible",{value:builder});return builder}};const getModelAnsi=(model,level,type,...arguments_)=>{if(model==="rgb"){if(level==="ansi16m"){return ansiStyles[type].ansi16m(...arguments_)}if(level==="ansi256"){return ansiStyles[type].ansi256(ansiStyles.rgbToAnsi256(...arguments_))}return ansiStyles[type].ansi(ansiStyles.rgbToAnsi(...arguments_))}if(model==="hex"){return getModelAnsi("rgb",level,type,...ansiStyles.hexToRgb(...arguments_))}return ansiStyles[type][model](...arguments_)};const usedModels=["rgb","hex","ansi256"];for(const model of usedModels){styles[model]={get(){const{level}=this;return function(...arguments_){const styler=createStyler(getModelAnsi(model,levelMapping[level],"color",...arguments_),ansiStyles.color.close,this[STYLER]);return createBuilder(this,styler,this[IS_EMPTY])}}};const bgModel="bg"+model[0].toUpperCase()+model.slice(1);styles[bgModel]={get(){const{level}=this;return function(...arguments_){const styler=createStyler(getModelAnsi(model,levelMapping[level],"bgColor",...arguments_),ansiStyles.bgColor.close,this[STYLER]);return createBuilder(this,styler,this[IS_EMPTY])}}};}const proto=Object.defineProperties(()=>{},_objectSpread(_objectSpread({},styles),{},{level:{enumerable:true,get(){return this[GENERATOR].level},set(level){this[GENERATOR].level=level;}}}));const createStyler=(open,close,parent)=>{let openAll;let closeAll;if(parent===undefined){openAll=open;closeAll=close;}else {openAll=parent.openAll+open;closeAll=close+parent.closeAll;}return {open,close,openAll,closeAll,parent}};const createBuilder=(self,_styler,_isEmpty)=>{// Single argument is hot path, implicit coercion is faster than anything
// eslint-disable-next-line no-implicit-coercion
const builder=(...arguments_)=>applyStyle(builder,arguments_.length===1?""+arguments_[0]:arguments_.join(" "));// We alter the prototype because we must return a function, but there is
// no way to create a function with a different prototype
Object.setPrototypeOf(builder,proto);builder[GENERATOR]=self;builder[STYLER]=_styler;builder[IS_EMPTY]=_isEmpty;return builder};const applyStyle=(self,string)=>{if(self.level<=0||!string){return self[IS_EMPTY]?"":string}let styler=self[STYLER];if(styler===undefined){return string}const{openAll,closeAll}=styler;if(string.includes("\x1B")){while(styler!==undefined){// Replace any instances already present with a re-opening code
// otherwise only the part of the string until said closing code
// will be colored, and the rest will simply be 'plain'.
string=stringReplaceAll(string,styler.close,styler.open);styler=styler.parent;}}// We can move both next actions out of loop, because remaining actions in loop won't have
// any/visible effect on parts we add here. Close the styling before a linebreak and reopen
// after next line to fix a bleed issue on macOS: https://github.com/chalk/chalk/pull/92
const lfIndex=string.indexOf("\n");if(lfIndex!==-1){string=stringEncaseCRLFWithFirstIndex(string,closeAll,openAll,lfIndex);}return openAll+string+closeAll};Object.defineProperties(createChalk.prototype,styles);const chalk=createChalk();const chalkStderr=createChalk({level:stderrColor?stderrColor.level:0});source.Chalk=Chalk;source.backgroundColorNames=backgroundColorNames;source.backgroundColors=backgroundColorNames;source.chalkStderr=chalkStderr;source.colorNames=colorNames;source.colors=colorNames;var _default = source.default=chalk;source.foregroundColorNames=foregroundColorNames;source.foregroundColors=foregroundColorNames;source.modifierNames=modifierNames;source.modifiers=modifierNames;source.supportsColor=stdoutColor;source.supportsColorStderr=stderrColor;

function error(...args) {
    const { logLevel } = getOptions();
    if (["error", "warn", "info"].indexOf(logLevel) > -1) {
        console.log(_default.redBright(...args));
    }
}
function warn(...args) {
    const { logLevel } = getOptions();
    if (["warn", "info"].indexOf(logLevel) > -1) {
        console.log(_default.yellowBright(...args));
    }
}
function info(...args) {
    const { logLevel } = getOptions();
    if (["info"].indexOf(logLevel) > -1) {
        console.log(_default.blueBright(...args));
    }
}
function success(...args) {
    const { logLevel } = getOptions();
    if (["info"].indexOf(logLevel) > -1) {
        console.log(_default.greenBright(...args));
    }
}
function log(...args) {
    const { logLevel } = getOptions();
    if (["info"].indexOf(logLevel) > -1) {
        console.log(...args);
    }
}
function path(...args) {
    const { logLevel } = getOptions();
    if (["info"].indexOf(logLevel) > -1) {
        console.log(_default.gray(...args));
    }
}
var logger = {
    error,
    warn,
    info,
    success,
    log,
    path,
};

/** 步骤日志 */
const step = (msg) => logger.success(`\n${msg}`);
/** 首字母转大写 */
const toPascalCase = (str) => {
    return str.replace(/^\w/, (c) => c.toUpperCase());
};
/** 扫描入口路径 */
const getEntryPath = () => {
    const options = getOptions();
    return node_path.resolve(projectPath, (options.entry || "").replace(/^\//, ""));
};
/** 输出文件路径 */
const getOutputPath = () => {
    const options = getOptions();
    return node_path.resolve(projectPath, options.output);
};
/** 获取导入组件Set */
const getImportedComponents = () => {
    const outputPath = getOutputPath();
    const importedComponents = new Set();
    if (node_fs.existsSync(outputPath)) {
        const outputContent = node_fs.readFileSync(outputPath, "utf8");
        // 使用正则表达式匹配 import 语句并提取需要的内容
        const importPattern = /import\s*{([^}]*)}\s*from\s*['"]([^'"]*)['"]/g;
        const matches = outputContent.matchAll(importPattern);
        // 遍历匹配结果
        for (const match of matches) {
            const componentNames = match[1].split(",").map((name) => name.trim());
            // 判断每个组件是否存在，并添加到 importedComponents 集合中
            componentNames.forEach((componentName) => {
                importedComponents.add(componentName);
            });
        }
    }
    return importedComponents;
};
/** 获取vue文件 */
const getVueFiles = (directory) => {
    const files = node_fs.readdirSync(directory, { withFileTypes: true });
    const vueFiles = [];
    files.forEach((file) => {
        if (ignoreFile.ignores(file.name))
            return;
        const filePath = node_path.resolve(directory, file.name);
        const stat = node_fs.statSync(filePath);
        if (stat.isDirectory()) {
            vueFiles.push(...getVueFiles(filePath));
        }
        else if (stat.isFile() && file.name.endsWith(".vue")) {
            logger.path(filePath);
            vueFiles.push(filePath);
        }
    });
    return vueFiles;
};

const specialComponents = {
    Loading: {
        use: "Loading.directive",
        prototype: {
            loading: "Loading.service",
        },
    },
    MessageBox: {
        prototype: {
            msgbox: "MessageBox",
            alert: "MessageBox.alert",
            confirm: "MessageBox.confirm",
            prompt: "MessageBox.prompt",
        },
    },
    Notification: {
        prototype: {
            notify: "Notification",
        },
    },
    Message: {
        prototype: {
            message: "Message",
        },
    },
};
const scanComponents = (file) => {
    const importedComponents = new Set();
    const fileContent = node_fs.readFileSync(file, "utf-8");
    const componentRegex = /<(?:el-|El)([^>\s]+)(?=[\s>])/g;
    const directiveRegex = /\bv-loading(?::[^=>\s]+)?/g;
    const propertyRegex = /\$(?:msgbox|alert|confirm|prompt|notify|message)/g;
    const componentMatches = fileContent.matchAll(componentRegex);
    for (const match of componentMatches) {
        const componentName = match[1];
        const importedComponent = toPascalCase(componentName);
        importedComponents.add(importedComponent);
    }
    const directiveMatches = fileContent.match(directiveRegex);
    if (directiveMatches?.length)
        importedComponents.add("Loading");
    const propertyMatches = fileContent.matchAll(propertyRegex);
    for (const match of propertyMatches) {
        const propertyName = match[0].substring(1);
        if (propertyName === "msgbox" ||
            propertyName === "alert" ||
            propertyName === "confirm" ||
            propertyName === "prompt") {
            importedComponents.add("MessageBox");
        }
        else if (propertyName === "notify") {
            importedComponents.add("Notification");
        }
        else if (propertyName === "message") {
            importedComponents.add("Message");
        }
    }
    return importedComponents;
};
const handleSpecialComponents = (component) => {
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
        const prototypeStatements = Object.entries(prototype).map(([key, value]) => `Vue.prototype.$${key} = ${value};`);
        importStatements.push(...prototypeStatements);
    }
    return importStatements.join("\n");
};
const setGeneratorContent = (importedComponents) => {
    const importStatement = `import { ${Array.from(importedComponents).join()} } from "element-ui"`;
    const componentsList = Array.from(importedComponents).map(handleSpecialComponents);
    let fileContent = `
    ${importStatement}
    import Vue from "vue"
    
    // 全局按需导入的组件列表
    ${componentsList.join("\n")}
  `;
    return fileContent;
};

// 扫描项目文件
const scanProjectFiles = async () => {
    const options = getOptions();
    step("scanning files...");
    const importedComponents = getImportedComponents();
    const vueFiles = getVueFiles(getEntryPath());
    let hasNewItems = false; // 添加一个标志位，默认为 false
    if (options.resolvers === "element-ui") {
        vueFiles.forEach((file) => {
            const componentsSet = scanComponents(file);
            const componentsArray = Array.from(componentsSet);
            const hasNewComponent = componentsArray.some((item) => !importedComponents.has(item));
            if (hasNewComponent) {
                if (!hasNewItems) {
                    hasNewItems = true; // 如果有新增组件，将标志位设置为 true
                }
                for (const component of componentsSet) {
                    importedComponents.add(component);
                }
            }
        });
    }
    if (!hasNewItems) {
        step("no update required");
        return;
    }
    await generateAutoImportFile(importedComponents);
};
// 生成文件
const generateAutoImportFile = async (importedComponents) => {
    const options = getOptions();
    step(`generating ${options.output}...`);
    const outputPath = getOutputPath();
    let fileContent = "";
    if (options.resolvers === "element-ui") {
        fileContent = setGeneratorContent(importedComponents);
    }
    try {
        step(`formatting ${options.output}...`);
        fileContent = prettier.format(fileContent, {
            parser: "babel",
        });
        if (options.check) {
            step(`checking ${options.output}...`);
            const lint = new eslint.ESLint({
                fix: true,
            });
            const [result] = await lint.lintText(fileContent);
            if (result.output) {
                fileContent = result.output;
            }
        }
    }
    catch (error) {
        logger.error(error.stack ?? error);
    }
    // 清空或删除现有的 生成文件
    if (node_fs.existsSync(outputPath)) {
        node_fs.unlinkSync(outputPath);
    }
    else {
        // 确保目标目录存在
        const targetDir = node_path.dirname(outputPath);
        if (targetDir !== projectPath) {
            node_fs.mkdirSync(targetDir, { recursive: true });
        }
    }
    node_fs.writeFileSync(outputPath, fileContent);
    step(`${options.output} genarated!`);
};

class AutoImportPlugin {
    #options;
    constructor(options) {
        this.#options = Object.assign({}, optionsDefault, options);
    }
    async apply(compiler) {
        try {
            await setOptions(this.#options);
            compiler.hooks.beforeCompile.tapAsync(AutoImportPlugin.name, (compiler, callback) => {
                // 在这里执行你的自定义脚本
                scanProjectFiles()
                    .catch((err) => {
                    logger.error(err.stack ?? err);
                })
                    .finally(callback);
            });
        }
        catch (err) {
            logger.error(err.stack ?? err);
        }
    }
}

module.exports = AutoImportPlugin;
