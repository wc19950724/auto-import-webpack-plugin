import { q, n, d, e, k, f as f$1, l, c, o } from './chunk-CCFJXVJB.mjs';

q();n();var t,r=class{constructor(o){d(this,t,void 0);e(this,t,Object.assign({},k,o));}apply(o$1){o$1.options.mode==="development"||o$1.options.optimization.nodeEnv==="development"?o$1.hooks.watchRun.tapAsync(r.name,(l$1,s)=>f$1(this,null,function*(){try{yield l(c(this,t)),yield o(),s();}catch(a){throw a}})):o$1.hooks.beforeRun.tapAsync(r.name,(l$1,s)=>f$1(this,null,function*(){try{yield l(c(this,t)),yield o(),s();}catch(a){throw a}}));}},f=r;t=new WeakMap;

export { f as AutoImportPlugin, f as default };
