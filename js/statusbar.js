/*
 *  club-QuickBox skin for ruTorrent -- statusbar module.
 *
 *  Loaded by init.js once theWebUI is ready. Runs in global scope with
 *  theWebUI, jQuery ($, $$) and window.cqb available. The leading semicolon
 *  keeps the file safe if it is ever concatenated after another.
 *
 *  The core leaves the speed cells blank when a rate is zero, which reads as a
 *  missing value in the chip layout. Wrap updateStatus so an empty up/down
 *  rate always shows an explicit "0 B/s".
 */
;(function (cqb) {
	"use strict";
	void cqb;

	if (window.cqbStatusBackfill) return;
	window.cqbStatusBackfill = true;

	/* The core blanks the rate cell at zero. Watch each cell and, the instant it
	 * goes empty, render the rate from the core's NUMERIC total (not its DOM
	 * text) so the chip always shows the current rate as its primary value. The
	 * observer runs before paint, so the blank the core writes is never visible;
	 * writing a non-empty value does not re-trigger (the value is not empty). */
	function fmtSpeed(bytes) {
		var s = (window.theConverter && theConverter.speed) ? theConverter.speed(bytes) : "";
		return (s && s.trim()) ? s : "0 B/s";
	}
	["stup_speed", "stdown_speed"].forEach(function (id) {
		var el = document.getElementById(id);
		if (!el) return;
		var key = (id === "stup_speed") ? "speedUL" : "speedDL";
		function fill() {
			if (el.textContent.trim()) return;
			var bytes = (window.theWebUI && theWebUI.total) ? (theWebUI.total[key] || 0) : 0;
			el.textContent = fmtSpeed(bytes);
		}
		fill();
		new MutationObserver(fill).observe(el, { childList: true, characterData: true, subtree: true });
	});
})(window.cqb);
