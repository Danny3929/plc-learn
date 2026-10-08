/* Realistic redraws of key figures (override earlier schematic versions). Requires parts.js, figures.js, figures2.js. */
(function () {
  "use strict";
  var F = window.FIGS, Pt = window.PARTS, N = window.FIGH.N;
  var T = Pt.T, R = Pt.R, C = Pt.C, G = Pt.G;

  function SS(w, h, body, alt, light) {
    return '<svg class="figsvg real" viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="' + alt + '"><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" class="ah"/></marker>' + Pt.DEFS + "</defs>" +
      (light ? "" : '<rect width="' + w + '" height="' + h + '" rx="8" fill="url(#gStudio)"/><rect x="0" y="' + (h - 6) + '" width="' + w + '" height="6" rx="3" fill="#000" opacity=".25"/>') + body + "</svg>";
  }
  function line(x1, y1, x2, y2, col, w, extra) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + col + '" stroke-width="' + (w || 1) + '"' + (extra || "") + "/>"; }
  function arr(d, col) { return '<path d="' + d + '" fill="none" stroke="' + (col || "#9fb0bd") + '" stroke-width="2" marker-end="url(#ah)" class="arrw"/>'; }

  // ---------- plc-loop ----------
  F["plc-loop"] = function () {
    var b = "";
    b += T(110, 28, "tm bold", "INPUTS (sensors)", "middle") + T(400, 28, "tm bold", "THE PLC", "middle") + T(675, 28, "tm bold", "OUTPUTS (actuators)", "middle");
    b += Pt.wire("M135,85 C215,85 215,138 297,138", "#f2b84b") + Pt.wire("M180,212 C235,212 240,176 297,176", "#d9d9d9") + Pt.wire("M138,289 C225,289 230,214 297,214", "#c97a3a");
    b += Pt.wire("M506,138 C570,138 570,85 640,85", "#f2b84b") + Pt.wire("M506,176 C575,176 585,200 635,205", "#d9d9d9") + Pt.wire("M506,214 C530,214 540,300 560,300", "#c97a3a");
    b += Pt.pushBtn(100, 85, "g", 1) + T(100, 140, "tw s", "Push button", "middle");
    b += Pt.prox(26, 190, .72) + T(100, 244, "tw s", "Proximity sensor", "middle");
    b += Pt.thermo(95, 345, .62) + T(150, 340, "tw s", "Temperature sensor", "start");
    b += Pt.cpu1200(296, 94, .95) + T(400, 312, "tw s bold", "S7-1200 CPU", "middle");
    b += Pt.pilot(672, 85, "y", true, .9) + T(672, 130, "tw s", "Indicator lamp", "middle");
    b += Pt.valve(672, 245, .62) + T(672, 268, "tw s", "Solenoid valve", "middle");
    b += Pt.contactor(560, 288, .55) + Pt.motor(618, 322, .55) + T(640, 372, "tw s", "Contactor + motor", "middle");
    b += T(400, 372, "tm xs", "The machine reacts, so the sensors see a new situation: the loop closes.", "middle");
    return SS(800, 390, b, "Realistic illustration: push button, proximity sensor and temperature sensor wired to an S7-1200 CPU, which drives a lamp, solenoid valve, contactor and motor");
  };

  // ---------- sensor-wiring ----------
  F["sensor-wiring"] = function () {
    var b = "";
    // wires first (under devices)
    b += Pt.wire("M144,98 H230 V300", "#e04a3a") + Pt.wire("M230,356 V390 H340 V36 H436 V70", "#f2b84b") + Pt.wire("M419,70 V54 H165 V128 H144", "#3b82f6");
    b += Pt.wire("M436,243 V300 H628", "#f2b84b") + Pt.wire("M700,300 H735 V404 H70 V128 H100", "#3b82f6");
    // 24V supply
    b += G(20, 50, 1, R(0, 0, 124, 160, "url(#gMetal)", 5, ' stroke="#8d949b"') + R(0, 0, 124, 20, "url(#gTeal)", 4) + T(62, 14, "tw tiny bold", "24 V DC POWER SUPPLY", "middle") +
      Pt.led(18, 40, true, "g") + T(28, 43, "tb tiny", "OUTPUT OK", "start") + R(10, 60, 104, 50, "#e8ecef", 2) + T(62, 82, "tb xs bold", "OUTPUT 24 V", "middle") +
      R(100, 36, 24, 20, "#c4271a", 2) + T(112, 50, "tw tiny bold", "L+", "middle") + R(100, 76, 24, 20, "#1d4fb8", 2) + T(112, 90, "tw tiny bold", "M", "middle") + R(8, 118, 108, 30, "url(#gDark)", 3));
    b += Pt.pushBtn(230, 330, "g", .85) + Pt.cpu1200(400, 60, 1, true) + Pt.pilot(660, 300, "y", true, 1);
    b += T(419, 52, "tw tiny", "1M", "middle") + T(436, 52, "tw tiny", ".0", "middle") + T(450, 262, "tw tiny", "Q.0", "start");
    b += T(196, 92, "tw s", "+24 V", "middle") + T(100, 150, "tm xs", "0 V", "middle");
    b += T(190, 334, "tw s", "Push button (NO)", "end") + T(660, 342, "tw s", "Lamp", "middle") + T(510, 20, "tw s bold", "S7-1200 CPU", "middle") + T(82, 40, "tw s bold", "24 V DC supply", "middle");
    b += T(400, 418, "tm xs", "Simplified: the CPU's own supply and the output L+ connection are omitted.", "middle");
    return SS(800, 428, b, "A push button wired between +24 V and a digital input of an S7-1200 CPU, and a digital output driving a lamp back to 0 V");
  };

  // ---------- s7-family ----------
  F["s7-family"] = function () {
    var b = "", cards = [["S7-1200", "Compact", ["I/O built into the CPU", "Small machines, learning", "Add boards and modules", "Great fit for PLCSIM"]],
      ["S7-1500", "Modular, high end", ["Fast, big memory", "Advanced motion and safety", "Display on the CPU", "Built-in security"]],
      ["ET 200SP", "Distributed I/O", ["I/O stations in the field", "Connected by PROFINET", "Also with a CPU inside", "Less cabling"]],
      ["S7-300 / 400", "Legacy", ["Still found in plants", "Programmed in STEP 7 (TIA)", "Being replaced by 1500", "Good to recognise"]]];
    cards.forEach(function (c, i) {
      var x = 8 + i * 198;
      b += R(x, 8, 188, 330, "#1b2228", 8, ' stroke="#2e3a43"') + T(x + 94, 36, "tw big2s bold", c[0], "middle") + T(x + 94, 54, "tm xs", c[1], "middle");
      c[2].forEach(function (t, j) { b += T(x + 16, 238 + j * 24, "tm xs", "\u2022 " + t, "start"); });
    });
    b += Pt.cpu1200(8 + 10, 74, .52) + Pt.sm1200(8 + 126, 74, .52) + T(8 + 94, 192, "tw xs", "CPU 1214C + signal module", "middle");
    b += Pt.ps1500(206 + 10, 74, .42) + Pt.cpu1500(206 + 58, 74, .42) + Pt.mod1500(206 + 120, 74, "DI", .42) + Pt.mod1500(206 + 152, 74, "DQ", .42);
    b += T(206 + 94, 202, "tw xs", "CPU 1511 + I/O", "middle");
    b += Pt.et200(404 + 22, 88, .62, 3) + T(404 + 94, 202, "tw xs", "IM 155-6 PN + modules", "middle");
    var s3 = ""; ["PS", "CPU", "DI", "DQ", "AI"].forEach(function (n, k) {
      s3 += R(k * 34, 0, 31, 118, "url(#gDark)", 2, ' stroke="#222"') + R(k * 34 + 3, 4, 25, 10, k === 1 ? "#2b78d4" : "#3b9d4f", 1) + T(k * 34 + 15.5, 12, "tw tiny", n, "middle") + R(k * 34 + 5, 22, 21, 54, "#8a949c", 2) + R(k * 34 + 3, 84, 25, 30, "#2a2f33", 2);
    });
    b += G(602 + 8, 84, 1, s3 + R(-6, 118, 182, 8, "url(#gSteel)", 2)) + T(602 + 94, 222, "tw xs", "S7-300 station", "middle");
    return SS(808, 346, b, "Four Siemens PLC families drawn as hardware: S7-1200 CPU, S7-1500 CPU with modules, ET 200SP station and S7-300 station");
  };

  // ---------- s7-rack ----------
  F["s7-rack"] = function () {
    var b = T(390, 28, "tm bold", "S7-1500 modular rack", "middle"), sc = 1.2, x = 24, y = 40, items = [["PS", 105, "0"], ["CPU", 140, "1"], ["DI", 70, "2"], ["DQ", 70, "3"], ["AI", 70, "4"], ["AQ", 70, "5"]];
    b += R(10, y + 230 * sc + 4, 770, 14, "url(#gSteel)", 3) + R(10, y + 230 * sc + 18, 770, 4, "#000", 0, ' opacity=".35"');
    items.forEach(function (m) {
      var w = m[1] * sc;
      b += (m[0] === "PS" ? Pt.ps1500(x, y, sc) : (m[0] === "CPU" ? Pt.cpu1500(x, y, sc) : Pt.mod1500(x, y, m[0], sc))) + T(x + w / 2, y + 230 * sc + 42, "tw s bold", m[0], "middle") + T(x + w / 2, y + 230 * sc + 58, "tm xs", "Slot " + m[2], "middle");
      x += w + 8;
    });
    b += T(390, y + 230 * sc + 84, "tm xs", "Modules click onto the DIN rail side by side. The CPU has a display and keys; I/O modules have a labelling strip and a front connector under the cover.", "middle");
    return SS(780, 450, b, "A drawing of an S7-1500 rack with power module, CPU with colour display and keypad, and digital and analog modules with label strips on a DIN rail");
  };

  // ---------- et200sp ----------
  F["et200sp"] = function () {
    var sc = 2, x = 40, y = 52, b = T(380, 28, "tm bold", "ET 200SP station: head module, I/O modules on base units, server module", "middle");
    b += Pt.et200(x, y, sc, 5);
    var lab = [[29, "Interface module", "(PROFINET head)"], [62 + 16 + 36 * 0.5, "DI", "inputs"], [62 + 16 + 36 * 2, "DQ", "outputs"], [62 + 16 + 36 * 3, "AI", "analog in"], [62 + 16 + 36 * 4, "AQ", "analog out"]];
    lab.forEach(function (l, i) { var px = x + (l[0]) * sc; b += line(px, y + 150 * sc + 4, px, y + 150 * sc + 22, "#9fb0bd", 1) + T(px, y + 150 * sc + 38, "tw xs bold", l[1], "middle") + T(px, y + 150 * sc + 52, "tm tiny", l[2], "middle"); });
    b += T(x + (62 + 5 * 36 + 11) * sc, y + 150 * sc + 38, "tw xs bold", "Server", "middle") + T(x + (62 + 5 * 36 + 11) * sc, y + 150 * sc + 52, "tm tiny", "module", "middle");
    return SS(760, 440, b, "An ET 200SP station: interface module with two PROFINET ports, digital and analog modules on base units, and a server module");
  };

  // ---------- profinet-topology ----------
  F["profinet-topology"] = function () {
    var b = "";
    b += Pt.cableP("M120,176 C120,200 308,190 308,214") + Pt.cableP("M436,190 C436,205 386,200 386,214") + Pt.cableP("M668,170 C668,205 440,190 440,214");
    b += Pt.cableP("M84,330 C84,300 332,310 332,276") + Pt.cableP("M358,322 C358,300 386,300 386,276") + Pt.cableP("M630,330 C630,300 440,310 440,276");
    b += Pt.sw(268, 214, 1);
    b += Pt.laptop(40, 24, .8) + T(120, 148, "tw xs bold", "Engineering PC", "middle") + T(120, 164, "tm xs", "192.168.0.10", "middle");
    b += Pt.cpu1500(372, 20, .6) + Pt.mod1500(459, 20, "DI", .6) + T(436, 172, "tw xs bold", "S7-1500  \u00B7  192.168.0.1", "middle") + T(436, 186, "tm tiny", "plc-main  (IO controller)", "middle");
    b += Pt.hmiPanel(590, 20, .55, "") + T(668, 140, "tw xs bold", "HMI panel", "middle") + T(668, 156, "tm xs", "192.168.0.4", "middle");
    b += Pt.et200(34, 330, .58, 3) + T(86, 436, "tw xs bold", "ET 200SP", "middle") + T(86, 452, "tm xs", "192.168.0.2  \u00B7  io-rack1", "middle");
    b += Pt.drive(336, 322, .5) + T(358, 446, "tw xs bold", "SINAMICS drive", "middle") + T(358, 462, "tm xs", "192.168.0.3  \u00B7  drive-m1", "middle");
    b += G(570, 330, 1, R(0, 0, 120, 66, "url(#gDark)", 8) + C(60, 33, 20, "url(#gBlack)", ' stroke="#555" stroke-width="3"') + C(60, 33, 9, "#1a3a5a") + C(55, 28, 3, "#fff", ' opacity=".6"')) +
      T(630, 418, "tw xs bold", "Camera / 3rd party", "middle") + T(630, 434, "tm xs", "192.168.0.20  (Modbus TCP)", "middle");
    b += T(400, 486, "tm xs", "Green cables are standard PROFINET Ethernet. Subnet mask 255.255.255.0.", "middle");
    return SS(800, 498, b, "A PROFINET network: engineering laptop, S7-1500 CPU, HMI, ET 200SP, drive and a camera connected through an industrial switch with green cables");
  };

  // ---------- safety-chain ----------
  F["safety-chain"] = function () {
    var b = "";
    b += Pt.wire("M128,108 H236", "#e04a3a") + Pt.wire("M128,134 H236", "#f2b84b") + T(180, 100, "tw tiny", "CH1", "middle") + T(180, 152, "tw tiny", "CH2", "middle");
    b += Pt.wire("M346,108 H430 V92 H462", "#e04a3a") + Pt.wire("M346,134 H430 V186 H462", "#f2b84b");
    b += Pt.wire("M546,92 H600 V150" , "#c9c9c9") + Pt.wire("M546,186 H600 V150 H640", "#c9c9c9");
    b += '<path d="M500,236 V268 H290 V204" fill="none" stroke="#9fb0bd" stroke-width="2" stroke-dasharray="6 5" marker-end="url(#ah)"/>' + T(395, 288, "tm xs", "feedback: both contactors must prove they dropped out", "middle");
    b += Pt.eStop(90, 122, 1) + T(90, 188, "tw s bold", "E-stop (2 channels)", "middle");
    b += G(236, 70, 1, R(0, 0, 112, 134, "url(#gDark)", 6) + R(0, 0, 112, 30, "url(#gYellow)", 5) + T(56, 20, "tb xs bold", "SAFETY LOGIC", "middle") + R(12, 44, 88, 36, "url(#gScreen)", 3) +
      T(56, 66, "tg3 tiny", "F-CPU / relay", "middle") + Pt.led(24, 100, true, "g") + Pt.led(44, 100, false, "r") + T(56, 124, "tm tiny", "diagnostics", "middle"));
    b += Pt.contactor(462, 62, .6) + Pt.contactor(462, 156, .6) + T(514, 54, "tw xs bold", "K1", "middle") + T(566, 262, "tw xs bold", "K2", "middle");
    b += Pt.motor(640, 160, .62) + T(700, 210, "tw s bold", "Motor", "middle");
    return SS(800, 300, b, "A two-channel emergency stop button feeding safety logic that drives two contactors in series, with feedback monitoring");
  };

  // ---------- profidrive ----------
  F["profidrive"] = function () {
    var b = "";
    b += Pt.cableP("M214,150 H334") + '<line x1="214" y1="150" x2="334" y2="150" stroke="none"/>';
    b += T(274, 118, "tw xs bold", "STW1 + NSOLL_A  \u2192", "middle") + T(274, 188, "tw xs bold", "\u2190  ZSW1 + NIST_A", "middle") + T(274, 134, "tm tiny", "control word + speed setpoint", "middle") + T(274, 204, "tm tiny", "status word + actual speed", "middle");
    b += Pt.wire("M426,150 H560", "#6b4a3a") + Pt.wire("M426,158 H560", "#222") + Pt.wire("M426,142 H560", "#8a8a8a");
    b += Pt.cpu1200(34, 70, .8) + T(122, 258, "tw s bold", "PLC", "middle");
    b += Pt.drive(334, 50, 1.1) + T(384, 300, "tw s bold", "SINAMICS drive", "middle");
    b += Pt.motor(560, 132, .95) + T(640, 215, "tw s bold", "Motor", "middle");
    b += R(24, 316, 752, 36, "#1b2228", 6, ' stroke="#2e3a43"') + T(400, 339, "tm xs", "Speed is a 16-bit number: 16384 (16#4000) = 100 % of reference speed. See the bit builder below.", "middle");
    return SS(800, 364, b, "An S7-1200 PLC exchanging control and status words over PROFINET with a SINAMICS drive that runs a motor");
  };

  // ---------- hmi-arch ----------
  F["hmi-arch"] = function () {
    var b = "";
    b += '<path d="M290,150 C200,160 122,140 122,168" fill="none" stroke="#9fb0bd" stroke-width="2" stroke-dasharray="6 5" marker-end="url(#ah)"/><path d="M380,150 C520,160 628,140 628,168" fill="none" stroke="#9fb0bd" stroke-width="2" stroke-dasharray="6 5" marker-end="url(#ah)"/>';
    b += Pt.cableP("M214,245 H284") + Pt.cableP("M424,245 H540") + Pt.sw(284, 226, .62);
    b += Pt.laptop(250, 6, .85) + T(335, 126, "tw s bold", "Engineering PC (TIA Portal)", "middle") + T(335, 142, "tm xs", "one project: PLC + HMI", "middle") + T(470, 188, "tm xs", "download", "middle");
    b += Pt.hmiPanel(30, 170, .8, "") + T(122, 322, "tw s bold", "HMI panel", "middle") + T(122, 338, "tm xs", "Tank1_Level = 63.2 %", "middle");
    b += Pt.cpu1200(540, 170, .8) + T(628, 350, "tw s bold", "PLC", "middle") + T(628, 366, "tm xs", "DB_HMI.Tank1_Level_Pct", "middle");
    b += T(354, 214, "tm xs", "PROFINET / Ethernet", "middle") + T(354, 280, "tm xs", "HMI tags read and write PLC tags", "middle");
    return SS(740, 380, b, "An engineering laptop downloads to an HMI panel and an S7-1200 PLC that are connected through an industrial switch");
  };

  // ---------- online-offline ----------
  F["online-offline"] = function () {
    var b = "";
    b += Pt.cableP("M250,120 H500") + arr("M300,98 H440", "#e8edf0") + arr("M440,148 H300", "#9fb0bd");
    b += T(370, 90, "tw xs bold", "Download to device", "middle") + T(370, 168, "tw xs", "Upload / Go online (monitor)", "middle") + T(370, 200, "tm tiny", "PROFINET / Ethernet cable", "middle");
    b += Pt.laptop(40, 40, 1.15) + T(150, 200, "tw s bold", "Engineering PC", "middle") + T(150, 218, "tm xs", "Project on disk = OFFLINE", "middle");
    b += Pt.cpu1200(500, 36, .95) + T(604, 262, "tw s bold", "PLC (or PLCSIM)", "middle") + T(604, 280, "tm xs", "Program running = ONLINE", "middle");
    b += R(40, 304, 640, 44, "#1b2228", 6, ' stroke="#2e3a43"') + T(360, 324, "tw xs", "No hardware? PLCSIM is a virtual PLC on the same PC. Download goes to the simulator.", "middle") + T(360, 340, "tm xs", "Compile first: errors must be fixed before a download is possible.", "middle");
    return SS(720, 360, b, "A laptop running TIA Portal downloads to an S7-1200 PLC or PLCSIM and can go online to monitor it");
  };

  // ============ light-UI screenshots ============
  var L = { bg: "#eef1f3", pane: "#ffffff", line: "#c5ccd2", head: "#dfe4e8", sel: "#cfe7f7", teal: "#0a7f8c", ink: "tb", grey: "tgy" };
  function icon(x, y, col) { return R(x, y, 10, 10, col, 2); }
  function ui(x, y, w, h, fill) { return R(x, y, w, h, fill || L.pane, 0, ' stroke="' + L.line + '" stroke-width="1"'); }

  F["tia-view"] = function () {
    var b = "";
    b += R(0, 0, 900, 566, L.bg, 6, ' stroke="#9aa5ad"') + R(0, 0, 900, 26, "#34414b", 6) + T(12, 18, "tw s", "Siemens - C:\\Projects\\FirstProject\\FirstProject", "start");
    b += R(0, 26, 900, 22, "#f7f8f9", 0) + T(10, 41, "tgy xs", "Project    Edit    View    Insert    Online    Options    Tools    Window    Help", "start");
    b += R(0, 48, 900, 30, L.head, 0);
    [["#3a77c9", 8], ["#7a8791", 34], ["#7a8791", 58], ["#2e9e5a", 94], ["#2e9e5a", 120], ["#0a7f8c", 158], ["#0a7f8c", 184], ["#e08a1e", 222], ["#e08a1e", 248], ["#7a8791", 286]].forEach(function (i) { b += R(i[1], 56, 16, 14, i[0], 3); });
    // project tree
    b += ui(0, 78, 212, 300) + R(0, 78, 212, 20, "#c9ced2", 0) + T(10, 92, "tb xs bold", "Project tree", "start");
    var tr = [[0, "\u25BE FirstProject", "#3a77c9"], [1, "Add new device", "#2e9e5a"], [1, "Devices & networks", "#7a8791"], [1, "\u25BE PLC_1 [CPU 1214C DC/DC/DC]", "#0a7f8c"], [2, "Device configuration", "#7a8791"], [2, "Online & diagnostics", "#e08a1e"],
      [2, "\u25BE Program blocks", "#e0b11e"], [3, "Add new block", "#2e9e5a"], [3, "Main [OB1]", "#3a77c9"], [2, "\u25B8 Technology objects", "#e0b11e"], [2, "\u25B8 External source files", "#e0b11e"], [2, "\u25BE PLC tags", "#e0b11e"], [3, "Show all tags", "#7a8791"], [3, "Add new tag table", "#2e9e5a"], [3, "Default tag table [14]", "#3a77c9"], [2, "\u25B8 PLC data types", "#e0b11e"], [2, "\u25B8 Watch and force tables", "#e0b11e"]];
    tr.forEach(function (t, k) {
      var yy = 114 + k * 15.2;
      if (t[1].indexOf("Main") === 0) b += R(1, yy - 11, 210, 15, L.sel, 0);
      b += icon(10 + t[0] * 13, yy - 9, t[2]) + T(24 + t[0] * 13, yy, "tb xs", t[1], "start");
    });
    // details view
    b += ui(0, 378, 212, 112) + R(0, 378, 212, 18, L.head, 0) + T(10, 391, "tgy xs bold", "Details view", "start") + T(10, 414, "tgy xs", "Name", "start") + T(10, 432, "tb xs", "Main", "start") + T(10, 448, "tb xs", "Start_PB", "start");
    // work area
    b += ui(212, 78, 408, 300) + R(212, 78, 408, 22, L.head, 0) + R(214, 80, 170, 20, "#fff", 2, ' stroke="' + L.line + '"') + T(299, 94, "tb xs", "PLC_1 \u203A Program blocks \u203A Main", "middle");
    b += R(216, 104, 400, 54, "#fafbfc", 0, ' stroke="' + L.line + '"') + R(216, 104, 400, 14, L.head, 0) + T(224, 114, "tgy tiny bold", "Name", "start") + T(330, 114, "tgy tiny bold", "Data type", "start") + T(440, 114, "tgy tiny bold", "Default value", "start") +
      T(224, 128, "tb tiny", "\u25BE Input", "start") + T(236, 140, "tb tiny", "Initial_Call", "start") + T(330, 140, "tb tiny", "Bool", "start") + T(224, 152, "tb tiny", "\u25B8 Temp", "start");
    b += R(216, 162, 400, 14, L.head, 0) + T(224, 172, "tb tiny bold", "Block title:  \"Main Program Sweep (Cycle)\"", "start");
    b += R(216, 182, 400, 18, "#dbe7ee", 0) + T(224, 195, "tb xs bold", "Network 1:   Start the motor", "start");
    b += line(228, 214, 228, 296, "#46525b", 2) + line(228, 250, 340, 250, "#2b3338", 2) + line(340, 236, 340, 264, "#2b3338", 3) + line(362, 236, 362, 264, "#2b3338", 3) + line(362, 250, 520, 250, "#2b3338", 2) +
      '<path d="M520,236 Q510,250 520,264" fill="none" stroke="#2b3338" stroke-width="3"/><path d="M544,236 Q554,250 544,264" fill="none" stroke="#2b3338" stroke-width="3"/>' + line(544, 250, 572, 250, "#2b3338", 2);
    b += T(351, 228, "tb xs", "\"Start_PB\"", "middle") + T(351, 280, "tgy tiny", "%I0.0", "middle") + T(532, 228, "tb xs", "\"Motor_Run\"", "middle") + T(532, 280, "tgy tiny", "%Q0.0", "middle");
    b += R(216, 304, 400, 20, "#dbe7ee", 0) + T(224, 318, "tb xs bold", "Network 2:", "start") + R(224, 328, 380, 36, "none", 0, ' stroke="#9aa5ad" stroke-dasharray="4 3"') + T(414, 350, "tgy xs", "Drag instructions here", "middle");
    // task cards
    b += ui(620, 78, 214, 300) + R(620, 78, 214, 20, "#c9ced2", 0) + T(630, 92, "tb xs bold", "Instructions", "start") + R(626, 104, 202, 18, "#fff", 2, ' stroke="' + L.line + '"') + T(634, 117, "tgy tiny", "Options", "start");
    ["\u25BE Basic instructions", "  \u25BE General", "   \u25BE Bit logic operations", "      |-|  Normally open contact", "      |/|  Normally closed contact", "      ( )  Assignment", "      (S)  Set output", "      (R)  Reset output", "   \u25B8 Timer operations", "   \u25B8 Counter operations", "   \u25B8 Comparator operations", "   \u25B8 Math functions", "\u25B8 Extended instructions", "\u25B8 Technology", "\u25B8 Communication"].forEach(function (t, k) { b += T(628, 138 + k * 15.5, "tb tiny", t, "start"); });
    b += R(834, 78, 66, 300, "#dfe4e8", 0, ' stroke="' + L.line + '"');
    [["Tasks", 98], ["Instructions", 140], ["Testing", 214], ["Libraries", 262]].forEach(function (v) { b += '<text transform="translate(872,' + v[1] + ') rotate(90)" class="tgy xs">' + v[0] + "</text>"; });
    // inspector
    b += ui(212, 378, 688, 112) + R(212, 378, 688, 18, L.head, 0) + R(214, 380, 70, 16, "#fff", 2, ' stroke="' + L.line + '"') + T(249, 392, "tb xs", "Properties", "middle") + T(310, 392, "tgy xs", "Info", "start") + T(352, 392, "tgy xs", "Diagnostics", "start");
    b += R(212, 396, 688, 16, "#f3f5f6", 0) + T(222, 408, "tgy tiny", "General     Cross-references     Compile     Syntax", "start");
    b += icon(222, 420, "#2e9e5a") + T(238, 429, "tb xs", "Compiling finished (errors: 0; warnings: 0)", "start") + T(222, 450, "tgy tiny", "Path                         Description                                         Go to      Errors   Warnings", "start") + T(222, 468, "tb tiny", "PLC_1                      Block Main compiled successfully", "start");
    b += R(0, 490, 900, 76, "#e4e8eb", 0) + R(0, 490, 900, 28, "#c9ced2", 0) + T(12, 508, "tb xs bold", "\u25C2 Portal view          Overview          \u25A0 Main", "start") + T(12, 546, "tgy xs", "\u2714  Project FirstProject opened.", "start");
    b += N(104, 90, "1") + N(430, 94, "2") + N(826, 90, "3") + N(560, 410, "4") + N(420, 504, "5");
    return SS(900, 566, b, "Realistic-style mock-up of the TIA Portal project view with numbered areas: project tree, work area with a ladder network, task cards, inspector window and portal view switch", true);
  };

  F["hw-config"] = function () {
    var b = "";
    b += R(0, 0, 900, 430, L.bg, 6, ' stroke="#9aa5ad"') + R(0, 0, 900, 24, "#34414b", 6) + T(12, 17, "tw s", "PLC_1 [CPU 1214C DC/DC/DC]  \u2014  Device view", "start");
    b += R(0, 24, 640, 22, L.head, 0) + T(10, 39, "tgy xs", "Topology view      Network view", "start") + R(190, 26, 86, 20, "#fff", 2, ' stroke="' + L.line + '"') + T(233, 40, "tb xs bold", "Device view", "middle");
    b += ui(0, 46, 640, 296) + R(0, 46, 640, 18, L.head, 0);
    ["103", "102", "101", "", "1", "2", "3", "4", "5"].forEach(function (s, k) { if (s) b += T(44 + k * 66, 59, "tgy tiny", s, "middle"); });
    b += R(8, 296, 624, 10, "#6f777e", 2) + R(8, 306, 624, 4, "#333", 0, ' opacity=".4"');
    [0, 1, 2].forEach(function (k) { b += R(18 + k * 66, 130, 52, 164, "none", 2, ' stroke="#9aa5ad" stroke-dasharray="4 3"') + T(44 + k * 66, 216, "tgy tiny", "empty", "middle"); });
    b += Pt.cpu1200(222, 106, .9) + Pt.sm1200(424, 106, .9);
    b += R(512, 130, 52, 164, "none", 2, ' stroke="#9aa5ad" stroke-dasharray="4 3"') + T(538, 216, "tgy tiny", "empty", "middle");
    b += T(310, 100, "tgy tiny", "PLC_1", "middle") + T(454, 100, "tgy tiny", "DI 8x24VDC_1", "middle");
    b += R(0, 342, 640, 88, "#fff", 0, ' stroke="' + L.line + '"') + R(0, 342, 640, 18, L.head, 0) + T(10, 355, "tb xs bold", "Properties    Info    Diagnostics", "start") + T(10, 376, "tgy tiny", "General     IO tags     System constants     Texts", "start") +
      T(10, 396, "tb xs", "\u25BE General", "start") + T(24, 410, "tgy xs", "PROFINET interface [X1]   IP address: 192.168.0.1   Subnet mask: 255.255.255.0", "start");
    b += R(640, 24, 260, 406, "#fff", 0, ' stroke="' + L.line + '"') + R(640, 24, 260, 20, "#c9ced2", 0) + T(650, 38, "tb xs bold", "Hardware catalog", "start") + R(646, 50, 248, 18, "#fff", 2, ' stroke="' + L.line + '"') + T(654, 63, "tgy tiny", "Search...", "start");
    ["\u25BE Catalog", "  \u25BE Controllers", "    \u25BE SIMATIC S7-1200", "      \u25BE CPU", "        CPU 1211C DC/DC/DC", "        CPU 1214C DC/DC/DC", "        CPU 1215C DC/DC/DC", "      \u25B8 HMI", "      \u25BE DI", "        DI 8x24VDC", "        DI 16x24VDC", "      \u25B8 DQ", "      \u25B8 AI", "  \u25B8 HMI", "  \u25B8 PC systems", "  \u25B8 Drives & starters", "  \u25B8 Network components"].forEach(function (t, k) { b += T(650, 90 + k * 17, "tb tiny", t, "start"); });
    b += N(214, 112, "1") + N(432, 112, "2") + N(870, 34, "3");
    return SS(900, 430, b, "Realistic-style device view of an S7-1200 CPU in a rack with communication module slots, a digital input module and the hardware catalog", true);
  };

  F["tag-table"] = function () {
    var b = "", cols = [28, 200, 300, 380, 440, 520, 600, 660], hdr = ["Name", "Data type", "Address", "Retain", "Acces...", "Writa...", "Visibl...", "Comment"], rows = [
      ["Start_PB", "Bool", "%I0.0", 0, 1, 1, 1, "Start push button (NO)"], ["Stop_PB", "Bool", "%I0.1", 0, 1, 1, 1, "Stop button (NC wired)"], ["Motor_Run", "Bool", "%Q0.0", 0, 1, 1, 1, "Motor contactor K1"],
      ["Run_Req", "Bool", "%M0.0", 0, 1, 1, 1, "Run request (seal-in)"], ["Tank_Level_Raw", "Int", "%IW64", 0, 1, 1, 1, "Level transmitter 4-20 mA"], ["<Add new>", "", "", 0, 0, 0, 0, ""]];
    b += R(0, 0, 860, 300, L.bg, 6, ' stroke="#9aa5ad"') + R(0, 0, 860, 24, "#34414b", 6) + T(12, 17, "tw s", "PLC_1  \u203A  PLC tags  \u203A  Default tag table [14]", "start");
    b += R(0, 24, 860, 26, L.head, 0);
    [8, 34, 60, 96, 122].forEach(function (x, i) { b += R(x, 31, 16, 13, i === 1 ? "#0a7f8c" : "#7a8791", 3); });
    b += R(0, 50, 860, 22, "#cfd6db", 0, ' stroke="' + L.line + '"');
    hdr.forEach(function (h, i) { b += T(cols[i], 65, "tgy xs bold", h, "start"); });
    rows.forEach(function (r, k) {
      var y = 72 + k * 28;
      b += R(0, y, 860, 28, k === 2 ? "#e3f1fb" : (k % 2 ? "#f6f8f9" : "#ffffff"), 0, ' stroke="' + L.line + '" stroke-width=".6"');
      if (k < 5) b += R(8, y + 8, 12, 12, "#1b73c9", 3);
      b += T(cols[0], y + 19, k === 5 ? "tgy xs" : "tb xs", r[0], "start") + T(cols[1], y + 19, "tb xs", r[1], "start") + T(cols[2], y + 19, "tb xs mono3", r[2], "start") + T(cols[7], y + 19, "tgy xs", r[7], "start");
      if (k < 5) [3, 4, 5, 6].forEach(function (c) { var on = r[c]; b += R(cols[c] + 10, y + 8, 12, 12, "#fff", 2, ' stroke="#8c979f"') + (on ? '<path d="M' + (cols[c] + 12.5) + "," + (y + 14) + " l3,3.2 l5,-6.4" + '" fill="none" stroke="#1b73c9" stroke-width="1.8"/>' : ""); });
    });
    b += T(10, 270, "tgy xs", "Names are for you. Addresses are for the CPU. TIA Portal links the two.", "start");
    return SS(860, 300, b, "A realistic-style TIA Portal PLC tag table with name, data type, address, checkboxes and comments", true);
  };

  F["hmi-screen"] = function () {
    var b = "";
    // bezel
    b += G(0, 0, 1, R(0, 0, 800, 480, "url(#gBlack)", 16) + R(0, 0, 800, 480, "none", 16, ' stroke="#555c63" stroke-width="1.5"') + R(24, 20, 752, 410, "#e6ebef", 4) + C(400, 455, 4, "url(#gLedG)") + T(400, 470, "tm tiny", "SIMATIC HMI Comfort Panel", "middle"));
    // header
    b += R(24, 20, 752, 36, "#0b6b78", 4) + T(40, 44, "tw s bold", "MIXING PLANT  |  Overview", "start") + T(760, 44, "tw xs", "Operator   14:32:08", "end");
    // tank 3D
    b += '<ellipse cx="150" cy="320" rx="70" ry="14" fill="#9aa5ad"/><rect x="80" y="110" width="140" height="210" fill="url(#gSteelV)"/><ellipse cx="150" cy="110" rx="70" ry="14" fill="#d9dfe3" stroke="#8a949b"/><ellipse cx="150" cy="320" rx="70" ry="14" fill="url(#gSteelV)" opacity=".0"/>' +
      '<rect x="92" y="190" width="116" height="125" fill="#2d7fd0" opacity=".85"/><ellipse cx="150" cy="190" rx="58" ry="10" fill="#6fb1ec"/><rect x="80" y="110" width="140" height="210" fill="none" stroke="#7d8890" stroke-width="1.5"/>' +
      '<rect x="228" y="120" width="14" height="190" rx="3" fill="#fff" stroke="#8a949b"/><rect x="230" y="190" width="10" height="118" fill="#2d7fd0"/>' + T(150, 236, "tw s bold", "63.2 %", "middle") + T(150, 350, "tgy xs bold", "Tank 1", "middle");
    // pipes + pump + valve
    b += '<rect x="220" y="285" width="130" height="14" fill="url(#gSteel)"/><rect x="408" y="285" width="130" height="14" fill="url(#gSteel)"/>' +
      '<circle cx="380" cy="292" r="30" fill="url(#gBtnG)" stroke="#0e5d28" stroke-width="2"/><polygon points="366,278 366,306 396,292" fill="#fff" opacity=".9"/>' + T(380, 340, "tgy xs bold", "Pump P1  RUNNING", "middle") +
      '<polygon points="560,278 590,292 560,306" fill="#2e9e5a" stroke="#0e5d28"/><polygon points="620,278 590,292 620,306" fill="#2e9e5a" stroke="#0e5d28"/><rect x="538" y="285" width="100" height="14" fill="url(#gSteel)" opacity=".0"/>' + T(590, 340, "tgy xs bold", "Valve V1  OPEN", "middle");
    // setpoint field
    b += R(300, 80, 160, 70, "#fff", 4, ' stroke="#8a949b"') + T(380, 100, "tgy xs", "Setpoint", "middle") + R(316, 110, 128, 30, "#fff", 2, ' stroke="#2d7fd0" stroke-width="2"') + T(380, 132, "tb s bold mono3", "75.0 %", "middle");
    // buttons
    b += R(300, 168, 74, 40, "#2fbf62", 5, ' stroke="#0e5d28" stroke-width="2"') + R(302, 170, 70, 16, "#fff", 4, ' opacity=".28"') + T(337, 194, "tw s bold", "START", "middle") +
      R(386, 168, 74, 40, "#d93a2b", 5, ' stroke="#7a1209" stroke-width="2"') + R(388, 170, 70, 16, "#fff", 4, ' opacity=".28"') + T(423, 194, "tw s bold", "STOP", "middle");
    // gauge
    b += R(520, 76, 236, 142, "#fff", 4, ' stroke="#8a949b"') + T(638, 96, "tgy xs", "Temperature", "middle") + '<path d="M570,190 A68,68 0 0 1 706,190" fill="none" stroke="#d3dadf" stroke-width="12"/><path d="M570,190 A68,68 0 0 1 638,122" fill="none" stroke="#2fbf62" stroke-width="12"/><path d="M638,122 A68,68 0 0 1 690,142" fill="none" stroke="#f0b310" stroke-width="12"/>' +
      '<line x1="638" y1="190" x2="618" y2="140" stroke="#222" stroke-width="3"/><circle cx="638" cy="190" r="6" fill="#222"/>' + T(638, 212, "tb s bold", "48.5 \u00B0C", "middle");
    // alarm bar + nav
    b += R(40, 372, 720, 24, "#d93a2b", 3) + T(52, 389, "tw xs bold", "\u25B2 14:31:08   Tank 1 high level            UNACKNOWLEDGED", "start");
    b += R(40, 402, 720, 22, "#c9d1d7", 3);
    ["Home", "Overview", "Trends", "Alarms", "Recipes", "Settings", "Login"].forEach(function (t, i) { b += R(44 + i * 102, 404, 96, 18, i === 1 ? "#0b6b78" : "#e9edf0", 3, ' stroke="#8a949b" stroke-width=".7"') + T(92 + i * 102, 417, i === 1 ? "tw tiny bold" : "tb tiny", t, "middle"); });
    b += N(40, 100, "1") + N(300, 80, "2") + N(300, 170, "3") + N(770, 372, "4") + N(32, 404, "5");
    return SS(800, 484, b, "A realistic-style HMI overview screen on a Comfort Panel: tank with level, pump and valve, setpoint field, start and stop buttons, temperature gauge, alarm bar and navigation bar");
  };
  F["tia-online-menu"] = function () {
    var b = "", items = [["Go online", "", "#e0701e", 0], ["Extended go online...", "", "#e0701e", 0], ["Go offline", "Ctrl+M", "#9aa5ad", 1], ["-"], ["Simulation", "\u25B8", "#2e6fc2", 0], ["Stop runtime/simulation", "", "", 1], ["-"], ["Download to device", "Ctrl+L", "#2e6fc2", 0],
      ["Extended download to device...", "", "", 0], ["Download and reset PLC program", "", "", 0, 1], ["Download user program to Memory Card", "", "", 1], ["Snapshot of the actual values", "", "#9aa5ad", 1]], y = 78;
    b += R(0, 0, 820, 400, L.bg, 6, ' stroke="#9aa5ad"') + R(0, 0, 820, 24, "#34414b", 6) + T(12, 17, "tw s", "Siemens - FirstProject", "start");
    b += R(0, 24, 820, 22, "#f7f8f9", 0) + R(0, 46, 820, 26, L.head, 0) + R(8, 51, 16, 16, "#3a77c9", 2) + T(30, 64, "tb xs", "Save project", "start");
    ["Project", "Edit", "View", "Insert", "Online", "Options", "Tools", "Window", "Help"].forEach(function (m, i) {
      var x = 12 + i * 58; if (m === "Online") b += R(x - 6, 26, 56, 20, "#cfe7f7", 2, ' stroke="#0a7f8c" stroke-width="2"');
      b += T(x, 40, "tb xs", m, "start");
    });
    b += R(0, 72, 230, 328, "#fff", 0, ' stroke="' + L.line + '"') + R(0, 72, 230, 18, "#c9ced2", 0) + T(10, 85, "tb xs bold", "Project tree", "start") + R(8, 94, 58, 18, "#fff", 2, ' stroke="' + L.line + '"') + T(37, 107, "tb xs bold", "Devices", "middle");
    ["\u25BE FirstProject", "   Add new device", "   Devices & networks"].forEach(function (t, i) { b += T(16, 134 + i * 20, "tb xs", t, "start"); });
    b += R(1, 184, 228, 18, "#cfe7f7", 0);  b += T(16, 197, "tb xs", "   \u25B8 PLC_1 [CPU 1214C DC/DC/DC]", "start");
    b += R(236, 46, 330, items.length * 24 + 14, "#ffffff", 2, ' stroke="#8c979f"');
    items.forEach(function (it, i) {
      var yy = 52 + (i * 24);
      if (it[0] === "-") { b += line(244, yy + 12, 558, yy + 12, "#cdd3d8", 1); return; }
      if (it[4]) b += R(238, yy, 326, 22, "#2f6fd6", 0);
      if (it[2]) b += R(246, yy + 5, 12, 12, it[2], 2);
      b += T(268, yy + 15, it[3] && !it[4] ? "tgy xs" : (it[4] ? "tw xs" : "tb xs"), it[0], "start") + (it[1] ? T(554, yy + 15, it[3] ? "tgy xs" : "tb xs", it[1], "end") : "");
    });
    b += N(582, 160, "1") + T(598, 164, "tb xs", "Start the simulator here", "start") + N(582, 231, "2") + T(598, 235, "tb xs", "Send the project to the CPU", "start") + N(582, 63, "3") + T(598, 67, "tb xs", "Connect and monitor", "start");
    b += T(246, 392, "tgy xs", "Redrawn from the Online menu structure in Siemens documentation. Your version may differ slightly.", "start");
    return SS(820, 404, b, "The Online menu of TIA Portal showing go online, go offline, simulation, download to device and related commands", true);
  };
  F["ladder-anatomy"] = function () {
    var b = "", k = "#222", ln = function (x1, y1, x2, y2, w) { return line(x1, y1, x2, y2, k, w || 2); };
    b += R(0, 0, 800, 400, L.bg, 6, ' stroke="#9aa5ad"') + R(14, 14, 772, 22, "#d6e6f2", 2, ' stroke="#b3cde0"') + T(26, 30, "tb s bold", "\u25BE Network 1:", "start") + T(118, 30, "tb s", "Start and stop the motor", "start");
    b += R(14, 36, 772, 150, "#ffffff", 0, ' stroke="#d4dae0"');
    b += ln(50, 62, 50, 176, 2.4) + ln(50, 120, 130, 120) + ln(130, 108, 130, 132, 2.4) + ln(150, 108, 150, 132, 2.4) + ln(150, 120, 230, 120);
    b += ln(230, 108, 230, 132, 2.4) + ln(250, 108, 250, 132, 2.4) + ln(230, 132, 250, 108) + ln(250, 120, 520, 120);
    b += '<path d="M526,108 Q516,120 526,132 M542,108 Q552,120 542,132" fill="none" stroke="' + k + '" stroke-width="2.4"/>' + ln(542, 120, 580, 120);
    b += T(140, 100, "tb xs", "\"Start_PB\"", "middle") + T(140, 150, "tgy tiny", "%I0.0", "middle") + T(240, 100, "tb xs", "\"Stop_PB\"", "middle") + T(240, 150, "tgy tiny", "%I0.1", "middle") + T(534, 100, "tb xs", "\"Motor\"", "middle") + T(534, 150, "tgy tiny", "%Q0.0", "middle");
    b += N(50, 56, "1") + N(140, 170, "2") + N(240, 170, "3") + N(534, 170, "4") + N(796 - 24, 25, "5");
    ["1  Left power rail. Power flows from here to the right. TIA Portal draws no right-hand rail.", "2  Normally open contact: passes power when its bit is 1.", "3  Normally closed contact (note the slash): passes power when its bit is 0.", "4  Coil: switched on when power reaches it. The network ends here.", "5  Network header: one rung of logic, with a title and comment."].forEach(function (t, i) { b += T(24, 224 + i * 24, "tb s", t, "start"); });
    b += T(24, 362, "tgy xs", "Series contacts = AND. Parallel branches = OR. In the online view green means power is flowing and blue dashed means it is not.", "start");
    return SS(800, 400, b, "A TIA Portal style ladder network with a left power rail, a normally open contact, a normally closed contact and a coil, with numbered explanations", true);
  };
  // ---------- LAD / FBD / SCL side by side (rendered by the simulator's own drawing code) ----------
  F["three-languages"] = function () {
    var rungs = [{ title: "Start and stop the motor", c: [["par", [[["NO", "Start_PB"]], [["NO", "Motor"]]]], ["NC", "Stop_PB"]], o: ["coil", "Motor"] }],
      addr = { Start_PB: "%I0.0", Stop_PB: "%I0.1", Motor: "%Q0.0" }, tags = { Start_PB: true, Stop_PB: false, Motor: false };
    var scl = '"Motor" := ("Start_PB" OR "Motor")\n           AND NOT "Stop_PB";';
    return '<div class="tri"><div class="pan"><h4>LAD  (ladder)</h4>' + window.Sim.render(rungs, tags, "lad", addr) + '</div><div class="pan"><h4>FBD  (function blocks)</h4>' + window.Sim.render(rungs, tags, "fbd", addr) +
      '</div><div class="pan"><h4>SCL  (structured text)</h4><pre>' + scl.replace(/&/g, "&amp;") + '</pre><pre>// Same logic, text form.\n// OR  = parallel branches in LAD\n// AND = series contacts\n// NOT = normally closed contact</pre></div></div>';
  };

  // ---------- an FC call box in LAD ----------
  F["fc-call"] = function () {
    var b = "", k = "#222";
    b += R(0, 0, 780, 324, L.bg, 6, ' stroke="#9aa5ad"') + R(14, 14, 752, 22, "#d6e6f2", 2, ' stroke="#b3cde0"') + T(26, 30, "tb s bold", "\u25BE Network 3:", "start") + T(118, 30, "tb s", "Convert the raw level to percent", "start");
    b += R(14, 36, 752, 190, "#ffffff", 0, ' stroke="#d4dae0"');
    b += line(40, 60, 40, 214, k, 2) + line(40, 100, 330, 100, k, 2);
    b += R(330, 62, 150, 34, "#c7cbd8", 0, ' stroke="#8d94a6"') + R(330, 89, 150, 100, "#e8eaf1", 0, ' stroke="#8d94a6"') + R(330, 62, 150, 34, "#c7cbd8", 0, ' stroke="#8d94a6"');
    b += T(405, 78, "tb s bold", "Calc_Percent", "middle") + T(405, 92, "tgy tiny", "%FC1", "middle");
    b += T(338, 104, "tb xs", "EN", "start") + T(338, 126, "tb xs", "Raw", "start") + T(472, 104, "tb xs", "ENO", "end") + T(472, 126, "tb xs", "Percent", "end");
    b += line(330, 122, 270, 122, k, 1.6) + T(266, 118, "tb xs", "\"Tank_Level_Raw\"", "end") + T(266, 134, "tgy tiny", "%IW64", "end");
    b += line(480, 122, 540, 122, k, 1.6) + T(546, 126, "tb xs", "\"Tank_Level_Pct\"", "start") + line(480, 100, 506, 100, "#f0a000", 2);
    b += N(405, 56, "1") + N(300, 150, "2") + N(515, 150, "3");
    ["1  The block name and number. Drag the FC from the project tree into a network to get this box.", "2  Input pins: you connect a tag or a value to each one.", "3  Output pins: the result is written to the tag you connect.", "EN / ENO are optional power-flow pins. The FC keeps no memory between calls."].forEach(function (t, i) { b += T(24, 250 + i * 16, i < 3 ? "tb xs" : "tgy xs", t, "start"); });
    return SS(780, 324, b, "A function call box in ladder with a block name, input pin Raw connected to Tank_Level_Raw and output pin Percent connected to Tank_Level_Pct", true);
  };

  // ---------- optimized vs standard data block layout ----------
  F["db-layout"] = function () {
    var b = "";
    function table(x, title, sub, cols, rows) {
      var s = R(x, 14, 370, 250, "#ffffff", 4, ' stroke="#9aa5ad"') + R(x, 14, 370, 24, "#34414b", 4) + T(x + 12, 31, "tw s bold", title, "start") + T(x + 12, 56, "tgy xs", sub, "start");
      s += R(x, 64, 370, 20, "#cfd6db", 0, ' stroke="#c5ccd2"');
      cols.forEach(function (c, i) { s += T(x + 14 + i * 100, 78, "tgy xs bold", c, "start"); });
      rows.forEach(function (r, k) { var y = 84 + k * 26; s += R(x, y, 370, 26, k % 2 ? "#f6f8f9" : "#fff", 0, ' stroke="#e1e6ea"'); r.forEach(function (v, i) { s += T(x + 14 + i * 100, y + 18, i === 0 && cols[0] === "Offset" ? "tb xs mono3" : "tb xs", v, "start"); }); });
      return s;
    }
    b += R(0, 0, 780, 340, L.bg, 6, ' stroke="#9aa5ad"');
    b += table(14, "Standard access", "Fixed byte offsets. You manage them.", ["Offset", "Name", "Type"], [["0.0", "Start", "Bool"], ["0.1", "Stop", "Bool"], ["2.0", "Speed", "Int"], ["4.0", "Temp", "Real"]]);
    b += table(396, "Optimized access (default)", "TIA lays out memory. You use names only.", ["Name", "Type", "Retain"], [["Start", "Bool", ""], ["Stop", "Bool", ""], ["Speed", "Int", ""], ["Temp", "Real", "\u2714"]]);
    b += R(14, 276, 752, 50, "#fff7e0", 4, ' stroke="#e3c46a"') + T(26, 296, "tb xs", "Insert a new variable in the middle: with standard access the offsets of everything after it shift, so a partner that reads by offset breaks.", "start") + T(26, 314, "tb xs", "With optimized access nothing is addressed by offset, so nothing breaks. That is why it is the default.", "start");
    return SS(780, 340, b, "Comparison of a standard data block with fixed offsets and an optimized data block addressed only by name", true);
  };
// ---------- SCADA architecture ----------
  F["scada-arch"] = function () {
    var b = "";
    function box(x, y, w, h, title, sub, cls) { return R(x, y, w, h, cls || "#1b2228", 8, ' stroke="#2e3a43" stroke-dasharray="5 4"') + T(x + w / 2, y + 18, "tm xs bold", title, "middle") + (sub ? T(x + w / 2, y + 32, "tm tiny", sub, "middle") : ""); }
    b += box(618, 20, 184, 170, "ENTERPRISE", "MES, ERP, reports");
    b += box(14, 20, 590, 170, "SUPERVISORY LEVEL", "SCADA servers, historian, operator stations");
    b += box(14, 214, 788, 112, "CONTROL NETWORK", "");
    b += box(14, 346, 788, 150, "FIELD / CONTROL LEVEL", "PLCs and remote units next to the process");
    // cables first
    b += Pt.cableP("M120,186 C120,226 316,214 316,250") + Pt.cableP("M294,186 C294,226 346,226 346,250") + Pt.cableP("M471,186 C471,226 400,226 400,250") + Pt.cableP("M604,186 C604,226 462,226 462,250");
    b += Pt.cableP("M330,290 C330,340 120,330 120,380") + Pt.cableP("M400,290 C400,340 300,330 300,380") + '<path d="M440,290 C500,330 560,330 600,380" fill="none" stroke="#f0b44a" stroke-width="3" stroke-dasharray="6 6"/>';
    b += '<path d="M642,112 L668,146" fill="none" stroke="#ff8a1f" stroke-width="3" stroke-dasharray="3 5"/>';
    // operator stations
    b += Pt.laptop(40, 60, .8) + T(120, 160, "tw xs bold", "Operator station 1", "middle") + Pt.laptop(214, 60, .8) + T(294, 160, "tw xs bold", "Operator station 2", "middle");
    // server
    b += G(396, 66, 1, R(0, 0, 150, 76, "url(#gDark)", 6, ' stroke="#111"') + R(8, 8, 134, 14, "#1a1f23", 2) + R(8, 28, 134, 14, "#1a1f23", 2) + R(8, 48, 134, 14, "#1a1f23", 2) + Pt.led(18, 15, true, "g") + Pt.led(18, 35, true, "g") + Pt.led(18, 55, true, "a") + T(80, 70, "tiny tm", "", "middle"));
    b += T(471, 160, "tw xs bold", "SCADA server", "middle") + T(471, 174, "tm tiny", "(often redundant)", "middle");
    // historian cylinder
    b += '<ellipse cx="604" cy="82" rx="38" ry="12" fill="#9aa5ad"/><rect x="566" y="82" width="76" height="46" fill="url(#gMetalH)"/><ellipse cx="604" cy="128" rx="38" ry="12" fill="#aeb8bf"/><ellipse cx="604" cy="82" rx="38" ry="12" fill="#d4dade" stroke="#8a949b"/>' + T(604, 160, "tw xs bold", "Historian", "middle") + T(604, 174, "tm tiny", "archive + alarms", "middle");
    // firewall
    b += R(668, 126, 44, 50, "#ff8a1f", 4, ' stroke="#7a3d00"') + T(690, 156, "tb xs bold", "FW", "middle") + T(690, 192, "tm tiny", "firewall", "middle");
    b += Pt.laptop(704, 52, .5) + T(754, 118, "tm tiny", "reports", "middle");
    // switch
    b += Pt.sw(284, 250, 1.0) + T(524, 288, "tw xs bold", "Control network switch", "start");
    // plcs
    b += Pt.cpu1200(40, 380, .52) + T(100, 492, "tw xs bold", "PLC: machine A", "middle") + Pt.cpu1200(224, 380, .52) + T(284, 492, "tw xs bold", "PLC: machine B", "middle");
    b += G(520, 384, 1, R(0, 0, 140, 78, "url(#gDark)", 6, ' stroke="#111"') + R(10, 12, 70, 20, "#15181b", 2) + Pt.led(18, 22, true, "g") + '<line x1="116" y1="0" x2="116" y2="-34" stroke="#8a949b" stroke-width="3"/><circle cx="116" cy="-38" r="4" fill="#ff8a1f"/>' + T(70, 62, "tg tiny", "RTU", "middle")) + T(590, 492, "tw xs bold", "Remote RTU", "middle") + T(590, 506, "tm tiny", "radio / cellular link (dashed)", "middle");
    b += Pt.prox(700, 396, .5) + Pt.valve(740, 470, .4) + T(730, 492, "tm tiny", "sensors, valves, drives", "middle");
    return SS(816, 516, b, "SCADA architecture: operator stations, SCADA server and historian above a control network switch connected to PLCs and a remote RTU over radio, with a firewall to the enterprise level");
  };

})();
