/* Animated "plants": simple machine models driven by the ladder program in a simulator.
   step(tags, dt_seconds, state) reads outputs and writes sensor tags; draw(tags, state) returns SVG. */
window.PLANTS = (function () {
  "use strict";
  function lamp(x, y, r, col, on) {
    return (on ? '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 2) + '" fill="' + col + '" opacity=".35"/>' : "") +
      '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + (on ? col : "#2a2f33") + '" stroke="#0b0d0f" stroke-width="2"/>' +
      (on ? '<ellipse cx="' + (x - r * .3) + '" cy="' + (y - r * .35) + '" rx="' + (r * .4) + '" ry="' + (r * .22) + '" fill="#fff" opacity=".55"/>' : "");
  }
  var SV = function (w, h, body) { return '<svg viewBox="0 0 ' + w + " " + h + '" class="scenesvg" role="img" aria-label="Animated machine driven by the ladder program">' + body + "</svg>"; };
  var DEFS = '<defs><linearGradient id="pBelt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b646c"/><stop offset="1" stop-color="#2a2f34"/></linearGradient><linearGradient id="pBox" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb347"/><stop offset="1" stop-color="#d9731a"/></linearGradient>' +
    '<linearGradient id="pWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fb4f2"/><stop offset="1" stop-color="#1f6cc0"/></linearGradient><linearGradient id="pSteel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d7dde2"/><stop offset="1" stop-color="#7c868e"/></linearGradient></defs>';

  var conveyor = {
    init: function () { return { parts: [], next: 0.3, belt: 0, box: 0, rp: false, ang: 0 }; },
    step: function (t, dt, s) {
      var run = !!t.Motor;
      if (t.Reset_PB && !s.rp) { s.box = 0; } s.rp = !!t.Reset_PB;
      if (run) {
        s.belt = (s.belt + 90 * dt) % 24; s.ang += 360 * dt;
        s.next -= dt; if (s.next <= 0) { s.parts.push({ x: 24 }); s.next = 1.4; }
        s.parts.forEach(function (p) { p.x += 90 * dt; });
        s.parts = s.parts.filter(function (p) { if (p.x > 400) { s.box = Math.min(s.box + 1, 12); return false; } return true; });
      }
      t.Part_Sensor = s.parts.some(function (p) { return Math.abs(p.x - 300) < 14; });
    },
    draw: function (t, s) {
      var b = DEFS + '<rect x="0" y="0" width="600" height="190" fill="#14181c"/>';
      b += '<rect x="30" y="150" width="8" height="36" fill="#3a4148"/><rect x="392" y="150" width="8" height="36" fill="#3a4148"/>';
      b += '<rect x="14" y="124" width="402" height="24" rx="12" fill="url(#pBelt)" stroke="#111"/>';
      for (var i = 0; i < 17; i++) { var x = 26 + i * 24 - s.belt; if (x > 18 && x < 410) b += '<line x1="' + x + '" y1="126" x2="' + x + '" y2="146" stroke="#20252a" stroke-width="3"/>'; }
      b += '<circle cx="26" cy="136" r="12" fill="url(#pSteel)" stroke="#111"/><circle cx="404" cy="136" r="12" fill="url(#pSteel)" stroke="#111"/>';
      s.parts.forEach(function (p) { b += '<rect x="' + (p.x - 13) + '" y="100" width="26" height="24" rx="3" fill="url(#pBox)" stroke="#8a4a10"/><rect x="' + (p.x - 13) + '" y="100" width="26" height="6" rx="3" fill="#fff" opacity=".25"/>'; });
      // sensor
      b += '<rect x="297" y="30" width="6" height="40" fill="#3a4148"/><rect x="284" y="66" width="32" height="22" rx="4" fill="url(#pSteel)" stroke="#444"/>' + lamp(300, 77, 5, "#ff4d3d", t.Part_Sensor);
      if (t.Part_Sensor) b += '<line x1="300" y1="88" x2="300" y2="122" stroke="#ff4d3d" stroke-width="2" stroke-dasharray="4 3"/>';
      b += '<text x="300" y="22" text-anchor="middle" fill="#9fb0bd" font-size="12" font-family="Segoe UI,sans-serif">Part sensor</text>';
      // motor
      b += '<circle cx="26" cy="172" r="14" fill="#1a8f9c" stroke="#0a4a52"/><g transform="rotate(' + s.ang + ' 26 172)"><line x1="26" y1="162" x2="26" y2="182" stroke="#e9edf0" stroke-width="3"/><line x1="16" y1="172" x2="36" y2="172" stroke="#e9edf0" stroke-width="3"/></g>';
      b += '<text x="48" y="176" fill="#9fb0bd" font-size="12" font-family="Segoe UI,sans-serif">Conveyor motor ' + (t.Motor ? "RUNNING" : "stopped") + "</text>";
      // box
      b += '<path d="M440,96 L444,180 L556,180 L560,96" fill="none" stroke="#c99a5a" stroke-width="4"/><rect x="446" y="150" width="108" height="28" fill="#c99a5a" opacity=".25"/>';
      for (var k = 0; k < s.box; k++) { var cx = 456 + (k % 4) * 26, cy = 156 - Math.floor(k / 4) * 22; b += '<rect x="' + cx + '" y="' + cy + '" width="22" height="18" rx="2" fill="url(#pBox)" stroke="#8a4a10"/>'; }
      b += '<text x="500" y="88" text-anchor="middle" fill="#9fb0bd" font-size="12" font-family="Segoe UI,sans-serif">Box: ' + s.box + " parts</text>";
      if (t["C_Parts.Q"]) b += '<text x="500" y="60" text-anchor="middle" fill="#3df08c" font-size="14" font-weight="700" font-family="Segoe UI,sans-serif">BOX FULL</text>';
      return SV(600, 190, b);
    }
  };

  var tank = {
    init: function () { return { level: 50, ph: 0 }; },
    step: function (t, dt, s) {
      var pump = !!t.Pump; s.level = Math.max(0, Math.min(100, s.level + ((pump ? 9 : 0) - 3) * dt)); if (pump) s.ph = (s.ph + 40 * dt) % 20;
      t.Low_Sensor = s.level < 20; t.High_Sensor = s.level > 80;
    },
    draw: function (t, s) {
      var b = DEFS + '<rect width="600" height="210" fill="#14181c"/>', top = 30, hgt = 150, wl = hgt * s.level / 100;
      b += '<path d="M30,170 H190 V186 H30 Z" fill="url(#pSteel)" opacity="0"/>';
      // pump and pipe
      b += '<rect x="60" y="164" width="150" height="12" fill="url(#pSteel)"/><rect x="204" y="164" width="30" height="12" fill="url(#pSteel)"/><circle cx="110" cy="170" r="24" fill="' + (t.Pump ? "#27b45c" : "#3a4148") + '" stroke="#111" stroke-width="2"/>';
      if (t.Pump) b += '<polygon points="102,158 102,182 126,170" fill="#fff" opacity=".9"/><line x1="140" y1="170" x2="226" y2="170" stroke="#5fb4f2" stroke-width="4" stroke-dasharray="8 12" stroke-dashoffset="' + (-s.ph) + '"/>'; else b += '<polygon points="102,158 102,182 126,170" fill="#888" opacity=".7"/>';
      b += '<text x="110" y="208" text-anchor="middle" fill="#9fb0bd" font-size="12" font-family="Segoe UI,sans-serif">Pump ' + (t.Pump ? "ON" : "off") + "</text>";
      // tank
      b += '<rect x="240" y="' + top + '" width="130" height="' + hgt + '" fill="#1d252b" stroke="#8a949b" stroke-width="3"/><rect x="243" y="' + (top + hgt - wl) + '" width="124" height="' + wl + '" fill="url(#pWater)" opacity=".92"/><rect x="243" y="' + (top + hgt - wl) + '" width="124" height="4" fill="#bfe3ff" opacity=".6"/>';
      b += '<text x="305" y="' + (top + hgt - wl / 2 + 5) + '" text-anchor="middle" fill="#fff" font-size="16" font-weight="700" font-family="Segoe UI,sans-serif">' + Math.round(s.level) + " %</text>";
      // floats
      var yl = top + hgt - hgt * .2, yh = top + hgt - hgt * .8;
      b += '<line x1="370" y1="' + yl + '" x2="410" y2="' + yl + '" stroke="#8a949b" stroke-dasharray="3 3"/>' + lamp(424, yl, 8, "#4db3e0", t.Low_Sensor) + '<text x="446" y="' + (yl + 4) + '" fill="#9fb0bd" font-size="12" font-family="Segoe UI,sans-serif">Low float (below 20 %)</text>';
      b += '<line x1="370" y1="' + yh + '" x2="410" y2="' + yh + '" stroke="#8a949b" stroke-dasharray="3 3"/>' + lamp(424, yh, 8, "#4db3e0", t.High_Sensor) + '<text x="446" y="' + (yh + 4) + '" fill="#9fb0bd" font-size="12" font-family="Segoe UI,sans-serif">High float (above 80 %)</text>';
      // drain
      b += '<rect x="370" y="172" width="150" height="10" fill="url(#pSteel)"/><text x="520" y="196" text-anchor="end" fill="#9fb0bd" font-size="12" font-family="Segoe UI,sans-serif">constant drain (the process uses water)</text>';
      return SV(600, 210, b);
    }
  };

  var traffic = {
    init: function () { return { x: -40 }; },
    step: function (t, dt, s) { var f = s.x + 64, hold = !t.Green && f >= 288 && f < 300; if (!hold) s.x += 80 * dt; if (s.x > 640) s.x = -60; },
    draw: function (t, s) {
      var b = DEFS + '<rect width="600" height="190" fill="#14181c"/><rect x="0" y="140" width="600" height="40" fill="#2b3036"/><line x1="0" y1="160" x2="600" y2="160" stroke="#d9d9d9" stroke-width="3" stroke-dasharray="22 16"/><rect x="300" y="140" width="6" height="40" fill="#e9edf0" opacity=".8"/>';
      b += '<rect x="436" y="40" width="8" height="100" fill="#3a4148"/><rect x="420" y="10" width="40" height="104" rx="8" fill="#0e1114" stroke="#444" stroke-width="2"/>' + lamp(440, 30, 11, "#ff4d3d", t.Red) + lamp(440, 62, 11, "#ffbf1f", t.Amber) + lamp(440, 94, 11, "#3ddc84", t.Green);
      b += '<g transform="translate(' + s.x + ',112)"><rect x="0" y="12" width="64" height="18" rx="6" fill="#4db3e0"/><rect x="12" y="0" width="38" height="18" rx="6" fill="#7cc8f0"/><circle cx="14" cy="32" r="8" fill="#111"/><circle cx="50" cy="32" r="8" fill="#111"/></g>';
      b += '<text x="300" y="130" text-anchor="middle" fill="#9fb0bd" font-size="12" font-family="Segoe UI,sans-serif">stop line</text>';
      return SV(600, 190, b);
    }
  };
  var cylinder = {
    init: function () { return { pos: 0 }; },
    step: function (t, dt, s) {
      s.pos = Math.max(0, Math.min(1, s.pos + (t.Y1 ? 1 : -1) * 0.7 * dt));
      t.B1 = s.pos <= 0.02; t.B2 = s.pos >= 0.98;
    },
    draw: function (t, s) {
      var b = DEFS + '<rect width="600" height="190" fill="#14181c"/>', x0 = 120, len = 230;
      b += '<rect x="' + x0 + '" y="70" width="' + len + '" height="50" rx="5" fill="url(#pSteel)" stroke="#111" stroke-width="2"/>';
      b += '<rect x="' + (x0 + 6 + s.pos * (len - 24)) + '" y="74" width="12" height="42" fill="#7d8790" stroke="#111"/>';
      b += '<rect x="' + (x0 + len) + '" y="88" width="' + (10 + s.pos * 0) + '" height="14" fill="none"/>';
      // rod to the right, carrying a stamp head
      var tip = x0 + len + 8 + s.pos * 130;
      b += '<rect x="' + (x0 + len) + '" y="88" width="' + (tip - x0 - len) + '" height="14" fill="url(#pSteel)" stroke="#111"/>';
      b += '<rect x="' + tip + '" y="72" width="16" height="46" rx="3" fill="#c99a5a" stroke="#6b4a1c"/>';
      // sensors
      b += '<rect x="' + (x0 + 8) + '" y="124" width="26" height="14" rx="3" fill="#3a4148" stroke="#111"/>' + lamp(x0 + 21, 154, 7, "#4db3e0", t.B1) + '<text x="' + (x0 + 21) + '" y="180" text-anchor="middle" fill="#9fb0bd" font-size="12" font-family="Segoe UI,sans-serif">B1 back</text>';
      b += '<rect x="' + (x0 + len - 34) + '" y="124" width="26" height="14" rx="3" fill="#3a4148" stroke="#111"/>' + lamp(x0 + len - 21, 154, 7, "#4db3e0", t.B2) + '<text x="' + (x0 + len - 21) + '" y="180" text-anchor="middle" fill="#9fb0bd" font-size="12" font-family="Segoe UI,sans-serif">B2 front</text>';
      // valve
      b += '<rect x="20" y="62" width="64" height="40" rx="5" fill="#1d252b" stroke="#8a949b" stroke-width="2"/>' + lamp(34, 82, 6, "#ffbf1f", t.Y1) + '<text x="52" y="86" fill="#9fb0bd" font-size="12" font-family="Segoe UI,sans-serif">Y1</text>';
      b += '<line x1="84" y1="76" x2="' + x0 + '" y2="76" stroke="#8a949b" stroke-width="3"/><line x1="84" y1="92" x2="' + (x0 + len - 6) + '" y2="130" stroke="#8a949b" stroke-width="2" opacity=".4"/>';
      b += '<text x="420" y="40" fill="#9fb0bd" font-size="13" font-family="Segoe UI,sans-serif">Cylinder ' + (t.Y1 ? "extending / extended" : "retracting / retracted") + "</text>";
      return SV(600, 190, b);
    }
  };
  return { conveyor: conveyor, tank: tank, traffic: traffic, cylinder: cylinder };
})();
