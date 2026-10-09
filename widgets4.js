/* Free-play ladder builder: tap together inputs, outputs and rungs, and run them live in the ladder simulator.
   Builder.mount(host, { onTouch })  builds the form plus a live Sim underneath.
   Program model:
     inputs:  [{ tag, kind: 'push' | 'switch' }]            addresses %I0.n are handed out in order
     outputs: [{ tag, kind: 'lamp' | 'motor' }]             addresses %Q0.n
     rungs:   [{ terms: [ [ {t:'NO'|'NC', tag}, ... parallel ] , ... in series ],
                 out: { k: 'coil'|'set'|'reset'|'ton', tag?, inst?, sec? } }]  */
window.Builder = (function () {
  "use strict";
  var KEY = "tialearn.builder.v1";

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function clean(name, fallback) {
    var t = String(name || "").replace(/[^A-Za-z0-9_]/g, "_").replace(/^_+/, "");
    if (!t) return fallback;
    if (/^[0-9]/.test(t)) t = "X_" + t;
    return t.slice(0, 20);
  }

  var PRESETS = {
    seal: { label: "Start / stop seal-in", prog: {
      inputs: [{ tag: "Start_PB", kind: "push" }, { tag: "Stop_PB", kind: "push" }], outputs: [{ tag: "Motor", kind: "motor" }], timers: 0,
      rungs: [{ terms: [[{ t: "NO", tag: "Start_PB" }, { t: "NO", tag: "Motor" }], [{ t: "NC", tag: "Stop_PB" }]], out: { k: "coil", tag: "Motor" } }] } },
    delay: { label: "Start delay (timer)", prog: {
      inputs: [{ tag: "Start_Sw", kind: "switch" }], outputs: [{ tag: "Motor", kind: "motor" }], timers: 1,
      rungs: [{ terms: [[{ t: "NO", tag: "Start_Sw" }]], out: { k: "ton", inst: "T1", sec: 3 } },
              { terms: [[{ t: "NO", tag: "T1.Q" }]], out: { k: "coil", tag: "Motor" } }] } },
    twohand: { label: "Two-hand safety start", prog: {
      inputs: [{ tag: "Left_PB", kind: "push" }, { tag: "Right_PB", kind: "push" }], outputs: [{ tag: "Press", kind: "motor" }, { tag: "Ready", kind: "lamp" }], timers: 0,
      rungs: [{ terms: [[{ t: "NO", tag: "Left_PB" }], [{ t: "NO", tag: "Right_PB" }]], out: { k: "coil", tag: "Press" } },
              { terms: [[{ t: "NC", tag: "Press" }]], out: { k: "coil", tag: "Ready" } }] } },
    latch: { label: "Latch with Set / Reset", prog: {
      inputs: [{ tag: "On_PB", kind: "push" }, { tag: "Off_PB", kind: "push" }], outputs: [{ tag: "Lamp", kind: "lamp" }], timers: 0,
      rungs: [{ terms: [[{ t: "NO", tag: "On_PB" }]], out: { k: "set", tag: "Lamp" } },
              { terms: [[{ t: "NO", tag: "Off_PB" }]], out: { k: "reset", tag: "Lamp" } }] } },
    blank: { label: "Start from scratch", prog: { inputs: [{ tag: "Switch_1", kind: "switch" }], outputs: [{ tag: "Lamp_1", kind: "lamp" }], timers: 0, rungs: [] } }
  };
  function copy(o) { return JSON.parse(JSON.stringify(o)); }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { var p = JSON.parse(raw); if (p && p.inputs && p.outputs && p.rungs) return p; }
    } catch (e) {}
    return copy(PRESETS.seal.prog);
  }
  function save(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {} }

  function tagsFor(p) {   // everything a contact may test
    var t = [];
    p.inputs.forEach(function (i) { t.push(i.tag); });
    p.outputs.forEach(function (o) { t.push(o.tag); });
    p.rungs.forEach(function (r) { if (r.out.k === "ton") t.push(r.out.inst + ".Q"); });
    return t;
  }
  function toCfg(p) {
    var inputs = p.inputs.map(function (i, n) { return { tag: i.tag, addr: "%I0." + n, label: i.kind === "push" ? "Push button" : "Switch", kind: i.kind }; });
    var outputs = p.outputs.map(function (o, n) { return { tag: o.tag, addr: "%Q0." + n, label: o.kind === "motor" ? "Motor" : "Lamp", kind: o.kind }; });
    var rungs = p.rungs.filter(function (r) { return r.terms.length; }).map(function (r, n) {
      var c = r.terms.map(function (term) { return term.length === 1 ? [term[0].t, term[0].tag] : ["par", term.map(function (x) { return [[x.t, x.tag]]; })]; });
      var o = r.out.k === "ton" ? ["ton", r.out.inst, Math.round((r.out.sec || 1) * 1000)] : [r.out.k, r.out.tag];
      return { title: "Rung " + (n + 1), c: c, o: o };
    });
    return { title: "Your program", inputs: inputs, outputs: outputs, rungs: rungs };
  }
  function problems(p) {
    var out = [];
    if (!p.inputs.length) out.push("Add at least one input (a switch or push button).");
    if (!p.outputs.length) out.push("Add at least one output (a lamp or motor).");
    var live = p.rungs.filter(function (r) { return r.terms.length; });
    if (!live.length) out.push("Add a rung and give it at least one contact.");
    live.forEach(function (r, n) { if (r.out.k !== "ton" && !r.out.tag) out.push("Rung " + (n + 1) + " needs an output to drive."); });
    return out;
  }

  function mount(host, opts) {
    opts = opts || {};
    var prog = load();
    var form = document.createElement("div"), simBox = document.createElement("div");
    form.className = "bld"; simBox.className = "bld-sim";
    host.innerHTML = ""; host.appendChild(form); host.appendChild(simBox);

    function options(list, current, withEmpty) {
      var h = withEmpty ? '<option value="">choose...</option>' : "";
      list.forEach(function (t) { h += '<option value="' + esc(t) + '"' + (t === current ? " selected" : "") + ">" + esc(t) + "</option>"; });
      return h;
    }
    function changed(rebuildForm) {
      save(prog);
      if (rebuildForm !== false) renderForm();
      renderSim();
    }
    function uniqueTag(base, taken) {
      var n = 1, t = base;
      while (taken.indexOf(t) >= 0) { n++; t = base.replace(/_\d+$/, "") + "_" + n; }
      return t;
    }
    function allNames() { return prog.inputs.map(function (i) { return i.tag; }).concat(prog.outputs.map(function (o) { return o.tag; })); }
    function renameEverywhere(from, to) {
      prog.rungs.forEach(function (r) {
        r.terms.forEach(function (term) { term.forEach(function (x) { if (x.tag === from) x.tag = to; }); });
        if (r.out.tag === from) r.out.tag = to;
      });
    }
    function dropTag(tag) {
      prog.rungs.forEach(function (r) {
        r.terms = r.terms.map(function (term) { return term.filter(function (x) { return x.tag !== tag; }); }).filter(function (term) { return term.length; });
        if (r.out.tag === tag) r.out.tag = "";
      });
    }

    function partRow(kind, list, i) {
      var p = list[i], isIn = kind === "in";
      return '<div class="bld-part"><span class="bld-ico">' + (isIn ? (p.kind === "push" ? "🔘" : "🎚️") : (p.kind === "motor" ? "⚙️" : "💡")) + '</span>' +
        '<input class="bld-name" data-' + kind + '="' + i + '" value="' + esc(p.tag) + '" aria-label="Name" maxlength="20" autocapitalize="none" autocorrect="off" spellcheck="false">' +
        '<span class="bld-addr">' + (isIn ? "%I0." : "%Q0.") + i + '</span>' +
        '<button type="button" class="bld-x" data-del-' + kind + '="' + i + '" aria-label="Remove ' + esc(p.tag) + '">✕</button></div>';
    }

    function rungHtml(r, ri) {
      var tags = tagsFor(prog), outs = prog.outputs.map(function (o) { return o.tag; });
      var h = '<div class="bld-rung"><div class="bld-rh"><b>Rung ' + (ri + 1) + '</b><button type="button" class="bld-x" data-del-rung="' + ri + '" aria-label="Delete rung ' + (ri + 1) + '">✕</button></div>';
      h += '<div class="bld-terms">';
      r.terms.forEach(function (term, ti) {
        h += (ti ? '<span class="bld-and">AND</span>' : "") + '<div class="bld-term">';
        term.forEach(function (x, bi) {
          h += (bi ? '<span class="bld-or">OR</span>' : "") + '<div class="bld-contact">' +
            '<select data-ct="' + ri + "," + ti + "," + bi + '" aria-label="Contact type"><option value="NO"' + (x.t === "NO" ? " selected" : "") + '>NO  ─┤ ├─</option><option value="NC"' + (x.t === "NC" ? " selected" : "") + '>NC  ─┤/├─</option></select>' +
            '<select data-cg="' + ri + "," + ti + "," + bi + '" aria-label="Signal">' + options(tags, x.tag, true) + "</select>" +
            (term.length > 1 ? '<button type="button" class="bld-x" data-del-c="' + ri + "," + ti + "," + bi + '" aria-label="Remove contact">✕</button>' : "") + "</div>";
        });
        h += '<button type="button" class="bld-add" data-add-or="' + ri + "," + ti + '">+ OR (parallel)</button>';
        if (r.terms.length > 1) h += ' <button type="button" class="bld-mini" data-del-term="' + ri + "," + ti + '">remove this step</button>';
        h += "</div>";
      });
      h += '<button type="button" class="bld-add" data-add-and="' + ri + '">+ AND (in series)</button></div>';
      var o = r.out;
      h += '<div class="bld-out"><span class="bld-arrow">→</span><select data-ok="' + ri + '" aria-label="Output type">' +
        [["coil", "Coil ( )"], ["set", "Set (S)"], ["reset", "Reset (R)"], ["ton", "Timer: on-delay (TON)"]].map(function (k) { return '<option value="' + k[0] + '"' + (o.k === k[0] ? " selected" : "") + ">" + k[1] + "</option>"; }).join("") + "</select>";
      if (o.k === "ton") h += '<label class="bld-sec">after <input type="number" min="0.5" max="60" step="0.5" value="' + (o.sec || 3) + '" data-sec="' + ri + '" aria-label="Seconds"> s</label><span class="bld-addr">' + esc(o.inst) + ".Q is on when done</span>";
      else h += '<select data-oo="' + ri + '" aria-label="Output signal">' + options(outs, o.tag, true) + "</select>";
      return h + "</div></div>";
    }

    function renderForm() {
      var h = '<div class="bld-top"><label>Start from <select id="bld-preset">' +
        Object.keys(PRESETS).map(function (k) { return '<option value="' + k + '">' + esc(PRESETS[k].label) + "</option>"; }).join("") + '</select></label> <button type="button" class="bld-mini" id="bld-load">Load</button></div>';
      h += '<h3>1 · Inputs <small>things you press or flip</small></h3><div class="bld-parts">' + prog.inputs.map(function (_, i) { return partRow("in", prog.inputs, i); }).join("") + "</div>" +
        '<div class="bld-row"><button type="button" class="bld-add" id="add-push">+ Push button</button><button type="button" class="bld-add" id="add-switch">+ Switch</button></div>';
      h += '<h3>2 · Outputs <small>things the PLC drives</small></h3><div class="bld-parts">' + prog.outputs.map(function (_, i) { return partRow("out", prog.outputs, i); }).join("") + "</div>" +
        '<div class="bld-row"><button type="button" class="bld-add" id="add-lamp">+ Lamp</button><button type="button" class="bld-add" id="add-motor">+ Motor</button></div>';
      h += '<h3>3 · Rungs <small>power flows left to right when every step is true</small></h3>' + prog.rungs.map(rungHtml).join("") +
        '<div class="bld-row"><button type="button" class="bld-add bld-main" id="add-rung">+ Add rung</button></div>';
      var pr = problems(prog);
      h += pr.length ? '<div class="bld-todo"><b>To run it:</b><ul>' + pr.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>" : "";
      form.innerHTML = h;
    }

    function renderSim() {
      simBox.innerHTML = "";
      if (problems(prog).length) { simBox.innerHTML = '<p class="bld-hint">The simulator appears here as soon as the program is complete.</p>'; return; }
      var inner = document.createElement("div"); simBox.appendChild(inner);   // a fresh element, so the old simulator's timer stops itself
      window.Sim.create(inner, toCfg(prog), opts.onTouch);
    }

    // ----- events (delegated) -----
    form.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      var d = b.dataset, a;
      if (b.id === "add-push" || b.id === "add-switch") { prog.inputs.push({ tag: uniqueTag(b.id === "add-push" ? "PB_1" : "Switch_1", allNames()), kind: b.id === "add-push" ? "push" : "switch" }); return changed(); }
      if (b.id === "add-lamp" || b.id === "add-motor") { prog.outputs.push({ tag: uniqueTag(b.id === "add-lamp" ? "Lamp_1" : "Motor_1", allNames()), kind: b.id === "add-lamp" ? "lamp" : "motor" }); return changed(); }
      if (b.id === "add-rung") {
        var first = prog.inputs[0] ? prog.inputs[0].tag : "", outTag = prog.outputs[0] ? prog.outputs[0].tag : "";
        prog.rungs.push({ terms: first ? [[{ t: "NO", tag: first }]] : [], out: { k: "coil", tag: outTag } }); return changed();
      }
      if (b.id === "bld-load") { var key = form.querySelector("#bld-preset").value; prog = copy(PRESETS[key].prog); return changed(); }
      if (d.delIn !== undefined) { var ti = prog.inputs.splice(+d.delIn, 1)[0]; dropTag(ti.tag); return changed(); }
      if (d.delOut !== undefined) { var to = prog.outputs.splice(+d.delOut, 1)[0]; dropTag(to.tag); return changed(); }
      if (d.delRung !== undefined) { prog.rungs.splice(+d.delRung, 1); return changed(); }
      if (d.delC !== undefined) { a = d.delC.split(",").map(Number); var tm = prog.rungs[a[0]].terms[a[1]]; tm.splice(a[2], 1); return changed(); }
      if (d.delTerm !== undefined) { a = d.delTerm.split(",").map(Number); prog.rungs[a[0]].terms.splice(a[1], 1); return changed(); }
      if (d.addOr !== undefined) { a = d.addOr.split(",").map(Number); prog.rungs[a[0]].terms[a[1]].push({ t: "NO", tag: "" }); return changed(); }
      if (d.addAnd !== undefined) { prog.rungs[+d.addAnd].terms.push([{ t: "NO", tag: "" }]); return changed(); }
    });
    form.addEventListener("change", function (e) {
      var t = e.target, d = t.dataset, a;
      if (d.in !== undefined || d.out !== undefined) {
        var list = d.in !== undefined ? prog.inputs : prog.outputs, i = +(d.in !== undefined ? d.in : d.out), old = list[i].tag;
        var others = allNames(); others.splice(others.indexOf(old), 1);
        var nm = clean(t.value, old);
        if (others.indexOf(nm) >= 0) nm = uniqueTag(nm, others);
        list[i].tag = nm; renameEverywhere(old, nm); return changed();
      }
      if (d.ct !== undefined) { a = d.ct.split(",").map(Number); prog.rungs[a[0]].terms[a[1]][a[2]].t = t.value; return changed(false), void 0; }
      if (d.cg !== undefined) { a = d.cg.split(",").map(Number); prog.rungs[a[0]].terms[a[1]][a[2]].tag = t.value; return changed(); }
      if (d.ok !== undefined) {
        var r = prog.rungs[+d.ok], k = t.value;
        if (k === "ton") { var n = 1; var used = prog.rungs.map(function (x) { return x.out.inst; }); while (used.indexOf("T" + n) >= 0) n++; r.out = { k: "ton", inst: "T" + n, sec: 3 }; }
        else r.out = { k: k, tag: r.out.tag || (prog.outputs[0] ? prog.outputs[0].tag : "") };
        // contacts that used a timer bit which no longer exists are cleared
        var live = tagsFor(prog);
        prog.rungs.forEach(function (rr) { rr.terms.forEach(function (term) { term.forEach(function (x) { if (x.tag && live.indexOf(x.tag) < 0) x.tag = ""; }); }); });
        return changed();
      }
      if (d.oo !== undefined) { prog.rungs[+d.oo].out.tag = t.value; return changed(); }
      if (d.sec !== undefined) { var s = parseFloat(t.value); if (!(s >= 0.5)) s = 0.5; if (s > 60) s = 60; prog.rungs[+d.sec].out.sec = s; return changed(false); }
    });

    renderForm(); renderSim();
  }

  return { mount: mount, toCfg: toCfg, problems: problems, PRESETS: PRESETS };
})();
