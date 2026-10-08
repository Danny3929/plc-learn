/* Figures for modules 9-12 (electrical and field devices, advanced programming, practice, other platforms). */
(function () {
  "use strict";
  var F = window.FIGS, H = window.FIGH, S = H.S, T = H.T, R = H.R, L = H.L, P = H.P, C = H.C, N = H.N, TL = H.TL;

  // ---------- control circuit vs power circuit ----------
  F["motor-circuit"] = function () {
    var b = "";
    b += R(10, 10, 330, 250, "w") + T(175, 32, "CONTROL circuit: 24 V DC", "bold", "middle");
    b += R(30, 56, 110, 56, "a") + T(85, 80, "PLC", "bold", "middle") + T(85, 98, "output %Q0.0", "xs", "middle");
    b += L(140, 84, 200, 84, "ln acc") + L(200, 84, 200, 140, "ln acc");
    b += R(165, 140, 70, 46, "g") + T(200, 160, "K1", "bold", "middle") + T(200, 176, "coil", "xs", "middle");
    b += L(200, 186, 200, 230, "ln acc") + L(200, 230, 85, 230, "ln acc") + L(85, 230, 85, 112, "ln acc");
    b += T(246, 162, "24 V DC,", "xs m", "start") + T(246, 177, "mA to a few", "xs m", "start") + T(246, 192, "hundred mA", "xs m", "start");
    b += R(360, 10, 380, 250, "b") + T(550, 32, "POWER circuit: 400 V AC, 3 phase", "bold", "middle");
    b += TL(372, 62, ["L1", "L2", "L3"], 22, "s bold", "start");
    b += L(396, 56, 460, 56, "ln") + L(396, 78, 460, 78, "ln") + L(396, 100, 460, 100, "ln");
    b += R(460, 44, 60, 68, "b") + T(490, 70, "Q1", "bold", "middle") + T(490, 88, "breaker", "xs", "middle");
    b += L(520, 56, 560, 56, "ln") + L(520, 78, 560, 78, "ln") + L(520, 100, 560, 100, "ln");
    b += R(560, 44, 60, 68, "g") + T(590, 70, "K1", "bold", "middle") + T(590, 88, "contacts", "xs", "middle");
    b += L(620, 56, 650, 56, "ln") + L(620, 78, 650, 78, "ln") + L(620, 100, 650, 100, "ln");
    b += R(650, 44, 80, 68, "w") + T(690, 70, "F1", "bold", "middle") + T(690, 88, "overload", "xs", "middle");
    b += L(690, 112, 690, 150, "ln thick") + C(690, 190, 36, "b") + T(690, 195, "M1", "bold", "middle") + T(690, 244, "motor", "xs m", "middle");
    b += P("M200,140 C 250,120 520,130 590,112", "ln dash acc", 1) + T(400, 150, "the coil closes the K1 contacts", "xs", "middle");
    b += T(550, 226, "tens of amps, can kill", "xs m", "middle");
    return S(750, 270, b, "A PLC output energises contactor coil K1 in a 24 volt control circuit, and the K1 contacts switch the 400 volt three phase motor circuit through a breaker and overload relay");
  };

  // ---------- PNP vs NPN ----------
  F["pnp-npn"] = function () {
    var b = "";
    function half(x, title, sub, pnp) {
      var s = R(x, 10, 350, 270, "b") + T(x + 175, 34, title, "bold", "middle") + T(x + 175, 52, sub, "xs m", "middle");
      s += L(x + 30, 90, x + 30, 260, "ln acc") + T(x + 30, 78, "+24 V", "s bold", "middle");
      s += L(x + 320, 90, x + 320, 260, "ln") + T(x + 320, 78, "0 V", "s bold", "middle");
      // sensor between the rails
      s += R(x + 70, 110, 90, 110, "a") + T(x + 115, 132, "Sensor", "bold", "middle") + T(x + 115, 150, "brown +24 V", "xs", "middle") + T(x + 115, 168, "black output", "xs bold", "middle") + T(x + 115, 206, "blue 0 V", "xs", "middle");
      s += L(x + 30, 146, x + 70, 146, "ln acc") + L(x + 30, 258, x + 115, 258, "ln") + L(x + 115, 220, x + 115, 258, "ln");
      s += L(x + 30, 258, x + 30, 258, "ln") + L(x + 115, 258, x + 320, 258, "ln");
      // PLC input box
      s += R(x + 215, 136, 80, 60, "g") + T(x + 255, 160, "PLC", "xs bold", "middle") + T(x + 255, 176, "DI input", "xs", "middle");
      s += L(x + 160, 168, x + 215, 168, "ln acc");
      if (pnp) { s += L(x + 255, 196, x + 255, 258, "ln") + T(x + 188, 160, "+24 V", "xs", "middle") + T(x + 280, 236, "return to 0 V", "xs m", "middle"); }
      else { s += L(x + 255, 136, x + 255, 100, "ln acc") + L(x + 255, 100, x + 30, 100, "ln acc") + T(x + 188, 160, "0 V", "xs", "middle") + T(x + 290, 118, "return to +24 V", "xs m", "middle"); }
      return s;
    }
    b += half(10, "PNP (sourcing)", "Output switches +24 V to the input", true);
    b += half(380, "NPN (sinking)", "Output switches the input to 0 V", false);
    b += T(375, 300, "Most of Europe and Siemens modules: PNP. Always match sensor and input module type.", "s", "middle");
    return S(750, 316, b, "A PNP sensor sources 24 volts to the PLC input; an NPN sensor sinks the input to 0 volts");
  };

  // ---------- 4-20 mA loop ----------
  F["loop-420"] = function () {
    var b = "";
    b += R(10, 20, 330, 190, "b") + T(175, 42, "Two-wire 4-20 mA loop", "bold", "middle");
    b += R(30, 70, 90, 60, "w") + T(75, 96, "24 V DC", "bold", "middle") + T(75, 114, "supply", "xs", "middle");
    b += R(220, 70, 100, 60, "a") + T(270, 96, "Transmitter", "bold", "middle") + T(270, 114, "pressure, level", "xs", "middle");
    b += L(120, 90, 220, 90, "ln acc") + L(120, 120, 140, 120, "ln") + L(140, 120, 140, 180, "ln") + L(140, 180, 190, 180, "ln");
    b += R(190, 160, 100, 40, "g") + T(240, 178, "PLC AI", "bold", "middle") + T(240, 194, "250 Ω shunt", "xs", "middle");
    b += L(290, 180, 320, 180, "ln") + L(320, 180, 320, 130, "ln");
    b += T(175, 66, "loop current is the signal", "xs m", "middle");
    // graph
    b += L(390, 190, 720, 190, "ln thin") + L(390, 190, 390, 40, "ln thin");
    b += T(555, 214, "Process value (0 to 100 %)", "xs m", "middle") + T(380, 34, "mA", "xs m", "end");
    var y4 = 190 - (4 / 24) * 150, y20 = 190 - (20 / 24) * 150;
    b += L(390, y4, 720, y4, "grid") + L(390, y20, 720, y20, "grid");
    b += T(384, y4 + 4, "4", "xs", "end") + T(384, y20 + 4, "20", "xs", "end");
    b += L(420, y4, 690, y20, "sig acc");
    b += T(420, y4 - 12, "0 % = 4 mA", "xs", "start") + T(690, y20 - 10, "100 % = 20 mA", "xs", "end");
    b += R(480, 172, 170, 18, "w", 3) + T(565, 185, "below 3.6 mA = wire break", "xs", "middle");
    b += T(555, 232, "A dead wire reads 0 mA, which is clearly NOT 0 %. That is the point of the 'live zero'.", "xs", "middle");
    return S(750, 244, b, "A transmitter, 24 volt supply and PLC analog input in series; 4 milliamps equals zero percent and 20 milliamps equals one hundred percent");
  };

  // ---------- pneumatic cylinder and valve ----------
  F["cylinder-valve"] = function () {
    var b = "";
    // valve 5/2 single solenoid spring return
    b += R(40, 40, 130, 70, "a") + L(105, 40, 105, 110, "ln thin");
    b += L(60, 100, 90, 50, "ln", 1) + L(120, 50, 150, 100, "ln", 1);
    b += R(170, 55, 28, 40, "g", 3) + T(184, 80, "Y1", "xs bold", "middle") + R(12, 55, 28, 40, "n", 3) + P("M16,60 l4,6 l4,-6 l4,6 l4,-6", "ln thin");
    b += T(105, 132, "5/2 valve, spring return", "s bold", "middle") + T(105, 150, "Y1 on: extend. Y1 off: spring retracts.", "xs m", "middle");
    // cylinder
    b += R(300, 60, 220, 50, "b") + R(260, 79, 40, 12, "g", 2) + R(520, 79, 120, 12, "g", 2) + R(380, 62, 14, 46, "w", 2);
    b += L(190, 70, 320, 40, "ln") + L(320, 40, 320, 60, "ln") + L(190, 100, 500, 130, "ln") + L(500, 130, 500, 110, "ln");
    b += T(410, 36, "retract port", "xs m", "middle") + T(560, 140, "extend port", "xs m", "end");
    b += R(262, 130, 24, 24, "b") + T(274, 147, "B1", "xs bold", "middle") + T(274, 170, "back sensor", "xs", "middle");
    b += R(640, 110, 24, 24, "b") + T(652, 127, "B2", "xs bold", "middle") + T(652, 150, "front sensor", "xs", "middle");
    b += L(274, 130, 290, 95, "ln thin dash") + L(652, 110, 640, 95, "ln thin dash");
    b += R(40, 190, 670, 54, "n") + T(375, 212, "PLC: Y1 is a digital output. B1 and B2 are digital inputs from magnetic sensors on the cylinder.", "s", "middle") + T(375, 232, "A sequence moves on only when the sensor confirms the movement, never just after a time.", "s", "middle");
    return S(750, 256, b, "A single solenoid five by two valve feeds a double acting cylinder with a back sensor B1 and a front sensor B2");
  };

  // ---------- tag naming: ISA and IEC ----------
  F["tag-naming"] = function () {
    var b = "";
    b += R(10, 10, 360, 210, "a") + T(190, 34, "P&ID instrument tag (ISA 5.1)", "bold", "middle");
    b += T(190, 80, "L I C - 1 0 1", "mono2", "middle");
    b += L(132, 90, 132, 106, "ln thin") + T(132, 120, "L = Level", "xs bold", "end");
    b += L(152, 90, 152, 131, "ln thin") + T(152, 145, "I = Indicating", "xs bold", "end");
    b += L(171, 90, 171, 156, "ln thin") + T(171, 170, "C = Controller", "xs bold", "end");
    b += T(228, 118, "101 = loop number", "xs", "start") + L(226, 114, 226, 92, "ln thin");
    b += R(390, 10, 350, 210, "g") + T(565, 34, "Electrical device letters (IEC 81346)", "bold", "middle");
    var rows = [["-Q1", "Circuit breaker / motor protection"], ["-K1", "Contactor or relay"], ["-F1", "Fuse / overload relay"], ["-S1", "Push button, switch"], ["-B1", "Sensor, transducer"], ["-Y1", "Valve solenoid"], ["-M1", "Motor"], ["-H1", "Lamp, horn"], ["-A1", "PLC, controller"]];
    rows.forEach(function (r, i) { b += T(410, 62 + i * 18, r[0], "s bold mono3", "start") + T(470, 62 + i * 18, r[1], "xs", "start"); });
    return S(750, 232, b, "How to read an ISA instrument tag such as LIC-101 and common IEC device letters such as K for contactor and B for sensor");
  };

  // ---------- array in memory ----------
  F["array-mem"] = function () {
    var b = "";
    b += T(20, 24, "Motors : Array[1..4] of \"UDT_Motor\"", "bold mono3");
    for (var i = 0; i < 4; i++) {
      var x = 20 + i * 178;
      b += R(x, 40, 168, 150, i % 2 ? "b" : "a") + T(x + 84, 60, "Motors[" + (i + 1) + "]", "s bold", "middle");
      b += TL(x + 14, 84, ["Run : Bool", "Fault : Bool", "Speed_SP : Real", "Hours : DInt"], 22, "xs mono3");
    }
    b += L(20, 206, 726, 206, "ln thin") + T(374, 226, "Same layout repeated. Index 1..4 selects one block of data.", "s", "middle");
    b += R(20, 240, 706, 40, "n") + T(374, 265, "In SCL:  FOR #i := 1 TO 4 DO  \"MotorDB\".Motors[#i].Hours := \"MotorDB\".Motors[#i].Hours + 1;  END_FOR;", "xs mono3", "middle");
    return S(750, 292, b, "An array of four motor structures laid out one after another in a data block");
  };

  // ---------- GRAFCET / sequence chart ----------
  F["grafcet"] = function () {
    var b = "";
    function step(x, y, n, label, init) {
      var s = R(x, y, 60, 40, init ? "a" : "b", 2); if (init) s += R(x + 5, y + 5, 50, 30, "n", 1);
      return s + T(x + 30, y + 26, n, "bold", "middle") + T(x + 80, y + 26, label, "xs", "start");
    }
    function trans(x, y, label) { return L(x + 30, y - 12, x + 30, y + 12, "ln") + L(x + 22, y, x + 38, y, "ln thick") + T(x + 50, y + 4, label, "xs m", "start"); }
    b += step(40, 20, "S0", "Idle: all off", true);
    b += L(70, 60, 70, 76, "ln") + trans(40, 90, "[ Start_PB AND Cyl_Back ]");
    b += L(70, 102, 70, 118, "ln") + step(40, 118, "S1", "Extend cylinder (Y1 = 1)", false);
    b += L(70, 158, 70, 174, "ln") + trans(40, 188, "[ Cyl_Front ]");
    b += L(70, 200, 70, 216, "ln") + step(40, 216, "S2", "Hold 2 s (timer T1)", false);
    b += L(70, 256, 70, 272, "ln") + trans(40, 286, "[ T1.Q ]");
    b += L(70, 298, 70, 314, "ln") + step(40, 314, "S3", "Retract (Y1 = 0)", false);
    b += P("M40,334 H18 V40 H40", "ln", 1) + T(14, 190, "[ Cyl_Back ]", "xs m", "end");
    b += R(420, 30, 310, 210, "b") + T(575, 54, "How a step chain runs", "bold", "middle");
    b += TL(436, 82, ["One step is active at a time.", "Actions belong to the step.", "A transition fires when the step before it", "is active AND its condition is true.", "Firing deactivates the old step and", "activates the next one.", "Easy to read, easy to test, easy to fault-find."], 20, "s");
    return S(830, 366, '<g transform="translate(90,0)">' + b + "</g>", "A GRAFCET sequence chart with four steps S0 to S3 and transition conditions between them");
  };

  // ---------- OEE ----------
  F["oee"] = function () {
    var b = "", bars = [["Availability", "Run time / planned time", 0.9, "g"], ["Performance", "Actual rate / ideal rate", 0.95, "a"], ["Quality", "Good parts / all parts", 0.98, "w"]];
    bars.forEach(function (r, i) {
      var y = 24 + i * 56;
      b += T(20, y + 16, r[0], "bold") + T(20, y + 34, r[1], "xs m") + R(240, y, 400, 36, "n", 3) + '<rect x="240" y="' + y + '" width="' + (400 * r[2]) + '" height="36" rx="3" class="' + r[3] + '"/>' + T(650, y + 24, Math.round(r[2] * 100) + " %", "bold");
    });
    b += L(20, 196, 730, 196, "ln thin") + T(20, 228, "OEE = 0.90 × 0.95 × 0.98 = 0.838", "bold mono3") + T(20, 252, "Three individually good numbers still leave 16 % of the machine's potential on the floor.", "s m");
    return S(750, 268, b, "Overall equipment effectiveness is availability times performance times quality, here 90 percent, 95 percent and 98 percent giving 83.8 percent");
  };

  // ---------- Siemens vs Allen-Bradley ----------
  F["s7-vs-ab"] = function () {
    var cols = [20, 220, 480], rows = [
      ["", "Siemens TIA Portal", "Rockwell Studio 5000"],
      ["Normally open contact", "--| |--  (NO)", "XIC"],
      ["Normally closed contact", "--|/|--  (NC)", "XIO"],
      ["Output coil", "--( )--", "OTE"],
      ["Latch / unlatch", "--(S)-- / --(R)--", "OTL / OTU"],
      ["On-delay timer", "TON, IN / PT / Q / ET", "TON, .EN .TT .DN .PRE .ACC"],
      ["Up counter", "CTU, CU / PV / Q / CV", "CTU, .CU .DN .PRE .ACC"],
      ["Edge detection", "P_TRIG / N_TRIG, or P / N contact", "ONS (one shot)"],
      ["Reusable block", "FC / FB + instance DB", "AOI (Add-On Instruction)"],
      ["Data containers", "DB, UDT", "Tags, UDT (data type)"]
    ];
    var b = R(10, 10, 730, 30, "a", 3);
    rows.forEach(function (r, k) {
      var y = 10 + k * 34;
      if (k) b += R(10, y, 730, 32, k % 2 ? "n" : "b", 3);
      r.forEach(function (c, i) { b += T(cols[i] + 6, y + 21, c, k ? (i ? "s" : "s bold") : "s bold"); });
    });
    return S(750, 358, b, "A comparison table of Siemens and Rockwell instruction names");
  };

  // ---------- safety architecture ----------
  F["safety-arch"] = function () {
    var b = "";
    b += R(10, 10, 730, 70, "n") + T(375, 30, "Standard (non-safety) world", "bold", "middle") + R(30, 40, 200, 30, "b") + T(130, 60, "Standard program (OB1, FBs)", "xs", "middle") + R(270, 40, 200, 30, "b") + T(370, 60, "HMI, SCADA, standard I/O", "xs", "middle");
    b += R(10, 96, 730, 200, "a") + T(375, 118, "Safety world: F-CPU (one CPU, two separate programs)", "bold", "middle");
    b += R(30, 134, 200, 70, "g") + T(130, 156, "Safety program", "bold", "middle") + T(130, 174, "F-OB, F-FBs (ESTOP1, FDBACK...)", "xs", "middle") + T(130, 190, "own signature + password", "xs", "middle");
    b += R(270, 134, 200, 70, "g") + T(370, 156, "F-runtime group", "bold", "middle") + T(370, 174, "runs inside the F-cycle time", "xs", "middle") + T(370, 190, "watchdog: F-monitoring time", "xs", "middle");
    b += R(510, 134, 210, 70, "g") + T(615, 156, "Standard-to-safety data", "bold", "middle") + T(615, 174, "only through defined", "xs", "middle") + T(615, 190, "interface DB / F-blocks", "xs", "middle");
    b += L(230, 169, 270, 169, "ln", 1) + L(470, 169, 510, 169, "ln", 1);
    b += R(30, 228, 330, 54, "w") + T(195, 250, "F-DI: e-stop, door, light curtain", "bold", "middle") + T(195, 268, "two channels, PROFIsafe to the CPU", "xs", "middle");
    b += R(390, 228, 330, 54, "w") + T(555, 250, "F-DQ / safe drive (STO): contactors, valves", "bold", "middle") + T(555, 268, "if one channel fails, outputs go to the safe state", "xs", "middle");
    b += L(195, 228, 195, 204, "ln", 1) + L(555, 204, 555, 228, "ln", 1);
    b += T(375, 316, "Only fail-safe modules and F-blocks may be used for safety functions. Standard I/O never counts.", "s", "middle");
    return S(750, 330, b, "A safety CPU runs a separate safety program with its own signature, connected through PROFIsafe to two-channel fail-safe inputs and outputs");
  };

  // ---------- Startdrive flow ----------
  F["startdrive-flow"] = function () {
    var steps = [["1", "Add drive", "Network view, G120 + CU250S-2 PN"], ["2", "Telegram", "PROFIdrive telegram 1 or 20, same in drive and PLC"], ["3", "Name + IP", "PROFINET device name, assign from TIA"], ["4", "Motor data", "Nameplate: V, A, kW, Hz, rpm, cos phi"], ["5", "Limits + ramps", "Min/max speed, ramp up / down"], ["6", "Identify", "Motor data ID, then speed-control optimisation"], ["7", "Control", "Test with the control panel, then from the PLC (STW1/ZSW1)"]];
    var b = "";
    steps.forEach(function (st, i) {
      var x = 10 + (i % 4) * 182, y = 14 + Math.floor(i / 4) * 110;
      b += R(x, y, 170, 92, i === 6 ? "g" : "b") + N(x + 20, y + 22, st[0]) + T(x + 40, y + 26, st[1], "bold", "start");
      var words = st[2].split(" "), lines = [""];
      words.forEach(function (w) { var l = lines[lines.length - 1]; if ((l + " " + w).length > 27 && l) lines.push(w); else lines[lines.length - 1] = l ? l + " " + w : w; });
      b += TL(x + 12, y + 52, lines, 14, "xs");
    });
    b += T(375, 246, "Save to the drive's ROM, then upload/save the TIA project. Do both.", "s", "middle");
    return S(750, 262, b, "Seven steps for commissioning a SINAMICS G120 drive with Startdrive: add, telegram, name and IP, motor data, limits and ramps, identification, control");
  };

  // ---------- PLCSIM Advanced architecture ----------
  F["plcsim-adv"] = function () {
    var b = "";
    b += R(20, 100, 150, 70, "a") + T(95, 128, "TIA Portal", "bold", "middle") + T(95, 146, "download, debug", "xs", "middle");
    b += R(250, 60, 230, 150, "g") + T(365, 84, "S7-PLCSIM Advanced", "bold", "middle") + T(365, 102, "virtual S7-1500 instances", "xs", "middle");
    b += R(270, 116, 90, 34, "b") + T(315, 138, "Instance A", "xs", "middle") + R(370, 116, 90, 34, "b") + T(415, 138, "Instance B", "xs", "middle");
    b += T(365, 180, "run modes, module-error simulation", "xs m", "middle") + T(365, 196, "runs on the PC, no hardware", "xs m", "middle");
    b += R(560, 20, 170, 54, "w") + T(645, 44, "Test script (API)", "bold", "middle") + T(645, 62, "writes inputs, checks outputs", "xs", "middle");
    b += R(560, 96, 170, 54, "w") + T(645, 120, "3D plant simulation", "bold", "middle") + T(645, 138, "drives the I/O like sensors", "xs", "middle");
    b += R(560, 172, 170, 54, "w") + T(645, 196, "HMI / SCADA runtime", "bold", "middle") + T(645, 214, "over virtual Ethernet adapter", "xs", "middle");
    b += L(170, 135, 250, 135, "ln", 1) + L(480, 100, 560, 50, "ln", 1) + L(480, 135, 560, 123, "ln", 1) + L(480, 170, 560, 199, "ln", 1);
    b += T(375, 250, "Plain PLCSIM does not have this API. It is meant for interactive testing.", "s", "middle");
    return S(750, 264, b, "TIA Portal downloads to PLCSIM Advanced virtual S7-1500 instances, which a test script, a 3D plant simulation and an HMI runtime can connect to");
  };

  // ---------- plant data / MQTT flow ----------
  F["mqtt-flow"] = function () {
    var b = "";
    b += R(10, 70, 140, 80, "a") + T(80, 100, "PLC", "bold", "middle") + T(80, 118, "LMQTT_Client or", "xs", "middle") + T(80, 132, "OPC UA server", "xs", "middle");
    b += R(210, 70, 140, 80, "b") + T(280, 100, "Edge gateway", "bold", "middle") + T(280, 118, "filter, buffer,", "xs", "middle") + T(280, 132, "add timestamp", "xs", "middle");
    b += R(410, 70, 140, 80, "g") + T(480, 100, "MQTT broker", "bold", "middle") + T(480, 118, "topics, TLS,", "xs", "middle") + T(480, 132, "users", "xs", "middle");
    b += R(610, 20, 130, 50, "w") + T(675, 50, "Dashboard", "bold", "middle") + R(610, 85, 130, 50, "w") + T(675, 115, "Historian / DB", "bold", "middle") + R(610, 150, 130, 50, "w") + T(675, 180, "Alarm / MES", "bold", "middle");
    b += L(150, 110, 210, 110, "ln", 1) + L(350, 110, 410, 110, "ln", 1) + L(550, 100, 610, 45, "ln", 1) + L(550, 110, 610, 110, "ln", 1) + L(550, 125, 610, 175, "ln", 1);
    b += T(180, 98, "OT", "xs m", "middle") + T(380, 98, "DMZ", "xs m", "middle");
    b += T(375, 232, "Publish plant1/line2/press1/temp  {\"v\": 71.4, \"u\": \"C\", \"ts\": \"2026-10-05T10:14:03Z\"}", "xs mono3", "middle");
    return S(750, 248, b, "Data flows from the PLC through an edge gateway to an MQTT broker and then to dashboards, a historian and alarm systems");
  };
})();
