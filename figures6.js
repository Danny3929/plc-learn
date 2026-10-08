/* Original, illustrative mock-ups of TIA Portal windows (module 10, 13). The layouts follow the structure described in the
   Siemens TIA Portal Information System; values shown are examples. Requires parts.js and figures.js. */
(function () {
  "use strict";
  var F = window.FIGS, Pt = window.PARTS, N = window.FIGH.N;
  var T = Pt.T, R = Pt.R, C = Pt.C;
  var BG = "#f4f6f7", HEAD = "#dfe4e8", LINE = "#aab4bb", SEL = "#cfe3f7", TITLE = "#34414b";

  function SS(w, h, body, alt) {
    return '<svg class="figsvg real" viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="' + alt + '"><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" class="ah"/></marker></defs>' + Pt.DEFS + body + "</svg>";
  }
  function win(w, h, title) {
    return R(0, 0, w, h, BG, 6, ' stroke="#8d99a2"') + R(0, 0, w, 26, TITLE, 6) + R(0, 14, w, 12, TITLE, 0) + T(12, 18, "tw s", title, "start");
  }
  function line(x1, y1, x2, y2, col, w, extra) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + col + '" stroke-width="' + (w || 1) + '"' + (extra || "") + "/>"; }
  function check(x, y, on) { return R(x, y, 14, 14, "#fff", 2, ' stroke="#6b7780"') + (on ? '<path d="M' + (x + 3) + "," + (y + 7) + " l3,3 l6,-7\" fill=\"none\" stroke=\"#1a7f37\" stroke-width=\"2\"/>" : ""); }
  function btn(x, y, w, label, kind) { return R(x, y, w, 24, kind === "ok" ? "#d7efd9" : "#eef1f3", 3, ' stroke="' + (kind === "ok" ? "#4c9a54" : "#8d99a2") + '"') + T(x + w / 2, y + 16, "tb xs", label, "middle"); }

  // ---------- CPU properties: Protection & Security ----------
  F["cpu-protection-mock"] = function () {
    var b = "", tree = [
      [0, "General", 0], [1, "Project information", 0], [1, "Catalog information", 0], [1, "PROFINET interface [X1]", 0], [1, "Startup", 0], [1, "Cycle", 0],
      [1, "Time of day", 0], [1, "Protection & Security", 0], [2, "Protection of the PLC configuration", 0], [2, "Access level", 0], [2, "Connection mechanisms", 1],
      [2, "Certificate manager", 0], [2, "Security event", 0], [1, "OPC UA", 0], [1, "System power supply", 0], [1, "Advanced configuration", 0]
    ];
    b += win(900, 470, "PLC_1 [CPU 1511-1 PN]");
    b += R(0, 26, 900, 24, HEAD, 0) + T(16, 43, "tb xs bold", "General", "start") + T(96, 43, "tgy xs", "IO tags", "start") + T(166, 43, "tgy xs", "System constants", "start") + T(280, 43, "tgy xs", "Texts", "start");
    b += line(0, 50, 900, 50, LINE, 1) + R(10, 24, 76, 4, "#e8730c", 0);
    // tree
    b += R(0, 50, 250, 380, "#fff", 0, ' stroke="' + LINE + '"');
    tree.forEach(function (n, i) {
      var y = 60 + i * 22, x = 10 + n[0] * 16;
      if (n[2]) b += R(2, y - 4, 246, 22, SEL, 0);
      b += T(x + (n[0] ? 12 : 0), y + 12, n[2] ? "tb xs bold" : "tb xs", (n[0] === 0 ? "▾ " : (n[1] === "Protection & Security" ? "▾ " : "")) + n[1], "start");
    });
    // main panel
    b += T(270, 76, "tb s bold", "Connection mechanisms", "start") + line(270, 84, 880, 84, LINE, 1);
    b += check(274, 98, false) + T(298, 110, "tb xs", "Permit access with PUT/GET communication from remote partner", "start");
    b += R(270, 124, 610, 56, "#fff4d6", 3, ' stroke="#d9b45b"') + T(282, 144, "tb xs bold", "Industrial security risk", "start") + T(282, 162, "tgy xs", "With this option enabled, other devices on the network can read and write the CPU memory", "start") + T(282, 175, "tgy xs", "without strong protection. Keep it off unless a partner device cannot use another method.", "start");
    b += T(270, 210, "tb s bold", "Connection mechanisms", "start") + line(270, 218, 880, 218, LINE, 1);
    b += T(282, 242, "tgy xs", "Secure PG/PC and HMI communication", "start") + T(282, 266, "tgy xs", "Only allow secure communication (TLS) for engineering and HMI connections", "start") + check(274, 276, true) + T(298, 288, "tb xs", "Permit only secure PG/PC and HMI communication", "start");
    b += T(270, 330, "tb s bold", "Access level", "start") + line(270, 338, 880, 338, LINE, 1);
    ["Full access (no protection)", "Read access", "HMI access", "No access (complete protection)"].forEach(function (t, i) {
      b += C(280, 356 + i * 22, 6, "#fff", ' stroke="#6b7780"') + (i === 2 ? C(280, 356 + i * 22, 3, "#2f6fe0") : "") + T(296, 360 + i * 22, "tb xs", t, "start");
    });
    b += btn(690, 440, 90, "OK", "ok") + btn(790, 440, 90, "Cancel");
    b += N(262, 74, "1") + N(262, 108, "2") + N(262, 346, "3");
    b += T(450, 460, "tgy tiny", "Illustrative mock-up. Menus and defaults differ by CPU, firmware and TIA Portal version.", "middle");
    return SS(900, 470, b, "Mock-up of the CPU properties dialog in TIA Portal showing Protection and Security with the PUT/GET option, secure communication and access levels");
  };

  // ---------- Safety Administration editor ----------
  F["safety-admin-mock"] = function () {
    var b = "", nav = ["General", "F-runtime group", "F-blocks", "F-compliant PLC data types", "Settings"];
    b += win(900, 440, "Safety Administration");
    b += R(0, 26, 200, 414, "#fff", 0, ' stroke="' + LINE + '"');
    nav.forEach(function (t, i) { var y = 40 + i * 28; if (i === 0) b += R(2, y - 4, 196, 26, SEL, 0); b += T(16, y + 14, i === 0 ? "tb xs bold" : "tb xs", t, "start"); });
    b += T(220, 54, "tb s bold", "General", "start") + line(220, 62, 880, 62, LINE, 1);
    b += T(230, 90, "tgy xs", "Safety mode status:", "start") + R(380, 76, 230, 22, "#dff3e2", 11, ' stroke="#4c9a54"') + C(394, 87, 5, "#2fa84f") + T(406, 91, "tb xs", "Safety mode is activated", "start");
    b += btn(640, 74, 160, "Disable safety mode");
    b += T(230, 130, "tgy xs", "Safety program status:", "start") + T(380, 130, "tb xs", "Compiled, consistent", "start");
    b += T(230, 160, "tgy xs", "Collective F-signature:", "start") + R(380, 146, 160, 22, "#fff", 2, ' stroke="' + LINE + '"') + T(390, 161, "tb xs mono3", "0x3A7C9E41", "start");
    b += T(230, 190, "tgy xs", "F-BaseID / F-CPU serial no.:", "start") + R(380, 176, 260, 22, "#fff", 2, ' stroke="' + LINE + '"') + T(390, 191, "tb xs", "Sorter line 2, CPU 1", "start");
    b += T(220, 236, "tb s bold", "Access protection", "start") + line(220, 244, 880, 244, LINE, 1);
    b += T(230, 270, "tgy xs", "Safety program password:", "start") + R(380, 256, 200, 22, "#fff", 2, ' stroke="' + LINE + '"') + T(390, 271, "tb xs", "●●●●●●●●", "start") + btn(600, 254, 140, "Change...");
    b += T(220, 316, "tb s bold", "F-runtime group (example)", "start") + line(220, 324, 880, 324, LINE, 1);
    b += R(230, 336, 640, 24, HEAD, 0) + T(240, 352, "tb xs bold", "Name", "start") + T(420, 352, "tb xs bold", "Cycle time (ms)", "start") + T(560, 352, "tb xs bold", "Maximum cycle time (ms)", "start") + T(760, 352, "tb xs bold", "OB", "start");
    b += R(230, 360, 640, 24, "#fff", 0, ' stroke="' + LINE + '"') + T(240, 376, "tb xs", "FR_Group_1", "start") + T(420, 376, "tb xs", "50", "start") + T(560, 376, "tb xs", "150", "start") + T(760, 376, "tb xs", "OB_Main_Safety", "start");
    b += N(214, 76, "1") + N(214, 160, "2") + N(214, 262, "3");
    b += T(450, 424, "tgy tiny", "Illustrative mock-up built from the manual's description of the editor. Values and exact controls differ by version.", "middle");
    return SS(900, 440, b, "Mock-up of the Safety Administration editor with safety mode status, collective F-signature, access protection and an F-runtime group");
  };

  // ---------- Trace editor ----------
  F["trace-mock"] = function () {
    var b = "", i;
    b += win(900, 470, "Trace_1  [Trace]");
    b += R(0, 26, 900, 24, HEAD, 0) + T(16, 43, "tb xs bold", "Configuration", "start") + T(120, 43, "tgy xs", "Measurements", "start") + R(10, 24, 100, 4, "#e8730c", 0);
    // left: signals + conditions
    b += R(0, 50, 330, 420, "#fff", 0, ' stroke="' + LINE + '"');
    b += T(12, 72, "tb s bold", "Signals", "start") + line(12, 80, 318, 80, LINE, 1);
    b += R(12, 88, 306, 20, HEAD, 0) + T(20, 102, "tb xs bold", "Signal", "start") + T(190, 102, "tb xs bold", "Type", "start") + T(260, 102, "tb xs bold", "Color", "start");
    [["Setpoint", "Real", "#2f6fe0"], ["Process_Value", "Real", "#1a9b4b"], ["Output_Pct", "Real", "#e8730c"]].forEach(function (s, k) {
      var y = 110 + k * 22;
      b += R(12, y, 306, 22, "#fff", 0, ' stroke="#d0d7dc"') + T(20, y + 15, "tb xs", s[0], "start") + T(190, y + 15, "tgy xs", s[1], "start") + R(262, y + 5, 30, 12, s[2], 2);
    });
    b += T(12, 200, "tb s bold", "Recording conditions", "start") + line(12, 208, 318, 208, LINE, 1);
    b += T(20, 232, "tgy xs", "Sampling:", "start") + T(120, 232, "tb xs", "every cycle (OB 30, 100 ms)", "start");
    b += T(20, 254, "tgy xs", "Record duration:", "start") + T(120, 254, "tb xs", "20 s", "start");
    b += T(20, 276, "tgy xs", "Start recording:", "start") + T(120, 276, "tb xs", "on trigger condition", "start");
    b += T(20, 298, "tgy xs", "Trigger:", "start") + T(120, 298, "tb xs", "Fault rises (positive edge)", "start");
    b += T(20, 320, "tgy xs", "Pre-trigger:", "start") + T(120, 320, "tb xs", "5 s before the event", "start");
    b += btn(12, 340, 140, "Transfer to CPU");
    // right: time diagram
    b += R(330, 50, 570, 420, "#fff", 0, ' stroke="' + LINE + '"') + T(346, 72, "tb s bold", "Time diagram", "start") + line(346, 80, 884, 80, LINE, 1);
    for (i = 0; i <= 5; i++) { b += line(380, 110 + i * 56, 876, 110 + i * 56, "#e3e8ec", 1) + T(372, 114 + i * 56, "tgy tiny", String(100 - i * 20), "end"); }
    for (i = 0; i <= 8; i++) { b += line(380 + i * 62, 110, 380 + i * 62, 390, "#eef1f3", 1) + T(380 + i * 62, 408, "tgy tiny", (i * 2.5).toFixed(1) + " s", "middle"); }
    b += '<path d="M380,264 H630 V208 H876" fill="none" stroke="#2f6fe0" stroke-width="2.2"/>';
    b += '<path d="M380,300 C470,300 520,296 560,280 C600,262 640,232 690,222 C740,214 760,214 790,206 C820,200 850,208 876,208" fill="none" stroke="#1a9b4b" stroke-width="2.2"/>';
    b += '<path d="M380,360 H556 C560,300 575,240 590,200 C610,170 650,170 700,200 C760,236 820,246 876,244" fill="none" stroke="#e8730c" stroke-width="2.2"/>';
    b += line(556, 100, 556, 392, "#c0392b", 1.4, ' stroke-dasharray="5 4"') + T(560, 100, "tb tiny", "trigger", "start");
    b += R(346, 424, 360, 30, "#f1f5f8", 3, ' stroke="' + LINE + '"') + T(358, 443, "tb xs", "Cursor: Δt = 0.8 s from the setpoint step to the first reaction", "start");
    b += N(342, 98, "1") + N(342, 214, "2") + N(556, 90, "3");
    b += T(450, 464, "tgy tiny", "Illustrative mock-up. The real trace editor offers more views and tools.", "middle");
    return SS(900, 470, b, "Mock-up of the Trace editor with a signal list, recording conditions with a trigger, and a time diagram of setpoint, process value and output");
  };
})();
