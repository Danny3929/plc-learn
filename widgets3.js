/* More playable widgets: encoder, profile, regplay, pidtank. Registered into Widgets. */
(function () {
  "use strict";
  var W = window.Widgets, U = W.util, esc = U.esc;
  function chip(label, val, hi) { return '<span class="chip' + (hi ? " hi" : "") + '"><i>' + esc(label) + "</i> " + esc(val) + "</span>"; }
  function bin(v, n) { var s = (v >>> 0).toString(2); while (s.length < n) s = "0" + s; return s.slice(-n); }

  // ---------------- incremental encoder (quadrature) ----------------
  W.register("encoder", function (host, cfg, touch) {
    U.frame(host);
    host.innerHTML = U.head(cfg.title || "Incremental encoder", "Turn the disc and watch channels A and B") +
      '<div class="spctl"><label class="spl">Slots <select data-n><option value="8">8</option><option value="12" selected>12</option><option value="24">24</option></select></label>' +
      '<button type="button" class="spb" data-step="-1">◀ one step</button><button type="button" class="spb" data-step="1">one step ▶</button>' +
      '<label class="spl">Spin <input type="range" min="-180" max="180" step="10" value="0" data-spin> <b data-spinv>0°/s</b></label>' +
      '<label class="spl">Decoding <select data-dec><option value="1">x1</option><option value="2">x2</option><option value="4" selected>x4</option></select></label></div>' +
      '<div class="encwrap"><div class="encdisc"></div><div class="encchart"></div></div><div class="piddata"></div>' +
      '<p class="enchint">Drag the disc with the mouse or finger. Direction is found by which channel changes first.</p>';
    var disc = host.querySelector(".encdisc"), chart = host.querySelector(".encchart"), data = host.querySelector(".piddata");
    var ang = 0, N = 12, spin = 0, dec = 4, count = 0, lastState = null, H = [], dirTxt = "stopped", lastMove = 0;
    function state() { var p = ang / 360 * N, f = p - Math.floor(p); var a = f < 0.5 ? 1 : 0, b = ((f - 0.25 + 1) % 1) < 0.5 ? 1 : 0; return { a: a, b: b, z: (((ang % 360) + 360) % 360) < 6 ? 1 : 0 }; }
    var seq = { "0,0": 0, "1,0": 1, "1,1": 2, "0,1": 3 };
    function update(prevAng) {
      var s = state(), key = s.a + "," + s.b, idx = seq[key];
      if (lastState !== null && idx !== lastState) {
        var diff = (idx - lastState + 4) % 4, step = diff === 1 ? 1 : diff === 3 ? -1 : 0;
        if (step) { var inc = (dec === 4) ? step : (dec === 2 ? ((idx % 2 === 0) ? step : 0) : ((idx === 0) ? step : 0)); count += inc; dirTxt = step > 0 ? "clockwise (A leads B)" : "counter-clockwise (B leads A)"; lastMove = Date.now(); }
      }
      lastState = idx;
      return s;
    }
    function drawDisc() {
      var slots = "", r = 78;
      for (var i = 0; i < N; i++) { var a0 = i / N * 360, a1 = (i + .5) / N * 360; slots += '<path d="' + arc(110, 110, 52, 76, a0, a1) + '" fill="#0b0e11"/>'; }
      disc.innerHTML = '<svg viewBox="0 0 220 220" class="encsvg"><g transform="rotate(' + ang + " 110 110)" + '"><circle cx="110" cy="110" r="84" fill="#d9dee2" stroke="#6a747c" stroke-width="3"/>' + slots + '<circle cx="110" cy="110" r="20" fill="#8a949b"/><line x1="110" y1="110" x2="110" y2="30" stroke="#ff8a1f" stroke-width="3"/><circle cx="110" cy="30" r="4" fill="#ff8a1f"/></g>' +
        '<rect x="104" y="14" width="12" height="46" fill="none" stroke="#3ddc84" stroke-width="2" rx="2"/><text x="110" y="10" text-anchor="middle" class="pt" fill="#3ddc84">sensors</text></svg>';
    }
    function arc(cx, cy, r0, r1, a0, a1) {
      function pt(r, a) { var t = (a - 90) * Math.PI / 180; return [cx + r * Math.cos(t), cy + r * Math.sin(t)]; }
      var p0 = pt(r1, a0), p1 = pt(r1, a1), p2 = pt(r0, a1), p3 = pt(r0, a0);
      return "M" + p0[0] + "," + p0[1] + " A" + r1 + "," + r1 + " 0 0 1 " + p1[0] + "," + p1[1] + " L" + p2[0] + "," + p2[1] + " A" + r0 + "," + r0 + " 0 0 0 " + p3[0] + "," + p3[1] + " Z";
    }
    function drawChart() {
      var svg = '<svg viewBox="0 0 520 190" class="pidsvg" role="img" aria-label="Encoder channel traces">', x0 = 34, sx = 480 / 200;
      [["A", 20, "#ff9f4a"], ["B", 80, "#4db3e0"], ["Z", 140, "#3ddc84"]].forEach(function (l) { svg += '<text x="6" y="' + (l[1] + 24) + '" class="pt" fill="' + l[2] + '">' + l[0] + '</text><line class="pg" x1="' + x0 + '" x2="514" y1="' + (l[1] + 36) + '" y2="' + (l[1] + 36) + '"/>'; });
      function line(key, y, col) { var d = ""; H.forEach(function (h, i) { var yy = y + (h[key] ? 4 : 36), x = x0 + i * sx; d += (i ? "L" + x.toFixed(1) + "," + (y + (H[i - 1][key] ? 4 : 36)) + "L" : "M") + x.toFixed(1) + "," + yy; }); return d ? '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="2.4"/>' : ""; }
      svg += line("a", 20, "#ff9f4a") + line("b", 80, "#4db3e0") + line("z", 140, "#3ddc84") + "</svg>";
      chart.innerHTML = svg;
    }
    function status() {
      var moving = Date.now() - lastMove < 400; if (!moving) dirTxt = "stopped";
      var s = state();
      data.innerHTML = chip("A", s.a, !!s.a) + chip("B", s.b, !!s.b) + chip("Position count", count, true) + chip("Direction", dirTxt, false) + chip("Counts per turn", N * dec, false) + chip("Angle", Math.round(((ang % 360) + 360) % 360) + "°", false);
    }
    var dragging = false;
    function angleFromEvent(e) { var r = disc.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, p = e.touches ? e.touches[0] : e; return Math.atan2(p.clientY - cy, p.clientX - cx) * 180 / Math.PI + 90; }
    var lastDrag = 0;
    disc.addEventListener("pointerdown", function (e) { dragging = true; lastDrag = angleFromEvent(e); disc.setPointerCapture(e.pointerId); if (touch) touch(); });
    disc.addEventListener("pointermove", function (e) { if (!dragging) return; var a = angleFromEvent(e), d = a - lastDrag; while (d > 180) d -= 360; while (d < -180) d += 360; stepAng(d); lastDrag = a; });
    ["pointerup", "pointercancel"].forEach(function (ev) { disc.addEventListener(ev, function () { dragging = false; }); });
    function stepAng(d) { var n = Math.max(1, Math.ceil(Math.abs(d) / 2)), per = d / n; for (var i = 0; i < n; i++) { ang += per; sample(); } }
    function sample() { var s = update(); H.push(s); if (H.length > 200) H.shift(); }
    host.querySelectorAll("[data-step]").forEach(function (b) { b.addEventListener("click", function () { stepAng(parseInt(b.getAttribute("data-step"), 10) * 360 / (N * 4) * 1.0); if (touch) touch(); }); });
    host.querySelector("[data-n]").addEventListener("change", function (e) { N = parseInt(e.target.value, 10); count = 0; lastState = null; H = []; });
    host.querySelector("[data-dec]").addEventListener("change", function (e) { dec = parseInt(e.target.value, 10); count = 0; });
    host.querySelector("[data-spin]").addEventListener("input", function (e) { spin = parseFloat(e.target.value); host.querySelector("[data-spinv]").textContent = spin + "°/s"; if (touch) touch(); });
    host.querySelector(".simreset").addEventListener("click", function () { ang = 0; count = 0; H = []; lastState = null; spin = 0; host.querySelector("[data-spin]").value = 0; host.querySelector("[data-spinv]").textContent = "0°/s"; });
    var last = Date.now(), tm = setInterval(function () {
      if (!document.body.contains(host)) { clearInterval(tm); return; }
      var n = Date.now(), dt = (n - last) / 1000; last = n;
      if (spin) stepAng(spin * dt); else if (!dragging) sample();
      drawDisc(); drawChart(); status();
    }, 50);
    U.track(tm); sample(); drawDisc(); drawChart(); status();
  });

  // ---------------- motion profile calculator ----------------
  W.register("profile", function (host, cfg, touch) {
    U.frame(host);
    var d = { dist: 400, vmax: 200, acc: 400 };
    host.innerHTML = U.head(cfg.title || "Motion profile calculator", "Distance, top speed and acceleration decide the move time") +
      '<div class="pidctl"><label class="pid-c"><span>Distance <b data-v="dist"></b></span><input type="range" data-k="dist" min="20" max="1000" step="10"></label>' +
      '<label class="pid-c"><span>Max velocity <b data-v="vmax"></b></span><input type="range" data-k="vmax" min="20" max="500" step="10"></label>' +
      '<label class="pid-c"><span>Acceleration <b data-v="acc"></b></span><input type="range" data-k="acc" min="50" max="2000" step="50"></label></div>' +
      '<div class="pidbtn"><button type="button" data-play>▶ Run the move</button></div><div class="pidchart"></div><div class="railwrap"></div><div class="piddata"></div>';
    var chart = host.querySelector(".pidchart"), rail = host.querySelector(".railwrap"), data = host.querySelector(".piddata");
    var tNow = null;
    function calc() {
      var a = d.acc, v = d.vmax, D = d.dist, ta = v / a, da = 0.5 * a * ta * ta, tri = 2 * da > D, tcr = 0, vp = v;
      if (tri) { ta = Math.sqrt(D / a); vp = a * ta; } else tcr = (D - 2 * da) / v;
      return { ta: ta, tcr: tcr, vp: vp, total: 2 * ta + tcr, tri: tri, da: tri ? D / 2 : da };
    }
    function vAt(c, t) { if (t < 0) return 0; if (t < c.ta) return d.acc * t; if (t < c.ta + c.tcr) return c.vp; if (t < c.total) return Math.max(0, c.vp - d.acc * (t - c.ta - c.tcr)); return 0; }
    function xAt(c, t) { t = Math.min(t, c.total); if (t < c.ta) return 0.5 * d.acc * t * t; if (t < c.ta + c.tcr) return c.da + c.vp * (t - c.ta); var td = t - c.ta - c.tcr; return c.da + c.vp * c.tcr + c.vp * td - 0.5 * d.acc * td * td; }
    function sync() { ["dist", "vmax", "acc"].forEach(function (k) { host.querySelector('input[data-k="' + k + '"]').value = d[k]; host.querySelector('b[data-v="' + k + '"]').textContent = d[k] + (k === "dist" ? " mm" : k === "vmax" ? " mm/s" : " mm/s²"); }); }
    function draw() {
      var c = calc(), W0 = 600, H0 = 210, x0 = 50, y0 = 180, px = 520 / c.total, py = 140 / Math.max(c.vp, d.vmax), pts = "M" + x0 + "," + y0;
      var svg = '<svg viewBox="0 0 640 ' + 232 + '" class="pidsvg" role="img" aria-label="Velocity profile">';
      svg += '<line class="pg" x1="' + x0 + '" x2="' + (x0 + 540) + '" y1="' + y0 + '" y2="' + y0 + '"/><line class="pg" x1="' + x0 + '" x2="' + x0 + '" y1="30" y2="' + y0 + '"/>';
      svg += '<path d="M' + x0 + "," + y0 + " L" + (x0 + c.ta * px) + "," + (y0 - c.vp * py) + " L" + (x0 + (c.ta + c.tcr) * px) + "," + (y0 - c.vp * py) + " L" + (x0 + c.total * px) + "," + y0 + ' Z" fill="rgba(255,138,31,.18)" stroke="#ff9f4a" stroke-width="3"/>';
      svg += '<line x1="' + x0 + '" x2="' + (x0 + 540) + '" y1="' + (y0 - d.vmax * py) + '" y2="' + (y0 - d.vmax * py) + '" stroke="#5b6772" stroke-dasharray="5 4"/><text x="' + (x0 + 542) + '" y="' + (y0 - d.vmax * py + 4) + '" class="pt">Vmax</text>';
      svg += '<text x="' + (x0 + c.ta * px / 2) + '" y="' + (y0 + 18) + '" text-anchor="middle" class="pt">accelerate ' + c.ta.toFixed(2) + ' s</text>';
      if (c.tcr > 0) svg += '<text x="' + (x0 + (c.ta + c.tcr / 2) * px) + '" y="' + (y0 + 18) + '" text-anchor="middle" class="pt">cruise ' + c.tcr.toFixed(2) + ' s</text>';
      svg += '<text x="' + (x0 + (c.ta + c.tcr + c.ta / 2) * px) + '" y="' + (y0 + 18) + '" text-anchor="middle" class="pt">decelerate</text>';
      if (tNow !== null) { var tx = x0 + Math.min(tNow, c.total) * px; svg += '<line x1="' + tx + '" x2="' + tx + '" y1="24" y2="' + y0 + '" stroke="#3df08c" stroke-width="2"/>'; }
      svg += '<text x="' + (x0 + 270) + '" y="22" text-anchor="middle" class="pt" fill="#e9edf0">area under the curve = ' + d.dist + ' mm</text></svg>';
      chart.innerHTML = svg;
      var pos = tNow === null ? 0 : xAt(c, tNow), frac = Math.min(1, pos / d.dist);
      rail.innerHTML = '<svg viewBox="0 0 640 60" class="pidsvg"><rect x="40" y="34" width="560" height="8" rx="4" fill="#3a4148"/><rect x="' + (40 + frac * 520) + '" y="12" width="40" height="26" rx="4" fill="#ff8a1f" stroke="#7a3d00"/><text x="40" y="58" class="pt">0</text><text x="600" y="58" text-anchor="end" class="pt">' + d.dist + ' mm</text></svg>';
      data.innerHTML = chip("Profile", c.tri ? "triangular (never reaches Vmax)" : "trapezoid", c.tri) + chip("Total time", c.total.toFixed(2) + " s", true) + chip("Peak speed", c.vp.toFixed(0) + " mm/s", false) + chip("Accel distance", c.da.toFixed(1) + " mm", false) + (tNow !== null ? chip("Now", vAt(c, tNow).toFixed(0) + " mm/s, " + xAt(c, tNow).toFixed(0) + " mm", false) : "");
    }
    host.querySelectorAll("input[data-k]").forEach(function (i) { i.addEventListener("input", function () { d[i.getAttribute("data-k")] = parseFloat(i.value); tNow = null; sync(); draw(); if (touch) touch(); }); });
    var last = Date.now(), tm = setInterval(function () {
      if (!document.body.contains(host)) { clearInterval(tm); return; }
      var n = Date.now(), dt = (n - last) / 1000; last = n;
      if (tNow !== null) { tNow += dt; if (tNow > calc().total + 0.3) tNow = null; draw(); }
    }, 40);
    U.track(tm);
    host.querySelector("[data-play]").addEventListener("click", function () { tNow = 0; if (touch) touch(); });
    host.querySelector(".simreset").addEventListener("click", function () { d = { dist: 400, vmax: 200, acc: 400 }; tNow = null; sync(); draw(); });
    sync(); draw();
  });

  // ---------------- registers, shift registers, counters ----------------
  W.register("regplay", function (host, cfg, touch) {
    U.frame(host);
    var modes = { up: "Binary counter (up)", down: "Binary counter (down)", shr: "Shift register (right)", shl: "Shift register (left)", ring: "Ring counter", johnson: "Johnson counter", load: "Parallel-load register" };
    host.innerHTML = U.head(cfg.title || "Registers and counters", "Eight flip-flops, one clock") +
      '<div class="spctl"><label class="spl">Circuit <select data-mode>' + Object.keys(modes).map(function (k) { return '<option value="' + k + '">' + modes[k] + "</option>"; }).join("") + '</select></label>' +
      '<button type="button" class="spb hot" data-clk>Clock ↑</button><label class="spl">Auto <input type="range" min="0" max="6" step="1" value="0" data-auto> <b data-autov>off</b></label>' +
      '<button type="button" class="simbtn switch" data-sin><span class="knob"></span><span class="lbl">Serial in</span></button></div>' +
      '<div class="regbits"></div><div class="piddata"></div><div class="regwave"></div><p class="enchint regnote"></p>';
    var bits = host.querySelector(".regbits"), data = host.querySelector(".piddata"), wave = host.querySelector(".regwave"), note = host.querySelector(".regnote");
    var mode = "up", v = 0, sin = 0, pre = 0, hist = [], clocks = 0, autoHz = 0, acc = 0;
    var notes = { up: "Each flip-flop toggles when the one below it falls from 1 to 0, so every stage halves the clock frequency. Bit 0 is the clock divided by 2, bit 1 by 4, and so on.", down: "The same circuit counting backwards. It wraps from 0 to 255.", shr: "On each clock every bit moves one place right. The bit on the left comes from Serial in. A register that can shift is how serial data becomes parallel data.", shl: "Every bit moves one place left; Serial in enters on the right. Shifting left once doubles the number.", ring: "Exactly one bit is 1 and it circulates. Used to sequence steps, one output per step.", johnson: "A shift register that feeds the inverted last bit back. It makes 2 x N distinct states, so 16 for 8 bits, with only one bit changing at a time.", load: "Click the bit boxes to set a value, then clock it in. A register just stores bits until the next clock edge." };
    function reset() { v = mode === "ring" ? 1 : 0; hist = []; clocks = 0; record(); }
    function record() { hist.push(v); if (hist.length > 24) hist.shift(); }
    function clock() {
      if (mode === "up") v = (v + 1) & 255; else if (mode === "down") v = (v - 1) & 255;
      else if (mode === "shr") v = (v >> 1) | (sin << 7); else if (mode === "shl") v = ((v << 1) & 255) | sin;
      else if (mode === "ring") v = ((v << 1) & 255) | ((v >> 7) & 1); else if (mode === "johnson") v = (v >> 1) | ((~v & 1) << 7); else if (mode === "load") v = pre;
      clocks++; record();
    }
    function draw() {
      var h = "";
      for (var i = 7; i >= 0; i--) { var on = (v >> i) & 1; h += '<button type="button" class="ff' + (on ? " on" : "") + '" data-b="' + i + '"><i>bit ' + i + "</i><b>" + on + "</b></button>"; }
      bits.innerHTML = h;
      bits.querySelectorAll(".ff").forEach(function (b) { b.addEventListener("click", function () { var i = parseInt(b.getAttribute("data-b"), 10); if (mode === "load") { pre ^= (1 << i); v ^= (1 << i); record(); } else { v ^= (1 << i); record(); } draw(); if (touch) touch(); }); });
      data.innerHTML = chip("Binary", bin(v, 8), true) + chip("Decimal", v, false) + chip("Hex", "16#" + ("0" + v.toString(16).toUpperCase()).slice(-2), false) + chip("Clocks", clocks, false);
      var svg = '<svg viewBox="0 0 640 ' + (8 * 22 + 12) + '" class="pidsvg" role="img" aria-label="Flip-flop outputs over the last clock pulses">', x0 = 56, sx = 570 / 24;
      for (var b = 7; b >= 0; b--) {
        var y = 6 + (7 - b) * 22, d = "";
        hist.forEach(function (s, k) { var yy = y + (((s >> b) & 1) ? 3 : 15), x = x0 + k * sx; d += (k ? "L" + x.toFixed(1) + "," + (y + (((hist[k - 1] >> b) & 1) ? 3 : 15)) + "L" : "M") + x.toFixed(1) + "," + yy; if (k === hist.length - 1) d += "L" + (x + sx).toFixed(1) + "," + yy; });
        svg += '<text x="8" y="' + (y + 13) + '" class="pt">bit ' + b + '</text>' + (d ? '<path d="' + d + '" fill="none" stroke="' + (b % 2 ? "#4db3e0" : "#ff9f4a") + '" stroke-width="2"/>' : "");
      }
      wave.innerHTML = svg + "</svg>"; note.textContent = notes[mode];
    }
    host.querySelector("[data-mode]").addEventListener("change", function (e) { mode = e.target.value; pre = 0; reset(); draw(); if (touch) touch(); });
    host.querySelector("[data-clk]").addEventListener("click", function () { clock(); draw(); if (touch) touch(); });
    host.querySelector("[data-sin]").addEventListener("click", function (e) { sin ^= 1; e.currentTarget.classList.toggle("down", !!sin); });
    host.querySelector("[data-auto]").addEventListener("input", function (e) { autoHz = parseInt(e.target.value, 10); host.querySelector("[data-autov]").textContent = autoHz ? autoHz + " Hz" : "off"; });
    host.querySelector(".simreset").addEventListener("click", function () { reset(); draw(); });
    var last = Date.now(), tm = setInterval(function () { if (!document.body.contains(host)) { clearInterval(tm); return; } var n = Date.now(); acc += (n - last) / 1000 * autoHz; last = n; var ticks = Math.floor(acc); if (ticks > 0) { acc -= ticks; for (var k = 0; k < ticks; k++) clock(); draw(); } }, 50);
    U.track(tm); reset(); draw();
  });

  // ---------------- tank level PID lab (air-to-close valve, "invert control logic") ----------------
  W.register("pidtank", function (host, cfg, touch) {
    U.frame(host);
    var d = { sp: 15, kp: 30, ti: 1.5, td: 0.25, inv: false, dist: false };
    host.innerHTML = U.head(cfg.title || "PID lab: tank level", "Air-to-close inflow valve. Level 0 to 25 cm. Runs at 2x speed.") +
      '<div class="pidctl"><label class="pid-c"><span>Setpoint <b data-v="sp"></b></span><input type="range" data-k="sp" min="2" max="25" step="0.5"></label>' +
      '<label class="pid-c"><span>Gain Kp <b data-v="kp"></b></span><input type="range" data-k="kp" min="0" max="60" step="1"></label>' +
      '<label class="pid-c"><span>Integral time Ti <b data-v="ti"></b></span><input type="range" data-k="ti" min="0" max="10" step="0.1"></label>' +
      '<label class="pid-c"><span>Derivative time Td <b data-v="td"></b></span><input type="range" data-k="td" min="0" max="2" step="0.05"></label></div>' +
      '<div class="pidbtn"><button type="button" data-p="lab">Lab values</button><button type="button" data-p="p">P only</button><button type="button" data-p="pi">PI</button>' +
      '<label class="hpc"><input type="checkbox" data-inv> Invert control logic</label><button type="button" class="dist" data-dist>Drain disturbance: OFF</button></div>' +
      '<div class="tankrow"><div class="tankscene"></div><div class="pidchart"></div></div><div class="piddata"></div><p class="enchint tanknote"></p>';
    var scene = host.querySelector(".tankscene"), chart = host.querySelector(".pidchart"), data = host.querySelector(".piddata"), note = host.querySelector(".tanknote");
    var presets = { lab: [30, 1.5, 0.25], p: [10, 0, 0], pi: [10, 3, 0] };
    var s, hist;
    function resetSim() { s = { level: 5, open: 1, I: 0, last: 5, df: 0, u: 0, t: 0 }; hist = []; }
    function sync() {
      [["sp", " cm"], ["kp", ""], ["ti", " s"], ["td", " s"]].forEach(function (p) { host.querySelector('input[data-k="' + p[0] + '"]').value = d[p[0]]; host.querySelector('b[data-v="' + p[0] + '"]').textContent = (p[0] === "ti" && d.ti === 0 ? "off" : d[p[0]] + p[1]); });
      host.querySelector("[data-inv]").checked = d.inv; var b = host.querySelector("[data-dist]"); b.textContent = "Drain disturbance: " + (d.dist ? "ON" : "OFF"); b.classList.toggle("on", d.dist);
    }
    function step(dt) {
      var e = d.inv ? s.level - d.sp : d.sp - s.level, dpv = (s.level - s.last) / dt; s.last = s.level; s.df += (dpv - s.df) * 0.3; if (d.ti <= 0) s.I = 0;
      var un = d.kp * e + s.I + (d.inv ? 1 : -1) * d.kp * d.td * s.df, u = Math.max(0, Math.min(100, un));
      if (d.ti > 0 && (u === un || (un > 100 && e < 0) || (un < 0 && e > 0))) s.I += d.kp / d.ti * e * dt;
      s.u = u; s.open += dt * ((1 - u / 100) - s.open) / 0.4;
      s.level += dt * (12 * s.open - 0.4 * s.level - (d.dist ? 2 : 0)); s.level = Math.max(0, Math.min(30, s.level)); s.t += dt;
    }
    function draw() {
      var lv = s.level, h = 150 * lv / 30;
      scene.innerHTML = '<svg viewBox="0 0 220 230" class="pidsvg" role="img" aria-label="Tank with air-to-close valve">' +
        '<rect x="70" y="40" width="90" height="150" fill="#1d252b" stroke="#8a949b" stroke-width="3"/><rect x="73" y="' + (190 - h) + '" width="84" height="' + h + '" fill="#2d7fd0" opacity=".9"/>' +
        '<line x1="62" x2="168" y1="' + (190 - 150 * d.sp / 30) + '" y2="' + (190 - 150 * d.sp / 30) + '" stroke="#ff9f4a" stroke-dasharray="5 4" stroke-width="2"/>' +
        '<line x1="62" x2="168" y1="' + (190 - 150 * 25 / 30) + '" y2="' + (190 - 150 * 25 / 30) + '" stroke="#ff6b5e" stroke-dasharray="2 4"/><text x="172" y="' + (190 - 150 * 25 / 30 + 4) + '" class="pt" fill="#ff6b5e">25</text>' +
        '<text x="115" y="' + (190 - h / 2 + 5) + '" text-anchor="middle" class="pt" fill="#fff" font-size="14">' + lv.toFixed(1) + ' cm</text>' +
        '<rect x="10" y="22" width="62" height="10" fill="#8a949b"/><rect x="30" y="10" width="22" height="36" fill="#3a4148" stroke="#111"/><polygon points="' + (41 - 10) + ',12 ' + (41 + 10) + ',12 ' + (41 + 10 * (s.open > .5 ? 1 : 1)) + ',44 ' + (41 - 10) + ',44" fill="none"/>' +
        '<polygon points="31,16 41,28 31,40" fill="' + (s.open > .15 ? "#3ddc84" : "#555") + '"/><polygon points="51,16 41,28 51,40" fill="' + (s.open > .15 ? "#3ddc84" : "#555") + '"/><rect x="32" y="' + (28 - 12 * (1 - s.open)) + '" width="18" height="' + (24 * (1 - s.open)) + '" fill="#ff8a1f" opacity=".85"/>' +
        '<text x="4" y="62" class="pt">valve ' + Math.round(s.open * 100) + '% open</text><text x="4" y="76" class="pt">air-to-close</text>' +
        '<rect x="160" y="178" width="46" height="8" fill="#8a949b"/><text x="184" y="204" text-anchor="middle" class="pt">drain</text></svg>';
      var Wd = 560, Hd = 230, x0 = 38, x1 = 548, y0 = 14, y1 = 196, N = 300;
      function X(i) { return x0 + (x1 - x0) * i / N; } function Y(v, mx) { return y1 - (y1 - y0) * v / mx; }
      var g = ""; for (var v = 0; v <= 30; v += 5) g += '<line class="pg" x1="' + x0 + '" x2="' + x1 + '" y1="' + Y(v, 30) + '" y2="' + Y(v, 30) + '"/><text x="' + (x0 - 6) + '" y="' + (Y(v, 30) + 4) + '" text-anchor="end" class="pt">' + v + "</text>";
      function path(key, mx) { var p = ""; hist.forEach(function (hh, i) { p += (i ? "L" : "M") + X(i).toFixed(1) + "," + Y(hh[key], mx).toFixed(1); }); return p; }
      chart.innerHTML = '<svg viewBox="0 0 ' + Wd + " " + Hd + '" class="pidsvg" role="img" aria-label="Level response">' + g + '<path class="p-sp" d="' + path("sp", 30) + '"/><path class="p-u" d="' + path("u", 100) + '"/><path class="p-pv" d="' + path("lv", 30) + '"/>' +
        '<g transform="translate(46,224)"><text class="pt" x="0" y="0" fill="#ff9f4a">— SP (cm)</text><text class="pt" x="80" y="0" fill="#3df08c">— Level (cm)</text><text class="pt" x="170" y="0" fill="#8d9aa5">— Output (% scaled)</text></g></svg>';
      data.innerHTML = chip("SP", d.sp + " cm", false) + chip("Level", lv.toFixed(1) + " cm", true) + chip("Error", (d.sp - lv).toFixed(1), false) + chip("Output", s.u.toFixed(0) + " %", false) + chip("Valve", Math.round(s.open * 100) + " % open", false);
      var runaway = !d.inv && (lv < 0.3 || lv > 29.5) && s.t > 5;
      note.textContent = runaway ? "The level has run away. The valve closes when the output rises, so the controller must be reverse acting. Tick Invert control logic." : (d.inv ? "Invert control logic is ON: a level above the setpoint raises the output, which closes the air-to-close valve and lets the level fall. That is the right direction for this valve." : "Invert control logic is OFF. This valve closes as the output rises, so a level below the setpoint will push the valve even further closed. Watch what happens.");
    }
    host.querySelectorAll("input[data-k]").forEach(function (i) { i.addEventListener("input", function () { d[i.getAttribute("data-k")] = parseFloat(i.value); sync(); if (touch) touch(); }); });
    host.querySelectorAll("[data-p]").forEach(function (b) { b.addEventListener("click", function () { var p = presets[b.getAttribute("data-p")]; d.kp = p[0]; d.ti = p[1]; d.td = p[2]; sync(); if (touch) touch(); }); });
    host.querySelector("[data-inv]").addEventListener("change", function (e) { d.inv = e.target.checked; resetSim(); sync(); if (touch) touch(); });
    host.querySelector("[data-dist]").addEventListener("click", function () { d.dist = !d.dist; sync(); if (touch) touch(); });
    host.querySelector(".simreset").addEventListener("click", function () { d = { sp: 15, kp: 30, ti: 1.5, td: 0.25, inv: false, dist: false }; resetSim(); sync(); });
    resetSim(); sync();
    var tm = setInterval(function () { if (!document.body.contains(host)) { clearInterval(tm); return; } for (var k = 0; k < 4; k++) step(0.05); hist.push({ sp: d.sp, lv: s.level, u: s.u * 0.3 }); if (hist.length > 300) hist.shift(); draw(); }, 100);
    U.track(tm);
  });
})();
