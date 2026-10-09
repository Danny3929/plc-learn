(function () {
  "use strict";
  var KEY = "tialearn.v1";
  var mods = (window.MODULES || []).slice().sort(function (a, b) { return a.order - b.order; });
  var lessons = [];
  mods.forEach(function (m) { (m.lessons || []).forEach(function (l) { l.mod = m; lessons.push(l); }); });

  // ---------- state ----------
  var blank = function () { return { done: {}, notes: {}, quiz: {}, tries: {}, tried: {}, awards: {}, badges: {}, days: [], sims: {} }; };
  var state = blank();
  try { var raw = localStorage.getItem(KEY); if (raw) state = Object.assign(blank(), JSON.parse(raw)); } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  var currentId = null;

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function $(id) { return document.getElementById(id); }

  // ---------- game rules ----------
  var LEVELS = [
    { at: 0, title: "Apprentice" }, { at: 60, title: "Wire Puller" }, { at: 140, title: "Contact" }, { at: 250, title: "Coil" },
    { at: 400, title: "Rung Builder" }, { at: 600, title: "Timer Tamer" }, { at: 850, title: "Block Programmer" },
    { at: 1100, title: "Integrator" }, { at: 1400, title: "Commissioning Engineer" }, { at: 1800, title: "Systems Engineer" }, { at: 2300, title: "Automation Pro" }
  ];
  var XP = { quizFirst: 10, quizRetry: 3, tryIt: 10, lesson: 25, module: 50, sim: 5 };

  function totalXp() { var t = 0; for (var k in state.awards) t += state.awards[k]; return t; }
  function levelFor(xp) { var i = 0; while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1].at) i++; return i; }
  function today(offset) {
    var d = new Date(); d.setDate(d.getDate() - (offset || 0));
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  }
  function streak() {
    var n = 0, off = state.days.indexOf(today(0)) >= 0 ? 0 : 1;
    while (state.days.indexOf(today(n + off)) >= 0) n++;
    return n;
  }
  function modDone(m) { return (m.lessons || []).length > 0 && m.lessons.every(function (l) { return state.done[l.id]; }); }
  function modBadge(order) { return function () { return mods.some(function (m) { return m.order === order && modDone(m); }); }; }
  function countKeys(obj, prefix) { return Object.keys(obj).filter(function (k) { return k.indexOf(prefix) === 0; }).length; }

  var BADGES = [
    { id: "first", icon: "🚀", name: "Power on", desc: "Complete your first lesson", test: function () { return lessons.some(function (l) { return state.done[l.id]; }); } },
    { id: "sharp", icon: "🎯", name: "Sharp shooter", desc: "Answer 3 quizzes right on the first try", test: function () { return Object.keys(state.awards).filter(function (k) { return k.indexOf("q:") === 0 && state.awards[k] === XP.quizFirst; }).length >= 3; } },
    { id: "hands", icon: "🛠️", name: "Hands on", desc: "Finish 5 Quests", test: function () { return Object.keys(state.tried).length >= 5; } },
    { id: "lab", icon: "🔌", name: "Ladder lab", desc: "Play with 5 different simulators", test: function () { return countKeys(state.awards, "s:") >= 5; } },
    { id: "notes", icon: "📝", name: "Note taker", desc: "Write notes in 3 lessons", test: function () { return Object.keys(state.notes).filter(function (k) { return state.notes[k].trim(); }).length >= 3; } },
    { id: "fire", icon: "🔥", name: "On fire", desc: "Reach a 3-day streak", test: function () { return streak() >= 3; } },
    { id: "m0", icon: "💡", name: "Fundamentals", desc: "Complete the PLC foundations module", test: modBadge(0) },
    { id: "m1", icon: "🖥️", name: "Portal pilot", desc: "Complete the TIA Portal module", test: modBadge(1) },
    { id: "m2", icon: "🪜", name: "Ladder climber", desc: "Complete the ladder logic module", test: modBadge(2) },
    { id: "m3", icon: "🧱", name: "Block builder", desc: "Complete the program structure module", test: modBadge(3) },
    { id: "m4", icon: "📈", name: "Data wrangler", desc: "Complete the data, SCL and analog module", test: modBadge(4) },
    { id: "m5", icon: "📟", name: "HMI designer", desc: "Complete the HMI module", test: modBadge(5) },
    { id: "m6", icon: "🌐", name: "Network navigator", desc: "Complete the networks module", test: modBadge(6) },
    { id: "m7", icon: "🎛️", name: "Control engineer", desc: "Complete the advanced control module", test: modBadge(7) },
    { id: "m8", icon: "🏆", name: "Automation pro", desc: "Complete the professional practice module", test: modBadge(8) },
    { id: "m9", icon: "🔧", name: "Field technician", desc: "Complete the electrical and field devices module", test: modBadge(9) },
    { id: "m10", icon: "🧠", name: "Code architect", desc: "Complete the advanced programming module", test: modBadge(10) },
    { id: "m11", icon: "🧪", name: "Lab rat", desc: "Complete the practice lab", test: modBadge(11) },
    { id: "m12", icon: "🌍", name: "Cross-platform", desc: "Complete the beyond Siemens module", test: modBadge(12) },
    { id: "m13", icon: "🧰", name: "Toolkit complete", desc: "Complete the professional toolkit module", test: modBadge(13) },
    { id: "m14", icon: "📁", name: "Project builder", desc: "Complete the Projects section", test: modBadge(14) },
    { id: "lv4", icon: "⭐", name: "Rising star", desc: "Reach level 4", test: function () { return levelFor(totalXp()) >= 3; } }
  ];

  // ---------- feedback ----------
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function toast(msg, cls) {
    var box = $("toasts"), t = document.createElement("div");
    t.className = "toast " + (cls || ""); t.innerHTML = msg; box.appendChild(t);
    setTimeout(function () { t.classList.add("out"); }, 2600);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 3100);
  }
  function confetti(n) {
    if (reduced) return;
    var colors = ["#3cc3d6", "#6cc38f", "#f2b84b", "#ef6f6c", "#b48ef0"];
    for (var i = 0; i < n; i++) {
      var p = document.createElement("i"); p.className = "conf";
      p.style.left = 30 + Math.random() * 40 + "vw";
      p.style.background = colors[i % colors.length];
      p.style.setProperty("--dx", (Math.random() * 300 - 150) + "px");
      p.style.setProperty("--dy", (Math.random() * 260 + 120) + "px");
      p.style.setProperty("--rot", (Math.random() * 720 - 360) + "deg");
      document.body.appendChild(p);
      (function (el) { setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1300); })(p);
    }
  }

  function award(key, xp, label) {
    if (state.awards[key] !== undefined) return false;
    var before = levelFor(totalXp());
    var d = today(0);
    var firstToday = state.days.indexOf(d) < 0;
    if (firstToday) state.days.push(d);
    state.awards[key] = xp;
    toast("<b>+" + xp + " XP</b> " + esc(label), "xp");
    if (firstToday) {
      var s = streak();
      if (s >= 2) { var bonus = Math.min(s, 5) * 5; state.awards["s+:" + d] = bonus; toast("🔥 <b>" + s + "-day streak!</b> +" + bonus + " XP", "xp"); }
    }
    var after = levelFor(totalXp());
    if (after > before) { toast("🎉 <b>Level " + (after + 1) + ": " + LEVELS[after].title + "</b>", "big"); confetti(40); }
    checkBadges();
    save(); renderHud(); renderNav(currentId);
    return true;
  }
  function checkBadges() {
    BADGES.forEach(function (b) {
      if (!state.badges[b.id] && b.test()) { state.badges[b.id] = true; toast("🏅 Badge unlocked: <b>" + esc(b.name) + "</b>", "big"); confetti(24); }
    });
  }

  // ---------- rendering ----------
  function renderHud() {
    var xp = totalXp(), li = levelFor(xp), cur = LEVELS[li], nxt = LEVELS[li + 1];
    var pct = nxt ? Math.round(((xp - cur.at) / (nxt.at - cur.at)) * 100) : 100;
    var s = streak();
    var h = '<div class="lv"><b>Level ' + (li + 1) + "</b> " + esc(cur.title) + "</div>" +
      '<div class="bar xp"><i style="width:' + pct + '%"></i></div>' +
      '<div class="xpline">' + xp + " XP" + (nxt ? " · " + (nxt.at - xp) + " to " + esc(nxt.title) : " · max level") +
      (s ? " · 🔥 " + s + (s === 1 ? " day" : "-day streak") : "") + "</div><div class=\"badges\">";
    BADGES.forEach(function (b) {
      var on = state.badges[b.id];
      h += '<span class="badge' + (on ? " on" : "") + '" title="' + esc(b.name + ": " + b.desc) + '">' + (on ? b.icon : "🔒") + "</span>";
    });
    $("hud").innerHTML = h + "</div>";
  }

  function renderNav(activeId) {
    var html = "";
    mods.forEach(function (m) {
      var has = m.lessons && m.lessons.length, n = has ? m.lessons.filter(function (l) { return state.done[l.id]; }).length : 0;
      html += '<div class="mod' + (has ? "" : " soon") + '"><h3>' + esc(m.title) +
        (has ? ' <span class="soon-tag">' + (modDone(m) ? "⭐ " : "") + n + "/" + m.lessons.length + "</span>" : ' <span class="soon-tag">(locked)</span>') + "</h3>";
      (m.lessons || []).forEach(function (l) {
        html += '<a class="nav-item' + (l.id === activeId ? " active" : "") + '" href="#/' + l.id + '">' +
          '<span class="tick">' + (state.done[l.id] ? "✓" : "") + "</span><span>" + esc(l.id + "  " + l.title) + "</span></a>";
      });
      (m.planned || []).forEach(function (t) {
        html += '<div class="nav-item planned"><span class="tick">🔒</span><span>' + esc(t) + "</span></div>";
      });
      html += "</div>";
    });
    $("nav").innerHTML = html;
  }

  function copy(text, btn) {
    function ok() { btn.textContent = "Copied"; setTimeout(function () { btn.textContent = "Copy"; }, 1200); }
    function fallback() {
      var t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); ok(); } catch (e) {} document.body.removeChild(t);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, fallback); else fallback();
  }

  // minimal SCL syntax colouring
  var SCL_KW = /\b(IF|THEN|ELSIF|ELSE|END_IF|CASE|OF|END_CASE|FOR|TO|BY|DO|END_FOR|WHILE|END_WHILE|REPEAT|UNTIL|END_REPEAT|RETURN|EXIT|CONTINUE|AND|OR|XOR|NOT|MOD|TRUE|FALSE|VAR_INPUT|VAR_OUTPUT|VAR_IN_OUT|VAR_TEMP|VAR|END_VAR|FUNCTION_BLOCK|END_FUNCTION_BLOCK|FUNCTION|END_FUNCTION|STRUCT|END_STRUCT|Bool|Int|DInt|Real|Time|Word|Byte|Array|Void)\b/g;
  function sclHtml(src) {
    var out = "", re = /(\/\/[^\n]*)|("(?:[^"\n]*)")|('(?:[^'\n]*)')|(T#[0-9a-z_]+)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z_0-9]*)|([\s\S])/g, m;
    while ((m = re.exec(src))) {
      if (m[1]) out += '<span class="cm">' + esc(m[1]) + "</span>";
      else if (m[2] || m[3]) out += '<span class="st">' + esc(m[2] || m[3]) + "</span>";
      else if (m[4] || m[5]) out += '<span class="nu">' + esc(m[4] || m[5]) + "</span>";
      else if (m[6]) { SCL_KW.lastIndex = 0; out += (new RegExp("^(?:" + SCL_KW.source + ")$")).test(m[6]) ? '<span class="kw">' + m[6] + "</span>" : esc(m[6]); }
      else out += esc(m[7]);
    }
    return out;
  }

  function renderBlock(l, b, i) {
    var kind = b[0], v = b[1], key = l.id + ":" + i;
    if (kind === "p") return "<p>" + v + "</p>";
    if (kind === "h") return "<h2>" + esc(v) + "</h2>";
    if (kind === "ul") return "<ul>" + v.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>";
    if (kind === "note") return '<div class="box note"><b class="t">Note</b><p>' + v + "</p></div>";
    if (kind === "warn") return '<div class="box warn"><b class="t">Watch out</b><p>' + v + "</p></div>";
    if (kind === "fig") {
      var f = window.FIGS[v];
      return '<figure class="fig">' + (f ? f() : "<p>(missing figure " + esc(v) + ")</p>") + (b[2] ? "<figcaption>" + b[2] + "</figcaption>" : "") + "</figure>";
    }
    if (kind === "sim" || kind === "pid" || kind === "subnet" || kind === "alarm" || kind === "bits" || kind === "scanplay" || kind === "timerplay" || kind === "statesim" || kind === "hmiplay" || kind === "encoder" || kind === "profile" || kind === "regplay" || kind === "pidtank") return '<div class="simhost" data-sim="' + i + '"></div>';
    if (kind === "click") {
      return '<div class="click"><span class="where">' + esc(b[2] || "In TIA Portal") + "</span>" +
        v.split(">").map(function (s) { return '<span class="step">' + esc(s.trim()) + "</span>"; }).join('<span class="sep">▸</span>') + "</div>";
    }
    if (kind === "try") {
      var d = state.tried[key];
      return '<div class="box try"><b class="t">Quest</b><p>' + v + '</p><button class="quest' + (d ? " got" : "") + '" data-try="' + key + '"' + (d ? " disabled" : "") + ">" +
        (d ? "✓ Quest complete" : "I did it · +" + XP.tryIt + " XP") + "</button></div>";
    }
    if (kind === "reveal") {
      return '<details class="reveal"><summary>' + esc(v) + "</summary>" + (b[2] || []).map(function (x, k) { return renderBlock(l, x, i + "." + k); }).join("") + "</details>";
    }
    if (kind === "out") return '<pre class="out">' + esc(v) + "</pre>";
    if (kind === "code") {
      return '<div class="cmd"><span class="where">' + esc(b[2] || "Text") + "</span>" + esc(v) +
        '<button data-copy="' + esc(v).replace(/"/g, "&quot;") + '">Copy</button></div>';
    }
    if (kind === "scl") {
      return '<div class="cmd"><span class="where">SCL' + (b[2] ? " · " + esc(b[2]) : "") + "</span>" + sclHtml(v) +
        '<button data-copy="' + esc(v).replace(/"/g, "&quot;") + '">Copy</button></div>';
    }
    if (kind === "quiz") {
      var chosen = state.quiz[key], solved = chosen === v.answer;
      var h = '<div class="quiz" data-key="' + key + '"><div class="q">' + v.q + "</div>";
      v.options.forEach(function (o, idx) {
        var cls = "opt";
        if (chosen !== undefined) { if (idx === v.answer && solved) cls += " right"; else if (idx === chosen) cls += " wrong"; }
        h += '<button class="' + cls + '" data-idx="' + idx + '"' + (solved ? " disabled" : "") + ">" + o + "</button>";
      });
      if (chosen !== undefined) h += '<div class="why">' + (solved ? "Correct. " : "Not quite, try again. ") + (solved ? v.why : "") + "</div>";
      return h + "</div>";
    }
    return "";
  }

  function renderWelcome() {
    window.Sim.cleanup();
    currentId = null; renderNav(null); renderHud();
    var next = lessons.find(function (l) { return !state.done[l.id]; });
    var started = Object.keys(state.awards).length > 0;
    var rung = '<svg class="rung" viewBox="0 0 640 110" role="img" aria-label="A ladder rung with power flowing to a coil">' +
      '<line class="rl" x1="10" y1="10" x2="10" y2="100"/><line class="rl" x1="630" y1="10" x2="630" y2="100"/>' +
      '<path class="w" d="M10 55H200M240 55H400M440 55H630"/><path class="flow" d="M10 55H200M240 55H400M440 55H630"/>' +
      '<path class="c" d="M200 38V72M240 38V72"/><path class="c" d="M395 38Q383 55 395 72M445 38Q457 55 445 72"/>' +
      '<text x="220" y="28" text-anchor="middle">START</text><text x="420" y="28" text-anchor="middle">MOTOR</text>' +
      '<text x="220" y="92" text-anchor="middle">%I0.0</text><text x="420" y="92" text-anchor="middle">%Q0.0</text></svg>';
    var BL = { 0: "What a PLC is, the scan cycle, I/O, data types, Siemens hardware.", 1: "Install, interface, project, tags, download and PLCSIM.", 2: "Contacts, seal-in, set/reset, edges, timers, counters.", 3: "OB, FC, FB, DB, startup blocks, naming and style.", 4: "Math, analog scaling, structured text, state machines.", 5: "WinCC screens, tags, alarms, trends, recipes and users.", 6: "PROFINET, IP addressing, ET 200SP, Modbus, OPC UA, drives.", 7: "PID, motion control, sequencers and libraries.", 8: "Diagnostics, safety, security, FAT/SAT, teamwork, capstone.", 9: "Electrical basics, motor starting, sensors, pneumatics, schematics, commissioning.", 10: "Arrays and UDTs, strings and time, VARIANT, robust blocks, step chains, interrupts, trace.", 11: "Logic, timer, process and SCL drills, a debug clinic and a final exam.", 12: "Allen-Bradley, IEC 61131-3 and free practice, plant data and OEE, standards, portfolio.", 13: "Safety programming, Startdrive, a full S7-1500 project, TIA V21 and Git, PLCSIM Advanced, security and MQTT hands-on.", 14: "Build-it projects: a bottle packing line with a WinCC panel, an operator screen design and a portfolio write-up." };
    var cards = mods.filter(function (m) { return m.order !== 14; }).map(function (m) {
      var has = m.lessons && m.lessons.length, n = has ? m.lessons.filter(function (l) { return state.done[l.id]; }).length : 0;
      var title = m.title.replace(/^\d+\s*·\s*/, "");
      if (!has) return '<div class="card lock"><div class="n">' + m.order + "</div><h3>" + esc(title) + '</h3><p>Coming later</p><div class="pb"><i style="width:0"></i></div></div>';
      var first = m.lessons.find(function (l) { return !state.done[l.id]; }) || m.lessons[0];
      return '<a class="card" href="#/' + first.id + '"><div class="n">' + m.order + "</div><h3>" + esc(title) + "</h3><p>" + esc(BL[m.order] || "") + '</p><div class="pb"><i style="width:' + Math.round(n / m.lessons.length * 100) + '%"></i></div><div class="ct">' + n + " / " + m.lessons.length + " lessons</div></a>";
    }).join("");
    $("lesson").innerHTML = '<div class="welcome"><div class="hero"><div class="kicker"><b>S7-1200 / S7-1500</b><span>Siemens TIA Portal</span></div><h1>Learn to program PLCs</h1>' +
      "<p>From the scan cycle to state machines, with an illustration for every idea and a <b>live ladder simulator</b> where you flip switches and watch power flow. Earn XP, level up, keep a daily streak.</p>" + rung + "</div>" +
      (next ? '<div class="actions"><a class="btn" href="#/' + next.id + '">' + (started ? "Continue" : "Start") + " · " + esc(next.id + " " + next.title) + "</a></div>" : "<p><b>You have finished every available lesson. More are coming.</b></p>") +
      '<div class="cards">' + cards + '<a class="card" href="#/projects"><div class="n">📁</div><h3>Projects</h3><p>Build-it projects: bottle packing line with a WinCC panel, an operator screen design, a portfolio write-up.</p><div class="pb"><i style="width:' + Math.round(((mods.filter(function (m) { return m.order === 14; })[0] || { lessons: [] }).lessons.filter(function (l) { return state.done[l.id]; }).length) / 3 * 100) + '%"></i></div><div class="ct">3 projects</div></a></div>' +
      "<p>Wrong answers never cost XP, so experiment. Menu names in TIA Portal shift slightly between versions (V17 to V21); if something looks different on your screen, tell Claude what you see.</p></div>";
  }

  var PROJ = { P1: ["Build", "PLC + HMI", "KTP600 panel, FB2 simulation, button and movement animations"], P2: ["Design", "HMI design", "Tag table, wireframe and faceplate for a process overview screen"], P3: ["Document", "Portfolio", "Pick a finished project and write it up for employers"] };
  var MORE = [["7.5", "Tank level PID lab", "S7-1200, PID_Compact, tuning"], ["8.6", "Capstone: a sorting station", "Ladder, state machine, HMI"], ["13.3", "S7-1500 sorting station end to end", "Full guided build"]];
  function renderProjects() {
    window.Sim.cleanup();
    currentId = null; renderNav(null); renderHud();
    var pm = mods.filter(function (m) { return m.order === 14; })[0], ps = pm ? pm.lessons : [];
    var cards = ps.map(function (l) {
      var p = PROJ[l.id] || ["Project", "", ""];
      return '<a class="card" href="#/' + l.id + '"><div class="n">' + esc(l.id) + "</div><h3>" + esc(l.title) + "</h3><p>" + esc(p[2]) + '</p><div class="pb"><i style="width:' + (state.done[l.id] ? 100 : 0) + '%"></i></div><div class="ct">' + esc(p[0]) + " · " + l.minutes + " min" + (state.done[l.id] ? " · ✓ done" : "") + "</div></a>";
    }).join("");
    var more = MORE.map(function (m) { return '<li><a href="#/' + m[0] + '"><b>' + esc(m[1]) + "</b></a> · " + esc(m[2]) + " (lesson " + m[0] + ")</li>"; }).join("");
    $("lesson").innerHTML = '<div class="welcome"><div class="hero"><div class="kicker"><b>Projects</b><span>Build it, then document it</span></div><h1>Projects</h1>' +
      "<p>Lessons teach one idea at a time. Projects make you combine them: a brief, a build plan, an acceptance checklist and a write-up. Finish a project and tick its checklist before you mark it complete.</p></div>" +
      '<div class="cards">' + cards + "</div><h2>More projects inside the course</h2><ul>" + more + "</ul></div>";
    window.scrollTo(0, 0); closeNav();
  }

  function renderGlossary() {
    window.Sim.cleanup();
    currentId = null; renderNav(null); renderHud();
    var terms = (window.GLOSSARY || []).slice().sort(function (a, b) { return a[0].toLowerCase() < b[0].toLowerCase() ? -1 : 1; });
    $("lesson").innerHTML = '<h1>Glossary</h1><div class="meta">' + terms.length + ' terms</div><input class="gl-search" id="gls" type="search" placeholder="Search terms"><dl class="gl" id="gll"></dl>';
    function fill(q) {
      q = (q || "").toLowerCase();
      $("gll").innerHTML = terms.filter(function (t) { return !q || (t[0] + " " + t[1]).toLowerCase().indexOf(q) >= 0; })
        .map(function (t) { return "<dt>" + esc(t[0]) + "</dt><dd>" + t[1] + "</dd>"; }).join("");
    }
    fill(); $("gls").addEventListener("input", function (e) { fill(e.target.value); });
    window.scrollTo(0, 0); closeNav();
  }

  function renderLesson(id, keepScroll) {
    var idx = lessons.findIndex(function (l) { return l.id === id; });
    if (idx < 0) return renderWelcome();
    window.Sim.cleanup();
    var l = lessons[idx];
    currentId = id; renderNav(id); renderHud();
    var h = '<div class="kicker"><b>' + esc(l.id) + "</b><span>" + esc(l.mod.title) + " · " + l.minutes + " min</span></div><h1>" + esc(l.title) + "</h1>";
    l.blocks.forEach(function (b, i) { h += renderBlock(l, b, i); });
    h += '<div class="notes"><h2>My notes</h2><textarea id="note" placeholder="Anything you want to remember or ask about later"></textarea></div>';
    var prev = lessons[idx - 1], next = lessons[idx + 1], got = state.awards["l:" + id] !== undefined;
    h += '<div class="actions">' +
      (prev ? '<a class="btn ghost" href="#/' + prev.id + '">← ' + esc(prev.title) + "</a>" : "") +
      '<button class="btn' + (state.done[id] ? " done" : "") + '" id="done">' + (state.done[id] ? "✓ Completed" : "Complete lesson" + (got ? "" : " · +" + XP.lesson + " XP")) + "</button>" +
      (next ? '<a class="btn ghost" href="#/' + next.id + '">' + esc(next.title) + " →</a>" : "") + "</div>";
    $("lesson").innerHTML = h;
    $("note").value = state.notes[id] || "";
    $("note").addEventListener("input", function (e) { state.notes[id] = e.target.value; save(); checkBadges(); save(); renderHud(); });
    $("done").addEventListener("click", function () {
      state.done[id] = !state.done[id]; save();
      if (state.done[id]) {
        if (award("l:" + id, XP.lesson, "lesson complete")) confetti(30);
        if (modDone(l.mod) && award("m:" + l.mod.order, XP.module, "module complete: " + l.mod.title)) confetti(60);
        checkBadges(); save();
      }
      renderLesson(id, true);
    });
    $("lesson").querySelectorAll(".cmd button").forEach(function (b) {
      b.addEventListener("click", function () { copy(b.getAttribute("data-copy"), b); });
    });
    $("lesson").querySelectorAll("button.quest").forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-try"); state.tried[k] = true; save();
        award("t:" + k, XP.tryIt, "quest complete"); confetti(14); rewire(l);
      });
    });
    $("lesson").querySelectorAll(".simhost").forEach(function (host) {
      var bi = parseInt(host.getAttribute("data-sim"), 10), skey = "s:" + l.id + ":" + bi;
      var blk = l.blocks[bi], touch = function () { award(skey, XP.sim, "simulator played"); };
      if (blk[0] === "sim") window.Sim.create(host, blk[1], touch); else window.Widgets.create(blk[0], host, blk[1], touch);
    });
    $("lesson").querySelectorAll(".quiz").forEach(function (q) {
      var key = q.getAttribute("data-key"), bi = parseInt(key.split(":")[1], 10), blk = l.blocks[bi][1];
      q.querySelectorAll("button.opt").forEach(function (b) {
        b.addEventListener("click", function () {
          var pick = parseInt(b.getAttribute("data-idx"), 10);
          state.tries[key] = (state.tries[key] || 0) + 1; state.quiz[key] = pick; save();
          if (pick === blk.answer) {
            award("q:" + key, state.tries[key] === 1 ? XP.quizFirst : XP.quizRetry, state.tries[key] === 1 ? "first try!" : "correct");
            if (state.tries[key] === 1) confetti(10);
          }
          rewire(l);
        });
      });
    });
    if (!keepScroll) window.scrollTo(0, 0);
    closeNav();
  }

  function navIsOpen() { return $("side").classList.contains("open"); }
  function setNav(open) {
    $("side").classList.toggle("open", open);
    document.body.classList.toggle("nav-open", open);
    $("menu").setAttribute("aria-expanded", open ? "true" : "false");
  }
  function closeNav() { if (navIsOpen()) setNav(false); }

  function rewire(l) { var y = window.scrollY; renderLesson(l.id, true); window.scrollTo(0, y); }

  function route() {
    if (location.hash === "#/glossary") return renderGlossary();
    if (location.hash === "#/projects") return renderProjects();
    var m = location.hash.match(/^#\/(.+)$/);
    if (m) renderLesson(decodeURIComponent(m[1])); else renderWelcome();
  }
  window.addEventListener("hashchange", route);
  // ---------- lesson list on a phone ----------
  // Open with the Lessons button or a swipe from the left edge. Close with the X, a tap on the dimmed
  // area, a swipe to the left, the Escape key, or by tapping any link in the list.
  $("menu").addEventListener("click", function () { setNav(!navIsOpen()); });
  $("sideclose").addEventListener("click", closeNav);
  $("scrim").addEventListener("click", closeNav);
  $("side").addEventListener("click", function (e) { if (e.target.closest && e.target.closest("a")) closeNav(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });
  window.addEventListener("resize", function () { if (window.innerWidth > 800) closeNav(); });
  var swipe = null;
  document.addEventListener("touchstart", function (e) { var t = e.touches[0]; swipe = { x: t.clientX, y: t.clientY }; }, { passive: true });
  document.addEventListener("touchend", function (e) {
    var s0 = swipe; swipe = null;
    if (!s0 || window.innerWidth > 800) return;
    var t = e.changedTouches[0], dx = t.clientX - s0.x, dy = t.clientY - s0.y;
    if (Math.abs(dy) > 60 || Math.abs(dx) < 70) return;
    if (dx < 0 && navIsOpen()) closeNav();
    else if (dx > 0 && !navIsOpen() && s0.x < 24) setNav(true);
  }, { passive: true });
  // ---------- phone: tap a figure to see it full size ----------
  // Figures are wide drawings, so on a phone they scroll sideways at a readable size. Tapping one opens it
  // in a full-screen view you can pan and pinch-zoom; tap the X (or press Escape) to close.
  function closeFigZoom() { var z = document.querySelector(".figzoom"); if (z && z.parentNode) z.parentNode.removeChild(z); document.body.classList.remove("zoom-open"); }
  function openFigZoom(svg) {
    closeFigZoom();
    var z = document.createElement("div"); z.className = "figzoom";
    var close = document.createElement("button"); close.type = "button"; close.className = "figzoom-x"; close.setAttribute("aria-label", "Close the enlarged figure"); close.textContent = "✕";
    close.addEventListener("click", closeFigZoom);
    var box = document.createElement("div"); box.className = "figzoom-box";
    var copy = svg.cloneNode(true); copy.removeAttribute("style"); copy.setAttribute("class", svg.getAttribute("class") || "figsvg");
    var vb = (svg.getAttribute("viewBox") || "").split(/[ ,]+/), w = parseFloat(vb[2]) || 900;
    copy.style.width = Math.round(Math.max(900, w * 1.25)) + "px"; copy.style.maxWidth = "none"; copy.style.minWidth = "0";
    box.appendChild(copy); z.appendChild(box); z.appendChild(close);
    document.body.appendChild(z); document.body.classList.add("zoom-open");
  }
  $("lesson").addEventListener("click", function (e) {
    var svg = e.target.closest && e.target.closest("figure.fig .figsvg");
    if (svg && window.innerWidth <= 800) openFigZoom(svg);
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeFigZoom(); });

  $("reset").addEventListener("click", function () {
    if (confirm("Erase all XP, badges, progress, notes and quiz answers?")) { state = blank(); save(); route(); }
  });
  route();
})();

