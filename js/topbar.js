/*
 *  club-QuickBox skin for ruTorrent -- topbar module.
 *
 *  Loaded by init.js once theWebUI is ready. Runs in global scope with
 *  theWebUI, theConverter, setThemeHint, RGBackground, jQuery ($, $$) and
 *  window.cqb available. The leading semicolon keeps the file safe if it is
 *  ever concatenated after another.
 *
 *  Restructures the core #t toolbar into a v4-style app bar: a tinted brand
 *  mark, a filled primary Add action, grouped icon buttons, a single search
 *  field with a keyboard hint, a live speed widget, the variant palette, and
 *  the account controls pinned right. Every core element id and handler is
 *  moved, never cloned or replaced, so the wired onclick handlers survive.
 */
;(function (cqb) {
	"use strict";
	if (!cqb) return;
	if (window.cqbTopbarInit) return;

	var tb = document.getElementById("t");
	var nav = tb && tb.querySelector(".navbar-nav");
	var rc = document.getElementById("rc");
	if (!tb || !nav || !rc) return;
	window.cqbTopbarInit = true;

	var VKEY = "qb-rutorrent-variant";
	var VARIANTS = ["spectre", "smoked", "reel", "defaulted"];
	var LABELS = {
		mnu_add: "Add torrent", mnu_remove: "Remove", mnu_start: "Start",
		mnu_pause: "Pause", mnu_stop: "Stop", mnu_settings: "Settings",
		mnu_help: "Help", mnu_logoff: "Log off", mnu_create: "Create torrent",
		mnu_rss: "RSS", mnu_plugins: "Plugins"
	};

	function el(tag, cls) {
		var e = document.createElement(tag);
		if (cls) e.className = cls;
		return e;
	}
	function byId(id) { return document.getElementById(id); }
	function mark(e) { if (e) e.setAttribute("data-cqb-placed", "1"); }

	/* ============================================================
	 * cqb.setVariant -- apply a variant override the way init.js does.
	 * Defined here only when init.js has not already exposed it, so the
	 * palette can switch themes. Mirrors the init.js resolve + apply.
	 * ============================================================ */
	function cssVar(n) {
		return getComputedStyle(document.documentElement).getPropertyValue(n).trim();
	}
	function cookieVariant() {
		var m = document.cookie.match(/(?:^|;\s*)qb_theme=([^;]*)/);
		var theme = m ? decodeURIComponent(m[1]) : "";
		return VARIANTS.indexOf(theme) !== -1 ? theme : "spectre";
	}
	function repaintMeters() {
		if (typeof RGBackground !== "function") return;
		var prgStart = cssVar("--qb-prg-start"), prgEnd = cssVar("--qb-prg-end");
		var ok = cssVar("--qb-primary"), danger = cssVar("--qb-destructive");
		if (window.theWebUI && theWebUI.tables) {
			for (var k in theWebUI.tables) {
				var obj = theWebUI.tables[k] && theWebUI.tables[k].obj;
				if (obj) { obj.prgStartColor = new RGBackground(prgStart); obj.prgEndColor = new RGBackground(prgEnd); }
			}
		}
		if (window.thePlugins) {
			["diskapceh", "diskspace", "quotaspace", "cpuload"].forEach(function (n) {
				var p = thePlugins.get(n);
				if (p && p.enabled) { p.prgStartColor = new RGBackground(ok); p.prgEndColor = new RGBackground(danger); }
			});
		}
	}
	if (typeof cqb.setVariant !== "function") {
		cqb.setVariant = function (override) {
			try {
				if (override === "auto") window.localStorage.removeItem(VKEY);
				else window.localStorage.setItem(VKEY, override);
			} catch (e) { /* storage unavailable: session-only apply */ }
			var variant = override === "auto" ? cookieVariant() : override;
			var dark = variant !== "defaulted";
			var root = document.documentElement;
			root.setAttribute("data-qb-variant", variant);
			root.setAttribute("data-bs-theme", dark ? "dark" : "light");
			root.style.colorScheme = dark ? "dark" : "light";
			root.style.accentColor = cssVar("--qb-primary");
			if (typeof setThemeHint === "function") { try { setThemeHint(dark); } catch (e) {} }
			try { repaintMeters(); } catch (e) {}
		};
	}
	function currentOverride() {
		try {
			var v = window.localStorage.getItem(VKEY);
			return VARIANTS.indexOf(v) !== -1 ? v : "auto";
		} catch (e) { return "auto"; }
	}

	/* ============================================================
	 * Tooltips -- styled, never native title=.
	 * ============================================================ */
	function decorate(node) {
		if (!node) return;
		var a = (node.matches && node.matches("a")) ? node : node.querySelector("a");
		var host = a || node;
		var txt = host.getAttribute("title") || LABELS[host.id] || "";
		if (txt) cqb.tooltip(host, txt.replace(/\.\.\.$/, "").trim());
	}

	/* ============================================================
	 * Containers.
	 * ============================================================ */
	var brand = el("div", "cqb-brand");
	var markEl = el("span", "cqb-brand-mark");
	var word = el("span", "cqb-brand-word");
	word.textContent = "ruTorrent";
	brand.appendChild(markEl);
	brand.appendChild(word);

	var gTransport = el("div", "cqb-tb-group");
	var gRemove = el("div", "cqb-tb-group");
	var gPlugins = el("div", "cqb-tb-group");
	function sep() { return el("div", "cqb-tb-sep"); }

	/* ============================================================
	 * Place core buttons.
	 * ============================================================ */
	var add = byId("mnu_add");
	if (add) {
		add.classList.add("cqb-add-primary");
		mark(add);
		if (!add.querySelector(".cqb-add-label")) {
			var lbl = el("span", "cqb-add-label");
			lbl.textContent = "Add";
			add.appendChild(lbl);
		}
		decorate(add);
	}
	["mnu_start", "mnu_pause", "mnu_stop"].forEach(function (id) {
		var a = byId(id);
		if (a) { mark(a); decorate(a); gTransport.appendChild(a); }
	});
	var rm = byId("mnu_remove");
	if (rm) { mark(rm); decorate(rm); gRemove.appendChild(rm); }

	/* ============================================================
	 * Search field -- one bordered box, leading glyph, hint chip. The GO
	 * action stays wired but hidden; Enter submits the engine search. The
	 * Ctrl K chip advertises the global command palette; this module does not
	 * bind Ctrl K itself so a single handler owns the shortcut.
	 * ============================================================ */
	var search = el("div", "cqb-search");
	var mnuSearch = byId("mnu_search");
	var query = byId("query");
	var go = byId("mnu_go");
	var ind = byId("ind");
	if (mnuSearch) { mark(mnuSearch); search.appendChild(mnuSearch); }
	if (query) {
		if (!query.getAttribute("placeholder")) query.setAttribute("placeholder", "Search");
		search.appendChild(query);
	}
	var kbd = el("span", "cqb-kbd");
	kbd.setAttribute("aria-hidden", "true");
	kbd.textContent = (navigator.platform && /mac/i.test(navigator.platform)) ? "⌘K" : "Ctrl K";
	search.appendChild(kbd);
	if (go) mark(go);
	if (query) {
		query.addEventListener("keydown", function (e) {
			if (e.key === "Enter") {
				e.preventDefault();
				if (go) go.click();
				else if (window.theSearchEngines) theSearchEngines.run();
			}
		});
	}

	/* ============================================================
	 * Speed widget -- live down/up rates + a 60s sparkline.
	 * ============================================================ */
	var SVGNS = "http://www.w3.org/2000/svg";
	var N = 60;
	var downBuf = [], upBuf = [];
	var speed = el("div", "cqb-speed");
	var rates = el("div", "cqb-speed-rates");
	function rate(dir) {
		var row = el("span", "cqb-speed-rate");
		var g = el("span", "cqb-speed-glyph " + dir);
		var v = el("span", "cqb-speed-val");
		v.textContent = "0 B/s";
		row.appendChild(g);
		row.appendChild(v);
		return { row: row, val: v };
	}
	var dRate = rate("down"), uRate = rate("up");
	rates.appendChild(dRate.row);
	rates.appendChild(uRate.row);
	var spark = document.createElementNS(SVGNS, "svg");
	spark.setAttribute("class", "cqb-spark");
	spark.setAttribute("viewBox", "0 0 72 26");
	spark.setAttribute("preserveAspectRatio", "none");
	var dLine = document.createElementNS(SVGNS, "polyline");
	var uLine = document.createElementNS(SVGNS, "polyline");
	[dLine, uLine].forEach(function (p) {
		p.setAttribute("fill", "none");
		p.setAttribute("stroke-width", "1.5");
		p.setAttribute("stroke-linejoin", "round");
		p.setAttribute("stroke-linecap", "round");
	});
	dLine.style.stroke = "var(--qb-speed-down)";
	uLine.style.stroke = "var(--qb-speed-up)";
	spark.appendChild(dLine);
	spark.appendChild(uLine);
	speed.appendChild(rates);
	speed.appendChild(spark);

	function fmtSpeed(bytes) {
		var s = (window.theConverter && theConverter.speed) ? theConverter.speed(bytes) : "";
		return (s && s.trim()) ? s : "0 B/s";
	}
	function pointsFor(buf, max) {
		var n = buf.length;
		if (!n) return "";
		var W = 72, H = 26, pad = 2, step = n > 1 ? W / (n - 1) : 0, out = [];
		for (var i = 0; i < n; i++) {
			var x = i * step;
			var y = H - pad - (buf[i] / max) * (H - 2 * pad);
			out.push(x.toFixed(1) + "," + y.toFixed(1));
		}
		return out.join(" ");
	}
	function drawSpark() {
		var max = 1;
		for (var i = 0; i < downBuf.length; i++) max = Math.max(max, downBuf[i], upBuf[i]);
		dLine.setAttribute("points", pointsFor(downBuf, max));
		uLine.setAttribute("points", pointsFor(upBuf, max));
	}
	function sampleSpeed() {
		if (!window.theWebUI || !theWebUI.total) return;
		var d = +theWebUI.total.speedDL || 0, u = +theWebUI.total.speedUL || 0;
		downBuf.push(d); upBuf.push(u);
		if (downBuf.length > N) downBuf.shift();
		if (upBuf.length > N) upBuf.shift();
		dRate.val.textContent = fmtSpeed(d);
		uRate.val.textContent = fmtSpeed(u);
		drawSpark();
	}
	window.setInterval(sampleSpeed, 1000);
	sampleSpeed();

	/* ============================================================
	 * Variant palette.
	 * ============================================================ */
	var pal = el("div", "cqb-palette");
	var pbtn = el("button", "cqb-palette-btn");
	pbtn.type = "button";
	pbtn.setAttribute("aria-haspopup", "true");
	pbtn.appendChild(el("span", "cqb-palette-glyph"));
	var menu = el("div", "cqb-palette-menu");
	menu.hidden = true;
	menu.setAttribute("role", "menu");
	var OPTS = [["auto", "Auto"], ["spectre", "Spectre"], ["smoked", "Smoked"], ["reel", "Reel"], ["defaulted", "Light"]];
	OPTS.forEach(function (o) {
		var it = el("button", "cqb-palette-item");
		it.type = "button";
		it.setAttribute("data-variant", o[0]);
		var lb = el("span");
		lb.textContent = o[1];
		var ck = el("span", "cqb-palette-check");
		it.appendChild(lb);
		it.appendChild(ck);
		it.addEventListener("click", function () {
			cqb.setVariant(o[0]);
			markActive();
			closeMenu();
		});
		menu.appendChild(it);
	});
	function markActive() {
		var cur = currentOverride();
		menu.querySelectorAll(".cqb-palette-item").forEach(function (it) {
			it.classList.toggle("active", it.getAttribute("data-variant") === cur);
		});
	}
	function onDoc(e) { if (!pal.contains(e.target)) closeMenu(); }
	function onEsc(e) { if (e.key === "Escape") closeMenu(); }
	function openMenu() {
		markActive();
		menu.hidden = false;
		pbtn.classList.add("open");
		document.addEventListener("mousedown", onDoc, true);
		document.addEventListener("keydown", onEsc, true);
	}
	function closeMenu() {
		menu.hidden = true;
		pbtn.classList.remove("open");
		document.removeEventListener("mousedown", onDoc, true);
		document.removeEventListener("keydown", onEsc, true);
	}
	pbtn.addEventListener("click", function () { menu.hidden ? openMenu() : closeMenu(); });
	cqb.tooltip(pbtn, "Appearance");
	pal.appendChild(pbtn);
	pal.appendChild(menu);
	cqb.onVariant(markActive);

	/* ============================================================
	 * Assemble the right cluster in order.
	 * ============================================================ */
	var settings = byId("mnu_settings");
	var help = byId("mnu_help");
	if (settings) { mark(settings); decorate(settings); }
	if (help) { mark(help); decorate(help); }
	rc.textContent = "";
	rc.appendChild(search);
	rc.appendChild(speed);
	rc.appendChild(pal);
	if (settings) rc.appendChild(settings);
	if (help) rc.appendChild(help);
	if (ind) rc.appendChild(ind);
	if (go) rc.appendChild(go);

	/* ============================================================
	 * Route plugin-added buttons into the plugins group (logoff to the
	 * account cluster). Dropdown groups move whole so their menu survives.
	 * ============================================================ */
	function routeItem(node) {
		if (!node || node.getAttribute("data-cqb-placed")) return;
		mark(node);
		decorate(node);
		if (node.id === "mnu_logoff") {
			if (ind && ind.parentNode === rc) rc.insertBefore(node, ind);
			else rc.appendChild(node);
			return;
		}
		gPlugins.appendChild(node);
	}
	function sweepPlugins() {
		tb.querySelectorAll(".btn-group:not([data-cqb-placed])").forEach(function (g) {
			var a = g.querySelector("a.nav-link");
			if (a) mark(a);
			mark(g);
			decorate(a || g);
			gPlugins.appendChild(g);
		});
		tb.querySelectorAll("a.nav-link:not([data-cqb-placed])").forEach(routeItem);
		var autodl = byId("autodl-tb");
		if (autodl && !autodl.getAttribute("data-cqb-placed")) {
			var host = autodl.closest("a") || autodl;
			routeItem(host);
		}
	}
	sweepPlugins();

	/* ============================================================
	 * Order the bar + drop leftover empty wrappers / core separators.
	 * ============================================================ */
	nav.appendChild(brand);
	if (add) nav.appendChild(add);
	nav.appendChild(gTransport);
	nav.appendChild(sep());
	nav.appendChild(gRemove);
	nav.appendChild(sep());
	nav.appendChild(gPlugins);
	nav.appendChild(rc);
	var keep = [brand, add, gTransport, gRemove, gPlugins, rc];
	Array.prototype.slice.call(nav.children).forEach(function (ch) {
		if (keep.indexOf(ch) !== -1 || (ch.classList && ch.classList.contains("cqb-tb-sep"))) return;
		var isSep = ch.classList && ch.classList.contains("TB_Separator");
		var empty = !ch.firstElementChild && !(ch.textContent && ch.textContent.trim());
		if (isSep || empty) ch.remove();
		else gPlugins.appendChild(ch);
	});

	/* ============================================================
	 * Catch plugin buttons added after this runs.
	 * ============================================================ */
	var obs = new MutationObserver(function (muts) {
		var touched = false;
		muts.forEach(function (m) {
			for (var i = 0; i < m.addedNodes.length; i++) {
				var n = m.addedNodes[i];
				if (n.nodeType !== 1) continue;
				if (n.matches && (n.matches("a.nav-link") || n.matches(".btn-group") || n.id === "autodl-tb")) touched = true;
				else if (n.querySelector && n.querySelector("a.nav-link, .btn-group")) touched = true;
			}
		});
		if (touched) sweepPlugins();
	});
	obs.observe(tb, { childList: true, subtree: true });
})(window.cqb);
