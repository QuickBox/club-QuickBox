/*
 *  club-QuickBox skin for ruTorrent -- variant engine.
 *
 *  Resolves one of two token variants (spectre, reel) and drives it onto
 *  <html> via data-qb-variant, which the CSS token set keys off. Resolution
 *  order: a stored user override (localStorage: auto|spectre|reel) -> the
 *  QuickBox dashboard theme cookie (qb_theme) -> spectre. In "auto" the cookie
 *  is re-checked when the tab regains focus so a dashboard theme change in
 *  another tab is followed without a reload.
 *
 *  This file runs inside the theme plugin's init closure: plugin, dxSTable,
 *  thePlugins, theUILang, theWebUI, RGBackground and $ are all in scope.
 */
(function () {
	var VARIANTS = ["spectre", "reel"];
	var OVERRIDE_KEY = "qb-rutorrent-variant";
	var root = document.documentElement;

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
		return theme === "reel" ? "reel" : "spectre";
	}

	function resolveVariant() {
		var override = storedOverride();
		return override === "auto" ? cookieVariant() : override;
	}

	function token(name) {
		return getComputedStyle(root).getPropertyValue(name).trim();
	}

	function applyVariant(variant) {
		root.setAttribute("data-qb-variant", variant);
	}

	/* Repaint progress/meter gradients from the active variant tokens.
	 * RGBackground cannot read a var() off a CSS rule, so resolved hex is
	 * passed in. Completion bars use the brand gradient (primary -> accent);
	 * capacity meters run ok (primary) -> danger (destructive). */
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

	/* Resolve + set before the rest of the skin paints. */
	applyVariant(resolveVariant());

	/* Auto-follow the dashboard theme when no explicit override is set. */
	function maybeFollow() {
		if (storedOverride() !== "auto") return;
		var next = cookieVariant();
		if (next !== root.getAttribute("data-qb-variant")) {
			applyVariant(next);
			paintMeters();
		}
	}
	document.addEventListener("visibilitychange", function () {
		if (!document.hidden) maybeFollow();
	});
	window.addEventListener("focus", maybeFollow);

	/* Strings. The skin's own lang/ is not auto-loaded by the theme plugin
	 * (it loads plugins/theme/lang/*.js), so register inline; a future loaded
	 * catalog can still override via the ||. */
	theUILang.qbAppearance = theUILang.qbAppearance || "Appearance";
	theUILang.qbVariantAuto = theUILang.qbVariantAuto || "Auto (follow dashboard)";
	theUILang.qbVariantSpectre = theUILang.qbVariantSpectre || "Spectre";
	theUILang.qbVariantReel = theUILang.qbVariantReel || "Reel";

	/* Add the variant select beside the theme select in Settings. */
	var themeOnLangLoaded = plugin.onLangLoaded;
	plugin.onLangLoaded = function () {
		if (typeof themeOnLangLoaded === "function") themeOnLangLoaded.call(this);
		if (document.getElementById("qb.variant")) return;
		var current = storedOverride();
		var opts =
			'<option value="auto"' + (current === "auto" ? " selected" : "") + ">" + theUILang.qbVariantAuto + "</option>" +
			'<option value="spectre"' + (current === "spectre" ? " selected" : "") + ">" + theUILang.qbVariantSpectre + "</option>" +
			'<option value="reel"' + (current === "reel" ? " selected" : "") + ">" + theUILang.qbVariantReel + "</option>";
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
					paintMeters();
				})
			)
		);
	};

	/* Torrent/file/peer table completion bars use the variant brand gradient. */
	plugin.QuickBoxTableCreate = dxSTable.prototype.create;
	dxSTable.prototype.create = function (ele, styles, aName) {
		plugin.QuickBoxTableCreate.call(this, ele, styles, aName);
		this.prgStartColor = new RGBackground(token("--qb-prg-start"));
		this.prgEndColor = new RGBackground(token("--qb-prg-end"));
	};

	/* Capacity meters (disk/band/quota/cpu) painted once plugins finish. */
	plugin.QuickBoxAllDone = plugin.allDone;
	plugin.allDone = function () {
		plugin.QuickBoxAllDone.call(this);
		var ok = token("--qb-primary");
		var danger = token("--qb-destructive");
		$.each(["diskapceh", "diskspace", "quotaspace", "cpuload"], function (ndx, name) {
			var plg = thePlugins.get(name);
			if (plg && plg.enabled) {
				plg.prgStartColor = new RGBackground(ok);
				plg.prgEndColor = new RGBackground(danger);
			}
		});
	};
})();
