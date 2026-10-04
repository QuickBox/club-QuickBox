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

	/* Helper strings (the skin's lang/en.js is not auto-loaded, so register the
	 * English defaults here the way init.js does; keep lang/en.js as the ref). */
	if (window.theUILang) {
		theUILang.cqb_zero_unlimited = theUILang.cqb_zero_unlimited || "Set 0 for unlimited.";
		theUILang.cqb_decimals_hint = theUILang.cqb_decimals_hint || "Leave a cell blank to inherit the default.";
		theUILang.cqb_filter_trackers = theUILang.cqb_filter_trackers || "Filter trackers";
		theUILang.cqb_tracker = theUILang.cqb_tracker || "Tracker";
		theUILang.cqb_enabled = theUILang.cqb_enabled || "Enabled";
		theUILang.cqb_grp_hashing = theUILang.cqb_grp_hashing || "Hashing";
		theUILang.cqb_grp_preload = theUILang.cqb_grp_preload || "Preload";
		theUILang.cqb_grp_buffers = theUILang.cqb_grp_buffers || "Buffers";
		theUILang.cqb_grp_limits = theUILang.cqb_grp_limits || "Limits";
		theUILang.cqb_grp_network = theUILang.cqb_grp_network || "Network";
		theUILang.cqb_grp_session = theUILang.cqb_grp_session || "Session and timeouts";
		theUILang.cqb_grp_flags = theUILang.cqb_grp_flags || "Flags";
		theUILang.cqb_stg_empty = theUILang.cqb_stg_empty || "No matching trackers";
		theUILang.cqb_browse = theUILang.cqb_browse || "Browse";
		theUILang.cqb_not_set = theUILang.cqb_not_set || "Not set";
	}

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
		st_gl: L("cqb_stg_desc_gl", "Interface behavior, update interval and speed presets."),
		st_dl: L("cqb_stg_desc_dl", "Default download bandwidth limits and behavior."),
		st_con: L("cqb_stg_desc_con", "Listening port, global rate limits and connection caps."),
		st_bt: L("cqb_stg_desc_bt", "DHT, peer exchange and other BitTorrent features."),
		st_fmt: L("cqb_stg_desc_fmt", "How sizes, dates and numbers are displayed."),
		st_ao: L("cqb_stg_desc_ao", "Lower-level options for advanced users."),
		st_dev: L("cqb_stg_desc_dev", "Diagnostic and developer-only options."),
		st_loginmgr: L("cqb_stg_desc_loginmgr", "Stored tracker logins used by autotools and search."),
		st_autotools: L("cqb_stg_desc_autotools", "Automatic actions applied to matching torrents."),
		st_xmpp: L("cqb_stg_desc_xmpp", "Chat notifications delivered over an XMPP account."),
		st_cookies: L("cqb_stg_desc_cookies", "Per-host cookies sent when fetching torrents."),
		st_lookat: L("cqb_stg_desc_lookat", "Custom lookup links shown on the torrent menu."),
		st_retrackers: L("cqb_stg_desc_retrackers", "Trackers appended automatically to new torrents."),
		st_rss: L("cqb_stg_desc_rss", "RSS feeds and auto-download filters."),
		st_scheduler: L("cqb_stg_desc_scheduler", "Time windows that change limits automatically."),
		st_extsearch: L("cqb_stg_desc_extsearch", "Search engines used by the toolbar search."),
		st_unpack: L("cqb_stg_desc_unpack", "Automatic extraction of completed archives."),
		st_throttle: L("cqb_stg_desc_throttle", "Named bandwidth channels for grouping torrents."),
		st_ratio: L("cqb_stg_desc_ratio", "Ratio groups and the actions taken at each target."),
		st_screenshots: L("cqb_stg_desc_screenshots", "Thumbnail previews generated from media files."),
		st_uploadeta: L("cqb_stg_desc_uploadeta", "Target ratio and time used to estimate seeding."),
		st_history: L("cqb_stg_desc_history", "Event log retention and notification delivery.")
	};

	var GROUP_LABELS = { rutorrent: "ruTorrent", plugins: L("cqb_stg_grp_plugins", "Plugins") };

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
		inp.placeholder = L("cqb_stg_filter", "Filter settings");
		inp.setAttribute("aria-label", L("cqb_stg_filter", "Filter settings"));
		wrap.appendChild(inp);
		nav.insertBefore(wrap, nav.firstChild);
		var empty = document.createElement("div");
		empty.className = "cqb-stg-empty";
		empty.textContent = L("cqb_stg_no_match", "No matching settings");
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
		layoutPane(pane);
	}

	/* ---- Layout engine: rebuild pages into the shared primitives ---------
	 * Live control nodes are MOVED (never cloned), so ids and handlers survive;
	 * the old Bootstrap-grid scaffolding is dropped once its controls are out. */
	function cleanLabel(t) { return (t || "").replace(/[:：]\s*$/, "").trim(); }

	function labelTextFor(id) {
		var l = document.querySelector('label[for="' + id + '"]');
		return l ? cleanLabel(l.textContent) : id;
	}

	function helpLine(text) {
		var h = document.createElement("div");
		h.className = "cqb-help";
		h.textContent = text;
		return h;
	}

	function fieldTile(id, opts) {
		opts = opts || {};
		var ctrl = document.getElementById(id);
		if (!ctrl) return null;
		var tile = document.createElement("div");
		tile.className = "cqb-field";
		var lab = document.createElement("label");
		lab.setAttribute("for", id);
		lab.textContent = opts.label != null ? opts.label : labelTextFor(id);
		if (opts.mono) lab.className = "cqb-mono";
		tile.appendChild(lab);
		var wrap = document.createElement("div");
		wrap.className = "cqb-control";
		wrap.appendChild(ctrl);
		if (opts.unit) {
			wrap.classList.add("cqb-has-unit");
			var u = document.createElement("span");
			u.className = "cqb-unit";
			u.textContent = opts.unit;
			wrap.appendChild(u);
		}
		tile.appendChild(wrap);
		if (opts.help) tile.appendChild(helpLine(opts.help));
		return tile;
	}

	function fieldGrid(specs) {
		var grid = document.createElement("div");
		grid.className = "cqb-field-grid";
		specs.forEach(function (s) {
			var t = fieldTile(s.id, s);
			if (t) grid.appendChild(t);
		});
		return grid.children.length ? grid : null;
	}

	function wideField(id, opts) {
		opts = opts || {};
		var ctrl = document.getElementById(id);
		if (!ctrl) return null;
		var w = document.createElement("div");
		w.className = "cqb-field-wide";
		var lab = document.createElement("label");
		lab.setAttribute("for", id);
		lab.textContent = opts.label != null ? opts.label : labelTextFor(id);
		w.appendChild(lab);
		if (opts.path) {
			var g = document.createElement("div");
			g.className = "cqb-input-group";
			g.dataset.cqbBrowse = id;
			g.appendChild(ctrl);
			w.appendChild(g);
		} else {
			w.appendChild(ctrl);
		}
		if (opts.help) w.appendChild(helpLine(opts.help));
		return w;
	}

	/* Attach the core directory browser to every marked path input, as one
	 * input-group: the button sits flush against the input it browses for. */
	function wireBrowsers(scope) {
		if (!window.theWebUI || !theWebUI.rDirBrowser || !window.thePlugins || !thePlugins.isInstalled("_getdir")) return;
		var groups = scope.querySelectorAll("[data-cqb-browse]");
		for (var i = 0; i < groups.length; i++) {
			var g = groups[i];
			var id = g.dataset.cqbBrowse;
			if (g.dataset.cqbBrowseDone || document.getElementById(id + "_btn")) { g.dataset.cqbBrowseDone = "1"; continue; }
			try { new theWebUI.rDirBrowser(id); } catch (e) { continue; }
			var btn = document.getElementById(id + "_btn");
			if (btn) {
				g.appendChild(btn);
				btn.classList.add("cqb-browse");
				btn.textContent = "";
				cqb.tooltip(btn, L("cqb_browse", "Browse"));
			}
			g.dataset.cqbBrowseDone = "1";
		}
	}

	function checkGridFrom(scope) {
		var grid = document.createElement("div");
		grid.className = "cqb-check-grid";
		var boxes = scope.querySelectorAll('input[type="checkbox"]');
		for (var i = 0; i < boxes.length; i++) {
			var cb = boxes[i];
			var lab = cb.id ? document.querySelector('label[for="' + cb.id + '"]') : null;
			if (!lab && cb.nextElementSibling && cb.nextElementSibling.tagName === "LABEL") lab = cb.nextElementSibling;
			var w = document.createElement("div");
			w.className = "cqb-check";
			w.appendChild(cb);
			if (lab) w.appendChild(lab);
			grid.appendChild(w);
		}
		return grid.children.length ? grid : null;
	}

	/* Keep the legend, drop the old scaffolding, append the rebuilt nodes. */
	function rebuildFieldset(fieldset, nodes) {
		var legend = fieldset.querySelector("legend");
		var kids = [].slice.call(fieldset.children);
		kids.forEach(function (c) { if (c !== legend) c.remove(); });
		nodes.forEach(function (n) { if (n) fieldset.appendChild(n); });
	}

	function acctCell(ctrl, cls) {
		var td = document.createElement("td");
		if (cls) td.className = cls;
		if (ctrl) td.appendChild(ctrl);
		return td;
	}

	/* Render a checkbox as a toggle switch (keeps the live checkbox + its id). */
	function switchWrap(cb) {
		if (!cb) return null;
		var lab = document.createElement("label");
		lab.className = "cqb-switch";
		lab.appendChild(cb);
		var track = document.createElement("span");
		track.className = "cqb-switch-track";
		lab.appendChild(track);
		return lab;
	}

	function L(key, dflt) { return (window.theUILang && theUILang[key]) || dflt; }
	function unitKbs() { return L("KB", "KiB") + "/" + L("s", "s"); }

	function humanBytes(n) {
		var u = ["B", "KiB", "MiB", "GiB", "TiB", "PiB"], i = 0;
		while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
		return (n % 1 === 0 ? n : n.toFixed(1)) + " " + u[i];
	}

	/* Advanced rtorrent keys: human label + unit; `b` marks a bytes value. */
	var AO_KEYS = {
		hash_interval: { label: L("cqb_ao_hash_interval", "Hash check interval"), unit: "ms" },
		hash_max_tries: { label: L("cqb_ao_hash_max_tries", "Hash check max tries") },
		hash_read_ahead: { label: L("cqb_ao_hash_read_ahead", "Hash read-ahead"), unit: "MiB" },
		preload_type: { label: L("cqb_ao_preload_type", "Preload type") },
		preload_min_size: { label: L("cqb_ao_preload_min_size", "Preload minimum size"), unit: "bytes", b: true },
		preload_required_rate: { label: L("cqb_ao_preload_required_rate", "Preload required rate"), unit: "bytes", b: true },
		receive_buffer_size: { label: L("cqb_ao_receive_buffer_size", "Receive buffer size"), unit: "bytes", b: true },
		send_buffer_size: { label: L("cqb_ao_send_buffer_size", "Send buffer size"), unit: "bytes", b: true },
		max_downloads_div: { label: L("cqb_ao_max_downloads_div", "Max downloads divisor") },
		max_uploads_div: { label: L("cqb_ao_max_uploads_div", "Max uploads divisor") },
		max_file_size: { label: L("cqb_ao_max_file_size", "Maximum file size"), unit: "bytes", b: true },
		split_file_size: { label: L("cqb_ao_split_file_size", "Split file size"), unit: "bytes", b: true },
		split_suffix: { label: L("cqb_ao_split_suffix", "Split suffix") },
		http_cacert: { label: L("cqb_ao_http_cacert", "HTTP CA certificate") },
		http_capath: { label: L("cqb_ao_http_capath", "HTTP CA path") },
		http_proxy: { label: L("cqb_ao_http_proxy", "HTTP proxy") },
		proxy_address: { label: L("cqb_ao_proxy_address", "Proxy address") },
		bind: { label: L("cqb_ao_bind", "Bind address") },
		session: { label: L("cqb_ao_session", "Session directory") },
		timeout_safe_sync: { label: L("cqb_ao_timeout_safe_sync", "Safe sync timeout"), unit: "s" },
		timeout_sync: { label: L("cqb_ao_timeout_sync", "Sync timeout"), unit: "s" }
	};

	/* A tile for one Advanced key: human label, raw key subtext, unit, hint. */
	function aoTile(id) {
		var ctrl = document.getElementById(id);
		if (!ctrl) return null;
		var spec = AO_KEYS[id] || {};
		var tile = document.createElement("div");
		tile.className = "cqb-field cqb-ao-field";
		var lab = document.createElement("label");
		lab.setAttribute("for", id);
		lab.textContent = spec.label || id;
		tile.appendChild(lab);
		var key = document.createElement("div");
		key.className = "cqb-ao-key";
		key.textContent = id;
		tile.appendChild(key);
		var wrap = document.createElement("div");
		wrap.className = "cqb-control";
		wrap.appendChild(ctrl);
		if (spec.unit) {
			wrap.classList.add("cqb-has-unit");
			var u = document.createElement("span");
			u.className = "cqb-unit";
			u.textContent = spec.unit === "bytes" ? L("cqb_unit_bytes", "bytes") : spec.unit;
			wrap.appendChild(u);
		}
		tile.appendChild(wrap);
		if (ctrl.tagName === "INPUT" && ctrl.type !== "checkbox" && !ctrl.value) ctrl.placeholder = L("cqb_not_set", "Not set");
		if (spec.b) {
			var hint = document.createElement("div");
			hint.className = "cqb-ao-hint";
			var upd = function () { var n = parseInt(ctrl.value, 10); hint.textContent = n > 0 ? humanBytes(n) : ""; };
			upd();
			ctrl.addEventListener("input", upd);
			tile.appendChild(hint);
		}
		return tile;
	}

	function aoGrid(ids) {
		var grid = document.createElement("div");
		grid.className = "cqb-field-grid";
		ids.forEach(function (id) { var t = aoTile(id); if (t) grid.appendChild(t); });
		return grid.children.length ? grid : null;
	}

	var LAYOUTS = {
		st_gl: function (pane) {
			var fs = pane.querySelectorAll("fieldset");
			if (fs[0]) {
				var checks = checkGridFrom(fs[0]);
				var grid = fieldGrid([
					{ id: "webui.update_interval", unit: L("ms", "ms") },
					{ id: "webui.reqtimeout", unit: L("ms", "ms") },
					{ id: "webui.speedgraph.max_seconds" },
					{ id: "webui.retry_on_error" },
					{ id: "webui.lang" },
					{ id: "webui.theme" },
					{ id: "qb.variant" }
				]);
				if (grid && checks) grid.style.marginTop = "12px";
				rebuildFieldset(fs[0], [checks, grid]);
			}
			if (fs[1]) rebuildFieldset(fs[1], [fieldGrid([{ id: "webui.speedlistul" }, { id: "webui.speedlistdl" }])]);
		},
		st_dl: function (pane) {
			var fs = pane.querySelectorAll("fieldset");
			if (fs[0]) rebuildFieldset(fs[0], [fieldGrid([
				{ id: "max_uploads" }, { id: "min_peers" }, { id: "max_peers" },
				{ id: "min_peers_seed" }, { id: "max_peers_seed" }, { id: "tracker_numwant" }
			])]);
			if (fs[1]) {
				var checks = checkGridFrom(fs[1]);
				var dir = wideField("directory", { path: true });
				if (dir && checks) dir.style.marginTop = "12px";
				rebuildFieldset(fs[1], [checks, dir]);
			}
		},
		st_con: function (pane) {
			var fs = pane.querySelectorAll("fieldset");
			if (fs[0]) rebuildFieldset(fs[0], [checkGridFrom(fs[0]), wideField("port_range")]);
			if (fs[1]) {
				var grid = fieldGrid([
					{ id: "upload_rate", label: cleanLabel(L("Global_max_upl", "Upload rate")), unit: unitKbs() },
					{ id: "download_rate", label: cleanLabel(L("Glob_max_downl", "Download rate")), unit: unitKbs() }
				]);
				rebuildFieldset(fs[1], [grid, helpLine(L("cqb_zero_unlimited", "Set 0 for unlimited."))]);
			}
			if (fs[2]) {
				var grid2 = fieldGrid([
					{ id: "max_uploads_global" }, { id: "max_downloads_global" },
					{ id: "max_memory_usage", unit: L("MB", "MB") },
					{ id: "max_open_files" }, { id: "max_open_http" }
				]);
				var budget = document.getElementById("socket_alloc_budget");
				var nodes = [grid2];
				if (budget) { budget.classList.add("cqb-help"); nodes.push(budget); }
				rebuildFieldset(fs[2], nodes);
			}
		},
		st_bt: function (pane) {
			var fs = pane.querySelectorAll("fieldset");
			if (fs[0]) rebuildFieldset(fs[0], [checkGridFrom(fs[0]), fieldGrid([{ id: "dht_port" }, { id: "ip" }])]);
		},
		st_dev: function (pane) {
			var fs = pane.querySelectorAll("fieldset");
			if (fs[0]) rebuildFieldset(fs[0], [fieldGrid([
				{ id: "webui.side_panel_min_width", unit: L("Pixel", "px") },
				{ id: "webui.side_panel_max_width_percent", unit: "%" },
				{ id: "webui.list_table_min_height", unit: L("Pixel", "px") }
			])]);
		},
		st_loginmgr: function (pane) {
			var fss = [].slice.call(pane.querySelectorAll("fieldset"));
			if (!fss.length) return;
			var rows = [];
			fss.forEach(function (fs) {
				var legend = fs.querySelector("legend");
				var name = legend ? legend.textContent.trim() : "";
				var en = fs.querySelector('input[type="checkbox"]');
				var auto = fs.querySelector("select");
				var login = fs.querySelector('input[type="text"]');
				var pass = fs.querySelector('input[type="password"]');
				if (en) en.setAttribute("aria-label", name + " " + L("cqb_enabled", "Enabled"));
				if (login) login.setAttribute("aria-label", L("cqb_acct_login", "{name} login").replace("{name}", name));
				if (pass) pass.setAttribute("aria-label", L("cqb_acct_password", "{name} password").replace("{name}", name));
				if (auto) auto.setAttribute("aria-label", L("cqb_acct_autologin", "{name} autologin").replace("{name}", name));
				if (login) login.placeholder = "—";
				if (pass) pass.placeholder = "—";
				var on = !!(en && en.checked);
				rows.push({ name: name, en: en, auto: auto, login: login, pass: pass, on: on, cfg: on || !!(login && login.value) });
			});
			rows.sort(function (a, b) { return a.cfg !== b.cfg ? (a.cfg ? -1 : 1) : a.name.localeCompare(b.name); });

			var wrap = document.createElement("div");
			wrap.className = "cqb-table-wrap";
			var table = document.createElement("table");
			table.className = "cqb-table cqb-accounts";
			var thead = document.createElement("thead");
			var htr = document.createElement("tr");
			[[L("cqb_tracker", "Tracker"), ""], [L("cqb_enabled", "Enabled"), "cqb-col-en"],
			 [L("Autologin", "Autologin"), "cqb-col-auto"], [L("Login", "Login"), ""], [L("Password", "Password"), ""]]
				.forEach(function (c) { var th = document.createElement("th"); th.textContent = c[0]; if (c[1]) th.className = c[1]; htr.appendChild(th); });
			thead.appendChild(htr);
			var tbody = document.createElement("tbody");
			rows.forEach(function (r) {
				var tr = document.createElement("tr");
				tr.dataset.name = r.name.toLowerCase();
				var tdName = document.createElement("td");
				tdName.className = "cqb-acct-name";
				if (r.cfg) {
					var dot = document.createElement("span");
					dot.className = "cqb-acct-dot" + (r.on ? " cqb-on" : "");
					tdName.appendChild(dot);
				}
				tdName.appendChild(document.createTextNode(r.name));
				tr.appendChild(tdName);
				tr.appendChild(acctCell(switchWrap(r.en), "cqb-acct-en"));
				tr.appendChild(acctCell(r.auto, "cqb-col-auto"));
				tr.appendChild(acctCell(r.login, ""));
				tr.appendChild(acctCell(r.pass, ""));
				tbody.appendChild(tr);
			});
			table.appendChild(thead);
			table.appendChild(tbody);
			wrap.appendChild(table);

			var filt = document.createElement("div");
			filt.className = "cqb-acct-filter";
			filt.appendChild(mkIcon("toolbar-search"));
			var inp = document.createElement("input");
			inp.type = "search";
			inp.placeholder = L("cqb_filter_trackers", "Filter trackers");
			inp.setAttribute("aria-label", L("cqb_filter_trackers", "Filter trackers"));
			filt.appendChild(inp);
			var empty = document.createElement("div");
			empty.className = "cqb-help cqb-acct-empty";
			empty.textContent = L("cqb_stg_empty", "No matching trackers");
			empty.style.display = "none";
			inp.addEventListener("input", function () {
				var q = inp.value.trim().toLowerCase();
				var shown = 0, trs = tbody.querySelectorAll("tr");
				for (var i = 0; i < trs.length; i++) {
					var m = !q || (trs[i].dataset.name || "").indexOf(q) !== -1;
					trs[i].style.display = m ? "" : "none";
					if (m) shown++;
				}
				empty.style.display = shown ? "none" : "block";
			});

			fss.forEach(function (fs) { fs.remove(); });
			pane.appendChild(filt);
			pane.appendChild(wrap);
			pane.appendChild(empty);
		},
		st_ao: function (pane) {
			var fs = pane.querySelectorAll("fieldset")[0];
			if (!fs) return;
			var checks = checkGridFrom(fs);
			var groups = [
				[L("cqb_grp_hashing", "Hashing"), ["hash_interval", "hash_max_tries", "hash_read_ahead"]],
				[L("cqb_grp_preload", "Preload"), ["preload_type", "preload_min_size", "preload_required_rate"]],
				[L("cqb_grp_buffers", "Buffers"), ["receive_buffer_size", "send_buffer_size"]],
				[L("cqb_grp_limits", "Limits"), ["max_downloads_div", "max_uploads_div", "max_file_size", "split_file_size", "split_suffix"]],
				[L("cqb_grp_network", "Network"), ["http_cacert", "http_capath", "http_proxy", "proxy_address", "bind"]],
				[L("cqb_grp_session", "Session"), ["session", "timeout_safe_sync", "timeout_sync"]]
			];
			var nodes = [];
			groups.forEach(function (g) {
				var grid = aoGrid(g[1]);
				if (grid) {
					var h = document.createElement("div");
					h.className = "cqb-heading cqb-subhead";
					h.textContent = g[0];
					nodes.push(h, grid);
				}
			});
			if (checks) {
				var hc = document.createElement("div");
				hc.className = "cqb-heading cqb-subhead";
				hc.textContent = L("cqb_grp_flags", "Flags");
				nodes.push(hc, checks);
			}
			rebuildFieldset(fs, nodes);
		},
		st_fmt: function (pane) {
			var fs = pane.querySelectorAll("fieldset");
			if (fs[0]) {
				var checks = checkGridFrom(fs[0]);
				var grid = fieldGrid([{ id: "webui.dateformat" }]);
				if (grid && checks) checks.style.marginTop = "12px";
				rebuildFieldset(fs[0], [grid, checks]);
			}
			if (fs[1]) {
				var table = fs[1].querySelector("table");
				if (table) {
					table.classList.add("cqb-table");
					var tds = table.querySelectorAll("tbody td");
					for (var i = 0; i < tds.length; i++) if (tds[i].querySelector("input")) tds[i].classList.add("cqb-num");
					var ths = table.querySelectorAll("thead th");
					for (var j = 1; j < ths.length; j++) ths[j].classList.add("cqb-col-num");
				}
				fs[1].appendChild(helpLine(L("cqb_decimals_hint", "Leave a cell blank to inherit the default.")));
			}
		}
	};

	function layoutPane(pane) {
		if (pane.dataset.cqbLaid) return;
		var fn = LAYOUTS[pane.id];
		if (!fn) return;
		try { fn(pane); wireBrowsers(pane); } catch (e) { /* a layout error must never break the dialog */ }
		pane.dataset.cqbLaid = "1";
	}

	/* Relabel the dialog's confirm button to "Save" (keeps its click handler). */
	function relabelSave() {
		var bar = document.querySelector("#stg #st_btns");
		if (!bar) return;
		var btns = bar.querySelectorAll("button");
		for (var i = 0; i < btns.length; i++) {
			if (!btns[i].classList.contains("Cancel") && !btns[i].dataset.cqbSave) {
				btns[i].textContent = L("Save", "Save");
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
