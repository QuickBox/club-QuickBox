/*
 *  club-QuickBox skin for ruTorrent -- dialogs module.
 *
 *  Loaded by init.js once theWebUI is ready. Runs in global scope with
 *  theWebUI, theUILang, theDialogManager, jQuery ($, $$) and window.cqb
 *  available. The leading semicolon keeps the file safe if it is ever
 *  concatenated after another.
 *
 *  Job: redesign the Add Torrent dialog (drop-zone card, file chips, one
 *  primary Add) without cloning or replacing any core node -- every id and
 *  handler stays live. All other dialog chrome is pure CSS (css/dialogs.css).
 */
;(function (cqb) {
	"use strict";

	function t(key, fallback) {
		return (window.theUILang && theUILang[key]) || fallback;
	}

	/* Wire a drop-zone + file-chip pair onto a native file input without
	 * replacing it: drag/drop fills the input's FileList, chips reflect the
	 * selection, and the input's own change handlers still fire. Shared by
	 * Add Torrent and the tracker-icon upload so the two never diverge. */
	function wireDropzone(zone, chips, fileInput, opts) {
		opts = opts || {};
		function setFiles(fileList) {
			try {
				var dt = new DataTransfer();
				for (var i = 0; i < fileList.length; i++) dt.items.add(fileList[i]);
				fileInput.files = dt.files;
			} catch (e) {
				return; /* DataTransfer unavailable: leave native input as-is */
			}
			fileInput.dispatchEvent(new Event("change", { bubbles: true }));
		}
		["dragenter", "dragover"].forEach(function (ev) {
			zone.addEventListener(ev, function (e) {
				e.preventDefault();
				e.stopPropagation();
				zone.classList.add("cqb-dragover");
			});
		});
		["dragleave", "dragend"].forEach(function (ev) {
			zone.addEventListener(ev, function () { zone.classList.remove("cqb-dragover"); });
		});
		zone.addEventListener("drop", function (e) {
			e.preventDefault();
			e.stopPropagation();
			zone.classList.remove("cqb-dragover");
			var f = e.dataTransfer && e.dataTransfer.files;
			if (f && f.length) setFiles(opts.multiple ? f : [f[0]]);
		});
		function renderChips() {
			chips.textContent = "";
			var files = fileInput.files;
			if (!files) return;
			Array.prototype.forEach.call(files, function (f, idx) {
				var chip = document.createElement("span");
				chip.className = "cqb-chip";
				var nm = document.createElement("span");
				nm.className = "cqb-chip-name";
				nm.textContent = f.name;
				cqb && cqb.tooltip && cqb.tooltip(chip, f.name);
				var rm = document.createElement("button");
				rm.type = "button";
				rm.className = "cqb-chip-remove";
				rm.setAttribute("aria-label", t("remove", "Remove") + " " + f.name);
				rm.addEventListener("click", function (e) {
					e.preventDefault();
					e.stopPropagation();
					var keep = [];
					Array.prototype.forEach.call(fileInput.files, function (g, j) {
						if (j !== idx) keep.push(g);
					});
					setFiles(keep);
				});
				chip.appendChild(nm);
				chip.appendChild(rm);
				chips.appendChild(chip);
			});
		}
		fileInput.addEventListener("change", function () {
			renderChips();
			if (opts.onChange) opts.onChange();
		});
		return { setFiles: setFiles, renderChips: renderChips };
	}

	/* Enhance the Add Torrent dialog once. It is preloaded hidden in the DOM,
	 * so it exists by the time this module runs; a guard makes it idempotent. */
	function enhanceAddTorrent() {
		var dlg = document.getElementById("tadd");
		var fileInput = document.getElementById("torrent_file");
		var urlArea = document.getElementById("url");
		var addFileBtn = document.getElementById("add_button");
		var addUrlBtn = document.getElementById("add_url");
		if (!dlg || !fileInput || dlg.getAttribute("data-cqb-add") === "1") return;
		dlg.setAttribute("data-cqb-add", "1");

		var fieldset = fileInput.closest("fieldset");
		if (!fieldset) return;

		/* Drop the trailing colons from the stacked field labels. */
		dlg.querySelectorAll(".row label").forEach(function (l) {
			l.textContent = l.textContent.replace(/\s*:\s*$/, "");
		});

		/* 1. Drop-zone card. A <label for> natively opens the file picker, so
		 * browsing needs no JS. The native input is tucked but left wired. */
		var zone = document.createElement("label");
		zone.className = "cqb-dropzone";
		zone.setAttribute("for", "torrent_file");

		var zi = document.createElement("span");
		zi.className = "cqb-dropzone-icon";
		zi.setAttribute("aria-hidden", "true");

		var zh = document.createElement("span");
		zh.className = "cqb-dropzone-hint";
		var browse = document.createElement("span");
		browse.className = "cqb-dropzone-browse";
		browse.textContent = t("browse", "browse");
		var dropHint = t("cqb_add_drop_hint", "Drag .torrent files here or {browse}").split("{browse}");
		zh.appendChild(document.createTextNode(dropHint[0]));
		zh.appendChild(browse);
		if (dropHint[1]) zh.appendChild(document.createTextNode(dropHint[1]));

		zone.appendChild(zi);
		zone.appendChild(zh);

		var chips = document.createElement("div");
		chips.className = "cqb-chips";

		/* Insert the zone + chips at the top of the "Add from file" card and
		 * tuck the native control there so change events still bubble. */
		var legend = fieldset.querySelector("legend");
		if (legend && legend.nextSibling) fieldset.insertBefore(zone, legend.nextSibling);
		else fieldset.appendChild(zone);
		fieldset.insertBefore(chips, zone.nextSibling);

		/* Tuck the original file row (label + native input + inline submit) out
		 * of view; it stays in the DOM and fully wired behind the card. */
		var fileRow = fileInput.closest(".row") || fileInput;
		fileRow.classList.add("cqb-file-tucked");
		fileInput.classList.add("cqb-file-tucked");

		/* 2 + 3. Drag/drop feeds the native FileList and chips reflect the
		 * selection (shared helper, multiple files); Add re-syncs on change. */
		wireDropzone(zone, chips, fileInput, { multiple: true, onChange: function () { syncAdd(); } });

		/* 4. One primary Add in a footer; the two native submits stay wired but
		 * hidden, and Add proxies a click to whichever input is filled. */
		addFileBtn && addFileBtn.classList.add("cqb-file-tucked");
		if (addUrlBtn) {
			var urlBtnCol = addUrlBtn.closest(".col-md-3") || addUrlBtn;
			urlBtnCol.classList.add("cqb-file-tucked");
		}

		var cont = dlg.querySelector(".cont");
		var footer = document.createElement("div");
		footer.className = "buttons-list";

		var cancel = document.createElement("button");
		cancel.type = "button";
		cancel.className = "cqb-secondary";
		cancel.textContent = t("Cancel", "Cancel");
		cancel.addEventListener("click", function () {
			if (window.theDialogManager) theDialogManager.hide("tadd");
		});

		var add = document.createElement("button");
		add.type = "button";
		add.className = "cqb-primary";
		add.textContent = t("torrent_add", "Add torrent");
		add.addEventListener("click", function () {
			var hasFiles = fileInput.files && fileInput.files.length > 0;
			if (hasFiles && addFileBtn) {
				addFileBtn.disabled = false;
				addFileBtn.click();
			} else if (urlArea && urlArea.value.trim() && addUrlBtn) {
				addUrlBtn.disabled = false;
				addUrlBtn.click();
			}
		});

		footer.appendChild(cancel);
		footer.appendChild(add);
		if (cont && cont.parentNode === dlg) dlg.insertBefore(footer, cont.nextSibling);
		else dlg.appendChild(footer);

		function syncAdd() {
			var hasFiles = fileInput.files && fileInput.files.length > 0;
			var hasUrl = !!(urlArea && urlArea.value.trim());
			add.disabled = !(hasFiles || hasUrl);
		}
		urlArea && urlArea.addEventListener("input", syncAdd);
		syncAdd();
	}

	/* Parse MediaInfo "Key : Value" output into {name, rows:[{k,v}]} sections. */
	function parseMediaInfo(text) {
		var sections = [];
		var cur = null;
		(text || "").split(/\r?\n/).forEach(function (raw) {
			var line = raw.replace(/\s+$/, "");
			if (!line.trim()) return;
			var m = line.match(/^(.+?)\s{2,}:\s?(.*)$/);
			if (m) {
				if (!cur) { cur = { name: t("cqb_mi_general", "General"), rows: [] }; sections.push(cur); }
				cur.rows.push({ k: m[1].trim(), v: m[2].trim() });
			} else {
				cur = { name: line.trim(), rows: [] };
				sections.push(cur);
			}
		});
		return sections.filter(function (s) { return s.rows.length; });
	}

	function enhanceTaskConsole() {
		var dlg = document.getElementById("tskConsole");
		if (!dlg || dlg.getAttribute("data-cqb-tsk") === "1") return false;
		if (!window.theWebUI || typeof theWebUI.startConsoleTask !== "function") return false;
		var header = document.getElementById("tskConsole-header");
		var log = document.getElementById("tskcmdlog");
		var headerBar = dlg.querySelector(".dlg-header");
		if (!header || !log || !headerBar) return false;
		dlg.setAttribute("data-cqb-tsk", "1");

		var LABELS = {
			mediainfo: t("cqb_task_mediainfo", "Media Info"), screenshots: t("cqb_task_screenshots", "Screenshots"),
			create: t("cqb_task_create", "Create Torrent"), unpack: t("cqb_task_unpack", "Unpack")
		};
		var ctx = { task: "", title: t("cqb_task_title", "Task"), sub: "", status: "running" };

		var showRaw = false;

		/* Capture the task name/title as each console task starts, and reset
		 * the Media Info view so a fresh run always opens Formatted. */
		var origStart = theWebUI.startConsoleTask;
		theWebUI.startConsoleTask = function (taskName) {
			ctx.task = taskName || "";
			ctx.title = LABELS[taskName] || (window.theUILang && theUILang[taskName]) || t("cqb_task_title", "Task");
			ctx.sub = "";
			showRaw = false;
			seg.style.display = "none";
			return origStart.apply(this, arguments);
		};

		/* Thin running-progress bar under the header. */
		var bar = document.createElement("div");
		bar.className = "cqb-task-bar";
		headerBar.insertAdjacentElement("afterend", bar);

		/* Formatted | Raw segmented control, parked in the dialog header so it
		 * never floats in the body. Opens on Formatted. */
		var seg = document.createElement("div");
		seg.className = "cqb-mi-seg";
		var segFmt = document.createElement("button");
		segFmt.type = "button";
		segFmt.textContent = t("Formatted", "Formatted");
		var segRaw = document.createElement("button");
		segRaw.type = "button";
		segRaw.textContent = t("raw", "Raw");
		seg.appendChild(segFmt);
		seg.appendChild(segRaw);
		segFmt.addEventListener("click", function () { if (showRaw) { showRaw = false; renderMI(); } });
		segRaw.addEventListener("click", function () { if (!showRaw) { showRaw = true; renderMI(); } });
		var closeEl = headerBar.querySelector(".dlg-close");
		if (closeEl) headerBar.insertBefore(seg, closeEl);
		else headerBar.appendChild(seg);

		/* The formatted card view, inserted before the raw log. */
		var miWrap = document.createElement("div");
		miWrap.className = "cqb-mi";
		miWrap.style.display = "none";
		log.parentNode.insertBefore(miWrap, log);

		function basename(p) {
			var s = String(p).replace(/[\\/]+$/, "");
			var i = Math.max(s.lastIndexOf("/"), s.lastIndexOf("\\"));
			return i >= 0 ? s.slice(i + 1) : s;
		}

		function renderMI() {
			if (ctx.task !== "mediainfo") {
				seg.style.display = "none";
				miWrap.style.display = "none";
				log.style.display = "";
				return;
			}
			var text = log.innerText || log.textContent || "";
			var sections = parseMediaInfo(text);
			if (!sections.length) {
				seg.style.display = "none";
				miWrap.style.display = "none";
				log.style.display = "";
				return;
			}
			seg.style.display = "inline-flex";
			segFmt.classList.toggle("is-active", !showRaw);
			segRaw.classList.toggle("is-active", showRaw);
			/* Subtitle = the file name from the Complete name row. */
			sections.forEach(function (s) {
				s.rows.forEach(function (r) {
					if (/complete name|file name/i.test(r.k) && !ctx.sub) ctx.sub = basename(r.v);
				});
			});
			renderHeader(ctx.status);
			miWrap.innerHTML = "";
			sections.forEach(function (s) {
				var card = document.createElement("div");
				card.className = "cqb-mi-section";
				var h = document.createElement("h4");
				h.textContent = s.name;
				card.appendChild(h);
				s.rows.forEach(function (r) {
					var row = document.createElement("div");
					row.className = "cqb-mi-row";
					var lab = document.createElement("div");
					lab.className = "cqb-mi-label";
					lab.textContent = r.k;
					var val = document.createElement("div");
					val.className = "cqb-mi-value";
					if (/[\\/]/.test(r.v)) val.classList.add("cqb-mono");
					val.textContent = r.v;
					row.appendChild(lab);
					row.appendChild(val);
					card.appendChild(row);
				});
				miWrap.appendChild(card);
			});
			miWrap.style.display = showRaw ? "none" : "";
			log.style.display = showRaw ? "" : "none";
			log.classList.remove("image-cont");
		}

		function errorsPresent() {
			var e = document.getElementById("tskcmderrors");
			var set = document.getElementById("tskcmderrors_set");
			return !!(set && getComputedStyle(set).display !== "none" && e && (e.textContent || "").trim());
		}

		function statusFromText(txt) {
			if (window.theUILang && txt === theUILang.tskCommandDone) return "done";
			if (window.theUILang && txt === theUILang.tskCommand) return "running";
			return null;
		}

		/* Footer: one row. Copy and Save Log keep their text (a glyph is added
		 * in CSS by id); the dismiss reads Close and goes primary when done. */
		function decorateFooter() {
			if (ctx.task !== "screenshots") {
				var sc = dlg.querySelectorAll(".scplay");
				Array.prototype.forEach.call(sc, function (b) { b.style.display = "none"; });
			}
			var close = document.getElementById("tskCancel");
			if (close) {
				close.classList.add("cqb-primary");
				close.textContent = (ctx.status === "running")
					? t("Cancel", "Cancel")
					: (window.theUILang && theUILang.Close) || "Close";
			}
		}

		var writing = false;
		function renderHeader(status) {
			if (status === "done" && errorsPresent()) status = "failed";
			ctx.status = status;
			writing = true;
			hObs.disconnect();
			header.textContent = "";
			var ttl = document.createElement("span");
			ttl.className = "cqb-tsk-title";
			ttl.textContent = ctx.title;
			header.appendChild(ttl);
			if (ctx.sub) {
				var sub = document.createElement("span");
				sub.className = "cqb-tsk-sub";
				sub.textContent = ctx.sub;
				header.appendChild(sub);
			}
			var pill = document.createElement("span");
			pill.className = "cqb-status-pill cqb-status-" + status;
			pill.textContent = status === "running"
				? t("tskRunning", "Running")
				: status === "failed" ? t("tskFailed", "Failed") : t("tskDone", "Done");
			header.appendChild(pill);
			dlg.classList.toggle("cqb-task-running", status === "running");
			decorateFooter();
			writing = false;
			hObs.observe(header, { childList: true, subtree: true, characterData: true });
		}

		var hObs = new MutationObserver(function () {
			if (writing) return;
			if (header.querySelector(".cqb-status-pill")) return;
			var s = statusFromText((header.textContent || "").trim());
			renderHeader(s || "running");
		});
		hObs.observe(header, { childList: true, subtree: true, characterData: true });

		var lObs = new MutationObserver(function () {
			if (ctx.task === "mediainfo") renderMI();
		});
		lObs.observe(log, { childList: true, subtree: true, characterData: true });

		return true;
	}

	/* Rebuild the Create New Torrent dialog as a v4 form. Every core node is
	 * moved, never cloned, so #path_edit/#trackers/#source/#piece_size and the
	 * core submit stay fully wired. Preloaded, so a one-shot (idempotent) run. */
	function enhanceCreate() {
		var dlg = document.getElementById("tcreate");
		if (!dlg || dlg.getAttribute("data-cqb-create") === "1") return false;
		var trackers = document.getElementById("trackers");
		var pathEdit = document.getElementById("path_edit");
		var createBtn = document.getElementById("torrentCreate");
		if (!trackers || !pathEdit || !createBtn) return false;
		dlg.setAttribute("data-cqb-create", "1");

		/* Headings read inside the card; drop the trailing colons from labels. */
		dlg.querySelectorAll("label").forEach(function (l) {
			l.textContent = l.textContent.replace(/\s*:\s*$/, "");
		});

		pathEdit.setAttribute("placeholder", t("cqb_create_source_ph", "Path to a file or folder, or pick one"));

		var cp = (window.thePlugins && thePlugins.get) ? thePlugins.get("create") : null;

		/* Recent trackers as append-chips above the textarea; clicking a chip
		 * appends it, the x removes it from the store through the core path. */
		var chipRow = document.createElement("div");
		chipRow.className = "cqb-tracker-chips";

		function appendTracker(url) {
			var val = trackers.value;
			if (val.indexOf(url) >= 0) { trackers.value = val.trim(); trackers.focus(); return; }
			trackers.value = val.split(/\r?\n/).concat([url]).join("\r").trim();
			trackers.dispatchEvent(new Event("input", { bubbles: true }));
			trackers.focus();
		}
		function deleteRecent(url) {
			if (!cp || !window.theWebUI) return;
			cp.deleteFromRecentTrackers = url + "\r";
			theWebUI.request("?action=rtdelete", [cp.getRecentTrackers, cp]);
		}
		function renderChips() {
			chipRow.textContent = "";
			var rt = cp && cp.recentTrackers && cp.recentTrackers.recent_trackers;
			if (!rt) return;
			Object.keys(rt).forEach(function (domain) {
				var url = rt[domain];
				var chip = document.createElement("span");
				chip.className = "cqb-tchip";
				var lab = document.createElement("span");
				lab.className = "cqb-tchip-label";
				lab.textContent = domain;
				if (cqb && cqb.tooltip) cqb.tooltip(lab, url);
				lab.addEventListener("click", function () { appendTracker(url); });
				var x = document.createElement("button");
				x.type = "button";
				x.className = "cqb-tchip-x";
				x.setAttribute("aria-label", t("remove", "Remove") + " " + domain);
				x.addEventListener("click", function (e) {
					e.preventDefault();
					e.stopPropagation();
					deleteRecent(url);
				});
				chip.appendChild(lab);
				chip.appendChild(x);
				chipRow.appendChild(chip);
			});
		}
		/* Re-render chips whenever core reloads the recent list (load + delete). */
		if (cp && typeof cp.getRecentTrackers === "function" && !cp.getRecentTrackers.__cqbWrapped) {
			var origGRT = cp.getRecentTrackers;
			cp.getRecentTrackers = function () {
				var r = origGRT.apply(this, arguments);
				try { renderChips(); } catch (e) { /* chips are best-effort */ }
				return r;
			};
			cp.getRecentTrackers.__cqbWrapped = true;
		}
		renderChips();

		/* Hide the core recent-trackers dropdown + delete button; chips replace them. */
		var rtBtn = document.getElementById("recentTrackers");
		if (rtBtn) { var g = rtBtn.closest(".btn-group") || rtBtn; g.style.display = "none"; }
		var delBtn = document.getElementById("deleteFromRecentTrackers");
		if (delBtn) delBtn.style.display = "none";

		/* Trackers: a stacked field -- label, chips, a 6-row box, a helper. */
		var tLabel = dlg.querySelector('label[for="trackers"]');
		var tRow = trackers.closest(".row");
		var tWrap = document.createElement("div");
		tWrap.className = "cqb-field-v";
		if (tLabel) tWrap.appendChild(tLabel);
		tWrap.appendChild(chipRow);
		tWrap.appendChild(trackers);
		var tHelp = document.createElement("div");
		tHelp.className = "cqb-help";
		tHelp.textContent = t("cqb_help_trackers", "One tracker URL per line.");
		tWrap.appendChild(tHelp);
		if (tRow && tRow.parentNode) { tRow.parentNode.insertBefore(tWrap, tRow); tRow.remove(); }

		/* Comment + Source (the source tag) sit side by side as stacked fields. */
		var commentInput = document.getElementById("comment");
		var sourceInput = document.getElementById("source");
		if (commentInput && sourceInput) {
			var cRow = commentInput.closest(".row");
			var sRow = sourceInput.closest(".row");
			var grid = document.createElement("div");
			grid.className = "cqb-row-2";
			[["comment", commentInput], ["source", sourceInput]].forEach(function (f) {
				var fv = document.createElement("div");
				fv.className = "cqb-field-v";
				var lbl = dlg.querySelector('label[for="' + f[0] + '"]');
				if (lbl) fv.appendChild(lbl);
				fv.appendChild(f[1]);
				grid.appendChild(fv);
			});
			if (cRow && cRow.parentNode) {
				cRow.parentNode.insertBefore(grid, cRow);
				cRow.remove();
				if (sRow && sRow.parentNode) sRow.remove();
			}
		}

		/* Piece size: a stacked field; move the native select AND its custom
		 * trigger together so the enhanced control stays intact. */
		var pieceSel = document.getElementById("piece_size");
		if (pieceSel) {
			var pLbl = dlg.querySelector('label[for="piece_size"]');
			var pRow = pieceSel.closest(".row");
			var pCol = pieceSel.closest("[class*='col-']");
			var pWrap = document.createElement("div");
			pWrap.className = "cqb-field-v cqb-field-narrow";
			if (pLbl) pWrap.appendChild(pLbl);
			if (pCol) { while (pCol.firstChild) pWrap.appendChild(pCol.firstChild); }
			else pWrap.appendChild(pieceSel);
			if (pRow && pRow.parentNode) { pRow.parentNode.insertBefore(pWrap, pRow); pRow.remove(); }
		}

		/* Options as switch rows with a one-line helper. */
		var HELP = {
			start_seeding: t("cqb_help_seed", "Start seeding as soon as the torrent is created."),
			"private": t("cqb_help_private", "Mark as private: no DHT or peer exchange."),
			hybrid: t("cqb_help_hybrid", "Create a v1 + v2 hybrid torrent.")
		};
		var opts = document.createElement("div");
		opts.className = "cqb-opts";
		var otherFs = null;
		["start_seeding", "private", "hybrid"].forEach(function (id) {
			var cb = document.getElementById(id);
			if (!cb) return;
			var lbl = dlg.querySelector('label[for="' + id + '"]') || document.getElementById("lbl_" + id);
			var col = cb.closest("[class*='col-']") || cb.parentNode;
			if (!otherFs) otherFs = col && col.closest("fieldset");
			var opt = document.createElement("div");
			opt.className = "cqb-opt";
			var sw = document.createElement("label");
			sw.className = "cqb-switch";
			sw.appendChild(cb);
			var track = document.createElement("span");
			track.className = "cqb-switch-track";
			sw.appendChild(track);
			var txt = document.createElement("div");
			txt.className = "cqb-opt-text";
			if (lbl) txt.appendChild(lbl);
			var help = document.createElement("div");
			help.className = "cqb-help";
			help.textContent = HELP[id] || "";
			txt.appendChild(help);
			opt.appendChild(sw);
			opt.appendChild(txt);
			opts.appendChild(opt);
		});
		if (otherFs) {
			var oldRow = otherFs.querySelector(".row");
			if (oldRow) { otherFs.insertBefore(opts, oldRow); oldRow.remove(); }
			else otherFs.appendChild(opts);
		}

		/* Footer: a primary "Create torrent" (no ellipsis), off until a source
		 * is set. The core submit handler stays on the same button. */
		createBtn.textContent = t("cqb_create_torrent", "Create torrent");
		/* Cancel secondary first, the primary Create torrent rightmost. */
		var footer = createBtn.closest(".buttons-list");
		if (footer) footer.appendChild(createBtn);
		function syncCreate() { createBtn.disabled = !pathEdit.value.trim(); }
		pathEdit.addEventListener("input", syncCreate);
		if (window.theDialogManager && theDialogManager.addHandler) {
			theDialogManager.addHandler("tcreate", "afterShow", syncCreate);
		}
		syncCreate();

		return true;
	}

	function enhanced(id, attr) {
		var el = document.getElementById(id);
		return el ? el.getAttribute(attr) === "1" : false;
	}

	/* Wrap a core rDirBrowser pair (the `.browseEdit` input + its adjacent
	 * `.browseButton`) into one `.cqb-input-group` so the path field and its
	 * browse button read as a single control. Nodes move; handlers are bound
	 * to the elements by core and survive the move, so nothing is re-wired. */
	function wrapBrowsePair(btn) {
		if (!btn) return;
		var input = btn.previousElementSibling;
		if (!input || !input.classList || !input.classList.contains("browseEdit")) return;
		var parent = btn.parentNode;
		if (!parent) return;
		if (parent.classList && parent.classList.contains("cqb-input-group")) {
			btn.classList.add("cqb-browse");
			return; /* already grouped (e.g. a Settings page owns its own) */
		}
		var group = document.createElement("div");
		group.className = "cqb-input-group";
		parent.insertBefore(group, input);
		group.appendChild(input);
		group.appendChild(btn);
		btn.classList.add("cqb-browse");
		btn.textContent = "";
		if (cqb && cqb.tooltip) cqb.tooltip(btn, t("cqb_browse", t("Browse", "Browse")));
	}

	/* Wrap every already-built browse pair inside a dialog window. */
	function sweepBrowse() {
		var btns = document.querySelectorAll(".dlg-window button.browseButton");
		Array.prototype.forEach.call(btns, wrapBrowsePair);
	}

	/* Future browse controls are built lazily as plugin dialogs initialise;
	 * wrap each the moment core creates it, without polling. */
	var dirPatched = false;
	function patchDirBrowser() {
		if (dirPatched) return;
		if (!window.theWebUI || typeof theWebUI.rDirBrowser !== "function") return;
		var Orig = theWebUI.rDirBrowser;
		var Wrapped = function (edit_id, withFiles, height) {
			var inst = new Orig(edit_id, withFiles, height);
			try {
				var b = document.getElementById(edit_id + "_btn");
				if (b && b.closest && b.closest(".dlg-window")) wrapBrowsePair(b);
			} catch (e) { /* leave the native control intact */ }
			return inst;
		};
		Wrapped.prototype = Orig.prototype;
		theWebUI.rDirBrowser = Wrapped;
		dirPatched = true;
	}

	/* Dialog forms that still ship the legacy right-aligned, colon-suffixed
	 * label column. One field layout: labels left-aligned (CSS), trailing
	 * colons trimmed from the RENDERED text here (never the lang source). */
	var FORM_DIALOGS = [
		"dlg_datadir", "tegLoadTorrents", "dlgLoadTorrents", "dlgProps", "tedit",
		"dlg_unpack", "tracklabels-dialog", "dlgAddRSS", "dlgEditRSS",
		"dlgAddRSSGroup", "dlgEditFilters", "dlgEditRatioRules", "dlgLabel"
	];

	function stripColons(root) {
		root.querySelectorAll("label").forEach(function (l) {
			if (l.children.length) return; /* leave labels that wrap a control */
			var trimmed = l.textContent.replace(/\s*:\s*$/, "");
			if (trimmed !== l.textContent) l.textContent = trimmed;
		});
	}

	/* Trim the colon suffix across every legacy form dialog, once each. */
	function enhanceFieldForms() {
		FORM_DIALOGS.forEach(function (id) {
			var dlg = document.getElementById(id);
			if (!dlg || dlg.getAttribute("data-cqb-form") === "1") return;
			dlg.setAttribute("data-cqb-form", "1");
			stripColons(dlg);
		});
	}

	/* Unpack: the single legend is a whole sentence -- keep the lead ("Unpack
	 * to") as the heading and move the parenthetical to muted helper text. */
	function enhanceUnpack() {
		var dlg = document.getElementById("dlg_unpack");
		if (!dlg || dlg.getAttribute("data-cqb-unp") === "1") return;
		var fs = dlg.querySelector(".cont fieldset");
		var leg = fs && fs.querySelector("legend");
		if (!leg) return;
		dlg.setAttribute("data-cqb-unp", "1");
		var m = (leg.textContent || "").match(/^([^(]+?)\s*\((.+)\)\s*$/);
		if (!m) return;
		leg.textContent = m[1].trim();
		var help = document.createElement("div");
		help.className = "cqb-help";
		help.textContent = m[2].trim();
		fs.appendChild(help);
	}

	/* Tracker/label icon upload: swap the native grey file control for the
	 * same drop-zone + chip pattern Add Torrent uses, keeping the plugin's
	 * FormData upload handler wired to the untouched native input. */
	function enhanceTrackLabels() {
		var dlg = document.getElementById("tracklabels-dialog");
		if (!dlg || dlg.getAttribute("data-cqb-tl") === "1") return;
		var fileInput = document.getElementById("tracklabels-dialog-uploadfile");
		if (!fileInput) return;
		dlg.setAttribute("data-cqb-tl", "1");

		var fieldCol = fileInput.closest("[class*='col-']") || fileInput.parentNode;
		var labelCol = fileInput.closest(".row")
			? fileInput.closest(".row").querySelector('label[for="tracklabels-dialog-uploadfile"]')
			: null;
		var labelColWrap = labelCol ? labelCol.closest("[class*='col-']") : null;

		var zone = document.createElement("label");
		zone.className = "cqb-dropzone";
		zone.setAttribute("for", "tracklabels-dialog-uploadfile");
		var zi = document.createElement("span");
		zi.className = "cqb-dropzone-icon";
		zi.setAttribute("aria-hidden", "true");
		var zh = document.createElement("span");
		zh.className = "cqb-dropzone-hint";
		var browse = document.createElement("span");
		browse.className = "cqb-dropzone-browse";
		browse.textContent = t("browse", "browse");
		var parts = t("cqb_add_drop_hint", "Drag a .png here or {browse}").split("{browse}");
		zh.appendChild(document.createTextNode(parts[0]));
		zh.appendChild(browse);
		if (parts[1]) zh.appendChild(document.createTextNode(parts[1]));
		zone.appendChild(zi);
		zone.appendChild(zh);

		var chips = document.createElement("div");
		chips.className = "cqb-chips";

		/* The drop-zone spans the full width; the old label column is dropped. */
		if (fieldCol) {
			fieldCol.classList.add("cqb-tl-filecol");
			fieldCol.appendChild(zone);
			fieldCol.appendChild(chips);
		}
		if (labelColWrap) labelColWrap.classList.add("cqb-file-tucked");
		fileInput.classList.add("cqb-file-tucked");

		/* The native change is already bound to the plugin's updateButtons; the
		 * helper's dispatched change keeps that enablement logic firing. */
		wireDropzone(zone, chips, fileInput, { multiple: false });
	}

	/* An empty-state card shown only while a list has no rows, via a CSS
	 * `:empty + .cqb-empty` sibling toggle. Text comes from theUILang. */
	function addEmptyState(listId, key, fallback) {
		var list = document.getElementById(listId);
		if (!list || !list.parentNode) return;
		if (list.nextElementSibling && list.nextElementSibling.classList.contains("cqb-empty")) return;
		var box = document.createElement("div");
		box.className = "cqb-empty";
		var glyph = document.createElement("span");
		glyph.className = "cqb-empty-icon";
		glyph.setAttribute("aria-hidden", "true");
		var txt = document.createElement("span");
		txt.textContent = t(key, fallback);
		box.appendChild(glyph);
		box.appendChild(txt);
		list.insertAdjacentElement("afterend", box);
	}

	function enhanceEmptyStates() {
		addEmptyState("rlsul", "cqb_empty_ratio_rules", "No ratio rules yet");
		addEmptyState("fltlist", "cqb_empty_rss_filters", "No filters yet");
		addEmptyState("rssGroupSet", "cqb_empty_rss_group", "No feeds in this group yet");
	}

	/* Primary-action consistency: the confirming button is primary and sits
	 * rightmost in every footer. Two core confirms ship without the primary
	 * class -- promote them, then move each footer's primary to the end so
	 * visual, DOM and tab order all read Cancel -> Confirm. */
	function decorateConfirms() {
		var logoff = document.getElementById("logoffComplete");
		if (logoff) logoff.classList.add("cqb-primary");
		var rename = document.querySelector('#dlgRenameView .buttons-list button[value="confirm"]');
		if (rename) rename.classList.add("cqb-primary");
	}

	function normalizeFooters() {
		var footers = document.querySelectorAll(".dlg-window .buttons-list");
		Array.prototype.forEach.call(footers, function (footer) {
			var dlg = footer.closest(".dlg-window");
			if (!dlg || dlg.id === "stg") return; /* settings lane owns its footer */
			if (footer.getAttribute("data-cqb-footer") === "1") return;
			footer.setAttribute("data-cqb-footer", "1");
			var primary = footer.querySelector(".OK, input[type='submit'], .cqb-primary");
			if (primary && primary.parentNode === footer) footer.appendChild(primary);
		});
	}

	/* Both dialogs are preloaded, but the task console is built a little after
	 * the add dialog; retry (idempotently) until both are decorated. */
	function run() {
		try { enhanceAddTorrent(); } catch (e) { /* never break the dialog */ }
		try { enhanceTaskConsole(); } catch (e) { /* never break the dialog */ }
		try { enhanceCreate(); } catch (e) { /* never break the dialog */ }
		try { enhanceFieldForms(); } catch (e) { /* never break the dialog */ }
		try { enhanceUnpack(); } catch (e) { /* never break the dialog */ }
		try { enhanceTrackLabels(); } catch (e) { /* never break the dialog */ }
		try { enhanceEmptyStates(); } catch (e) { /* never break the dialog */ }
		try { decorateConfirms(); normalizeFooters(); } catch (e) { /* never break the dialog */ }
		try { sweepBrowse(); patchDirBrowser(); } catch (e) { /* never break the dialog */ }
		return enhanced("tadd", "data-cqb-add") &&
			enhanced("tskConsole", "data-cqb-tsk") &&
			enhanced("tcreate", "data-cqb-create") &&
			enhanced("tracklabels-dialog", "data-cqb-tl") &&
			enhanced("dlgEditFilters", "data-cqb-form");
	}

	if (run()) return;
	var tries = 0;
	var iv = setInterval(function () {
		if (run() || ++tries > 40) clearInterval(iv);
	}, 150);
})(window.cqb);
