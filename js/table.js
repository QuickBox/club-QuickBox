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

	/* Torrent-row Status cell -> a state pill. The core writes the localized
	 * status text into the virtual table, so that text is never touched here.
	 * Instead we read the state the core already computed onto the row's
	 * .stable-icon (its Status_* class) and mirror it as data-cqb-state on the
	 * Status cell (always the id-indexed col-1, stable across column reorder),
	 * so css/table.css draws the dot + tint. Re-run on add/sort/filter/refresh. */
	var STATUS_STATE = {
		Status_Down: "downloading", Status_Up: "seeding", Status_Up_Down: "downloading",
		Status_Incompleted: "stopped", Status_Paused: "paused",
		Status_Error: "error", Status_Error_Up: "error", Status_Error_Down: "error",
		Status_Completed: "seeding", Status_Queued_Up: "queued", Status_Queued_Down: "queued",
		Status_Checking: "checking"
	};
	function rowState(tr) {
		var icon = tr.querySelector(".stable-icon");
		if (!icon) return "";
		for (var i = 0; i < icon.classList.length; i++) {
			var s = STATUS_STATE[icon.classList[i]];
			if (s) return s;
		}
		return "";
	}
	function tagStatusAll(root) {
		try {
			var rows = root.querySelectorAll("tr");
			Array.prototype.forEach.call(rows, function (tr) {
				var cell = tr.querySelector("td.stable-List-col-1");
				if (!cell) return;
				var s = rowState(tr);
				if (s) { if (cell.getAttribute("data-cqb-state") !== s) cell.setAttribute("data-cqb-state", s); }
				else if (cell.hasAttribute("data-cqb-state")) cell.removeAttribute("data-cqb-state");
			});
		} catch (e) { /* never break the bundle */ }
	}

	function watch(root, withStatus) {
		try {
			if (!root || root.getAttribute("data-cqb-prog")) return;
			root.setAttribute("data-cqb-prog", "1");
			syncAll(root);
			if (withStatus) tagStatusAll(root);
			var pending = false;
			var mo = new MutationObserver(function (records) {
				/* Coalesce frequent progress + status updates into one frame. */
				var touched = false;
				for (var i = 0; i < records.length; i++) {
					var t = records[i].target;
					if (t && t.classList && t.classList.contains("meter-value")) { syncOne(t); touched = true; }
					else if (records[i].addedNodes && records[i].addedNodes.length) touched = true;
					else if (withStatus && t && t.classList && t.classList.contains("stable-icon")) touched = true;
				}
				if (touched && !pending) {
					pending = true;
					requestAnimationFrame(function () { pending = false; syncAll(root); if (withStatus) tagStatusAll(root); });
				}
			});
			mo.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: withStatus ? ["style", "class"] : ["style"] });
		} catch (e) { /* never break the bundle */ }
	}

	function init() {
		/* Main torrent list carries progress + status; the file list is progress. */
		watch(document.getElementById("List"), true);
		watch(document.getElementById("FileList"));
	}

	/* The core ships some columns too narrow for their formatted value: Size
	 * for "756.00 MiB", Status for the state pill, the DL/UL transfer rate for
	 * "1023.9 KiB/s", ETA for "100d 23h", and the Created On / Added On date for
	 * the full "DD.MM.YYYY HH:MM:SS" stamp. Lift each to a fit floor (by stable
	 * column id, only when narrower, so a user who widened it keeps their
	 * width). */
	var WIDTH_FLOOR = { size: 84, status: 156, created: 180, dl: 88, ul: 88, eta: 72, addtime: 132 };
	/* The History table (hst) shares those same formatted date/size values but
	 * kept the plugin's narrower defaults (date 110, size 70). Once the body
	 * font moved to the wider Inter face, "DD.MM.YYYY HH:MM:SS" and "388.00 MiB"
	 * no longer fit those defaults and ellipsized. Floor the History date/size
	 * columns by id, the same way: only a column left at its narrow default is
	 * lifted, a hand-widened one is kept, and it is immune to hide/reorder. */
	var HST_WIDTH_FLOOR = { time: 132, created: 132, seedingtime: 132, addtime: 132, size: 84, label: 72 };
	function floorColumns(key, floors) {
		var t = window.theWebUI && theWebUI.tables ? theWebUI.tables[key] : null;
		var obj = t && t.obj;
		if (!obj || !obj.colsdata) return;
		var changed = false;
		obj.colsdata.forEach(function (c) {
			var floor = floors[c.id];
			if (floor && (parseInt(c.width, 10) || 0) < floor) { c.width = floor; changed = true; }
		});
		if (changed && typeof obj.resizeColumn === "function") obj.resizeColumn();
	}
	function enforceColumnWidths() {
		try { floorColumns("trt", WIDTH_FLOOR); } catch (e) { /* never break the bundle */ }
		try { floorColumns("hst", HST_WIDTH_FLOOR); } catch (e) { /* never break the bundle */ }
	}

	init();
	enforceColumnWidths();
	/* Tables can finish rendering just after this module is injected. */
	setTimeout(function () { init(); enforceColumnWidths(); }, 1200);
})(window.cqb);
