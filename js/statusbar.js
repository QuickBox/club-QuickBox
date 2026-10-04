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

	if (!window.theWebUI || typeof theWebUI.updateStatus !== "function") return;
	if (theWebUI.cqbStatusWrapped) return;
	theWebUI.cqbStatusWrapped = true;

	function backfillZero() {
		["stup_speed", "stdown_speed"].forEach(function (id) {
			var el = document.getElementById(id);
			if (el && !el.textContent.trim()) el.textContent = "0 B/s";
		});
	}

	var original = theWebUI.updateStatus;
	theWebUI.updateStatus = function () {
		var result = original.apply(this, arguments);
		try { backfillZero(); } catch (e) { /* never break the status loop */ }
		return result;
	};

	backfillZero();
})(window.cqb);
