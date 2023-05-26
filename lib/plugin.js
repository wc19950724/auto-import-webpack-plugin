'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var chunk3NPOOIY2_js = require('./chunk-3NPOOIY2.js');

chunk3NPOOIY2_js.o();chunk3NPOOIY2_js.l();var t,r=class{constructor(o){chunk3NPOOIY2_js.d(this,t,void 0);chunk3NPOOIY2_js.e(this,t,Object.assign({},chunk3NPOOIY2_js.i,o));}apply(o){o.options.mode==="development"||o.options.optimization.nodeEnv==="development"?o.hooks.watchRun.tapAsync(r.name,(l,s)=>chunk3NPOOIY2_js.f(this,null,function*(){try{yield chunk3NPOOIY2_js.j(chunk3NPOOIY2_js.c(this,t)),yield chunk3NPOOIY2_js.m(),s();}catch(a){throw a}})):o.hooks.beforeRun.tapAsync(r.name,(l,s)=>chunk3NPOOIY2_js.f(this,null,function*(){try{yield chunk3NPOOIY2_js.j(chunk3NPOOIY2_js.c(this,t)),yield chunk3NPOOIY2_js.m(),s();}catch(a){throw a}}));}},f=r;t=new WeakMap;

exports.AutoImportPlugin = f;
exports.default = f;
