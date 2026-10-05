/*
 *  club-QuickBox skin for ruTorrent -- extras module.
 *
 *  Loaded by init.js once theWebUI is ready. Runs in global scope with
 *  theWebUI, jQuery ($, $$), theUILang, theDialogManager, RGBackground and
 *  window.cqb available. Three QuickBox-only touches: a full-window drop
 *  zone that feeds the core add-torrent path, a Ctrl/Cmd+K command palette,
 *  and the cqb.setVariant helper the palette and the top-bar switcher share.
 *  The leading semicolon keeps the file safe under script concatenation.
 */
;(function (cqb) {
	"use strict";
	if (!cqb) return;

	var OVERRIDE_KEY = "qb-rutorrent-variant";
	var VARIANTS = ["spectre", "smoked", "reel", "defaulted"];

	function lang(key, fallback) {
		try {
			return (typeof theUILang !== "undefined" && theUILang && theUILang[key]) ? theUILang[key] : fallback;
		} catch (e) {
			return fallback;
		}
	}

	function maskSpan(cls, name) {
		var s = document.createElement("span");
		s.className = cls;
		var u = "url(" + cqb.path + "images/icons/" + name + ".svg)";
		s.style.webkitMaskImage = u;
		s.style.maskImage = u;
		return s;
	}

	/* ============================================================
	 * cqb.setVariant -- one apply path for variant changes. init.js may
	 * own this later; this fallback stands in while lanes build in parallel.
	 * ============================================================ */
	function repaintTableBars() {
		try {
			if (typeof RGBackground !== "function" || typeof theWebUI === "undefined" || !theWebUI || !theWebUI.tables) return;
			var cs = getComputedStyle(document.documentElement);
			var prgStart = cs.getPropertyValue("--qb-prg-start").trim();
			var prgEnd = cs.getPropertyValue("--qb-prg-end").trim();
			if (!prgStart || !prgEnd) return;
			for (var k in theWebUI.tables) {
				var obj = theWebUI.tables[k] && theWebUI.tables[k].obj;
				if (obj) {
					obj.prgStartColor = new RGBackground(prgStart);
					obj.prgEndColor = new RGBackground(prgEnd);
				}
			}
		} catch (e) { /* a repaint must not break the engine */ }
	}

	if (typeof cqb.setVariant !== "function") {
		cqb.setVariant = function (v) {
			var root = document.documentElement;
			var variant = VARIANTS.indexOf(v) !== -1 ? v : null;
			try {
				if (v === "auto") window.localStorage.removeItem(OVERRIDE_KEY);
				else if (variant) window.localStorage.setItem(OVERRIDE_KEY, variant);
			} catch (e) { /* storage unavailable: session-only apply */ }
			var applied = variant;
			if (!applied) {
				var m = document.cookie.match(/(?:^|;\s*)qb_theme=([^;]*)/);
				var theme = m ? decodeURIComponent(m[1]) : "";
				applied = VARIANTS.indexOf(theme) !== -1 ? theme : "spectre";
			}
			var dark = applied !== "defaulted";
			root.setAttribute("data-qb-variant", applied);
			root.setAttribute("data-bs-theme", dark ? "dark" : "light");
			root.style.colorScheme = dark ? "dark" : "light";
			var primary = getComputedStyle(root).getPropertyValue("--qb-primary").trim();
			if (primary) root.style.accentColor = primary;
			if (typeof setThemeHint === "function") {
				try { setThemeHint(dark); } catch (e) { /* hint is best-effort */ }
			}
			repaintTableBars();
			return applied;
		};
	}

	/* ============================================================
	 * Drop zone -- drag .torrent anywhere -> overlay -> core add path.
	 * ============================================================ */
	var dropEl = null;
	var dragDepth = 0;

	function ensureDrop() {
		if (dropEl) return dropEl;
		dropEl = document.createElement("div");
		dropEl.id = "cqb-drop";
		var card = document.createElement("div");
		card.className = "cqb-drop-card";
		card.appendChild(maskSpan("cqb-drop-icon", "drop-zone"));
		var title = document.createElement("div");
		title.className = "cqb-drop-title";
		title.textContent = lang("qbDropTitle", "Drop to add torrents");
		var sub = document.createElement("div");
		sub.className = "cqb-drop-sub";
		sub.textContent = lang("qbDropSub", "Release .torrent files anywhere to add them");
		card.appendChild(title);
		card.appendChild(sub);
		dropEl.appendChild(card);
		document.body.appendChild(dropEl);
		return dropEl;
	}

	function draggingFiles(e) {
		var dt = e.dataTransfer;
		if (!dt || !dt.types) return false;
		for (var i = 0; i < dt.types.length; i++) {
			if (dt.types[i] === "Files") return true;
		}
		return false;
	}

	function feedAddDialog(fileList) {
		var torrents = [];
		for (var i = 0; i < fileList.length; i++) {
			if (/\.torrent$/i.test(fileList[i].name)) torrents.push(fileList[i]);
		}
		if (!torrents.length) {
			if (typeof noty === "function") noty(lang("Not_torrent_file", "Not a .torrent file"), "error");
			return;
		}
		if (typeof theWebUI === "undefined" || !theWebUI) return;
		/* Open the add dialog first: its beforeShow clears #torrent_file, so
		 * the files must be injected afterwards. show() is idempotent. */
		if (typeof theDialogManager !== "undefined" && theDialogManager && typeof theDialogManager.show === "function") {
			theDialogManager.show("tadd");
		} else if (typeof theWebUI.showAdd === "function") {
			theWebUI.showAdd();
		}
		var input = document.getElementById("torrent_file");
		if (!input) return;
		try {
			var transfer = new DataTransfer();
			torrents.forEach(function (f) { transfer.items.add(f); });
			input.files = transfer.files;
			if (typeof $ === "function") $(input).trigger("change");
			else input.dispatchEvent(new Event("change", { bubbles: true }));
		} catch (err) {
			/* DataTransfer unsupported: the dialog is open for a manual pick. */
		}
	}

	function hideDrop() {
		dragDepth = 0;
		if (dropEl) dropEl.classList.remove("is-active");
	}

	window.addEventListener("dragenter", function (e) {
		if (!draggingFiles(e)) return;
		e.preventDefault();
		dragDepth++;
		ensureDrop().classList.add("is-active");
	});
	window.addEventListener("dragover", function (e) {
		if (!draggingFiles(e)) return;
		e.preventDefault();
		if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
	});
	window.addEventListener("dragleave", function (e) {
		if (!draggingFiles(e)) return;
		dragDepth--;
		if (dragDepth <= 0) hideDrop();
	});
	window.addEventListener("drop", function (e) {
		if (!draggingFiles(e)) return;
		e.preventDefault();
		hideDrop();
		if (e.dataTransfer) feedAddDialog(e.dataTransfer.files);
	});

	/* ============================================================
	 * Status-bar meters -- normalize disk and cpu to one shared bar.
	 * The cpuload/diskspace panes nest the label inside the track and cpu
	 * ships a flot sparkline; move the label out to a flex sibling and swap
	 * the sparkline for a token track+fill so both panes render identically.
	 * ============================================================ */
	/* Match init.js meterThresholdColor so the cpu bar tints like the disk bar:
	 * ok below 80%, amber (paused token) past 80%, danger past 90%. */
	function meterThresholdColor(pct) {
		var root = document.documentElement;
		var name = pct > 90 ? "--qb-destructive" : pct > 80 ? "--qb-state-paused" : "--qb-primary";
		return getComputedStyle(root).getPropertyValue(name).trim();
	}

	function fillFromText(fill, textEl) {
		if (!fill || !textEl) return;
		var m = /(\d+(?:\.\d+)?)/.exec(textEl.textContent || "");
		var pct = m ? Math.min(100, parseFloat(m[1])) : 0;
		fill.style.width = pct + "%";
		var color = meterThresholdColor(pct);
		if (color) fill.style.backgroundColor = color;
	}

	function normalizeDiskMeter() {
		var pane = document.getElementById("meter-disk-pane");
		var holder = document.getElementById("meter-disk-holder");
		var text = document.getElementById("meter-disk-text");
		if (!pane || !holder || holder.getAttribute("data-cqb-meter") === "1") return;
		holder.setAttribute("data-cqb-meter", "1");
		/* Move the label out of the track so it is a flex sibling of the bar;
		 * the plugin keeps driving #meter-disk-value (the fill) inside holder. */
		if (text && text.parentNode !== pane) pane.appendChild(text);
	}

	function normalizeCpuMeter() {
		var pane = document.getElementById("meter-cpu-pane");
		var holder = document.getElementById("meter-cpu-holder");
		var text = document.getElementById("meter-cpu-text");
		if (!pane || !holder || holder.getAttribute("data-cqb-meter") === "1") return;
		holder.setAttribute("data-cqb-meter", "1");
		if (text && text.parentNode !== pane) pane.appendChild(text);
		/* Hide the flot sparkline canvases and draw our own bar. holder stays
		 * 56x4 (non-zero) so flot keeps resizing without error, just hidden. */
		Array.prototype.slice.call(holder.children).forEach(function (ch) { ch.style.display = "none"; });
		var fill = document.createElement("div");
		fill.className = "cqb-meter-fill";
		holder.appendChild(fill);
		fillFromText(fill, text);
		if (text) {
			try {
				new MutationObserver(function () { fillFromText(fill, text); })
					.observe(text, { childList: true, characterData: true, subtree: true });
			} catch (e) { /* observer unsupported: fill reflects the initial value */ }
		}
		/* Re-hide any canvas flot re-inserts on a later resize. */
		try {
			new MutationObserver(function (muts) {
				muts.forEach(function (mu) {
					Array.prototype.slice.call(mu.addedNodes).forEach(function (n) {
						if (n.nodeType === 1 && n !== fill) n.style.display = "none";
					});
				});
			}).observe(holder, { childList: true });
		} catch (e) { /* best-effort */ }
	}

	function normalizeMeters() {
		normalizeDiskMeter();
		normalizeCpuMeter();
	}

	normalizeMeters();
	var bar = document.getElementById("StatusBar");
	if (bar) {
		try {
			new MutationObserver(normalizeMeters).observe(bar, { childList: true, subtree: true });
		} catch (e) { /* panes already present or observer unsupported */ }
	}

	/* ============================================================
	 * Command palette (Ctrl/Cmd+K).
	 * ============================================================ */
	var palEl = null;
	var palInput = null;
	var palList = null;
	var palRows = [];
	var palActive = -1;

	var STATE_ICON = {
		"-_-_-dls-_-_-": "state-downloading",
		"-_-_-com-_-_-": "state-finished",
		"-_-_-wfa-_-_-": "state-stopped",
		"-_-_-act-_-_-": "state-active",
		"-_-_-iac-_-_-": "state-stopped",
		"-_-_-err-_-_-": "state-error"
	};

	function run(fn) {
		closePalette();
		try { fn(); } catch (e) { /* a command must not break the palette */ }
	}

	function torrentSearch(q) {
		var el = (typeof $$ === "function") ? $$("query") : document.getElementById("query");
		if (!el) return;
		el.value = q;
		if (typeof theWebUI !== "undefined" && theWebUI && typeof theWebUI.updateQuickSearch === "function") {
			theWebUI.updateQuickSearch();
		}
	}

	function addPanelFilters(list, group, cl, panelId) {
		try {
			var attribs = cl.panelLabelAttribs && cl.panelLabelAttribs[panelId];
			if (!attribs || typeof attribs.forEach !== "function") return;
			attribs.forEach(function (attr, labelId) {
				if (labelId === panelId + "_all") return;
				var text = (attr && attr.text) ? attr.text : labelId;
				var icon = panelId === "pstate" ? (STATE_ICON[labelId] || "state-active") : "toolbar-rss";
				list.push({
					group: group,
					label: text,
					icon: icon,
					run: function () { cl.switchLabel(panelId, labelId); }
				});
			});
		} catch (e) { /* skip a panel that is not configured yet */ }
	}

	function commandList() {
		var list = [];
		var tw = (typeof theWebUI !== "undefined") ? theWebUI : null;
		var A = lang("qbPalActions", "Actions");
		if (tw) {
			list.push({ group: A, label: lang("qbPalAdd", "Add torrent"), icon: "toolbar-add", run: function () { tw.showAdd(); } });
			list.push({ group: A, label: lang("qbPalStart", "Start selected"), icon: "toolbar-start", run: function () { tw.start(); } });
			list.push({ group: A, label: lang("qbPalPause", "Pause selected"), icon: "toolbar-pause", run: function () { tw.pause(); } });
			list.push({ group: A, label: lang("qbPalStop", "Stop selected"), icon: "toolbar-stop", run: function () { tw.stop(); } });
			list.push({ group: A, label: lang("qbPalRemove", "Remove selected"), icon: "toolbar-remove", run: function () { if (typeof tw.removeTorrent === "function") tw.removeTorrent(); else tw.remove(); } });
			list.push({ group: A, label: lang("qbPalSettings", "Settings"), icon: "toolbar-settings", run: function () { tw.showSettings(); } });
		}
		var AP = lang("qbPalAppearance", "Appearance");
		var prefix = lang("qbPalSwitch", "Switch to ");
		[["auto", "qbVariantAuto", "Auto (dashboard)"], ["spectre", "qbVariantSpectre", "Spectre"], ["smoked", "qbVariantSmoked", "Smoked"], ["reel", "qbVariantReel", "Reel"], ["defaulted", "qbVariantLight", "Light"]].forEach(function (p) {
			list.push({ group: AP, label: prefix + lang(p[1], p[2]), icon: "palette-switch", run: function () { cqb.setVariant(p[0]); } });
		});
		var F = lang("qbPalFilters", "Filters");
		var cl = tw && tw.categoryList;
		if (cl && typeof cl.switchLabel === "function") {
			list.push({ group: F, label: lang("qbPalAll", "All torrents"), icon: "sidebar-all", run: function () { cl.switchLabel("pview", "pview_all"); } });
			addPanelFilters(list, F, cl, "pstate");
			addPanelFilters(list, F, cl, "plabel");
		}
		/* The about module owns the opener; the command appears only once it has
		 * registered, and runs lazily so load order between the two never matters. */
		if (typeof cqb.openWhatsNew === "function") {
			list.push({ group: lang("qbPalHelp", "Help"), label: lang("cqb_wn_title", "What's new in club-QuickBox"), icon: "toolbar-help", run: function () { cqb.openWhatsNew(); } });
		}
		return list;
	}

	function buildPalette(query) {
		palList.textContent = "";
		palRows = [];
		palActive = -1;
		var q = (query || "").trim().toLowerCase();
		var all = commandList();
		var matched = q ? all.filter(function (c) { return c.label.toLowerCase().indexOf(q) !== -1; }) : all;
		if (q) {
			matched = matched.concat([{
				group: lang("qbPalSearchGroup", "Search"),
				label: lang("qbPalSearchFor", "Search torrents for") + ' "' + query.trim() + '"',
				icon: "toolbar-search",
				run: function () { torrentSearch(query.trim()); }
			}]);
		}
		if (!matched.length) {
			var empty = document.createElement("div");
			empty.className = "cqb-pal-empty";
			empty.textContent = lang("qbPalNoResults", "No matching commands");
			palList.appendChild(empty);
			return;
		}
		var lastGroup = null;
		matched.forEach(function (cmd) {
			if (cmd.group !== lastGroup) {
				lastGroup = cmd.group;
				var gh = document.createElement("div");
				gh.className = "cqb-pal-group";
				gh.textContent = cmd.group;
				palList.appendChild(gh);
			}
			var row = document.createElement("div");
			row.className = "cqb-pal-row";
			row.appendChild(maskSpan("cqb-pal-row-icon", cmd.icon));
			var label = document.createElement("span");
			label.className = "cqb-pal-row-label";
			label.textContent = cmd.label;
			row.appendChild(label);
			var idx = palRows.length;
			row.addEventListener("mousemove", function () { setActive(idx); });
			row.addEventListener("click", function () { run(cmd.run); });
			palList.appendChild(row);
			palRows.push(row);
		});
		setActive(0);
	}

	function setActive(i) {
		if (!palRows.length) return;
		if (i < 0) i = 0;
		if (i >= palRows.length) i = palRows.length - 1;
		if (palActive >= 0 && palRows[palActive]) palRows[palActive].classList.remove("is-active");
		palActive = i;
		palRows[palActive].classList.add("is-active");
		palRows[palActive].scrollIntoView({ block: "nearest" });
	}

	function runActive() {
		if (palActive < 0 || !palRows[palActive]) return;
		palRows[palActive].click();
	}

	function keycap(keys, label) {
		var wrap = document.createElement("span");
		wrap.className = "cqb-key";
		keys.forEach(function (k) {
			var kb = document.createElement("kbd");
			kb.textContent = k;
			wrap.appendChild(kb);
		});
		var t = document.createElement("span");
		t.textContent = label;
		wrap.appendChild(t);
		return wrap;
	}

	function ensurePalette() {
		if (palEl) return;
		palEl = document.createElement("div");
		palEl.id = "cqb-palette";
		var panel = document.createElement("div");
		panel.className = "cqb-pal-panel";

		var search = document.createElement("div");
		search.className = "cqb-pal-search";
		var sicon = document.createElement("span");
		sicon.className = "cqb-pal-search-icon";
		palInput = document.createElement("input");
		palInput.type = "text";
		palInput.className = "cqb-pal-input";
		palInput.setAttribute("spellcheck", "false");
		palInput.setAttribute("autocomplete", "off");
		palInput.placeholder = lang("qbPalPlaceholder", "Type a command or search torrents...");
		search.appendChild(sicon);
		search.appendChild(palInput);

		palList = document.createElement("div");
		palList.className = "cqb-pal-list";

		var foot = document.createElement("div");
		foot.className = "cqb-pal-foot";
		foot.appendChild(keycap(["↑", "↓"], lang("qbPalNavigate", "navigate")));
		foot.appendChild(keycap(["↵"], lang("qbPalOpen", "run")));
		foot.appendChild(keycap(["esc"], lang("qbPalClose", "close")));

		panel.appendChild(search);
		panel.appendChild(palList);
		panel.appendChild(foot);
		palEl.appendChild(panel);
		document.body.appendChild(palEl);

		palInput.addEventListener("input", function () { buildPalette(palInput.value); });
		palInput.addEventListener("keydown", paletteKeydown);
		palEl.addEventListener("mousedown", function (e) { if (e.target === palEl) closePalette(); });
	}

	function paletteKeydown(e) {
		if (e.key === "ArrowDown") { e.preventDefault(); setActive(palActive + 1); }
		else if (e.key === "ArrowUp") { e.preventDefault(); setActive(palActive - 1); }
		else if (e.key === "Enter") { e.preventDefault(); runActive(); }
		else if (e.key === "Escape") { e.preventDefault(); closePalette(); }
	}

	function openPalette() {
		ensurePalette();
		palEl.classList.add("is-active");
		palInput.value = "";
		buildPalette("");
		palInput.focus();
	}

	function closePalette() {
		if (palEl) palEl.classList.remove("is-active");
	}

	document.addEventListener("keydown", function (e) {
		if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && (e.key === "k" || e.key === "K")) {
			e.preventDefault();
			if (palEl && palEl.classList.contains("is-active")) closePalette();
			else openPalette();
		}
	}, true);
})(window.cqb);
