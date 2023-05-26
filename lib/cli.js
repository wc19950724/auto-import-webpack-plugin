'use strict';

var chunk3NPOOIY2_js = require('./chunk-3NPOOIY2.js');
var cac = require('cac');

var a,c=chunk3NPOOIY2_js.a(()=>{a="1.0.3";});var w=chunk3NPOOIY2_js.b(o=>{c();chunk3NPOOIY2_js.o();chunk3NPOOIY2_js.l();var j=()=>chunk3NPOOIY2_js.f(o,null,function*(){let e=cac.cac("auto-import");e.command("").option("-c, --config <filename>","config file name",{default:chunk3NPOOIY2_js.h.config}).example(`auto-import -c ${chunk3NPOOIY2_js.h.config}`).action(l=>chunk3NPOOIY2_js.f(o,null,function*(){let m=yield chunk3NPOOIY2_js.g(l);yield chunk3NPOOIY2_js.n(m).catch(p=>{chunk3NPOOIY2_js.k.error(`${p.name}: ${p.message}`);}).finally(()=>{process.exit(0);});})),e.help(),e.version(a),e.parse(process.argv);});j().catch(e=>{e instanceof Error?chunk3NPOOIY2_js.k.error(`${e.name}: ${e.message}`):chunk3NPOOIY2_js.k.log(e);});});var cli = w();

module.exports = cli;
