/*
 *  club-QuickBox skin for ruTorrent -- Chunks pane.
 *
 *  Replaces the plugin's grid of hex-lettered boxes with a canvas heatmap:
 *  a header of stat chips plus a Downloaded/Seen segmented control, a full
 *  width overview strip, and a dense cell grid. The native #chunks_mode
 *  select and the plugin's #cTable stay in the DOM (hidden) so core keeps
 *  requesting and populating data; this module wraps the plugin's drawChunks
 *  to read the payload and paint, and redraws on resize and variant change.
 */
;(function () {
	var CELL = 10, GAP = 2, RAD = 2, STRIP_H = 12, STRIP_RAD = 6;
	var NIBBLE_BITS = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4];

	var root = document.documentElement;
	var state = null;          /* last payload: {chunks, seen, size, tsize, mode} */
	var ui = null;             /* built DOM refs */
	var tipEl = null;
	var rafPending = false;

	function t(key, fallback) { return (window.theUILang && theUILang[key]) || fallback; }

	function cssvar(name) {
		try { return getComputedStyle(root).getPropertyValue(name).trim(); }
		catch (e) { return ""; }
	}
	function hexToRgb(hex) {
		var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec((hex || "").trim());
		if (!m) return null;
		return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
	}
	function rgba(rgb, a) {
		return rgb ? "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + a + ")" : "transparent";
	}
	/* Resolve the paint palette fresh each draw so a variant switch recolors. */
	function palette(mode) {
		var empty = hexToRgb(cssvar("--qb-surface-2")) || { r: 128, g: 128, b: 128 };
		var hex = mode
			? (cssvar("--qb-chart-seen") || cssvar("--qb-speed-down") || cssvar("--qb-accent"))
			: cssvar("--qb-primary");
		return { empty: empty, fill: hexToRgb(hex) || { r: 38, g: 174, b: 127 } };
	}

	function iv(v) { var n = parseInt(v, 10); return isNaN(n) ? 0 : n; }
	function getMode() {
		var sel = document.getElementById("chunks_mode");
		return sel ? iv(sel.value) : 0;
	}
	function seenSupported() {
		try {
			return !!(window.theWebUI && theWebUI.systemInfo && theWebUI.systemInfo.rTorrent &&
				theWebUI.systemInfo.rTorrent.apiVersion >= 4);
		} catch (e) { return false; }
	}

	function fmtSize(b) {
		if (b >= 1048576) return (b / 1048576).toFixed(b >= 10485760 ? 0 : 1) + " MiB";
		if (b >= 1024) return Math.round(b / 1024) + " KiB";
		return (b || 0) + " B";
	}
	function fmtInt(n) { return (n || 0).toLocaleString ? (n || 0).toLocaleString() : String(n || 0); }

	/* Cell count + per-cell completion for the active mode. Downloaded reads
	 * one bitfield nibble per cell (popcount over its 4 chunk-bits = true
	 * completion). Seen reads one availability byte per cell, normalized to the
	 * busiest cell so the sequential scale uses its full range. */
	function cellCount(d, mode) {
		if (mode) return d.seen ? Math.floor(d.seen.length / 2) : 0;
		return d.chunks ? d.chunks.length : 0;
	}
	function seenMax(d) {
		var mx = 1, n = Math.floor((d.seen || "").length / 2), i;
		for (i = 0; i < n; i++) { var v = parseInt(d.seen.substr(2 * i, 2), 16) || 0; if (v > mx) mx = v; }
		return mx;
	}
	function completionAt(d, mode, i, cells, mx) {
		if (mode) {
			var v = parseInt((d.seen || "").substr(2 * i, 2), 16) || 0;
			return v / mx;
		}
		var nib = parseInt((d.chunks || "").charAt(i), 16);
		if (isNaN(nib)) return 0;
		var bits = (i < cells - 1) ? 4 : ((d.tsize - i * 4) || 4);
		if (bits > 4) bits = 4; if (bits < 1) bits = 1;
		return NIBBLE_BITS[nib] / bits;
	}
	function chunksPerCell(d, cells) {
		return Math.max(1, Math.round((d.tsize || cells) / (cells || 1)));
	}

	/* ---- DOM ------------------------------------------------------------- */
	function seg(mode, label) {
		var b = document.createElement("button");
		b.type = "button";
		b.className = "qb-seg-btn";
		b.setAttribute("data-mode", String(mode));
		b.setAttribute("role", "tab");
		b.textContent = label;
		b.addEventListener("click", function () { setMode(mode); });
		b.addEventListener("keydown", function (e) {
			var k = e.key;
			if (k === "ArrowRight" || k === "ArrowLeft") {
				e.preventDefault();
				var sibs = ui.seg.querySelectorAll(".qb-seg-btn");
				var idx = Array.prototype.indexOf.call(sibs, b);
				var next = sibs[(idx + (k === "ArrowRight" ? 1 : sibs.length - 1)) % sibs.length];
				if (next) { next.focus(); setMode(iv(next.getAttribute("data-mode"))); }
			}
		});
		return b;
	}
	function chip(label) {
		var c = document.createElement("span");
		c.className = "qb-chunks-chip";
		var l = document.createElement("i"); l.className = "qb-chunks-chip-l"; l.textContent = label;
		var v = document.createElement("b"); v.className = "qb-chunks-chip-v";
		c.appendChild(l); c.appendChild(v);
		return { el: c, v: v };
	}

	function ensureUI() {
		if (ui) return ui;
		var pane = document.getElementById("Chunks");
		if (!pane) return null;
		var rootEl = document.createElement("div");
		rootEl.id = "qb-chunks";

		var bar = document.createElement("div"); bar.className = "qb-chunks-bar";
		var stats = document.createElement("div"); stats.className = "qb-chunks-stats";
		var cCount = chip(t("cqb_chunks_chunks", "Chunks")), cSize = chip(t("cqb_chunks_size", "Size")), cDone = chip(t("cqb_chunks_done", "Done"));
		var note = document.createElement("span"); note.className = "qb-chunks-note";
		stats.appendChild(cCount.el); stats.appendChild(cSize.el);
		stats.appendChild(cDone.el); stats.appendChild(note);

		var segGrp = document.createElement("div");
		segGrp.className = "qb-seg"; segGrp.setAttribute("role", "tablist");
		segGrp.setAttribute("aria-label", t("cqb_chunks_mode", "Chunk map mode"));
		var segDl = seg(0, t("cqb_chunks_downloaded", "Downloaded"));
		segGrp.appendChild(segDl);
		var segSeen = null;
		if (seenSupported()) { segSeen = seg(1, t("cqb_chunks_seen", "Seen")); segGrp.appendChild(segSeen); }

		bar.appendChild(stats); bar.appendChild(segGrp);

		var strip = document.createElement("canvas"); strip.className = "qb-chunks-overview";
		strip.setAttribute("aria-hidden", "true");
		var gridWrap = document.createElement("div"); gridWrap.className = "qb-chunks-gridwrap";
		var grid = document.createElement("canvas"); grid.id = "qb-chunks-grid";
		grid.setAttribute("role", "img");
		gridWrap.appendChild(grid);

		rootEl.appendChild(bar); rootEl.appendChild(strip); rootEl.appendChild(gridWrap);
		pane.insertBefore(rootEl, pane.firstChild);

		ui = {
			root: rootEl, bar: bar, seg: segGrp, segDl: segDl, segSeen: segSeen,
			cCount: cCount.v, cSize: cSize.v, cDone: cDone.v, done: cDone.el, note: note,
			strip: strip, gridWrap: gridWrap, grid: grid
		};

		/* hover -> floating tooltip over the hovered cell */
		grid.addEventListener("mousemove", onGridMove);
		grid.addEventListener("mouseleave", hideTip);

		if (window.ResizeObserver) {
			new ResizeObserver(scheduleDraw).observe(gridWrap);
		} else {
			window.addEventListener("resize", scheduleDraw);
		}
		return ui;
	}

	function setMode(m) {
		var sel = document.getElementById("chunks_mode");
		if (sel) sel.value = String(m);
		syncSeg(m);
		if (window.theWebUI && typeof theWebUI.updateDetails === "function") {
			try { theWebUI.updateDetails(); } catch (e) { /* core refresh guard */ }
		}
	}
	function syncSeg(m) {
		if (!ui) return;
		var btns = ui.seg.querySelectorAll(".qb-seg-btn");
		for (var i = 0; i < btns.length; i++) {
			var on = iv(btns[i].getAttribute("data-mode")) === m;
			btns[i].classList.toggle("is-active", on);
			btns[i].setAttribute("aria-selected", on ? "true" : "false");
			btns[i].tabIndex = on ? 0 : -1;
		}
	}

	/* ---- tooltip --------------------------------------------------------- */
	function ensureTip() {
		if (tipEl) return tipEl;
		tipEl = document.createElement("div");
		tipEl.className = "qb-chunks-tip";
		tipEl.setAttribute("role", "status");
		document.body.appendChild(tipEl);
		return tipEl;
	}
	function hideTip() { if (tipEl) tipEl.style.opacity = "0"; }
	function onGridMove(e) {
		if (!state || !ui) return;
		var g = ui.grid, lay = g._lay;
		if (!lay) return;
		var r = g.getBoundingClientRect();
		var x = e.clientX - r.left, y = e.clientY - r.top;
		var col = Math.floor(x / (CELL + GAP)), rowN = Math.floor(y / (CELL + GAP));
		if (x - col * (CELL + GAP) > CELL || y - rowN * (CELL + GAP) > CELL) { hideTip(); return; }
		var i = rowN * lay.cols + col;
		if (col < 0 || col >= lay.cols || i < 0 || i >= lay.cells) { hideTip(); return; }
		var cpc = lay.cpc;
		var first = i * cpc, last = Math.min((i + 1) * cpc, state.tsize) - 1;
		var range = (first >= last)
			? t("cqb_chunks_one", "Chunk {n}").replace("{n}", fmtInt(first))
			: t("cqb_chunks_range", "Chunks {a}–{b}").replace("{a}", fmtInt(first)).replace("{b}", fmtInt(last));
		var pct = Math.round(completionAt(state, state.mode, i, lay.cells, lay.mx) * 100);
		var label = state.mode
			? (range + " · " + t("cqb_chunks_seen_count", "{n}× seen").replace("{n}", (parseInt((state.seen || "").substr(2 * i, 2), 16) || 0)))
			: (range + " · " + pct + "%");
		var tip = ensureTip();
		tip.textContent = label;
		tip.style.display = "block";
		var tw = tip.offsetWidth, th = tip.offsetHeight;
		var left = Math.max(4, Math.min(e.clientX - tw / 2, window.innerWidth - tw - 4));
		var top = r.top + rowN * (CELL + GAP) - th - 8;
		if (top < 4) top = r.top + rowN * (CELL + GAP) + CELL + 8;
		tip.style.left = left + "px";
		tip.style.top = top + "px";
		tip.style.opacity = "1";
	}

	/* ---- paint ----------------------------------------------------------- */
	function roundRect(ctx, x, y, w, h, r) {
		if (r > w / 2) r = w / 2; if (r > h / 2) r = h / 2;
		ctx.beginPath();
		ctx.moveTo(x + r, y);
		ctx.arcTo(x + w, y, x + w, y + h, r);
		ctx.arcTo(x + w, y + h, x, y + h, r);
		ctx.arcTo(x, y + h, x, y, r);
		ctx.arcTo(x, y, x + w, y, r);
		ctx.closePath();
	}
	function setCanvas(cv, cssW, cssH) {
		var dpr = window.devicePixelRatio || 1;
		cv.width = Math.max(1, Math.round(cssW * dpr));
		cv.height = Math.max(1, Math.round(cssH * dpr));
		cv.style.width = cssW + "px";
		cv.style.height = cssH + "px";
		var ctx = cv.getContext("2d");
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, cssW, cssH);
		return ctx;
	}
	function fillAlpha(comp) { return comp <= 0 ? 0 : 0.22 + 0.78 * comp; }

	function draw() {
		rafPending = false;
		if (!ui || !state) return;
		var d = state, mode = state.mode;
		var cells = cellCount(d, mode);
		if (!cells) { clearCanvases(); return; }
		var mx = mode ? seenMax(d) : 1;
		var pal = palette(mode);
		var cpc = chunksPerCell(d, cells);

		/* grid */
		var wrapW = ui.gridWrap.clientWidth || ui.root.clientWidth || 600;
		var cols = Math.max(1, Math.floor((wrapW + GAP) / (CELL + GAP)));
		var rows = Math.ceil(cells / cols);
		var gridW = cols * (CELL + GAP) - GAP;
		var gridH = rows * (CELL + GAP) - GAP;
		var gctx = setCanvas(ui.grid, gridW, gridH);
		var i, comp;
		for (i = 0; i < cells; i++) {
			var col = i % cols, rowN = Math.floor(i / cols);
			var x = col * (CELL + GAP), y = rowN * (CELL + GAP);
			comp = completionAt(d, mode, i, cells, mx);
			gctx.fillStyle = comp <= 0 ? rgba(pal.empty, 1) : rgba(pal.fill, fillAlpha(comp));
			roundRect(gctx, x, y, CELL, CELL, RAD);
			gctx.fill();
		}
		ui.grid._lay = { cols: cols, cells: cells, cpc: cpc, mx: mx };

		/* overview strip -- match the grid's content width, not the padded root
		 * (root.clientWidth includes the #qb-chunks padding and would overflow). */
		var stripW = wrapW;
		var sctx = setCanvas(ui.strip, stripW, STRIP_H);
		roundRect(sctx, 0, 0, stripW, STRIP_H, STRIP_RAD);
		sctx.save(); sctx.clip();
		sctx.fillStyle = rgba(pal.empty, 1);
		sctx.fillRect(0, 0, stripW, STRIP_H);
		for (var px = 0; px < stripW; px++) {
			var c0 = Math.floor(px / stripW * cells);
			var c1 = Math.max(c0 + 1, Math.floor((px + 1) / stripW * cells));
			var sum = 0, cnt = 0;
			for (var c = c0; c < c1 && c < cells; c++) { sum += completionAt(d, mode, c, cells, mx); cnt++; }
			var avg = cnt ? sum / cnt : 0;
			if (avg > 0) { sctx.fillStyle = rgba(pal.fill, fillAlpha(avg)); sctx.fillRect(px, 0, 1, STRIP_H); }
		}
		sctx.restore();

		/* a11y summary */
		var donePct = mode ? (Math.round((function () {
			var seen = 0, n = cells; for (var j = 0; j < n; j++) if (parseInt(d.seen.substr(2 * j, 2), 16)) seen++;
			return n ? seen / n * 100 : 0;
		})())) : doneValue();
		var a11y = mode
			? t("cqb_chunks_a11y_seen", "Chunk availability map: {pct}% of groups seen, {n} chunks")
			: t("cqb_chunks_a11y_done", "Chunk completion map: {pct}% complete, {n} chunks");
		ui.grid.setAttribute("aria-label", a11y.replace("{pct}", donePct).replace("{n}", fmtInt(d.tsize)));
	}

	function doneValue() {
		try {
			var t = theWebUI.torrents[theWebUI.dID];
			if (t && typeof t.done !== "undefined") return t.done / 10;
		} catch (e) {}
		return null;
	}
	function updateChips(d, mode) {
		if (!ui) return;
		var cells = cellCount(d, mode);
		ui.cCount.textContent = fmtInt(d.tsize);
		ui.cSize.textContent = fmtSize(d.size);
		var cpc = chunksPerCell(d, cells);
		ui.note.textContent = (cpc === 1
			? t("cqb_chunks_cell_one", "1 cell = {n} chunk")
			: t("cqb_chunks_cell_many", "1 cell = {n} chunks")).replace("{n}", cpc);
		if (mode) {
			var seen = 0, n = cells, j;
			for (j = 0; j < n; j++) if (parseInt((d.seen || "").substr(2 * j, 2), 16)) seen++;
			ui.done.querySelector(".qb-chunks-chip-l").textContent = t("cqb_chunks_seen", "Seen");
			ui.cDone.textContent = (n ? Math.round(seen / n * 100) : 0) + "%";
		} else {
			ui.done.querySelector(".qb-chunks-chip-l").textContent = t("cqb_chunks_done", "Done");
			var dv = doneValue();
			ui.cDone.textContent = (dv == null) ? "–" : ((dv % 10 === 0 ? dv : dv.toFixed(1)) + "%");
		}
	}

	function scheduleDraw() {
		if (rafPending) return;
		rafPending = true;
		(window.requestAnimationFrame || function (f) { setTimeout(f, 16); })(draw);
	}
	function clearCanvases() {
		if (!ui) return;
		try { setCanvas(ui.grid, 1, 1); setCanvas(ui.strip, 1, 1); } catch (e) {}
		if (ui.grid) ui.grid._lay = null;
	}

	/* ---- data ingress (wrap the chunks plugin) --------------------------- */
	function onDraw(d) {
		if (!d || !(d.chunks || d.seen)) return;
		if (!ensureUI()) return;
		state = { chunks: d.chunks, seen: d.seen, size: d.size, tsize: d.tsize, mode: getMode() };
		if (state.mode && !seenSupported()) state.mode = 0;
		syncSeg(state.mode);
		updateChips(state, state.mode);
		scheduleDraw();
	}
	function onClear() {
		state = null;
		hideTip();
		clearCanvases();
		if (ui) { ui.cCount.textContent = ui.cSize.textContent = ui.cDone.textContent = ""; ui.note.textContent = ""; }
	}

	function wrap(cp) {
		if (!cp || cp._cqbWrapped) return;
		cp._cqbWrapped = true;
		var dOrig = cp.drawChunks;
		if (typeof dOrig === "function") {
			cp.drawChunks = function (d) {
				try { dOrig.call(this, d); } catch (e) {}
				try { onDraw(d); } catch (e) {}
			};
		}
		var cOrig = cp.clearChunks;
		if (typeof cOrig === "function") {
			cp.clearChunks = function () {
				try { cOrig.call(this); } catch (e) {}
				try { onClear(); } catch (e) {}
			};
		}
	}

	function getChunksPlugin() {
		try { return window.thePlugins && thePlugins.get ? thePlugins.get("chunks") : null; }
		catch (e) { return null; }
	}

	function start() {
		var tries = 0;
		(function poll() {
			var cp = getChunksPlugin();
			if (cp) {
				wrap(cp);
				/* if the user is already viewing Chunks, force an immediate paint */
				try {
					if (window.theWebUI && theWebUI.activeView === "Chunks" && theWebUI.dID) theWebUI.updateDetails();
				} catch (e) {}
				return;
			}
			if (++tries < 40) setTimeout(poll, 150);
		})();
	}

	if (window.cqb && typeof cqb.onVariant === "function") {
		cqb.onVariant(function () { scheduleDraw(); });
	}
	start();
})();
