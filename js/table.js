/*
 *  club-QuickBox skin for ruTorrent -- table module.
 *
 *  Loaded by init.js once theWebUI is ready. Runs in global scope with
 *  theWebUI, dxSTable, jQuery ($, $$) and window.cqb available. The leading
 *  semicolon keeps the file safe if it is ever concatenated after another.
 *
 *  Progress cells: the core writes the percent as the fill's inline width
 *  and updates .meter-value in place, so it must never be wrapped or moved.
 *  We mirror that percent onto the owning cell as the custom property
 *  --cqb-p (0..1); css/table.css recomputes the fill width against a fixed
 *  track so the rounded cap is never clipped and the % label sits beside it.
 */
;(function (cqb) {
	"use strict";
	void cqb;

	function syncOne(mv) {
		try {
			var pct = parseFloat(mv.style.width);
			if (isNaN(pct)) return;
			if (pct < 0) pct = 0;
			if (pct > 100) pct = 100;
			var td = mv.closest ? mv.closest("td") : mv.parentNode;
			if (td && td.style) td.style.setProperty("--cqb-p", pct / 100);
		} catch (e) { /* never break the bundle */ }
	}

	function syncAll(root) {
		try {
			var mvs = (root || document).querySelectorAll(".meter-value");
			Array.prototype.forEach.call(mvs, syncOne);
		} catch (e) { /* never break the bundle */ }
	}

	function watch(root) {
		try {
			if (!root || root.getAttribute("data-cqb-prog")) return;
			root.setAttribute("data-cqb-prog", "1");
			syncAll(root);
			var pending = false;
			var mo = new MutationObserver(function (records) {
				/* Coalesce frequent progress updates into one frame. */
				var touched = false;
				for (var i = 0; i < records.length; i++) {
					var t = records[i].target;
					if (t && t.classList && t.classList.contains("meter-value")) { syncOne(t); touched = true; }
					else if (records[i].addedNodes && records[i].addedNodes.length) touched = true;
				}
				if (touched && !pending) {
					pending = true;
					requestAnimationFrame(function () { pending = false; syncAll(root); });
				}
			});
			mo.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ["style"] });
		} catch (e) { /* never break the bundle */ }
	}

	function init() {
		/* Main torrent list and the in-drawer file list both carry progress. */
		watch(document.getElementById("List"));
		watch(document.getElementById("FileList"));
	}

	/* The core ships the Size column at 70px, too narrow for values like
	 * "756.00 MiB"; lift it to a fit floor (by stable column id, only when
	 * narrower, so a user who widened it keeps their width). */
	var WIDTH_FLOOR = { size: 84 };
	function enforceColumnWidths() {
		try {
			var t = window.theWebUI && theWebUI.tables ? theWebUI.tables.trt : null;
			var obj = t && t.obj;
			if (!obj || !obj.colsdata) return;
			var changed = false;
			obj.colsdata.forEach(function (c) {
				var floor = WIDTH_FLOOR[c.id];
				if (floor && (parseInt(c.width, 10) || 0) < floor) { c.width = floor; changed = true; }
			});
			if (changed && typeof obj.resizeColumn === "function") obj.resizeColumn();
		} catch (e) { /* never break the bundle */ }
	}

	init();
	enforceColumnWidths();
	/* Tables can finish rendering just after this module is injected. */
	setTimeout(function () { init(); enforceColumnWidths(); }, 1200);
})(window.cqb);
