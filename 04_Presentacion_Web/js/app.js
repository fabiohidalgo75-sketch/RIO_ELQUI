/*
  Del levantamiento a la alerta — interactividad
  Lee todos los datos desde window.ELQUI_DATA (datos/datos.js).
  Sin dependencias externas. Funciona abierto con doble clic (file://).
*/
(function () {
  "use strict";
  var D = window.ELQUI_DATA;
  if (!D) { console.error("No se cargó datos/datos.js"); return; }

  /* ── utilidades ── */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var NS = "http://www.w3.org/2000/svg";
  function el(t, a, p) { var n = document.createElementNS(NS, t); for (var k in a) n.setAttribute(k, a[k]); if (p) p.appendChild(n); return n; }
  function txt(p, x, y, s, a) {
    var o = { x: x, y: y, "font-size": 13, fill: "var(--muted)" };
    for (var k in (a || {})) o[k] = a[k];
    var t = el("text", o, p); t.textContent = s; return t;
  }
  function title(p, s) { var t = el("title", {}, p); t.textContent = s; return t; }
  function f(v, d) { if (d === undefined) d = 2; return v.toLocaleString("es-CL", { minimumFractionDigits: d, maximumFractionDigits: d }); }
  function clp(v) { return "$" + Math.round(v).toLocaleString("es-CL"); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var reduced = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  function anim(node, frames, opts) { if (!node || !node.animate || reduced.matches) return; try { node.animate(frames, opts); } catch (e) { /* sin animación */ } }
  var EASE = "cubic-bezier(0.23,1,0.32,1)";
  function fadeIn(node, instant) { if (instant) return; anim(node, [{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }], { duration: 180, easing: EASE }); }
  function flash(node) { anim(node, [{ backgroundColor: "var(--gcp-soft)" }, { backgroundColor: "transparent" }], { duration: 600, easing: "ease-out" }); }
  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* almacenamiento no disponible */ } }
  };

  /* Navegación con flechas en un grupo de botones (roving tabindex) */
  function roving(container, selector, onPick) {
    container.addEventListener("keydown", function (e) {
      var keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1, Home: "home", End: "end" };
      if (!(e.key in keys)) return;
      var items = $$(selector, container), i = items.indexOf(document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      var k = keys[e.key], n = k === "home" ? 0 : k === "end" ? items.length - 1 : (i + k + items.length) % items.length;
      onPick(n, true);
      items[n].focus();
    });
  }
  function setRoving(items, idx) { items.forEach(function (b, i) { b.setAttribute("aria-pressed", String(i === idx)); b.tabIndex = i === idx ? 0 : -1; }); }

  /* ── tema y modo sala ── */
  var root = document.documentElement;
  var TEMAS = ["sistema", "claro", "oscuro"], tema = store.get("elqui-tema") || "sistema";
  function applyTema() {
    if (tema === "claro") root.setAttribute("data-theme", "light");
    else if (tema === "oscuro") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    $("#btn-tema").textContent = "Tema: " + tema;
  }
  if (TEMAS.indexOf(tema) < 0) tema = "sistema";
  applyTema();
  $("#btn-tema").addEventListener("click", function () { tema = TEMAS[(TEMAS.indexOf(tema) + 1) % 3]; store.set("elqui-tema", tema); applyTema(); });
  function applySala(on) { root.classList.toggle("sala", on); $("#btn-pres").setAttribute("aria-pressed", String(on)); }
  applySala(store.get("elqui-sala") === "1");
  $("#btn-pres").addEventListener("click", function () { var on = !root.classList.contains("sala"); applySala(on); store.set("elqui-sala", on ? "1" : "0"); });

  /* Sección activa en la barra fija */
  var navLinks = $$(".nav a");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) {
          var on = a.getAttribute("href") === "#" + en.target.id;
          a.classList.toggle("active", on);
          if (on) { a.setAttribute("aria-current", "true"); } else { a.removeAttribute("aria-current"); }
        });
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    navLinks.forEach(function (a) { var s = $(a.getAttribute("href")); if (s) io.observe(s); });
  }

  /* ── portada ── */
  $("#kpis").innerHTML = D.kpis.map(function (k) { return "<div><b>" + esc(k.valor) + "</b><span>" + esc(k.rotulo) + "</span></div>"; }).join("");
  $("#meta").textContent = D.metadatos.join("  /  ");

  var PC = D.pc;
  (function drawHeroMap() {
    var s = $("#hero-map");
    var Emin = Math.min.apply(null, PC.map(function (p) { return p.E; })), Emax = Math.max.apply(null, PC.map(function (p) { return p.E; }));
    var Nmin = Math.min.apply(null, PC.map(function (p) { return p.N; }));
    var k = 540 / (Emax - Emin); // misma escala en E y N: px por metro
    var X = function (e) { return 50 + (e - Emin) * k; }, Y = function (n) { return 200 - (n - Nmin) * k; };
    // retícula UTM cada 500 m
    for (var e = 334000; e <= 335500; e += 500) {
      el("line", { x1: X(e), x2: X(e), y1: 24, y2: 222, stroke: "var(--line)", "stroke-width": 1 }, s);
      txt(s, X(e), 236, (e / 1000).toLocaleString("es-CL", { minimumFractionDigits: 1 }) + " km E", { "text-anchor": "middle", "font-size": 11.5 });
    }
    // orden de los puntos
    el("polyline", { points: PC.map(function (p) { return X(p.E) + "," + Y(p.N); }).join(" "), fill: "none", stroke: "var(--muted)", "stroke-width": 1.5, "stroke-dasharray": "5 5" }, s);
    PC.forEach(function (p, i) {
      var g = el("g", { transform: "translate(" + X(p.E) + "," + Y(p.N) + ")" }, s);
      title(g, p.id + ": E " + f(p.E, 1) + ", N " + f(p.N, 1) + ", H " + f(p.H, 3) + " m");
      el("rect", { x: -8, y: -2, width: 16, height: 4, fill: "var(--gcp)", transform: "rotate(45)" }, g);
      el("rect", { x: -8, y: -2, width: 16, height: 4, fill: "var(--gcp)", transform: "rotate(-45)" }, g);
      txt(g, 0, i % 2 ? 26 : -14, p.id, { "text-anchor": "middle", fill: "var(--ink)", "font-weight": 600 });
    });
    txt(s, X(PC[6].E), Y(PC[6].N) + 30, "aguas arriba", { "text-anchor": "end", "font-size": 12 });
    // norte y escala
    el("path", { d: "M606 70V36m-6 10 6-10 6 10", stroke: "var(--ink)", fill: "none", "stroke-width": 1.6 }, s);
    txt(s, 606, 28, "N", { "text-anchor": "middle", fill: "var(--ink)", "font-weight": 600 });
    var sb = 500 * k;
    el("rect", { x: 50, y: 40, width: sb / 2, height: 5, fill: "var(--ink)" }, s);
    el("rect", { x: 50 + sb / 2, y: 40, width: sb / 2, height: 5, fill: "var(--paper)", stroke: "var(--ink)" }, s);
    txt(s, 50, 34, "0", { "font-size": 11.5 }); txt(s, 50 + sb, 34, "500 m", { "text-anchor": "middle", "font-size": 11.5 });
    // franja del traspaso
    var y0 = 272, mid = 320;
    el("rect", { x: 30, y: y0, width: mid - 30, height: 10, fill: "var(--tit)" }, s);
    el("rect", { x: mid, y: y0, width: 610 - mid, height: 10, fill: "var(--inn)" }, s);
    txt(s, 30, y0 - 8, "Proyecto de Título: control, vuelo, MDT", { fill: "var(--ink)", "font-size": 12.5 });
    txt(s, 610, y0 - 8, "Innovación III: modelo, manzanas, alerta", { fill: "var(--ink)", "font-size": 12.5, "text-anchor": "end" });
    var gx = el("g", { transform: "translate(" + mid + "," + (y0 + 5) + ")" }, s);
    el("rect", { x: -14, y: -3.5, width: 28, height: 7, fill: "var(--gcp)", transform: "rotate(45)" }, gx);
    el("rect", { x: -14, y: -3.5, width: 28, height: 7, fill: "var(--gcp)", transform: "rotate(-45)" }, gx);
    txt(s, mid, y0 + 38, "MDT: punto de traspaso", { "text-anchor": "middle", fill: "var(--gcp-ink)", "font-weight": 600 });
  })();

  /* ── Parte 1: cadena ── */
  var ST = D.etapas, st = 2;
  (function buildPipe() {
    var h = "";
    ST.forEach(function (s, i) {
      h += '<button type="button" class="stage' + (s.h ? " handoff-stage" : "") + '" data-p="' + s.p + '" data-i="' + i + '" style="--i:' + i + '" aria-pressed="false">' +
        '<span class="num">' + (i + 1) + "</span><span class=\"who\">" + (s.p === "tit" ? "Proyecto de Título" : "Innovación III") + "</span><b>" + esc(s.n) + "</b><small>" + esc(s.s) + '</small><span class="bar" aria-hidden="true"></span></button>';
      if (i === 2) h += '<div class="seam" aria-hidden="true"><span class="x"></span><svg viewBox="0 0 14 60" preserveAspectRatio="none"><path d="M7 0 L12 7.5 L2 15 L12 22.5 L2 30 L12 37.5 L2 45 L12 52.5 L7 60" fill="none" stroke="var(--bad)" stroke-width="2"/></svg><span>lecho sumergido</span></div>';
    });
    $("#pipe").innerHTML = h;
    $("#pipe").classList.add("anim");
  })();
  var stageBtns = $$("#pipe .stage");
  function detailHTML(s, i, tag) {
    return "<" + tag + ">" + (i + 1) + ". " + esc(s.n) + "</" + tag + ">" +
      "<div><h4>Recibe</h4><ul>" + s.in.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>" +
      "<div><h4>Entrega</h4><ul>" + s.out.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" +
      (s.gap ? '<p class="gapnote"><b>Brecha:</b> ' + esc(s.gap) + "</p>" : "") + "</div>" +
      '<div><h4>Fuente</h4><p style="margin-top:4px;font-size:15.5px">' + esc(s.src) + "</p></div>";
  }
  function selectStage(i, instant) {
    st = i; setRoving(stageBtns, st);
    var d = $("#sdetail"); d.innerHTML = detailHTML(ST[st], st, "h3"); fadeIn(d, instant);
  }
  stageBtns.forEach(function (b) { b.addEventListener("click", function () { selectStage(+b.dataset.i, false); }); });
  roving($("#pipe"), ".stage", function (n) { selectStage(n, true); });
  selectStage(st, true);
  $("#print-stages").innerHTML = ST.map(function (s, i) { return '<div class="sdetail">' + detailHTML(s, i, "h3") + "</div>"; }).join("");

  /* ── Parte 2: matriz de encaje ── */
  var FIT = D.encaje, ff = "all";
  var FC = { Confirma: "c-ok", Precisa: "c-prec", Tensiona: "c-bad" };
  var VERB = { Confirma: ["confirma", "confirman"], Precisa: ["precisa", "precisan"], Tensiona: ["tensiona", "tensionan"] };
  function cnt(k) { return FIT.filter(function (r) { return r[0] === k; }).length; }
  (function buildFitFilter() {
    var h = '<button type="button" data-f="all" aria-pressed="true"><b>' + FIT.length + "</b>Todos</button>";
    D.ordenEncaje.forEach(function (k) { var c = cnt(k); h += '<button type="button" data-f="' + k + '" aria-pressed="false"><b>' + c + "</b>" + VERB[k][c === 1 ? 0 : 1] + "</button>"; });
    $("#fit-f").innerHTML = h;
    $$("#fit-f button").forEach(function (b) { b.addEventListener("click", function () { ff = (ff === b.dataset.f && ff !== "all") ? "all" : b.dataset.f; drawFit(true); }); });
  })();
  var fitSorted = FIT.map(function (r, i) { return { r: r, i: i }; }).sort(function (a, b) {
    return (D.ordenEncaje.indexOf(a.r[0]) - D.ordenEncaje.indexOf(b.r[0])) || (a.i - b.i);
  });
  function drawFit(animate) {
    var rows = fitSorted.filter(function (o) { return ff === "all" || o.r[0] === ff; });
    $("#fit-body").innerHTML = rows.map(function (o) {
      var r = o.r;
      return '<div class="fit-row" role="row" data-s="' + r[0] + '">' +
        '<div role="cell"><span class="chip ' + FC[r[0]] + '">' + r[0] + "</span></div>" +
        '<div role="cell" data-label="Innovación III dice">' + esc(r[1]) + "</div>" +
        '<div role="cell" data-label="El Título muestra">' + esc(r[2]) + "</div>" +
        '<div role="cell" class="todo" data-label="Qué hacer">' + esc(r[3]) + "</div></div>";
    }).join("");
    $$("#fit-f button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.f === ff)); });
    $("#fit-f").classList.toggle("filtered", ff !== "all");
    $("#fit-count").textContent = "Mostrando " + rows.length + " de " + FIT.length + " filas" + (ff === "all" ? ", ordenadas: tensiona, precisa, confirma." : ".");
    if (animate) $$("#fit-body .fit-row").forEach(function (n, i) {
      anim(n, [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 220, delay: Math.min(i, 6) * 35, easing: EASE, fill: "backwards" });
    });
  }
  drawFit(false);

  /* ── Clave 1: alturas ── */
  var cur = 0;
  $("#pc-sel").innerHTML = PC.map(function (p, i) { return '<button type="button" data-i="' + i + '" aria-pressed="' + (i === 0) + '">' + p.id + "</button>"; }).join("");
  var pcBtns = $$("#pc-sel button");
  function selectPC(i, focusProfile) {
    cur = i; setRoving(pcBtns, cur); drawHeights(); drawProfile();
    if (focusProfile) { var g = $('#profile g[data-i="' + i + '"]'); if (g) g.focus(); }
  }
  pcBtns.forEach(function (b) { b.addEventListener("click", function () { selectPC(+b.dataset.i); }); });
  roving($("#pc-sel"), "button", function (n) { selectPC(n); });
  function drawHeights() {
    var s = $("#heights"), p = PC[cur]; s.innerHTML = "";
    var base = 232, Y = function (v) { return base - v * 0.32; };
    el("path", { d: "M30 " + base + " Q320 " + (base + 6) + " 610 " + base, stroke: "var(--geo)", "stroke-width": 2.5, fill: "none" }, s);
    txt(s, 34, base + 22, "Elipsoide WGS 84 (h = 0)", { fill: "var(--ink)" });
    var gy = Y(p.und * 2.2);
    el("path", { d: "M30 " + (gy + 6) + " C 200 " + (gy - 10) + ", 420 " + (gy + 14) + ", 610 " + (gy - 2), stroke: "var(--ok)", "stroke-width": 2.5, "stroke-dasharray": "7 4", fill: "none" }, s);
    txt(s, 34, gy - 8, "Geoide EGM2008 (≈ nivel medio del mar)", { fill: "var(--ink)" });
    var ty = 46;
    el("path", { d: "M30 " + (ty + 30) + " L180 " + (ty + 18) + " L260 " + (ty + 6) + " L330 " + ty + " L420 " + (ty + 10) + " L610 " + (ty + 26) + " L610 26 L30 26 Z", fill: "color-mix(in oklab, var(--terrain) 22%, transparent)", stroke: "none" }, s);
    el("path", { d: "M30 " + (ty + 30) + " L180 " + (ty + 18) + " L260 " + (ty + 6) + " L330 " + ty + " L420 " + (ty + 10) + " L610 " + (ty + 26), stroke: "var(--terrain)", "stroke-width": 2.5, fill: "none" }, s);
    txt(s, 460, ty + 46, "Terreno", { fill: "var(--ink)" });
    txt(s, 610, 18, "Esquema, no a escala", { "text-anchor": "end", "font-size": 12 });
    var px = 330, g = el("g", { transform: "translate(" + px + "," + ty + ")" }, s);
    el("rect", { x: -8, y: -2, width: 16, height: 4, fill: "var(--gcp)", transform: "rotate(45)" }, g);
    el("rect", { x: -8, y: -2, width: 16, height: 4, fill: "var(--gcp)", transform: "rotate(-45)" }, g);
    txt(s, px + 14, ty - 8, p.id, { fill: "var(--ink)", "font-weight": 600, "font-size": 14 });
    var geoAt = gy + 2;
    function arrow(x, y1, y2, c, l1, l2) {
      el("line", { x1: x, x2: x, y1: y1, y2: y2, stroke: c, "stroke-width": 2 }, s);
      el("path", { d: "M" + (x - 4) + " " + (y1 + 7) + " L" + x + " " + y1 + " L" + (x + 4) + " " + (y1 + 7), stroke: c, fill: "none", "stroke-width": 2 }, s);
      el("path", { d: "M" + (x - 4) + " " + (y2 - 7) + " L" + x + " " + y2 + " L" + (x + 4) + " " + (y2 - 7), stroke: c, fill: "none", "stroke-width": 2 }, s);
      txt(s, x + 8, (y1 + y2) / 2, l1, { fill: "var(--ink)", "font-weight": 600, "font-size": 14 });
      txt(s, x + 8, (y1 + y2) / 2 + 16, l2);
    }
    arrow(px - 120, ty + 4, base, "var(--geo)", "h = " + f(p.h, 3) + " m", "elipsoidal (GNSS)");
    arrow(px + 60, ty + 4, geoAt, "var(--ink)", "H = " + f(p.H, 3) + " m", "ortométrica");
    arrow(px + 230, geoAt + 2, base, "var(--ok)", "N = " + f(p.und, 3) + " m", "ondulación");
    $("#pc-stats").innerHTML = "<div><b>" + f(p.E, 1) + "</b><span>Este (m)</span></div><div><b>" + f(p.N, 1) + "</b><span>Norte (m)</span></div>" +
      "<div><b>" + f(p.h, 3) + "<small>− " + f(p.und, 3) + "</small></b><span>h − N</span></div><div><b>" + f(p.H, 3) + " m</b><span>H, σU " + f(p.su * 100, 1) + " cm</span></div>";
  }
  function drawProfile() {
    var s = $("#profile"); s.innerHTML = "";
    var E0 = 333900, E1 = 335720, H0 = 592, H1 = 622;
    var X = function (e) { return 60 + (e - E0) / (E1 - E0) * 556; }, Y = function (h) { return 185 - (h - H0) / (H1 - H0) * 150; };
    for (var h = 595; h <= 620; h += 5) { el("line", { x1: 60, x2: 616, y1: Y(h), y2: Y(h), stroke: "var(--line)" }, s); txt(s, 52, Y(h) + 4, String(h), { "text-anchor": "end" }); }
    for (var e = 334000; e <= 335500; e += 500) { el("line", { x1: X(e), x2: X(e), y1: 185, y2: 191, stroke: "var(--muted)" }, s); txt(s, X(e), 206, e.toLocaleString("es-CL"), { "text-anchor": "middle", "font-size": 12 }); }
    el("line", { x1: 60, x2: 616, y1: 185, y2: 185, stroke: "var(--muted)" }, s);
    var d = ""; PC.forEach(function (p, i) { d += (i ? " L" : "M") + X(p.E) + " " + Y(p.H); });
    el("path", { d: d, stroke: "var(--terrain)", "stroke-width": 2.5, fill: "none" }, s);
    PC.forEach(function (p, i) {
      var on = i === cur;
      var g = el("g", { transform: "translate(" + X(p.E) + "," + Y(p.H) + ")", tabindex: "0", role: "button", "data-i": i, "aria-pressed": String(on), "aria-label": p.id + ", H " + f(p.H, 3) + " m" }, s);
      title(g, p.id + ": H " + f(p.H, 3) + " m, Este " + f(p.E, 1) + " m, σU " + f(p.su * 100, 1) + " cm");
      el("circle", { r: 16, class: "hit" }, g);
      el("circle", { r: on ? 7.5 : 5, fill: on ? "var(--gcp)" : "var(--paper)", stroke: "var(--gcp)", "stroke-width": 2, class: "ring" }, g);
      txt(g, 0, -13, p.id, { "text-anchor": "middle", fill: on ? "var(--ink)" : "var(--muted)", "font-weight": on ? 700 : 400 });
      g.addEventListener("click", function () { selectPC(i); });
      g.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); selectPC(i, true); }
        else if (ev.key === "ArrowRight" || ev.key === "ArrowLeft") { ev.preventDefault(); selectPC((i + (ev.key === "ArrowRight" ? 1 : -1) + PC.length) % PC.length, true); }
      });
    });
    txt(s, 616, 224, "Este UTM (m), aguas arriba hacia la derecha", { "text-anchor": "end", "font-size": 12 });
    txt(s, 60, 20, "H (m)");
  }
  drawHeights(); drawProfile();

  /* ── Clave 2: GNSS ── */
  $("#gnss-tbody").innerHTML = PC.map(function (p) {
    return '<tr><td class="mono">Base → ' + p.id + '</td><td class="n">' + f(p.len, 1) + '</td><td class="n">' + p.dur + '</td><td class="n">' + p.sat + '</td><td class="n">' + f(p.pdop, 3) + '</td><td class="n">' + f(p.rms, 3) + '</td><td><span class="chip c-ok">Ajustado</span></td></tr>';
  }).join("");
  var metric = "pdop", gBtns = $$("#gnss-sel button");
  gBtns.forEach(function (b) { b.addEventListener("click", function () { metric = b.dataset.m; setRoving(gBtns, gBtns.indexOf(b)); drawGnss(true); }); });
  setRoving(gBtns, 0);
  roving($("#gnss-sel"), "button", function (n) { metric = gBtns[n].dataset.m; setRoving(gBtns, n); drawGnss(false); });
  function drawGnss(animate) {
    var s = $("#gnss"); s.innerHTML = "";
    if (metric === "len") {
      var X = function (l) { return 64 + l / 1000 * 540; }, Y = function (m) { return 220 - (m - 9) / (15 - 9) * 190; };
      for (var m = 10; m <= 14; m += 2) { el("line", { x1: 64, x2: 610, y1: Y(m), y2: Y(m), stroke: "var(--line)" }, s); txt(s, 58, Y(m) + 4, m + " min", { "text-anchor": "end" }); }
      for (var l = 0; l <= 1000; l += 250) txt(s, X(l), 244, l + " m", { "text-anchor": "middle" });
      el("rect", { x: X(0), y: Y(15), width: X(900) - X(0), height: Y(10) - Y(15), fill: "color-mix(in oklab, var(--ok) 10%, transparent)" }, s);
      txt(s, X(900) - 6, Y(14.6), "vectores < 900 m, sesión ≥ 10 min, doble frecuencia", { "text-anchor": "end", fill: "var(--ink)" });
      PC.forEach(function (p) {
        var a = p.dur.split(":").map(Number), mm = a[0] + a[1] / 60;
        var c = el("circle", { cx: X(p.len), cy: Y(mm), r: 6.5, fill: "var(--tit)" }, s);
        title(c, p.id + ": " + f(p.len, 1) + " m, " + p.dur + " min");
        txt(s, X(p.len) + 10, Y(mm) + 4, p.id, { fill: "var(--ink)" });
      });
      $("#gnss-note").textContent = D.gnssNotas.len;
      return;
    }
    var M = {
      pdop: { v: function (p) { return p.pdop; }, max: 3.5, th: 3, lab: "límite PDOP ≤ 3", u: "", dec: 2 },
      rms: { v: function (p) { return p.rms * 100; }, max: 2.5, th: 2, lab: "tolerancia ETT-DOH 2 cm", u: " cm", dec: 1 },
      sat: { v: function (p) { return p.sat; }, max: 20, th: 8, lab: "mínimo 8 satélites", u: "", dec: 0 }
    }[metric];
    var Xb = function (i) { return 74 + i * 78; }, Yb = function (v) { return 220 - v / M.max * 190; };
    for (var k = 0; k <= 4; k++) { var v = M.max * k / 4; el("line", { x1: 64, x2: 620, y1: Yb(v), y2: Yb(v), stroke: "var(--line)" }, s); txt(s, 58, Yb(v) + 4, metric === "sat" ? String(Math.round(v)) : f(v, 1), { "text-anchor": "end" }); }
    PC.forEach(function (p, i) {
      var v = M.v(p);
      var r = el("rect", { x: Xb(i) + 12, y: Yb(v), width: 38, height: 220 - Yb(v), fill: "var(--tit)", style: "transform-box:fill-box;transform-origin:50% 100%" }, s);
      title(r, "Base → " + p.id + ": " + (M.dec ? f(v, M.dec) : v) + M.u + " (umbral " + M.lab + ")");
      txt(s, Xb(i) + 31, Yb(v) - 7, (M.dec ? f(v, M.dec) : String(v)) + M.u, { "text-anchor": "middle", fill: "var(--ink)", "font-weight": 600 });
      txt(s, Xb(i) + 31, 244, p.id, { "text-anchor": "middle" });
      if (animate) anim(r, [{ transform: "scaleY(0.02)" }, { transform: "scaleY(1)" }], { duration: 260, delay: i * 25, easing: EASE, fill: "backwards" });
    });
    el("line", { x1: 64, x2: 620, y1: Yb(M.th), y2: Yb(M.th), stroke: "var(--ink)", "stroke-width": 1.5, "stroke-dasharray": "5 4", opacity: .7 }, s);
    txt(s, 616, Yb(M.th) - 7, M.lab, { "text-anchor": "end", fill: "var(--ink)", "font-weight": 600 });
    $("#gnss-note").textContent = D.gnssNotas[metric];
  }
  drawGnss(false);

  /* ── Clave 3: vuelo ── */
  var V = D.vuelo;
  var calib = (function () { var sp = V.pxAncho * V.planGsdM * (1 - V.planTraslape); return { k: V.planDistM / (V.areaM2 / sp), speed: V.planDistM / (V.planMin * 60) }; })();
  function flight() {
    var H = +$("#fh").value, fo = +$("#ff").value / 100, so = +$("#fs").value / 100;
    $("#fh-v").textContent = H + " m"; $("#ff-v").textContent = Math.round(fo * 100) + " %"; $("#fs-v").textContent = Math.round(so * 100) + " %";
    var gsd = V.sensorMm * H / (V.focalMm * V.pxAncho); // m/px
    var spacing = V.pxAncho * gsd * (1 - so), lines = V.areaM2 / spacing, dist = calib.k * lines, interval = V.pxAlto * gsd * (1 - fo);
    var photos = Math.round(lines / interval), min = dist / calib.speed / 60, batt = Math.ceil(min / V.minPorBateria);
    $("#flight-stats").innerHTML = "<div><b>" + f(gsd * 100, 2) + " cm</b><span>GSD por píxel</span></div><div><b>" + f(dist / 1000, 1) + " km</b><span>distancia de vuelo</span></div>" +
      "<div><b>" + photos.toLocaleString("es-CL") + "</b><span>fotos aprox.</span></div><div><b>" + Math.round(min) + " min</b><span>tiempo, " + batt + " batería" + (batt === 1 ? "" : "s") + "</span></div>";
    var ck = [[gsd * 100 <= 3.0, "GSD ≤ 3,0 cm (escala 1:500)"], [fo >= 0.8, "Frontal ≥ 80 % (DOH)"], [so >= 0.4, "Lateral ≥ 40 % (DOH)"], [batt <= V.baterias, "Cabe en 3 baterías"]];
    $("#flight-checks").innerHTML = ck.map(function (c) { return '<span class="chip ' + (c[0] ? "c-ok" : "c-bad") + '">' + c[1] + (c[0] ? "" : ": no cumple") + "</span>"; }).join("");
    var s = $("#overlap"); s.innerHTML = "";
    var w = 130 * (H / 110), h = w * V.pxAlto / V.pxAncho, stepX = w * (1 - fo), stepY = h * (1 - so);
    txt(s, 10, 18, "Huellas de 3 fotos por línea, 2 líneas de vuelo (vista en planta)");
    for (var r = 0; r < 2; r++) for (var c = 0; c < 3; c++) {
      el("rect", { x: 40 + c * stepX, y: 32 + r * stepY, width: w, height: h, fill: r ? "color-mix(in oklab, var(--inn) 14%, transparent)" : "color-mix(in oklab, var(--tit) 16%, transparent)", stroke: r ? "var(--inn)" : "var(--tit)", "stroke-width": 1.5 }, s);
    }
    var xe = 40 + 2 * stepX + w + 10;
    el("line", { x1: 30, x2: xe, y1: 32 + h / 2, y2: 32 + h / 2, stroke: "var(--tit)", "stroke-dasharray": "4 4" }, s);
    txt(s, xe + 6, 32 + h / 2 + 4, "línea 1", { fill: "var(--ink)" });
    el("line", { x1: 30, x2: xe, y1: 32 + stepY + h / 2, y2: 32 + stepY + h / 2, stroke: "var(--inn)", "stroke-dasharray": "4 4" }, s);
    txt(s, xe + 6, 32 + stepY + h / 2 + 4, "línea 2", { fill: "var(--ink)" });
  }
  ["#fh", "#ff", "#fs"].forEach(function (i) { $(i).addEventListener("input", flight); });
  flight();

  /* ── Clave 4: control de calidad y riesgos ── */
  var QC = D.qc, QL = { ok: "Cumple", warn: "Condicionado", bad: "No cumple" }, qf = "all";
  function qcount(k) { return QC.filter(function (q) { return q[0] === k; }).length; }
  $("#qc-f").innerHTML = '<button type="button" data-f="all" aria-pressed="true">Todos ' + QC.length + "</button>" +
    ["ok", "warn", "bad"].map(function (k) { return '<button type="button" data-f="' + k + '" aria-pressed="false">' + QL[k] + " " + qcount(k) + "</button>"; }).join("");
  var qBtns = $$("#qc-f button");
  function drawQc() {
    $("#qc").innerHTML = QC.filter(function (q) { return qf === "all" || q[0] === qf; }).map(function (q) {
      return '<div class="qc-row" data-s="' + q[0] + '"><span><b>' + esc(q[1]) + "</b><small>" + esc(q[2]) + '</small></span><span class="chip c-' + q[0] + '">' + QL[q[0]] + "</span></div>";
    }).join("");
    qBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.f === qf)); });
  }
  qBtns.forEach(function (b) { b.addEventListener("click", function () { qf = b.dataset.f; drawQc(); }); });
  drawQc();

  var RISK = D.riesgos, ri = 0;
  function lvClass(lv) { return lv === "Alto" ? "c-bad" : lv === "Medio-alto" ? "c-warn" : "c-neutral"; }
  $("#risk").innerHTML = RISK.map(function (r, i) {
    return '<button type="button" data-i="' + i + '" aria-pressed="false"><b>' + esc(r.t) + '</b><span class="chips"><span class="chip ' + lvClass(r.lv) + '">Impacto ' + r.lv.toLowerCase() + '</span><span class="chip c-neutral">' + esc(r.st) + "</span></span></button>";
  }).join("");
  var rBtns = $$("#risk button");
  function selectRisk(i, instant) {
    ri = i; setRoving(rBtns, ri);
    var r = RISK[ri], d = $("#risk-d");
    d.innerHTML = "<p><b>Causa:</b> " + esc(r.c) + "</p><p><b>Impacto:</b> " + esc(r.i) + "</p><p><b>Medida:</b> " + esc(r.m) + "</p>";
    fadeIn(d, instant);
  }
  rBtns.forEach(function (b) { b.addEventListener("click", function () { selectRisk(+b.dataset.i, false); }); });
  roving($("#risk"), "button", function (n) { selectRisk(n, true); });
  selectRisk(0, true);

  /* ── Clave 5: presupuesto ── */
  var IN = D.presupuesto;
  (function buildInputs() {
    var h = "", inDetails = false;
    function inp(r) {
      return '<label class="inp" for="b-' + r[0] + '" data-src="' + r[3] + '"><span>' + esc(r[1]) + ' <span class="badge ' + (r[3] === "s" ? "b-src" : "b-ex") + '">' + (r[3] === "s" ? "FUENTE" : "EJEMPLO") + "</span></span>" +
        '<span class="field"><input id="b-' + r[0] + '" name="' + r[0] + '" type="number" min="0" step="any" inputmode="decimal" autocomplete="off" value="' + r[2] + '"><i>' + esc(r[4]) + "</i></span></label>";
    }
    IN.forEach(function (r) {
      if (r[0] === "g") {
        if (inDetails) { h += "</div></details>"; inDetails = false; }
        if (/estación total/i.test(r[1])) { h += "<details open><summary>" + esc(r[1]) + "</summary><div>"; inDetails = true; }
        else h += '<div class="group">' + esc(r[1]) + "</div>";
      } else h += inp(r);
    });
    if (inDetails) h += "</div></details>";
    $("#b-inputs").innerHTML = h;
  })();
  $("#b-inputs").addEventListener("submit", function (e) { e.preventDefault(); });
  function v(id) { return Math.max(0, +$("#b-" + id).value || 0); }
  var TOT = 0, HA = V.areaM2 / 1e4;
  function budget() {
    var rrhh = v("vh_geo") * v("h_geo") + v("vh_dib") * v("h_dib") + v("vh_ala") * v("h_ala");
    var inst = (v("uav") + v("gnss")) * v("dias");
    var trans = v("km") * 2 / Math.max(1, v("rend")) * v("comb") * v("dias");
    var col = v("pers") * v("col") * v("dias");
    var sub = rrhh + inst + trans + col, imp = sub * v("imp") / 100, tot = sub + imp;
    TOT = tot;
    var rows = [["Recursos humanos (honorarios brutos)", rrhh], ["Instrumental", inst], ["Combustible (ida y vuelta)", trans], ["Colaciones", col], ["Imprevistos " + f(v("imp"), 0) + " %", imp]];
    $("#b-table").innerHTML = rows.map(function (r) {
      var pct = tot > 0 ? r[1] / tot * 100 : 0;
      return "<tr><td>" + r[0] + '<span class="pbar" aria-hidden="true"><i style="width:' + pct.toFixed(1) + '%"></i></span></td><td class="n">' + clp(r[1]) + '</td><td class="n">' + f(pct, 1) + " %</td></tr>";
    }).join("");
    $("#b-total").textContent = clp(tot);
    $("#b-net").textContent = "De los honorarios, " + clp(rrhh * v("ret") / 100) + " se retienen para el SII (" + f(v("ret"), 2) + " %) y el equipo recibe " + clp(rrhh * (1 - v("ret") / 100)) + " líquido.";
    // Estación total: mismas horas de gabinete; terreno según rendimiento
    var dET = Math.ceil(HA / Math.max(0.1, v("rendET")));
    var fieldDay = (v("vh_geo") + v("vh_ala")) * 8;
    var rrhhET = v("vh_geo") * Math.max(0, v("h_geo") - 8 * v("dias")) + v("vh_dib") * v("h_dib") + fieldDay * dET;
    var totET = (rrhhET + (v("et") + v("gnss")) * dET + v("km") * 2 / Math.max(1, v("rend")) * v("comb") * dET + v("pers") * v("col") * dET) * (1 + v("imp") / 100);
    drawCompare([["UAV-PPK", tot, v("dias"), "var(--tit)"], ["Estación total", totET, dET, "var(--geo)"]]);
    var ratio = tot > 0 ? totET / tot : 0;
    $("#cmp-x").textContent = tot > 0 ? f(ratio, 1) + " ×" : "—";
    $("#cmp-x-l").textContent = tot > 0 ? "más cara la estación total: " + dET + " días de terreno frente a " + v("dias") : "Ingresa valores mayores que cero para comparar.";
    $("#compare-note").innerHTML = "Con estos supuestos, la estación total necesita <b>" + dET + " días</b> de terreno para " + f(HA, 0) + " ha y cuesta <b>" + f(ratio, 1) + " veces</b> más. Además entrega puntos discretos, sin ortomosaico ni modelo continuo. Esto respalda en cifras la decisión del Cap. 2; cambia el rendimiento para ver qué tan sensible es.";
    perPerson();
  }
  function drawCompare(d) {
    var s = $("#compare"); s.innerHTML = "";
    var mx = Math.max(1, Math.max.apply(null, d.map(function (x) { return x[1]; })));
    d.forEach(function (r, i) {
      var y = 26 + i * 70, w = Math.max(4, r[1] / mx * 300);
      txt(s, 10, y + 21, r[0], { fill: "var(--ink)", "font-weight": 600, "font-size": 14 });
      var b = el("rect", { x: 140, y: y, width: w, height: 32, fill: r[3] }, s);
      title(b, r[0] + ": " + clp(r[1]) + ", " + r[2] + " día" + (r[2] === 1 ? "" : "s"));
      txt(s, 140 + w + 10, y + 21, clp(r[1]) + ", " + r[2] + " día" + (r[2] === 1 ? "" : "s"), { fill: "var(--ink)", "font-size": 13.5 });
    });
  }

  /* Costo por persona expuesta */
  var P = D.personas;
  $("#pp").min = P.min; $("#pp").max = P.max; $("#pp").step = P.paso; $("#pp").value = P.defecto;
  $("#uf").value = D.ufReferencial;
  function perPerson() {
    var p = +$("#pp").value, uf = Math.max(1, +$("#uf").value || D.ufReferencial);
    $("#pp-v").textContent = p.toLocaleString("es-CL"); $("#pp-n").textContent = p.toLocaleString("es-CL");
    $("#ppc").textContent = clp(TOT / p);
    $("#pp-uf").textContent = (TOT / p / uf).toLocaleString("es-CL", { maximumFractionDigits: 3 }) + " UF";
    var pc = $("#prop-cost"); if (pc) pc.textContent = clp(TOT) + " (levantamiento)";
  }
  $("#alt-body").innerHTML = D.alternativas.map(function (a) {
    return "<tr><td>" + esc(a.n) + "</td><td>" + esc(a.costo) + '</td><td><span class="chip ' + (a.r === "parcial" ? "c-warn" : "c-neutral c-no") + '">' + esc(a.t) + "</span></td></tr>";
  }).join("") + '<tr class="prop"><td><b>' + esc(D.propuesta.n) + '</b></td><td class="n" id="prop-cost" style="text-align:left"></td><td><span class="chip c-ok">' + esc(D.propuesta.t) + "</span></td></tr>";
  $("#pp").addEventListener("input", perPerson);
  $("#uf").addEventListener("input", perPerson);
  $("#b-inputs").addEventListener("input", budget);
  $("#b-inputs").addEventListener("change", function () { flash($("#b-total")); flash($("#ppc")); flash($("#cmp-x")); });
  $("#b-reset").addEventListener("click", function () {
    IN.forEach(function (r) { if (r[0] !== "g") $("#b-" + r[0]).value = r[2]; });
    budget(); flash($("#b-total"));
  });
  budget();
  if (Math.round(TOT) !== D.totalEsperado) console.warn("El total por defecto (" + Math.round(TOT) + ") no coincide con el esperado (" + D.totalEsperado + ").");

  /* ── Síntesis ── */
  var mr = "";
  ST.forEach(function (s, i) { mr += '<i class="' + s.p + '"></i>'; if (i === 2) mr += '<span class="x"></span>'; });
  $("#mini-rail").innerHTML = mr;
  $("#mini-rail").insertAdjacentHTML("afterend", '<div class="mini-rail-l"><span>Título: terreno medido</span><span>MDT</span><span>Innovación III: aviso por manzana</span></div>');
  $("#sin-encaja").innerHTML = D.sintesis.encaja.map(function (x) { return "<li><b>" + esc(x[0]) + "</b> " + esc(x[1]) + "</li>"; }).join("");
  $("#sin-pend").innerHTML = D.sintesis.pendientes.map(function (x) {
    return '<li><label for="chk-' + x.id + '"><input type="checkbox" id="chk-' + x.id + '"' + (store.get("elqui-chk-" + x.id) === "1" ? " checked" : "") + "><span><b>" + esc(x.titulo) + "</b> " + esc(x.texto) + ' <a href="' + x.ir + '">Ver en la página</a></span></label></li>';
  }).join("");
  $$("#sin-pend input").forEach(function (c) { c.addEventListener("change", function () { store.set("elqui-" + c.id, c.checked ? "1" : "0"); }); });

  /* ── Fuentes y enlaces ── */
  $("#fuentes-list").innerHTML = D.fuentes.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("");
  $("#enlaces").innerHTML = D.enlaces.map(function (x) { return '<a href="' + esc(x.href) + '">' + esc(x.t) + "</a>"; }).join("");

  /* ── Impresión: mostrar todo, sin filtros ── */
  var saved = null;
  window.addEventListener("beforeprint", function () { saved = { ff: ff, qf: qf }; ff = "all"; qf = "all"; drawFit(false); drawQc(); });
  window.addEventListener("afterprint", function () { if (!saved) return; ff = saved.ff; qf = saved.qf; drawFit(false); drawQc(); saved = null; });
})();
