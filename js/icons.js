/*
 *  club-QuickBox skin for ruTorrent -- dynamic label/tracker icon system.
 *
 *  Gives every sidebar label/tracker row a crisp, theme-tinted SVG glyph in
 *  place of the tracklabels plugin's raster PNGs, resolves a smart default
 *  from the label's name, and opens a v4-dashboard icon picker (hundreds of
 *  glyphs, search, categories, tint, PNG upload) from the row context menu or
 *  a hover affordance. Choices persist per user, server-side, through
 *  ruTorrent's own setuisettings store (a webui.* key), so they survive a hard
 *  reload and a fresh browser session and show in plain ruTorrent too.
 *
 *  The plugin's own files are never touched: the glyph is published as the
 *  inherited --cqb-mask custom property on each panel-label host, and the
 *  ::part(icon) rule in icons.css paints it with !important so it wins over
 *  the inline background-image the plugin keeps re-setting. Upload still runs
 *  through the plugin's action.php endpoint.
 */
;(function () {
	var cqb = window.cqb || {};
	var PATH = cqb.path || "";
	var STORE_KEY = "webui.cqb.icons";
	var ACTION = "plugins/tracklabels/action.php";

	function t(key, fallback) { return (window.theUILang && theUILang[key]) || fallback; }

	/* The row image probe, upload and delete all go through the tracklabels
	 * plugin's action.php. On a ruTorrent where that plugin is not installed,
	 * every one of those requests would 404, so skip them: label rows fall back
	 * to library glyphs and the picker drops its Upload tab, with nothing to
	 * fail. The feature modules load only after plugins finish, so the lookup is
	 * stable and cached. */
	var hasTracklabels = null;
	function tracklabelsInstalled() {
		if (hasTracklabels !== null) return hasTracklabels;
		hasTracklabels = false;
		try {
			if (window.thePlugins) {
				if (typeof thePlugins.isInstalled === "function") hasTracklabels = !!thePlugins.isInstalled("tracklabels");
				else if (typeof thePlugins.get === "function") hasTracklabels = thePlugins.get("tracklabels") != null;
			}
		} catch (e) { hasTracklabels = false; }
		return hasTracklabels;
	}

	/* Short sha-256 prefixes of the plugin's bundled default PNGs -> the library
	 * glyph each maps to. A fetched row image whose hash is NOT here (and is not
	 * unknown.png) is a real user upload or a live favicon, so it is respected. */
	var UNKNOWN_HASH = "0d33f9a777c0c48a";
	var BUNDLED = {
		"92fb9bd032cf605a": "label",         // 1337x
		"addf0b8990aec27c": "application",   // app
		"c736c09d3844174b": "book",          // book
		"3a55dc96e50bbcda": "filmstrip",     // film
		"02e24e6eb14c7f4f": "gamepad",       // game2
		"6997e2d791833883": "gamepad",       // game
		"0073c6c0f3d819cb": "file-image",    // image
		"a4177bc1a6f1389c": "label",         // ipt
		"8e23dd18c026f9af": "teddy-bear",    // kid
		"d14e88305370a6ab": "movie",         // movie
		"a19afea4daebc861": "music",         // music
		"b02b5b8d78cca7aa": "label",         // nlb (also skipped by name)
		"5152dc7a0ef7fc5f": "dots-horizontal", // other
		"43101179e3797c9a": "package",       // pack
		"ef8e25507d262696": "incognito",     // porn
		"5fa678ec06ef8e15": "movie",         // radarr
		"3106be27905518f3": "television",    // serie
		"d377b1cb6da4f22d": "television",    // sickbeard
		"d27c25c6f2fdc554": "application",   // software
		"e45b6af38dc8ccc1": "television",    // sonarr
		"1b78d2a1ad5a3db5": "soccer",        // sport
		"a496c575b8960bac": "label",         // tl
		"0461b7655a94c488": "download",      // transfer
		"3a93c0048b77c2ac": "file-video"     // video
	};

	var NEUTRAL_LABEL = "label";
	var NEUTRAL_TRACKER = "earth-off";

	/* Smart default resolver: ordered word-boundary rules over the normalised
	 * label name (lower-cased, separators -> spaces). First match wins; the
	 * *arr app names map to their category glyph (no trademarked logos). */
	var SMART = [
		[/\b(radarr)\b/, "movie"],
		[/\b(sonarr)\b/, "television"],
		[/\b(lidarr)\b/, "music"],
		[/\b(readarr)\b/, "book"],
		[/\b(prowlarr|jackett|indexers?)\b/, "magnify"],
		[/\b(whisparr)\b/, "incognito"],
		[/\b(audiobooks?)\b/, "headphones"],
		[/\b(anime)\b/, "animation-play"],
		[/\b(podcasts?)\b/, "podcast"],
		[/\b(documentar(y|ies)|docus?)\b/, "filmstrip"],
		[/\b(movies?|films?|4k|uhd|remux|blu-?ray|hdr)\b/, "movie"],
		[/\b(tv|shows?|series|episodes?|seasons?)\b/, "television"],
		[/\b(music|flac|mp3|songs?|albums?|audio)\b/, "music"],
		[/\b(ebooks?|epub|novels?|books?)\b/, "book"],
		[/\b(comics?|manga)\b/, "comic"],
		[/\b(photos?|pictures?|images?|pics?)\b/, "file-image"],
		[/\b(courses?|tutorials?|udemy|learning?)\b/, "school"],
		[/\b(games?|console)\b/, "gamepad"],
		[/\b(linux|ubuntu|debian)\b/, "linux"],
		[/\b(windows)\b/, "microsoft-windows"],
		[/\b(macos|osx|apple)\b/, "apple"],
		[/\b(android)\b/, "android"],
		[/\b(software|apps?|iso|programs?)\b/, "application"],
		[/\b(sports?|football|soccer|nfl|nba|basketball)\b/, "soccer"],
		[/\b(kids?|family|children|cartoons?)\b/, "teddy-bear"],
		[/\b(xxx|adult|porn|nsfw)\b/, "incognito"]
	];

	/* Tint swatches: id -> css value. "auto" follows the variant via the token
	 * fallback in icons.css (--qb-icon, or --qb-primary-text when selected). */
	var TINT_VAR = {
		primary: "var(--qb-primary)",
		accent: "var(--qb-accent)",
		down: "var(--qb-state-downloading)",
		seed: "var(--qb-state-seeding)",
		paused: "var(--qb-state-paused)",
		error: "var(--qb-destructive)",
		muted: "var(--qb-fg-muted)",
		fg: "var(--qb-foreground)"
	};
	var TINT_ORDER = ["auto", "primary", "accent", "down", "seed", "paused", "error", "muted", "fg"];

	function smartResolve(name) {
		var n = " " + String(name).toLowerCase().replace(/[\-_.\/]+/g, " ").replace(/\s+/g, " ") + " ";
		for (var i = 0; i < SMART.length; i++) {
			if (SMART[i][0].test(n)) return SMART[i][1];
		}
		return null;
	}

	/* ---------- library (lazy) ---------- */
	var libPromise = null, libMap = null, libData = null;
	function ensureLib() {
		if (!libPromise) {
			libPromise = fetch(PATH + "images/icons/library.json", { credentials: "same-origin" })
				.then(function (r) { return r.json(); })
				.then(function (j) {
					libData = j;
					libMap = {};
					j.icons.forEach(function (i) { libMap[i.n] = i; });
					return j;
				})
				.catch(function () { libMap = {}; libData = { cats: [], icons: [] }; return libData; });
		}
		return libPromise;
	}
	function maskUrl(name) {
		var rec = libMap && libMap[name];
		if (!rec) return null;
		var svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>" + rec.p + "</svg>";
		return "url(\"data:image/svg+xml," + encodeURIComponent(svg) + "\")";
	}

	/* ---------- persistence (ruTorrent setuisettings) ---------- */
	function loadStore() {
		try {
			var raw = window.theWebUI && theWebUI.settings ? theWebUI.settings[STORE_KEY] : null;
			return raw ? JSON.parse(raw) : {};
		} catch (e) { return {}; }
	}
	function saveStore(s) {
		try {
			theWebUI.settings[STORE_KEY] = JSON.stringify(s);
			if (typeof theWebUI.save === "function") theWebUI.save();
		} catch (e) { /* storage unavailable: a session-only apply still paints */ }
	}

	/* ---------- upload detection (hash the fetched row image) ---------- */
	var detectCache = {};
	function sha16(buf) {
		return crypto.subtle.digest("SHA-256", buf).then(function (d) {
			var a = new Uint8Array(d), h = "", i;
			for (i = 0; i < 8; i++) h += ("0" + a[i].toString(16)).slice(-2);
			return h;
		});
	}
	function imageUrl(kind, name) {
		return PATH + ACTION + "?" + (kind === "tracker" ? "tracker" : "label") + "=" + encodeURIComponent(name);
	}
	function detectImage(kind, name) {
		var key = kind + ":" + name;
		if (detectCache[key]) return detectCache[key];
		if (!tracklabelsInstalled()) {
			detectCache[key] = Promise.resolve({ kind: "none" });
			return detectCache[key];
		}
		detectCache[key] = fetch(imageUrl(kind, name), { credentials: "same-origin" })
			.then(function (r) { return r.ok ? r.arrayBuffer() : null; })
			.then(function (buf) {
				if (!buf) return { kind: "none" };
				return sha16(buf).then(function (h) {
					if (h === UNKNOWN_HASH) return { kind: "unknown" };
					if (BUNDLED.hasOwnProperty(h)) return { kind: "bundled", glyph: BUNDLED[h] };
					return { kind: "custom" };
				});
			})
			.catch(function () { return { kind: "none" }; });
		return detectCache[key];
	}

	/* ---------- row rendering ---------- */
	function parseRow(el) {
		var ic = el.getAttribute("icon") || "";
		if (ic.indexOf("url:") !== 0) return null;
		var m = ic.match(/[?&](label|tracker)=([^&]*)/);
		if (!m) return null;
		var name;
		try { name = decodeURIComponent(m[2]); } catch (e) { name = m[2]; }
		return { kind: m[1] === "tracker" ? "tracker" : "label", name: name };
	}
	function applyMask(el, glyph, tintId) {
		var mu = maskUrl(glyph);
		if (!mu) return;
		el.style.setProperty("--cqb-mask", mu);
		if (tintId && tintId !== "auto" && TINT_VAR[tintId]) el.style.setProperty("--cqb-tint", TINT_VAR[tintId]);
		else el.style.removeProperty("--cqb-tint");
		el.setAttribute("data-cqb-mask", glyph);
	}
	function clearMask(el) {
		el.removeAttribute("data-cqb-mask");
		el.style.removeProperty("--cqb-mask");
		el.style.removeProperty("--cqb-tint");
	}
	function renderRow(el) {
		var row = parseRow(el);
		if (!row || row.name === "nlb") return; // nlb bucket is owned by sidebar.css
		var key = row.kind + ":" + row.name;
		ensureLib().then(function () {
			var pick = loadStore()[key];
			if (pick && pick.icon && libMap[pick.icon]) { applyMask(el, pick.icon, pick.tint); return; }
			detectImage(row.kind, row.name).then(function (res) {
				if (res.kind === "custom") { clearMask(el); return; } // real upload / favicon
				if (row.kind === "label") {
					var sd = smartResolve(row.name);
					if (sd) { applyMask(el, sd, "auto"); return; }
					if (res.kind === "bundled" && res.glyph) { applyMask(el, res.glyph, "auto"); return; }
					applyMask(el, NEUTRAL_LABEL, "auto");
					return;
				}
				if (res.kind === "bundled" && res.glyph) { applyMask(el, res.glyph, "auto"); return; }
				if (res.kind === "unknown") { applyMask(el, NEUTRAL_TRACKER, "auto"); return; }
				clearMask(el); // a live favicon: respect it
			});
		});
	}
	function onIcon(el) {
		var ic = el.getAttribute("icon") || "";
		if (ic.indexOf("url:") !== 0) return;
		if (el._cqbIcon === ic) return;
		var prev = el._cqbIcon;
		el._cqbIcon = ic;
		var row = parseRow(el);
		if (row && prev) {
			var pm = prev.match(/[?&](label|tracker)=([^&]*)/);
			var prevName = null;
			if (pm) { try { prevName = decodeURIComponent(pm[2]); } catch (e) { prevName = pm[2]; } }
			if (prevName === row.name) delete detectCache[row.kind + ":" + row.name]; // upload cache-bust
		}
		renderRow(el);
	}
	function scanAll() {
		var rows = document.querySelectorAll('panel-label[icon^="url:"]');
		for (var i = 0; i < rows.length; i++) onIcon(rows[i]);
	}
	function observeCatList() {
		var list = document.getElementById("CatList");
		if (!list || !window.MutationObserver) return;
		new MutationObserver(function (muts) {
			for (var i = 0; i < muts.length; i++) {
				var m = muts[i];
				if (m.type === "attributes" && m.target.tagName === "PANEL-LABEL") {
					onIcon(m.target);
				} else if (m.type === "childList") {
					for (var j = 0; j < m.addedNodes.length; j++) {
						var n = m.addedNodes[j];
						if (n.nodeType !== 1) continue;
						if (n.tagName === "PANEL-LABEL") onIcon(n);
						else if (n.querySelectorAll) {
							var sub = n.querySelectorAll('panel-label[icon^="url:"]');
							for (var k = 0; k < sub.length; k++) onIcon(sub[k]);
						}
					}
				}
			}
		}).observe(list, { subtree: true, childList: true, attributes: true, attributeFilter: ["icon"] });
	}

	/* ---------- hover edit affordance ---------- */
	var editBtn = null, editRow = null, hideTimer = null;
	function ensureEditBtn() {
		if (editBtn) return editBtn;
		editBtn = document.createElement("button");
		editBtn.type = "button";
		editBtn.className = "cqb-row-edit";
		cqb.tooltip ? cqb.tooltip(editBtn, t("cqb_icons_choose", "Choose icon")) : editBtn.setAttribute("aria-label", t("cqb_icons_choose", "Choose icon"));
		editBtn.addEventListener("click", function (e) {
			e.stopPropagation();
			e.preventDefault();
			if (editRow) { var r = parseRow(editRow); if (r) openPicker(r.kind, r.name); }
		});
		editBtn.addEventListener("mouseenter", function () { clearTimeout(hideTimer); });
		editBtn.addEventListener("mouseleave", scheduleHideEdit);
		document.body.appendChild(editBtn);
		return editBtn;
	}
	function rowPanelId(el) {
		var p = el.closest ? el.closest("category-panel") : null;
		return p ? p.id : "";
	}
	function showEditFor(el) {
		if (!parseRow(el)) return;
		var pid = rowPanelId(el);
		if (pid !== "plabel" && pid !== "ptrackers") return;
		if (parseRow(el).name === "nlb") return;
		var b = ensureEditBtn();
		editRow = el;
		var r = el.getBoundingClientRect();
		// Seat the 24px button in the right-edge slot the count/size cluster
		// vacates on hover (8px inset clears the row's own right padding).
		b.style.top = (r.top + (r.height - 24) / 2) + "px";
		b.style.left = (r.right - 24 - 8) + "px";
		b.classList.add("is-visible");
		clearTimeout(hideTimer);
	}
	function scheduleHideEdit() {
		clearTimeout(hideTimer);
		hideTimer = setTimeout(function () {
			if (editBtn) editBtn.classList.remove("is-visible");
			editRow = null;
		}, 120);
	}
	function wireHoverAffordance() {
		document.addEventListener("mouseover", function (e) {
			var row = e.target.closest ? e.target.closest("panel-label") : null;
			if (row) showEditFor(row);
		});
		document.addEventListener("mouseout", function (e) {
			var row = e.target.closest ? e.target.closest("panel-label") : null;
			if (row && row === editRow) scheduleHideEdit();
		});
		window.addEventListener("scroll", function () {
			if (editBtn) editBtn.classList.remove("is-visible");
			editRow = null;
		}, true);
	}

	/* ---------- the picker ---------- */
	var picker = null;

	function findRowEl(kind, name) {
		var rows = document.querySelectorAll('panel-label[icon^="url:"]');
		for (var i = 0; i < rows.length; i++) {
			var r = parseRow(rows[i]);
			if (r && r.kind === kind && r.name === name) return rows[i];
		}
		return null;
	}
	function guessKind(name) {
		if (findRowEl("tracker", name)) return "tracker";
		if (findRowEl("label", name)) return "label";
		return (name.indexOf(".") !== -1 && name.indexOf("/") === -1) ? "tracker" : "label";
	}

	function el(tag, cls, attrs) {
		var e = document.createElement(tag);
		if (cls) e.className = cls;
		if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
		return e;
	}

	function buildPicker() {
		var backdrop = el("div", "cqb-picker-backdrop");
		backdrop.setAttribute("role", "presentation");
		var panel = el("div", "cqb-picker");
		panel.setAttribute("role", "dialog");
		panel.setAttribute("aria-modal", "true");
		panel.setAttribute("aria-label", t("cqb_icons_choose", "Choose icon"));

		/* head */
		var head = el("div", "cqb-picker-head");
		var headIcon = el("div", "cqb-picker-head-icon");
		headIcon.setAttribute("aria-hidden", "true");
		var headText = el("div", "cqb-picker-head-text");
		var title = el("div", "cqb-picker-title"); title.textContent = t("cqb_icons_choose", "Choose icon");
		var sub = el("div", "cqb-picker-sub");
		headText.appendChild(title); headText.appendChild(sub);
		var close = el("button", "cqb-picker-close", { type: "button", "aria-label": t("Close", "Close") });
		head.appendChild(headIcon); head.appendChild(headText); head.appendChild(close);

		/* tabs */
		var tabs = el("div", "cqb-picker-tabs");
		var tabIcons = el("button", "cqb-tab", { type: "button", role: "tab", "aria-selected": "true" });
		tabIcons.textContent = t("cqb_icons_tab_icons", "Icons");
		var tabUpload = el("button", "cqb-tab", { type: "button", role: "tab", "aria-selected": "false" });
		tabUpload.textContent = t("cqb_icons_tab_upload", "Upload image");
		tabs.appendChild(tabIcons); tabs.appendChild(tabUpload);
		/* No upload target without the backing plugin: show glyphs only. */
		if (!tracklabelsInstalled()) { tabUpload.hidden = true; tabUpload.style.display = "none"; }

		/* --- icons panel --- */
		var iconsPanel = el("div", "cqb-panel");
		var controls = el("div", "cqb-picker-controls");
		var search = el("div", "cqb-pk-search cqb-input-group");
		var searchIco = el("span", "cqb-pk-search-ico"); searchIco.setAttribute("aria-hidden", "true");
		var searchInput = el("input", null, { type: "text", placeholder: t("cqb_icons_search", "Search icons"), "aria-label": t("cqb_icons_search", "Search icons") });
		search.appendChild(searchIco); search.appendChild(searchInput);
		var chips = el("div", "cqb-cat-chips"); chips.setAttribute("role", "group"); chips.setAttribute("aria-label", t("cqb_icons_categories", "Categories"));
		controls.appendChild(search); controls.appendChild(chips);
		var gridWrap = el("div", "cqb-grid-wrap");
		var grid = el("div", "cqb-grid"); grid.setAttribute("role", "listbox"); grid.setAttribute("aria-label", t("cqb_icons_tab_icons", "Icons"));
		var sentinel = el("div"); sentinel.style.height = "1px";
		gridWrap.appendChild(grid); gridWrap.appendChild(sentinel);
		iconsPanel.appendChild(controls); iconsPanel.appendChild(gridWrap);

		/* tint bar + preview */
		var tintbar = el("div", "cqb-tintbar");
		var tintLabel = el("span", "cqb-tintbar-label"); tintLabel.textContent = t("cqb_icons_tint", "Tint");
		var swatches = el("div", "cqb-swatches"); swatches.setAttribute("role", "group"); swatches.setAttribute("aria-label", t("cqb_icons_tint", "Tint"));
		var preview = el("div", "cqb-preview");
		var prevIcon = el("span", "cqb-preview-icon"); prevIcon.setAttribute("aria-hidden", "true");
		var prevText = el("span", "cqb-preview-text");
		preview.appendChild(prevIcon); preview.appendChild(prevText);
		tintbar.appendChild(tintLabel); tintbar.appendChild(swatches); tintbar.appendChild(preview);
		iconsPanel.appendChild(tintbar);

		/* --- upload panel --- */
		var uploadPanel = el("div", "cqb-panel"); uploadPanel.hidden = true;
		var upBody = el("div", "cqb-upload-body");
		var drop = el("div", "cqb-icons-dropzone", { tabindex: "0", role: "button", "aria-label": t("cqb_icons_upload_aria", "Upload a PNG image") });
		var dropIcon = el("div", "cqb-icons-dropzone-icon"); dropIcon.setAttribute("aria-hidden", "true");
		var dropTitle = el("div", "cqb-icons-dropzone-title"); dropTitle.textContent = t("cqb_icons_drop_title", "Drop a PNG here or click to browse");
		var dropHint = el("div", "cqb-icons-dropzone-hint"); dropHint.textContent = t("cqb_icons_drop_hint", "PNG only. Shown in plain ruTorrent too.");
		drop.appendChild(dropIcon); drop.appendChild(dropTitle); drop.appendChild(dropHint);
		var fileInput = el("input", null, { type: "file", accept: ".png,image/png" });
		fileInput.style.display = "none";
		var upPreview = el("div", "cqb-upload-preview"); upPreview.hidden = true;
		var upImg = el("img", null, { alt: "" });
		var upName = el("div", "cqb-upload-preview-name");
		upPreview.appendChild(upImg); upPreview.appendChild(upName);
		var upNote = el("div", "cqb-upload-note");
		upNote.textContent = t("cqb_icons_upload_note", "An uploaded image is kept as-is and takes priority over a chosen glyph. Remove it to fall back to the smart default.");
		upBody.appendChild(drop); upBody.appendChild(fileInput); upBody.appendChild(upPreview); upBody.appendChild(upNote);
		uploadPanel.appendChild(upBody);

		/* footer (shared) */
		var foot = el("div", "cqb-picker-foot");
		var resetBtn = el("button", "cqb-btn cqb-btn-ghost", { type: "button" }); resetBtn.textContent = t("cqb_icons_reset", "Reset to smart default");
		var spacer = el("div", "cqb-foot-spacer");
		var cancelBtn = el("button", "cqb-btn cqb-btn-secondary", { type: "button" }); cancelBtn.textContent = t("Cancel", "Cancel");
		var useBtn = el("button", "cqb-btn cqb-btn-primary", { type: "button" }); useBtn.textContent = t("cqb_icons_use", "Use icon");
		var deleteBtn = el("button", "cqb-btn cqb-btn-ghost", { type: "button" }); deleteBtn.textContent = t("cqb_icons_remove", "Remove image"); deleteBtn.hidden = true;
		var uploadBtn = el("button", "cqb-btn cqb-btn-primary", { type: "button" }); uploadBtn.textContent = t("cqb_icons_upload_btn", "Upload"); uploadBtn.hidden = true; uploadBtn.disabled = true;
		foot.appendChild(resetBtn); foot.appendChild(deleteBtn); foot.appendChild(spacer);
		foot.appendChild(cancelBtn); foot.appendChild(useBtn); foot.appendChild(uploadBtn);

		panel.appendChild(head); panel.appendChild(tabs);
		panel.appendChild(iconsPanel); panel.appendChild(uploadPanel);
		panel.appendChild(foot);
		backdrop.appendChild(panel);
		document.body.appendChild(backdrop);

		picker = {
			backdrop: backdrop, panel: panel, sub: sub, close: close,
			tabIcons: tabIcons, tabUpload: tabUpload,
			iconsPanel: iconsPanel, uploadPanel: uploadPanel,
			searchInput: searchInput, chips: chips, grid: grid, gridWrap: gridWrap, sentinel: sentinel,
			swatches: swatches, prevIcon: prevIcon, prevText: prevText,
			drop: drop, fileInput: fileInput, upPreview: upPreview, upImg: upImg, upName: upName,
			resetBtn: resetBtn, cancelBtn: cancelBtn, useBtn: useBtn, deleteBtn: deleteBtn, uploadBtn: uploadBtn,
			state: {}
		};
		wirePicker();
		return picker;
	}

	function focusables() {
		// Roving-tabindex grid tiles carry tabindex="-1"; the one active tile is
		// tabindex="0", so the grid is a single Tab stop in the trap cycle.
		return picker.panel.querySelectorAll(
			'button:not([hidden]):not([disabled]):not([tabindex="-1"]), input:not([hidden]), [tabindex="0"]'
		);
	}

	/* Column count of the auto-fill grid, read from the resolved track list. */
	function gridColumns() {
		var cs = window.getComputedStyle(picker.grid).gridTemplateColumns || "";
		var n = cs.split(/\s+/).filter(function (x) { return x && x !== "none"; }).length;
		return n > 0 ? n : 1;
	}
	/* Move the roving tabindex to one tile, focus it, keep it in view. */
	function focusTile(idx) {
		var tiles = picker.grid.querySelectorAll(".cqb-tile");
		if (!tiles.length) return;
		if (idx < 0) idx = 0;
		if (idx > tiles.length - 1) idx = tiles.length - 1;
		for (var i = 0; i < tiles.length; i++) tiles[i].setAttribute("tabindex", i === idx ? "0" : "-1");
		picker.state.rovingIndex = idx;
		var tile = tiles[idx];
		tile.focus();
		if (tile.scrollIntoView) tile.scrollIntoView({ block: "nearest", inline: "nearest" });
	}
	/* Ensure exactly one rendered tile is the Tab stop (defaults to the first). */
	function applyRoving() {
		var tiles = picker.grid.querySelectorAll(".cqb-tile");
		if (!tiles.length) return;
		var idx = picker.state.rovingIndex || 0;
		if (idx > tiles.length - 1) idx = 0;
		for (var i = 0; i < tiles.length; i++) tiles[i].setAttribute("tabindex", i === idx ? "0" : "-1");
		picker.state.rovingIndex = idx;
	}

	function closePicker() {
		if (!picker) return;
		picker.backdrop.classList.remove("is-open");
		var p = picker;
		setTimeout(function () { p.backdrop.style.display = "none"; }, 160);
		if (picker.state.lastFocus && picker.state.lastFocus.focus) {
			try { picker.state.lastFocus.focus(); } catch (e) {}
		}
	}

	function renderGrid() {
		var g = picker.grid, st = picker.state;
		g.innerHTML = "";
		var term = (picker.searchInput.value || "").trim().toLowerCase();
		var cat = st.cat || "all";
		var all = libData.icons;
		var filtered = [];
		for (var i = 0; i < all.length; i++) {
			var ic = all[i];
			if (cat !== "all" && ic.c !== cat) continue;
			if (term) {
				var hit = ic.n.indexOf(term) !== -1;
				if (!hit) {
					for (var ti = 0; ti < ic.t.length; ti++) { if (ic.t[ti].indexOf(term) !== -1) { hit = true; break; } }
				}
				if (!hit) continue;
			}
			filtered.push(ic);
		}
		st.filtered = filtered;
		st.rendered = 0;
		if (!filtered.length) {
			var empty = el("div", "cqb-grid-empty"); empty.textContent = t("cqb_icons_no_match", "No icons match “{term}”").replace("{term}", term);
			g.appendChild(empty);
			return;
		}
		// Start the roving stop on the current pick if it is in the filtered set.
		st.rovingIndex = 0;
		if (st.glyph) {
			for (var r = 0; r < filtered.length; r++) { if (filtered[r].n === st.glyph) { st.rovingIndex = r; break; } }
		}
		appendTiles();
		// Make sure the initial roving tile is rendered, then mark it the Tab stop.
		while (st.rovingIndex >= st.rendered && st.rendered < filtered.length) appendTiles();
		applyRoving();
	}
	function appendTiles() {
		var st = picker.state, g = picker.grid, list = st.filtered;
		var end = Math.min(st.rendered + 90, list.length);
		for (var i = st.rendered; i < end; i++) {
			var ic = list[i];
			var tile = el("button", "cqb-tile", { type: "button", role: "option", tabindex: "-1", title: ic.n, "aria-label": ic.n });
			tile.style.setProperty("--cqb-tile-mask", maskUrl(ic.n));
			tile.setAttribute("data-icon", ic.n);
			if (ic.n === st.glyph) { tile.setAttribute("aria-pressed", "true"); tile.setAttribute("aria-selected", "true"); }
			g.appendChild(tile);
		}
		st.rendered = end;
	}
	function renderSwatches() {
		var sw = picker.swatches, st = picker.state;
		sw.innerHTML = "";
		TINT_ORDER.forEach(function (id) {
			var b = el("button", "cqb-swatch" + (id === "auto" ? " cqb-swatch-auto" : ""), {
				type: "button", "data-tint": id, "aria-label": id === "auto" ? t("cqb_icons_tint_auto", "Auto (variant)") : id,
				"aria-pressed": id === (st.tint || "auto") ? "true" : "false"
			});
			if (id !== "auto") b.style.setProperty("--cqb-swatch", TINT_VAR[id]);
			sw.appendChild(b);
		});
	}
	function updatePreview() {
		var st = picker.state;
		picker.prevText.textContent = st.name;
		var glyph = st.glyph || smartResolve(st.name) || (st.kind === "tracker" ? NEUTRAL_TRACKER : NEUTRAL_LABEL);
		var mu = maskUrl(glyph);
		if (mu) picker.prevIcon.style.setProperty("--cqb-prev-mask", mu);
		var tint = st.tint && st.tint !== "auto" ? TINT_VAR[st.tint] : "var(--qb-icon)";
		picker.prevIcon.style.setProperty("--cqb-prev-tint", tint);
		picker.useBtn.disabled = !st.glyph;
	}
	function renderChips() {
		var c = picker.chips, st = picker.state;
		c.innerHTML = "";
		var cats = [{ id: "all", name: t("cqb_icons_cat_all", "All") }].concat(libData.cats);
		cats.forEach(function (cat) {
			var b = el("button", "cqb-cat-chip", { type: "button", "data-cat": cat.id, "aria-pressed": (st.cat || "all") === cat.id ? "true" : "false" });
			b.textContent = cat.name;
			c.appendChild(b);
		});
		// "More" overflow trigger at the end of the one-line strip.
		var more = el("button", "cqb-cat-more", { type: "button", "aria-haspopup": "listbox", "aria-expanded": "false", "aria-label": t("cqb_icons_more_cats", "More categories") });
		var moreLbl = el("span", "cqb-cat-more-label"); moreLbl.textContent = t("cqb_icons_more", "More");
		var chev = el("span", "cqb-select-chevron"); chev.setAttribute("aria-hidden", "true");
		more.appendChild(moreLbl); more.appendChild(chev);
		picker.moreChip = more; picker.moreLabel = moreLbl;
		wireMoreChip(more);
		c.appendChild(more);
		fitChips();
	}
	/* Keep the chip strip to ONE row: park trailing non-active chips that will
	 * not fit and reach them through the More popover (the detail tab-strip
	 * overflow idiom). Recomputed whenever the strip is resized. */
	function fitChips() {
		var c = picker.chips, more = picker.moreChip;
		if (!c || !more) return;
		var chips = c.querySelectorAll(".cqb-cat-chip"), i;
		for (i = 0; i < chips.length; i++) chips[i].classList.remove("cqb-cat-parked");
		more.style.display = "none";
		if (c.clientWidth === 0) return;               // not displayed yet
		if (c.scrollWidth <= c.clientWidth + 1) return; // everything fits
		more.style.display = "";
		var parked = 0;
		for (i = chips.length - 1; i >= 0 && c.scrollWidth > c.clientWidth + 1; i--) {
			if (chips[i].getAttribute("aria-pressed") === "true") continue; // keep the active chip
			if (chips[i].getAttribute("data-cat") === "all") continue;       // keep All
			chips[i].classList.add("cqb-cat-parked");
			parked++;
		}
		if (parked === 0) { more.style.display = "none"; return; }
		picker.moreLabel.textContent = t("cqb_icons_more_count", "More ({n})").replace("{n}", parked);
	}
	function scheduleFitChips() {
		if (picker.fitScheduled) return;
		picker.fitScheduled = true;
		var run = function () { picker.fitScheduled = false; if (picker.backdrop.style.display !== "none") fitChips(); };
		if (window.requestAnimationFrame) requestAnimationFrame(run); else setTimeout(run, 16);
	}
	function wireMoreChip(btn) {
		var panel = null, options = [];
		function parkedChips() { return picker.chips.querySelectorAll(".cqb-cat-chip.cqb-cat-parked"); }
		function close(refocus) {
			if (!panel) return;
			document.removeEventListener("mousedown", onDown, true);
			window.removeEventListener("resize", onMove);
			window.removeEventListener("scroll", onMove, true);
			if (panel.parentNode) panel.parentNode.removeChild(panel);
			panel = null;
			btn.setAttribute("aria-expanded", "false");
			if (refocus) btn.focus();
		}
		function onDown(e) { if (btn.contains(e.target) || (panel && panel.contains(e.target))) return; close(false); }
		function onMove(e) {
			if (!panel) return;
			if (cqb && cqb.panelScrolledInside && cqb.panelScrolledInside(e, panel)) return;
			place();
		}
		function place() {
			var r = btn.getBoundingClientRect();
			var vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight, pad = 8, gap = 4;
			panel.querySelector(".cqb-select-list").style.maxHeight = Math.min(320, Math.floor(vh * 0.7), vh - r.bottom - pad) + "px";
			var pw = panel.offsetWidth;
			panel.style.top = Math.max(pad, r.bottom + gap) + "px";
			panel.style.left = Math.min(Math.max(pad, r.left), Math.max(pad, vw - pw - pad)) + "px";
		}
		function open() {
			panel = el("div", "cqb-select-panel cqb-cat-more-panel");
			panel.setAttribute("role", "presentation");
			panel.addEventListener("mousedown", function (e) { e.preventDefault(); });
			var list = el("div", "cqb-select-list"); list.setAttribute("role", "listbox"); list.setAttribute("aria-label", t("cqb_icons_more_cats", "More categories"));
			options = [];
			var parked = parkedChips();
			for (var i = 0; i < parked.length; i++) {
				(function (chip) {
					var row = el("button", "cqb-select-option", { type: "button", role: "option" });
					var lbl = el("span", "cqb-select-option-label"); lbl.textContent = chip.textContent;
					row.appendChild(lbl);
					row.addEventListener("click", function (e) {
						e.preventDefault();
						picker.state.cat = chip.getAttribute("data-cat");
						renderChips(); renderGrid();
						close(true);
					});
					list.appendChild(row);
					options.push(row);
				})(parked[i]);
			}
			panel.appendChild(list);
			document.body.appendChild(panel);
			btn.setAttribute("aria-expanded", "true");
			place();
			panel.classList.add("cqb-open");
			document.addEventListener("mousedown", onDown, true);
			window.addEventListener("resize", onMove);
			window.addEventListener("scroll", onMove, true);
			panel.addEventListener("keydown", function (e) {
				if (e.key === "Escape") { e.preventDefault(); close(true); return; }
				var idx = options.indexOf(document.activeElement);
				if (e.key === "ArrowDown") { e.preventDefault(); (options[idx + 1] || options[0]).focus(); }
				else if (e.key === "ArrowUp") { e.preventDefault(); (options[idx - 1] || options[options.length - 1]).focus(); }
				else if ((e.key === "Enter" || e.key === " " || e.key === "Spacebar") && idx >= 0) { e.preventDefault(); options[idx].click(); }
			});
			if (options[0]) options[0].focus();
		}
		btn.addEventListener("click", function () { if (panel) close(true); else open(); });
		btn.addEventListener("keydown", function (e) {
			if (!panel && (e.key === "Enter" || e.key === " " || e.key === "Spacebar" || e.key === "ArrowDown")) { e.preventDefault(); open(); }
			else if (panel && e.key === "Escape") { e.preventDefault(); close(true); }
		});
	}

	function selectTab(which) {
		var isIcons = which === "icons";
		picker.tabIcons.setAttribute("aria-selected", isIcons ? "true" : "false");
		picker.tabUpload.setAttribute("aria-selected", isIcons ? "false" : "true");
		picker.iconsPanel.hidden = !isIcons;
		picker.uploadPanel.hidden = isIcons;
		picker.resetBtn.hidden = !isIcons;
		picker.cancelBtn.hidden = false;
		picker.useBtn.hidden = !isIcons;
		picker.deleteBtn.hidden = isIcons || !picker.state.hasUpload;
		picker.uploadBtn.hidden = isIcons;
	}

	function doUpload(file) {
		if (!tracklabelsInstalled()) return;
		var st = picker.state;
		var fd = new FormData();
		fd.append("uploadfile", file, file.name);
		fd.append("upload", "on");
		var param = st.kind === "tracker" ? "tracker" : "label";
		fd.append(param, st.name);
		var xhr = new XMLHttpRequest();
		picker.uploadBtn.disabled = true;
		xhr.onloadend = function () {
			if (xhr.status === 200) {
				var store = loadStore();
				delete store[st.kind + ":" + st.name]; // upload wins over any picked glyph
				saveStore(store);
				var rowEl = findRowEl(st.kind, st.name);
				if (rowEl) {
					delete detectCache[st.kind + ":" + st.name];
					rowEl._cqbIcon = null;
					rowEl.setAttribute("icon", "url:" + ACTION + "?" + param + "=" + encodeURIComponent(st.name) + "&t=" + Date.now());
					renderRow(rowEl);
				}
				closePicker();
			} else {
				picker.uploadBtn.disabled = false;
				if (typeof noty === "function") noty(t("cqb_icons_upload_failed", "Upload failed: {msg}").replace("{msg}", xhr.responseText), "error");
			}
		};
		xhr.open("POST", imageUrl(st.kind, st.name));
		xhr.send(fd);
	}
	function doDeleteUpload() {
		if (!tracklabelsInstalled()) return;
		var st = picker.state;
		var fd = new FormData();
		fd.append("delete", "on");
		var param = st.kind === "tracker" ? "tracker" : "label";
		fd.append(param, st.name);
		var xhr = new XMLHttpRequest();
		xhr.onloadend = function () {
			var rowEl = findRowEl(st.kind, st.name);
			if (rowEl) {
				delete detectCache[st.kind + ":" + st.name];
				rowEl._cqbIcon = null;
				rowEl.setAttribute("icon", "url:" + ACTION + "?" + param + "=" + encodeURIComponent(st.name) + "&t=" + Date.now());
				renderRow(rowEl);
			}
			closePicker();
		};
		xhr.open("POST", imageUrl(st.kind, st.name));
		xhr.send(fd);
	}
	function setUploadPreview(file) {
		var st = picker.state;
		st.pendingFile = file;
		picker.uploadBtn.disabled = !file;
		if (!file) { picker.upPreview.hidden = true; return; }
		picker.upName.textContent = file.name;
		var fr = new FileReader();
		fr.onload = function () { picker.upImg.src = fr.result; picker.upPreview.hidden = false; };
		fr.readAsDataURL(file);
	}

	function wirePicker() {
		var p = picker;
		p.close.addEventListener("click", closePicker);
		p.cancelBtn.addEventListener("click", closePicker);
		p.backdrop.addEventListener("mousedown", function (e) { if (e.target === p.backdrop) closePicker(); });
		p.tabIcons.addEventListener("click", function () { selectTab("icons"); });
		p.tabUpload.addEventListener("click", function () { selectTab("upload"); });
		p.searchInput.addEventListener("input", renderGrid);
		p.chips.addEventListener("click", function (e) {
			var b = e.target.closest(".cqb-cat-chip"); if (!b) return;
			p.state.cat = b.getAttribute("data-cat");
			renderChips(); renderGrid();
		});
		// Recompute the one-row chip fit whenever the strip's width changes.
		if (window.ResizeObserver) new ResizeObserver(scheduleFitChips).observe(p.chips);
		window.addEventListener("resize", scheduleFitChips);
		p.grid.addEventListener("click", function (e) {
			var tileEl = e.target.closest(".cqb-tile"); if (!tileEl) return;
			var prev = p.grid.querySelector('.cqb-tile[aria-pressed="true"]');
			if (prev) { prev.removeAttribute("aria-pressed"); prev.removeAttribute("aria-selected"); }
			tileEl.setAttribute("aria-pressed", "true"); tileEl.setAttribute("aria-selected", "true");
			p.state.glyph = tileEl.getAttribute("data-icon");
			// Keep the roving Tab stop on the tile the user just acted on.
			var tiles = p.grid.querySelectorAll(".cqb-tile");
			for (var i = 0; i < tiles.length; i++) tiles[i].setAttribute("tabindex", tiles[i] === tileEl ? "0" : "-1");
			p.state.rovingIndex = Array.prototype.indexOf.call(tiles, tileEl);
			updatePreview();
		});
		p.grid.addEventListener("keydown", function (e) {
			var tiles = p.grid.querySelectorAll(".cqb-tile");
			if (!tiles.length) return;
			var cur = -1;
			for (var i = 0; i < tiles.length; i++) { if (tiles[i] === document.activeElement) { cur = i; break; } }
			if (cur === -1) return;
			var total = p.state.filtered ? p.state.filtered.length : tiles.length;
			var cols = gridColumns();
			var next = cur;
			switch (e.key) {
				case "ArrowRight": next = cur + 1; break;
				case "ArrowLeft": next = cur - 1; break;
				case "ArrowDown": next = cur + cols; if (next >= total) next = cur; break;
				case "ArrowUp": next = cur - cols; if (next < 0) next = cur; break;
				case "Home": next = 0; break;
				case "End": next = total - 1; break;
				case "Enter":
				case " ":
				case "Spacebar":
					e.preventDefault();
					tiles[cur].click();
					return;
				default: return;
			}
			e.preventDefault();
			if (next < 0) next = 0;
			if (next > total - 1) next = total - 1;
			// Lazy-render any tiles between the current edge and the target.
			while (next >= p.state.rendered && p.state.rendered < total) appendTiles();
			focusTile(next);
		});
		p.swatches.addEventListener("click", function (e) {
			var b = e.target.closest(".cqb-swatch"); if (!b) return;
			p.state.tint = b.getAttribute("data-tint");
			renderSwatches(); updatePreview();
		});
		p.useBtn.addEventListener("click", function () {
			var st = p.state;
			if (!st.glyph) return;
			var store = loadStore();
			store[st.kind + ":" + st.name] = { icon: st.glyph, tint: st.tint || "auto" };
			saveStore(store);
			var rowEl = findRowEl(st.kind, st.name);
			if (rowEl) applyMask(rowEl, st.glyph, st.tint || "auto");
			closePicker();
		});
		p.resetBtn.addEventListener("click", function () {
			var st = p.state;
			var store = loadStore();
			delete store[st.kind + ":" + st.name];
			saveStore(store);
			var rowEl = findRowEl(st.kind, st.name);
			if (rowEl) { rowEl._cqbIcon = null; renderRow(rowEl); }
			closePicker();
		});
		p.drop.addEventListener("click", function () { p.fileInput.click(); });
		p.drop.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); p.fileInput.click(); } });
		p.fileInput.addEventListener("change", function () { if (p.fileInput.files[0]) setUploadPreview(p.fileInput.files[0]); });
		["dragenter", "dragover"].forEach(function (ev) {
			p.drop.addEventListener(ev, function (e) { e.preventDefault(); p.drop.classList.add("is-drag"); });
		});
		["dragleave", "drop"].forEach(function (ev) {
			p.drop.addEventListener(ev, function (e) { e.preventDefault(); p.drop.classList.remove("is-drag"); });
		});
		p.drop.addEventListener("drop", function (e) {
			var f = e.dataTransfer && e.dataTransfer.files[0];
			if (f && /\.png$|image\/png/i.test(f.type || f.name)) setUploadPreview(f);
		});
		p.uploadBtn.addEventListener("click", function () { if (p.state.pendingFile) doUpload(p.state.pendingFile); });
		p.deleteBtn.addEventListener("click", doDeleteUpload);
		p.gridWrap.addEventListener("scroll", function () {
			var st = p.state;
			if (!st.filtered || st.rendered >= st.filtered.length) return;
			if (p.gridWrap.scrollTop + p.gridWrap.clientHeight >= p.gridWrap.scrollHeight - 120) appendTiles();
		});
		p.panel.addEventListener("keydown", function (e) {
			if (e.key === "Escape") { e.preventDefault(); closePicker(); return; }
			if (e.key !== "Tab") return;
			var f = focusables();
			if (!f.length) return;
			var first = f[0], last = f[f.length - 1];
			if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
			else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
		});
	}

	function openPicker(kind, name) {
		if (!kind) kind = guessKind(name);
		if (!picker) buildPicker();
		var p = picker;
		p.state = { kind: kind, name: name, lastFocus: document.activeElement };
		ensureLib().then(function () {
			var store = loadStore();
			var pick = store[kind + ":" + name];
			p.state.glyph = pick && pick.icon && libMap[pick.icon] ? pick.icon : null;
			p.state.tint = pick && pick.tint ? pick.tint : "auto";
			p.state.cat = "all";
			p.sub.textContent = (kind === "tracker"
				? t("cqb_icons_sub_tracker", "Tracker: {name}")
				: t("cqb_icons_sub_label", "Label: {name}")).replace("{name}", name);
			p.searchInput.value = "";
			selectTab("icons");
			renderChips();
			renderSwatches();
			renderGrid();
			updatePreview();
			// detect an existing upload so the Remove button can appear on the upload tab
			detectImage(kind, name).then(function (res) {
				p.state.hasUpload = res.kind === "custom";
				if (p.uploadPanel.hidden === false) selectTab("upload");
			});
			p.backdrop.style.display = "flex";
			// force reflow then animate in
			void p.backdrop.offsetWidth;
			p.backdrop.classList.add("is-open");
			fitChips(); // the strip now has a real width to measure against
			setTimeout(function () { p.searchInput.focus(); }, 30);
		});
	}

	/* ---------- boot ---------- */
	function boot() {
		ensureLib();
		scanAll();
		observeCatList();
		wireHoverAffordance();
		// Route the plugin's "Edit icon" context-menu entry to the picker.
		if (window.theWebUI) theWebUI.showTracklabelsDialog = function (lbl) { openPicker(null, lbl); };
		if (cqb.onVariant) cqb.onVariant(function () { /* masks follow tokens via CSS; nothing to repaint */ });
	}
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", boot);
	} else {
		boot();
	}
})();
