/* Interactive ladder-logic simulator.
   Config: { title, inputs:[{tag,addr,label,kind:'push'|'switch',nc,init}], outputs:[{tag,addr,label,kind:'lamp'|'motor',color}],
             rungs:[{title, c:[elements], o:output}] }
   inputs may also be {kind:'slider', min, max, step, init, unit} (a numeric tag)
   element: ['NO',tag] ['NC',tag] ['P',tag,memTag] ['N',tag,memTag] ['CMP',op,a,b,dataType] ['par',[seq,seq,...]]
   output : ['coil',tag] ['set',tag] ['reset',tag] ['ton',inst,ms] ['tof',inst,ms] ['tp',inst,ms] ['ctu',inst,pv,resetTag]
           ['ctd',inst,pv,loadTag] ['ctud',inst,pv,resetTag,cdTag,loadTag]
           ['move',src,dst] ['math','+|-|*|/',a,b,dst,dataType] ['norm',srcTag,min,max,dst] ['scale',srcTag,min,max,dst]  (a, b, src may be numbers or tags)
   Timer/counter data are readable as tags: T1.Q, T1.ET, C1.Q, C1.CV */
window.Sim = (function () {
  "use strict";
  var EW = 80, EH = 60, TICK = 50, running = [];

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  // ---------- compile ----------
  function cSeq(a) { return a.map(cEl); }
  function cEl(e) {
    if (e[0] === "par") return { k: "par", br: e[1].map(cSeq) };
    if (e[0] === "CMP") return { k: "CMP", op: e[1], a: e[2], b: e[3], dt: e[4] || "Int" };
    return { k: e[0], tag: e[1], mem: e[2] };
  }
  function cOut(o) {
    if (o[0] === "move") return { k: "move", src: o[1], tag: o[2], dt: o[3] || "Int" };
    if (o[0] === "math") return { k: "math", op: o[1], x: o[2], y: o[3], tag: o[4], dt: o[5] || "Int" };
    if (o[0] === "norm" || o[0] === "scale") return { k: o[0], src: o[1], lo: o[2], hi: o[3], tag: o[4] };
    if (o[0] === "ctud") return { k: "ctud", tag: o[1], a: o[2], r: o[3], cd: o[4], ld: o[5] };
    return { k: o[0], tag: o[1], a: o[2], r: o[3] };
  }
  function val(S, x) { return typeof x === "number" ? x : (S.tags[x] === undefined ? 0 : +S.tags[x]); }

  // ---------- evaluate ----------
  function evSeq(seq, pw, S) {
    for (var i = 0; i < seq.length; i++) pw = evEl(seq[i], pw, S);
    seq.o = pw; return pw;
  }
  function evEl(e, pw, S) {
    e.i = pw;
    var t = S.tags;
    if (e.k === "NO") { e.v = !!t[e.tag]; }
    else if (e.k === "NC") { e.v = !t[e.tag]; }
    else if (e.k === "P") { var c = !!t[e.tag]; e.v = c && !S.mem[e.mem]; S.mem[e.mem] = c; t[e.mem] = c; }
    else if (e.k === "N") { var c2 = !!t[e.tag]; e.v = !c2 && !!S.mem[e.mem]; S.mem[e.mem] = c2; t[e.mem] = c2; }
    else if (e.k === "CMP") { var A = val(S, e.a), B = val(S, e.b); e.v = e.op === ">" ? A > B : e.op === "<" ? A < B : e.op === ">=" ? A >= B : e.op === "<=" ? A <= B : e.op === "==" ? A === B : A !== B; }
    else if (e.k === "par") {
      var any = false;
      e.br.forEach(function (b) { if (evSeq(b, pw, S)) any = true; });
      e.o = any; return any;
    }
    e.o = pw && e.v; return e.o;
  }
  function evOut(r, S) {
    var o = r.o, pw = evSeq(r.c, true, S), t = S.tags, dt = S.dt;
    r.pw = pw;
    if (o.k === "coil") t[o.tag] = pw;
    else if (o.k === "set") { if (pw) t[o.tag] = true; }
    else if (o.k === "reset") { if (pw) t[o.tag] = false; }
    else if (o.k === "move") { if (pw) t[o.tag] = val(S, o.src); }
    else if (o.k === "math") { if (pw) { var a1 = val(S, o.x), b1 = val(S, o.y), res = o.op === "+" ? a1 + b1 : o.op === "-" ? a1 - b1 : o.op === "*" ? a1 * b1 : (b1 ? a1 / b1 : 0); t[o.tag] = o.dt === "Int" ? Math.trunc(res) : res; } }
    else if (o.k === "norm") { if (pw) t[o.tag] = (val(S, o.src) - o.lo) / (o.hi - o.lo); }
    else if (o.k === "scale") { if (pw) t[o.tag] = o.lo + val(S, o.src) * (o.hi - o.lo); }
    else if (o.k === "ton" || o.k === "tof" || o.k === "tp") {
      var I = S.inst[o.tag] || (S.inst[o.tag] = { et: 0, q: false, prev: false, run: false }), pt = o.a;
      if (o.k === "ton") {
        if (pw) { I.et = Math.min(I.et + dt, pt); I.q = I.et >= pt; } else { I.et = 0; I.q = false; }
      } else if (o.k === "tof") {
        if (pw) { I.et = 0; I.q = true; } else if (I.q) { I.et = Math.min(I.et + dt, pt); if (I.et >= pt) I.q = false; }
      } else {
        if (pw && !I.prev && !I.run && I.et === 0) { I.run = true; }
        if (I.run) { I.et = Math.min(I.et + dt, pt); I.q = true; if (I.et >= pt) { I.run = false; I.q = false; } }
        else if (!pw) { I.et = 0; I.q = false; }
        I.prev = pw;
      }
      t[o.tag + ".Q"] = I.q; t[o.tag + ".ET"] = I.et;
    } else if (o.k === "ctd") {
      var D = S.inst[o.tag] || (S.inst[o.tag] = { cv: 0, prev: false });
      if (t[o.r]) D.cv = o.a; else if (pw && !D.prev && D.cv > -32768) D.cv--;
      D.prev = pw; t[o.tag + ".CV"] = D.cv; t[o.tag + ".Q"] = D.cv <= 0;
    } else if (o.k === "ctud") {
      var U = S.inst[o.tag] || (S.inst[o.tag] = { cv: 0, pu: false, pd: false }), cdv = !!t[o.cd];
      if (t[o.r]) U.cv = 0; else if (o.ld && t[o.ld]) U.cv = o.a; else { if (pw && !U.pu && U.cv < 32767) U.cv++; if (cdv && !U.pd && U.cv > -32768) U.cv--; }
      U.pu = pw; U.pd = cdv; t[o.tag + ".CV"] = U.cv; t[o.tag + ".QU"] = U.cv >= o.a; t[o.tag + ".QD"] = U.cv <= 0;
    } else if (o.k === "ctu") {
      var K = S.inst[o.tag] || (S.inst[o.tag] = { cv: 0, prev: false });
      if (t[o.r]) K.cv = 0; else if (pw && !K.prev && K.cv < 32767) K.cv++;
      K.prev = pw;
      t[o.tag + ".CV"] = K.cv; t[o.tag + ".Q"] = K.cv >= o.a;
    }
  }

  // ---------- layout / draw (styled after the TIA Portal LAD editor in online monitoring) ----------
  var ON = "#1fa148", OFF = "#2f6bd1", INK = "#1b1f23";
  function wEl(e) { if (e.k === "CMP") return 140; if (e.k === "par") { var m = 0; e.br.forEach(function (b) { m = Math.max(m, wSeq(b)); }); return m + 40; } return EW; }
  function wSeq(s) { var w = 0; s.forEach(function (e) { w += wEl(e); }); return w; }
  function hEl(e) { if (e.k === "par") { var h = 0; e.br.forEach(function (b) { h += hSeq(b); }); return h; } return EH; }
  function hSeq(s) { var m = EH; s.forEach(function (e) { m = Math.max(m, hEl(e)); }); return m; }

  function W(ctx, x1, y1, x2, y2, on) { (on ? ctx.on : ctx.off).push('<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"/>'); }
  function lab(ctx, x, y, s, cls) { ctx.fx.push('<text x="' + x + '" y="' + y + '" text-anchor="middle" class="' + (cls || "tg") + '">' + esc(s) + "</text>"); }
  function fmtTag(t) { var i = t.indexOf("."); return i < 0 ? '"' + t + '"' : '"' + t.slice(0, i) + '"' + t.slice(i); }
  function fmtT(ms) { var s = Math.floor(ms / 1000), r = Math.round(ms % 1000); return "T#" + (s ? s + "s" : "") + (r || !s ? r + "ms" : ""); }

  function drawSeq(ctx, seq, x, ym, width) {
    var x0 = x;
    seq.forEach(function (e) { drawEl(ctx, e, x, ym); x += wEl(e); });
    if (x < x0 + width) W(ctx, x, ym, x0 + width, ym, seq.o);
  }
  function drawEl(ctx, e, x, ym) {
    if (e.k === "par") {
      var w = wEl(e), top = ym - EH / 2;
      W(ctx, x, ym, x + 10, ym, e.i);
      e.br.forEach(function (b) {
        var bm = top + EH / 2;
        W(ctx, x + 10, ym, x + 10, bm, e.i); W(ctx, x + 10, bm, x + 20, bm, e.i);
        drawSeq(ctx, b, x + 20, bm, w - 40);
        W(ctx, x + w - 20, bm, x + w - 10, bm, b.o); W(ctx, x + w - 10, bm, x + w - 10, ym, b.o);
        top += hSeq(b);
      });
      W(ctx, x + w - 10, ym, x + w, ym, e.o);
      return;
    }
    if (e.k === "CMP") {
      var bx2 = x + 76, bw2 = 58;
      W(ctx, x, ym, bx2, ym, e.i); W(ctx, bx2 + bw2, ym, x + 140, ym, e.o);
      ctx.fx.push('<line class="pin" x1="' + (x + 30) + '" y1="' + (ym + 18) + '" x2="' + bx2 + '" y2="' + (ym + 18) + '"/>');
      ctx.fx.push('<rect x="' + bx2 + '" y="' + (ym - 16) + '" width="' + bw2 + '" height="44" class="bbody' + (e.v ? " on" : "") + '"/><text x="' + (bx2 + bw2 / 2) + '" y="' + (ym + 5) + '" text-anchor="middle" class="tg bold" style="font-size:15px">' + esc(e.op) + '</text><text x="' + (bx2 + bw2 / 2) + '" y="' + (ym + 21) + '" text-anchor="middle" class="ad2">' + esc(e.dt) + "</text>");
      ctx.fx.push('<text x="' + (bx2 - 4) + '" y="' + (ym - 4) + '" text-anchor="end" class="tg">' + esc(fmtOp(e.a)) + '</text><text x="' + (bx2 - 4) + '" y="' + (ym + 15) + '" text-anchor="end" class="tg">' + esc(fmtOp(e.b)) + "</text>");
      return;
    }
    W(ctx, x, ym, x + 33, ym, e.i); W(ctx, x + 47, ym, x + EW, ym, e.o);
    var cl = e.v ? "bar on" : "bar";
    ctx.fx.push('<line class="' + cl + '" x1="' + (x + 33) + '" y1="' + (ym - 11) + '" x2="' + (x + 33) + '" y2="' + (ym + 11) + '"/><line class="' + cl + '" x1="' + (x + 47) + '" y1="' + (ym - 11) + '" x2="' + (x + 47) + '" y2="' + (ym + 11) + '"/>');
    if (e.k === "NC") ctx.fx.push('<line class="' + cl + '" x1="' + (x + 33) + '" y1="' + (ym + 11) + '" x2="' + (x + 47) + '" y2="' + (ym - 11) + '"/>');
    if (e.k === "P" || e.k === "N") ctx.fx.push('<text x="' + (x + 40) + '" y="' + (ym + 4) + '" text-anchor="middle" class="tg ' + (e.v ? "hot" : "") + '">' + e.k + "</text>");
    lab(ctx, x + 40, ym - 16, fmtTag(e.tag), e.v ? "tg hot" : "tg");
    var a = ctx.addr[e.tag]; if (a) lab(ctx, x + 40, ym + 25, a, "ad");
  }

  function isGen(o) { return o.k === "move" || o.k === "math" || o.k === "norm" || o.k === "scale"; }
  function isBox(o) { return o.k === "ton" || o.k === "tof" || o.k === "tp" || o.k === "ctu" || o.k === "ctd" || o.k === "ctud" || isGen(o); }
  function rowsOf(o) { return o.k === "ctud" ? 5 : (o.k === "ctu" || o.k === "ctd" || o.k === "math") ? 3 : (o.k === "norm" || o.k === "scale") ? 4 : isBox(o) ? 2 : 0; }
  function drawCtr(ctx, r, x, ym, S) {
    var o = r.o, pw = r.pw, t = S.tags, bx = x + 22, bw = 124, rows = rowsOf(o), by = ym - 44, ud = o.k === "ctud";
    ctx.fx.push('<text x="' + (bx + bw / 2) + '" y="' + (by - 6) + '" text-anchor="middle" class="tg">"' + esc(o.tag) + '"</text>');
    ctx.fx.push('<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="34" class="bhead"/><rect x="' + bx + '" y="' + (ym - 11) + '" width="' + bw + '" height="' + (rows * 22 + 2) + '" class="bbody' + (pw ? " on" : "") + '"/>');
    ctx.fx.push('<text x="' + (bx + bw / 2) + '" y="' + (by + 15) + '" text-anchor="middle" class="tg bold">' + o.k.toUpperCase() + '</text><rect x="' + (bx + bw / 2 - 17) + '" y="' + (by + 19) + '" width="34" height="12" class="bdt"/><text x="' + (bx + bw / 2) + '" y="' + (by + 29) + '" text-anchor="middle" class="ad2">Int</text>');
    W(ctx, x, ym, bx, ym, pw);
    var pins = ud ? [["CU", null], ["CD", o.cd], ["R", o.r], ["LD", o.ld], ["PV", o.a]] : [["CD", null], ["LD", o.r], ["PV", o.a]];
    pins.forEach(function (p, i) {
      var yy = ym + i * 22, v = p[1];
      ctx.fx.push('<text x="' + (bx + 5) + '" y="' + (yy + 4) + '" class="tg">' + p[0] + "</text>");
      if (i === 0) return;
      if (typeof v === "string") { var on = !!t[v]; W(ctx, bx - 22, yy, bx, yy, on); ctx.fx.push('<text x="' + (bx - 24) + '" y="' + (yy - 4) + '" text-anchor="end" class="tg ' + (on ? "hot" : "") + '">"' + esc(v) + '"</text>'); }
      else { ctx.fx.push('<line class="' + (v === undefined ? "stub" : "pin") + '" x1="' + (bx - 22) + '" y1="' + yy + '" x2="' + bx + '" y2="' + yy + '"/>' + (v === undefined ? "" : '<text x="' + (bx - 24) + '" y="' + (yy - 4) + '" text-anchor="end" class="tg">' + v + "</text>")); }
    });
    var outs = ud ? [["QU", t[o.tag + ".QU"]], ["QD", t[o.tag + ".QD"]], ["CV", t[o.tag + ".CV"] || 0]] : [["Q", t[o.tag + ".Q"]], ["CV", t[o.tag + ".CV"] || 0]];
    outs.forEach(function (p, i) {
      var yy = ym + i * 22, isCv = p[0] === "CV";
      ctx.fx.push('<text x="' + (bx + bw - 5) + '" y="' + (yy + 4) + '" text-anchor="end" class="tg ' + (!isCv && p[1] ? "hot" : "") + '">' + p[0] + '</text><line class="stub" x1="' + (bx + bw) + '" y1="' + yy + '" x2="' + (bx + bw + 20) + '" y2="' + yy + '"/>' + (isCv ? '<text x="' + (bx + bw + 26) + '" y="' + (yy + 4) + '" class="tg hot">' + p[1] + "</text>" : ""));
    });
  }
  function fmtOp(x) { return typeof x === "number" ? String(x) : '"' + x + '"'; }
  function fmtV(v) { return typeof v === "number" ? String(Math.round(v * 100) / 100) : String(v); }
  function drawGen(ctx, r, x, ym, S) {
    var o = r.o, pw = r.pw, t = S.tags, bx = x + 22, bw = 118, rows = rowsOf(o), by = ym - 44;
    var type = { move: "MOVE", norm: "NORM_X", scale: "SCALE_X" }[o.k] || { "+": "ADD", "-": "SUB", "*": "MUL", "/": "DIV" }[o.op];
    var dt = o.k === "norm" ? "Int to Real" : o.k === "scale" ? "Real to Real" : o.dt, fw = dt.length > 5 ? 66 : 34;
    var L = o.k === "move" ? [["IN", o.src]] : o.k === "math" ? [["IN1", o.x], ["IN2", o.y]] : [["MIN", o.lo], ["VALUE", o.src], ["MAX", o.hi]];
    ctx.fx.push('<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="34" class="bhead"/><rect x="' + bx + '" y="' + (ym - 11) + '" width="' + bw + '" height="' + (rows * 22 + 2) + '" class="bbody' + (pw ? " on" : "") + '"/>');
    ctx.fx.push('<text x="' + (bx + bw / 2) + '" y="' + (by + 15) + '" text-anchor="middle" class="tg bold">' + type + '</text><rect x="' + (bx + bw / 2 - fw / 2) + '" y="' + (by + 19) + '" width="' + fw + '" height="12" class="bdt"/><text x="' + (bx + bw / 2) + '" y="' + (by + 29) + '" text-anchor="middle" class="ad2">' + esc(dt) + "</text>");
    W(ctx, x, ym, bx, ym, pw);
    ctx.fx.push('<text x="' + (bx + 5) + '" y="' + (ym + 4) + '" class="tg">EN</text>');
    L.forEach(function (p, i) {
      var yy = ym + (i + 1) * 22;
      ctx.fx.push('<line class="pin" x1="' + (bx - 22) + '" y1="' + yy + '" x2="' + bx + '" y2="' + yy + '"/><text x="' + (bx - 24) + '" y="' + (yy - 4) + '" text-anchor="end" class="tg">' + esc(fmtOp(p[1])) + '</text><text x="' + (bx + 5) + '" y="' + (yy + 4) + '" class="tg">' + p[0] + "</text>");
    });
    var yo = ym + 22, name = o.k === "move" ? "OUT1" : "OUT", live = t[o.tag];
    ctx.fx.push('<text x="' + (bx + bw - 5) + '" y="' + (ym + 4) + '" text-anchor="end" class="tg">ENO</text><line class="stub" x1="' + (bx + bw) + '" y1="' + ym + '" x2="' + (bx + bw + 20) + '" y2="' + ym + '"/>');
    ctx.fx.push('<text x="' + (bx + bw - 5) + '" y="' + (yo + 4) + '" text-anchor="end" class="tg">' + name + '</text><line class="pin" x1="' + (bx + bw) + '" y1="' + yo + '" x2="' + (bx + bw + 20) + '" y2="' + yo + '"/><text x="' + (bx + bw + 24) + '" y="' + (yo + 4) + '" class="tg">"' + esc(o.tag) + '"<tspan class="hotv">  ' + (live === undefined ? "" : fmtV(live)) + "</tspan></text>");
  }
  function drawOut(ctx, r, x, ym, S) {
    var o = r.o, pw = r.pw, t = S.tags;
    if (isGen(o)) return drawGen(ctx, r, x, ym, S);
    if (o.k === "ctd" || o.k === "ctud") return drawCtr(ctx, r, x, ym, S);
    if (!isBox(o)) {
      W(ctx, x, ym, x + 38, ym, pw); W(ctx, x + 52, ym, x + 78, ym, pw);
      var c = pw ? "bar on" : "bar";
      ctx.fx.push('<path class="' + c + '" fill="none" d="M' + (x + 42) + "," + (ym - 11) + " Q" + (x + 33) + "," + ym + " " + (x + 42) + "," + (ym + 11) + '"/><path class="' + c + '" fill="none" d="M' + (x + 48) + "," + (ym - 11) + " Q" + (x + 57) + "," + ym + " " + (x + 48) + "," + (ym + 11) + '"/>');
      if (o.k !== "coil") ctx.fx.push('<text x="' + (x + 45) + '" y="' + (ym + 4) + '" text-anchor="middle" class="tg ' + (pw ? "hot" : "") + '">' + (o.k === "set" ? "S" : "R") + "</text>");
      lab(ctx, x + 45, ym - 16, fmtTag(o.tag), pw ? "tg hot" : "tg");
      var a = ctx.addr[o.tag]; if (a) lab(ctx, x + 45, ym + 25, a, "ad");
      return;
    }
    var bx = x + 22, bw = 120, rows = rowsOf(o), type = o.k.toUpperCase(), dt = o.k === "ctu" ? "Int" : "Time", q = !!t[o.tag + ".Q"];
    var by = ym - 44, bodyTop = ym - 11;
    ctx.fx.push('<text x="' + (bx + bw / 2) + '" y="' + (by - 6) + '" text-anchor="middle" class="tg">"' + esc(o.tag) + '"</text>');
    ctx.fx.push('<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="34" class="bhead"/><rect x="' + bx + '" y="' + bodyTop + '" width="' + bw + '" height="' + (rows * 22 + 2) + '" class="bbody' + (pw ? " on" : "") + '"/>');
    ctx.fx.push('<text x="' + (bx + bw / 2) + '" y="' + (by + 15) + '" text-anchor="middle" class="tg bold">' + type + '</text><rect x="' + (bx + bw / 2 - 17) + '" y="' + (by + 19) + '" width="34" height="12" class="bdt"/><text x="' + (bx + bw / 2) + '" y="' + (by + 29) + '" text-anchor="middle" class="ad2">' + dt + "</text>");
    W(ctx, x, ym, bx, ym, pw);
    var first = o.k === "ctu" ? "CU" : "IN";
    ctx.fx.push('<text x="' + (bx + 5) + '" y="' + (ym + 4) + '" class="tg">' + first + "</text>");
    if (o.k === "ctu") {
      var rv = !!t[o.r];
      W(ctx, bx - 22, ym + 22, bx, ym + 22, rv); ctx.fx.push('<text x="' + (bx - 24) + '" y="' + (ym + 18) + '" text-anchor="end" class="tg ' + (rv ? "hot" : "") + '">"' + esc(o.r) + '"</text><text x="' + (bx + 5) + '" y="' + (ym + 26) + '" class="tg">R</text>');
      ctx.fx.push('<line class="stub" x1="' + (bx - 22) + '" y1="' + (ym + 44) + '" x2="' + bx + '" y2="' + (ym + 44) + '"/><text x="' + (bx - 24) + '" y="' + (ym + 40) + '" text-anchor="end" class="tg">' + o.a + '</text><text x="' + (bx + 5) + '" y="' + (ym + 48) + '" class="tg">PV</text>');
      ctx.fx.push('<text x="' + (bx + bw - 5) + '" y="' + (ym + 26) + '" text-anchor="end" class="tg">CV</text><text x="' + (bx + bw + 26) + '" y="' + (ym + 26) + '" class="tg hot">' + (t[o.tag + ".CV"] || 0) + "</text>");
    } else {
      ctx.fx.push('<line class="stub" x1="' + (bx - 22) + '" y1="' + (ym + 22) + '" x2="' + bx + '" y2="' + (ym + 22) + '"/><text x="' + (bx - 24) + '" y="' + (ym + 18) + '" text-anchor="end" class="tg">' + fmtT(o.a) + '</text><text x="' + (bx + 5) + '" y="' + (ym + 26) + '" class="tg">PT</text>');
      ctx.fx.push('<text x="' + (bx + bw - 5) + '" y="' + (ym + 26) + '" text-anchor="end" class="tg">ET</text><text x="' + (bx + bw + 26) + '" y="' + (ym + 26) + '" class="tg hot">' + fmtT(t[o.tag + ".ET"] || 0) + "</text>");
    }
    ctx.fx.push('<text x="' + (bx + bw - 5) + '" y="' + (ym + 4) + '" text-anchor="end" class="tg ' + (q ? "hot" : "") + '">Q</text><line class="stub" x1="' + (bx + bw) + '" y1="' + ym + '" x2="' + (bx + bw + 20) + '" y2="' + ym + '"/><line class="stub" x1="' + (bx + bw) + '" y1="' + (ym + 22) + '" x2="' + (bx + bw + 20) + '" y2="' + (ym + 22) + '"/>');
  }

  function renderLadder(S) {
    var maxW = 0;
    S.rungs.forEach(function (r) { maxW = Math.max(maxW, wSeq(r.c)); });
    var outX = 24 + maxW + 14, outW = S.rungs.some(function (r) { return isGen(r.o); }) ? 330 : (S.rungs.some(function (r) { return isBox(r.o); }) ? 200 : 86), totalW = outX + outW + 10, y = 6, ctx = { off: [], on: [], fx: [], addr: S.addr || {} }, rails = [];
    S.rungs.forEach(function (r, n) {
      var box = isBox(r.o), top = box ? 62 : 32, ym = y + 24 + top, below = Math.max(hSeq(r.c) - EH / 2 + 18, box ? rowsOf(r.o) * 22 + 6 : 20), bottom = ym + below + 8;
      ctx.fx.push('<rect x="2" y="' + y + '" width="' + (totalW - 4) + '" height="20" class="nhead"/><text x="12" y="' + (y + 14) + '" class="nt"><tspan class="ntb">▾ Network ' + (n + 1) + ':</tspan>' + (r.title ? "   " + esc(r.title) : "") + "</text>");
      rails.push('<line class="rail" x1="14" y1="' + (y + 26) + '" x2="14" y2="' + (bottom - 4) + '"/>');
      W(ctx, 14, ym, 24, ym, true);
      drawSeq(ctx, r.c, 24, ym, maxW);
      W(ctx, 24 + maxW, ym, outX, ym, r.c.o);
      drawOut(ctx, r, outX, ym, S);
      if (!isBox(r.o)) W(ctx, outX + 78, ym, outX + 86, ym, r.pw);
      y = bottom + 6;
    });
    var H = y + 2;
    return '<svg class="ladsvg" viewBox="0 0 ' + totalW + " " + H + '" style="width:' + Math.round(totalW * 1.25) + 'px" role="img" aria-label="Live ladder diagram in TIA Portal style">' +
      '<rect width="' + totalW + '" height="' + H + '" fill="#ffffff"/><g class="wires">' + ctx.off.join("") + '</g><g class="wires on">' + ctx.on.join("") + "</g>" + rails.join("") + ctx.fx.join("") + "</svg>";
  }

  // ---------- FBD view (same program drawn as function block diagram) ----------
  function toTree(seq) {
    var ch = seq.map(function (e) { return e.k === "par" ? { t: "or", ch: e.br.map(toTree) } : { t: "leaf", e: e }; });
    return ch.length === 1 ? ch[0] : { t: "and", ch: ch };
  }
  function tv(n) { return n.t === "leaf" ? !!n.e.v : n.t === "and" ? n.ch.every(tv) : n.ch.some(tv); }
  function fPlace(n, x, y, c) {
    if (n.t === "leaf") {
      var e = n.e, on = !!e.v;
      if (e.k === "CMP") {
        var bx = x + 74, oy = y + 18;
        ctx2(c).push('<rect x="' + bx + '" y="' + (oy - 14) + '" width="52" height="44" class="bbody' + (on ? " on" : "") + '"/><text x="' + (bx + 26) + '" y="' + (oy + 6) + '" text-anchor="middle" class="tg bold" style="font-size:15px">' + esc(e.op) + '</text><text x="' + (bx + 26) + '" y="' + (oy + 22) + '" text-anchor="middle" class="ad2">' + esc(e.dt) + "</text>");
        ctx2(c).push('<text x="' + (bx - 4) + '" y="' + (oy - 3) + '" text-anchor="end" class="tg">' + esc(fmtOp(e.a)) + '</text><text x="' + (bx - 4) + '" y="' + (oy + 15) + '" text-anchor="end" class="tg">' + esc(fmtOp(e.b)) + '</text><line class="pin" x1="' + (x + 20) + '" y1="' + (oy + 18) + '" x2="' + bx + '" y2="' + (oy + 18) + '"/>');
        W(c, x + 20, oy, bx, oy, on); W(c, bx + 52, oy, x + 140, oy, on);
        return { w: 140, h: 50, oy: oy, ox: x + 140 };
      }
      var w = 118, oy2 = y + 20;
      c.fx.push('<text x="' + (x + w - 8) + '" y="' + (oy2 - 5) + '" text-anchor="end" class="tg ' + (on ? "hot" : "") + '">' + esc(fmtTag(e.tag)) + (e.k === "P" || e.k === "N" ? "  " + e.k : "") + "</text>");
      var a = c.addr[e.tag]; if (a) c.fx.push('<text x="' + (x + w - 8) + '" y="' + (oy2 + 12) + '" text-anchor="end" class="ad">' + a + "</text>");
      W(c, x + 4, oy2, x + w, oy2, on);
      return { w: w, h: 36, oy: oy2, ox: x + w };
    }
    var kids = [], yy = y, maxW = 0;
    n.ch.forEach(function (ch) { var r = fPlace(ch, x, yy, c); kids.push(r); yy += r.h + 6; maxW = Math.max(maxW, r.w); });
    var gx = x + maxW + 16, gw = 54, top = kids[0].oy - 14, bot = kids[kids.length - 1].oy + 14, out = (top + bot) / 2, on2 = tv(n);
    kids.forEach(function (r, i) {
      var ch = n.ch[i], neg = ch.t === "leaf" && ch.e.k === "NC";
      W(c, r.ox, r.oy, gx - (neg ? 7 : 0), r.oy, tv(ch));
      if (neg) c.fx.push('<circle cx="' + (gx - 3.5) + '" cy="' + r.oy + '" r="3.5" class="neg"/>');
    });
    c.fx.push('<rect x="' + gx + '" y="' + top + '" width="' + gw + '" height="' + (bot - top) + '" class="bbody' + (on2 ? " on" : "") + '"/><text x="' + (gx + gw / 2) + '" y="' + (top + 16) + '" text-anchor="middle" class="tg bold">' + (n.t === "and" ? "&amp;" : "&gt;=1") + "</text>");
    return { w: maxW + 16 + gw, h: Math.max(yy - y - 6, bot - y), oy: out, ox: gx + gw };
  }
  function ctx2(c) { return c.fx; }
  function renderFBD(S) {
    var trees = S.rungs.map(function (r) { return toTree(r.c); }), maxTW = 0, meas = [];
    trees.forEach(function (t) { var m = fPlace(t, 0, 0, { on: [], off: [], fx: [], addr: S.addr || {} }); meas.push(m); maxTW = Math.max(maxTW, m.w); });
    var outX = 14 + maxTW + 26, outW = S.rungs.some(function (r) { return isGen(r.o); }) ? 330 : (S.rungs.some(function (r) { return isBox(r.o); }) ? 200 : 100), totalW = outX + outW + 10, y = 6, ctx = { off: [], on: [], fx: [], addr: S.addr || {} };
    S.rungs.forEach(function (r, n) {
      var box = isBox(r.o), topNeed = box ? 62 : 34, y0 = y + 24 + Math.max(4, topNeed - meas[n].oy), placed = fPlace(trees[n], 14, y0, ctx), ym = placed.oy, v = tv(trees[n]);
      ctx.fx.push('<rect x="2" y="' + y + '" width="' + (totalW - 4) + '" height="20" class="nhead"/><text x="12" y="' + (y + 14) + '" class="nt"><tspan class="ntb">▾ Network ' + (n + 1) + ':</tspan>' + (r.title ? "   " + esc(r.title) : "") + "</text>");
      W(ctx, placed.ox, ym, outX, ym, v);
      if (!box) {
        ctx.fx.push('<rect x="' + outX + '" y="' + (ym - 15) + '" width="44" height="30" class="bbody' + (r.pw ? " on" : "") + '"/><text x="' + (outX + 22) + '" y="' + (ym + 5) + '" text-anchor="middle" class="tg bold" style="font-size:14px">' + (r.o.k === "coil" ? "=" : r.o.k === "set" ? "S" : "R") + "</text>");
        lab(ctx, outX + 22, ym - 22, fmtTag(r.o.tag), r.pw ? "tg hot" : "tg"); var ad = ctx.addr[r.o.tag]; if (ad) lab(ctx, outX + 22, ym + 28, ad, "ad");
      } else drawOut(ctx, r, outX, ym, S);
      y = Math.max(y0 + placed.h, ym + (box ? rowsOf(r.o) * 22 + 6 : 34)) + 14;
    });
    var H = y + 2;
    return '<svg class="ladsvg" viewBox="0 0 ' + totalW + " " + H + '" style="width:' + Math.round(totalW * 1.25) + 'px" role="img" aria-label="Live function block diagram in TIA Portal style">' +
      '<rect width="' + totalW + '" height="' + H + '" fill="#ffffff"/><g class="wires">' + ctx.off.join("") + '</g><g class="wires on">' + ctx.on.join("") + "</g>" + ctx.fx.join("") + "</svg>";
  }
  // static rendering of a few rungs (used by figures): rungs use the same config format as sims
  function renderStatic(rungs, tags, mode, addr) {
    var S = { tags: Object.assign({}, tags), mem: {}, inst: {}, dt: 50, addr: addr || {}, rungs: rungs.map(function (r) { return { title: r.title, c: cSeq(r.c), o: cOut(r.o) }; }) };
    S.rungs.forEach(function (r) { evOut(r, S); });
    return mode === "fbd" ? renderFBD(S) : renderLadder(S);
  }

  // ---------- widget ----------
  function create(host, cfg, onTouch) {
    var S = {
      tags: {}, mem: {}, inst: {}, dt: TICK, rungs: cfg.rungs.map(function (r) { return { title: r.title, c: cSeq(r.c), o: cOut(r.o) }; })
    };
    var inputs = cfg.inputs || [], outputs = cfg.outputs || []; S.addr = {}; (cfg.inputs || []).concat(cfg.outputs || [], cfg.sensors || []).forEach(function (d) { if (d.addr) S.addr[d.tag] = d.addr; });
    var ui = {}, plant = cfg.plant && window.PLANTS ? window.PLANTS[cfg.plant] : null, pst = plant ? plant.init() : null, sens = cfg.sensors || [];
    function sig(i) { var u = ui[i.tag]; if (i.kind === "slider") return u.val; return i.nc ? !u.on : u.on; }
    inputs.forEach(function (i) { ui[i.tag] = { on: i.kind === "switch" ? !!i.init : false, val: i.init || 0, seen: true, release: false }; });

    var h = '<div class="simhead"><b>' + esc(cfg.title || "Simulator") + '</b><span class="simsub">Online view: green = power flows, blue dashed = no power flow</span><span class="simview"><button type="button" data-view="lad" class="on">LAD</button><button type="button" data-view="fbd">FBD</button></span><button class="simreset" type="button">Reset</button></div>';
    h += '<div class="simin">';
    inputs.forEach(function (i) {
      if (i.kind === "slider") {
        h += '<div class="simctl slider"><div class="cap"><b>' + esc(i.tag) + '</b> <span class="addr">' + esc(i.addr || "") + '</span><br><span class="sub">' + esc(i.label || "") + '</span><br><input type="range" class="simrange" data-tag="' + esc(i.tag) + '" min="' + (i.min || 0) + '" max="' + (i.max || 100) + '" step="' + (i.step || 1) + '" value="' + (i.init || 0) + '"> <output class="simrange-out" data-tag="' + esc(i.tag) + '"></output></div></div>';
        return;
      }
      h += '<div class="simctl"><button type="button" class="simbtn ' + i.kind + '" data-tag="' + esc(i.tag) + '"><span class="knob"></span><span class="lbl">' + (i.kind === "switch" ? "Switch" : "Hold") + "</span></button>" +
        '<div class="cap"><b>' + esc(i.tag) + '</b> <span class="addr">' + esc(i.addr || "") + "</span><br><span class=\"sub\">" + esc(i.label || "") + (i.nc ? " (wired NC: signal is 1 until pressed)" : "") + "</span></div></div>";
    });
    sens.forEach(function (s) {
      h += '<div class="simlamp sens" data-sens="' + esc(s.tag) + '"><svg viewBox="0 0 40 40" class="lampico"><circle cx="20" cy="20" r="11" class="mc" style="--c:#4db3e0"/></svg><div class="cap"><b>' + esc(s.tag) + '</b> <span class="addr">' + esc(s.addr || '') + '</span><br><span class="sub">' + esc(s.label || 'Sensor on the machine') + '</span></div></div>';
    });
    h += '</div>' + (plant ? '<div class="simscene"></div>' : '') + '<div class="simsvg"></div><div class="simout">';
    outputs.forEach(function (o) {
      h += '<div class="simlamp" data-out="' + esc(o.tag) + '">' +
        (o.kind === "motor" ? '<svg viewBox="0 0 40 40" class="lampico"><circle cx="20" cy="20" r="17" class="mc"/><g class="rotor"><line x1="20" y1="7" x2="20" y2="33"/><line x1="7" y1="20" x2="33" y2="20"/></g></svg>' :
          '<svg viewBox="0 0 40 40" class="lampico"><circle cx="20" cy="20" r="14" class="mc" style="--c:' + (o.color || "#f2b84b") + '"/></svg>') +
        '<div class="cap"><b>' + esc(o.tag) + '</b> <span class="addr">' + esc(o.addr || "") + '</span><br><span class="sub">' + esc(o.label || "") + "</span></div></div>";
    });
    var ioPat = /^%[IQ]0\.[0-7]$/, showCpu = !!(window.PARTS && window.PARTS.cpu1200) && (cfg.inputs || []).concat(cfg.outputs || [], cfg.sensors || []).some(function (d) { return ioPat.test(d.addr || ""); });
    h += '</div>' + (showCpu ? '<div class="simcpu"></div>' : "") + '<div class="simtags"></div>';
    host.innerHTML = h;
    host.classList.add("sim");
    var view = "lad";
    host.querySelectorAll(".simview button").forEach(function (b) { b.addEventListener("click", function () { view = b.getAttribute("data-view"); host.querySelectorAll(".simview button").forEach(function (x) { x.classList.toggle("on", x === b); }); lastSvg = ""; draw(); if (onTouch) onTouch(); }); });
    var sceneBox = host.querySelector(".simscene"), svgBox = host.querySelector(".simsvg"), tagBox = host.querySelector(".simtags");

    function bindBtn(btn, i) {
      var u = ui[i.tag];
      function paint() { btn.classList.toggle("down", u.on); }
      if (i.kind === "switch") {
        btn.addEventListener("click", function () { u.on = !u.on; paint(); if (onTouch) onTouch(); });
        btn.querySelector(".lbl").textContent = "Switch";
      } else {
        var down = function (ev) { ev.preventDefault(); u.on = true; u.seen = false; u.release = false; paint(); if (onTouch) onTouch(); };
        var up = function () { if (!u.on) return; if (u.seen) { u.on = false; } else { u.release = true; } paint(); };
        btn.addEventListener("pointerdown", down);
        btn.addEventListener("pointerup", up); btn.addEventListener("pointerleave", up); btn.addEventListener("pointercancel", up);
        btn.addEventListener("keydown", function (ev) { if (ev.key === " " || ev.key === "Enter") { if (!u.on) down(ev); } });
        btn.addEventListener("keyup", function (ev) { if (ev.key === " " || ev.key === "Enter") up(); });
      }
      paint();
      i._paint = paint;
    }
    function bindSlider(i) {
      var inp = host.querySelector('.simrange[data-tag="' + i.tag + '"]'), out = host.querySelector('.simrange-out[data-tag="' + i.tag + '"]'), u = ui[i.tag];
      function paint() { inp.value = u.val; out.textContent = u.val + (i.unit ? " " + i.unit : ""); }
      inp.addEventListener("input", function () { u.val = parseFloat(inp.value); paint(); if (onTouch) onTouch(); });
      i._paint = paint; paint();
    }
    inputs.forEach(function (i) { if (i.kind === "slider") bindSlider(i); else bindBtn(host.querySelector('.simbtn[data-tag="' + i.tag + '"]'), i); });

    function reset() {
      S.tags = {}; S.mem = {}; S.inst = {}; if (plant) pst = plant.init();
      inputs.forEach(function (i) { ui[i.tag].on = i.kind === "switch" ? !!i.init : false; ui[i.tag].val = i.init || 0; ui[i.tag].seen = true; ui[i.tag].release = false; i._paint(); });
      draw();
    }
    host.querySelector(".simreset").addEventListener("click", reset);

    function scan() {
      inputs.forEach(function (i) { S.tags[i.tag] = sig(i); });
      if (plant) plant.step(S.tags, S.dt / 1000, pst);
      S.rungs.forEach(function (r) { evOut(r, S); });
      inputs.forEach(function (i) { var u = ui[i.tag]; u.seen = true; if (u.release) { u.on = false; u.release = false; i._paint(); } });
    }
    var lastSvg = "", lastTags = "", lastCpu = "", cpuBox = host.querySelector(".simcpu");
    function drawCpu() {
      var di = [], dq = [], i, m;
      for (i = 0; i < 8; i++) { di.push(false); dq.push(false); }
      inputs.concat(sens).forEach(function (d) { m = /^%I0\.([0-7])$/.exec(d.addr || ""); if (m) di[+m[1]] = !!S.tags[d.tag]; });
      outputs.forEach(function (d) { m = /^%Q0\.([0-7])$/.exec(d.addr || ""); if (m) dq[+m[1]] = !!S.tags[d.tag]; });
      var key = di.join("") + dq.join("");
      if (key === lastCpu) return;
      lastCpu = key;
      cpuBox.innerHTML = '<svg class="figsvg real cpuview" viewBox="0 0 240 215" role="img" aria-label="S7-1200 CPU whose input and output LEDs follow the simulation">' + window.PARTS.DEFS + window.PARTS.cpu1200(10, 6, 1, { di: di, dq: dq }) + "</svg>" +
        '<div class="cpucap">The LEDs of the S7-1200 follow the simulated inputs (DI a) and outputs (DQ a).</div>';
    }
    function draw() {
      if (plant) {
        sceneBox.innerHTML = plant.draw(S.tags, pst);
        sens.forEach(function (s) { var el = host.querySelector('.simlamp[data-sens="' + s.tag + '"]'); if (el) el.classList.toggle("on", !!S.tags[s.tag]); });
      }
      if (cpuBox) drawCpu();
      var s = view === "fbd" ? renderFBD(S) : renderLadder(S);
      if (s !== lastSvg) { svgBox.innerHTML = s; lastSvg = s; }
      outputs.forEach(function (o) {
        var el = host.querySelector('.simlamp[data-out="' + o.tag + '"]');
        if (el) el.classList.toggle("on", !!S.tags[o.tag]);
      });
      var tg = "", names = Object.keys(S.tags).filter(function (k) { return !/^_/.test(k); });
      names.forEach(function (k) {
        var v = S.tags[k], txt = typeof v === "boolean" ? (v ? "1" : "0") : (k.slice(-3) === ".ET" ? (v / 1000).toFixed(1) + " s" : (typeof v === "number" ? Math.round(v * 100) / 100 : v));
        tg += '<span class="chip' + (v === true ? " hi" : "") + '"><i>' + esc(k) + "</i> " + txt + "</span>";
      });
      if (tg !== lastTags) { tagBox.innerHTML = '<span class="tl">Tag values:</span> ' + tg; lastTags = tg; }
    }
    var last = Date.now();
    var timer = setInterval(function () {
      if (!document.body.contains(host)) { clearInterval(timer); return; }
      var now = Date.now(); S.dt = Math.min(now - last, 200); last = now;
      scan(); draw();
    }, TICK);
    running.push(timer);
    scan(); draw();
  }

  function cleanup() { running.forEach(clearInterval); running = []; }
  return { create: create, cleanup: cleanup, render: renderStatic, track: function (t) { running.push(t); } };
})();
