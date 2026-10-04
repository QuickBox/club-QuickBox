/*
 *  club-QuickBox skin for ruTorrent -- Peers pane (#PeerList).
 *
 *  Loaded by init.js once theWebUI is ready. Runs in global scope with
 *  theWebUI, dxSTable, jQuery and window.cqb available. The leading semicolon
 *  keeps the file safe if it is ever concatenated after another.
 *
 *  The core `prs` dxSTable re-renders its cells in place on every peers poll,
 *  so none of its text is clobbered: one MutationObserver, batched per frame,
 *  tags each cell with data-cqb-col (the stable column id) and layers the
 *  decoration css/peers.css draws -- a framed country flag + mono IP, glyph
 *  chips for the peer flags, the shared Done track (--cqb-p), muted zeros and
 *  tinted live rates, the country name without its |CC| prefix, and the
 *  zero-peers empty state. Address + Client absorb the pane slack so the table
 *  fills its width.
 */
;(function (cqb) {
	"use strict";

	function t(key, fallback) { return (window.theUILang && theUILang[key]) || fallback; }

	/* Peer-flag chip labels + the zero-peers message. */
	theUILang.cqb_peerFlagIncoming = theUILang.cqb_peerFlagIncoming || "Incoming connection";
	theUILang.cqb_peerFlagEncrypted = theUILang.cqb_peerFlagEncrypted || "Encrypted";
	theUILang.cqb_peerFlagSnubbed = theUILang.cqb_peerFlagSnubbed || "Snubbed";
	theUILang.cqb_noPeers = theUILang.cqb_noPeers || "No peers connected";

	var CONTAINER = "PeerList";
	/* Peer flag letter -> { glyph svg, chip key, label }. Order drives render. */
	var FLAGS = [
		{ ch: "I", kind: "incoming",  svg: "flag-incoming",  label: "cqb_peerFlagIncoming" },
		{ ch: "E", kind: "encrypted", svg: "flag-encrypted", label: "cqb_peerFlagEncrypted" },
		{ ch: "S", kind: "snubbed",   svg: "flag-snubbed",   label: "cqb_peerFlagSnubbed" }
	];

	/* geoip2 serves its flag gifs from plugins/geoip2/flags/<cc>.gif. The flag is
	 * relocated out of Address into the Flags column, so it is drawn as a fresh
	 * element pointed at this base (derived off the theme plugin path, which ends
	 * in the skin dir) rather than reusing the geoip .stable-icon node. */
	function flagsBase() {
		var p = (cqb && cqb.path) || "";
		var root = p.replace(/plugins\/theme\/.*$/, "");
		return root + "plugins/geoip2/flags/";
	}
	var FLAGS_BASE = flagsBase();

	function tableObj() {
		try {
			return window.theWebUI && theWebUI.tables && theWebUI.tables.prs
				? theWebUI.tables.prs.obj : null;
		} catch (e) { return null; }
	}

	/* Cell class stable-PeerList-col-N carries the ORIGINAL column index, so
	 * obj.ids[N] is the stable column id regardless of display reorder. */
	function cellColId(td, ids) {
		var m = /stable-PeerList-col-(\d+)/.exec(td.className || "");
		if (!m || !ids) return null;
		var id = ids[parseInt(m[1], 10)];
		return id == null ? null : id;
	}

	function firstDiv(td) {
		for (var i = 0; i < td.children.length; i++) {
			if (td.children[i].tagName === "DIV" &&
				!td.children[i].classList.contains("meter-value")) return td.children[i];
		}
		return null;
	}

	/* ---- per-column decorators ------------------------------------------- */

	/* The country code the geoip plugin attached to the row's .stable-icon
	 * (geoip geoip_flag_<cc>), read off the Address cell. The flag itself renders
	 * in the Flags column, never in Address. */
	function rowCC(tr) {
		var icon = tr && tr.querySelector("td[data-cqb-col='name'] .stable-icon");
		if (!icon) return "";
		var m = /geoip_flag_([a-z]{2})/i.exec(icon.className || "");
		return m ? m[1].toLowerCase() : "";
	}

	function countryName(tr, cc) {
		var co = tr && tr.querySelector("td[data-cqb-col='country'] div");
		var txt = co ? (co.textContent || "").replace(/^\|[A-Za-z]{2}\|\s*/, "").trim() : "";
		if (txt) return txt;
		var tbl = window.theUILang && theUILang.country;
		return (tbl && (tbl[cc] || tbl[cc.toUpperCase()])) || cc.toUpperCase();
	}

	/* The framed country flag -- first item in the Flags column (16x12 raster from
	 * plugins/geoip2/flags, tooltip = country name). */
	function makeGeoFlag(cc, name) {
		var f = document.createElement("span");
		f.className = "cqb-flag-geo";
		f.style.backgroundImage = 'url("' + FLAGS_BASE + cc + '.gif")';
		if (cqb.tooltip && name) cqb.tooltip(f, name);
		return f;
	}

	function makeChip(spec) {
		var chip = document.createElement("span");
		chip.className = "cqb-flag-chip";
		chip.setAttribute("data-flag", spec.kind);
		var glyph = document.createElement("span");
		glyph.className = "cqb-flag-glyph";
		var u = 'url("' + cqb.path + "images/icons/" + spec.svg + '.svg")';
		glyph.style.webkitMaskImage = u;
		glyph.style.maskImage = u;
		chip.appendChild(glyph);
		if (cqb.tooltip) cqb.tooltip(chip, t(spec.label, spec.kind));
		return chip;
	}

	/* Flags column: the country flag first (when geoip knows it), then one chip per
	 * I/E/S peer flag. Never empty while the country is known. */
	function decorateFlags(td, tr) {
		var div = firstDiv(td);
		var letters = div ? (div.textContent || "").trim() : "";
		var cc = rowCC(tr);
		var sig = cc + "|" + letters;
		var box = td.querySelector(".cqb-flags");
		if (box && box.getAttribute("data-f") === sig) return;
		if (!box) {
			box = document.createElement("span");
			box.className = "cqb-flags";
			td.insertBefore(box, td.firstChild);
		}
		box.setAttribute("data-f", sig);
		box.textContent = "";
		if (cc) box.appendChild(makeGeoFlag(cc, countryName(tr, cc)));
		for (var i = 0; i < FLAGS.length; i++) {
			if (letters.indexOf(FLAGS[i].ch) !== -1) box.appendChild(makeChip(FLAGS[i]));
		}
	}

	/* The core writes the fill percent as .meter-value's inline width; mirror it
	 * onto the cell as --cqb-p (0..1) so css/table.css draws the fixed track. */
	function decorateDone(td) {
		var mv = td.querySelector(".meter-value");
		if (!mv) return;
		var pct = parseFloat(mv.style.width);
		if (isNaN(pct)) return;
		if (pct < 0) pct = 0; else if (pct > 100) pct = 100;
		td.style.setProperty("--cqb-p", pct / 100);
	}

	/* Drop the geoip "|CC| " prefix, leaving the country name. Idempotent: after
	 * the strip the text no longer matches, so a repeat pass is a no-op; the next
	 * core update re-adds the prefix and is stripped again. */
	function decorateCountry(td) {
		var div = firstDiv(td);
		if (!div) return;
		var txt = div.textContent || "";
		var m = /^\|[A-Za-z]{2}\|\s*/.exec(txt);
		if (m) div.textContent = txt.slice(m[0].length);
	}

	/* Trailing version token muted; the client name stays in the foreground. */
	function decorateClient(td) {
		var div = firstDiv(td);
		if (!div) return;
		var raw = div.textContent || "";
		if (div.getAttribute("data-cqb-cv") === raw && div.querySelector(".cqb-ver")) return;
		var m = /^(.*\S)\s+(v?\d[\w.\-]*)$/.exec(raw);
		div.textContent = "";
		if (m) {
			div.appendChild(document.createTextNode(m[1] + " "));
			var vs = document.createElement("span");
			vs.className = "cqb-ver";
			vs.textContent = m[2];
			div.appendChild(vs);
		} else {
			div.appendChild(document.createTextNode(raw));
		}
		div.setAttribute("data-cqb-cv", div.textContent);
	}

	/* A byte total or rate that formats to zero (or an empty rate) is muted. */
	function decorateZero(td) {
		var div = firstDiv(td);
		var zero = !div || !parseFloat(div.textContent || "");
		if (zero !== td.classList.contains("cqb-zero")) td.classList.toggle("cqb-zero", zero);
	}

	function decorateCell(td, ids, tr) {
		var id = cellColId(td, ids);
		if (!id) return;
		if (td.getAttribute("data-cqb-col") !== id) td.setAttribute("data-cqb-col", id);
		switch (id) {
			case "flags": decorateFlags(td, tr); break;
			case "done": decorateDone(td); break;
			case "country": decorateCountry(td); break;
			case "version": decorateClient(td); break;
			case "downloaded": case "uploaded": case "peerdownloaded":
			case "dl": case "ul": case "peerdl": decorateZero(td); break;
			default: break;
		}
	}

	function realRows(cont) {
		return cont.querySelectorAll(".stable-body tbody:not(.stable-virtpad) tr");
	}

	/* Tag every cell's data-cqb-col FIRST so the Flags pass can read the Address
	 * flag + country name by selector, then decorate. */
	function decorateAll(cont, ids) {
		var rows = realRows(cont);
		for (var i = 0; i < rows.length; i++) {
			var cells = rows[i].cells, c, cid;
			for (c = 0; c < cells.length; c++) {
				cid = cellColId(cells[c], ids);
				if (cid && cells[c].getAttribute("data-cqb-col") !== cid) cells[c].setAttribute("data-cqb-col", cid);
			}
			for (c = 0; c < cells.length; c++) decorateCell(cells[c], ids, rows[i]);
		}
	}

	/* ---- empty state ----------------------------------------------------- */

	function ensureEmpty(cont) {
		var el = cont.querySelector(".cqb-peer-empty");
		if (el) return el;
		el = document.createElement("div");
		el.className = "cqb-peer-empty";
		var g = document.createElement("span");
		g.className = "cqb-peer-empty-glyph";
		var u = 'url("' + cqb.path + 'images/icons/tab-peers.svg")';
		g.style.webkitMaskImage = u;
		g.style.maskImage = u;
		var txt = document.createElement("span");
		txt.className = "cqb-peer-empty-text";
		txt.textContent = t("cqb_noPeers", "No peers connected");
		el.appendChild(g);
		el.appendChild(txt);
		cont.appendChild(el);
		return el;
	}

	/* A selected torrent with zero peer rows shows the empty state. No selection
	 * is the details module's prompt, never ours. */
	function updateEmpty(cont) {
		ensureEmpty(cont);
		var selected = false;
		try { selected = !!(window.theWebUI && theWebUI.dID); } catch (e) { selected = false; }
		var empty = selected && realRows(cont).length === 0;
		if (empty !== cont.hasAttribute("data-cqb-empty")) {
			if (empty) cont.setAttribute("data-cqb-empty", "1");
			else cont.removeAttribute("data-cqb-empty");
		}
	}

	/* ---- fill the pane --------------------------------------------------- */

	/* Per-column user override: the set of column ids the user has resized by hand.
	 * Those keep their core colsdata width; the pane slack is still distributed to
	 * the columns the user has NOT resized, so the table always fills. The set lives
	 * in the server-persisted settings (like the column widths), so it follows the
	 * user across devices. installLock records the column each resize touched. */
	var WIDTHS_KEY = "webui.cqb.prs_userwidths";
	function userWidths() {
		try {
			var v = window.theWebUI && theWebUI.settings ? theWebUI.settings[WIDTHS_KEY] : null;
			if (Array.isArray(v)) return v.slice();
			return v ? String(v).split(",").filter(Boolean) : [];
		} catch (e) { return []; }
	}
	function addUserWidth(id) {
		if (!id) return;
		try {
			var set = userWidths();
			if (set.indexOf(id) === -1) {
				set.push(id);
				theWebUI.settings[WIDTHS_KEY] = set;
				if (typeof theWebUI.save === "function") theWebUI.save();
			}
		} catch (e) { /* noop */ }
	}
	/* Record a user width ONLY from a real pointer drag of a column divider -- never
	 * from a programmatic resizeColumn, a load, a sort, a toggle or our own fit (all
	 * of which can reach colDragResizeEnd or move widths). A genuine resize starts
	 * with a pointerdown while the engine has a divider under the cursor
	 * (obj.hotCell > -1) and ends with colDragResizeEnd while obj.isResizing is set. */
	function installLock(obj, cont) {
		if (!obj || obj._cqbLock) return;
		obj._cqbLock = true;
		var dragging = false;
		cont.addEventListener("pointerdown", function () { dragging = obj.hotCell > -1; }, true);
		var clear = function () { setTimeout(function () { dragging = false; }, 0); };
		window.addEventListener("pointerup", clear, true);
		window.addEventListener("pointercancel", function () { dragging = false; }, true);
		var origEnd = obj.colDragResizeEnd;
		if (typeof origEnd === "function") {
			obj.colDragResizeEnd = function () {
				try {
					if (dragging && this.isResizing) {
						var hc = this.hotCell;
						if (hc != null && hc >= 0 && this.colsdata[hc]) addUserWidth(this.colsdata[hc].id);
					}
				} catch (e) { /* noop */ }
				return origEnd.apply(this, arguments);
			};
		}
	}

	/* Flags holds the country flag + up to three 18px chips, so its default 60px
	 * clips; floor it to the full cluster. */
	var NAME_MIN = 150, VER_MIN = 140, FLAGS_MIN = 112, lastSig = "";

	/* Floor every enabled column so its header text is never clipped: Flags to the
	 * flag+chips cluster, and each column to its header's intrinsic width + 2px of
	 * slack. A column the user sized by hand is left to ellipsize with a tooltip
	 * instead of growing. Returns true if any colsdata width changed. */
	function applyMinimums(obj, cont, uset) {
		var heads = cont.querySelectorAll("thead td");
		var order = obj.colOrder || [];
		var changed = false;
		for (var di = 0; di < heads.length; di++) {
			var oi = order.length ? order[di] : di;
			if (oi == null) oi = di;
			var c = obj.colsdata[oi];
			if (!c || !c.enabled) continue;
			var sized = uset.indexOf(c.id) !== -1;
			if (c.id === "flags" && !sized && (parseInt(c.width, 10) || 0) < FLAGS_MIN) { c.width = FLAGS_MIN; changed = true; }
			var d = heads[di].querySelector("div");
			if (!d) continue;
			var clip = d.scrollWidth > d.clientWidth + 1;
			if (clip && !sized) {
				c.width = (parseInt(c.width, 10) || 0) + (d.scrollWidth - d.clientWidth) + 6;
				changed = true;
			} else if (clip && cqb.tooltip) {
				cqb.tooltip(d, (c.text || d.textContent || "").trim());
			} else if (d.getAttribute("data-cqb-tip")) {
				d.removeAttribute("data-cqb-tip");
			}
		}
		return changed;
	}

	function lastVisibleCol(obj) {
		var order = obj.colOrder || [], last = null;
		for (var di = 0; di < order.length; di++) {
			var c = obj.colsdata[order[di]];
			if (c && c.enabled) last = c;
		}
		return last;
	}

	/* Distribute the pane slack to the fillers the user has NOT resized (Address
	 * first, then Client); once both are user-sized the slack goes to the last
	 * visible column, so the table always fills. User-resized columns keep their
	 * width; everything else keeps its header-floored minimum. */
	function fitColumns(cont) {
		var obj = tableObj();
		if (!obj || !obj.colsdata) return;
		var body = cont.querySelector(".stable-body");
		var avail = body ? body.clientWidth : 0;
		if (!avail) return;
		var uset = userWidths();
		var changed = applyMinimums(obj, cont, uset);

		var nameCol = null, verCol = null, n = 0;
		for (var i = 0; i < obj.colsdata.length; i++) {
			var c = obj.colsdata[i];
			if (!c.enabled) continue;
			n++;
			if (c.id === "name") nameCol = c;
			else if (c.id === "version") verCol = c;
		}
		var fillers = [];
		if (nameCol && uset.indexOf("name") === -1) fillers.push(nameCol);
		if (verCol && uset.indexOf("version") === -1) fillers.push(verCol);
		if (!fillers.length) { var lv = lastVisibleCol(obj); if (lv) fillers.push(lv); }
		if (!fillers.length) { if (changed) obj.resizeColumn(); return; }

		var sig = avail + ":" + n + ":" + uset.slice().sort().join(",");
		if (sig === lastSig && !changed) return;
		lastSig = sig;

		var other = 0;
		for (var j = 0; j < obj.colsdata.length; j++) {
			var cc = obj.colsdata[j];
			if (!cc.enabled || fillers.indexOf(cc) !== -1) continue;
			other += (parseInt(cc.width, 10) || 0);
		}
		var pool = avail - other - 1;
		var touched = false;
		if (fillers.length >= 2) {
			var nameW = Math.max(NAME_MIN, Math.round(pool * 0.6));
			var verW = Math.max(VER_MIN, pool - nameW);
			if (fillers[0].width !== nameW) { fillers[0].width = nameW; touched = true; }
			if (fillers[1].width !== verW) { fillers[1].width = verW; touched = true; }
		} else {
			var f = fillers[0];
			var floor = f.id === "name" ? NAME_MIN : (f.id === "version" ? VER_MIN : (parseInt(f.width, 10) || 0));
			var w = Math.max(floor, pool);
			if (f.width !== w) { f.width = w; touched = true; }
		}
		if ((touched || changed) && typeof obj.resizeColumn === "function") obj.resizeColumn();
	}

	/* ---- observer + wiring ----------------------------------------------- */

	function run(cont) {
		var obj = tableObj();
		if (obj) { installLock(obj, cont); if (obj.ids) decorateAll(cont, obj.ids); }
		fitColumns(cont);
		updateEmpty(cont);
	}

	function watch(cont) {
		if (!cont || cont.getAttribute("data-cqb-peers")) return;
		cont.setAttribute("data-cqb-peers", "1");
		run(cont);
		var pending = false;
		function schedule() {
			if (pending) return;
			pending = true;
			requestAnimationFrame(function () { pending = false; run(cont); });
		}
		try {
			new MutationObserver(schedule).observe(cont, {
				subtree: true, childList: true, attributes: true, attributeFilter: ["style", "class"]
			});
		} catch (e) { /* never break the bundle */ }
		try {
			if (window.ResizeObserver) new ResizeObserver(schedule).observe(cont);
			else window.addEventListener("resize", schedule);
		} catch (e) { window.addEventListener("resize", schedule); }
	}

	function init() {
		var cont = document.getElementById(CONTAINER);
		if (cont) watch(cont);
	}

	init();
	/* The peer table can finish building just after this module is injected. */
	setTimeout(init, 1200);
})(window.cqb);
