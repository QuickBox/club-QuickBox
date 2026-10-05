/*
 *  club-QuickBox skin for ruTorrent -- shell foundation.
 *
 *  Three jobs: load the per-surface CSS and JS modules, expose the shared
 *  window.cqb helpers the feature modules build against, and resolve/apply
 *  one of four token variants (spectre, smoked, reel, defaulted). Variant
 *  order: a stored user override (localStorage: auto|<variant>) -> the
 *  QuickBox dashboard theme cookie (qb_theme, mapped 1:1) -> spectre. In
 *  "auto" the cookie is re-checked when the tab regains focus so a dashboard
 *  theme change in another tab is followed without a reload.
 *
 *  This file runs inside the theme plugin's init closure: plugin, dxSTable,
 *  thePlugins, theUILang, theWebUI, RGBackground, injectScript and $ are all
 *  in scope. The leading semicolon terminates the preceding concatenated
 *  statement, whose own trailing semicolon is absent, so this IIFE is never
 *  read as its call.
 */
;(function () {
	/* Cache key for every theme asset URL. The build tool rewrites the value
	 * whenever a theme file changes, so a changed file always resolves to a new
	 * URL and no stale copy is served from the browser cache. */
	var CQB_REV = "e93e4708ac";
	/* The released theme version (major.minor.patch). The release tool rewrites
	 * this value; it is surfaced on window.cqb.version for About/diagnostics. */
	var CQB_VERSION = "2.6.0";
	var VARIANTS = ["spectre", "smoked", "reel", "defaulted"];
	var OVERRIDE_KEY = "qb-rutorrent-variant";
	var CSS_MODULES = ["base", "topbar", "sidebar", "table", "peers", "details", "chunks", "dialogs", "settings", "settings-plugins", "select", "statusbar", "extras", "about", "icons"];
	var JS_MODULES = ["topbar", "sidebar", "table", "peers", "details", "chunks", "dialogs", "settings", "settings-plugins", "select", "statusbar", "extras", "about", "icons"];
	var root = document.documentElement;
	var variantListeners = [];
	var jsModulesLoaded = false;

	function token(name) {
		return getComputedStyle(root).getPropertyValue(name).trim();
	}

	/* Load the per-surface CSS modules moved out of style.css. Array order is
	 * the cascade order (base first, extras last); each resolves to
	 * plugins/theme/themes/club-QuickBox/css/<name>.css via plugin.path. A
	 * short holding <style> hides the shell until the last module lands so the
	 * chrome never flashes unstyled; a timer clears it even if a fetch fails. */
	var hold = document.createElement("style");
	hold.id = "cqb-hold";
	hold.textContent = "#Layout,#t,#StatusBar,#side-panel{visibility:hidden!important}";
	(document.head || root).appendChild(hold);
	function clearHold() {
		var h = document.getElementById("cqb-hold");
		if (h && h.parentNode) h.parentNode.removeChild(h);
	}
	var remaining = CSS_MODULES.length;
	function cssDone() {
		if (--remaining <= 0) clearHold();
	}
	CSS_MODULES.forEach(function (name) {
		injectCSS(plugin.path + "css/" + name + ".css?cqb=" + CQB_REV, cssDone);
	});

	/* ============================================================
	 * Skin string catalog: load lang/<code>.js for the active ruTorrent
	 * language, then gate the feature modules on it (see allDone below).
	 * ============================================================
	 * The theme plugin loads its OWN localization, never the skin's, so the
	 * skin ships lang/en.js (the full catalog) plus one file per supported
	 * language. English loads FIRST as the base (every key resolves even when a
	 * translation is partial), then the active language is layered on top -- so
	 * they must load IN ORDER, en before the override. ruTorrent's injectScript
	 * appends a <script src> that executes ASYNCHRONOUSLY and carries no error
	 * handler, so this uses the theme's own loader: a <script> with both onload
	 * and onerror, chained en -> active -> ready. The wrapped allDone holds the
	 * feature-module injection until this ready signal fires, so no module can
	 * render a string before its catalog entry exists. A safety timer fires
	 * ready regardless, so a hung request never blocks the theme; a lang file
	 * only ASSIGNS theUILang keys; an unsupported language is never requested
	 * (no 404); and a failed/absent file degrades to the English base + the
	 * modules' inline fallbacks -- never to no theme. */
	var LANG_SUPPORTED = ["en", "da", "de", "es", "fr", "pt-br", "zh-cn"];
	var LANG_ALIAS = { "pt-pt": "pt-br" };
	var LANG_READY_TIMEOUT = 3000;
	var langReady = false;
	var langReadyCbs = [];
	function onLangReady(fn) {
		if (langReady) { try { fn(); } catch (e) { /* a listener must not break the engine */ } return; }
		langReadyCbs.push(fn);
	}
	function signalLangReady() {
		if (langReady) return;
		langReady = true;
		var cbs = langReadyCbs; langReadyCbs = [];
		for (var i = 0; i < cbs.length; i++) { try { cbs[i](); } catch (e) { /* ditto */ } }
	}
	function activeLang() {
		var code = "";
		try {
			if (typeof GetActiveLanguage === "function") code = String(GetActiveLanguage() || "").toLowerCase();
		} catch (e) { code = ""; }
		if (LANG_ALIAS[code]) code = LANG_ALIAS[code];
		return LANG_SUPPORTED.indexOf(code) !== -1 ? code : "en";
	}
	/* Load one lang/<code>.js and call done() once it has executed OR failed.
	 * The ?cqb=<stamp> key busts the browser cache on any catalog change. */
	function loadLangFile(code, done) {
		var called = false;
		function settle() { if (!called) { called = true; done(); } }
		try {
			var s = document.createElement("script");
			s.type = "text/javascript";
			s.onload = settle;
			s.onerror = settle;
			s.src = plugin.path + "lang/" + code + ".js?cqb=" + CQB_REV;
			(document.head || root).appendChild(s);
		} catch (e) { settle(); }
	}
	/* English base first, the active language on top, then ready. */
	loadLangFile("en", function () {
		var code = activeLang();
		if (code === "en") { signalLangReady(); return; }
		loadLangFile(code, signalLangReady);
	});
	setTimeout(signalLangReady, LANG_READY_TIMEOUT);

	/* Re-key the three sheets the theme plugin loads itself (style.css,
	 * stable.css, plugins.css at the skin root). Each already carries ruTorrent's
	 * ?v= cache-bust; prepend ?cqb=<rev> and keep the v so a changed sheet gets a
	 * fresh URL. The plugin inserts some of them (notably plugins.css, twice)
	 * AFTER this file runs, so a one-time pass misses them -- hence the <head>
	 * observer below. A second link for an already-keyed sheet is a duplicate the
	 * plugin added twice, so it is dropped rather than keyed a second time. */
	var SELF_SHEETS = ["style.css", "stable.css", "plugins.css"];
	var sheetKeyed = {};
	function sheetOf(href) {
		for (var i = 0; i < SELF_SHEETS.length; i++) {
			if (href.indexOf("themes/club-QuickBox/" + SELF_SHEETS[i]) !== -1) return SELF_SHEETS[i];
		}
		return null;
	}
	function rekeyLink(lk) {
		var href = lk.getAttribute("href") || "";
		var sheet = sheetOf(href);
		if (!sheet) return false;
		if (href.indexOf("cqb=") !== -1) { sheetKeyed[sheet] = true; return false; }
		if (sheetKeyed[sheet]) { if (lk.parentNode) lk.parentNode.removeChild(lk); return false; }
		var q = href.indexOf("?");
		var base = q === -1 ? href : href.slice(0, q);
		var vm = href.match(/[?&]v=([^&]*)/);
		sheetKeyed[sheet] = true;
		lk.setAttribute("href", base + "?cqb=" + CQB_REV + (vm ? "&v=" + vm[1] : ""));
		return true;
	}
	function allSheetsKeyed() {
		for (var i = 0; i < SELF_SHEETS.length; i++) if (!sheetKeyed[SELF_SHEETS[i]]) return false;
		return true;
	}
	/* Sheets present now: re-key inside the hold, counting each into it so
	 * clearHold waits for the re-fetch and the swap never flashes unstyled
	 * chrome. Iterate the live list backwards so a dropped duplicate is safe. */
	var headLinks = (document.head || root).getElementsByTagName("link");
	for (var li = headLinks.length - 1; li >= 0; li--) {
		var lk = headLinks[li];
		if (rekeyLink(lk)) {
			remaining++;
			lk.onload = cssDone;
			lk.onerror = cssDone;
		}
	}
	/* The theme plugin loads some self-sheets after this file runs -- notably it
	 * calls loadCSS("plugins") twice (once in its config hook, once in allDone),
	 * and the allDone one fires AFTER the three sheets are first keyed. Stopping
	 * the observer on allSheetsKeyed() or a timer therefore missed that second
	 * insertion and left an unkeyed, stale-cacheable duplicate. So the observer
	 * runs for the session: it keys the first link for each self-sheet and drops
	 * every later duplicate (rekeyLink), leaving exactly one keyed link per sheet
	 * on every load. A <link> add from any other plugin is a cheap no-op. */
	if (!allSheetsKeyed() && window.MutationObserver) {
		new MutationObserver(function (muts) {
			for (var mi = 0; mi < muts.length; mi++) {
				var added = muts[mi].addedNodes;
				for (var ai = 0; ai < added.length; ai++) {
					if (added[ai] && added[ai].tagName === "LINK") rekeyLink(added[ai]);
				}
			}
		}).observe(document.head || root, { childList: true });
	}
	setTimeout(clearHold, 2500);

	/* ============================================================
	 * window.cqb -- shared helpers for the feature modules.
	 * ============================================================ */
	var TIP_DELAY = 400;
	var tipEl = null, tipTimer = null, tipTarget = null;
	function ensureTip() {
		if (tipEl) return tipEl;
		tipEl = document.createElement("div");
		tipEl.className = "cqb-tooltip";
		tipEl.setAttribute("role", "tooltip");
		/* Only geometry + visibility live inline; the visual box (sizing, wrap,
		 * colours) is .cqb-tooltip in css/base.css so a long unbroken value wraps
		 * inside the padded body. JS sets left/top/opacity to position + reveal. */
		tipEl.style.cssText = "position:fixed;z-index:99999;pointer-events:none;opacity:0;";
		document.body.appendChild(tipEl);
		return tipEl;
	}
	/* A tip is suppressed while its control -- or the nearest [aria-expanded]
	 * ancestor it lives in -- is open, so a hover hint never sits over the menu
	 * the control just opened. closest() returns the element itself when it
	 * carries the attribute, covering both the control and its ancestor. */
	function tipSuppressed(el) {
		var ex = el && el.closest ? el.closest("[aria-expanded]") : null;
		return !!(ex && ex.getAttribute("aria-expanded") === "true");
	}
	function showTip(el, pointerX) {
		if (tipSuppressed(el)) return;
		var text = el.getAttribute("data-cqb-tip");
		if (!text) return;
		var t = ensureTip();
		t.textContent = text;
		t.style.display = "block";
		var r = el.getBoundingClientRect();
		var tw = t.offsetWidth, th = t.offsetHeight;
		var vw = window.innerWidth, vh = window.innerHeight;
		var isCell = /^(TD|TH|TR)$/.test(el.tagName || "");
		var left, top;
		if (el.getAttribute("data-cqb-tip-side") === "right") {
			/* Beside the control, flipping to its left when the right edge has no
			 * room; vertically centred and clamped into the viewport. */
			left = r.right + 6;
			if (left + tw > vw - 4) left = r.left - tw - 6;
			left = Math.max(4, left);
			top = Math.max(4, Math.min(r.top + r.height / 2 - th / 2, vh - th - 4));
		} else if (typeof pointerX === "number" && (isCell || r.width > tw * 2)) {
			/* Centring on a wide target (a table cell/row, or anything over twice
			 * the tip width) lands the tip far from the cursor. Anchor it at the
			 * pointer x instead, below the target row, both clamped 8px inside the
			 * viewport. Keyboard focus passes no pointer, keeping element anchoring. */
			left = Math.max(8, Math.min(pointerX - tw / 2, vw - tw - 8));
			top = r.bottom + 6;
			if (top + th > vh - 8) top = r.top - th - 6;
			top = Math.max(8, Math.min(top, vh - th - 8));
		} else {
			left = Math.max(4, Math.min(r.left + r.width / 2 - tw / 2, vw - tw - 4));
			top = r.bottom + 6;
			if (top + th > vh - 4) top = r.top - th - 6;
			top = Math.max(4, top);
		}
		t.style.left = left + "px";
		t.style.top = top + "px";
		t.style.opacity = "1";
	}
	function scheduleTip(el, pointerX) {
		clearTimeout(tipTimer);
		tipTarget = el;
		tipTimer = setTimeout(function () { showTip(el, pointerX); }, TIP_DELAY);
	}
	function hideTip() {
		clearTimeout(tipTimer);
		tipTarget = null;
		if (tipEl) tipEl.style.opacity = "0";
	}

	/* Migrate a native title= into data-cqb-tip so the custom tooltip renders
	 * it and the browser popup never fires. aria-label is only added when the
	 * element has no other accessible text, so visible labels are preserved. */
	function migrateTitle(el) {
		if (!el || el.nodeType !== 1 || !el.getAttribute) return;
		var t = el.getAttribute("title");
		if (t == null || t === "") return;
		el.setAttribute("data-cqb-tip", t);
		el.removeAttribute("title");
		if (!el.getAttribute("aria-label") && !el.getAttribute("aria-labelledby") &&
			!(el.textContent || "").trim()) {
			el.setAttribute("aria-label", t);
		}
	}
	function migrateTree(node) {
		if (!node || node.nodeType !== 1) return;
		migrateTitle(node);
		if (node.querySelectorAll) {
			var withTitle = node.querySelectorAll("[title]");
			for (var i = 0; i < withTitle.length; i++) migrateTitle(withTitle[i]);
		}
	}

	var cqb = {
		path: plugin.path,
		version: CQB_VERSION,
		/* The content cache key for the theme's own asset URLs, so a module can
		 * key its own same-origin fetches (e.g. the changelog files) the same way
		 * the loader keys CSS/JS, and an update never serves a stale file. */
		rev: CQB_REV,
		/* Return a mask <span> that tints the named SVG glyph with --qb-icon.
		 * Size/color come from inline style so it works without a stylesheet. */
		icon: function (name) {
			var s = document.createElement("span");
			s.className = "cqb-icon";
			s.style.cssText =
				"display:inline-block;width:18px;height:18px;flex:none;" +
				"background-color:var(--qb-icon);" +
				"-webkit-mask:center/contain no-repeat;mask:center/contain no-repeat;";
			var u = "url(" + cqb.path + "images/icons/" + name + ".svg)";
			s.style.webkitMaskImage = u;
			s.style.maskImage = u;
			return s;
		},
		/* Mark an element for the one shared custom tooltip. Never a native
		 * title= (that bypasses theme styling); the delegated listeners below
		 * drive display, so this just records the text. */
		tooltip: function (el, text, opts) {
			if (!el || !text) return;
			el.removeAttribute("title");
			el.setAttribute("data-cqb-tip", text);
			/* { side: "right" } places the tip beside the control (see showTip);
			 * default placement (below) is unchanged. An element can opt in with
			 * data-cqb-tip-side="right" in markup without touching this file. */
			if (opts && opts.side === "right") el.setAttribute("data-cqb-tip-side", "right");
			if (!el.getAttribute("aria-label") && !el.getAttribute("aria-labelledby") &&
				!(el.textContent || "").trim()) {
				el.setAttribute("aria-label", text);
			}
		},
		/* Register a callback fired with (variant, isDark) on every change,
		 * including the initial apply. */
		onVariant: function (fn) {
			if (typeof fn === "function") variantListeners.push(fn);
		},
		/* The one apply path. The Appearance select, the topbar switcher and the
		 * command palette all call this so persistence and paint stay in sync.
		 * "auto" clears the override and follows the dashboard cookie. */
		setVariant: function (v) {
			try {
				if (v === "auto") window.localStorage.removeItem(OVERRIDE_KEY);
				else window.localStorage.setItem(OVERRIDE_KEY, v);
			} catch (e) {
				/* storage unavailable: fall back to a session-only apply */
			}
			applyVariant(resolveVariant());
		},
		/* True when a scroll event came from inside a body-level popover panel
		 * (its own option list scrolling), rather than the page or a dialog
		 * scrolling underneath. The custom popovers (select, category "More",
		 * tab-overflow) listen for scroll in the capture phase so they re-place
		 * when the surface behind them moves; without this guard the list's own
		 * scroll re-triggers that placement, which re-measures the panel and
		 * snaps the list back to the top. A page/document scroll has a non-element
		 * target and is never treated as inside, so re-placement still runs. */
		panelScrolledInside: function (e, panel) {
			if (!e || !panel) return false;
			var tgt = e.target;
			if (!tgt || tgt.nodeType !== 1) return false;
			return panel === tgt || (panel.contains && panel.contains(tgt));
		}
	};
	window.cqb = cqb;

	/* Global title -> custom tooltip: sweep the current tree, watch for new
	 * nodes and new title= attributes, and drive the one tooltip by delegation
	 * (400ms hover delay, keyboard focus shows it, Escape or blur hides it). */
	function closestTip(node) {
		return node && node.closest ? node.closest("[data-cqb-tip]") : null;
	}
	migrateTree(document.body || root);
	if (window.MutationObserver) {
		new MutationObserver(function (muts) {
			for (var i = 0; i < muts.length; i++) {
				var m = muts[i];
				if (m.type === "attributes") {
					migrateTitle(m.target);
				} else if (m.type === "childList") {
					for (var j = 0; j < m.addedNodes.length; j++) migrateTree(m.addedNodes[j]);
				}
			}
		}).observe(document.documentElement, {
			subtree: true, childList: true, attributes: true, attributeFilter: ["title"]
		});
	}
	document.addEventListener("mouseover", function (e) {
		var el = closestTip(e.target);
		if (el) scheduleTip(el, e.clientX);
	});
	document.addEventListener("mouseout", function (e) {
		if (closestTip(e.target) === tipTarget && tipTarget) hideTip();
	});
	document.addEventListener("focusin", function (e) {
		var el = closestTip(e.target);
		if (el) showTip(el);
	});
	document.addEventListener("focusout", function (e) {
		if (closestTip(e.target)) hideTip();
	});
	/* Activating a control dismisses its tip: pointerdown and click cover mouse
	 * and touch, the keydown branch covers keyboard activation (Enter/Space). A
	 * control that opens a menu on activation thus loses its hint, and the
	 * aria-expanded guard in showTip keeps it from reappearing while the menu is
	 * open. */
	document.addEventListener("pointerdown", function (e) {
		if (closestTip(e.target)) hideTip();
	});
	document.addEventListener("click", function (e) {
		if (closestTip(e.target)) hideTip();
	});
	document.addEventListener("keydown", function (e) {
		if (e.key === "Escape" || e.keyCode === 27) { hideTip(); return; }
		if ((e.key === "Enter" || e.key === " " || e.key === "Spacebar" ||
			e.keyCode === 13 || e.keyCode === 32) && closestTip(e.target)) hideTip();
	});

	/* ============================================================
	 * Variant resolution + apply.
	 * ============================================================ */
	function storedOverride() {
		try {
			var v = window.localStorage.getItem(OVERRIDE_KEY);
			return VARIANTS.indexOf(v) !== -1 ? v : "auto";
		} catch (e) {
			return "auto";
		}
	}

	function cookieVariant() {
		var m = document.cookie.match(/(?:^|;\s*)qb_theme=([^;]*)/);
		var theme = m ? decodeURIComponent(m[1]) : "";
		/* qb_theme maps 1:1 to a variant; an unknown/missing value is spectre. */
		return VARIANTS.indexOf(theme) !== -1 ? theme : "spectre";
	}

	function resolveVariant() {
		var override = storedOverride();
		return override === "auto" ? cookieVariant() : override;
	}

	function isDark(variant) {
		return variant !== "defaulted";
	}

	/* Capacity-meter fill tint by usage: ok below 80%, amber past 80%, danger
	 * past 90%. The fill is painted inline by each bar plugin's setValue, so
	 * the tint is applied there (and re-applied on variant change). */
	var METER_BARS = {
		diskspace: "#meter-disk-value",
		diskapceh: "#qmeter-disk-value",
		quotaspace: "#qmeter-band-value"
	};
	function meterThresholdColor(pct) {
		if (pct > 90) return token("--qb-destructive");
		if (pct > 80) return token("--qb-state-paused");
		return token("--qb-primary");
	}
	function tintMeterBar(sel) {
		var el = sel && document.querySelector(sel);
		if (!el) return;
		var pct = parseFloat(el.style.width) || 0;
		el.style.backgroundColor = meterThresholdColor(pct);
	}

	/* Repaint progress/meter gradients from the active variant tokens.
	 * RGBackground cannot read a var() off a CSS rule, so resolved hex is
	 * passed in. Completion bars use the brand gradient; capacity meters run
	 * ok (primary) -> danger (destructive) and take the usage-threshold tint. */
	function paintMeters() {
		var prgStart = token("--qb-prg-start");
		var prgEnd = token("--qb-prg-end");
		var ok = token("--qb-primary");
		var danger = token("--qb-destructive");
		if (window.theWebUI && theWebUI.tables) {
			for (var key in theWebUI.tables) {
				var obj = theWebUI.tables[key] && theWebUI.tables[key].obj;
				if (obj) {
					obj.prgStartColor = new RGBackground(prgStart);
					obj.prgEndColor = new RGBackground(prgEnd);
				}
			}
		}
		if (window.thePlugins) {
			["diskapceh", "diskspace", "quotaspace", "cpuload"].forEach(function (name) {
				var plg = thePlugins.get(name);
				if (plg && plg.enabled) {
					plg.prgStartColor = new RGBackground(ok);
					plg.prgEndColor = new RGBackground(danger);
				}
			});
			/* Wrap each bar plugin's setValue once so live updates re-tint, and
			 * re-tint the current fill now for the active variant. */
			Object.keys(METER_BARS).forEach(function (name) {
				var plg = thePlugins.get(name);
				var sel = METER_BARS[name];
				if (plg && typeof plg.setValue === "function" && !plg._cqbTint) {
					plg._cqbTint = true;
					var orig = plg.setValue;
					plg.setValue = function () {
						var r = orig.apply(this, arguments);
						tintMeterBar(sel);
						return r;
					};
				}
				tintMeterBar(sel);
			});
		}
	}

	function applyVariant(variant) {
		var dark = isDark(variant);
		root.setAttribute("data-qb-variant", variant);
		/* Bootstrap 5 dark mode + native control / scrollbar hints. */
		root.setAttribute("data-bs-theme", dark ? "dark" : "light");
		root.style.colorScheme = dark ? "dark" : "light";
		/* accent-color flips via CSS (`:root { accent-color: var(--qb-primary) }`)
		 * so it never races the stylesheet load. */
		/* ruTorrent theme hint: toggles dark-theme/light-theme now and seeds
		 * the next-load FOUC cover. */
		if (typeof setThemeHint === "function") setThemeHint(dark);
		paintMeters();
		variantListeners.forEach(function (fn) {
			try { fn(variant, dark); } catch (e) { /* a listener must not break the engine */ }
		});
	}

	/* Resolve + set before the rest of the skin paints. */
	applyVariant(resolveVariant());

	/* Auto-follow the dashboard theme when no explicit override is set. */
	function maybeFollow() {
		if (storedOverride() !== "auto") return;
		var next = cookieVariant();
		if (next !== root.getAttribute("data-qb-variant")) applyVariant(next);
	}
	document.addEventListener("visibilitychange", function () {
		if (!document.hidden) maybeFollow();
	});
	window.addEventListener("focus", maybeFollow);

	/* ============================================================
	 * Strings + the Appearance select in Settings.
	 * ============================================================ */
	theUILang.qbAppearance = theUILang.qbAppearance || "Appearance";
	theUILang.qbVariantAuto = theUILang.qbVariantAuto || "Auto (dashboard)";
	theUILang.qbVariantSpectre = theUILang.qbVariantSpectre || "Spectre";
	theUILang.qbVariantSmoked = theUILang.qbVariantSmoked || "Smoked";
	theUILang.qbVariantReel = theUILang.qbVariantReel || "Reel";
	theUILang.qbVariantLight = theUILang.qbVariantLight || "Light";

	var VARIANT_LABELS = {
		auto: "qbVariantAuto",
		spectre: "qbVariantSpectre",
		smoked: "qbVariantSmoked",
		reel: "qbVariantReel",
		defaulted: "qbVariantLight"
	};
	/* English fallback for the select, so the read below never yields
	 * undefined if a key is unset (or a translation set it empty). */
	var VARIANT_LABEL_FALLBACK = {
		auto: "Auto (dashboard)",
		spectre: "Spectre",
		smoked: "Smoked",
		reel: "Reel",
		defaulted: "Light"
	};

	var themeOnLangLoaded = plugin.onLangLoaded;
	plugin.onLangLoaded = function () {
		if (typeof themeOnLangLoaded === "function") themeOnLangLoaded.call(this);
		if (document.getElementById("qb.variant")) return;
		var current = storedOverride();
		var opts = "";
		["auto", "spectre", "smoked", "reel", "defaulted"].forEach(function (val) {
			opts += '<option value="' + val + '"' + (current === val ? " selected" : "") +
				">" + (theUILang[VARIANT_LABELS[val]] || VARIANT_LABEL_FALLBACK[val]) + "</option>";
		});
		$($$("webui.theme")).closest("div").after(
			$("<div>").addClass("col-6 col-md-3").append(
				$("<label>").attr({ for: "qb.variant" }).text(theUILang.qbAppearance + ": ")
			),
			$("<div>").addClass("col-6 col-md-3").append(
				$("<select>").attr({ id: "qb.variant" }).html(opts).on("change", function () {
					cqb.setVariant(this.value);
				})
			)
		);
	};

	/* The Settings Appearance select may be built (in onLangLoaded) before the
	 * language catalog is ready; if so, relabel its options and caption when the
	 * catalog lands. A no-op when the select does not exist yet (it builds with
	 * the ready values) or when it is already current. */
	function relabelVariantSelect() {
		var sel = document.getElementById("qb.variant");
		if (sel && sel.options) {
			for (var i = 0; i < sel.options.length; i++) {
				var v = sel.options[i].value;
				if (VARIANT_LABELS[v]) sel.options[i].text = theUILang[VARIANT_LABELS[v]] || VARIANT_LABEL_FALLBACK[v];
			}
		}
		var lab = document.querySelector && document.querySelector('label[for="qb.variant"]');
		if (lab) lab.textContent = (theUILang.qbAppearance || "Appearance") + ": ";
	}
	onLangReady(relabelVariantSelect);

	/* ============================================================
	 * Table completion bars + capacity meters + JS modules.
	 * ============================================================ */

	/* Torrent/file/peer table completion bars use the variant brand gradient. */
	plugin.QuickBoxTableCreate = dxSTable.prototype.create;
	dxSTable.prototype.create = function (ele, styles, aName) {
		plugin.QuickBoxTableCreate.call(this, ele, styles, aName);
		this.prgStartColor = new RGBackground(token("--qb-prg-start"));
		this.prgEndColor = new RGBackground(token("--qb-prg-end"));
	};

	/* Capacity meters + feature JS modules once all plugins finish loading. */
	plugin.QuickBoxAllDone = plugin.allDone;
	plugin.allDone = function () {
		plugin.QuickBoxAllDone.call(this);
		paintMeters();
		if (!jsModulesLoaded) {
			jsModulesLoaded = true;
			/* Hold the feature modules until the language catalog is ready
			 * (loaded, failed, or timed out) so none renders a string before
			 * its translation lands. */
			onLangReady(function () {
				JS_MODULES.forEach(function (name) {
					injectScript(plugin.path + "js/" + name + ".js?cqb=" + CQB_REV);
				});
			});
		}
	};
})();
