/* Figures for modules 5-8 (HMI, networks, advanced control, professional practice). */
(function () {
  "use strict";
  var F = window.FIGS, H = window.FIGH, S = H.S, T = H.T, R = H.R, L = H.L, P = H.P, C = H.C, N = H.N, TL = H.TL;

  F["alarm-lifecycle"] = function () {
    var b = "", bx = [[20, 60, "Normal", "b", "no alarm"], [200, 20, "Active", "w", "unacknowledged"], [440, 20, "Active", "a", "acknowledged"], [200, 130, "Gone", "w", "unacknowledged"], [440, 130, "Cleared", "g", "back to normal"]];
    bx.forEach(function (x) { b += R(x[0], x[1], 150, 62, x[3]) + T(x[0] + 75, x[1] + 28, x[2], "bold", "middle") + T(x[0] + 75, x[1] + 47, x[4], "xs", "middle"); });
    b += L(170, 75, 200, 55, "ln", 1) + T(150, 38, "fault starts", "xs", "end");
    b += L(350, 51, 440, 51, "ln", 1) + T(395, 42, "operator ACK", "xs", "middle");
    b += L(515, 82, 515, 130, "ln", 1) + T(588, 112, "fault ends", "xs", "middle");
    b += L(275, 82, 275, 130, "ln", 1) + T(215, 112, "fault ends", "xs", "end");
    b += L(350, 161, 440, 161, "ln", 1) + T(395, 152, "operator ACK", "xs", "middle");
    b += R(20, 220, 700, 36, "n") + T(370, 243, "Unacknowledged alarms stay flashing until a person confirms them, even if the fault has already gone.", "s", "middle");
    return S(740, 270, b, "Alarm life cycle: normal, active unacknowledged, active acknowledged, gone unacknowledged, cleared");
  };

  F["protocol-map"] = function () {
    var b = "", cols = [20, 150, 330, 540], rows = [
      ["PROFINET IO", "Real-time I/O and drives", "CPU ↔ ET 200SP, drives, field devices", "Cyclic, fast, deterministic"],
      ["S7 communication", "PLC ↔ PLC, HMI, TIA", "Siemens devices, secured in new CPUs", "Tags, DBs on demand"],
      ["Open User Comm. (TCP/UDP)", "Raw data between any devices", "Barcode readers, PCs, other PLCs", "You define the format"],
      ["Modbus TCP", "Simple register exchange", "3rd-party meters, VFDs, instruments", "Holding registers, coils"],
      ["OPC UA", "Modern IT / OT interface", "SCADA, MES, historians, cloud gateways", "Typed, named, secured data"]
    ];
    b += R(10, 10, 740, 30, "a", 3);
    ["Protocol", "Typical job", "Typical partners", "Data style"].forEach(function (h, i) { b += T(cols[i] + 6, 30, h, "s bold"); });
    rows.forEach(function (r, k) {
      var y = 44 + k * 50;
      b += R(10, y, 740, 46, k % 2 ? "n" : "b", 3);
      r.forEach(function (c, i) { b += T(cols[i] + 6, y + 28, c, i === 0 ? "s bold" : "xs"); });
    });
    return S(760, 300, b, "Comparison of PROFINET, S7 communication, open user communication, Modbus TCP and OPC UA");
  };

  // ---------- 7. Advanced control ----------
  F["pid-loop"] = function () {
    var b = "";
    b += T(20, 118, "SP", "bold") + L(46, 114, 108, 114, "ln", 1) + T(30, 98, "setpoint", "xs m");
    b += C(130, 114, 20, "b") + T(130, 119, "Σ", "s bold", "middle") + T(114, 100, "+", "xs bold", "middle") + T(114, 140, "−", "xs bold", "middle");
    b += L(150, 114, 220, 114, "ln", 1) + T(185, 104, "error", "xs", "middle");
    b += R(220, 70, 190, 90, "a") + T(315, 94, "PID controller", "bold", "middle") + TL(315, 118, ["P: reacts to the error now", "I: removes lasting error", "D: reacts to how fast it moves"], 15, "xs", "middle");
    b += L(410, 114, 490, 114, "ln", 1) + T(450, 104, "output", "xs", "middle");
    b += R(490, 70, 170, 90, "g") + T(575, 98, "Process", "bold", "middle") + T(575, 120, "valve, heater, motor", "xs", "middle") + T(575, 138, "+ tank, room, belt", "xs", "middle");
    b += L(575, 20, 575, 70, "ln dash", 1) + T(575, 14, "disturbance", "xs m", "middle");
    b += L(660, 114, 730, 114, "ln", 1) + T(710, 104, "PV", "bold", "middle");
    b += P("M695,114 L695,208 L130,208 L130,134", "ln", 1) + T(410, 226, "sensor feedback: the measured value (PV) is subtracted from the setpoint", "xs m", "middle");
    return S(760, 240, b, "PID control loop: setpoint minus measured value gives error, PID controller output drives the process, sensor feeds back the process value");
  };

  F["motion-profile"] = function () {
    var b = "", x0 = 90, y0 = 220;
    b += L(x0, y0, 700, y0, "ln", 1) + L(x0, y0, x0, 40, "ln", 1) + T(710, y0 + 4, "time", "xs") + T(x0, 30, "velocity", "xs", "middle");
    b += '<path d="M' + x0 + "," + y0 + " L220," + 70 + " L520," + 70 + " L650," + y0 + ' Z" class="fillacc"/>';
    b += P("M" + x0 + "," + y0 + " L220,70 L520,70 L650,220", "sig acc");
    b += L(220, 70, 220, y0, "ln dash thin") + L(520, 70, 520, y0, "ln dash thin") + L(x0, 70, 220, 70, "ln dash thin");
    b += T(155, y0 + 18, "accelerate", "xs", "middle") + T(370, y0 + 18, "constant velocity", "xs", "middle") + T(585, y0 + 18, "decelerate", "xs", "middle");
    b += T(370, 150, "area under the curve = distance moved", "s bold", "middle") + T(x0 - 8, 74, "v max", "xs", "end");
    b += T(370, 262, "Motion blocks let you set position, velocity, acceleration and jerk. The drive and axis follow the profile.", "xs m", "middle");
    return S(740, 280, b, "A trapezoidal velocity profile with acceleration, constant velocity and deceleration phases");
  };

  F["packml"] = function () {
    var b = "";
    function st(x, y, name, c) { return R(x, y, 108, 40, c) + T(x + 54, y + 25, name, "xs bold", "middle"); }
    var top = ["Idle", "Starting", "Execute", "Completing", "Complete"];
    top.forEach(function (n, i) { b += st(20 + i * 146, 40, n, n === "Execute" ? "g" : (n === "Idle" || n === "Complete" ? "b" : "a")); if (i < 4) b += L(128 + i * 146, 60, 166 + i * 146, 60, "ln", 1); });
    b += st(20, 116, "Resetting", "a") + L(74, 80, 74, 116, "ln", 0) + T(150, 104, "Reset", "xs m", "end");
    b += P("M674,80 L674,98 L74,98 L74,116", "ln dash", 1);
    b += st(312, 150, "Holding", "a") + st(458, 150, "Held", "b") + st(604, 150, "Unholding", "a") + L(366, 150, 366, 80, "ln dash", 1) + L(420, 170, 458, 170, "ln", 1) + L(566, 170, 604, 170, "ln", 1) + P("M658,150 L658,132 L420,132 L420,80", "ln dash", 1);
    b += st(20, 230, "Stopping", "w") + st(166, 230, "Stopped", "b") + st(312, 230, "Aborting", "w") + st(458, 230, "Aborted", "b") + st(604, 230, "Clearing", "w");
    b += L(128, 250, 166, 250, "ln", 1) + L(420, 250, 458, 250, "ln", 1) + L(566, 250, 604, 250, "ln", 1);
    b += T(386, 22, "Normal production sequence", "xs bold", "middle") + T(386, 218, "Stop and abort handling", "xs bold", "middle");
    b += T(20, 150, "Acting states do work.", "xs m") + T(20, 168, "Waiting states (grey) wait", "xs m") + T(20, 184, "for a command.", "xs m");
    b += T(386, 310, "Simplified PackML-style state model. Every machine mode maps onto a handful of known states.", "xs m", "middle");
    return S(780, 322, b, "Simplified PackML state model with idle, starting, execute, completing, complete, hold, stop and abort states");
  };

  F["library-types"] = function () {
    var b = "";
    b += R(20, 20, 280, 220, "a") + T(160, 46, "Project / global library", "bold", "middle") + L(34, 56, 286, 56, "ln thin");
    b += R(40, 70, 240, 50, "b") + T(160, 92, "Type: Motor_Ctrl", "s bold", "middle") + T(160, 110, "v1.0.0 (released)", "xs m", "middle");
    b += R(40, 130, 240, 50, "g") + T(160, 152, "Type: Motor_Ctrl", "s bold", "middle") + T(160, 170, "v1.1.0 (released)  bug fixed", "xs", "middle");
    b += R(40, 190, 240, 40, "n") + T(160, 214, "Master copy: Conveyor template", "xs m", "middle");
    b += R(450, 20, 280, 100, "b") + T(590, 44, "Project: Line 1", "bold", "middle") + T(590, 70, "Motor1_DB  →  v1.0.0", "xs", "middle") + T(590, 90, "Motor2_DB  →  v1.0.0", "xs", "middle");
    b += R(450, 140, 280, 100, "b") + T(590, 164, "Project: Line 2", "bold", "middle") + T(590, 190, "Motor1_DB  →  v1.1.0", "xs", "middle") + T(590, 210, "Motor2_DB  →  v1.1.0", "xs", "middle");
    b += L(300, 150, 450, 190, "ln", 1) + L(300, 100, 450, 70, "ln", 1) + T(375, 94, "instantiate", "xs m", "middle");
    b += T(590, 134, "▲  update to v1.1.0 in one step", "xs", "middle");
    b += T(370, 270, "A type has a version history. Fix the type once, release it, then update every instance.", "s m", "middle");
    return S(760, 284, b, "A library holding versions of a motor control type, instantiated in two projects that update to the new version");
  };

  // ---------- 8. Professional practice ----------
  F["diag-path"] = function () {
    var b = "", s = [["Sensor", "mechanical or electrical state", "meter, visual"], ["Wiring", "terminals, fuses, 24 V", "meter, continuity"], ["Input module", "channel LED, diagnostics", "LED, device view"], ["Input image", "tag value in the CPU", "watch table"], ["Program logic", "rungs and blocks", "monitor online"], ["Output", "image, module LED, load", "LED, force carefully"]];
    s.forEach(function (x, i) {
      var px = 12 + i * 122;
      b += R(px, 40, 112, 74, i === 4 ? "a" : "b") + T(px + 56, 66, x[0], "s bold", "middle") + TL(px + 56, 84, [x[1].slice(0, 22)], 12, "xs m", "middle");
      b += R(px, 126, 112, 36, "n") + T(px + 56, 148, x[2], "xs", "middle");
      if (i < 5) b += L(px + 112, 77, px + 122, 77, "ln", 1);
    });
    b += T(380, 24, "Follow the signal: split the problem in half, test in the middle, repeat", "bold m", "middle");
    b += T(380, 196, "A dead lamp can be a failed lamp, a failed output, a blocked rung or a missing input.", "s m", "middle") + T(380, 214, "Bisect along this chain until you find the first place where reality and expectation differ.", "s m", "middle");
    return S(760, 230, b, "Troubleshooting chain from sensor through wiring, input module, input image, program logic to output with check methods");
  };

  F["defense-depth"] = function () {
    var b = "", z = [[10, "Enterprise IT", "office, email, ERP", "b"], [200, "DMZ", "OPC UA gateway, historian", "w"], [390, "Control network", "PLCs, HMI, SCADA", "a"], [580, "Field level", "I/O, drives, sensors", "g"]];
    z.forEach(function (x, i) {
      b += R(x[0], 50, 170, 130, x[3]) + T(x[0] + 85, 80, x[1], "bold s", "middle") + T(x[0] + 85, 102, x[2], "xs", "middle");
      if (i < 3) b += R(x[0] + 170, 70, 20, 90, "fw", 2) + T(x[0] + 180, 118, "FW", "xs bold calt", "middle");
    });
    b += T(380, 28, "Defense in depth: several independent layers", "bold m", "middle");
    var l = [["Plant security", "doors, cabinets, visitors"], ["Network security", "segments, firewalls, no direct internet"], ["System integrity", "passwords, patches, minimal services, backups"]];
    l.forEach(function (x, i) { b += R(10 + i * 250, 206, 240, 54, "n") + T(130 + i * 250, 230, x[0], "s bold", "middle") + T(130 + i * 250, 248, x[1], "xs m", "middle"); });
    b += T(380, 290, "Aligned with the IEC 62443 family of industrial security standards.", "xs m", "middle");
    return S(760, 300, b, "Network zones from enterprise IT through a DMZ and control network to field level separated by firewalls, plus three layers of defence");
  };

  F["fab-lifecycle"] = function () {
    var b = "";
    function bx(x, y, t, c) { return R(x, y, 150, 40, c) + T(x + 75, y + 25, t, "xs bold", "middle"); }
    b += bx(20, 20, "Requirements (URS)", "a") + bx(120, 82, "Functional design", "a") + bx(220, 144, "Detailed design", "a") + bx(320, 206, "Build and program", "g");
    b += bx(420, 144, "Module / unit test", "b") + bx(520, 82, "FAT", "w") + bx(620, 20, "SAT / go-live", "w");
    b += L(95, 60, 145, 82, "ln", 1) + L(195, 122, 245, 144, "ln", 1) + L(295, 184, 345, 206, "ln", 1) + L(470, 206, 495, 184, "ln", 1) + L(570, 144, 595, 122, "ln", 1) + L(670, 82, 695, 60, "ln", 1);
    b += L(95, 20, 695, 20, "ln dash thin") + T(395, 14, "validated against", "xs m", "middle");
    b += L(195, 82, 595, 82, "ln dash thin") + L(295, 144, 495, 144, "ln dash thin");
    b += T(395, 276, "FAT = Factory Acceptance Test (at the builder).  SAT = Site Acceptance Test (at the customer).", "xs m", "middle");
    return S(790, 290, b, "V-model project lifecycle from requirements through design, build, unit test, factory acceptance and site acceptance");
  };
  F["ob-timeline"] = function () {
    var x0 = 130, b = "", rows = [60, 120, 180];
    b += T(380, 22, "Which block runs when", "bold m", "middle");
    b += T(10, 82, "OB100", "bold") + T(10, 142, "OB1 (main)", "bold") + T(10, 202, "OB30 (cyclic)", "bold");
    rows.forEach(function (y) { b += L(x0, y + 34, x0 + 600, y + 34, "ln thin"); });
    b += R(x0, 62, 36, 30, "w") + T(x0 + 18, 82, "once", "xs bold", "middle");
    var segs = [[40, 98], [114, 198], [214, 298], [314, 398], [414, 498], [514, 590]];
    segs.forEach(function (s) { b += R(x0 + s[0], 122, s[1] - s[0], 30, "a", 3); });
    b += T(x0 + 70, 142, "OB1", "xs", "middle") + T(x0 + 156, 142, "OB1 resumes", "xs", "middle");
    for (var k = 1; k <= 5; k++) { b += R(x0 + 100 * k - 2, 182, 16, 30, "g", 2) + L(x0 + 100 * k + 6, 152, x0 + 100 * k + 6, 182, "ln dash thin", 1) + T(x0 + 100 * k + 6, 232, k * 100 + " ms", "xs m", "middle"); }
    b += T(x0 + 300, 262, "Every 100 ms the cyclic OB interrupts OB1, runs for a moment, and OB1 carries on where it stopped.", "xs m", "middle");
    b += T(x0 + 18, 108, "at STOP \u2192 RUN", "xs m", "middle");
    return S(760, 280, b, "Timeline: OB100 runs once at startup, OB1 runs repeatedly, and OB30 interrupts OB1 every 100 milliseconds");
  };
})();
