/*
 *  club-QuickBox skin for ruTorrent -- settings module.
 *
 *  Reshapes the Settings dialog (#stg) in place: groups and decorates the
 *  navigation rail with glyphs + a filter, titles each page, and relabels the
 *  save action. Core element ids and the Bootstrap list-tab handlers are left
 *  intact -- items are only wrapped and decorated, never moved out of the
 *  .list-group or replaced. Runs in global scope with window.cqb available;
 *  the leading semicolon keeps it safe under script concatenation.
 */
;(function (cqb) {
	"use strict";
	if (!cqb || window.cqbSettingsReady) return;
	window.cqbSettingsReady = true;

	/* Pages that belong to the "ruTorrent" group; everything else is a plugin. */
	var RUTORRENT = ["st_gl", "st_dl", "st_con", "st_bt", "st_fmt", "st_ao", "st_dev", "st_loginmgr"];

	/* Page id -> glyph (images/icons/*.svg). Unknown pages fall back below. */
	var ICONS = {
		st_gl: "tab-general", st_dl: "statusbar-download", st_con: "statusbar-connections",
		st_bt: "tab-peers", st_fmt: "file-text", st_ao: "fm-diag", st_dev: "fm-console",
		st_loginmgr: "search-private", st_autotools: "toolbar-autodl", st_xmpp: "toolbar-chat",
		st_cookies: "file-generic", st_lookat: "toolbar-search", st_retrackers: "tab-trackers",
		st_rss: "toolbar-rss", st_scheduler: "statusbar-clock", st_extsearch: "toolbar-search",
		st_unpack: "fm-extract", st_throttle: "tab-traffic", st_ratio: "header-ratio-rules",
		st_screenshots: "file-image", st_uploadeta: "statusbar-upload", st_history: "tab-history"
	};
	var ICON_FALLBACK = "toolbar-plugins";

	/* Page id -> one-line description under the page title. */
	var DESC = {
		st_gl: "Interface behavior, update interval and speed presets.",
		st_dl: "Default download bandwidth limits and behavior.",
		st_con: "Listening port, global rate limits and connection caps.",
		st_bt: "DHT, peer exchange and other BitTorrent features.",
		st_fmt: "How sizes, dates and numbers are displayed.",
		st_ao: "Lower-level options for advanced users.",
		st_dev: "Diagnostic and developer-only options.",
		st_loginmgr: "Stored tracker logins used by autotools and search.",
		st_autotools: "Automatic actions applied to matching torrents.",
		st_xmpp: "Chat notifications delivered over an XMPP account.",
		st_cookies: "Per-host cookies sent when fetching torrents.",
		st_lookat: "Custom lookup links shown on the torrent menu.",
		st_retrackers: "Trackers appended automatically to new torrents.",
		st_rss: "RSS feeds and auto-download filters.",
		st_scheduler: "Time windows that change limits automatically.",
		st_extsearch: "Search engines used by the toolbar search.",
		st_unpack: "Automatic extraction of completed archives.",
		st_throttle: "Named bandwidth channels for grouping torrents.",
		st_ratio: "Ratio groups and the actions taken at each target.",
		st_screenshots: "Thumbnail previews generated from media files.",
		st_uploadeta: "Target ratio and time used to estimate seeding.",
		st_history: "Event log retention and notification delivery."
	};

	var GROUP_LABELS = { rutorrent: "ruTorrent", plugins: "Plugins" };

	var navEl = null, pagesEl = null, navObs = null, pagesObs = null, syncing = false;

	/* Load this module's stylesheet without depending on the CSS loader list.
	 * cqb.path is the theme plugin path; dedupe against any loader-added link. */
	function loadCss() {
		var links = document.querySelectorAll('link[rel="stylesheet"]');
		for (var i = 0; i < links.length; i++) {
			if (/css\/settings\.css(\?|$)/.test(links[i].href)) return;
		}
		var l = document.createElement("link");
		l.id = "cqb-settings-css";
		l.rel = "stylesheet";
		l.href = (cqb.path || "") + "css/settings.css";
		(document.head || document.documentElement).appendChild(l);
	}

	/* A mask glyph span whose size and color come from CSS (unlike cqb.icon,
	 * which inlines an 18px size and --qb-icon fill and so cannot take the
	 * per-context sizing or the active-row recolor this surface needs). */
	function mkIcon(name) {
		var s = document.createElement("span");
		s.className = "cqb-icon";
		var u = "url(" + (cqb.path || "") + "images/icons/" + name + ".svg)";
		s.style.webkitMaskImage = u;
		s.style.maskImage = u;
		s.style.webkitMaskRepeat = s.style.maskRepeat = "no-repeat";
		s.style.webkitMaskPosition = s.style.maskPosition = "center";
		s.style.webkitMaskSize = s.style.maskSize = "contain";
		return s;
	}

	function pageId(item) {
		var h = item.getAttribute("href") || "";
		if (h.charAt(0) === "#") return h.slice(1);
		return (item.id || "").replace(/^mnu_/, "");
	}

	function iconFor(pid) { return ICONS[pid] || ICON_FALLBACK; }

	function groupHeader(text) {
		var h = document.createElement("div");
		h.className = "cqb-stg-group";
		h.textContent = text;
		return h;
	}

	/* Wrap each nav item's text in a label span and prepend its glyph. */
	function decorateItem(item) {
		if (item.dataset.cqbDone) return;
		var label = (item.textContent || "").trim();
		item.textContent = "";
		item.appendChild(mkIcon(iconFor(pageId(item))));
		var span = document.createElement("span");
		span.className = "cqb-stg-label";
		span.textContent = label;
		item.appendChild(span);
		item.dataset.cqbLabel = label.toLowerCase();
		item.dataset.cqbDone = "1";
	}

	/* Rebuild the two group headers from the current item order (idempotent). */
	function applyGroups(nav) {
		var old = nav.querySelectorAll(".cqb-stg-group");
		for (var i = 0; i < old.length; i++) old[i].remove();
		var items = nav.querySelectorAll(".list-group-item");
		var firstCore = null, firstPlugin = null;
		for (var j = 0; j < items.length; j++) {
			var core = RUTORRENT.indexOf(pageId(items[j])) !== -1;
			if (core && !firstCore) firstCore = items[j];
			if (!core && !firstPlugin) firstPlugin = items[j];
		}
		if (firstCore) nav.insertBefore(groupHeader(GROUP_LABELS.rutorrent), firstCore);
		if (firstPlugin) nav.insertBefore(groupHeader(GROUP_LABELS.plugins), firstPlugin);
	}

	function buildFilter(nav) {
		if (nav.querySelector(".cqb-stg-filter")) return;
		var wrap = document.createElement("div");
		wrap.className = "cqb-stg-filter";
		wrap.appendChild(mkIcon("toolbar-search"));
		var inp = document.createElement("input");
		inp.type = "search";
		inp.placeholder = "Filter settings";
		inp.setAttribute("aria-label", "Filter settings");
		wrap.appendChild(inp);
		nav.insertBefore(wrap, nav.firstChild);
		var empty = document.createElement("div");
		empty.className = "cqb-stg-empty";
		empty.textContent = "No matching settings";
		nav.appendChild(empty);
		inp.addEventListener("input", function () { applyFilter(nav, inp.value); });
	}

	function applyFilter(nav, q) {
		q = (q || "").trim().toLowerCase();
		var items = nav.querySelectorAll(".list-group-item");
		var shown = 0, k;
		for (k = 0; k < items.length; k++) {
			var match = !q || (items[k].dataset.cqbLabel || "").indexOf(q) !== -1;
			items[k].classList.toggle("cqb-hidden", !match);
			if (match) shown++;
		}
		var heads = nav.querySelectorAll(".cqb-stg-group");
		for (k = 0; k < heads.length; k++) {
			var any = false, n = heads[k].nextElementSibling;
			while (n && !n.classList.contains("cqb-stg-group")) {
				if (n.classList.contains("list-group-item") && !n.classList.contains("cqb-hidden")) { any = true; break; }
				n = n.nextElementSibling;
			}
			heads[k].classList.toggle("cqb-hidden", !any);
		}
		var empty = nav.querySelector(".cqb-stg-empty");
		if (empty) empty.classList.toggle("cqb-show", shown === 0);
	}

	function labelFor(pid) {
		var it = navEl && navEl.querySelector("#mnu_" + pid);
		if (it) {
			var l = it.querySelector(".cqb-stg-label");
			return l ? l.textContent : (it.textContent || "").trim();
		}
		return pid;
	}

	/* Prepend a page title + description to a settings page. */
	function decoratePane(pane) {
		if (pane.dataset.cqbHead) return;
		var head = document.createElement("div");
		head.className = "cqb-stg-head";
		var title = document.createElement("div");
		title.className = "cqb-stg-title";
		title.textContent = labelFor(pane.id);
		head.appendChild(title);
		var d = DESC[pane.id];
		if (d) {
			var desc = document.createElement("div");
			desc.className = "cqb-stg-desc";
			desc.textContent = d;
			head.appendChild(desc);
		}
		pane.insertBefore(head, pane.firstChild);
		pane.dataset.cqbHead = "1";
	}

	/* Language, Theme and Appearance ship as quarter-width columns that crowd
	 * onto shared rows; normalize them to full label/field rows like the rest. */
	function fixGeneralRows() {
		["webui.lang", "webui.theme", "qb.variant"].forEach(function (id) {
			var sel = document.getElementById(id);
			if (!sel) return;
			var selCol = sel.closest("[class*=col]");
			var lab = document.querySelector('label[for="' + id + '"]');
			var labCol = lab ? lab.closest("[class*=col]") : null;
			if (selCol) selCol.className = "col-12 col-md-6 cqb-stg-fullrow";
			if (labCol) labCol.className = "col-12 col-md-6 cqb-stg-fullrow";
		});
	}

	/* Relabel the dialog's confirm button to "Save" (keeps its click handler). */
	function relabelSave() {
		var bar = document.querySelector("#stg #st_btns");
		if (!bar) return;
		var btns = bar.querySelectorAll("button");
		for (var i = 0; i < btns.length; i++) {
			if (!btns[i].classList.contains("Cancel") && !btns[i].dataset.cqbSave) {
				btns[i].textContent = (window.theUILang && theUILang.Save) ? theUILang.Save : "Save";
				btns[i].dataset.cqbSave = "1";
			}
		}
	}

	function sync() {
		if (syncing || !navEl) return;
		syncing = true;
		try {
			if (navObs) navObs.disconnect();
			if (pagesObs) pagesObs.disconnect();
			var items = navEl.querySelectorAll(".list-group-item");
			for (var i = 0; i < items.length; i++) decorateItem(items[i]);
			buildFilter(navEl);
			applyGroups(navEl);
			if (pagesEl) {
				var panes = pagesEl.querySelectorAll(".stg_con");
				for (var j = 0; j < panes.length; j++) decoratePane(panes[j]);
			}
			relabelSave();
			fixGeneralRows();
			var inp = navEl.querySelector(".cqb-stg-filter input");
			if (inp) applyFilter(navEl, inp.value);
		} finally {
			if (navObs) navObs.observe(navEl, { childList: true });
			if (pagesObs && pagesEl) pagesObs.observe(pagesEl, { childList: true });
			syncing = false;
		}
	}

	function start() {
		navEl = document.querySelector("#stg_c .lm.list-group");
		pagesEl = document.querySelector("#stg-pages");
		if (!navEl || !pagesEl) return false;
		navObs = new MutationObserver(function () { sync(); });
		pagesObs = new MutationObserver(function () { sync(); });
		sync();
		return true;
	}

	/* The dialog is built during webui init; poll briefly in case this module
	 * lands first, then give up quietly (an absent dialog is a no-op). */
	loadCss();
	if (!start()) {
		var tries = 0;
		var timer = setInterval(function () {
			if (start() || ++tries >= 20) clearInterval(timer);
		}, 300);
	}
})(window.cqb);
