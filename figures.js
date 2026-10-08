/* SVG illustration library. Each figure is a function returning an SVG string; lessons use ["fig", "name", "caption"]. */
window.FIGS = {};
(function () {
  "use strict";
  var F = window.FIGS;

  function S(w, h, body, alt) {
    return '<svg class="figsvg" viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="' + alt + '">' +
      '<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" class="ah"/></marker></defs>' +
      body + "</svg>";
  }
  function T(x, y, s, c, a) { return '<text x="' + x + '" y="' + y + '"' + (a ? ' text-anchor="' + a + '"' : "") + (c ? ' class="' + c + '"' : "") + ">" + s + "</text>"; }
  function R(x, y, w, h, c, rx) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx == null ? 6 : rx) + '" class="' + (c || "b") + '"/>'; }
  function L(x1, y1, x2, y2, c, ar) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" class="' + (c || "ln") + '"' + (ar ? ' marker-end="url(#ah)"' : "") + "/>"; }
  function P(d, c, ar) { return '<path d="' + d + '" class="' + (c || "ln") + '" fill="none"' + (ar ? ' marker-end="url(#ah)"' : "") + "/>"; }
  function C(x, y, r, c) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" class="' + (c || "b") + '"/>'; }
  function N(x, y, k) { return '<circle cx="' + x + '" cy="' + y + '" r="11" class="cal"/>' + T(x, y + 4, k, "calt", "middle"); }
  function TL(x, y, lines, lh, c, a) { var s = ""; lines.forEach(function (l, i) { s += T(x, y + i * lh, l, c, a); }); return s; }

  // ---------- 2. Inside a PLC ----------
  F["plc-inside"] = function () {
    var b = "";
    b += R(250, 8, 200, 34, "w") + T(350, 30, "Power supply 24 V DC", "", "middle") + L(350, 42, 350, 62, "ln", 1);
    b += R(40, 72, 120, 200, "b") + T(100, 98, "Input module", "bold", "middle") + TL(100, 122, ["24 V signals", "from sensors", "become 0 / 1"], 18, "s m", "middle");
    b += R(540, 72, 120, 200, "b") + T(600, 98, "Output module", "bold", "middle") + TL(600, 122, ["0 / 1 become", "24 V signals", "to actuators"], 18, "s m", "middle");
    b += R(210, 62, 280, 238, "a") + T(350, 84, "CPU", "bold", "middle");
    b += R(222, 98, 80, 56, "b") + T(262, 122, "Input", "s", "middle") + T(262, 138, "image (PII)", "s", "middle");
    b += R(398, 98, 80, 56, "b") + T(438, 122, "Output", "s", "middle") + T(438, 138, "image (PIQ)", "s", "middle");
    b += R(310, 98, 80, 56, "g") + T(350, 122, "Program", "s bold", "middle") + T(350, 138, "OB1, FC, FB", "s", "middle");
    b += R(222, 166, 256, 40, "b") + T(350, 190, "Data: M bits, data blocks (DB), timers, counters", "s", "middle");
    b += R(222, 216, 80, 70, "n") + TL(262, 238, ["Load", "memory", "(program", "stored)"], 14, "s", "middle");
    b += R(310, 216, 80, 70, "n") + TL(350, 238, ["Work", "memory", "(program", "running)"], 14, "s", "middle");
    b += R(398, 216, 80, 70, "n") + TL(438, 238, ["Retentive", "memory", "(survives", "power off)"], 14, "s", "middle");
    b += L(160, 126, 222, 126, "ln", 1) + L(398, 126, 390, 126, "ln") + L(478, 126, 540, 126, "ln", 1) + L(302, 126, 310, 126, "ln");
    b += T(100, 296, "from field", "s m", "middle") + T(600, 296, "to field", "s m", "middle");
    return S(700, 306, b, "Inside a PLC: input module, CPU with input image, program, data memory and output image, and an output module");
  };

  // ---------- 3. Scan cycle ----------
  F["scan-cycle"] = function () {
    var b = "", items = [
      ["1", "Write outputs", "Output image (PIQ)", "goes to the output", "modules"],
      ["2", "Read inputs", "Input modules are", "copied into the input", "image (PII)"],
      ["3", "Run program", "OB1 executes, top to", "bottom, rung by rung,", "using the images"],
      ["4", "Housekeeping", "Communication,", "diagnostics, timers,", "HMI requests"]
    ];
    items.forEach(function (it, i) {
      var x = 20 + i * 180, cls = i === 2 ? "a" : "b";
      b += R(x, 50, 150, 130, cls) + C(x + 24, 74, 14, "cal") + T(x + 24, 79, it[0], "calt", "middle") + T(x + 44, 79, it[1], "bold") +
        TL(x + 14, 112, [it[2], it[3], it[4]], 20, "s");
      if (i < 3) b += L(x + 150, 115, x + 180, 115, "ln", 1);
    });
    b += P("M635,180 L635,226 L95,226 L95,180", "ln dash", 1);
    b += T(365, 248, "Repeat forever. One full pass is one scan cycle: typically 1 to 20 ms.", "s m", "middle");
    b += T(365, 28, "THE SCAN CYCLE", "bold m", "middle");
    b += R(60, 262, 610, 40, "w") + T(365, 287, "Inputs are frozen during step 3. Changes on the wire only show up on the next scan.", "", "middle");
    return S(730, 314, b, "The four steps of a PLC scan cycle repeating forever");
  };

  // ---------- 5. NO / NC ----------
  F["no-nc"] = function () {
    var b = "";
    function panel(x, title, nc) {
      var s = R(x, 10, 340, 250, "b") + T(x + 170, 36, title, "bold", "middle");
      s += L(x + 40, 90, x + 100, 90, "ln") + C(x + 100, 90, 3, "dot") + C(x + 240, 90, 3, "dot") + L(x + 240, 90, x + 300, 90, "ln");
      s += nc ? L(x + 100, 90, x + 240, 72, "ln") + L(x + 125, 62, x + 125, 90, "ln") : L(x + 100, 90, x + 235, 60, "ln");
      s += T(x + 170, 130, nc ? "Closed when NOT pressed" : "Open when NOT pressed", "s m", "middle");
      s += T(x + 40, 170, "Not pressed", "s bold") + T(x + 180, 170, nc ? "Signal 1" : "Signal 0", "s") + T(x + 260, 170, nc ? "(current flows)" : "(no current)", "s m");
      s += T(x + 40, 200, "Pressed", "s bold") + T(x + 180, 200, nc ? "Signal 0" : "Signal 1", "s") + T(x + 260, 200, nc ? "(circuit opens)" : "(current flows)", "s m");
      s += T(x + 170, 240, nc ? "Used for: stop, e-stop, guards" : "Used for: start, jog, selectors", "s m", "middle");
      return s;
    }
    b += panel(10, "Normally Open (NO)", false) + panel(380, "Normally Closed (NC)", true);
    return S(730, 272, b, "Normally open and normally closed contacts with their signal states");
  };

  // ---------- 6. Data types ----------
  F["data-types"] = function () {
    var b = "", cw = 14, x0 = 250;
    function row(y, name, rng, bits) {
      var s = T(10, y + 17, name, "bold") + T(10, y + 33, rng, "s m");
      for (var i = 0; i < bits; i++) {
        s += '<rect x="' + (x0 + i * cw) + '" y="' + y + '" width="' + cw + '" height="30" class="' + (i % 8 < 8 && Math.floor(i / 8) % 2 ? "a" : "b") + '"/>';
      }
      return s;
    }
    b += row(30, "BOOL", "1 bit: FALSE / TRUE", 1) + row(86, "BYTE  (USINT)", "8 bits: 0 to 255", 8) +
      row(142, "WORD  /  INT", "16 bits: INT is -32768 to 32767", 16) +
      row(198, "DWORD / DINT / REAL", "32 bits: REAL is a decimal number", 32);
    b += T(x0 + 7, 22, "bit", "s m", "middle") + T(x0 + 4 * cw, 78, "one byte = 8 bits", "s m", "middle") +
      T(x0 + 8 * cw, 134, "two bytes", "s m", "middle") + T(x0 + 16 * cw, 190, "four bytes", "s m", "middle");
    b += T(10, 262, "TIME (T#5s), STRING, CHAR, DATE and structures are built from these.", "s m");
    return S(720, 276, b, "Sizes of BOOL, BYTE, WORD, INT, DWORD, DINT and REAL as rows of bits");
  };

  // ---------- 11. Address anatomy ----------
  F["address-map"] = function () {
    var b = "";
    b += T(250, 66, "%", "mono", "middle") + T(330, 66, "I", "mono acc", "middle") + T(410, 66, "0", "mono", "middle") + T(458, 66, ".", "mono", "middle") + T(506, 66, "3", "mono", "middle");
    [[250, "absolute", "address", "marker"], [330, "area:", "I = input", "Q = output  M = memory"], [410, "byte", "number", "0, 1, 2 ..."], [506, "bit", "number", "0 to 7"]].forEach(function (a) {
      b += L(a[0], 82, a[0], 104, "ln thin", 1) + T(a[0], 120, a[1], "s bold", "middle") + T(a[0], 136, a[2], "s", "middle") + (a[0] === 250 ? "" : T(a[0], 152, a[3], "s m", "middle"));
    });
    b += T(250, 152, "(%)", "s m", "middle");
    b += T(370, 28, "%I0.3 = input byte 0, bit 3", "bold m", "middle");
    var ar = [["%I0.0", "Digital input bit"], ["%Q0.0", "Digital output bit"], ["%M0.0", "Internal memory bit"], ["%IW64", "Analog input word (16 bit)"], ["%QW64", "Analog output word"]];
    ar.forEach(function (a, i) { var x = 14 + i * 140; b += R(x, 190, 130, 62, "b") + T(x + 65, 214, a[0], "mono2", "middle") + T(x + 65, 236, a[1], "xs", "middle"); });
    return S(720, 266, b, "Anatomy of the address %I0.3 and examples of input, output, memory and analog addresses");
  };

  // ---------- timing helpers ----------
  function dsig(pts, x0, sx, yh, yl) {
    var d = "M" + (x0 + pts[0][0] * sx) + "," + (pts[0][1] ? yh : yl);
    for (var i = 1; i < pts.length; i++) {
      var px = x0 + pts[i][0] * sx;
      d += " L" + px + "," + (pts[i - 1][1] ? yh : yl) + " L" + px + "," + (pts[i][1] ? yh : yl);
    }
    return d;
  }
  function asig(pts, x0, sx, y0, k) {
    var d = "";
    pts.forEach(function (p, i) { d += (i ? " L" : "M") + (x0 + p[0] * sx) + "," + (y0 - p[1] * k); });
    return d;
  }
  function grid(x0, sx, tmax, y1, y2) {
    var s = "";
    for (var t = 0; t <= tmax; t++) s += L(x0 + t * sx, y1, x0 + t * sx, y2, "ln grid") + T(x0 + t * sx, y2 + 16, t, "xs m", "middle");
    return s + T(x0 + tmax * sx + 6, y2 + 16, "s", "xs m");
  }
  function timing(title, sub, IN, Q, ET, pt) {
    var x0 = 90, sx = 50, b = "";
    b += T(10, 22, title, "bold") + T(10, 40, sub, "s m");
    b += grid(x0, sx, 12, 50, 250);
    b += T(10, 90, "IN", "bold") + P(dsig(IN, x0, sx, 66, 96), "sig");
    b += T(10, 160, "Q", "bold") + P(dsig(Q, x0, sx, 136, 166), "sig ok");
    b += T(10, 232, "ET", "bold") + P(asig(ET, x0, sx, 240, 20), "sig acc");
    b += L(x0, 240 - pt * 20, x0 + 12 * sx, 240 - pt * 20, "ln dash thin") + T(x0 + 12 * sx - 2, 240 - pt * 20 - 4, "PT", "xs m", "end");
    return S(730, 290, b, title + " timing diagram showing IN, Q and elapsed time ET");
  }
  F["timing-ton"] = function () {
    return timing("TON: on-delay", "PT = 3 s. Q follows IN, 3 s late. Short pulses are ignored.",
      [[0, 0], [1, 1], [6, 0], [8, 1], [9, 0], [12, 0]], [[0, 0], [4, 1], [6, 0], [12, 0]],
      [[0, 0], [1, 0], [4, 3], [6, 3], [6, 0], [8, 0], [9, 1], [9, 0], [12, 0]], 3);
  };
  F["timing-tof"] = function () {
    return timing("TOF: off-delay", "PT = 2 s. Q switches on at once and stays on for 2 s after IN falls.",
      [[0, 0], [1, 1], [4, 0], [8, 1], [9, 0], [12, 0]], [[0, 0], [1, 1], [6, 0], [8, 1], [11, 0], [12, 0]],
      [[0, 0], [4, 0], [6, 2], [8, 2], [8, 0], [9, 0], [11, 2], [12, 2]], 2);
  };
  F["timing-tp"] = function () {
    return timing("TP: pulse", "PT = 2 s. A rising edge on IN gives exactly one 2 s pulse, whatever IN does next.",
      [[0, 0], [1, 1], [5, 0], [7, 1], [7.5, 0], [12, 0]], [[0, 0], [1, 1], [3, 0], [7, 1], [9, 0], [12, 0]],
      [[0, 0], [1, 0], [3, 2], [5, 2], [5, 0], [7, 0], [9, 2], [9, 0], [12, 0]], 2);
  };

  F["counter-diagram"] = function () {
    var x0 = 90, sx = 50, b = "";
    b += T(10, 22, "CTU: count up", "bold") + T(10, 40, "PV = 3. CV goes up on each rising edge of CU. Q is on while CV ≥ PV. R resets CV to 0.", "s m");
    b += grid(x0, sx, 12, 50, 290);
    var cu = [[0, 0]]; [1, 2, 3, 4].forEach(function (t) { cu.push([t, 1], [t + 0.4, 0]); });
    b += T(10, 90, "CU", "bold") + P(dsig(cu, x0, sx, 66, 96), "sig");
    b += T(10, 150, "R", "bold") + P(dsig([[0, 0], [6, 1], [6.6, 0], [12, 0]], x0, sx, 126, 156), "sig");
    b += T(10, 232, "CV", "bold");
    var cv = [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4], [6, 0], [12, 0]], d = "M" + x0 + ",270";
    for (var i = 1; i < cv.length; i++) d += " L" + (x0 + cv[i][0] * sx) + "," + (270 - cv[i - 1][1] * 16) + " L" + (x0 + cv[i][0] * sx) + "," + (270 - cv[i][1] * 16);
    b += P(d, "sig acc") + L(x0, 270 - 3 * 16, x0 + 12 * sx, 270 - 3 * 16, "ln dash thin") + T(x0 + 12 * sx - 2, 270 - 3 * 16 - 4, "PV = 3", "xs m", "end");
    for (var v = 0; v <= 4; v++) b += T(x0 - 8, 274 - v * 16, v, "xs m", "end");
    b += T(10, 310, "Q", "bold") + P(dsig([[0, 0], [3, 1], [6, 0], [12, 0]], x0, sx, 296, 326), "sig ok");
    return S(730, 360, b, "CTU counter timing diagram showing CU pulses, reset, count value CV and output Q");
  };

  F["edge-diagram"] = function () {
    var x0 = 90, sx = 50, b = "";
    b += T(10, 22, "Edge detection", "bold") + T(10, 40, "A level stays true for as long as the signal is high. An edge is true for ONE scan only.", "s m");
    b += grid(x0, sx, 12, 50, 230);
    b += T(10, 90, "Sensor", "bold") + P(dsig([[0, 0], [1, 1], [4, 0], [6, 1], [8, 0], [12, 0]], x0, sx, 66, 96), "sig");
    b += T(10, 160, "P_TRIG", "bold") + P(dsig([[0, 0], [1, 1], [1.12, 0], [6, 1], [6.12, 0], [12, 0]], x0, sx, 136, 166), "sig ok");
    b += T(10, 210, "N_TRIG", "bold") + P(dsig([[0, 0], [4, 1], [4.12, 0], [8, 1], [8.12, 0], [12, 0]], x0, sx, 196, 226), "sig acc");
    b += T(x0 + 1 * sx + 12, 130, "rising edge: 1 scan", "xs m") + T(x0 + 4 * sx + 12, 190, "falling edge: 1 scan", "xs m");
    return S(730, 262, b, "Sensor signal with the one-scan pulses of rising edge P_TRIG and falling edge N_TRIG");
  };

  // ---------- Fail-safe stop wiring ----------
  F["estop-wiring"] = function () {
    var b = "";
    function panel(x, title, broken) {
      var s = R(x, 10, 350, 240, "b") + T(x + 175, 34, title, "bold", "middle");
      s += L(x + 30, 80, x + 100, 80, "ln") + C(x + 100, 80, 3, "dot");
      s += broken ? L(x + 100, 80, x + 130, 52, "ln") : L(x + 100, 80, x + 150, 80, "ln");
      s += C(x + 150, 80, 3, "dot") + L(x + 150, 80, x + 215, 80, "ln");
      s += T(x + 125, 108, "NC stop button + wire", "xs m", "middle");
      s += R(x + 215, 56, 110, 48, "a") + T(x + 270, 76, "PLC input", "s", "middle") + T(x + 270, 94, "Stop_PB = " + (broken ? "0" : "1"), "s bold", "middle");
      s += TL(x + 175, 150, broken ? ["Button pressed OR wire cut OR", "connector loose: signal 0.", "Program treats 0 as STOP.", "The machine fails SAFE."] : ["Everything intact: signal 1.", "Program uses a NO contact", "of Stop_PB: power passes", "while input is 1. Run allowed."], 20, "s", "middle");
      return s;
    }
    return S(730, 262, panel(10, "Normal: circuit complete", false) + panel(370, "Stop pressed or wire broken", true), "Normally closed stop button wiring: intact wire gives signal 1; button or broken wire gives 0 and stops the machine");
  };

  // ---------- Block hierarchy ----------
  F["block-hierarchy"] = function () {
    var b = "";
    b += R(290, 14, 180, 50, "a") + T(380, 36, "OB1  Main", "bold", "middle") + T(380, 54, "runs every scan", "xs", "middle");
    var kids = [[40, "FC", "Scale_Analog", "no memory", "w"], [260, "FB", "Motor_Ctrl", "has memory", "g"], [490, "FB", "Valve_Ctrl", "has memory", "g"]];
    kids.forEach(function (k) {
      b += L(380, 64, k[0] + 100, 112, "ln", 1) + R(k[0], 112, 200, 54, k[4]) + T(k[0] + 100, 134, k[1] + "  " + k[2], "bold", "middle") + T(k[0] + 100, 154, k[3], "xs", "middle");
    });
    [[240, "Motor1_DB", 360], [380, "Motor2_DB", 360]].forEach(function (d) {
      b += L(360, 166, d[0] + 62, 214, "ln dash", 1) + R(d[0], 214, 124, 36, "b") + T(d[0] + 62, 237, d[1], "s", "middle");
    });
    b += L(590, 166, 590, 214, "ln dash", 1) + R(528, 214, 124, 36, "b") + T(590, 237, "Valve1_DB", "s", "middle");
    b += T(300, 272, "instance DBs: one per call", "xs m", "middle");
    b += R(40, 286, 640, 44, "n") + R(60, 294, 150, 28, "b") + T(135, 313, "Plant_Data (global DB)", "xs", "middle") + T(440, 313, "readable by every block  ·  holds recipes, setpoints, counters", "xs m", "middle");
    b += R(560, 14, 160, 44, "n") + T(640, 32, "OB100 Startup", "s bold", "middle") + T(640, 48, "once at RUN", "xs m", "middle");
    b += R(60, 14, 160, 44, "n") + T(140, 32, "OB30 Cyclic", "s bold", "middle") + T(140, 48, "fixed interval", "xs m", "middle");
    return S(740, 340, b, "Program structure: OB1 calls an FC and two FBs; FBs have instance data blocks; a global data block is shared; OB100 and OB30 are special organization blocks");
  };

  F["fb-instances"] = function () {
    var b = "";
    b += R(10, 30, 260, 210, "g") + T(140, 56, "FB  Motor_Ctrl", "bold", "middle") + L(24, 66, 256, 66, "ln thin") +
      TL(24, 90, ["Input:   Start, Stop, Fault", "Output:  Running", "Static:  RunTime, StartCount", "Static:  T_Delay (TON)", "", "Code is written ONCE", "and reused for each motor"], 22, "s");
    [["Motor1_DB", "Running = TRUE", "RunTime = 125 s", "StartCount = 7"], ["Motor2_DB", "Running = FALSE", "RunTime = 98 s", "StartCount = 3"], ["Motor3_DB", "Running = TRUE", "RunTime = 340 s", "StartCount = 12"]].forEach(function (d, i) {
      var y = 14 + i * 76;
      b += L(270, 135, 420, y + 30, "ln", 1) + R(420, y, 290, 66, "b") + T(434, y + 20, d[0], "bold s") + T(434, y + 38, d[1] + "   " + d[2], "xs") + T(434, y + 54, d[3], "xs m");
    });
    b += T(360, 266, "Same code, separate memory. That is what makes an FB reusable.", "s m", "middle");
    return S(730, 280, b, "One function block Motor_Ctrl feeding three instance data blocks each holding its own values");
  };

  // ---------- Analog ----------
  F["analog-chain"] = function () {
    var b = "", s = [["Sensor", "4 - 20 mA", "g"], ["Analog input", "module (ADC)", "a"], ["%IW64", "raw 0 - 27648", "a"], ["NORM_X", "0.0 - 1.0", "b"], ["SCALE_X", "0 - 150 °C", "w"]];
    s.forEach(function (t, i) {
      var x = 10 + i * 142;
      b += R(x, 20, 124, 70, t[2]) + T(x + 62, 48, t[0], "bold", "middle") + T(x + 62, 70, t[1], "s", "middle");
      if (i < 4) b += L(x + 124, 55, x + 142, 55, "ln", 1);
    });
    b += T(360, 120, "Real world → electrical signal → integer → fraction → engineering units", "s m", "middle");
    return S(730, 134, b, "Analog signal chain from a 4-20 mA sensor through the analog input module, raw integer, normalisation and scaling to engineering units");
  };

  F["analog-graph"] = function () {
    var b = "", x0 = 90, y0 = 270, w = 480, h = 220;
    function X(ma) { return x0 + (ma - 4) / 16 * w; }
    function Y(v) { return y0 - v / 27648 * h; }
    b += L(x0, y0, x0 + w + 20, y0, "ln", 1) + L(x0, y0, x0, y0 - h - 20, "ln", 1);
    b += T(x0 + w + 20, y0 + 30, "Current (mA)", "s", "end") + T(14, 24, "Raw value in %IW", "s");
    b += L(X(4), Y(0), X(20), Y(27648), "ln acc");
    [[4, 0, "0 °C"], [12, 13824, "75 °C"], [20, 27648, "150 °C"]].forEach(function (p) {
      b += L(X(p[0]), Y(p[1]), X(p[0]), y0, "ln dash thin") + L(x0, Y(p[1]), X(p[0]), Y(p[1]), "ln dash thin") + C(X(p[0]), Y(p[1]), 5, "dotacc");
      b += T(X(p[0]), y0 + 16, p[0] + " mA", "xs", "middle") + T(x0 - 8, Y(p[1]) + 4, p[1], "xs", "end") + T(X(p[0]) + 10, Y(p[1]) - 8, p[2], "s bold");
    });
    b += T(590, 120, "Example: level or temperature", "s m") + T(590, 140, "transmitter, span 0 to 150.", "s m") + T(590, 170, "A straight line. NORM_X and", "s m") + T(590, 190, "SCALE_X do this arithmetic.", "s m");
    return S(780, 310, b, "Linear mapping from 4-20 mA to the raw range 0-27648 and to 0-150 degrees Celsius");
  };

  // ---------- State machine ----------
  F["state-machine"] = function () {
    var b = "", st = [[20, "0  IDLE", "motor off"], [210, "1  STARTING", "horn, 3 s delay"], [400, "2  RUNNING", "motor on"], [590, "3  FAULT", "motor off, lamp"]];
    st.forEach(function (s, i) {
      b += R(s[0], 60, 150, 70, i === 3 ? "w" : (i === 2 ? "g" : "a")) + T(s[0] + 75, 92, s[1], "bold", "middle") + T(s[0] + 75, 114, s[2], "s", "middle");
    });
    b += L(170, 85, 210, 85, "ln", 1) + T(190, 75, "Start", "xs", "middle");
    b += L(360, 85, 400, 85, "ln", 1) + T(380, 75, "delay done", "xs", "middle");
    b += P("M475,130 L475,190 L95,190 L95,130", "ln", 1) + T(285, 208, "Stop pressed", "xs", "middle");
    b += P("M285,60 L285,30 L665,30 L665,60", "ln", 1) + T(475, 22, "Overload", "xs", "middle");
    b += P("M665,130 L665,236 L95,236 L95,130", "ln dash", 1) + T(380, 254, "Fault reset (and overload cleared)", "xs", "middle");
    b += T(360, 285, "Each box is a state. Arrows are transitions with a condition. Exactly one state is active.", "s m", "middle");
    return S(760, 298, b, "State machine with Idle, Starting, Running and Fault states and the transitions between them");
  };
  window.FIGH = { S: S, T: T, R: R, L: L, P: P, C: C, N: N, TL: TL };
})();
