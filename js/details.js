/*
 *  club-QuickBox skin for ruTorrent -- details module.
 *
 *  Loaded by init.js once theWebUI is ready. Runs in global scope with
 *  theWebUI, jQuery ($, $$) and window.cqb available. The leading
 *  semicolon keeps the file safe if it is ever concatenated after another.
 *
 *  Three enhancements, each defensive (a throw here would abort the rest
 *  of the concatenated plugin bundle):
 *    1. General pane  -> label/value pairs rebuilt as v4 stat cards.
 *    2. Empty state   -> a centered prompt when no single torrent is chosen.
 *    3. File manager  -> a clickable breadcrumb + an icon-button tool group
 *                        in place of the stock path <select> (kept wired).
 */
;(function (cqb) {
	"use strict";

	function maskSpan(name) {
		var s = document.createElement("span");
		s.className = "cqb-icon";
		var u = "url(" + (cqb && cqb.path ? cqb.path : "") + "images/icons/" + name + ".svg)";
		s.style.webkitMaskImage = u;
		s.style.maskImage = u;
		return s;
	}

	/* ------------------------------------------------------------
	 * 1. General pane -> stat cards.
	 * ---------------------------------------------------------- */
	function buildStatCards() {
		try {
			var layout = document.getElementById("mainlayout");
			var gcont = document.getElementById("gcont");
			if (!layout || !gcont || gcont.getAttribute("data-cqb-built")) return;

			var out = document.createElement("div");
			out.className = "cqb-gcont";
			var grid = null;

			Array.prototype.forEach.call(layout.children, function (row) {
				if (row.classList.contains("Header")) {
					var h = document.createElement("div");
					h.className = "cqb-stat-heading";
					h.textContent = (row.textContent || "").trim();
					out.appendChild(h);
					grid = document.createElement("div");
					grid.className = "cqb-stat-grid";
					out.appendChild(grid);
					return;
				}
				if (!grid) {
					grid = document.createElement("div");
					grid.className = "cqb-stat-grid";
					out.appendChild(grid);
				}
				var pendingLabel = null;
				Array.prototype.forEach.call(row.children, function (col) {
					var hdr = col.querySelector(".det-hdr");
					var val = col.querySelector(".det");
					if (hdr) pendingLabel = (hdr.textContent || "").trim();
					if (val) {
						var card = document.createElement("div");
						card.className = "cqb-stat";
						var lab = document.createElement("div");
						lab.className = "cqb-stat-label";
						lab.textContent = pendingLabel || "";
						card.appendChild(lab);
						card.appendChild(val); /* moved -- id + handlers preserved */
						grid.appendChild(card);
						pendingLabel = null;
					}
				});
			});

			layout.style.display = "none";
			gcont.appendChild(out);
			gcont.setAttribute("data-cqb-built", "1");
		} catch (e) { /* never break the bundle */ }
	}

	/* ------------------------------------------------------------
	 * 2. Empty state overlay, toggled from the selection handlers.
	 * ---------------------------------------------------------- */
	function installEmptyState() {
		try {
			var drawer = document.getElementById("tdetails");
			if (!drawer || drawer.querySelector(".cqb-details-empty")) return;

			var empty = document.createElement("div");
			empty.className = "cqb-details-empty";
			var glyph = document.createElement("div");
			glyph.className = "cqb-empty-glyph";
			var text = document.createElement("div");
			text.className = "cqb-empty-text";
			text.textContent = "Select a torrent to see its details";
			empty.appendChild(glyph);
			empty.appendChild(text);
			drawer.appendChild(empty);

			var setEmpty = function (on) { drawer.classList.toggle("cqb-empty", !!on); };

			if (window.theWebUI) {
				var showDetails = theWebUI.showDetails;
				if (typeof showDetails === "function") {
					theWebUI.showDetails = function (hash, noSwitch) {
						setEmpty(!hash);
						return showDetails.call(this, hash, noSwitch);
					};
				}
				var clearDetails = theWebUI.clearDetails;
				if (typeof clearDetails === "function") {
					theWebUI.clearDetails = function () {
						setEmpty(true);
						return clearDetails.apply(this, arguments);
					};
				}
				setEmpty(!theWebUI.dID);
			}
		} catch (e) { /* never break the bundle */ }
	}

	/* ------------------------------------------------------------
	 * 3. File-manager path bar: breadcrumb + icon tool group.
	 * ---------------------------------------------------------- */
	function enhanceFileManager(navpath) {
		try {
			if (!navpath || navpath.getAttribute("data-cqb-crumbed")) return;
			navpath.setAttribute("data-cqb-crumbed", "1");

			var group = navpath.closest(".input-group") || navpath.parentNode;
			if (!group) return;

			/* Tool group: existing refresh button + dir-up + mkdir. */
			var tools = document.createElement("div");
			tools.className = "cqb-flm-tools";
			var refresh = document.getElementById("flm-nav-refresh");
			if (refresh) tools.appendChild(refresh); /* move -- click handler kept */

			var upBtn = document.createElement("button");
			upBtn.type = "button";
			upBtn.className = "cqb-flm-btn";
			upBtn.appendChild(maskSpan("fm-dir-up"));
			if (cqb && cqb.tooltip) cqb.tooltip(upBtn, "Parent directory");
			upBtn.addEventListener("click", function () {
				if (!window.flm || !flm.goToPath) return;
				var cur = navpath.value || "/";
				var parent = cur.replace(/\/+$/, "").replace(/\/[^/]*$/, "") || "/";
				flm.goToPath(parent);
			});
			tools.appendChild(upBtn);

			var mkBtn = document.createElement("button");
			mkBtn.type = "button";
			mkBtn.className = "cqb-flm-btn";
			mkBtn.appendChild(maskSpan("fm-mkdir"));
			if (cqb && cqb.tooltip) cqb.tooltip(mkBtn, "New folder");
			mkBtn.addEventListener("click", function () {
				try { window.flm && flm.ui.getDialogs().showDialog("mkdir"); } catch (e) {}
			});
			tools.appendChild(mkBtn);

			/* Breadcrumb replaces the stock <select> (kept, screen-reader only). */
			var crumbs = document.createElement("nav");
			crumbs.className = "cqb-breadcrumb";
			crumbs.setAttribute("aria-label", "Path");
			navpath.classList.add("cqb-sr");

			group.insertBefore(tools, group.firstChild);
			group.insertBefore(crumbs, navpath);

			var render = function () {
				try {
					var cur = navpath.value || "/";
					crumbs.textContent = "";
					var addCrumb = function (label, path, current) {
						var b = document.createElement("button");
						b.type = "button";
						b.className = "cqb-crumb" + (current ? " cqb-crumb-current" : "");
						b.textContent = label;
						if (!current) {
							b.addEventListener("click", function () {
								if (window.flm && flm.goToPath) flm.goToPath(path);
							});
						}
						crumbs.appendChild(b);
					};
					var addSep = function () {
						var s = document.createElement("span");
						s.className = "cqb-crumb-sep";
						s.textContent = "/";
						crumbs.appendChild(s);
					};
					var parts = cur.split("/").filter(Boolean);
					addCrumb("/", "/", parts.length === 0);
					var acc = "";
					parts.forEach(function (p, i) {
						acc += "/" + p;
						addSep();
						addCrumb(p, acc, i === parts.length - 1);
					});
				} catch (e) {}
			};

			/* The stock updateNavbarPath rewrites the <select> options on every
			 * changeDir, so observing its children re-renders the breadcrumb
			 * without coupling to flm internals. */
			render();
			new MutationObserver(render).observe(navpath, { childList: true });
		} catch (e) { /* never break the bundle */ }
	}

	/* ------------------------------------------------------------
	 * 4. Flot charts (Speed + Traffic) on variant chart tokens.
	 * ---------------------------------------------------------- */
	function cssvar(name) {
		try { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
		catch (e) { return ""; }
	}

	function hexToRgba(hex, a) {
		var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec((hex || "").trim());
		if (!m) return hex;
		return "rgba(" + parseInt(m[1], 16) + "," + parseInt(m[2], 16) + "," + parseInt(m[3], 16) + "," + a + ")";
	}

	function styleCharts() {
		try {
			if (!window.theWebUI) return;
			var rx = cssvar("--qb-chart-rx") || cssvar("--qb-speed-down");
			var tx = cssvar("--qb-chart-tx") || cssvar("--qb-speed-up");
			if (!rx && !tx) return;

			/* Speed tab -- filled areas (~30%) with a solid 2px edge. */
			var sg = theWebUI.speedGraph;
			if (sg && sg.down && sg.up) {
				sg.down.color = rx;
				sg.up.color = tx;
				sg.down.lines = { show: true, fill: 0.3, lineWidth: 2 };
				sg.up.lines = { show: true, fill: 0.3, lineWidth: 2 };
				if (sg.plot) try { sg.draw(true); } catch (e) {}
			}

			/* Traffic tab -- filled bars (~35%) with a solid 1px edge;
			 * the prior-period series run dimmer in the same hue. */
			var tg = theWebUI.trafGraph;
			if (tg && tg.down && tg.up) {
				tg.down.color = rx;
				tg.up.color = tx;
				if (tg.oldDown) tg.oldDown.color = hexToRgba(rx, 0.4);
				if (tg.oldUp) tg.oldUp.color = hexToRgba(tx, 0.4);
				[tg.down, tg.up, tg.oldDown, tg.oldUp].forEach(function (d) {
					if (d) d.bars = { show: true, fill: 0.35, lineWidth: 1 };
				});
				if (tg.plot) try { tg.draw(true); } catch (e) {}
			}
		} catch (e) { /* never break the bundle */ }
	}

	/* ------------------------------------------------------------
	 * 5. Traffic pane toolbar -- Clear becomes an icon-button.
	 * ---------------------------------------------------------- */
	function enhanceTrafToolbar() {
		try {
			var ctrl = document.getElementById("traf_graph_ctrl");
			if (!ctrl || ctrl.getAttribute("data-cqb-tb")) return;
			var btn = ctrl.querySelector("button");
			if (btn) {
				btn.textContent = "";
				btn.className = "cqb-flm-btn";
				btn.appendChild(maskSpan("log-clear"));
				if (cqb && cqb.tooltip) cqb.tooltip(btn, "Clear statistics");
			}
			ctrl.setAttribute("data-cqb-tb", "1");
		} catch (e) { /* never break the bundle */ }
	}

	function watchForFileManager() {
		try {
			var existing = document.getElementById("flm-navpath");
			if (existing) enhanceFileManager(existing);
			var host = document.getElementById("tdcont") || document.body;
			new MutationObserver(function () {
				var np = document.getElementById("flm-navpath");
				if (np && !np.getAttribute("data-cqb-crumbed")) enhanceFileManager(np);
			}).observe(host, { childList: true, subtree: true });
		} catch (e) { /* never break the bundle */ }
	}

	/* Re-apply chart/toolbar work when the relevant tab is shown, so a
	 * lazily-built graph or toolbar is caught the first time it appears. */
	function hookTabShow() {
		try {
			if (!window.theTabs || theTabs.__cqbWrapped) return;
			var show = theTabs.show;
			theTabs.show = function (id) {
				var r = show.apply(this, arguments);
				if (id === "traf") { enhanceTrafToolbar(); styleCharts(); }
				if (id === "Speed") styleCharts();
				return r;
			};
			theTabs.__cqbWrapped = true;
		} catch (e) { /* never break the bundle */ }
	}

	buildStatCards();
	installEmptyState();
	watchForFileManager();
	enhanceTrafToolbar();
	styleCharts();
	hookTabShow();
	if (cqb && cqb.onVariant) cqb.onVariant(styleCharts);
	/* One delayed pass -- the traffic plugin builds its page and graph
	 * during lang-load, which may land just after this module runs. */
	setTimeout(function () { enhanceTrafToolbar(); styleCharts(); }, 1500);
})(window.cqb);
