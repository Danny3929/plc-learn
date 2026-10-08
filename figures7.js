/* Figures redrawn after the user's HMI course PDF (WinCC flexible interface, button animation, FB2 bottle simulation, HMI screen layouts).
   Original drawings in the style of the TIA Portal UI; nothing is copied from the PDF. Requires parts.js, figures.js, figures3.js. */
(function () {
  "use strict";
  var F = window.FIGS, Pt = window.PARTS, N = window.FIGH.N;
  var T = Pt.T, R = Pt.R, C = Pt.C, G = Pt.G;
  var L = { bg: "#eef1f3", pane: "#ffffff", line: "#c5ccd2", head: "#dfe4e8", sel: "#cfe7f7", teal: "#0a7f8c", dark: "#34414b" };

  function SS(w, h, body, alt) {
    return '<svg class="figsvg real" viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="' + alt + '"><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" class="ah"/></marker>' + Pt.DEFS + "</defs>" + body + "</svg>";
  }
  function ln(x1, y1, x2, y2, col, w, extra) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + col + '" stroke-width="' + (w || 1) + '"' + (extra || "") + "/>"; }
  function ui(x, y, w, h, fill) { return R(x, y, w, h, fill || L.pane, 0, ' stroke="' + L.line + '" stroke-width="1"'); }
  function bar(x, y, w, title) { return R(x, y, w, 18, "#c9ced2", 0) + T(x + 8, y + 13, "tb xs bold", title, "start"); }
  function icon(x, y, col) { return R(x, y, 10, 10, col, 2); }
  function titleBar(w, text) { return R(0, 0, w, 24, L.dark, 6) + T(10, 17, "tw s", text, "start") + T(w - 10, 17, "tw xs", "Totally Integrated Automation  PORTAL", "end"); }

  // KTP600-style Basic Panel with teal bezel and F-keys. inner = SVG for the screen area (240 x 180 in panel units, origin at the screen's top-left).
  function ktp(x, y, s, inner, grid) {
    var keys = "";
    for (var i = 0; i < 6; i++) keys += R(30 + i * 36, 228, 26, 16, "#6f8d90", 1) + T(43 + i * 36, 240, "tw tiny", "F" + (i + 1), "middle");
    return G(x, y, s, R(0, 0, 300, 260, "#6aa3a3", 6, ' stroke="#4d8484"') + R(0, 0, 300, 18, "#7bb2b2", 6) + T(10, 13, "tw tiny bold", "SIEMENS", "start") + T(290, 13, "tw tiny", "SIMATIC BASIC PANEL", "end") +
      R(30, 26, 216, 188, "#ffffff", 0, ' stroke="#3d6e6e"') + (grid ? '<g opacity=".35">' + gridDots(30, 26, 216, 188) + "</g>" : "") + '<g transform="translate(30,26)">' + (inner || "") + "</g>" + keys +
      '<text transform="translate(270,200) rotate(-90)" font-size="26" font-weight="700" fill="#9ccaca" letter-spacing="3">TOUCH</text>');
  }
  function gridDots(x, y, w, h) {
    var d = "";
    for (var i = x + 6; i < x + w; i += 8) for (var j = y + 6; j < y + h; j += 8) d += '<circle cx="' + i + '" cy="' + j + '" r=".7" fill="#7a8791"/>';
    return d;
  }
  function btn(x, y, w, h, fill, fg, text, border) { return R(x, y, w, h, fill, 2, ' stroke="' + (border || "#6b747b") + '" stroke-width="1.2"') + T(x + w / 2, y + h / 2 + 4, (fg || "tb") + " xs", text, "middle"); }

  // ---------- the WinCC engineering interface (annotated) ----------
  F["wincc-interface"] = function () {
    var b = "", W = 900, H = 560;
    b += R(0, 0, W, H, L.bg, 6, ' stroke="#9aa5ad"') + titleBar(W, "Siemens - ConveyorControl_KTP600");
    b += R(0, 24, W, 20, "#f7f8f9", 0) + T(10, 38, "tgy xs", "Project    Edit    View    Insert    Online    Options    Tools    Window    Help", "start");
    b += R(0, 44, W, 26, L.head, 0);
    [8, 32, 56, 92, 116, 152, 176, 214, 238, 276].forEach(function (x, i) { b += R(x, 50, 16, 14, i < 3 ? "#3a77c9" : i < 5 ? "#2e9e5a" : i < 7 ? "#0a7f8c" : "#e08a1e", 3); });
    // project tree + details view
    b += ui(0, 70, 214, 262) + bar(0, 70, 214, "Project tree") + R(8, 94, 60, 18, "#fff", 2, ' stroke="' + L.line + '"') + T(38, 107, "tb xs bold", "Devices", "middle");
    var tr = [[0, "▾ ConveyorControl_KTP600", "#3a77c9"], [1, "Add new device", "#2e9e5a"], [1, "Devices & networks", "#7a8791"], [1, "▾ HMI_1 [KTP600 PN]", "#0a7f8c"], [2, "Online & diagnostics", "#e08a1e"], [2, "Runtime settings", "#7a8791"], [2, "▾ Screens", "#e0b11e"], [3, "Add new screen", "#2e9e5a"], [3, "Root screen", "#3a77c9"], [3, "System screens", "#3a77c9"],
      [2, "▸ Screen management", "#e0b11e"], [2, "▸ HMI tags", "#e0b11e"], [2, "Connections (1)", "#7a8791"], [2, "HMI alarms", "#7a8791"], [2, "▸ Recipes (0)", "#e0b11e"], [2, "User administration", "#7a8791"], [1, "▸ Control conveyor [CPU 1214C]", "#0a7f8c"], [1, "▸ Common data", "#e0b11e"], [1, "▸ Online access", "#e08a1e"]];
    tr.forEach(function (t, k) {
      var yy = 126 + k * 11.4;
      if (t[1] === "▾ HMI_1 [KTP600 PN]") b += R(1, yy - 9, 212, 11, L.sel, 0);
      b += icon(8 + t[0] * 12, yy - 8, t[2]).replace('width="10" height="10"', 'width="8" height="8"') + T(20 + t[0] * 12, yy, "tb tiny", t[1], "start");
    });
    b += ui(0, 332, 214, 128) + bar(0, 332, 214, "Details view") + T(8, 364, "tgy xs", "Name", "start") + ["Screens", "HMI tags", "Connections (1)", "HMI alarms", "Recipes (0)"].map(function (t, i) { return icon(8, 372 + i * 15, "#e0b11e") + T(24, 381 + i * 15, "tb xs", t, "start"); }).join("");
    // work area
    b += ui(214, 70, 440, 262, "#f6f8f9") + R(214, 70, 440, 20, L.head, 0) + T(222, 84, "tb xs", "ConveyorControl_KTP600 › HMI_1 › Screens › Root screen", "start");
    b += R(214, 90, 440, 22, "#fff", 0, ' stroke="' + L.line + '"') + T(222, 105, "tb xs", "Tahoma      11      B  I  U   A   ■   Rotate  Align  Group", "start");
    b += ktp(290, 118, .66, R(6, 8, 62, 12, "#fff", 1, ' stroke="#8a949b"') + T(37, 17, "tb tiny", "System screens", "middle") + T(108, 86, "tb tiny", "Welcome to HMI_1 (KTP600 Basic color PN)!", "middle"), true);
    // toolbox
    b += ui(654, 70, 246, 262) + bar(654, 70, 246, "Toolbox");
    b += T(662, 108, "tb xs bold", "▾ Basic objects", "start");
    ["line", "ellipse", "circle", "rect", "A", "img"].forEach(function (t, i) { b += R(664 + i * 34, 114, 26, 20, i === 3 ? "#2f6fd6" : i < 3 ? "#e6f1fb" : "#e8ecef", 2, ' stroke="#6b8fb5"'); });
    b += T(662, 160, "tb xs bold", "▾ Elements", "start");
    ["0.0", "ab", "▤", "▤", "◔", "┃"].forEach(function (t, i) { b += R(664 + i * 34, 166, 26, 20, "#e8ecef", 2, ' stroke="#8c979f"') + T(677 + i * 34, 180, "tb tiny", t, "middle"); });
    b += T(662, 212, "tb xs bold", "▾ Controls", "start");
    ["⚠", "≈", "ℹ", "☰"].forEach(function (t, i) { b += R(664 + i * 34, 218, 26, 20, "#e8ecef", 2, ' stroke="#8c979f"') + T(677 + i * 34, 233, "tb xs", t, "middle"); });
    b += T(662, 266, "tb xs bold", "▾ Graphics", "start") + T(670, 284, "tb tiny", "▸ WinCC graphics folder", "start") + T(670, 298, "tb tiny", "▸ My graphics folder", "start");
    b += R(900 - 22, 70, 22, 262, "#dfe4e8", 0, ' stroke="' + L.line + '"');
    // properties window (bottom)
    b += ui(214, 332, 686, 128) + R(214, 332, 686, 20, L.head, 0) + T(224, 346, "tb xs", "Screen_object_1", "start") + R(380, 334, 72, 17, "#fff", 2, ' stroke="' + L.line + '"') + T(416, 346, "tb xs bold", "Properties", "middle") + T(466, 346, "tgy xs", "Info", "start") + T(506, 346, "tgy xs", "Diagnostics", "start");
    b += R(214, 352, 686, 16, "#f3f5f6", 0) + T(224, 364, "tb xs bold", "General", "start");
    b += R(214, 368, 118, 92, "#fafbfc", 0, ' stroke="' + L.line + '"') + ["▸ Properties", "▸ Animations", "▾ Events", "     Click", "     Press", "     Release", "     Enable", "     Disable"].map(function (t, i) { return T(222, 382 + i * 11, i === 5 ? "tb tiny bold" : "tb tiny", t, "start"); }).join("");
    b += R(332, 368, 568, 92, "#fff", 0, ' stroke="' + L.line + '"') + T(344, 384, "tb xs bold", "▾ ActivateScreen", "start") + T(360, 400, "tb xs", "Screen name", "start") + T(480, 400, "tb xs", "System screens", "start") + T(360, 414, "tb xs", "Object number", "start") + T(480, 414, "tb xs", "0", "start") + T(360, 430, "tgy xs", "<Add function>", "start");
    b += R(0, 460, W, 22, "#c9ced2", 0) + T(10, 475, "tb xs bold", "◂ Portal view        Overview        ■ Root screen", "start") + T(W - 10, 475, "tgy xs", "✔ Wizard: successfully configured KTP600", "end");
    b += N(104, 84, "1") + N(300, 33, "2") + N(445, 205, "3") + N(776, 86, "4") + N(850, 346, "5") + N(105, 346, "6");
    b += R(0, 482, W, 78, "none", 0) + T(10, 504, "tb xs", "1 Project tree: every device, screen and tag.  2 Menu bar and toolbar.  3 Work area: the screen you are editing, with its grid.", "start") +
      T(10, 522, "tb xs", "4 Toolbox: objects to drag onto the screen.  5 Properties window: appearance, animations and events of the selected object.  6 Details view.", "start");
    return SS(W, 540, b, "Mock-up of the WinCC engineering interface with numbered areas: project tree, menu bar, work area showing a Basic Panel screen, toolbox, properties window and details view");
  };

  // ---------- common tags between PLC and HMI ----------
  F["common-tags"] = function () {
    var b = "", W = 820, H = 300;
    b += R(0, 0, W, H, L.bg, 6, ' stroke="#9aa5ad"');
    b += ui(20, 40, 300, 150) + R(20, 40, 300, 22, L.dark, 0) + T(30, 56, "tw s bold", "PLC_1 › PLC tags", "start");
    [["Name", "Data type", "Address"], ["Start_PB", "Bool", "%I0.0"], ["Motor_Run", "Bool", "%Q0.0"], ["Tank_Temp", "Real", "%MD10"]].forEach(function (r, i) {
      var y = 76 + i * 26, hot = i === 3;
      b += (i === 0 ? R(20, y - 12, 300, 20, L.head, 0) : hot ? R(21, y - 12, 298, 24, "#ffe9b0", 0) : "") + T(30, y + 3, i ? "tb s" : "tgy xs bold", r[0], "start") + T(150, y + 3, i ? "tb s" : "tgy xs bold", r[1], "start") + T(250, y + 3, i ? "tb s mono3" : "tgy xs bold", r[2], "start");
    });
    b += ui(500, 40, 300, 150) + R(500, 40, 300, 22, L.dark, 0) + T(510, 56, "tw s bold", "HMI_1 › HMI tags", "start");
    [["Name", "Connection", "PLC tag"], ["Start_PB", "HMI_Connection_1", "Start_PB"], ["Motor_Run", "HMI_Connection_1", "Motor_Run"], ["Tank_Temp", "HMI_Connection_1", "Tank_Temp"]].forEach(function (r, i) {
      var y = 76 + i * 26, hot = i === 3;
      b += (i === 0 ? R(500, y - 12, 300, 20, L.head, 0) : hot ? R(501, y - 12, 298, 24, "#ffe9b0", 0) : "") + T(510, y + 3, i ? "tb s" : "tgy xs bold", r[0], "start") + T(590, y + 3, i ? "tb xs" : "tgy xs bold", r[1], "start") + T(710, y + 3, i ? "tb s" : "tgy xs bold", r[2], "start");
    });
    b += '<path d="M324,150 C380,150 440,150 496,150" fill="none" stroke="#e0701e" stroke-width="3" marker-end="url(#ah)"/>';
    b += R(340, 100, 140, 36, "#fff4dd", 6, ' stroke="#e0701e"') + T(410, 116, "tb xs bold", "Created once,", "middle") + T(410, 129, "tb xs bold", "available in both", "middle");
    b += T(170, 24, "tb s bold", "1  Create the tag in the PLC", "middle") + T(650, 24, "tb s bold", "2  It appears in the HMI list", "middle");
    b += Pt.hmiPanel(50, 206, .34, "") + Pt.cpu1200(180, 204, .28) + T(300, 238, "tb xs", "Same tag table across the whole project: HMI panel, PLC, PC runtime and even a phone app", "start");
    b += T(300, 256, "tgy xs", "Older platforms needed the tag typed into every device separately.", "start");
    return SS(W, H, b, "A tag Tank_Temp created in the PLC tag table appears automatically in the HMI tag table, linked by one connection", true);
  };

  // ---------- IP assignment flow ----------
  F["hmi-ip-flow"] = function () {
    var b = "", W = 820, H = 210, steps = [["1", "Read the MAC", "Online & diagnostics >", "Accessible devices, or read it on the back of the panel"], ["2", "Panel in Transfer mode", "Control Panel > Transfer", "the engineering PC can only reach the panel when transfer is on"], ["3", "Assign the IP address", "Online & diagnostics", "e.g. 192.168.0.5, with a subnet mask"], ["4", "Check on the panel", "Control Panel > PROFINET", "the address can also be checked or typed here"]];
    b += R(0, 0, W, H, L.bg, 6, ' stroke="#9aa5ad"');
    steps.forEach(function (s, i) {
      var x = 14 + i * 202;
      b += R(x, 20, 188, 150, "#fff", 6, ' stroke="' + L.line + '"') + R(x, 20, 188, 26, L.teal, 6) + R(x, 36, 188, 10, L.teal, 0) + T(x + 12, 38, "tw s bold", s[0] + "  " + s[1], "start") +
        T(x + 12, 72, "tb xs bold", s[2], "start") + wrap(s[3], x + 12, 94, 28);
      if (i < 3) b += '<path d="M' + (x + 190) + ",95 h10" + '" stroke="#e0701e" stroke-width="3" marker-end="url(#ah)" fill="none"/>';
    });
    b += T(W / 2, 194, "tgy xs", "A panel has its own address in the same subnet as the PLC (for example PLC 192.168.0.1, HMI 192.168.0.5).", "middle");
    return SS(W, H, b, "Four steps for assigning an IP address to an HMI panel: read the MAC address, switch the panel to Transfer mode, assign the address, check it on the panel", true);
  };
  function wrap(text, x, y, n) {
    var words = text.split(" "), line = "", out = "", k = 0;
    words.forEach(function (w) { if ((line + " " + w).trim().length > n) { out += T(x, y + k * 14, "tgy xs", line, "start"); k++; line = w; } else line = (line + " " + w).trim(); });
    return out + T(x, y + k * 14, "tgy xs", line, "start");
  }

  // ---------- button appearance animation ----------
  F["button-appearance"] = function () {
    var b = "", W = 860, H = 300;
    b += R(0, 0, W, H, L.bg, 6, ' stroke="#9aa5ad"');
    b += ui(10, 14, 130, 190) + ["General", "Appearance", "Design", "Layout", "Text format", "Miscellaneous", "Security", "▾ Animations", "   New animation", "   Appearance", "▸ Events"].map(function (t, i) { return (t === "   Appearance" ? R(11, 14 + 8 + i * 15, 128, 14, "#2f6fd6", 0) : "") + T(18, 31 + i * 15, t === "   Appearance" ? "tw tiny bold" : "tb tiny", t, "start"); }).join("");
    b += ui(140, 14, 520, 190, "#f7f8f9") + T(150, 30, "tb s bold", "Appearance", "start") + ln(150, 36, 650, 36, L.line);
    b += R(150, 44, 250, 60, "#eceff1", 2, ' stroke="' + L.line + '"') + T(158, 58, "tb xs bold", "Tag", "start") + T(170, 80, "tb xs", "Name:", "start") + R(210, 68, 180, 18, "#fff", 1, ' stroke="#8c979f"') + T(216, 81, "tb xs mono3", "conveyor_DB_automan", "start");
    b += R(410, 44, 240, 60, "#eceff1", 2, ' stroke="' + L.line + '"') + T(418, 58, "tb xs bold", "Type", "start") + C(430, 74, 5, "#fff") + C(430, 74, 2.5, "#1b73c9") + T(442, 78, "tb xs", "Range", "start") + C(430, 90, 5, "#fff") + T(442, 94, "tb xs", "Multiple bits", "start");
    b += R(150, 112, 500, 56, "#fff", 0, ' stroke="' + L.line + '"') + R(150, 112, 500, 16, L.head, 0);
    [["Range", 156], ["Foreground colour", 220], ["Background colour", 360], ["Flashing", 520]].forEach(function (h) { b += T(h[1], 124, "tgy tiny bold", h[0], "start"); });
    b += T(156, 148, "tb xs", "0", "start") + R(220, 138, 16, 14, "#fff", 1, ' stroke="#8c979f"') + T(244, 148, "tb tiny", "255, 255, 255", "start") + R(360, 138, 16, 14, "#2424e4", 1) + T(384, 148, "tb tiny", "36, 36, 228", "start") + T(520, 148, "tb xs", "No", "start") + T(156, 162, "tgy tiny", "<Add new>", "start");
    b += T(150, 190, "tgy xs", "Range 0 means automan = 0 (manual). The button looks different from its normal state, so the operator can see the mode.", "start");
    b += btn(690, 40, 130, 36, "#e8ecef", "tb", "Automatic", "#6b747b") + T(755, 92, "tgy xs", "automan = 1", "middle");
    b += btn(690, 120, 130, 36, "#2424e4", "tw", "Manual", "#101080") + T(755, 172, "tgy xs", "automan = 0 → white on blue", "middle");
    b += ui(10, 214, 840, 76, "#fff8ea") + T(24, 236, "tb xs bold", "How it works", "start") + T(24, 254, "tb xs", "1 Pick the PLC tag that decides the look (a Bool or Int).   2 Choose Range (or Single bit / Multiple bits).", "start") + T(24, 270, "tb xs", "3 For each value give a foreground, background and flashing.   The PLC decides, the screen only reflects.", "start");
    return SS(W, H, b, "The WinCC Appearance animation: a tag conveyor_DB_automan with range 0 mapped to white text on blue background, and the resulting Manual button", true);
  };

  // ---------- runtime simulator ----------
  F["rt-simulator"] = function () {
    var b = "", W = 480, H = 330;
    b += R(0, 0, W, H, L.bg, 6, ' stroke="#9aa5ad"') + R(0, 0, W, 24, "#c9ced2", 6) + T(10, 17, "tb s", "RT Simulator [100%]", "start") + R(W - 62, 4, 16, 16, "#e8ecef", 2) + R(W - 42, 4, 16, 16, "#e8ecef", 2) + R(W - 22, 4, 16, 16, "#d6483b", 2);
    b += ktp(70, 36, .98, btn(8, 8, 72, 18, "#f4f4f4", "tb", "Automatic") + btn(8, 30, 72, 18, "#2424e4", "tw", "Manual", "#101080"), false);
    b += N(40, 100, "1") + T(10, 320, "tgy xs", "Start the runtime with Online > Simulation > Start. The tags move with PLCSIM, so test before going near hardware.", "start");
    b += T(430, 70, "tb xs", "Press F-keys", "end") + T(430, 84, "tb xs", "with the mouse", "end");
    return SS(W, H, b, "The runtime simulator window showing a Basic Panel with Automatic and Manual buttons", true);
  };

  // ---------- TIA-style function block boxes ----------
  function box(x, y, w, h, title, sub, pinsL, pinsR, hdr) {
    var s = R(x, y, w, h, "#fff", 1, ' stroke="#8c979f"') + R(x, y, w, 20, hdr || "#e6e0f3", 1) + T(x + w / 2, y + 14, "tb xs bold", title, "middle");
    if (sub) s += T(x + w / 2, y + 34, "tgy tiny", sub, "middle");
    pinsL.forEach(function (p) { s += T(x + 6, y + p[1] + 4, "tb xs", p[0], "start") + ln(x - 24, y + p[1], x, y + p[1], "#4a5660", 1.3); });
    pinsR.forEach(function (p) { s += T(x + w - 6, y + p[1] + 4, "tb xs", p[0], "end") + ln(x + w, y + p[1], x + w + 24, y + p[1], "#4a5660", 1.3); });
    return s;
  }
  function lab(x, y, t, a) { return T(x, y, "tb xs mono3", t, a || "end"); }

  // ---------- FB2: simulation of the bottle (PDF control program) ----------
  F["fb2-simulation"] = function () {
    var b = "", W = 900, H = 520;
    b += R(0, 0, W, H, L.bg, 6, ' stroke="#9aa5ad"') + R(0, 0, W, 22, L.dark, 6) + T(10, 16, "tw s", "ConveyorControl › Control conveyor › Program blocks › Simulation [FB2]", "start");
    // interface table
    b += ui(10, 30, 880, 128) + R(10, 30, 880, 16, L.head, 0);
    [["Name", 24], ["Data type", 280], ["Default value", 440], ["Retain", 600]].forEach(function (h) { b += T(h[1], 42, "tgy xs bold", h[0], "start"); });
    [["▾ Input", "", "", "", 1], ["    start", "Bool", "false", "Non-Retain"], ["    pulse", "Bool", "false", "Non-Retain"], ["▾ Output", "", "", "", 1], ["    bottle_sensor", "Bool", "false", "Non-Retain"], ["▾ Static", "", "", "", 1], ["    IEC_Counter_0", "IEC_COUNTER", "", "Non-Retain"], ["▾ Temp", "", "", "", 1], ["    status_counter", "Int", "", ""]].forEach(function (r, i) {
      var y = 60 + i * 11.2;
      b += T(24, y, r[4] ? "tb tiny bold" : "tb tiny", r[0], "start") + T(280, y, "tb tiny", r[1], "start") + T(440, y, "tb tiny", r[2], "start") + T(600, y, "tb tiny", r[3], "start");
    });
    // network 1
    b += R(10, 166, 880, 18, "#dbe7ee", 0) + T(20, 179, "tb xs bold", "Network 1:", "start") + T(90, 179, "tgy xs", "counter 0 to 50", "start");
    b += lab(100, 214, "#start") + lab(100, 242, "#pulse") + box(124, 198, 52, 56, "&", "", [], [["", 14]], "#e8ecef") + ln(104, 214, 124, 214, "#4a5660", 1.3) + ln(104, 242, 124, 242, "#4a5660", 1.3);
    b += ln(176, 212, 270, 212, "#4a5660", 1.3) + T(304, 218, "tb xs mono3", "#IEC_Counter_0", "start");
    b += box(300, 224, 130, 126, "CTU", "Int", [["CU", 22], ["R", 66], ["PV", 106]], [["CV", 22], ["Q", 44]]);
    b += ln(270, 212, 270, 246, "#4a5660", 1.3) + ln(270, 246, 300, 246, "#4a5660", 1.3);
    b += box(160, 290, 78, 54, ">=", "Int", [["IN1", 20], ["IN2", 40]], [["", 20]], "#e8ecef");
    b += lab(130, 314, "#status_counter") + lab(130, 334, "50") + ln(238, 310, 276, 310, "#4a5660", 1.3) + ln(276, 310, 276, 290, "#4a5660", 1.3) + ln(276, 290, 300, 290, "#4a5660", 1.3);
    b += lab(274, 334, "50") + T(454, 246, "tb xs mono3", "#status_counter", "start") + ln(454, 246, 480, 246, "#4a5660", 1.3);
    // network 2
    b += R(10, 372, 880, 18, "#dbe7ee", 0) + T(20, 385, "tb xs bold", "Network 2:", "start") + T(90, 385, "tgy xs", "bottle sensor", "start");
    b += lab(100, 436, "#status_counter") + box(124, 420, 90, 56, "==", "Int", [["IN1", 16], ["IN2", 36]], [["", 16]], "#e8ecef") + lab(100, 456, "50") + ln(238, 436, 290, 436, "#4a5660", 1.3) + T(300, 440, "tb xs mono3", "#bottle_sensor", "start") + T(300, 458, "tgy tiny", "( = )   assignment", "start");
    b += N(330, 238, "1") + N(436, 220, "2") + N(199, 278, "3") + N(224, 478, "4");
    b += T(460, 304, "tb xs", "1 CTU as a multi-instance: the counter lives inside FB2", "start") + T(460, 322, "tb xs", "2 CU counts while start AND pulse are true", "start") + T(460, 340, "tb xs", "3 At 50 the counter is reset, so it starts again at 0", "start") + T(460, 358, "tb xs", "4 At count 50 a bottle has left the conveyor: one sensor pulse", "start");
    return SS(W, H, b, "Redrawn ladder-style function block diagram: FB2 interface table with start, pulse, bottle_sensor and an IEC counter, and two networks that count from 0 to 50 and pulse a bottle sensor", true);
  };

  // ---------- CTU block (counter lesson) ----------
  F["ctu-block"] = function () {
    var b = "", W = 640, H = 240;
    b += R(0, 0, W, H, "#fff", 4, ' stroke="' + L.line + '"') + R(0, 0, W, 18, "#dbe7ee", 0) + T(10, 13, "tb xs bold", "Network 1:   count the parts", "start");
    b += T(300, 42, "tb xs mono3", "\"Part_Counter\"", "middle") + ln(20, 60, 20, 210, "#46525b", 2);
    b += lab(88, 88, "\"Sensor\"") + ln(20, 96, 100, 96, "#2b3338", 1.8) + ln(100, 82, 100, 110, "#2b3338", 3) + ln(122, 82, 122, 110, "#2b3338", 3) + ln(122, 96, 220, 96, "#2b3338", 1.8) + T(110, 126, "tgy tiny mono3", "%I0.0", "middle");
    b += box(246, 56, 150, 150, "CTU", "Int", [["CU", 40], ["R", 90], ["PV", 130]], [["Q", 40], ["CV", 90]]);
    b += ln(222, 96, 246, 96, "#2b3338", 1.8) + lab(222, 146, "\"Reset_PB\"") + ln(222, 146, 246, 146, "#4a5660", 1.3) + lab(222, 186, "10") + ln(222, 186, 246, 186, "#4a5660", 1.3);
    b += T(430, 100, "tb xs mono3", "\"Batch_Full\"", "start") + T(430, 150, "tb xs mono3", "\"Part_Count\"", "start");
    b += '<path d="M396,96 h30" stroke="#2b3338" stroke-width="1.8"/><path d="M396,146 h30" stroke="#2b3338" stroke-width="1.8"/>';
    b += T(20, 232, "tgy xs", "CU counts rising edges. R sets CV to 0. Q is true while CV ≥ PV. A tag name sits above each pin, as in the TIA Portal editor.", "start");
    return SS(W, H, b, "A TIA Portal style CTU counter block with CU, R and PV inputs and Q and CV outputs", true);
  };

  // ---------- bottle packing screen (animation targets) ----------
  F["bottle-screen"] = function () {
    var b = "", W = 860, H = 360;
    b += R(0, 0, W, H, L.bg, 6, ' stroke="#9aa5ad"');
    // screen
    b += R(30, 20, 520, 270, "#fff", 2, ' stroke="#3d6e6e" stroke-width="2"') + R(30, 20, 520, 20, "#0b6b78", 2) + T(42, 34, "tw xs bold", "Bottle packing", "start");
    // conveyor
    b += R(50, 150, 300, 22, "#9aa5ad", 3, ' stroke="#6b747b"') + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(function (i) { return C(60 + i * 20, 161, 7, "#cfd5da"); }).join("");
    // bottle ghosts along path
    [70, 130, 190, 250].forEach(function (x, i) { b += bottle(x, 100, .25 + i * .18); });
    b += bottle(310, 100, 1);
    b += ln(70, 190, 320, 190, "#e0701e", 2.5, ' marker-end="url(#ah)"') + T(195, 206, "tb xs bold", "Horizontal movement: x = counter × 5", "middle");
    // case
    b += R(380, 110, 150, 120, "none", 2, ' stroke="#8b5a2b" stroke-width="3"') + [0, 1, 2, 3].map(function (k) { return C(415 + (k % 2) * 60, 150 + Math.floor(k / 2) * 50, 20, k < 3 ? "#2e8a3a" : "#e8ecef"); }).join("");
    b += T(455, 246, "tb xs bold", "Case (Visibility)", "middle");
    // buttons
    b += btn(60, 240, 86, 34, "#e8ecef", "tb", "Automatic") + btn(156, 240, 86, 34, "#2424e4", "tw", "Manual", "#101080") + btn(252, 240, 62, 34, "#2fbf62", "tw", "Start", "#0e5d28") + btn(322, 240, 62, 34, "#d93a2b", "tw", "Stop", "#7a1209");
    b += N(330, 100, "1") + N(70, 208, "2") + N(392, 130, "3") + N(104, 238, "4");
    b += ui(570, 20, 270, 270, "#fff") + T(582, 42, "tb s bold", "Animations used", "start");
    ["1 Horizontal movement of the bottle:", "   tag status_counter, 0–50 → x position", "2 Appearance of Auto/Manual button:", "   automan = 0 → blue", "3 Visibility of each bottle circle:", "   hidden once the case count is below its value", "4 Start / Stop write command bits", "   (PLC owns the logic)", "Everything stays inside the 320 × 240 px", "work area of this panel."].forEach(function (t, i) { b += T(582, 66 + i * 18, i % 2 ? "tgy xs" : "tb xs", t, "start"); });
    b += T(30, 330, "tgy xs", "Case rectangle and bottle lines are grouped so one Visibility animation hides the whole case when the reset counter is 1.", "start");
    return SS(W, H, b, "Bottle packing screen layout: bottle moving along a conveyor with a horizontal movement animation, a case with four bottle circles with visibility animations, and automatic, manual, start and stop buttons", true);
  };
  function bottle(x, y, op) {
    return '<g opacity="' + op + '"><rect x="' + (x + 6) + '" y="' + y + '" width="8" height="12" fill="#6b4a1e"/><rect x="' + x + '" y="' + (y + 12) + '" width="20" height="38" rx="5" fill="#a0642a" stroke="#6b4a1e"/></g>';
  }

  // ---------- ISA-style HMI screen layout (from the PDF's example screens) ----------
  F["hmi-layout"] = function () {
    var b = "", W = 860, H = 460;
    b += R(0, 0, W, H, "#d9e1e4", 6, ' stroke="#9aa5ad"');
    // feed composition panel
    b += R(14, 14, 250, 180, "#e9edef", 2, ' stroke="#8a949b"') + T(22, 30, "tb xs bold", "Feed composition", "start");
    [0, 1, 2].forEach(function (i) {
      var x = 50 + i * 70, fill = [60, 42, 28][i];
      b += T(x + 10, 46, "tgy tiny", ["%A", "%B", "%C"][i], "middle") + R(x, 54, 20, 100, "#fff", 1, ' stroke="#6b747b"') + R(x + 2, 154 - fill, 16, fill, "#62c3e8", 0) + ln(x - 4, 154 - fill, x + 24, 154 - fill, "#222", 1.5) +
        '<polygon points="' + (x - 10) + "," + (154 - fill - 5) + " " + (x - 10) + "," + (154 - fill + 5) + " " + (x - 2) + "," + (154 - fill) + '" fill="#222"/>' + T(x + 10, 172, "tb tiny mono3", "###", "middle");
      if (i !== 1) b += '<polygon points="' + (x + 30) + ",40 " + (x + 38) + ",54 " + (x + 22) + ',54" fill="#f2c200" stroke="#7a6200"/>' + T(x + 30, 52, "tb tiny bold", "!", "middle");
    });
    // coolant
    b += R(274, 14, 84, 180, "#e9edef", 2, ' stroke="#8a949b"') + T(282, 30, "tb xs bold", "Coolant", "start") + R(300, 54, 20, 100, "#fff", 1, ' stroke="#6b747b"') + R(302, 90, 16, 62, "#2a8ac8", 0) + T(316, 172, "tb tiny mono3", "###", "middle");
    // trend
    b += R(14, 204, 344, 160, "#e9edef", 2, ' stroke="#8a949b"') + T(22, 220, "tb xs bold", "Reactor M5", "start") + R(60, 228, 290, 110, "#fff", 0, ' stroke="#6b747b"') + [0, 1, 2, 3, 4].map(function (i) { return ln(60, 228 + i * 27.5, 350, 228 + i * 27.5, "#d9dfe3", 1) + T(54, 232 + i * 27.5, "tgy tiny", String(100 - i * 25), "end"); }).join("");
    b += '<path d="M60,300 L110,292 L160,280 L210,270 L260,258 L310,252 L350,246" fill="none" stroke="#2e9e5a" stroke-width="2"/>' + T(60, 352, "tgy tiny", "16:52:25", "start") + T(350, 352, "tgy tiny", "16:53:23", "end");
    // process centre
    b += R(370, 14, 330, 350, "#e9edef", 2, ' stroke="#8a949b"') + R(376, 20, 120, 18, "#fff", 1, ' stroke="#8a949b"') + T(436, 33, "tb tiny", "Product: Thionite", "middle") + R(496, 20, 110, 18, "#fff", 1, ' stroke="#8a949b"') + T(551, 33, "tb tiny", "State: Mid-Run", "middle") + R(606, 20, 88, 18, "#fff", 1, ' stroke="#8a949b"') + T(650, 33, "tb tiny", "RTAM: ON-OK", "middle");
    b += R(376, 44, 220, 14, "#fff", 0, ' stroke="#8a949b"') + R(378, 46, 150, 10, "#2e9e5a", 0) + T(383, 70, "tgy tiny", "Run plan", "start");
    ["I-5A Fwd", "I-5B ADTV-1", "I-5C ADTV-2", "I-5D Temp", "I-5E Pwr", "I-5F Level"].forEach(function (t, i) {
      var x = 396 + (i % 3) * 70, y = 90 + Math.floor(i / 3) * 50;
      b += '<polygon points="' + x + "," + (y + 20) + " " + (x + 20) + "," + y + " " + (x + 40) + "," + (y + 20) + " " + (x + 20) + "," + (y + 40) + '" fill="#6b747b" stroke="#2f363b"/>' + T(x + 20, y + 24, "tw xs bold", "I", "middle") + T(x + 20, y + 52, "tb tiny", t, "middle");
    });
    ["Shut Down M5", "Freeze M5", "ISOLATE M5"].forEach(function (t, i) { b += btn(630, 66 + i * 36, 62, 30, "#f4f4f4", "tb", t.split(" ")[0]); });
    b += T(380, 214, "tb xs bold", "Interlock actions:", "start") + T(380, 228, "tb tiny", "Stop Feed OFF      Max Cool OFF", "start") + T(380, 240, "tb tiny", "Stop ADTV-1 OFF   Max Vent OFF", "start");
    // pump + pipes
    b += ln(380, 320, 420, 320, "#444", 3) + ln(420, 262, 420, 320, "#444", 3) + ln(420, 262, 380, 262, "#444", 3) + C(520, 310, 16, "#fff") + '<polygon points="510,302 530,310 510,318" fill="#2e9e5a"/>' + ln(380, 330, 504, 330, "#444", 3) + ln(536, 330, 600, 330, "#444", 3) + T(460, 350, "tb tiny", "Open", "middle") + T(520, 292, "tb tiny", "Pump M5", "middle");
    // faceplate + nav
    b += R(710, 14, 136, 200, "#cfd6da", 2, ' stroke="#8a949b"') + T(778, 32, "tb xs bold", "Reserved", "middle") + T(778, 46, "tb xs bold", "Faceplate Zone", "middle") + wrap2(["When any item on", "the screen is", "selected, its", "faceplate appears", "in this reserved", "area."], 718, 64);
    ["Main Menu", "L2 M5 Startup", "L2 M5 Scram", "L2 M5 Feed", "— Level 3 —", "Dryer Pumps", "M5 Interlocks", "M5 Cooling Sys", "M5 Vent Sys"].forEach(function (t, i) {
      if (t.indexOf("—") === 0) b += T(778, 244 + i * 22, "tgy tiny", t, "middle"); else b += btn(716, 228 + i * 22, 124, 18, "#f4f4f4", "tb", t);
    });
    b += N(246, 22, "1") + N(344, 212, "2") + N(612, 54, "3") + N(720, 24, "4") + N(722, 224, "5");
    b += T(14, 392, "tb xs", "1 Bars with limit markers and a yellow warning triangle when a value leaves its band.   2 A trend for the slow story.", "start") + T(14, 410, "tb xs", "3 Overview of states, interlocks and run status.   4 A reserved faceplate zone where the selected item's controls appear.", "start") + T(14, 428, "tb xs", "5 Navigation in the same place on every screen, level by level (menu, level 2, level 3).", "start") + T(14, 448, "tgy xs", "Layout idea taken from an HMI specification: all control actions go through the standard faceplate, never through ad-hoc buttons.", "start");
    return SS(W, H, b, "Layout of a process HMI screen: bar graphs with limit markers and warning triangles, a trend, interlock status, a reserved faceplate zone and a navigation column", true);
  };
  function wrap2(lines, x, y) { return lines.map(function (t, i) { return T(x, y + i * 13, "tgy tiny", t, "start"); }).join(""); }

  // ---------- upgrade hmi-arch: shows IP addresses, F-key panel, tag exchange ----------
  F["hmi-arch"] = function () {
    var b = "", W = 760, H = 400;
    b += R(0, 0, W, H, L.bg, 6, ' stroke="#9aa5ad"');
    b += Pt.laptop(280, 14, .8) + T(360, 150, "tb s bold", "Engineering PC", "middle") + T(360, 166, "tgy xs", "TIA Portal: one project with PLC + HMI", "middle");
    b += ktp(30, 190, .5, btn(8, 8, 70, 16, "#f4f4f4", "tb", "Automatic") + btn(8, 28, 70, 16, "#2424e4", "tw", "Manual", "#101080"), false) + T(105, 340, "tb s bold", "HMI panel  KTP600", "middle") + T(105, 356, "tb xs mono3", "192.168.0.5", "middle");
    b += Pt.sw(330, 232, .6) + T(380, 274, "tgy xs", "Industrial switch", "middle");
    b += Pt.cpu1200(560, 200, .75) + T(640, 366, "tb s bold", "PLC  S7-1214C", "middle") + T(640, 382, "tb xs mono3", "192.168.0.1", "middle");
    b += Pt.cableP("M178,245 H330") + Pt.cableP("M440,245 H560") + '<path d="M360,174 V230" stroke="#e0701e" stroke-width="2" stroke-dasharray="6 4" fill="none" marker-end="url(#ah)"/>' + T(368, 204, "tgy xs", "download", "start");
    b += R(210, 296, 280, 60, "#fff", 6, ' stroke="' + L.line + '"') + T(350, 316, "tb xs bold", "Tags are shared", "middle") + T(350, 332, "tb xs mono3", "Start_PB  Motor_Run  Tank_Temp", "middle") + T(350, 346, "tgy xs", "HMI reads and requests, PLC decides", "middle");
    return SS(W, H, b, "Engineering PC downloading to a KTP600 HMI panel at 192.168.0.5 and an S7-1214C PLC at 192.168.0.1 through an industrial switch, with shared tags", true);
  };
})();
