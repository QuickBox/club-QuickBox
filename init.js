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
	var VARIANTS = ["spectre", "smoked", "reel", "defaulted"];
	var OVERRIDE_KEY = "qb-rutorrent-variant";
	var CSS_MODULES = ["base", "topbar", "sidebar", "table", "details", "dialogs", "statusbar", "extras"];
	var JS_MODULES = ["topbar", "sidebar", "table", "details", "dialogs", "statusbar", "extras"];
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
	CSS_MODULES.forEach(function (name) {
		plugin.loadCSS("css/" + name, function () {
			if (--remaining <= 0) clearHold();
		});
	});
	setTimeout(clearHold, 2500);

	/* ============================================================
	 * window.cqb -- shared helpers for the feature modules.
	 * ============================================================ */
	var tipEl = null;
	function ensureTip() {
		if (tipEl) return tipEl;
		tipEl = document.createElement("div");
		tipEl.className = "cqb-tooltip";
		tipEl.setAttribute("role", "tooltip");
		tipEl.style.cssText =
			"position:fixed;z-index:99999;pointer-events:none;opacity:0;" +
			"transition:opacity .12s ease;max-width:240px;padding:4px 8px;" +
			"border-radius:6px;font-size:12px;line-height:1.4;white-space:normal;" +
			"background:var(--qb-tooltip-bg);color:var(--qb-tooltip-fg);" +
			"border:1px solid var(--qb-tooltip-border);box-shadow:var(--qb-shadow-soft);";
		document.body.appendChild(tipEl);
		return tipEl;
	}
	function showTip(el, text) {
		var t = ensureTip();
		t.textContent = text;
		t.style.display = "block";
		var r = el.getBoundingClientRect();
		var tw = t.offsetWidth, th = t.offsetHeight;
		var left = Math.max(4, Math.min(r.left + r.width / 2 - tw / 2, window.innerWidth - tw - 4));
		var top = r.bottom + 6;
		if (top + th > window.innerHeight - 4) top = r.top - th - 6;
		t.style.left = left + "px";
		t.style.top = Math.max(4, top) + "px";
		t.style.opacity = "1";
	}
	function hideTip() {
		if (tipEl) tipEl.style.opacity = "0";
	}

	var cqb = {
		path: plugin.path,
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
		/* Attach the one shared custom tooltip to an element. Never a native
		 * title= (that bypasses theme styling); aria-label keeps it readable. */
		tooltip: function (el, text) {
			if (!el || !text) return;
			el.removeAttribute("title");
			el.setAttribute("aria-label", text);
			var show = function () { showTip(el, text); };
			el.addEventListener("mouseenter", show);
			el.addEventListener("focus", show);
			el.addEventListener("mouseleave", hideTip);
			el.addEventListener("blur", hideTip);
		},
		/* Register a callback fired with (variant, isDark) on every change,
		 * including the initial apply. */
		onVariant: function (fn) {
			if (typeof fn === "function") variantListeners.push(fn);
		}
	};
	window.cqb = cqb;

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

	/* Repaint progress/meter gradients from the active variant tokens.
	 * RGBackground cannot read a var() off a CSS rule, so resolved hex is
	 * passed in. Completion bars use the brand gradient; capacity meters run
	 * ok (primary) -> danger (destructive). */
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
		}
	}

	function applyVariant(variant) {
		var dark = isDark(variant);
		root.setAttribute("data-qb-variant", variant);
		/* Bootstrap 5 dark mode + native control / scrollbar hints. */
		root.setAttribute("data-bs-theme", dark ? "dark" : "light");
		root.style.colorScheme = dark ? "dark" : "light";
		root.style.accentColor = token("--qb-primary");
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

	var themeOnLangLoaded = plugin.onLangLoaded;
	plugin.onLangLoaded = function () {
		if (typeof themeOnLangLoaded === "function") themeOnLangLoaded.call(this);
		if (document.getElementById("qb.variant")) return;
		var current = storedOverride();
		var opts = "";
		["auto", "spectre", "smoked", "reel", "defaulted"].forEach(function (val) {
			opts += '<option value="' + val + '"' + (current === val ? " selected" : "") +
				">" + theUILang[VARIANT_LABELS[val]] + "</option>";
		});
		$($$("webui.theme")).closest("div").after(
			$("<div>").addClass("col-6 col-md-3").append(
				$("<label>").attr({ for: "qb.variant" }).text(theUILang.qbAppearance + ": ")
			),
			$("<div>").addClass("col-6 col-md-3").append(
				$("<select>").attr({ id: "qb.variant" }).html(opts).on("change", function () {
					var val = this.value;
					try {
						if (val === "auto") window.localStorage.removeItem(OVERRIDE_KEY);
						else window.localStorage.setItem(OVERRIDE_KEY, val);
					} catch (e) {
						/* storage unavailable: fall back to session-only apply */
					}
					applyVariant(resolveVariant());
				})
			)
		);
	};

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
			JS_MODULES.forEach(function (name) {
				injectScript(plugin.path + "js/" + name + ".js");
			});
		}
	};
})();
