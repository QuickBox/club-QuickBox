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

	/* The core leaves the rate cell blank at zero. A standalone interval keeps
	 * an explicit "0 B/s" regardless of how the core schedules its refresh
	 * (the periodic caller may hold the original updateStatus reference). */
	function backfillZero() {
		["stup_speed", "stdown_speed"].forEach(function (id) {
			var el = document.getElementById(id);
			if (el && !el.textContent.trim()) el.textContent = "0 B/s";
		});
	}
	window.setInterval(backfillZero, 1000);
	backfillZero();
})(window.cqb);
