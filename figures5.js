/* Realistic terminal and wiring figures (original drawings; terminal layouts checked against the Siemens S7-1200 Easy Book
   and CU250S-2 compact operating instructions, nothing copied). Requires parts.js, figures.js. */
(function () {
  "use strict";
  var F = window.FIGS, Pt = window.PARTS, N = window.FIGH.N;
  var T = Pt.T, R = Pt.R, C = Pt.C, G = Pt.G;

  function SS(w, h, body, alt, light) {
    return '<svg class="figsvg real" viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="' + alt + '"><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" class="ah"/></marker></defs>' + Pt.DEFS +
      (light ? "" : '<rect width="' + w + '" height="' + h + '" rx="8" fill="url(#gStudio)"/><rect x="0" y="' + (h - 6) + '" width="' + w + '" height="6" rx="3" fill="#000" opacity=".25"/>') + body + "</svg>";
  }
  function line(x1, y1, x2, y2, col, w, extra) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + col + '" stroke-width="' + (w || 1) + '"' + (extra || "") + "/>"; }
  var BROWN = "#8a5a2b", BLUE = "#2f6fe0", BLACK = "#222", RED = "#e04a3a", YEL = "#f2b84b", GRY = "#b8c0c6";

  // one screw terminal, top-left at (x, y); returns svg. Centre of the screw: (x+8, y+12)
  function screw(x, y) {
    return R(x, y, 16, 24, "#0d1013", 2) + C(x + 8, y + 12, 5.2, "url(#gSteel)", ' stroke="#222" stroke-width=".6"') + R(x + 6.9, y + 7.4, 2.2, 9.2, "#3a3a3a", 0);
  }
  // a row of terminals: items = [label, groupLabel?]; returns {svg, cx(i), cy}
  function strip(x, y, items, pitch, labelsAbove) {
    var s = "", i;
    s += R(x - 6, y - 4, items.length * pitch + 12 + (items.gaps || 0), 32, "url(#gBlack)", 4, ' stroke="#3a4148" stroke-width=".8"');
    var pos = [], off = 0;
    for (i = 0; i < items.length; i++) {
      if (items[i][2]) off += items[i][2];
      var tx = x + i * pitch + off;
      s += screw(tx, y);
      s += T(tx + 8, labelsAbove ? y - 9 : y + 44, "tiny tw", items[i][0], "middle");
      pos.push({ x: tx + 8, y: y + 12 });
    }
    return { svg: s, pos: pos };
  }

  // ---------- CPU 1214C DC/DC/DC front with covers open ----------
  function cpuOpen(x, y) {
    var b = "", top, bot, i;
    b += R(0, 0, 600, 330, "url(#gBody)", 10, ' stroke="#33383d" stroke-width="1.2"') + R(0, 0, 600, 14, "#7c848b", 10, ' opacity=".5"');
    // top terminal block X10 / X11
    var topItems = [["L+"], ["M"], ["1M", 0, 8]];
    for (i = 0; i < 8; i++) topItems.push(["." + i, 0, i === 0 ? 8 : 0]);
    for (i = 0; i < 6; i++) topItems.push(["." + i, 0, i === 0 ? 8 : 0]);
    top = strip(24, 52, topItems, 22, true);
    var ai = strip(450, 52, [["2M"], ["0"], ["1"]], 22, true);
    b += top.svg + ai.svg;
    // group labels under the top strip
    b += T(32, 106, "tiny tgrey", "X10   24 V DC sensor supply", "start") + T(150, 106, "tiny tgrey bold", "DI a", "start") + T(335, 106, "tiny tgrey bold", "DI b", "start") + T(450, 106, "tiny tgrey", "X11  AI 0..10 V", "start");
    b += '<path d="M123,111 H323 M326,111 H414" fill="none" stroke="#8b949b" stroke-width=".8"/>' + T(210, 124, "tiny tgrey2", "24 V DC inputs %I0.0 ... %I0.7", "middle") + T(370, 124, "tiny tgrey2", "%I1.0 ... %I1.5", "middle");
    // jumper M -> 1M
    b += Pt.wire("M" + top.pos[1].x + "," + (top.pos[1].y - 14) + " V" + (top.pos[1].y - 26) + " H" + top.pos[2].x + " V" + (top.pos[2].y - 14), RED);
    // middle: logo, LEDs, model
    b += R(24, 140, 74, 20, "#0b9a9a", 1) + T(61, 154, "tiny tw bold", "SIEMENS", "middle");
    b += T(576, 154, "xs tgrey", "SIMATIC S7-1200", "end") + T(576, 172, "tiny tgrey", "CPU 1214C DC/DC/DC   6ES7 214-1AG40-0XB0", "end");
    b += Pt.led(40, 196, true, "g") + Pt.led(58, 196, false, "r") + Pt.led(76, 196, false, "a") + T(40, 214, "tiny tgrey2", "RUN/STOP  ERROR  MAINT", "start");
    for (i = 0; i < 14; i++) b += R(130 + i * 22, 190, 12, 5, i < 5 && i !== 2 ? "#3ddc84" : "#2b3036", 1);
    b += R(430, 186, 70, 34, "#c9d3d9", 2, ' stroke="#3d4349" stroke-width=".8"') + T(465, 207, "tiny tb", "PROFINET", "middle");
    // bottom terminal block X12
    var botItems = [["3L+"], ["3M"]];
    for (i = 0; i < 8; i++) botItems.push(["." + i, 0, i === 0 ? 8 : 0]);
    for (i = 0; i < 2; i++) botItems.push(["." + i, 0, i === 0 ? 8 : 0]);
    bot = strip(24, 262, botItems, 22, false);
    b += bot.svg + T(32, 250, "tiny tgrey", "X12   24 V DC outputs", "start") + T(170, 250, "tiny tgrey bold", "DQ a  %Q0.0 ... %Q0.7", "start") + T(378, 250, "tiny tgrey bold", "DQ b  %Q1.0 / .1", "start");
    return { svg: G(x, y, 1, b), top: top, bot: bot, dx: x, dy: y };
  }
  function P(c, part, i) { var p = c[part].pos[i]; return { x: c.dx + p.x, y: c.dy + p.y }; }

  F["cpu1214-terminals"] = function () {
    var c = cpuOpen(20, 20), b = c.svg;
    b += N(c.dx + 36, c.dy + 14, "1") + N(c.dx + 90, c.dy + 14, "2") + N(c.dx + 36, c.dy + 330 - 8, "3");
    b += T(660, 50, "tw s bold", "Reading the terminals", "start");
    b += T(660, 76, "tw xs", "1  L+ / M: 24 V DC sensor supply OUTPUT", "start") + T(660, 94, "tm xs", "(from the CPU, up to its rated current)", "start");
    b += T(660, 122, "tw xs", "2  1M: common of the digital inputs", "start") + T(660, 140, "tm xs", "Red jumper M to 1M: inputs act as", "start") + T(660, 156, "tm xs", "SINKING inputs, so use PNP sensors.", "start");
    b += T(660, 184, "tw xs", "3  3L+ / 3M: supply of the outputs", "start") + T(660, 202, "tm xs", "Each output switches +24 V to its load.", "start");
    b += T(660, 236, "tm xs", "Drawn as an original illustration", "start") + T(660, 252, "tm xs", "after the S7-1200 manual layout.", "start");
    return SS(900, 370, b, "S7-1200 CPU 1214C with the terminal covers open: the top row has L+, M, 1M and the inputs, the bottom row has 3L+, 3M and the outputs");
  };

  // ---------- PNP proximity sensor wired to an S7-1200 input ----------
  F["prox-wiring"] = function () {
    var c = cpuOpen(250, 24), b = "";
    var Lp = P(c, "top", 0), M = P(c, "top", 1), I0 = P(c, "top", 3);
    b += c.svg;
    b += Pt.prox(30, 160, .85);
    b += Pt.wire("M205,184 H232 V54 H" + Lp.x + " V" + (Lp.y - 8), BROWN);
    b += Pt.wire("M205,190 H238 V44 H" + M.x + " V" + (M.y - 8), BLUE);
    b += Pt.wire("M205,196 H244 V34 H" + I0.x + " V" + (I0.y - 8), BLACK);
    b += T(110, 226, "tw s bold", "PNP inductive sensor", "middle") + T(110, 244, "tm xs", "3-wire, 24 V DC", "middle");
    b += T(120, 130, "tw xs", "brown +24 V  to L+", "middle") + T(120, 146, "tw xs", "blue 0 V  to M", "middle") + T(120, 114, "tw xs", "black output  to %I0.0", "middle");
    b += T(30, 392, "tw s", "When the sensor detects metal, its black output puts +24 V on %I0.0.", "start");
    b += T(30, 414, "tm xs", "The current flows into the input and back through 1M, which is jumpered to M (red). An NPN sensor here would never switch the input on.", "start");
    return SS(900, 430, b, "A PNP proximity sensor wired with brown to L+, blue to M and black to input %I0.0 of an S7-1200 CPU, with 1M jumpered to M");
  };

  // ---------- transistor output switching a contactor coil ----------
  F["contactor-wiring"] = function () {
    var c = cpuOpen(20, 10), b = "";
    var Q0 = P(c, "bot", 2), L3 = P(c, "bot", 0), M3 = P(c, "bot", 1);
    var kx = 690, ky = 60;
    b += c.svg;
    b += Pt.wire("M" + Q0.x + "," + (Q0.y + 14) + " V362 H" + (kx - 40) + " V" + (ky + 52), YEL);
    b += Pt.wire("M" + M3.x + "," + (M3.y + 14) + " V374 H" + (kx - 52) + " V" + (ky + 86), BLUE);
    b += Pt.wire("M" + L3.x + "," + (L3.y + 14) + " V400", RED) + Pt.wire("M" + M3.x + "," + (M3.y + 14) + " V400", BLUE);
    b += R(30, 400, 90, 30, "url(#gTeal)", 4) + T(75, 420, "tiny tw bold", "24 V DC supply", "middle");
    b += Pt.contactor(kx, ky, 1.25);
    b += R(kx - 62, ky + 40, 22, 20, "#0d1013", 2) + T(kx - 51, ky + 54, "tiny tw bold", "A1", "middle") + R(kx - 62, ky + 76, 22, 20, "#0d1013", 2) + T(kx - 51, ky + 90, "tiny tw bold", "A2", "middle");
    b += T(kx + 54, ky - 12, "tw xs bold", "K1 contactor", "middle") + T(kx + 54, ky + 156, "tm xs", "power contacts to the motor", "middle");
    b += Pt.motor(kx - 10, ky + 200, .62) + T(kx + 54, ky + 262, "tw xs", "M1", "middle");
    b += T(160, 410, "tw s", "%Q0.0 drives the coil of K1 (A1 to A2, back to 0 V). K1's heavy contacts switch the motor.", "start");
    b += T(160, 430, "tm xs", "Suppress the coil (diode on a DC coil) and use auxiliary contact 13-14 as feedback to a spare input.", "start");
    return SS(900, 450, b, "A transistor output of an S7-1200 CPU energises the coil A1 and A2 of contactor K1, whose power contacts switch a motor");
  };

  // ---------- two-channel e-stop to a fail-safe input ----------
  F["estop-fdi-wiring"] = function () {
    var b = "";
    b += Pt.et200(470, 60, .95, 3);
    b += R(529, 60, 30.4, 104, "url(#gYellow)", 2, ' stroke="#8a6500" stroke-width=".8"') + T(544, 80, "tiny tb bold", "F-DI", "middle") + R(533, 92, 22, 54, "#f7e48a", 1) + T(560, 38, "tw s bold", "ET 200SP station with an F-DI module (yellow)", "middle") + T(560, 214, "tm xs", "terminals sit on the dark BaseUnit below the module", "start");
    b += Pt.eStop(110, 150, 1.1);
    b += R(66, 210, 90, 46, "url(#gBlack)", 4) + T(111, 228, "tiny tw bold", "NC contact 1", "middle") + T(111, 246, "tiny tw bold", "NC contact 2", "middle");
    b += R(20, 290, 120, 30, "url(#gTeal)", 4) + T(80, 310, "tiny tw bold", "24 V sensor supply", "middle");
    b += Pt.wire("M96,256 V275 H60 V290", RED) + Pt.wire("M126,256 V280 H104 V290", RED);
    b += Pt.wire("M156,226 H300 V222 H537 V188", YEL) + Pt.wire("M156,244 H330 V236 H551 V188", YEL);
    b += T(310, 214, "tw xs", "channel 1", "middle") + T(340, 256, "tw xs", "channel 2", "middle");
    b += R(20, 340, 780, 80, "none", 6, ' stroke="#46515a" stroke-dasharray="5 4"');
    b += T(34, 362, "tw s", "Two independent channels from one e-stop. The module compares them: a difference for longer than the", "start") + T(34, 382, "tw s", "discrepancy time, or a short circuit between the wires, causes a fault and the safe state.", "start") + T(34, 402, "tm xs", "Typical arrangement. Terminal names differ per module: use the module's manual for the real wiring.", "start");
    return SS(820, 436, b, "An emergency stop button with two normally closed contacts wired to two channels of a fail-safe digital input module");
  };

  // ---------- SINAMICS G120 CU250S-2 terminals ----------
  F["cu250s-terminals"] = function () {
    var b = "", up = [["31", "+24 V IN"], ["32", "GND IN"], ["12", "AO 0"], ["26", "AO 1"], ["27", "GND"], ["1", "+10 V OUT"], ["2", "GND"], ["3", "AI 0+"], ["4", "AI 0-"], ["10", "AI 1+"], ["11", "AI 1-"], ["13", "GND"], ["14", "T1 MOTOR"], ["15", "T2 MOTOR"]];
    var lo = [["5", "DI 0"], ["6", "DI 1+"], ["64", "DI 1-"], ["7", "DI 2"], ["8", "DI 3+"], ["65", "DI 3-"], ["16", "DI 4"], ["69", "DI COM 1"], ["9", "+24 V out"], ["28", "GND"]];
    var dos = [["18", "DO0 NC"], ["19", "DO0 NO"], ["20", "DO0 COM"], ["21", "DO1 NO"], ["22", "DO1 COM"]];
    var pos = {};
    function col(x, y, list, title) {
      var s = R(x, y, 150, 22 + list.length * 22, "url(#gBlack)", 5, ' stroke="#3a4148"') + T(x + 75, y + 15, "tiny tgrey bold", title, "middle");
      list.forEach(function (t, i) {
        var yy = y + 24 + i * 22;
        s += R(x + 4, yy, 36, 18, "#0d1013", 2) + C(x + 14, yy + 9, 4.6, "url(#gSteel)", ' stroke="#222" stroke-width=".5"') + T(x + 28, yy + 13, "tiny tw bold", t[0], "start") + T(x + 46, yy + 13, "tiny tgrey", t[1], "start");
        pos[t[0]] = { x: x + 14, y: yy + 9, side: x };
      });
      return s;
    }
    // body
    b += R(10, 10, 500, 370, "url(#gDark)", 8, ' stroke="#6a727a"') + R(10, 10, 500, 16, "url(#gTeal)", 6) + T(260, 22, "tiny tw bold", "SINAMICS G120   CU250S-2 PN   (terminals behind the front doors)", "middle");
    b += col(30, 44, up, "UPPER DOOR");
    b += col(200, 44, lo, "LOWER DOOR: digital inputs, 24 V");
    b += col(360, 44, dos, "LOWER DOOR: relay outputs");
    // wiring example: start switch from +24 V out (9) to DI 0 (5), DI COM1 (69) to GND (28); pot on 1-3-2, AI0- (4) to GND (13)
    var p5 = pos["5"], p9 = pos["9"], p69 = pos["69"], p28 = pos["28"], p1 = pos["1"], p3 = pos["3"], p2 = pos["2"], p4 = pos["4"], p13 = pos["13"];
    b += Pt.wire("M" + (p9.x - 12) + "," + p9.y + " H" + 190 + " V" + (p5.y) + " H" + (p5.x - 12), RED);
    b += Pt.wire("M" + (p69.x - 12) + "," + p69.y + " H" + 192 + " V" + (p28.y) + " H" + (p28.x - 12), BLUE);
    b += Pt.wire("M" + (p4.x - 12) + "," + p4.y + " H" + 22 + " V" + p13.y + " H" + (p13.x - 12), BLUE);
    // switch and pot drawings
    b += Pt.pushBtn(590, 90, "g", .9) + T(590, 150, "tw xs", "Start push button", "middle");
    b += R(550, 190, 80, 26, "url(#gDark)", 13, ' stroke="#555"') + C(590, 203, 10, "url(#gSteel)") + T(590, 236, "tw xs", "Speed potentiometer", "middle") + T(590, 250, "tm xs", "(setpoint 0 to 10 V, AI 0)", "middle");
    b += T(530, 292, "tw xs bold", "DI thresholds on this unit:", "start") + T(530, 308, "tm xs", "low < 5 V, high > 11 V", "start") + T(530, 324, "tm xs", "(an S7-1200 input needs 15 V)", "start");
    b += T(20, 402, "tm xs", "Red: +24 V from terminal 9 through the start switch to DI 0 (terminal 5). Blue: DI COM 1 (69) and AI 0- (4) to GND. With the drive's own", "start") + T(20, 418, "tm xs", "24 V, connect the DI reference to GND (table in the manual). Illustration: terminal names and numbers as in the CU250S-2 documentation.", "start");
    return SS(700, 436, b, "Terminal strips of a SINAMICS G120 CU250S-2 control unit with an example wiring of a start switch to digital input 0 and a potentiometer to analog input 0");
  };
})();
