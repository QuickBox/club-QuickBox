/*
 *  club-QuickBox skin for ruTorrent -- table module.
 *
 *  Loaded by init.js once theWebUI is ready. Runs in global scope with
 *  theWebUI, dxSTable, jQuery ($, $$) and window.cqb available. The leading
 *  semicolon keeps the file safe if it is ever concatenated after another.
 *
 *  Progress cells: the engine sizes the fill as a percent of the whole
 *  Done cell, which crowds neighbours and leaves no room for the figure.
 *  We wrap progressStyle so the fill is a pixel width inside a fixed track
 *  (stable.css draws the 120px rail and places the % label beside it).
 */
;(function (cqb) {
	"use strict";
	void cqb;

	try {
		if (typeof dxSTable !== "undefined" &&
			dxSTable.prototype &&
			typeof dxSTable.prototype.progressStyle === "function" &&
			!dxSTable.prototype.__cqbProgress) {
			dxSTable.prototype.__cqbProgress = true;
			var TRACK = 120;
			var orig = dxSTable.prototype.progressStyle;
			dxSTable.prototype.progressStyle = function (val) {
				var style = orig.call(this, val);
				var pct = parseFloat(val);
				if (isNaN(pct)) pct = 0;
				if (pct < 0) pct = 0;
				if (pct > 100) pct = 100;
				style.width = Math.round((pct / 100) * TRACK) + "px";
				return style;
			};
		}
	} catch (e) { /* never break the bundle */ }
})(window.cqb);
