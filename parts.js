/* Realistic vector parts: shaded hardware drawings used by figures3.js. Colours are fixed (not theme-driven). */
window.PARTS = (function () {
  "use strict";
  function lg(id, x2, y2, stops) {
    return '<linearGradient id="' + id + '" x1="0" y1="0" x2="' + x2 + '" y2="' + y2 + '">' + stops.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"/>'; }).join("") + "</linearGradient>";
  }
  function rg(id, stops, cx, cy) {
    return '<radialGradient id="' + id + '" cx="' + (cx || .5) + '" cy="' + (cy || .5) + '" r=".75">' + stops.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"/>'; }).join("") + "</radialGradient>";
  }
  var DEFS = "" +
    lg("gMetal", 0, 1, [[0, "#f6f8f9"], [.5, "#d9dee2"], [1, "#b2b9c0"]]) +
    lg("gMetalH", 1, 0, [[0, "#c4cad0"], [.5, "#f3f5f6"], [1, "#b8bec5"]]) +
    lg("gDark", 0, 1, [[0, "#565d63"], [1, "#2b3035"]]) +
    lg("gBlack", 0, 1, [[0, "#2c3136"], [1, "#0e1013"]]) +
    lg("gTeal", 0, 1, [[0, "#17b0b2"], [1, "#0a7b80"]]) +
    lg("gSteel", 0, 1, [[0, "#6f777e"], [.3, "#f1f3f5"], [.62, "#c2c8cd"], [1, "#6a7279"]]) +
    lg("gSteelV", 1, 0, [[0, "#6f777e"], [.3, "#f1f3f5"], [.62, "#c2c8cd"], [1, "#6a7279"]]) +
    lg("gBrass", 0, 1, [[0, "#9c8640"], [.3, "#f6e9b4"], [.62, "#d1ba6c"], [1, "#8a7535"]]) +
    lg("gMotor", 0, 1, [[0, "#0d6f7a"], [.28, "#3cc4cf"], [.6, "#1894a1"], [1, "#0a5560"]]) +
    lg("gWhite", 0, 1, [[0, "#ffffff"], [1, "#d3d8dc"]]) +
    lg("gScreen", 0, 1, [[0, "#12324a"], [1, "#0a1b29"]]) +
    lg("gStudio", 0, 1, [[0, "#2a323a"], [1, "#161b20"]]) +
    lg("gYellow", 0, 1, [[0, "#ffe05a"], [1, "#d29b00"]]) +
    lg("gCable", 0, 1, [[0, "#3a4046"], [1, "#16191c"]]) +
    lg("gBody", 0, 1, [[0, "#6d747b"], [.5, "#575e65"], [1, "#454b51"]]) + lg("gBodyFlat", 0, 1, [[0, "#626970"], [1, "#4e555b"]]) + lg("gRidge", 0, 1, [[0, "#8a9299"], [1, "#5a6168"]]) +
    rg("gBtnG", [[0, "#9bf5b8"], [.6, "#27b45c"], [1, "#127a38"]], .4, .35) +
    rg("gBtnR", [[0, "#ff9a8d"], [.6, "#e0301f"], [1, "#9a1006"]], .4, .35) +
    rg("gBtnY", [[0, "#fff0a0"], [.6, "#f0be10"], [1, "#b88800"]], .4, .35) +
    rg("gBtnB", [[0, "#a8ccff"], [.6, "#2e68d8"], [1, "#16399a"]], .4, .35) +
    rg("gRing", [[0, "#ffffff"], [.8, "#b4bbc2"], [1, "#6e767d"]], .4, .35) +
    rg("gLedG", [[0, "#d6ffe5"], [.5, "#3ddc84"], [1, "#118a4a"]]) +
    rg("gLedR", [[0, "#ffd6d1"], [.5, "#ff5a4d"], [1, "#a11a10"]]) +
    rg("gLedA", [[0, "#fff3c2"], [.5, "#ffbf1f"], [1, "#a77200"]]) +
    '<filter id="ds" x="-25%" y="-15%" width="150%" height="150%"><feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#000" flood-opacity=".55"/></filter>' +
    '<filter id="glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="3"/></filter>';

  function line(x1, y1, x2, y2, col, w) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + col + '" stroke-width="' + (w || 1) + '"/>'; }
  function G(x, y, s, inner, sh) { return '<g transform="translate(' + x + "," + y + ") scale(" + (s || 1) + ')"' + (sh === false ? "" : ' filter="url(#ds)"') + ">" + inner + "</g>"; }
  function R(x, y, w, h, fill, rx, extra) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" fill="' + fill + '"' + (extra || "") + "/>"; }
  function T(x, y, cls, s, a) { return '<text x="' + x + '" y="' + y + '" class="' + cls + '"' + (a ? ' text-anchor="' + a + '"' : "") + ">" + s + "</text>"; }
  function C(x, y, r, fill, extra) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + fill + '"' + (extra || "") + "/>"; }
  function led(x, y, on, col) {
    var g = { g: "gLedG", r: "gLedR", a: "gLedA" }[col || "g"], glow = { g: "#3ddc84", r: "#ff5a4d", a: "#ffbf1f" }[col || "g"];
    return (on ? C(x, y, 5, glow, ' opacity=".7" filter="url(#glow)"') : "") + C(x, y, 2.6, on ? "url(#" + g + ")" : "#46504a", ' stroke="#1b1f22" stroke-width=".6"');
  }
  function screwTerm(x, y) { return R(x, y, 11, 15, "#0e1114", 2) + C(x + 5.5, y + 6, 3.6, "url(#gSteel)", ' stroke="#222" stroke-width=".5"') + R(x + 4.6, y + 3.2, 1.8, 5.6, "#333", 0); }

  // ---------- operator devices ----------
  function pushBtn(x, y, col, s) {
    var f = { g: "gBtnG", r: "gBtnR", y: "gBtnY", b: "gBtnB" }[col || "g"];
    return G(x, y, s, C(0, 3, 32, "#000", ' opacity=".35"') + C(0, 0, 31, "url(#gRing)") + C(0, 0, 25, "#14181b") + C(0, 0, 22, "url(#" + f + ")") +
      '<ellipse cx="-5" cy="-10" rx="11" ry="6" fill="#fff" opacity=".35"/>' + C(0, 0, 22, "none", ' stroke="rgba(0,0,0,.35)" stroke-width="1"'));
  }
  function eStop(x, y, s) {
    return G(x, y, s, R(-24, 10, 48, 26, "url(#gBlack)", 4) + C(0, 0, 40, "url(#gYellow)") + C(0, 0, 40, "none", ' stroke="#8a6500" stroke-width="1.5"') +
      C(0, 0, 31, "#2a2000", ' opacity=".35"') + C(0, -2, 29, "url(#gBtnR)") + '<ellipse cx="-8" cy="-16" rx="14" ry="7" fill="#fff" opacity=".4"/>' + C(0, -2, 29, "none", ' stroke="#6a0c04" stroke-width="1.4"'));
  }
  function pilot(x, y, col, on, s) {
    var f = { g: "gBtnG", r: "gBtnR", y: "gBtnY", b: "gBtnB" }[col || "g"], gl = { g: "#3ddc84", r: "#ff5a4d", y: "#ffd23a", b: "#4a8bff" }[col || "g"];
    return G(x, y, s, (on ? C(0, 0, 44, gl, ' opacity=".55" filter="url(#glow)"') : "") + C(0, 0, 28, "url(#gRing)") + C(0, 0, 22, on ? "url(#" + f + ")" : "#2a2f33") +
      (on ? "" : '<ellipse cx="-5" cy="-8" rx="10" ry="5" fill="#fff" opacity=".12"/>') + (on ? '<ellipse cx="-5" cy="-9" rx="9" ry="5" fill="#fff" opacity=".5"/>' : ""), on ? false : true);
  }

  // ---------- field devices ----------
  function prox(x, y, s) {
    var th = ""; for (var i = 0; i < 17; i++) th += '<line x1="' + (2 + i * 4.6) + '" y1="-12" x2="' + (2 + i * 4.6) + '" y2="12" stroke="rgba(0,0,0,.3)" stroke-width="1.2"/>';
    return G(x, y, s, '<path d="M150,0 C175,0 175,28 205,28" fill="none" stroke="#0f1215" stroke-width="7" stroke-linecap="round"/>' +
      R(100, -13, 52, 26, "url(#gBlack)", 4) + R(-4, -12, 104, 24, "url(#gBrass)", 2) + th +
      R(14, -17, 12, 34, "url(#gSteel)", 2, ' stroke="#555" stroke-width=".6"') + R(54, -17, 12, 34, "url(#gSteel)", 2, ' stroke="#555" stroke-width=".6"') +
      R(-9, -10, 7, 20, "#2d3238", 2) + C(116, -9, 3, "#ffd23a") + C(116, -9, 7, "#ffd23a", ' opacity=".45" filter="url(#glow)"'));
  }
  function thermo(x, y, s) {
    return G(x, y, s, '<path d="M0,10 C0,-30 40,-10 40,-60" fill="none" stroke="#0f1215" stroke-width="6" stroke-linecap="round" transform="translate(0,-60) scale(1)" opacity="0"/>' +
      R(-22, -70, 44, 34, "url(#gSteelV)", 5) + R(-26, -76, 52, 10, "url(#gSteel)", 3) + R(-10, -36, 20, 14, "url(#gBrass)", 2) +
      '<polygon points="-16,-22 16,-22 20,-8 -20,-8" fill="url(#gSteel)"/>' + R(-5, -8, 10, 78, "url(#gSteelV)", 3) +
      '<path d="M22,-56 C46,-56 46,-90 70,-90" fill="none" stroke="#0f1215" stroke-width="5" stroke-linecap="round"/>');
  }
  function valve(x, y, s) {
    return G(x, y, s, R(-60, -14, 120, 28, "url(#gSteel)", 4) + R(-70, -22, 14, 44, "url(#gSteelV)", 3) + R(56, -22, 14, 44, "url(#gSteelV)", 3) +
      R(-22, -44, 44, 32, "url(#gMetal)", 6) + R(-16, -86, 32, 44, "url(#gBlack)", 6) + R(-12, -96, 24, 12, "url(#gSteel)", 3) + C(0, -62, 5, "url(#gLedG)") +
      '<polygon points="-10,-14 10,-14 6,-44 -6,-44" fill="url(#gBrass)"/>');
  }
  function contactor(x, y, s) {
    var t = ""; for (var i = 0; i < 3; i++) t += screwTerm(10 + i * 22, 2) + screwTerm(10 + i * 22, 90);
    return G(x, y, s, R(0, 0, 86, 108, "url(#gBlack)", 5) + R(5, 22, 76, 64, "url(#gDark)", 3) + t + R(30, 44, 26, 20, "#2f6df0", 3) + R(34, 48, 18, 12, "#1a3f9c", 2) +
      T(43, 78, "tiny tw", "3RT", "middle") + T(14, 34, "tiny tw", "L1", "start") + T(36, 34, "tiny tw", "L2", "start") + T(58, 34, "tiny tw", "L3", "start") + R(66, 40, 10, 6, "#888", 1) + R(10, 40, 10, 6, "#888", 1));
  }
  function motor(x, y, s) {
    var fin = ""; for (var i = 0; i < 16; i++) fin += '<line x1="' + (24 + i * 6.4) + '" y1="-36" x2="' + (24 + i * 6.4) + '" y2="36" stroke="rgba(0,20,25,.4)" stroke-width="1.6"/>';
    return G(x, y, s, R(52, -60, 50, 24, "url(#gMetal)", 3) + R(20, 34, 90, 12, "#0a4650", 2) + R(0, -30, 18, 60, "url(#gMotor)", 4) + R(16, -38, 100, 76, "url(#gMotor)", 6) + fin +
      R(114, -34, 18, 68, "url(#gMotor)", 5) + R(132, -8, 44, 16, "url(#gSteel)", 2) + R(148, -12, 20, 4, "#555", 1) + R(46, -14, 40, 22, "#e9edf0", 2) + T(66, 2, "tiny tb", "3~ MOTOR", "middle"));
  }
  function drive(x, y, s) {
    var v = ""; for (var i = 0; i < 6; i++) v += '<line x1="12" y1="' + (100 + i * 7) + '" x2="78" y2="' + (100 + i * 7) + '" stroke="#aab1b8" stroke-width="2"/>';
    return G(x, y, s, R(0, 0, 90, 210, "url(#gWhite)", 5) + R(0, 0, 90, 12, "url(#gTeal)", 4) + R(10, 20, 70, 62, "#1a1f23", 4) + R(14, 24, 62, 26, "url(#gScreen)", 2) +
      T(45, 41, "tiny tg3", "RUN  50.0 Hz", "middle") + C(24, 64, 5, "#3a4046") + C(45, 64, 5, "#2d9b57") + C(66, 64, 5, "#3a4046") + v + R(10, 150, 70, 48, "#e0e4e7", 3) + T(45, 170, "tiny tt", "SINAMICS", "middle") + T(45, 182, "tiny tb", "G120", "middle") + R(8, 198, 74, 10, "url(#gBlack)", 2));
  }
  function sw(x, y, s) {
    var p = ""; for (var i = 0; i < 8; i++) p += R(14 + i * 27, 30, 22, 18, "#0c0e10", 2) + R(17 + i * 27, 33, 16, 8, "#9aa3aa", 1) + led(25 + i * 27, 22, i !== 5, "g");
    return G(x, y, s, R(0, 0, 232, 62, "url(#gDark)", 5) + R(0, 0, 232, 7, "url(#gTeal)", 3) + p + T(116, 58, "tiny tm", "INDUSTRIAL ETHERNET SWITCH", "middle"));
  }
  function laptop(x, y, s) {
    return G(x, y, s, R(18, 0, 164, 104, "url(#gBlack)", 7) + R(24, 6, 152, 92, "#e9edf0", 2) + R(24, 6, 152, 9, "#0e7d8a", 2) + R(24, 15, 36, 83, "#dfe4e8", 0) +
      R(66, 24, 104, 5, "#b9c2c8", 1) + R(66, 36, 70, 5, "#b9c2c8", 1) + '<path d="M70,62 H90 M90,54 V70 M98,54 V70 M98,62 H150" stroke="#3a4046" stroke-width="2" fill="none"/>' + R(150, 54, 4, 16, "#3a4046", 1) +
      '<path d="M4,108 L196,108 L188,120 L12,120 Z" fill="url(#gMetal)"/>' + R(76, 108, 48, 4, "#9aa3aa", 2));
  }
  function hmiPanel(x, y, s, inner) {
    return G(x, y, s, R(0, 0, 230, 170, "url(#gBlack)", 9) + R(10, 10, 210, 140, "url(#gScreen)", 3) + (inner || "") + T(115, 164, "tiny tm", "SIMATIC HMI", "middle") +
      C(18, 160, 2.2, "url(#gLedG)") + R(0, 0, 230, 170, "none", 9, ' stroke="#515960" stroke-width="1"'));
  }

  // ---------- Siemens PLC hardware (redrawn from reference photos: graphite housings, hinged covers, light label strips) ----------
  function cpu1200(x, y, s, lit) {
    var b = "", i, ledsA = "", ledsB = "", numA = "", numB = "", numC = "", numD = "";
    b += R(0, 0, 220, 200, "url(#gBody)", 9, ' stroke="#33383d" stroke-width="1.2"');
    b += R(0, 0, 220, 12, "#7c848b", 9, ' opacity=".55"') + R(0, 12, 220, 76, "url(#gBodyFlat)", 0);
    // logo + model
    b += R(14, 30, 58, 17, "#0b9a9a", 1) + T(43, 43, "tiny tw bold", "SIEMENS", "middle");
    b += T(206, 40, "xs tgrey", "SIMATIC", "end") + T(206, 55, "xs tgrey", "S7-1200", "end");
    // hinge ridge
    b += R(6, 88, 208, 9, "url(#gRidge)", 4) + R(6, 160, 208, 9, "url(#gRidge)", 4);
    // status LEDs and labels (left window)
    b += led(20, 106, true, "g") + led(32, 106, false, "r") + led(44, 106, false, "a");
    b += '<text transform="translate(21,152) rotate(-90)" class="tiny tgrey2">RUN / STOP</text><text transform="translate(33,152) rotate(-90)" class="tiny tgrey2">ERROR</text><text transform="translate(45,152) rotate(-90)" class="tiny tgrey2">MAINT</text>';
    b += line(60, 98, 60, 160, "#3d4349", 1.2);
    // DI rows
    for (i = 0; i < 8; i++) { ledsA += R(74 + i * 8.2, 104, 5, 4, (lit && lit.di ? lit.di[i] : (lit && (i < 4 && i !== 2))) ? "#3ddc84" : "#2b3036", 1); numA += T(76 + i * 8.2, 117, "tiny tgrey2", "." + i, "middle"); }
    for (i = 0; i < 6; i++) { ledsB += R(150 + i * 8.2, 104, 5, 4, "#2b3036", 1); numB += T(152 + i * 8.2, 117, "tiny tgrey2", "." + i, "middle"); }
    b += ledsA + ledsB + numA + numB + T(72, 126, "tiny tgrey2", "DI a", "start") + T(148, 126, "tiny tgrey2", "DI b", "start");
    b += '<path d="M72,119 V121 H138 V119 M148,119 V121 H198 V119" fill="none" stroke="#8b949b" stroke-width=".8"/>';
    b += T(206, 71, "tiny tgrey", "CPU 1214C DC/DC/DC", "end");
    // DQ rows
    for (i = 0; i < 8; i++) { numC += T(76 + i * 8.2, 141, "tiny tgrey2", "." + i, "middle"); }
    for (i = 0; i < 2; i++) { numD += T(152 + i * 8.2, 141, "tiny tgrey2", "." + i, "middle"); }
    b += numC + numD + T(72, 150, "tiny tgrey2", "DQ a", "start") + T(148, 150, "tiny tgrey2", "DQ b", "start");
    for (i = 0; i < 10; i++) b += R((i < 8 ? 74 + i * 8.2 : 150 + (i - 8) * 8.2), 156, 5, 4, (lit && lit.dq ? (i < 8 && lit.dq[i]) : (lit && i === 0)) ? "#3ddc84" : "#2b3036", 1);
    // bottom cover
    b += R(0, 169, 220, 31, "url(#gBodyFlat)", 9);
    b += line(0, 98, 0, 160, "#2a2e32", 0);
    return G(x, y, s, b);
  }
  function sm1200(x, y, s) {
    var b = R(0, 0, 90, 200, "url(#gBody)", 8, ' stroke="#33383d" stroke-width="1.2"') + R(0, 0, 90, 12, "#7c848b", 8, ' opacity=".55"') + R(0, 12, 90, 76, "url(#gBodyFlat)", 0) + R(4, 88, 82, 9, "url(#gRidge)", 4) + R(4, 160, 82, 9, "url(#gRidge)", 4);
    b += T(10, 112, "tiny tgrey2", "DIAG", "start") + led(36, 110, true, "g") + R(52, 100, 24, 14, "#c9d3d9", 1, ' stroke="#3d4349" stroke-width=".8"');
    for (var i = 0; i < 8; i++) b += R(10 + i * 9, 120, 5, 4, i < 3 ? "#3ddc84" : "#2b3036", 1) + T(12 + i * 9, 134, "tiny tgrey2", "." + i, "middle");
    b += T(78, 148, "tiny tgrey", "SM 1222", "end") + R(0, 169, 90, 31, "url(#gBodyFlat)", 8);
    return G(x, y, s, b);
  }
  // S7-1500 front modules (70 wide): graphite body, light label strip with channel numbers, LED columns
  function mod1500(x, y, kind, s) {
    var t = { DI: "DI 32x24VDC HF", DQ: "DQ 32x24VDC/0.5A", AI: "AI 8xU/I/RTD/TC", AQ: "AQ 4xU/I ST" }[kind] || kind, b = "", i;
    b += R(0, 0, 70, 230, "url(#gBody)", 4, ' stroke="#33383d" stroke-width="1.2"') + R(0, 0, 70, 30, "url(#gBodyFlat)", 3) + T(35, 12, "tiny tgrey", t, "middle");
    b += R(8, 17, 5, 4, "#3ddc84", 1) + R(16, 17, 5, 4, "#2b3036", 1) + R(24, 17, 5, 4, "#2b3036", 1);
    b += R(16, 34, 38, 162, "#cfd6dc", 1, ' stroke="#8f979d" stroke-width=".8"');
    for (i = 1; i < 16; i++) b += line(16, 34 + i * 10.1, 54, 34 + i * 10.1, "#9aa3a9", .7);
    for (i = 0; i < 16; i++) { b += R(8, 38 + i * 10.1, 4, 4, (kind === "DI" && (i === 7 || i === 14)) || (kind === "DQ" && (i === 3 || i === 11)) ? "#3ddc84" : "#2b3036", 1) + R(58, 38 + i * 10.1, 4, 4, (kind === "AI" && i % 5 === 0) ? "#3ddc84" : "#2b3036", 1); }
    b += R(6, 200, 58, 24, "url(#gDark)", 3);
    return G(x, y, s, b);
  }
  function ps1500(x, y, s) {
    var b = R(0, 0, 105, 230, "url(#gBody)", 4, ' stroke="#33383d" stroke-width="1.2"') + R(0, 0, 105, 26, "url(#gBodyFlat)", 3) + T(52, 12, "tiny tgrey", "PM 1507 70W 120/230VAC", "middle") + R(8, 16, 5, 4, "#3ddc84", 1) + R(16, 16, 5, 4, "#2b3036", 1);
    for (var i = 0; i < 10; i++) b += line(14, 60 + i * 12, 91, 60 + i * 12, "#3d4349", 1.5);
    return G(x, y, s, b + R(6, 196, 93, 28, "url(#gDark)", 3));
  }
  function cpu1500(x, y, s) {
    var b = R(0, 0, 140, 230, "url(#gBody)", 4, ' stroke="#33383d" stroke-width="1.2"') + R(0, 0, 140, 30, "url(#gBodyFlat)", 3) + T(70, 12, "tiny tgrey", "1516-3 PN/DP", "middle") + R(8, 17, 5, 4, "#3ddc84", 1) + R(16, 17, 5, 4, "#2b3036", 1) + R(24, 17, 5, 4, "#2b3036", 1);
    // display bezel
    b += R(14, 36, 112, 124, "#23272b", 4, ' stroke="#15181b"') + R(18, 40, 38, 11, "#0b9a9a", 1) + T(37, 48, "tiny tw bold", "SIEMENS", "middle") + T(122, 46, "tiny tgrey", "SIMATIC", "end") + T(122, 55, "tiny tgrey", "S7-1500", "end");
    b += R(26, 60, 88, 90, "#e9f1f8", 1) + R(26, 60, 88, 14, "#7fd070", 1) + T(30, 70, "tiny tdark bold", "RUN", "start");
    for (var i = 0; i < 5; i++) b += C(36 + i * 17, 84, 6, "#2f7fd0");
    b += R(26, 94, 88, 12, "#9fc4e8", 1) + T(70, 103, "tiny tw bold", "Overview", "middle") + T(30, 120, "tiny tdark", "CPU 1511-1 PN", "start") + T(110, 146, "tiny tdark", "6ES7 511-1AK02-0AB0", "end");
    // keypad
    b += R(14, 164, 112, 56, "url(#gBodyFlat)", 3) + '<polygon points="70,168 62,180 78,180" fill="#c3cacf"/><polygon points="70,214 62,202 78,202" fill="#c3cacf"/><polygon points="44,191 56,183 56,199" fill="#c3cacf"/><polygon points="96,191 84,183 84,199" fill="#c3cacf"/>' +
      T(26, 214, "tiny tgrey", "ESC", "middle") + T(114, 214, "tiny tgreen bold", "OK", "middle");
    return G(x, y, s, b);
  }
  function et200(x, y, s, n) {
    var parts = "", lab = ["DI", "DI", "DQ", "AI", "AQ"], px = 62, i, k;
    parts += R(0, 0, 58, 150, "url(#gBody)", 3, ' stroke="#33383d" stroke-width="1.2"') + R(0, 0, 58, 20, "url(#gBodyFlat)", 3) + T(29, 13, "tiny tgrey", "IM 155-6 PN", "middle") +
      led(12, 30, true, "g") + led(24, 30, false, "r") + led(36, 30, false, "a") + R(8, 42, 20, 20, "#15181b", 2) + R(30, 42, 20, 20, "#15181b", 2) + R(11, 46, 14, 8, "#8e979e", 1) + R(33, 46, 14, 8, "#8e979e", 1) + T(29, 76, "tiny tgrey2", "P1   P2", "middle") +
      R(0, 110, 58, 40, "#cfd3d6", 3, ' stroke="#8f979d"');
    for (i = 0; i < (n || 5); i++) {
      var xx = px + i * 36;
      parts += R(xx, 0, 32, 110, "url(#gBody)", 2, ' stroke="#33383d" stroke-width=".8"') + R(xx, 0, 32, 16, "url(#gBodyFlat)", 2) + T(xx + 16, 12, "tiny tgrey bold", lab[i % 5], "middle") +
        led(xx + 8, 30, i < 3, "g") + led(xx + 8, 41, i === 0 && n > 3, "g") + R(xx + 5, 52, 22, 54, "#cfd6dc", 1, ' stroke="#8f979d" stroke-width=".6"') + R(xx, 110, 32, 40, i % 2 ? "#cfd3d6" : "#9aa1a7", 2, ' stroke="#8f979d" stroke-width=".6"');
      for (k = 0; k < 4; k++) parts += C(xx + 8 + (k % 2) * 14, 120 + Math.floor(k / 2) * 14, 3, "#5d656c");
    }
    parts += R(px + (n || 5) * 36, 0, 22, 110, "#3b4046", 2) + R(px + (n || 5) * 36, 110, 22, 40, "#cfd3d6", 2);
    return G(x, y, s, parts);
  }

  function cableP(d, col) {
    return '<path d="' + d + '" fill="none" stroke="#06120a" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" fill="none" stroke="' + (col || "#2ec060") + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  function wire(d, col) { return '<path d="' + d + '" fill="none" stroke="rgba(0,0,0,.55)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'; }

  return { DEFS: DEFS, G: G, R: R, T: T, C: C, led: led, pushBtn: pushBtn, eStop: eStop, pilot: pilot, prox: prox, thermo: thermo, valve: valve, contactor: contactor, motor: motor, drive: drive, sw: sw,
    laptop: laptop, hmiPanel: hmiPanel, cpu1200: cpu1200, sm1200: sm1200, ps1500: ps1500, cpu1500: cpu1500, mod1500: mod1500, et200: et200, cableP: cableP, wire: wire };
})();
