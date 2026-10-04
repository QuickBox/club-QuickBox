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

	/* The core blanks the rate cell at zero. Watch each cell on EVERY write: when
	 * the core writes a value, remember it; when the core writes an empty string,
	 * restore the last non-empty value so the chip is never blank. The observer
	 * runs before paint, so the blank is never visible, and restoring a value
	 * does not loop (the restored value is not empty). */
	var lastRate = { stup_speed: "0 B/s", stdown_speed: "0 B/s" };
	["stup_speed", "stdown_speed"].forEach(function (id) {
		var el = document.getElementById(id);
		if (!el) return;
		if (el.textContent.trim()) lastRate[id] = el.textContent;
		else el.textContent = lastRate[id];
		new MutationObserver(function () {
			var text = el.textContent;
			if (text.trim()) lastRate[id] = text;
			else el.textContent = lastRate[id];
		}).observe(el, { childList: true, characterData: true, subtree: true });
	});
})(window.cqb);
