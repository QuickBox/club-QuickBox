/*
 *  club-QuickBox skin for ruTorrent -- about / what's new module.
 *
 *  Loaded by init.js once theWebUI is ready. Runs in global scope with
 *  theDialogManager, theUILang, jQuery and window.cqb available. Three jobs,
 *  all reading from the theme's OWN repo so the skin stays portable on a stock
 *  ruTorrent with no QuickBox present:
 *    1. show the installed theme version + a "What's new" link in the core
 *       Help dialog (the one the Help button opens);
 *    2. a "What's new" dialog built on the shared v4 dialog chrome that lists
 *       the bundled changelogs newest first, each rendered from a SAFE markdown
 *       subset (headings, bullets, inline code; links shown as plain text) with
 *       DOM + textContent only -- never innerHTML of fetched text;
 *    3. a courtesy check for a newer release, fetched at most once a day from a
 *       single fixed raw.githubusercontent URL with no credentials, deferred
 *       until idle and never blocking render. Any failure degrades silently to
 *       the bundled changelogs.
 *
 *  The one opener window.cqb.openWhatsNew is shared by the Help-dialog link and
 *  the command palette, so there is a single entry point and no new nav item.
 *  The leading semicolon keeps the file safe under script concatenation.
 */
;(function (cqb) {
	"use strict";
	if (!cqb) return;
	if (window.cqbAboutInit) return;
	window.cqbAboutInit = true;

	function t(key, fallback) {
		return (window.theUILang && theUILang[key]) || fallback;
	}

	var VERSION = cqb.version || "";
	/* Cache key for the theme's own asset URLs; init.js exposes it on cqb.rev.
	 * The local changelog fetches carry it so an update never serves stale notes. */
	var REV = cqb.rev || VERSION || "";

	/* The update check reads ONLY this fixed URL. latest is always the shipping
	 * branch, so a newer index.json there means a newer release is available. */
	var REMOTE_BASE = "https://raw.githubusercontent.com/QuickBox/club-QuickBox/latest/";
	var REMOTE_INDEX = REMOTE_BASE + "changelogs/index.json";
	var CACHE_KEY = "cqb-update-check";
	var DAY = 86400000;
	var FETCH_TIMEOUT = 6000;

	/* Strict validators. An index entry is trusted only when every field matches;
	 * the file path pattern also bounds what URL the notes fetch may ever build. */
	var VER_RE = /^\d+\.\d+\.\d+$/;
	var DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
	var FILE_RE = /^changelogs\/v\d+\.\d+\.\d+\.md$/;

	/* Parse "a.b.c" into [a,b,c] numbers, or null. */
	function parseVer(v) {
		var m = VER_RE.exec(String(v || ""));
		if (!m) return null;
		var p = String(v).split(".");
		return [+p[0], +p[1], +p[2]];
	}
	/* True when semver a is strictly newer than b. */
	function isNewer(a, b) {
		var pa = parseVer(a), pb = parseVer(b);
		if (!pa || !pb) return false;
		for (var i = 0; i < 3; i++) {
			if (pa[i] !== pb[i]) return pa[i] > pb[i];
		}
		return false;
	}

	/* Validate a parsed changelog index: an array of at most 200 entries, each
	 * with a semver version, an ISO date and a changelogs/vX.Y.Z.md file. Any bad
	 * entry rejects the whole index (returns null). Returns a clean copy on PASS. */
	function validIndex(data) {
		if (!Array.isArray(data) || data.length > 200) return null;
		var out = [];
		for (var i = 0; i < data.length; i++) {
			var e = data[i];
			if (!e || typeof e !== "object") return null;
			if (typeof e.version !== "string" || !VER_RE.test(e.version)) return null;
			if (typeof e.date !== "string" || !DATE_RE.test(e.date)) return null;
			if (typeof e.file !== "string" || !FILE_RE.test(e.file)) return null;
			out.push({ version: e.version, date: e.date, file: e.file });
		}
		return out;
	}
	function newestEntry(idx) {
		var best = null;
		for (var i = 0; i < idx.length; i++) {
			if (!best || isNewer(idx[i].version, best.version)) best = idx[i];
		}
		return best;
	}

	/* ============================================================
	 * Safe markdown subset -> DOM. Every string reaches the page only through
	 * textContent / createTextNode, so fetched notes can never inject markup.
	 * ============================================================ */

	/* Inline: strip markdown links to their label text, then split on backticks
	 * so `code` spans become <code>. An unterminated backtick is kept literal. */
	function renderInline(parent, text) {
		var s = String(text).replace(/\[([^\]]*)\]\(([^)]*)\)/g, "$1");
		var parts = s.split("`");
		var unterminated = parts.length % 2 === 0; // odd number of backticks
		for (var i = 0; i < parts.length; i++) {
			var inCode = (i % 2 === 1);
			if (inCode && unterminated && i === parts.length - 1) {
				parent.appendChild(document.createTextNode("`" + parts[i]));
			} else if (inCode) {
				var code = document.createElement("code");
				code.className = "cqb-wn-code";
				code.textContent = parts[i];
				parent.appendChild(code);
			} else if (parts[i]) {
				parent.appendChild(document.createTextNode(parts[i]));
			}
		}
	}

	/* Block: ## / ### headings, - or * bullets, blank-line-separated paragraphs. */
	function renderMarkdown(container, text) {
		var lines = String(text).replace(/\r\n?/g, "\n").split("\n");
		var list = null, para = null;
		function closePara() { if (para) { container.appendChild(para); para = null; } }
		function closeList() { list = null; }
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i].replace(/\s+$/, "");
			if (!line) { closePara(); closeList(); continue; }
			var h = /^(#{1,6})\s+(.*)$/.exec(line);
			if (h) {
				closePara(); closeList();
				var deep = h[1].length >= 3;
				var hEl = document.createElement(deep ? "h4" : "h3");
				hEl.className = deep ? "cqb-wn-sub" : "cqb-wn-head";
				renderInline(hEl, h[2]);
				container.appendChild(hEl);
				continue;
			}
			var b = /^\s*[-*]\s+(.*)$/.exec(line);
			if (b) {
				closePara();
				if (!list) { list = document.createElement("ul"); list.className = "cqb-wn-list"; container.appendChild(list); }
				var li = document.createElement("li");
				renderInline(li, b[1]);
				list.appendChild(li);
				continue;
			}
			closeList();
			if (!para) { para = document.createElement("p"); para.className = "cqb-wn-p"; }
			else para.appendChild(document.createTextNode(" "));
			renderInline(para, line);
		}
		closePara(); closeList();
	}

	/* ============================================================
	 * Fetch helpers.
	 * ============================================================ */
	var notesCache = {}; // url -> text, so re-opening never refetches

	function localUrl(path) { return cqb.path + path + (REV ? "?cqb=" + REV : ""); }

	/* Fetch text once and cache it; same-origin for the bundled files. */
	function fetchText(url, opts) {
		if (typeof fetch !== "function") return Promise.reject();
		if (notesCache[url] != null) return Promise.resolve(notesCache[url]);
		return fetch(url, opts).then(function (r) {
			if (!r.ok) throw 0;
			return r.text();
		}).then(function (txt) { notesCache[url] = txt; return txt; });
	}

	/* ============================================================
	 * Update check -- one fixed URL, no credentials, once per day, deferred.
	 * ============================================================ */
	var updateInfo = null; // { version, file } of the newest remote release, or null

	function readCache() {
		try {
			var raw = window.localStorage.getItem(CACHE_KEY);
			if (!raw) return null;
			var o = JSON.parse(raw);
			return (o && typeof o === "object") ? o : null;
		} catch (e) { return null; }
	}
	function writeCache(o) {
		try { window.localStorage.setItem(CACHE_KEY, JSON.stringify(o)); } catch (e) { /* storage unavailable */ }
	}

	/* The known newer release, or null when the newest seen is not ahead of us. */
	function knownUpdate() {
		if (updateInfo && updateInfo.version && isNewer(updateInfo.version, VERSION)) return updateInfo;
		return null;
	}
	function markUpdateDot() {
		var h = document.getElementById("mnu_help");
		if (h && h.classList) h.classList.toggle("cqb-has-update", !!knownUpdate());
	}
	function applyResult(version, file) {
		updateInfo = (version && file) ? { version: version, file: file } : null;
		markUpdateDot();
	}

	function defer(fn) {
		if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(fn, { timeout: 4000 });
		else setTimeout(fn, 2500);
	}

	function doRemoteCheck() {
		var ctrl = (typeof AbortController === "function") ? new AbortController() : null;
		var timer = ctrl ? setTimeout(function () { try { ctrl.abort(); } catch (e) { /* ignore */ } }, FETCH_TIMEOUT) : null;
		/* Record the attempt time whatever the outcome, so a failure still caps
		 * the check at once per day; version/file are kept only on a valid hit. */
		function finish(version, file) {
			if (timer) { clearTimeout(timer); timer = null; }
			writeCache({ ts: Date.now(), version: version || "", file: file || "" });
			applyResult(version, file);
		}
		if (typeof fetch !== "function") { finish("", ""); return; }
		fetch(REMOTE_INDEX, {
			credentials: "omit",
			referrerPolicy: "no-referrer",
			signal: ctrl ? ctrl.signal : undefined
		}).then(function (r) {
			if (!r.ok) throw 0;
			return r.json();
		}).then(function (data) {
			var idx = validIndex(data);
			var newest = idx ? newestEntry(idx) : null;
			if (newest) finish(newest.version, newest.file);
			else finish("", "");
		}).catch(function () { finish("", ""); });
	}

	function scheduleCheck() {
		var cached = readCache();
		var now = Date.now();
		if (cached && typeof cached.ts === "number" && (now - cached.ts) < DAY) {
			applyResult(cached.version, cached.file); // fresh: no network
			return;
		}
		defer(doRemoteCheck);
	}

	/* ============================================================
	 * What's new dialog -- built on the shared v4 dialog chrome.
	 * ============================================================ */
	var wnBody = null;

	function ensureDialog() {
		var existing = document.getElementById("cqbWhatsNew");
		if (existing) {
			if (!wnBody) wnBody = existing.querySelector(".cqb-wn-body");
			return true;
		}
		if (!window.theDialogManager || typeof theDialogManager.make !== "function") return false;
		wnBody = document.createElement("div");
		wnBody.className = "cqb-wn-body";
		try {
			/* Non-modal, like the sibling Help/About info dialogs it is reached from.
			 * The core make() adds the close button in the header; dialogs.css styles
			 * it, and the window cap in about.css keeps the header on screen. */
			theDialogManager.make("cqbWhatsNew", t("cqb_wn_title", "What's new in club-QuickBox"), wnBody);
		} catch (e) { return false; }
		installEsc();
		return true;
	}

	/* Escape closes the dialog when it is open (the non-modal core path does not
	 * bind it); installed once. */
	function installEsc() {
		if (window.cqbWnEsc) return;
		window.cqbWnEsc = true;
		document.addEventListener("keydown", function (e) {
			if (e.key !== "Escape" && e.keyCode !== 27) return;
			var dlg = document.getElementById("cqbWhatsNew");
			/* Hidden shows as display:none (set by the manager's hide); a fixed-
			 * positioned window has no offsetParent, so that cannot gate this. */
			if (!dlg || dlg.style.display === "none") return;
			try { theDialogManager.hide("cqbWhatsNew"); } catch (ex) { /* hide is best-effort */ }
		}, true);
	}

	/* "QuickBox Pro: run <cmd> ..." with the command as inline code, from a
	 * translatable template split on {cmd}. */
	function lineWithCmd(template, cmd) {
		var p = document.createElement("p");
		p.className = "cqb-wn-p";
		var idx = template.indexOf("{cmd}");
		if (idx === -1) { p.textContent = template; return p; }
		var before = template.slice(0, idx), after = template.slice(idx + 5);
		if (before) p.appendChild(document.createTextNode(before));
		var code = document.createElement("code");
		code.className = "cqb-wn-code";
		code.textContent = cmd;
		p.appendChild(code);
		if (after) p.appendChild(document.createTextNode(after));
		return p;
	}

	function buildUpdateSection(version) {
		var sec = document.createElement("div");
		sec.className = "cqb-wn-update";
		var head = document.createElement("div");
		head.className = "cqb-wn-update-head";
		head.appendChild(document.createElement("span")).className = "cqb-wn-update-dot";
		var label = document.createElement("span");
		label.className = "cqb-wn-update-label";
		label.textContent = t("cqb_wn_update", "Update available: v{version}").replace("{version}", version);
		head.appendChild(label);
		sec.appendChild(head);
		sec.appendChild(lineWithCmd(t("cqb_wn_update_qb", "QuickBox Pro: run {cmd} as an admin."), "qb update rutorrent -u <username>"));
		sec.appendChild(lineWithCmd(t("cqb_wn_update_manual", "Manual install: run {cmd} in the theme folder."), "git pull"));
		var slot = document.createElement("div");
		slot.className = "cqb-wn-remote";
		sec.appendChild(slot);
		return { sec: sec, slot: slot };
	}

	/* Re-centre the window after its height changes. The body cap bounds the
	 * window to the viewport, but the host centres on the size at show() time,
	 * before the async notes fill; calling the host's own centre after each fill
	 * keeps the capped window centred without depending on a host ResizeObserver. */
	function recenter() {
		try {
			if (theDialogManager && typeof theDialogManager.center === "function" &&
				theDialogManager.visible && theDialogManager.visible.indexOf("cqbWhatsNew") >= 0) {
				theDialogManager.center("cqbWhatsNew");
			}
		} catch (e) { /* centre is best-effort */ }
	}

	/* Fetch the newer release's notes from the same fixed base + the validated
	 * file path, with no credentials. Silent on any failure. */
	function fillRemoteNotes(file, slot) {
		if (!FILE_RE.test(file || "")) return;
		fetchText(REMOTE_BASE + file, { credentials: "omit", referrerPolicy: "no-referrer" })
			.then(function (txt) { slot.textContent = ""; renderMarkdown(slot, txt); recenter(); })
			.catch(function () { /* offline / any failure: the update note + local notes still show */ });
	}

	/* Render the bundled changelogs newest first, same-origin from the theme
	 * path. On any failure show the empty state, never an error. */
	function renderLocalChangelogs(container) {
		fetchText(localUrl("changelogs/index.json"), { credentials: "same-origin" })
			.then(function (txt) {
				var idx = validIndex(JSON.parse(txt));
				if (!idx || !idx.length) throw 0;
				var chain = Promise.resolve();
				idx.forEach(function (entry) {
					chain = chain.then(function () {
						return fetchText(localUrl(entry.file), { credentials: "same-origin" })
							.then(function (md) {
								var sec = document.createElement("section");
								sec.className = "cqb-wn-entry";
								renderMarkdown(sec, md);
								container.appendChild(sec);
								recenter();
							}).catch(function () { /* skip one unreadable file */ });
					});
				});
				return chain;
			})
			.catch(function () {
				if (container.childNodes.length) return;
				var empty = document.createElement("p");
				empty.className = "cqb-wn-empty";
				empty.textContent = t("cqb_wn_none", "No release notes yet.");
				container.appendChild(empty);
				recenter();
			});
	}

	function renderDialog() {
		if (!wnBody) return;
		wnBody.textContent = "";
		var upd = knownUpdate();
		if (upd) {
			var built = buildUpdateSection(upd.version);
			wnBody.appendChild(built.sec);
			fillRemoteNotes(upd.file, built.slot);
		}
		var local = document.createElement("div");
		local.className = "cqb-wn-local";
		wnBody.appendChild(local);
		renderLocalChangelogs(local);
	}

	/* The one shared opener: the Help-dialog link and the palette both call it. */
	cqb.openWhatsNew = function () {
		if (!ensureDialog()) return;
		if (!wnBody) wnBody = document.querySelector("#cqbWhatsNew .cqb-wn-body");
		renderDialog();
		try { theDialogManager.show("cqbWhatsNew"); } catch (e) { /* show is best-effort */ }
		recenter();
	};

	/* ============================================================
	 * Help-dialog version line + What's new link.
	 * ============================================================ */
	function decorateHelp() {
		var dlg = document.getElementById("dlgHelp");
		if (!dlg) return false;
		if (dlg.getAttribute("data-cqb-about") === "1") return true;
		dlg.setAttribute("data-cqb-about", "1");
		var foot = document.createElement("div");
		foot.className = "cqb-about-foot";
		var ver = document.createElement("span");
		ver.className = "cqb-about-version";
		ver.textContent = t("cqb_wn_version", "club-QuickBox v{version}").replace("{version}", VERSION);
		var link = document.createElement("a");
		link.href = "#";
		link.className = "cqb-about-link";
		link.textContent = t("cqb_wn_link", "What's new");
		link.addEventListener("click", function (e) {
			e.preventDefault();
			if (typeof cqb.openWhatsNew === "function") cqb.openWhatsNew();
		});
		foot.appendChild(ver);
		foot.appendChild(link);
		dlg.appendChild(foot);
		return true;
	}

	/* The Help dialog is built once by the core at startup; try now, and if it
	 * is not there yet watch the dialog container for it, then stop. */
	function decorateHelpWhenReady() {
		if (decorateHelp()) return;
		if (!window.MutationObserver) return;
		var host = document.getElementById("dialog-container") || document.body;
		if (!host) return;
		var obs = new MutationObserver(function () {
			if (decorateHelp()) obs.disconnect();
		});
		obs.observe(host, { childList: true, subtree: true });
	}

	decorateHelpWhenReady();
	scheduleCheck();
})(window.cqb);
