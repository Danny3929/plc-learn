/* Interactive widgets for modules 5-8: pid, subnet, alarm, bits.  Widgets.create(type, host, cfg, onTouch) */
window.Widgets = (function () {
  "use strict";
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function head(title, sub) {
    return '<div class="simhead"><b>' + esc(title) + '</b><span class="simsub">' + esc(sub || "") + '</span><button class="simreset" type="button">Reset</button></div>';
  }
  function frame(host) { host.classList.add("sim", "wdg"); }
  function track(t) { if (window.Sim && window.Sim.track) window.Sim.track(t); }

  // ---------------- PID (optional: process model sliders, ON/OFF control, tuning rules) ----------------
  function pid(host, cfg, touch) {
    frame(host);
    var base = { sp: 60, kp: 2, ti: 61, td: 0, dist: false, K: 1, tau: 10, theta: 2.5, mode: "pid", hyst: 6 };
    var d = Object.assign({}, base);
    var ctl = [["sp", "Setpoint (SP)", 0, 100, 1, "%"], ["kp", "Gain  Kp", 0, 20, 0.1, ""], ["ti", "Integral time  Ti", 0.5, 61, 0.5, " s"], ["td", "Derivative time  Td", 0, 10, 0.5, " s"]];
    if (cfg.process) ctl = ctl.concat([["K", "Process gain  K", 0.2, 3, 0.1, ""], ["tau", "Time constant  τ", 2, 30, 1, " s"], ["theta", "Dead time  θ", 0.5, 8, 0.5, " s"]]);
    if (cfg.onoff) ctl.push(["hyst", "ON/OFF hysteresis", 0, 30, 1, "%"]);
    var h = head(cfg.title || "PID loop simulator", "Process: first-order lag plus dead time. Simulation runs 4x real time.");
    if (cfg.onoff) h += '<div class="spctl"><span class="spl">Controller</span><button type="button" class="spb sel" data-mode="pid">PID</button><button type="button" class="spb" data-mode="onoff">ON / OFF with hysteresis</button></div>';
    h += '<div class="pidctl">';
    ctl.forEach(function (c) { h += '<label class="pid-c" data-row="' + c[0] + '"><span>' + c[1] + ' <b data-v="' + c[0] + '"></b></span><input type="range" data-k="' + c[0] + '" min="' + c[2] + '" max="' + c[3] + '" step="' + c[4] + '"></label>'; });
    h += '</div><div class="pidbtn"><button type="button" data-p="p">P only</button><button type="button" data-p="pi">PI</button><button type="button" data-p="pid">PID</button><button type="button" data-p="bad">Too aggressive</button>' +
      '<button type="button" class="dist" data-dist>Disturbance: OFF</button></div>';
    if (cfg.process) h += '<div class="pidbtn tunebtn"><span class="spl">Tuning rules</span><button type="button" data-t="simc">SIMC (PI)</button><button type="button" data-t="znpi">Ziegler-Nichols (PI)</button><button type="button" data-t="znpid">Ziegler-Nichols (PID)</button><button type="button" data-t="chrpi">CHR 0% overshoot (PI)</button><button type="button" data-t="chrpid">CHR 0% overshoot (PID)</button></div><div class="tunetxt"></div>';
    h += '<div class="pidchart"></div><div class="piddata"></div>';
    host.innerHTML = h;
    var presets = { p: [2, 61, 0], pi: [2, 8, 0], pid: [2.5, 8, 1.5], bad: [6, 2, 0] };
    var chart = host.querySelector(".pidchart"), data = host.querySelector(".piddata"), tune = host.querySelector(".tunetxt");
    var s, hist;
    function nDelay() { return Math.max(1, Math.round(d.theta / 0.1)); }
    function resetSim() { s = { pv: 0, I: 0, last: 0, df: 0, buf: new Array(nDelay()).fill(0), u: 0, t: 0 }; hist = []; }
    function ultimate() {
      var lo = 1e-4, hi = Math.PI / d.theta, f = function (w) { return Math.atan(w * d.tau) + w * d.theta - Math.PI; };
      for (var i = 0; i < 60; i++) { var m = (lo + hi) / 2; if (f(m) < 0) lo = m; else hi = m; }
      var wu = (lo + hi) / 2; return { Ku: Math.sqrt(1 + Math.pow(wu * d.tau, 2)) / d.K, Tu: 2 * Math.PI / wu };
    }
    function applyTune(kind) {
      var kp, ti, td = 0, label, u = ultimate();
      if (kind === "simc") { kp = d.tau / (d.K * 2 * d.theta); ti = Math.min(d.tau, 8 * d.theta); label = "SIMC rule with τc = θ: Kp = τ / (K · 2θ), Ti = min(τ, 8θ)"; }
      else if (kind === "znpi") { kp = 0.45 * u.Ku; ti = u.Tu / 1.2; label = "Ziegler-Nichols PI: Kp = 0.45·Ku, Ti = Tu / 1.2"; }
      else if (kind === "znpid") { kp = 0.6 * u.Ku; ti = u.Tu / 2; td = u.Tu / 8; label = "Ziegler-Nichols PID: Kp = 0.6·Ku, Ti = Tu / 2, Td = Tu / 8"; }
      else if (kind === "chrpi") { kp = 0.35 * d.tau / (d.K * d.theta); ti = 1.2 * d.tau; label = "CHR (0% overshoot, set-point) PI: Kp = 0.35·τ/(Kθ), Ti = 1.2τ"; }
      else { kp = 0.6 * d.tau / (d.K * d.theta); ti = d.tau; td = 0.5 * d.theta; label = "CHR (0% overshoot, set-point) PID: Kp = 0.6·τ/(Kθ), Ti = τ, Td = 0.5θ"; }
      d.kp = Math.max(0, Math.min(20, Math.round(kp * 10) / 10)); d.ti = Math.max(0.5, Math.min(60, Math.round(ti * 2) / 2)); d.td = Math.max(0, Math.min(10, Math.round(td * 2) / 2)); d.mode = "pid";
      tuneInfo = label + "  →  Kp " + d.kp + ", Ti " + d.ti + " s, Td " + d.td + " s"; resetSim(); sync();
    }
    var tuneInfo = "";
    function sync() {
      ctl.forEach(function (c) {
        var i = host.querySelector('input[data-k="' + c[0] + '"]'); i.value = d[c[0]];
        host.querySelector('b[data-v="' + c[0] + '"]').textContent = (c[0] === "ti" && d.ti >= 61) ? "off" : d[c[0]] + c[5];
      });
      host.querySelector("[data-dist]").textContent = "Disturbance: " + (d.dist ? "ON" : "OFF");
      host.querySelector("[data-dist]").classList.toggle("on", d.dist);
      host.querySelectorAll("[data-mode]").forEach(function (b) { b.classList.toggle("sel", b.getAttribute("data-mode") === d.mode); });
      ["kp", "ti", "td"].forEach(function (k) { var r = host.querySelector('[data-row="' + k + '"]'); if (r) r.style.opacity = d.mode === "onoff" ? ".35" : "1"; });
      var hr = host.querySelector('[data-row="hyst"]'); if (hr) hr.style.opacity = d.mode === "onoff" ? "1" : ".35";
      if (tune) { var u = ultimate(); tune.innerHTML = '<span class="chip"><i>K</i> ' + d.K + '</span><span class="chip"><i>τ</i> ' + d.tau + ' s</span><span class="chip"><i>θ</i> ' + d.theta + ' s</span><span class="chip hi"><i>Ku</i> ' + u.Ku.toFixed(2) + '</span><span class="chip hi"><i>Tu</i> ' + u.Tu.toFixed(1) + ' s</span>' + (tuneInfo ? '<div class="tuneinfo">' + esc(tuneInfo) + "</div>" : '<div class="tuneinfo">Ku is the gain at which the loop would oscillate steadily, and Tu is the period of that oscillation. Pick a rule to set Kp, Ti and Td.</div>'); }
    }
    host.querySelectorAll("input[data-k]").forEach(function (i) { i.addEventListener("input", function () { var k = i.getAttribute("data-k"); d[k] = parseFloat(i.value); if (k === "theta") resetSim(); if (k === "K" || k === "tau" || k === "theta") tuneInfo = ""; sync(); if (touch) touch(); }); });
    host.querySelectorAll("[data-p]").forEach(function (b) { b.addEventListener("click", function () { var p = presets[b.getAttribute("data-p")]; d.kp = p[0]; d.ti = p[1]; d.td = p[2]; d.mode = "pid"; tuneInfo = ""; sync(); if (touch) touch(); }); });
    host.querySelectorAll("[data-t]").forEach(function (b) { b.addEventListener("click", function () { applyTune(b.getAttribute("data-t")); if (touch) touch(); }); });
    host.querySelectorAll("[data-mode]").forEach(function (b) { b.addEventListener("click", function () { d.mode = b.getAttribute("data-mode"); s.I = 0; if (d.mode === "onoff") s.u = s.pv >= d.sp ? 0 : 100; sync(); if (touch) touch(); }); });
    host.querySelector("[data-dist]").addEventListener("click", function () { d.dist = !d.dist; sync(); if (touch) touch(); });
    host.querySelector(".simreset").addEventListener("click", function () { d = Object.assign({}, base); tuneInfo = ""; resetSim(); sync(); });
    function step(dt) {
      var e = d.sp - s.pv, u, un;
      if (d.mode === "onoff") { if (s.pv < d.sp - d.hyst / 2) u = 100; else if (s.pv > d.sp + d.hyst / 2) u = 0; else u = s.u; }
      else {
        var Ti = d.ti >= 61 ? 0 : d.ti, dpv = (s.pv - s.last) / dt; s.df += (dpv - s.df) * 0.3; if (!Ti) s.I = 0;
        un = d.kp * e + s.I - d.kp * d.td * s.df; u = Math.max(0, Math.min(100, un));
        if (Ti > 0 && (u === un || (un > 100 && e < 0) || (un < 0 && e > 0))) s.I += d.kp / Ti * e * dt;
      }
      s.last = s.pv; s.u = u; s.buf.push(u); var ud = s.buf.shift();
      s.pv += dt * (d.K * (ud - (d.dist ? 20 : 0)) - s.pv) / d.tau; s.pv = Math.max(0, Math.min(100, s.pv)); s.t += dt;
    }
    function draw() {
      var W = 640, Ht = 230, x0 = 38, x1 = 628, y0 = 12, y1 = 200, N = 300;
      function X(i) { return x0 + (x1 - x0) * i / N; } function Y(v) { return y1 - (y1 - y0) * v / 100; }
      var g = "";
      for (var v = 0; v <= 100; v += 25) g += '<line class="pg" x1="' + x0 + '" x2="' + x1 + '" y1="' + Y(v) + '" y2="' + Y(v) + '"/><text x="' + (x0 - 6) + '" y="' + (Y(v) + 4) + '" text-anchor="end" class="pt">' + v + "</text>";
      function line(key, cls) { var p = ""; hist.forEach(function (hh, i) { p += (i ? "L" : "M") + X(i).toFixed(1) + "," + Y(hh[key]).toFixed(1); }); return p ? '<path class="' + cls + '" d="' + p + '"/>' : ""; }
      var sp = ""; hist.forEach(function (hh, i) { sp += (i ? "L" : "M") + X(i).toFixed(1) + "," + Y(hh.sp).toFixed(1); });
      var band = d.mode === "onoff" ? '<rect x="' + x0 + '" y="' + Y(d.sp + d.hyst / 2) + '" width="' + (x1 - x0) + '" height="' + (Y(d.sp - d.hyst / 2) - Y(d.sp + d.hyst / 2)) + '" fill="rgba(255,159,74,.10)"/>' : "";
      var svg = '<svg viewBox="0 0 ' + W + " " + Ht + '" class="pidsvg" role="img" aria-label="PID response chart">' + g + band +
        '<path class="p-sp" d="' + sp + '"/>' + line("u", "p-u") + line("pv", "p-pv") +
        '<g transform="translate(' + (x0 + 8) + ',' + (Ht - 10) + ')"><text class="pt" x="0" y="0" fill="#ff9f4a">— SP</text><text class="pt" x="70" y="0" fill="#3df08c">— PV (measured)</text><text class="pt" x="210" y="0" fill="#8d9aa5">— Output</text><text class="pt" x="300" y="0">rolling window: 150 s</text></g></svg>';
      chart.innerHTML = svg;
      var e = d.sp - s.pv;
      data.innerHTML = '<span class="chip"><i>SP</i> ' + d.sp.toFixed(0) + '</span><span class="chip hi"><i>PV</i> ' + s.pv.toFixed(1) + '</span><span class="chip"><i>Error</i> ' + e.toFixed(1) + '</span><span class="chip"><i>Output</i> ' + s.u.toFixed(0) + ' %</span>';
    }
    resetSim(); sync();
    var tm = setInterval(function () {
      if (!document.body.contains(host)) { clearInterval(tm); return; }
      for (var k = 0; k < 4; k++) step(0.1);
      hist.push({ sp: d.sp, pv: s.pv, u: s.u }); if (hist.length > 300) hist.shift();
      draw();
    }, 100);
    track(tm);
  }

  // ---------------- subnet ----------------
  function ip2n(s) { var p = String(s).trim().split("."); if (p.length !== 4) return null; var n = 0; for (var i = 0; i < 4; i++) { if (!/^\d{1,3}$/.test(p[i]) || +p[i] > 255) return null; n = n * 256 + +p[i]; } return n; }
  function n2ip(n) { return [n >>> 24 & 255, n >>> 16 & 255, n >>> 8 & 255, n & 255].join("."); }
  function subnet(host, cfg, touch) {
    frame(host);
    var masks = [["255.255.255.0", "/24"], ["255.255.0.0", "/16"], ["255.255.255.128", "/25"], ["255.255.255.192", "/26"], ["255.255.255.240", "/28"]];
    var h = head(cfg.title || "IP subnet checker", "Can these two devices talk without a router?");
    h += '<div class="subgrid"><label>Engineering PC<input type="text" data-i="a" value="192.168.0.10" spellcheck="false"></label>' +
      '<label>PLC<input type="text" data-i="b" value="192.168.1.1" spellcheck="false"></label>' +
      '<label>Subnet mask<select data-i="m">' + masks.map(function (m) { return '<option value="' + m[0] + '">' + m[0] + "  " + m[1] + "</option>"; }).join("") + "</select></label></div>" +
      '<div class="pidbtn"><button type="button" data-ex="192.168.0.10|192.168.0.1|255.255.255.0">Same subnet</button><button type="button" data-ex="192.168.0.10|192.168.1.1|255.255.255.0">Different subnet</button><button type="button" data-ex="192.168.0.10|192.168.0.10|255.255.255.0">Duplicate address</button><button type="button" data-ex="192.168.0.10|192.168.0.200|255.255.255.128">Mask /25</button></div><div class="subout"></div>';
    host.innerHTML = h;
    var out = host.querySelector(".subout");
    function q(k) { return host.querySelector('[data-i="' + k + '"]'); }
    function run() {
      var a = ip2n(q("a").value), b = ip2n(q("b").value), m = ip2n(q("m").value), r = "";
      if (a === null || b === null) { out.innerHTML = '<div class="subres bad">Enter four numbers from 0 to 255 separated by dots.</div>'; return; }
      var na = (a & m) >>> 0, nb = (b & m) >>> 0, bc = (na | (~m >>> 0)) >>> 0;
      var same = na === nb;
      r += '<div class="subres ' + (a === b ? "bad" : same ? "ok" : "bad") + '">' + (a === b ? "✖ Duplicate address: both devices have the same IP. Neither will work reliably." : same ? "✔ Same subnet: they can communicate directly." : "✖ Different subnets: they cannot talk directly. A router (gateway) would be needed.") + "</div>";
      r += '<div class="subtbl"><span>PC network</span><b>' + n2ip(na) + '</b><span>PLC network</span><b>' + n2ip(nb) + "</b><span>Subnet range</span><b>" + n2ip(na + 1) + " to " + n2ip(bc - 1) + "</b><span>Broadcast</span><b>" + n2ip(bc) + "</b></div>";
      out.innerHTML = r;
    }
    host.querySelectorAll("input,select").forEach(function (e) { e.addEventListener("input", function () { run(); if (touch) touch(); }); });
    host.querySelectorAll("[data-ex]").forEach(function (b) { b.addEventListener("click", function () { var p = b.getAttribute("data-ex").split("|"); q("a").value = p[0]; q("b").value = p[1]; q("m").value = p[2]; run(); if (touch) touch(); }); });
    host.querySelector(".simreset").addEventListener("click", function () { q("a").value = "192.168.0.10"; q("b").value = "192.168.1.1"; q("m").value = "255.255.255.0"; run(); });
    run();
  }

  // ---------------- alarm lifecycle ----------------
  function alarm(host, cfg, touch) {
    frame(host);
    var h = head(cfg.title || "Alarm life cycle", "Raise the fault, then acknowledge it, in different orders");
    h += '<div class="simin"><div class="simctl"><button type="button" class="simbtn switch" data-sw><span class="knob"></span><span class="lbl">Fault</span></button><div class="cap"><b>Tank_High_Level</b> <span class="addr">DB_Alarm.Word0.Bit0</span><br><span class="sub">Fault condition from the PLC</span></div></div>' +
      '<div class="simctl"><button type="button" class="simbtn push" data-ack><span class="knob"></span><span class="lbl">Ack</span></button><div class="cap"><b>Acknowledge</b><br><span class="sub">Operator confirms the alarm</span></div></div>' +
      '<div class="simlamp" data-horn><svg viewBox="0 0 40 40" class="lampico"><circle cx="20" cy="20" r="14" class="mc" style="--c:#ff6b5e"/></svg><div class="cap"><b>Horn</b><br><span class="sub">on while any alarm is unacknowledged</span></div></div></div>' +
      '<div class="almwrap"><table class="alm"><thead><tr><th>Arrived</th><th>Alarm text</th><th>Status</th><th>Acknowledged</th><th>Gone</th></tr></thead><tbody></tbody></table></div>';
    host.innerHTML = h;
    var t0 = Date.now(), cond = false, list = [], body = host.querySelector("tbody"), sw = host.querySelector("[data-sw]"), ack = host.querySelector("[data-ack]"), horn = host.querySelector("[data-horn]");
    function stamp() { var s = Math.floor((Date.now() - t0) / 1000); return ("0" + Math.floor(s / 60)).slice(-2) + ":" + ("0" + s % 60).slice(-2); }
    function draw() {
      var rows = list.slice().reverse().map(function (a) {
        var st, cls;
        if (a.gone && a.ack) { st = "Cleared"; cls = "cl"; } else if (a.gone) { st = "Gone, not acknowledged"; cls = "gu"; } else if (a.ack) { st = "Active, acknowledged"; cls = "aa"; } else { st = "ACTIVE, unacknowledged"; cls = "au"; }
        return '<tr class="' + cls + '"><td>' + a.t + "</td><td>Tank 1 high level</td><td>" + st + "</td><td>" + (a.ack || "") + "</td><td>" + (a.gone || "") + "</td></tr>";
      }).join("");
      body.innerHTML = rows || '<tr class="em"><td colspan="5">No alarms. Flip the Fault switch.</td></tr>';
      horn.classList.toggle("on", list.some(function (a) { return !a.ack; }));
    }
    sw.addEventListener("click", function () {
      cond = !cond; sw.classList.toggle("down", cond);
      if (cond) list.push({ t: stamp(), ack: null, gone: null }); else list.forEach(function (a) { if (!a.gone) a.gone = stamp(); });
      draw(); if (touch) touch();
    });
    ack.addEventListener("pointerdown", function (e) { e.preventDefault(); ack.classList.add("down"); list.forEach(function (a) { if (!a.ack) a.ack = stamp(); }); draw(); if (touch) touch(); });
    ["pointerup", "pointerleave", "pointercancel"].forEach(function (ev) { ack.addEventListener(ev, function () { ack.classList.remove("down"); }); });
    host.querySelector(".simreset").addEventListener("click", function () { list = []; cond = false; sw.classList.remove("down"); t0 = Date.now(); draw(); });
    draw();
  }

  // ---------------- bit builder ----------------
  function bits(host, cfg, touch) {
    frame(host);
    var w = cfg.width || 16, val = cfg.initial || 0, names = {};
    (cfg.bits || []).forEach(function (b) { names[b.n] = b; });
    var h = head(cfg.title || "Bit builder", cfg.sub || "Click a bit to flip it");
    h += '<div class="bitpre">' + (cfg.presets || []).map(function (p, i) { return '<button type="button" data-pre="' + i + '">' + esc(p.label) + "</button>"; }).join("") + '</div><div class="bitgrid"></div><div class="bitout"></div><ul class="bitlist"></ul>';
    host.innerHTML = h;
    var grid = host.querySelector(".bitgrid"), out = host.querySelector(".bitout"), list = host.querySelector(".bitlist");
    function hex(v) { return "16#" + ("0000" + v.toString(16).toUpperCase()).slice(-w / 4); }
    function draw() {
      var g = "";
      for (var i = w - 1; i >= 0; i--) {
        var on = (val >> i) & 1, nm = names[i];
        g += '<button type="button" class="bit' + (on ? " on" : "") + (nm ? " def" : "") + '" data-b="' + i + '" title="' + esc(nm ? nm.name : "bit " + i + " (not used)") + '"><i>' + i + "</i><b>" + on + "</b></button>";
      }
      grid.innerHTML = g;
      out.innerHTML = '<span class="chip hi"><i>' + esc(cfg.word || "Word") + '</i> ' + hex(val) + '</span><span class="chip"><i>decimal</i> ' + val + "</span>";
      list.innerHTML = (cfg.bits || []).map(function (b) { var on = (val >> b.n) & 1; return '<li class="' + (on ? "on" : "") + '"><code>bit ' + b.n + "</code> " + esc(b.name) + " <i>" + (on ? "= 1" : "= 0") + "</i></li>"; }).join("");
      grid.querySelectorAll(".bit").forEach(function (b) { b.addEventListener("click", function () { val ^= 1 << parseInt(b.getAttribute("data-b"), 10); draw(); if (touch) touch(); }); });
    }
    host.querySelectorAll("[data-pre]").forEach(function (b) { b.addEventListener("click", function () { val = cfg.presets[parseInt(b.getAttribute("data-pre"), 10)].value; draw(); if (touch) touch(); }); });
    host.querySelector(".simreset").addEventListener("click", function () { val = cfg.initial || 0; draw(); });
    draw();
  }

  var reg = { pid: pid, subnet: subnet, alarm: alarm, bits: bits };
  return { create: function (type, host, cfg, touch) { reg[type](host, cfg, touch); }, register: function (n, f) { reg[n] = f; }, util: { head: head, frame: frame, track: track, esc: esc } };
})();

