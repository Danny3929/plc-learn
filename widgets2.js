/* Playable teaching widgets: scanplay, timerplay, statesim, hmiplay. Registered into Widgets. */
(function () {
  "use strict";
  var W = window.Widgets, U = W.util, esc = U.esc;
  function chip(label, val, hi) { return '<span class="chip' + (hi ? " hi" : "") + '"><i>' + esc(label) + "</i> " + esc(val) + "</span>"; }
  function onoff(v) { return v ? "ON" : "OFF"; }

  // ---------------- scan cycle in slow motion ----------------
  W.register("scanplay", function (host, cfg, touch) {
    U.frame(host);
    var steps = [["1", "Write outputs", "PIQ → output module"], ["2", "Read inputs", "input module → PII"], ["3", "Run program", "Lamp := Sensor"], ["4", "Housekeeping", "comms, diagnostics"]];
    host.innerHTML = U.head(cfg.title || "The scan cycle in slow motion", "Real scans take milliseconds. Here each step lasts about a second.") +
      '<div class="spctl"><button type="button" class="spb" data-play>⏸ Pause</button><button type="button" class="spb" data-step>Step ▶</button><label class="spl">Speed <select data-speed><option value="0.5">0.5x</option><option value="1" selected>1x</option><option value="2">2x</option></select></label>' +
      '<button type="button" class="simbtn switch" data-sw><span class="knob"></span><span class="lbl">Sensor</span></button><button type="button" class="spb hot" data-pulse>Pulse sensor (0.3 s)</button></div>' +
      '<div class="spstrip"></div><div class="spmem"></div><div class="splog"></div>';
    var strip = host.querySelector(".spstrip"), mem = host.querySelector(".spmem"), log = host.querySelector(".splog");
    var st, playing = true, sw = false, pulseUntil = 0, seenPulse = true, speed = 1, lines = [];
    function reset() { st = { step: 3, t: 0, pii: false, piq: false, phys: false }; lines = []; seenPulse = true; }
    function say(s) { lines.unshift(s); if (lines.length > 6) lines.pop(); }
    function live() { return sw || Date.now() < pulseUntil; }
    function enter(k) {
      st.step = k; st.t = 0;
      if (k === 0) { st.phys = st.piq; say("Step 1: outputs written. Physical lamp is now " + onoff(st.phys) + "."); }
      if (k === 1) { st.pii = live(); if (st.pii) seenPulse = true; say("Step 2: inputs read. The input image now holds Sensor = " + onoff(st.pii) + "."); }
      if (k === 2) { st.piq = st.pii; say("Step 3: program ran on the INPUT IMAGE (not the live pin). Output image = " + onoff(st.piq) + "."); }
      if (k === 3) say("Step 4: housekeeping. The scan is complete; the next one starts.");
    }
    function draw() {
      strip.innerHTML = steps.map(function (s, i) {
        var on = i === st.step, w = on ? Math.min(100, st.t / 1200 * 100 * 1) : (i < st.step ? 100 : 0);
        return '<div class="sps' + (on ? " on" : "") + '"><b>' + s[0] + "</b><span>" + s[1] + "</span><i>" + s[2] + '</i><div class="spp"><u style="width:' + w + '%"></u></div></div>';
      }).join("");
      var lv = live();
      mem.innerHTML = '<div class="spm live' + (lv ? " on" : "") + '"><i>LIVE INPUT (the real pin)</i><b>' + onoff(lv) + '</b></div><div class="spa">→</div><div class="spm' + (st.pii ? " on" : "") + '"><i>INPUT IMAGE (PII)</i><b>' + onoff(st.pii) + '</b></div><div class="spa">→</div><div class="spm' + (st.piq ? " on" : "") + '"><i>OUTPUT IMAGE (PIQ)</i><b>' + onoff(st.piq) + '</b></div><div class="spa">→</div><div class="spm lampm' + (st.phys ? " on" : "") + '"><i>PHYSICAL LAMP</i><b>' + onoff(st.phys) + "</b></div>";
      log.innerHTML = lines.map(function (l, i) { return '<div class="' + (i ? "old" : "new") + '">' + esc(l) + "</div>"; }).join("");
    }
    var last = Date.now(), tm = setInterval(function () {
      if (!document.body.contains(host)) { clearInterval(tm); return; }
      var now = Date.now(), dt = now - last; last = now;
      if (pulseUntil && now >= pulseUntil) { pulseUntil = 0; if (!seenPulse) { say("The sensor pulse is over and was NEVER seen: it happened between two input reads."); seenPulse = true; } }
      if (playing) { st.t += dt * speed; if (st.t >= 1200) enter((st.step + 1) % 4); }
      draw();
    }, 50);
    U.track(tm);
    host.querySelector("[data-play]").addEventListener("click", function (e) { playing = !playing; e.target.textContent = playing ? "⏸ Pause" : "▶ Play"; if (touch) touch(); });
    host.querySelector("[data-step]").addEventListener("click", function () { playing = false; host.querySelector("[data-play]").textContent = "▶ Play"; enter((st.step + 1) % 4); if (touch) touch(); });
    host.querySelector("[data-speed]").addEventListener("change", function (e) { speed = parseFloat(e.target.value); });
    host.querySelector("[data-sw]").addEventListener("click", function (e) { sw = !sw; e.currentTarget.classList.toggle("down", sw); if (touch) touch(); });
    host.querySelector("[data-pulse]").addEventListener("click", function () { pulseUntil = Date.now() + 300; seenPulse = false; say("Sensor pulsed for 0.3 s. Will the PLC notice?"); if (touch) touch(); });
    host.querySelector(".simreset").addEventListener("click", function () { reset(); sw = false; host.querySelector("[data-sw]").classList.remove("down"); pulseUntil = 0; draw(); });
    reset(); draw();
  });

  // ---------------- timer trace recorder ----------------
  W.register("timerplay", function (host, cfg, touch) {
    U.frame(host);
    host.innerHTML = U.head(cfg.title || "Timer trace recorder", "Switch IN on and off and watch IN, Q and ET trace out over time") +
      '<div class="spctl"><span class="spl">Timer</span><button type="button" class="spb sel" data-t="TON">TON</button><button type="button" class="spb" data-t="TOF">TOF</button><button type="button" class="spb" data-t="TP">TP</button>' +
      '<label class="spl">PT <input type="range" min="1" max="5" step="0.5" value="3" data-pt> <b data-ptv>3 s</b></label>' +
      '<button type="button" class="simbtn switch" data-sw><span class="knob"></span><span class="lbl">IN</span></button><button type="button" class="spb hot" data-pulse>Pulse IN (0.6 s)</button></div><div class="tpchart"></div><div class="piddata"></div>';
    var chart = host.querySelector(".tpchart"), data = host.querySelector(".piddata");
    var type = "TON", pt = 3, inSw = false, pulseUntil = 0, I, H;
    function reset() { I = { et: 0, q: false, prev: false, run: false }; H = []; }
    function inNow() { return inSw || Date.now() < pulseUntil; }
    function step(dt, inp) {
      if (type === "TON") { if (inp) { I.et = Math.min(I.et + dt, pt); I.q = I.et >= pt; } else { I.et = 0; I.q = false; } }
      else if (type === "TOF") { if (inp) { I.et = 0; I.q = true; } else if (I.q) { I.et = Math.min(I.et + dt, pt); if (I.et >= pt) I.q = false; } }
      else { if (inp && !I.prev && !I.run && I.et === 0) I.run = true; if (I.run) { I.et = Math.min(I.et + dt, pt); I.q = true; if (I.et >= pt) { I.run = false; I.q = false; } } else if (!inp) { I.et = 0; I.q = false; } I.prev = inp; }
    }
    function lane(key, y, hgt, col, scaleMax) {
      var d = ""; H.forEach(function (h, i) { var x = 40 + i * (600 / 400), v = key === "et" ? h.et / scaleMax : (h[key] ? 1 : 0), yy = y + hgt - v * hgt; d += (i ? "L" : "M") + x.toFixed(1) + "," + yy.toFixed(1); });
      return d ? '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="2.6" stroke-linejoin="round"/>' : "";
    }
    function draw() {
      var svg = '<svg viewBox="0 0 660 250" class="pidsvg" role="img" aria-label="Timer trace">';
      [["IN", 20, "#e9edf0"], ["Q", 90, "#3df08c"], ["ET", 160, "#ff9f4a"]].forEach(function (l) { svg += '<line class="pg" x1="40" x2="640" y1="' + (l[1] + 50) + '" y2="' + (l[1] + 50) + '"/><text x="8" y="' + (l[1] + 30) + '" class="pt" fill="' + l[2] + '">' + l[0] + "</text>"; });
      svg += '<line x1="40" x2="640" y1="' + (160 + 50 - 50 * pt / 5000) + '" y2="' + (160 + 50 - 50 * pt / 5000) + '" stroke="#5b6772" stroke-dasharray="4 4"/><text x="642" y="' + (160 + 54 - 50 * pt / 5000) + '" class="pt">PT</text>';
      svg += lane("in", 20, 40, "#e9edf0") + lane("q", 90, 40, "#3df08c") + lane("et", 160, 50, "#ff9f4a", 5000) + '<text x="640" y="244" text-anchor="end" class="pt">now →   (20 s window)</text></svg>';
      chart.innerHTML = svg;
      data.innerHTML = chip("IN", onoff(inNow()), inNow()) + chip("Q", onoff(I.q), I.q) + chip("ET", (I.et / 1000).toFixed(1) + " s", false) + chip("PT", (pt / 1000) + " s", false);
    }
    var last = Date.now(), tm = setInterval(function () {
      if (!document.body.contains(host)) { clearInterval(tm); return; }
      var now = Date.now(), dt = Math.min(now - last, 200); last = now; var inp = inNow();
      step(dt, inp); H.push({ in: inp, q: I.q, et: I.et }); if (H.length > 400) H.shift(); draw();
    }, 50);
    U.track(tm);
    host.querySelectorAll("[data-t]").forEach(function (b) { b.addEventListener("click", function () { type = b.getAttribute("data-t"); host.querySelectorAll("[data-t]").forEach(function (x) { x.classList.toggle("sel", x === b); }); reset(); if (touch) touch(); }); });
    host.querySelector("[data-pt]").addEventListener("input", function (e) { pt = parseFloat(e.target.value) * 1000; host.querySelector("[data-ptv]").textContent = (pt / 1000) + " s"; });
    host.querySelector("[data-sw]").addEventListener("click", function (e) { inSw = !inSw; e.currentTarget.classList.toggle("down", inSw); if (touch) touch(); });
    host.querySelector("[data-pulse]").addEventListener("click", function () { pulseUntil = Date.now() + 600; if (touch) touch(); });
    host.querySelector(".simreset").addEventListener("click", function () { reset(); inSw = false; host.querySelector("[data-sw]").classList.remove("down"); });
    pt = 3000; reset(); draw();
  });

  // ---------------- state machine you can drive ----------------
  W.register("statesim", function (host, cfg, touch) {
    U.frame(host);
    var names = ["IDLE", "STARTING", "RUNNING", "FAULT"], sub = ["motor off", "horn, 3 s delay", "motor on", "lamp, locked out"];
    host.innerHTML = U.head(cfg.title || "Drive the state machine", "This is the SCL from the lesson, running") +
      '<div class="spctl"><button type="button" class="spb" data-ev="start">Start</button><button type="button" class="spb" data-ev="stop">Stop</button><button type="button" class="spb" data-ev="reset">Fault reset</button>' +
      '<button type="button" class="simbtn switch down" data-ovl><span class="knob"></span><span class="lbl">Overload OK</span></button></div><div class="stsvg"></div><div class="piddata"></div><div class="splog"></div>';
    var box = host.querySelector(".stsvg"), data = host.querySelector(".piddata"), log = host.querySelector(".splog");
    var s, ev, ovl = true, lines = [];
    function reset() { s = { state: 0, ts: 0 }; ev = {}; lines = []; ovl = true; host.querySelector("[data-ovl]").classList.add("down"); }
    function say(m) { lines.unshift(m); if (lines.length > 6) lines.pop(); }
    function scan(dt) {
      var prev = s.state, why = "";
      if (!ovl && s.state !== 3) { s.state = 3; why = "overload tripped"; }
      s.ts = s.state === 1 ? s.ts + dt : 0; var q = s.ts >= 3000;
      if (!why) {
        if (s.state === 0 && ev.start) { s.state = 1; why = "Start pressed"; }
        else if (s.state === 1) { if (ev.stop) { s.state = 0; why = "Stop pressed"; } else if (q) { s.state = 2; why = "3 s delay finished"; } }
        else if (s.state === 2 && ev.stop) { s.state = 0; why = "Stop pressed"; }
        else if (s.state === 3 && ev.reset) { if (ovl) { s.state = 0; why = "fault reset, overload healthy"; } else say("Reset refused: the overload is still tripped."); }
      }
      if (ev.start && prev === 3) say("Start ignored: the machine is in FAULT.");
      if (s.state !== prev) say(names[prev] + " → " + names[s.state] + "  (" + why + ")");
      ev = {};
    }
    function draw() {
      var b = '<svg viewBox="0 0 700 150" class="pidsvg" role="img" aria-label="State machine">';
      names.forEach(function (n, i) {
        var x = 20 + i * 172, on = s.state === i, col = i === 3 ? "#ff6b5e" : (i === 2 ? "#3df08c" : "#ff9f4a");
        b += '<rect x="' + x + '" y="30" width="148" height="70" rx="6" fill="' + (on ? col : "#1b2228") + '" fill-opacity="' + (on ? .22 : 1) + '" stroke="' + (on ? col : "#4a5760") + '" stroke-width="' + (on ? 4 : 1.5) + '"' + (on ? ' style="filter:drop-shadow(0 0 8px ' + col + ')"' : "") + "/>" +
          '<text x="' + (x + 74) + '" y="62" text-anchor="middle" class="pt" fill="#e9edf0" font-size="14" font-weight="700">' + i + "  " + n + '</text><text x="' + (x + 74) + '" y="82" text-anchor="middle" class="pt">' + sub[i] + "</text>";
        if (i < 3) b += '<line x1="' + (x + 148) + '" y1="65" x2="' + (x + 172) + '" y2="65" stroke="#9fb0bd" stroke-width="2"/>';
      });
      if (s.state === 1) b += '<rect x="192" y="110" width="148" height="8" rx="4" fill="#2a343c"/><rect x="192" y="110" width="' + Math.min(148, s.ts / 3000 * 148) + '" height="8" rx="4" fill="#ff9f4a"/><text x="266" y="136" text-anchor="middle" class="pt">start delay ' + (s.ts / 1000).toFixed(1) + " / 3.0 s</text>";
      data.innerHTML = chip("State", s.state + " " + names[s.state], true) + chip("Horn", onoff(s.state === 1), s.state === 1) + chip("Motor", onoff(s.state === 2), s.state === 2) + chip("Fault lamp", onoff(s.state === 3), s.state === 3) + chip("Overload OK", ovl ? "1" : "0", ovl);
      box.innerHTML = b + "</svg>";
      log.innerHTML = lines.map(function (l, i) { return '<div class="' + (i ? "old" : "new") + '">' + esc(l) + "</div>"; }).join("") || '<div class="old">Press Start to begin.</div>';
    }
    var tm = setInterval(function () { if (!document.body.contains(host)) { clearInterval(tm); return; } scan(100); draw(); }, 100);
    U.track(tm);
    host.querySelectorAll("[data-ev]").forEach(function (b) { b.addEventListener("click", function () { ev[b.getAttribute("data-ev")] = true; if (touch) touch(); }); });
    host.querySelector("[data-ovl]").addEventListener("click", function (e) { ovl = !ovl; e.currentTarget.classList.toggle("down", ovl); if (touch) touch(); });
    host.querySelector(".simreset").addEventListener("click", function () { reset(); draw(); });
    reset(); draw();
  });

  // ---------------- HMI playground ----------------
  W.register("hmiplay", function (host, cfg, touch) {
    U.frame(host);
    host.innerHTML = U.head(cfg.title || "Playable HMI", "A tank filled by a pump. The screen requests; the PLC decides.") +
      '<div class="hpgrid"><div class="hpscreen"></div><div class="hpctl"><div class="hpb"><button type="button" class="hpbtn go" data-b="start">START</button><button type="button" class="hpbtn stop" data-b="stop">STOP</button></div>' +
      '<label class="hpl">Setpoint <b data-spv>70</b> %<input type="range" min="0" max="100" value="70" data-sp></label>' +
      '<label class="hpc"><input type="checkbox" data-val checked> PLC validates the setpoint (limit 85 %)</label><button type="button" class="hpbtn ack" data-b="ack">ACKNOWLEDGE ALARM</button><div class="hpnote"></div></div></div>';
    var scr = host.querySelector(".hpscreen"), note = host.querySelector(".hpnote");
    var s, sp = 70, val = true, ackFlag = false;
    function reset() { s = { level: 30, run: false, pump: false, alarm: false, acked: true, ph: 0, over: false }; }
    function step(dt) {
      var spUsed = val ? Math.min(sp, 85) : sp;
      if (s.run) { if (s.level < spUsed - 2) s.pump = true; else if (s.level >= spUsed) s.pump = false; } else s.pump = false;
      s.level = Math.max(0, Math.min(100, s.level + ((s.pump ? 8 : 0) - 2) * dt)); if (s.pump) s.ph = (s.ph + 40 * dt) % 20;
      var cond = s.level > 90; if (cond && !s.alarm) { s.alarm = true; s.acked = false; } if (!cond && s.alarm) { s.alarm = false; } s.over = s.level >= 100;
      if (ackFlag) { s.acked = true; ackFlag = false; }
    }
    function draw() {
      var wl = 150 * s.level / 100, blink = Math.floor(Date.now() / 500) % 2, b = '<svg viewBox="0 0 520 300" class="hpsvg" role="img" aria-label="HMI screen">' +
        '<rect width="520" height="300" rx="10" fill="#0e1114"/><rect x="10" y="10" width="500" height="280" rx="4" fill="#e6ebef"/><rect x="10" y="10" width="500" height="30" fill="#0b6b78"/><text x="22" y="31" fill="#fff" font-size="14" font-weight="700" font-family="Segoe UI,sans-serif">TANK 1  |  Overview</text>' +
        '<rect x="60" y="70" width="130" height="150" fill="#cfd6db" stroke="#7d8890" stroke-width="3"/><rect x="63" y="' + (70 + 150 - wl) + '" width="124" height="' + wl + '" fill="#2d7fd0" opacity=".9"/><text x="125" y="' + (70 + 150 - wl / 2 + 5) + '" text-anchor="middle" fill="#fff" font-size="16" font-weight="700" font-family="Segoe UI,sans-serif">' + Math.round(s.level) + ' %</text>' +
        '<line x1="55" x2="195" y1="' + (70 + 15) + '" y2="' + (70 + 15) + '" stroke="#d93a2b" stroke-dasharray="4 3"/><text x="200" y="88" fill="#d93a2b" font-size="11" font-family="Segoe UI,sans-serif">90 % alarm</text>' +
        '<rect x="190" y="190" width="40" height="12" fill="#8a949b"/><circle cx="260" cy="196" r="24" fill="' + (s.pump ? "#27b45c" : "#8a949b") + '" stroke="#444" stroke-width="2"/>' + (s.pump ? '<polygon points="252,184 252,208 274,196" fill="#fff"/><line x1="285" y1="196" x2="320" y2="196" stroke="#2d7fd0" stroke-width="4" stroke-dasharray="8 8" stroke-dashoffset="' + (-s.ph) + '"/>' : '<polygon points="252,184 252,208 274,196" fill="#666" opacity=".6"/>') +
        '<text x="260" y="236" text-anchor="middle" fill="#333" font-size="12" font-family="Segoe UI,sans-serif">Pump ' + (s.pump ? "RUNNING" : "stopped") + "</text>" +
        '<text x="330" y="100" fill="#333" font-size="12" font-family="Segoe UI,sans-serif">Setpoint (HMI): ' + sp + " %</text><text x=\"330\" y=\"120\" fill=\"#333\" font-size=\"12\" font-family=\"Segoe UI,sans-serif\">Setpoint used by PLC: " + (val ? Math.min(sp, 85) : sp) + " %</text><text x=\"330\" y=\"140\" fill=\"#333\" font-size=\"12\" font-family=\"Segoe UI,sans-serif\">Run request: " + (s.run ? "YES" : "no") + "</text>";
      if (s.alarm || !s.acked) b += '<rect x="20" y="256" width="480" height="26" fill="' + (s.alarm && !s.acked ? (blink ? "#d93a2b" : "#7a1f17") : (s.alarm ? "#d98a2b" : "#7a7f84")) + '"/><text x="30" y="274" fill="#fff" font-size="13" font-weight="700" font-family="Segoe UI,sans-serif">' + (s.alarm ? "▲ Tank 1 high level" : "Tank 1 high level (gone)") + (s.acked ? "   acknowledged" : "   UNACKNOWLEDGED") + "</text>";
      if (s.over) b += '<text x="330" y="190" fill="#d93a2b" font-size="22" font-weight="800" font-family="Segoe UI,sans-serif">OVERFLOW!</text>';
      scr.innerHTML = b + "</svg>";
      note.innerHTML = !val && sp > 90 ? "Validation is OFF and the setpoint is above the alarm limit: the PLC will let the tank overflow." : (val ? "The PLC clamps the setpoint to 85 %, so the HMI cannot cause an overflow." : "Validation is off. Try a setpoint above 90.");
    }
    var last = Date.now(), tm = setInterval(function () { if (!document.body.contains(host)) { clearInterval(tm); return; } var n = Date.now(), dt = Math.min((n - last) / 1000, .2); last = n; step(dt); draw(); }, 100);
    U.track(tm);
    host.querySelectorAll("[data-b]").forEach(function (b) { b.addEventListener("click", function () { var k = b.getAttribute("data-b"); if (k === "start") s.run = true; if (k === "stop") s.run = false; if (k === "ack") ackFlag = true; if (touch) touch(); }); });
    host.querySelector("[data-sp]").addEventListener("input", function (e) { sp = parseInt(e.target.value, 10); host.querySelector("[data-spv]").textContent = sp; });
    host.querySelector("[data-val]").addEventListener("change", function (e) { val = e.target.checked; if (touch) touch(); });
    host.querySelector(".simreset").addEventListener("click", function () { reset(); });
    reset(); draw();
  });
})();
