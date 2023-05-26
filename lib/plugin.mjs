import { o, l, d, e, i, f as f$1, j, c, m } from './chunk-AA6UPSQL.mjs';

o();l();var t,r=class{constructor(o){d(this,t,void 0);e(this,t,Object.assign({},i,o));}apply(o){o.options.mode==="development"||o.options.optimization.nodeEnv==="development"?o.hooks.watchRun.tapAsync(r.name,(l,s)=>f$1(this,null,function*(){try{yield j(c(this,t)),yield m(),s();}catch(a){throw a}})):o.hooks.beforeRun.tapAsync(r.name,(l,s)=>f$1(this,null,function*(){try{yield j(c(this,t)),yield m(),s();}catch(a){throw a}}));}},f=r;t=new WeakMap;

export { f as AutoImportPlugin, f as default };
