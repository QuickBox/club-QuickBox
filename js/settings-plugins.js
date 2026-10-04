/*
 *  club-QuickBox skin for ruTorrent -- settings plugin pages module.
 *
 *  Reshapes the fifteen plugin Settings pages (Autotools, XMPP, Cookies,
 *  Find at, Retrackers, Feeds, Scheduler, Search, Unpack, Channels, Ratio
 *  Groups, Screenshots, Upload ETA, History, File Manager) in place: the
 *  loose Bootstrap label/input rows become the shared field tiles, the long
 *  textareas get a sensible height and a format hint, the two rate tables read
 *  as compact settings tables and the Scheduler week grid becomes a token
 *  heatmap. Every core element id, value and event binding stays live -- nodes
 *  are only moved and wrapped, never cloned or replaced, so the plugins' save
 *  handlers keep reading the same inputs by id. Runs in global scope with
 *  window.cqb available; the leading semicolon keeps it safe under script
 *  concatenation.
 */
;(function (cqb) {
	"use strict";
	if (!cqb || window.cqbSettingsPluginsReady) return;
	window.cqbSettingsPluginsReady = true;

	var L = window.theUILang || (window.theUILang = {});

	/* Skin strings. The theme plugin never loads the skin's lang/en.js, so the
	 * defaults are registered here; a real catalog entry wins via the guard. */
	function reg(k, v) { if (!L[k]) L[k] = v; }
	reg("qbAutoLabel", "AutoLabel");
	reg("qbAutoMove", "AutoMove");
	reg("qbAutoWatch", "AutoWatch");
	reg("qbCookiesHelp", "One host per line. Format: host|name1=value1;name2=value2 (example: tracker.example|uid=123;pass=abc)");
	reg("qbFindAtHelp", "One lookup per line. Format: name|url -- use {HASH} for the torrent hash (example: Name|https://example.org/?q={HASH})");
	reg("qbAnnounceHelp", "One announce URL per line.");
	reg("qbBrowse", "Browse");

	/* ---- unit symbols (prefer the locale's own tokens) ---- */
	function uKbs() { return (L.KB || "KiB") + "/" + (L.s || "s"); }
	function uSec() { return L.s || "s"; }
	var U_PCT = "%", U_PX = "px", U_MIN = (L.m || "min");

	/* ============================================================
	 * DOM helpers -- build wrappers, MOVE existing controls into them.
	 * ============================================================ */
	function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }
	function mk(tag, cls, text) { var e = el(tag, cls); if (text != null) e.textContent = text; return e; }
	function g(id) { return document.getElementById(id); }

	/* A label node: move an existing <label> (preserves its id/for/.disabled
	 * toggling) or make a fresh one from a string. */
	function labelNode(label) {
		if (label && label.nodeType === 1) return label;
		return mk("label", null, label == null ? "" : label);
	}

	/* Strip a trailing "(unit)" or ", unit" so a moved label reads cleanly once
	 * the value's unit shows as a right adornment instead. */
	function stripUnit(label) {
		if (label && label.nodeType === 1) {
			label.textContent = (label.textContent || "")
				.replace(/\s*\([^)]*\)\s*:?\s*$/, "")
				.replace(/\s*,\s*[^,]{1,6}$/, "")
				.replace(/:\s*$/, "");
		}
		return label;
	}

	function tile(label, control, unit) {
		var f = el("div", "cqb-field");
		f.appendChild(labelNode(label));
		var ctl = el("div", "cqb-control" + (unit ? " cqb-has-unit" : ""));
		ctl.appendChild(control);
		if (unit) ctl.appendChild(mk("span", "cqb-unit", unit));
		f.appendChild(ctl);
		return f;
	}

	function wide(label, control) {
		var f = el("div", "cqb-field-wide");
		if (label != null && label !== "") f.appendChild(labelNode(label));
		f.appendChild(control);
		return f;
	}

	function wideBrowse(label, input, btn) {
		var f = el("div", "cqb-field-wide");
		f.appendChild(labelNode(label));
		var row = el("div", "cqb-input-group");
		row.appendChild(input);
		if (btn) {
			if (cqb.tooltip) cqb.tooltip(btn, L.Browse || L.qbBrowse);
			row.appendChild(btn);
		}
		f.appendChild(row);
		return f;
	}

	function check(input, label) {
		var c = el("div", "cqb-check");
		if (input) c.appendChild(input);
		c.appendChild(labelNode(label));
		return c;
	}

	function grid() { return el("div", "cqb-field-grid"); }
	function checkGrid() { return el("div", "cqb-check-grid"); }
	function help(text) { return mk("div", "cqb-help", text); }

	/* The <label> that immediately follows a checkbox (its visible caption). */
	function nextLabel(input) {
		var n = input && input.nextElementSibling;
		return (n && n.tagName === "LABEL") ? n : null;
	}

	/* The caption label for a control -- adjacent, by for=, in the same column,
	 * or in the next column (the Autotools checkbox/label split-column case). */
	function captionFor(input) {
		if (!input) return null;
		if (input.id) {
			var byFor = document.querySelector('label[for="' + input.id + '"]');
			if (byFor) return byFor;
		}
		var n = input.nextElementSibling;
		if (n && n.tagName === "LABEL") return n;
		var col = input.closest("[class*=col]");
		if (col) {
			var inCol = col.querySelector("label");
			if (inCol) return inCol;
			var nx = col.nextElementSibling;
			if (nx && nx.querySelector) { var l = nx.querySelector("label"); if (l) return l; }
		}
		return null;
	}

	/* Mount new content inside a fieldset (after its legend) and drop every
	 * now-empty Bootstrap .row it replaced (a page can carry several). */
	function mount(fs, node) {
		fs.appendChild(node);
		var rows = fs.querySelectorAll(".row");
		for (var i = 0; i < rows.length; i++) {
			if (!node.contains(rows[i]) && rows[i].parentNode) rows[i].parentNode.removeChild(rows[i]);
		}
	}

	/* ============================================================
	 * Page transforms. Each is guarded + null-safe; a missing element
	 * skips its part rather than throwing (the module must stay quiet).
	 * ============================================================ */
	function pCookies(pane) {
		var ta = g("hostcookies");
		if (!ta) return;
		ta.parentNode.appendChild(help(L.qbCookiesHelp));
	}

	function pFindAt(pane) {
		var ta = g("lookat");
		if (!ta) return;
		ta.parentNode.appendChild(help(L.qbFindAtHelp));
	}

	function pRetrackers(pane) {
		var fs = pane.querySelector("fieldset");
		var row = fs && fs.querySelector(".row");
		var c1 = g("dont_private"), c2 = g("add_begin");
		var e = g("eretrackers"), d = g("dretrackers");
		if (!fs || !row || !e || !d) return;
		var labels = row.querySelectorAll("label");
		var addLbl = labels[2], remLbl = labels[3];

		var cg = checkGrid();
		if (c1) cg.appendChild(check(c1, nextLabel(c1)));
		if (c2) cg.appendChild(check(c2, nextLabel(c2)));

		var pair = el("div", "cqb-retrackers");
		pair.appendChild(wide(addLbl || "", e));
		pair.appendChild(wide(remLbl || "", d));

		var wrap = el("div");
		wrap.appendChild(cg);
		wrap.appendChild(pair);
		mount(fs, wrap);
	}

	function pAutotools(pane) {
		var fs = pane.querySelector("fieldset");
		var row = fs && fs.querySelector(".row");
		if (!fs || !row) return;

		/* The enable checkbox + its own descriptive label become the sub-card
		 * header (the label is the caption core ships for the toggle), so no
		 * orphan text can float above the cards. */
		function subcard(cbId, fallbackTitle) {
			var card = el("div", "cqb-subcard");
			var head = el("div", "cqb-subcard-head");
			var cb = g(cbId);
			if (cb) head.appendChild(cb);
			var cap = captionFor(g(cbId));
			var lab;
			if (cap) {
				lab = cap;
				lab.className = "cqb-subcard-title";
				lab.textContent = (lab.textContent || "").replace(/,[^,]*:?\s*$/, "").trim();
			} else {
				lab = mk("label", "cqb-subcard-title", fallbackTitle);
			}
			lab.setAttribute("for", cbId);
			head.appendChild(lab);
			card.appendChild(head);
			var body = el("div", "cqb-subcard-body");
			card.appendChild(body);
			return body;
		}

		var cards = el("div", "cqb-subcards");

		/* AutoLabel */
		var bL = subcard("enable_label", L.qbAutoLabel);
		if (g("label_template")) bL.appendChild(wide("", g("label_template")));

		/* AutoMove */
		var bM = subcard("enable_move", L.qbAutoMove);
		if (g("automove_filter")) bM.appendChild(wide("", g("automove_filter")));
		if (g("skip_move_for_files")) bM.appendChild(wide(g("lbl_skip_move_for_files"), g("skip_move_for_files")));
		if (g("path_to_finished")) bM.appendChild(wideBrowse(g("lbl_path_to_finished"), g("path_to_finished"), g("path_to_finished_btn")));
		if (g("fileop_type")) { var gm = grid(); gm.appendChild(tile(g("lbl_fileop_type"), g("fileop_type"))); bM.appendChild(gm); }
		var cm = checkGrid();
		if (g("auto_add_label")) cm.appendChild(check(g("auto_add_label"), g("lbl_auto_add_label")));
		if (g("auto_add_name")) cm.appendChild(check(g("auto_add_name"), g("lbl_auto_add_name")));
		if (cm.childNodes.length) bM.appendChild(cm);

		/* AutoWatch */
		var bW = subcard("enable_watch", L.qbAutoWatch);
		if (g("path_to_watch")) bW.appendChild(wideBrowse(g("lbl_path_to_watch"), g("path_to_watch"), g("path_to_watch_btn")));
		var cw = checkGrid();
		if (g("watch_start")) cw.appendChild(check(g("watch_start"), g("lbl_watch_start")));
		if (cw.childNodes.length) bW.appendChild(cw);

		cards.appendChild(bL.parentNode);
		cards.appendChild(bM.parentNode);
		cards.appendChild(bW.parentNode);
		mount(fs, cards);
	}

	function pXmpp(pane) {
		var sets = pane.querySelectorAll("fieldset");
		if (sets.length < 1) return;
		/* Primary */
		var row0 = sets[0].querySelector(".row");
		if (row0) {
			var gm = grid();
			[["jabberJid"], ["jabberPasswd"], ["jabberFor"]].forEach(function (p) {
				var inp = g(p[0]); if (!inp) return;
				var lbl = pane.querySelector('label[for="' + p[0] + '"]') || prevLabel(inp);
				gm.appendChild(tile(lbl || "", inp));
			});
			var msgWrap = el("div");
			msgWrap.appendChild(gm);
			if (g("message")) msgWrap.appendChild(wide(msgLabel(pane), g("message")));
			mount(sets[0], msgWrap);
		}
		/* Advanced */
		if (sets[1]) {
			var row1 = sets[1].querySelector(".row");
			if (row1) {
				var wrap = el("div");
				if (g("advancedSettings")) { var c0 = checkGrid(); c0.appendChild(check(g("advancedSettings"), nextLabel(g("advancedSettings")))); wrap.appendChild(c0); }
				var ga = grid();
				if (g("jabberHost")) ga.appendChild(tile(g("lbl_jabberHost"), g("jabberHost")));
				if (g("jabberPort")) ga.appendChild(tile(g("lbl_jabberPort"), g("jabberPort")));
				if (ga.childNodes.length) wrap.appendChild(ga);
				if (g("useEncryption")) { var c1 = checkGrid(); c1.appendChild(check(g("useEncryption"), g("lbl_useEncryption"))); wrap.appendChild(c1); }
				mount(sets[1], wrap);
			}
		}
	}

	/* The Message/JID labels live in sibling cols; grab the nearest preceding
	 * label when there is no for= association. */
	function prevLabel(input) {
		var col = input.closest("[class*=col]");
		var prev = col && col.previousElementSibling;
		var lab = prev && prev.querySelector ? prev.querySelector("label") : null;
		return lab;
	}
	function msgLabel(pane) {
		var ta = g("message");
		return ta ? prevLabel(ta) : null;
	}

	function pFeeds(pane) {
		var fs = pane.querySelector("fieldset");
		var row = fs && fs.querySelector(".row");
		if (!fs || !row) return;
		var wrap = el("div");
		if (g("rss_interval")) {
			var gm = grid();
			gm.appendChild(tile(stripUnit(prevLabel(g("rss_interval"))), g("rss_interval"), U_MIN));
			wrap.appendChild(gm);
		}
		if (g("rss_show_errors_delayed")) {
			var cg = checkGrid();
			cg.appendChild(check(g("rss_show_errors_delayed"), nextLabel(g("rss_show_errors_delayed"))));
			wrap.appendChild(cg);
		}
		mount(fs, wrap);
	}

	function pScheduler(pane) {
		/* The week grid + legend are restyled in CSS; only the three Limited
		 * rate fieldsets become compact tile pairs with a KiB/s adornment. */
		var sets = pane.querySelectorAll("fieldset");
		for (var i = 1; i <= 3; i++) {
			var fs = sets[i];
			if (!fs) continue;
			var row = fs.querySelector(".row");
			if (!row) continue;
			var gm = grid();
			["restrictedUL" + i, "restrictedDL" + i].forEach(function (id) {
				var inp = g(id); if (!inp) return;
				gm.appendChild(tile(stripUnit(g("lbl_" + id)), inp, uKbs()));
			});
			mount(fs, gm);
		}
		/* Stand the three restricted-rate cards side by side. */
		if (sets[1] && sets[1].parentNode) {
			var lg = el("div", "cqb-limited-grid");
			sets[1].parentNode.insertBefore(lg, sets[1]);
			for (var k = 1; k <= 3; k++) if (sets[k]) lg.appendChild(sets[k]);
		}
	}

	function pSearch(pane) {
		var sets = pane.querySelectorAll("fieldset");
		/* Common limitations */
		if (sets[0]) {
			var r0 = sets[0].querySelector(".row");
			if (r0 && g("exs_limit")) {
				var gm = grid();
				gm.appendChild(tile(g("lbl_exs_limit"), g("exs_limit")));
				mount(sets[0], gm);
			}
		}
		/* Each engine block (public + private) -> checks + limit tile. */
		pane.querySelectorAll(".seng_public, .seng_private").forEach(function (blk) {
			if (blk.dataset.cqbEng) return;
			var name = blk.id.replace(/^cont_/, "");
			var enabled = g(name + "_enabled"), global = g(name + "_global"), limit = g(name + "_limit");
			var frag = el("div");
			var cg = checkGrid();
			if (enabled) cg.appendChild(check(enabled, g("lbl_" + name + "_enabled") || nextLabel(enabled)));
			if (global) cg.appendChild(check(global, g("lbl_" + name + "_global") || nextLabel(global)));
			if (cg.childNodes.length) frag.appendChild(cg);
			if (limit) { var gm = grid(); gm.appendChild(tile(g("lbl_" + name + "_limit"), limit)); frag.appendChild(gm); }
			/* keep any trailing hint link (LoginMgr note) below the fields */
			var link = blk.querySelector("a");
			if (link) { link.classList.add("cqb-login-hint"); frag.appendChild(link); }
			blk.textContent = "";
			blk.appendChild(frag);
			blk.dataset.cqbEng = "1";
		});
	}

	function pUnpack(pane) {
		var sets = pane.querySelectorAll("fieldset");
		if (sets[0]) {
			var r0 = sets[0].querySelector(".row");
			if (r0) {
				var wrap = el("div");
				if (g("unpack_enabled")) { var cg = checkGrid(); cg.appendChild(check(g("unpack_enabled"), nextLabel(g("unpack_enabled")))); wrap.appendChild(cg); }
				if (g("edit_filter")) wrap.appendChild(wide("", g("edit_filter")));
				if (g("edit_unpack1")) wrap.appendChild(wideBrowse(g("lbl_edit_unpack1"), g("edit_unpack1"), g("edit_unpack1_btn")));
				mount(sets[0], wrap);
			}
		}
		if (sets[1]) {
			var r1 = sets[1].querySelector(".row");
			if (r1) {
				var cg2 = checkGrid();
				if (g("unpack_label")) cg2.appendChild(check(g("unpack_label"), nextLabel(g("unpack_label"))));
				if (g("unpack_name")) cg2.appendChild(check(g("unpack_name"), nextLabel(g("unpack_name"))));
				mount(sets[1], cg2);
			}
		}
	}

	/* Give a plugin rate table the shared settings-table language. */
	function styleTable(table, numColFirst) {
		if (!table || table.dataset.cqbTable) return;
		table.classList.add("cqb-table");
		var heads = table.querySelectorAll("thead th");
		if (numColFirst && heads[0]) heads[0].classList.add("cqb-col-num");
		table.querySelectorAll("tbody tr").forEach(function (tr) {
			var td0 = tr.children[0];
			if (numColFirst && td0) td0.classList.add("cqb-num");
		});
		table.dataset.cqbTable = "1";
	}

	function pChannels(pane) {
		var fs = pane.querySelector("fieldset");
		if (!fs) return;
		var table = fs.querySelector("table");
		styleTable(table, true);
		/* number inputs stay compact */
		pane.querySelectorAll("input.num").forEach(function (i) {
			var td = i.closest("td"); if (td) td.classList.add("cqb-num");
		});
		if (table) {
			var holder = table.closest(".col-12") || table.parentNode;
			holder.classList.add("cqb-table-wrap");
		}
		/* Default channel as a tile */
		if (g("chDefault")) {
			var gm = grid();
			gm.appendChild(tile(prevLabel(g("chDefault")), g("chDefault")));
			var row = fs.querySelector(".row");
			if (row) row.appendChild(gm);
		}
	}

	function pRatio(pane) {
		var sets = pane.querySelectorAll("fieldset");
		var fs = sets[0];
		if (!fs) return;
		var table = fs.querySelector("table");
		styleTable(table, true);
		if (table) {
			var holder = table.closest(".col-12") || table.parentNode;
			holder.classList.add("cqb-table-wrap");
		}
		pane.querySelectorAll("input.ratio-condition").forEach(function (i) {
			var td = i.closest("td"); if (td) td.classList.add("cqb-num");
		});
		if (g("ratDefault")) {
			var gm = grid();
			gm.appendChild(tile(prevLabel(g("ratDefault")), g("ratDefault")));
			var row = fs.querySelector(".row");
			if (row) row.appendChild(gm);
		}
		/* Fold the "UL, GiB" note card into a help block, drop the extra card. */
		if (sets[1]) {
			var spans = sets[1].querySelectorAll("span");
			var row2 = fs.querySelector(".row");
			spans.forEach(function (s) {
				if (row2) row2.appendChild(help(s.textContent));
			});
			if (sets[1].parentNode) sets[1].parentNode.removeChild(sets[1]);
		}
	}

	function pScreenshots(pane) {
		var fs = pane.querySelector("fieldset");
		var row = fs && fs.querySelector(".row");
		if (!fs || !row) return;
		var gm = grid();
		/* Frame width: the enable checkbox lives beside the label. */
		if (g("exfrmwidth")) {
			var lab = el("label");
			if (g("exusewidth")) lab.appendChild(g("exusewidth"));
			var caption = g("lbl_exfrmwidth");
			lab.appendChild(document.createTextNode(" " + (caption ? caption.textContent : "")));
			if (caption && caption.parentNode) caption.parentNode.removeChild(caption);
			var f = el("div", "cqb-field");
			f.appendChild(lab);
			var ctl = el("div", "cqb-control cqb-has-unit");
			ctl.appendChild(g("exfrmwidth"));
			ctl.appendChild(mk("span", "cqb-unit", U_PX));
			f.appendChild(ctl);
			gm.appendChild(f);
		}
		[["exfrmcount", null], ["exfrmoffs", uSec()], ["exfrminterval", uSec()], ["explayinterval", uSec()], ["exformat", null]].forEach(function (p) {
			var inp = g(p[0]); if (!inp) return;
			gm.appendChild(tile(stripUnit(prevLabel(inp)), inp, p[1]));
		});
		mount(fs, gm);
	}

	function pUploadEta(pane) {
		var fs = pane.querySelector("fieldset");
		var row = fs && fs.querySelector(".row");
		if (!fs || !row) return;
		var wrap = el("div");
		if (g("uploadtarget")) {
			var gm = grid();
			var legend = fs.querySelector("legend");
			gm.appendChild(tile(legend ? legend.textContent : "", g("uploadtarget"), U_PCT));
			wrap.appendChild(gm);
		}
		/* the explanatory paragraph -> a help line */
		var note = row.querySelector(".col-12 div") || row.querySelector(".col-12");
		if (note && (note.textContent || "").trim()) {
			wrap.appendChild(help(note.textContent.trim()));
		}
		mount(fs, wrap);
	}

	function pHistory(pane) {
		var sets = pane.querySelectorAll("fieldset");
		/* Log */
		if (sets[0]) {
			var r0 = sets[0].querySelector(".row");
			if (r0) {
				var wrap = el("div");
				if (g("history_limit")) { var gm = grid(); gm.appendChild(tile(prevLabel(g("history_limit")), g("history_limit"))); wrap.appendChild(gm); }
				var cg = checkGrid();
				["history_addition", "history_deletion", "history_finish"].forEach(function (id) {
					if (g(id)) cg.appendChild(check(g(id), nextLabel(g(id))));
				});
				if (cg.childNodes.length) wrap.appendChild(cg);
				mount(sets[0], wrap);
			}
		}
		/* Desktop notifications: keep the tip + button, tidy the auto-close row */
		var np = g("notifParam");
		if (np) {
			var cg2 = checkGrid();
			if (g("not_autoclose")) cg2.appendChild(check(g("not_autoclose"), g("lbl_not_closeinterval")));
			var gm2 = grid();
			if (g("not_closeinterval")) gm2.appendChild(tile("", g("not_closeinterval"), uSec()));
			var w2 = el("div");
			w2.appendChild(cg2);
			if (gm2.childNodes.length) w2.appendChild(gm2);
			np.parentNode.insertBefore(w2, np);
			np.parentNode.removeChild(np);
		}
		var tip = g("notifTip");
		if (tip) tip.classList.add("cqb-help");
		/* PushBullet */
		if (sets[2]) {
			var r2 = sets[2].querySelector(".row");
			if (r2) {
				var wrap3 = el("div");
				if (g("pushbullet_enabled")) { var c3 = checkGrid(); c3.appendChild(check(g("pushbullet_enabled"), nextLabel(g("pushbullet_enabled")))); wrap3.appendChild(c3); }
				if (g("pushbullet_key")) wrap3.appendChild(wide(g("lbl_pushbullet_key"), g("pushbullet_key")));
				var c4 = checkGrid();
				["pushbullet_addition", "pushbullet_deletion", "pushbullet_finish"].forEach(function (id) {
					if (g(id)) c4.appendChild(check(g(id), g("lbl_" + id)));
				});
				if (c4.childNodes.length) wrap3.appendChild(c4);
				mount(sets[2], wrap3);
			}
		}
	}

	function pFileManager(pane) {
		var fs = pane.querySelector("fieldset");
		var row = fs && fs.querySelector(".row");
		if (!fs || !row) return;
		var wrap = el("div");

		var gm = grid();
		if (g("flm-settings-opt-histpath")) gm.appendChild(tile(prevLabel(g("flm-settings-opt-histpath")), g("flm-settings-opt-histpath")));
		if (g("flm-settings-opt-permf")) gm.appendChild(tile(prevLabel(g("flm-settings-opt-permf")), g("flm-settings-opt-permf")));
		if (g("flm-settings-opt-timef")) gm.appendChild(tile(prevLabel(g("flm-settings-opt-timef")), g("flm-settings-opt-timef")));
		wrap.appendChild(gm);

		var cg = checkGrid();
		if (g("flm-settings-opt-showhidden")) cg.appendChild(check(g("flm-settings-opt-showhidden"), nextLabel(g("flm-settings-opt-showhidden"))));
		if (g("flm-settings-opt-logActions")) cg.appendChild(check(g("flm-settings-opt-logActions"), nextLabel(g("flm-settings-opt-logActions"))));
		if (cg.childNodes.length) wrap.appendChild(cg);

		/* Token legend: each "<strong>%s</strong> - seconds" -> code chip + desc */
		var legend = el("div", "cqb-fmt-legend");
		var preview = el("div", "cqb-fmt-preview");
		var tokenSpans = [];
		row.querySelectorAll(".col-md-4 span, .col-md-6 span").forEach(function (s) {
			tokenSpans.push(s);
		});
		tokenSpans.forEach(function (s) {
			var strong = s.querySelector("strong");
			var codeTxt = strong ? strong.textContent.trim() : "";
			var rest = (s.textContent || "").replace(codeTxt, "").replace(/^[\s\-]+/, "").trim();
			if (/^%[a-zA-Z]$/.test(codeTxt)) {
				var item = el("div", "cqb-fmt-item");
				item.appendChild(mk("span", "cqb-fmt-code", codeTxt));
				item.appendChild(mk("span", null, rest));
				legend.appendChild(item);
			} else {
				/* the Format: / Equals to: preview spans */
				var p = el("span");
				p.appendChild(mk("span", "cqb-fmt-sep", codeTxt + " "));
				p.appendChild(mk("code", null, rest));
				preview.appendChild(p);
			}
		});
		if (legend.childNodes.length) wrap.appendChild(legend);
		if (preview.childNodes.length) wrap.appendChild(preview);

		mount(fs, wrap);
	}

	var TRANSFORMS = {
		st_autotools: pAutotools, st_xmpp: pXmpp, st_cookies: pCookies,
		st_lookat: pFindAt, st_retrackers: pRetrackers, st_rss: pFeeds,
		st_scheduler: pScheduler, st_extsearch: pSearch, st_unpack: pUnpack,
		st_throttle: pChannels, st_ratio: pRatio, st_screenshots: pScreenshots,
		st_uploadeta: pUploadEta, st_history: pHistory, "flm-settings-pane": pFileManager
	};

	/* ============================================================
	 * Driver: run each transform once, re-check as panes appear.
	 * ============================================================ */
	var pagesEl = null, obs = null, syncing = false;

	function sweep() {
		if (syncing || !pagesEl) return;
		syncing = true;
		try {
			if (obs) obs.disconnect();
			for (var id in TRANSFORMS) {
				var pane = document.getElementById(id);
				if (!pane || pane.dataset.cqbPlug) continue;
				try { TRANSFORMS[id](pane); } catch (e) { /* one page must not break the rest */ }
				pane.dataset.cqbPlug = "1";
			}
		} finally {
			if (obs && pagesEl) obs.observe(pagesEl, { childList: true });
			syncing = false;
		}
	}

	function start() {
		pagesEl = document.getElementById("stg-pages");
		if (!pagesEl) return false;
		obs = new MutationObserver(function () { sweep(); });
		sweep();
		return true;
	}

	if (!start()) {
		var tries = 0;
		var timer = setInterval(function () {
			if (start() || ++tries >= 20) clearInterval(timer);
		}, 300);
	}
})(window.cqb);
