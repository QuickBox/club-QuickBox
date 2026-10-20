/*
 *  club-QuickBox skin for ruTorrent -- about / what's new module.
 *
 *  Loaded by init.js once theWebUI is ready. Runs in global scope with
 *  theDialogManager, theUILang, jQuery and window.cqb available. Three jobs,
 *  reading from the theme's OWN repo so the skin stays portable on a stock
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
 *  A known update shows a quiet dot on the Help button, an "Update vX.Y.Z" pill
 *  beside it, and a one-time toast per version. On QuickBox (the qb_theme
 *  cookie is present) the dashboard reports the latest version first and, for
 *  an admin, runs the update from the toast or the update card; a stock
 *  ruTorrent never sends a dashboard request.
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

	/* The known newer release, or null when the newest seen is not ahead of us.
	 * When the dashboard answered, its latest version decides; the notes still
	 * come from the theme's own changelog file for that version. */
	function knownUpdate() {
		if (dash) {
			if (!dash.updateAvailable || !isNewer(dash.latest, VERSION)) return null;
			return { version: dash.latest, file: "changelogs/v" + dash.latest + ".md" };
		}
		if (updateInfo && updateInfo.version && isNewer(updateInfo.version, VERSION)) return updateInfo;
		return null;
	}
	function markUpdateDot() {
		var h = document.getElementById("mnu_help");
		if (h && h.classList) h.classList.toggle("cqb-has-update", !!knownUpdate());
	}
	function applyResult(version, file) {
		updateInfo = (version && file) ? { version: version, file: file } : null;
		refreshUpdateUi();
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
	 * Dashboard status + update (QuickBox only). The qb_theme cookie is the
	 * QuickBox signal; without it no /api request is ever made, so a stock
	 * ruTorrent keeps the GitHub check above. Any dashboard error (signed out,
	 * no such route, offline) falls back to that check silently.
	 * ============================================================ */
	var API_STATUS = "/api/apps/rutorrent/theme";
	var API_UPDATE = "/api/apps/rutorrent/theme/update";
	/* The job status URL comes from the dashboard; only a same-origin /api path
	 * is ever polled. */
	var STATUS_URL_RE = /^\/api\/[A-Za-z0-9._~\/-]+(\?[A-Za-z0-9._~=&%-]*)?$/;
	var API_TIMEOUT = 8000;
	var POLL_MS = 2000;
	var POLL_LIMIT = 300000; // stop polling after 5 minutes
	var dash = null; // { latest, updateAvailable, canUpdate } once the dashboard answers

	function onQuickBox() { return /(?:^|;\s*)qb_theme=/.test(document.cookie || ""); }

	/* The dashboard's CSRF token: the qb_csrf cookie, which the status GET sets
	 * when it is missing. Empty when absent or undecodable. */
	function csrfToken() {
		var m = (document.cookie || "").match(/(?:^|;\s*)qb_csrf=([^;]*)/);
		if (!m) return "";
		try { return decodeURIComponent(m[1]); } catch (e) { return ""; }
	}

	/* Every dashboard request goes through here, so the request headers live in
	 * one place; a state-changing request carries the CSRF token. Resolves with
	 * the response's data object; rejects with { status, message }, where status
	 * is the HTTP status (0 on a network failure, timeout or a body that is not
	 * { ok: true, data }) and message is the dashboard's own error text, if any. */
	function dashRequest(method, path) {
		if (typeof fetch !== "function") return Promise.reject({ status: 0, message: "" });
		var ctrl = (typeof AbortController === "function") ? new AbortController() : null;
		var timer = ctrl ? setTimeout(function () { try { ctrl.abort(); } catch (e) { /* ignore */ } }, API_TIMEOUT) : null;
		function done() { if (timer) { clearTimeout(timer); timer = null; } }
		var headers = { "Accept": "application/json" };
		if (method !== "GET") {
			var token = csrfToken();
			if (token) headers["x-csrf-token"] = token;
		}
		return fetch(path, {
			method: method,
			credentials: "same-origin",
			cache: "no-store",
			headers: headers,
			signal: ctrl ? ctrl.signal : undefined
		}).then(function (r) {
			if (!r.ok) {
				/* Keep the dashboard's { ok: false, message } text when it sends one. */
				return r.json().then(function (j) {
					throw { status: r.status, message: (j && typeof j.message === "string") ? j.message : "" };
				}, function () { throw { status: r.status, message: "" }; });
			}
			return r.json();
		}).then(function (j) {
			done();
			if (!j || j.ok !== true || !j.data || typeof j.data !== "object") throw { status: 0, message: "" };
			return j.data;
		}, function (err) {
			done();
			throw (err && typeof err.status === "number") ? err : { status: 0, message: "" };
		});
	}

	function canUpdateNow() { return !!(dash && dash.canUpdate && knownUpdate()); }

	/* QuickBox: ask the dashboard first; on any failure run the GitHub check. */
	function startCheck() {
		if (!onQuickBox()) { scheduleCheck(); return; }
		defer(function () {
			fetchStatus().catch(function () { scheduleCheck(); });
		});
	}

	/* One status read; also (re)sets the qb_csrf cookie on the dashboard side. */
	function fetchStatus() {
		return dashRequest("GET", API_STATUS).then(function (d) {
			if (typeof d.latest !== "string" || !VER_RE.test(d.latest)) throw { status: 0, message: "" };
			dash = { latest: d.latest, updateAvailable: d.updateAvailable === true, canUpdate: d.canUpdate === true };
			refreshUpdateUi();
		});
	}

	/* ============================================================
	 * Update job: start once, poll the status URL every 2 s for up to 5 min,
	 * reload on success. job.state is idle | starting | queued | running |
	 * succeeded | failed | timeout.
	 * ============================================================ */
	var job = { state: "idle", message: "" };
	var jobUi = null; // { btn, status } of the rendered update card

	function jobBusy() { return job.state === "starting" || job.state === "queued" || job.state === "running" || job.state === "succeeded"; }

	function setJob(state, message) {
		job = { state: state, message: message ? String(message).slice(0, 300) : "" };
		renderJob();
	}

	function startUpdate() {
		if (jobBusy() || !canUpdateNow()) return;
		setJob("starting");
		/* No CSRF cookie yet: one status read sets it, then the POST goes out. */
		var ready = csrfToken() ? Promise.resolve() : fetchStatus().catch(function () { /* the POST reports the failure */ });
		ready.then(function () {
			return dashRequest("POST", API_UPDATE);
		}).then(function (d) {
			var url = d.statusUrl;
			if (typeof url !== "string" || !STATUS_URL_RE.test(url) || url.indexOf("..") !== -1) throw { status: 0, message: "" };
			pollJob(url, Date.now() + POLL_LIMIT);
		}).catch(function (err) {
			/* 409: another ruTorrent job holds the lock; anything else keeps the
			 * dashboard's own message (e.g. 400 when no update is pending). */
			if (err && err.status === 409) setJob("failed", t("cqb_upd_conflict", "Another ruTorrent task is running. Try again in a moment."));
			else setJob("failed", err && err.message);
		});
	}

	function pollJob(url, deadline) {
		function next() {
			if (Date.now() + POLL_MS > deadline) { setJob("timeout"); return; }
			setTimeout(function () { pollJob(url, deadline); }, POLL_MS);
		}
		dashRequest("GET", url).then(function (d) {
			if (d.status === "succeeded") {
				setJob("succeeded");
				setTimeout(function () { window.location.reload(); }, 1200);
				return;
			}
			if (d.status === "failed") { setJob("failed", typeof d.message === "string" ? d.message : ""); return; }
			setJob(d.status === "queued" ? "queued" : "running");
			next();
		}, function (err) {
			/* A client error means the job is gone or access was lost; anything
			 * else (offline, timeout, a restart) is retried until the deadline. */
			if (err && err.status >= 400 && err.status < 500) { setJob("failed", err.message); return; }
			next();
		});
	}

	/* Paint the job state into the update card, when it is rendered. The button
	 * stays focusable while busy (aria-disabled, not disabled), so keyboard
	 * focus is never dropped mid-update. */
	function renderJob() {
		if (!jobUi) return;
		var busy = jobBusy();
		jobUi.btn.setAttribute("aria-disabled", busy ? "true" : "false");
		jobUi.btn.textContent = busy ? t("cqb_upd_busy", "Updating…") : t("cqb_upd_now", "Update now");
		var st = jobUi.status;
		var text = "";
		if (job.state === "starting" || job.state === "queued") text = t("cqb_upd_queued", "Update queued…");
		else if (job.state === "running") text = t("cqb_upd_running", "Updating club-QuickBox…");
		else if (job.state === "succeeded") text = t("cqb_upd_done", "Updated. Reloading…");
		else if (job.state === "failed") text = t("cqb_upd_failed", "The update did not finish. You can run the command below instead.");
		else if (job.state === "timeout") text = t("cqb_upd_timeout", "The update is taking longer than expected. Reload later to check, or run the command below.");
		st.textContent = text;
		st.classList.toggle("is-busy", busy && job.state !== "succeeded");
		st.classList.toggle("is-error", job.state === "failed" || job.state === "timeout");
		st.hidden = !text;
		if (jobUi.detail) {
			jobUi.detail.textContent = (job.state === "failed" && job.message) ? job.message : "";
			jobUi.detail.hidden = !jobUi.detail.textContent;
		}
	}

	/* ============================================================
	 * Top-bar pill: "Update vX.Y.Z" just left of Help, only while an update is
	 * known. It opens What's new at the update card.
	 * ============================================================ */
	var pill = null;
	var barWait = 0;

	function syncPill() {
		var upd = knownUpdate();
		var help = document.getElementById("mnu_help");
		if (!upd || !help || !help.parentNode) {
			if (pill && pill.parentNode) pill.parentNode.removeChild(pill);
			return;
		}
		/* The topbar module rebuilds the right cluster once; wait for it (bounded)
		 * so the pill is placed into the final bar, not the core one. */
		if (!window.cqbTopbarInit && barWait < 20) {
			barWait++;
			setTimeout(syncPill, 250);
			return;
		}
		if (!pill) {
			pill = document.createElement("button");
			pill.type = "button";
			pill.className = "cqb-upd-pill";
			pill.appendChild(document.createElement("span")).className = "cqb-upd-pill-dot";
			var word = document.createElement("span");
			word.className = "cqb-upd-pill-word";
			word.textContent = t("cqb_upd_pill", "Update");
			pill.appendChild(word);
			pill.appendChild(document.createElement("span")).className = "cqb-upd-pill-ver";
			pill.addEventListener("click", function () { cqb.openWhatsNew({ focusUpdate: true }); });
		}
		var ver = "v" + upd.version;
		pill.querySelector(".cqb-upd-pill-ver").textContent = ver;
		/* The word hides on narrow bars, so the accessible name carries both. */
		pill.setAttribute("aria-label", t("cqb_upd_pill", "Update") + " " + ver);
		cqb.tooltip(pill, t("cqb_wn_update", "Update available: v{version}").replace("{version}", upd.version));
		if (pill.parentNode !== help.parentNode || pill.nextSibling !== help) help.parentNode.insertBefore(pill, help);
	}

	/* ============================================================
	 * One-time toast per new version. The seen version is stored before the
	 * toast shows; with storage unavailable the toast is skipped (the pill and
	 * the dot still show) so it never repeats on every load.
	 * ============================================================ */
	var TOAST_KEY = "cqb-update-toast";
	var toast = null;

	function closeToast() {
		if (toast && toast.parentNode) toast.parentNode.removeChild(toast);
		toast = null;
	}

	function maybeToast() {
		var upd = knownUpdate();
		if (!upd || toast || !document.body) return;
		try {
			if (window.localStorage.getItem(TOAST_KEY) === upd.version) return;
			window.localStorage.setItem(TOAST_KEY, upd.version);
		} catch (e) { return; }
		showToast(upd);
	}

	function toastButton(label, primary, onClick) {
		var b = document.createElement("button");
		b.type = "button";
		b.className = "cqb-upd-act" + (primary ? " cqb-upd-act-primary" : "");
		b.textContent = label;
		b.addEventListener("click", onClick);
		return b;
	}

	function showToast(upd) {
		toast = document.createElement("div");
		toast.className = "cqb-upd-toast";
		toast.setAttribute("role", "region");
		toast.setAttribute("aria-label", t("cqb_wn_update", "Update available: v{version}").replace("{version}", upd.version));
		toast.appendChild(document.createElement("span")).className = "cqb-upd-toast-dot";
		var main = document.createElement("div");
		main.className = "cqb-upd-toast-main";
		/* The live region exists before its text lands, so it is announced. */
		var live = document.createElement("div");
		live.className = "cqb-upd-toast-text";
		live.setAttribute("role", "status");
		main.appendChild(live);
		var actions = document.createElement("div");
		actions.className = "cqb-upd-toast-actions";
		actions.appendChild(toastButton(t("cqb_wn_link", "What's new"), !canUpdateNow(), function () {
			closeToast();
			cqb.openWhatsNew({ focusUpdate: true });
		}));
		if (canUpdateNow()) {
			actions.appendChild(toastButton(t("cqb_upd_go", "Update"), true, function () {
				closeToast();
				cqb.openWhatsNew({ focusUpdate: true });
				startUpdate();
			}));
		}
		main.appendChild(actions);
		toast.appendChild(main);
		var close = document.createElement("button");
		close.type = "button";
		close.className = "cqb-upd-toast-close";
		cqb.tooltip(close, t("cqb_upd_dismiss", "Dismiss"));
		close.addEventListener("click", closeToast);
		toast.appendChild(close);
		toast.addEventListener("keydown", function (e) {
			if (e.key === "Escape" || e.keyCode === 27) { e.stopPropagation(); closeToast(); }
		});
		document.body.appendChild(toast);
		setTimeout(function () {
			if (!toast) return;
			var title = document.createElement("div");
			title.className = "cqb-upd-toast-title";
			title.textContent = t("cqb_wn_update", "Update available: v{version}").replace("{version}", upd.version);
			var body = document.createElement("div");
			body.className = "cqb-upd-toast-body";
			body.textContent = t("cqb_upd_current", "You are running v{version}.").replace("{version}", VERSION);
			live.appendChild(title);
			live.appendChild(body);
		}, 60);
	}

	/* Dot, pill and toast all follow the one known-update state. */
	function refreshUpdateUi() {
		markUpdateDot();
		syncPill();
		maybeToast();
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
		jobUi = null;
		if (canUpdateNow()) {
			/* QuickBox admin: one-click update, with its progress under the head.
			 * The command lines below stay as the fallback. */
			var btn = document.createElement("button");
			btn.type = "button";
			btn.className = "cqb-primary cqb-wn-update-now";
			btn.addEventListener("click", startUpdate);
			head.appendChild(btn);
			var status = document.createElement("p");
			status.className = "cqb-wn-p cqb-wn-job";
			status.setAttribute("role", "status");
			sec.appendChild(status);
			var detail = document.createElement("p");
			detail.className = "cqb-wn-p cqb-wn-job-detail";
			sec.appendChild(detail);
			jobUi = { btn: btn, status: status, detail: detail };
			renderJob();
		}
		sec.appendChild(lineWithCmd(t("cqb_wn_update_qb", "QuickBox Pro: run {cmd} as an admin."), "qb update rutorrent -u <username> --theme"));
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
		jobUi = null;
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

	/* The one shared opener: the Help-dialog link, the palette, the top-bar pill
	 * and the toast all call it. { focusUpdate: true } lands on the update card
	 * (scrolled to the top and focused) when one is shown. */
	cqb.openWhatsNew = function (opts) {
		if (!ensureDialog()) return;
		if (!wnBody) wnBody = document.querySelector("#cqbWhatsNew .cqb-wn-body");
		renderDialog();
		try { theDialogManager.show("cqbWhatsNew"); } catch (e) { /* show is best-effort */ }
		recenter();
		var card = (opts && opts.focusUpdate && wnBody) ? wnBody.querySelector(".cqb-wn-update") : null;
		if (card) {
			wnBody.scrollTop = 0;
			card.setAttribute("tabindex", "-1");
			try { card.focus({ preventScroll: true }); } catch (e) { /* focus is best-effort */ }
		}
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
	startCheck();
})(window.cqb);
