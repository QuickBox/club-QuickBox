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

	/* Wrap a core checkbox as one pill-switch option row: the shared treatment
	 * every add-flow dialog uses, so a boolean reads the same whether it sits in
	 * Add Torrent, Load Torrents or the search add dialog. The core checkbox is
	 * MOVED into the switch (never cloned), so its value and handlers stay live;
	 * labelEl is the moved <label>, helpText an optional one-line hint. */
	function cqbSwitchRow(cb, labelEl, helpText) {
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
		if (labelEl) txt.appendChild(labelEl);
		if (helpText) {
			var help = document.createElement("div");
			help.className = "cqb-help";
			help.textContent = helpText;
			txt.appendChild(help);
		}
		opt.appendChild(sw);
		opt.appendChild(txt);
		return opt;
	}

	/* Convert a dialog's native add-option checkboxes into one .cqb-opts-grid of
	 * switch rows, reusing the Add Torrent treatment. Each id names a core
	 * checkbox; its <label for=id> is moved in beside the switch. Returns the
	 * grid (empty if none of the ids resolved), or null. */
	function buildOptsGrid(dlg, ids) {
		if (!dlg) return null;
		var grid = document.createElement("div");
		grid.className = "cqb-opts-grid";
		ids.forEach(function (id) {
			var cb = document.getElementById(id);
			if (!cb) return;
			var lbl = dlg.querySelector('label[for="' + id + '"]');
			grid.appendChild(cqbSwitchRow(cb, lbl));
		});
		return grid;
	}

	/* Rebuild the Add Torrent dialog as two v4 cards -- Source first (WHAT you
	 * add: a File/URL segmented control over the drop-zone or the URL field),
	 * Options second (HOW: directory, label, the four switches). Every core id
	 * and handler stays live: the directory, label and option controls are read
	 * by global id in content.js makeAddRequest(), so they move out of the two
	 * forms freely; #torrent_file/#add_button stay inside #addtorrent (tucked)
	 * and #url/#add_url inside #addtorrenturl (the whole form is relocated into
	 * the URL panel so #url keeps submitting). Preloaded, so run once. */
	function enhanceAddTorrent() {
		var dlg = document.getElementById("tadd");
		var fileInput = document.getElementById("torrent_file");
		var urlArea = document.getElementById("url");
		var addFileBtn = document.getElementById("add_button");
		var addUrlBtn = document.getElementById("add_url");
		if (!dlg || !fileInput || dlg.getAttribute("data-cqb-add") === "1") return;

		var cont = dlg.querySelector(".cont");
		var formFile = document.getElementById("addtorrent");
		var formUrl = document.getElementById("addtorrenturl");
		if (!cont || !formFile) return;
		dlg.setAttribute("data-cqb-add", "1");

		/* Drop the trailing colons from every stacked field label. */
		dlg.querySelectorAll("label").forEach(function (l) {
			if (l.children.length) return;
			l.textContent = l.textContent.replace(/\s*:\s*$/, "");
		});

		/* ---- Card 1: Source ---- */
		var srcCard = document.createElement("div");
		srcCard.className = "cqb-card cqb-src";
		srcCard.setAttribute("data-src", "file");
		var srcHead = document.createElement("div");
		srcHead.className = "cqb-card-head";
		srcHead.textContent = t("cqb_add_source", "Source");
		srcCard.appendChild(srcHead);

		/* File | URL segmented control (the v4 SegmentedControl idiom). */
		var seg = document.createElement("div");
		seg.className = "cqb-seg";
		seg.setAttribute("role", "tablist");
		var segFile = document.createElement("button");
		segFile.type = "button";
		segFile.className = "cqb-seg-btn is-active";
		segFile.setAttribute("role", "tab");
		segFile.setAttribute("aria-selected", "true");
		segFile.textContent = t("cqb_add_file", "File");
		var segUrl = document.createElement("button");
		segUrl.type = "button";
		segUrl.className = "cqb-seg-btn";
		segUrl.setAttribute("role", "tab");
		segUrl.setAttribute("aria-selected", "false");
		segUrl.textContent = t("cqb_add_url", "URL");
		seg.appendChild(segFile);
		seg.appendChild(segUrl);
		srcCard.appendChild(seg);

		var panels = document.createElement("div");
		panels.className = "cqb-src-panels";

		/* File panel: drop-zone + chips. The <label for> opens the picker; the
		 * native #torrent_file stays tucked inside #addtorrent. */
		var filePanel = document.createElement("div");
		filePanel.className = "cqb-src-panel cqb-src-file";
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
		filePanel.appendChild(zone);
		filePanel.appendChild(chips);

		/* URL panel: relocate the whole #addtorrenturl form so #url keeps
		 * submitting, lift #url out of its fieldset and tuck the rest. */
		var urlPanel = document.createElement("div");
		urlPanel.className = "cqb-src-panel cqb-src-url";
		if (formUrl) {
			urlPanel.appendChild(formUrl);
			var urlFs = formUrl.querySelector("fieldset");
			if (urlArea && urlFs) formUrl.insertBefore(urlArea, urlFs);
			if (urlFs) urlFs.classList.add("cqb-file-tucked");
		}

		panels.appendChild(filePanel);
		panels.appendChild(urlPanel);
		srcCard.appendChild(panels);

		/* ---- Card 2: Options ---- */
		var optCard = document.createElement("div");
		optCard.className = "cqb-card cqb-opt-card";
		var optHead = document.createElement("div");
		optHead.className = "cqb-card-head";
		optHead.textContent = t("Torrent_options", "Options");
		optCard.appendChild(optHead);

		/* Directory: stacked label + input-group (field + square browse). */
		var dirEdit = document.getElementById("dir_edit");
		if (dirEdit) {
			var dirField = document.createElement("div");
			dirField.className = "cqb-field-v";
			var dirLbl = dlg.querySelector('label[for="dir_edit"]');
			if (dirLbl) dirField.appendChild(dirLbl);
			var s = window.theWebUI && theWebUI.settings;
			var defDir = (s && (s["dir.default"] || s["directory.default"])) || "";
			dirEdit.setAttribute("placeholder", defDir || t("cqb_add_dir_ph", "Default download directory"));
			/* Attach the core directory browser (same class Create/Settings use),
			 * then fuse the field + its button into one input group. */
			try {
				if (!document.getElementById("dir_edit_btn") && window.theWebUI && typeof theWebUI.rDirBrowser === "function") {
					new theWebUI.rDirBrowser("dir_edit", false);
				}
			} catch (e) { /* no browser plugin: field stays plain */ }
			var dirBtn = document.getElementById("dir_edit_btn");
			if (dirBtn) {
				var grp = document.createElement("div");
				grp.className = "cqb-input-group";
				dirEdit.parentNode.insertBefore(grp, dirEdit);
				grp.appendChild(dirEdit);
				grp.appendChild(dirBtn);
				dirBtn.classList.add("cqb-browse");
				dirBtn.textContent = "";
				if (cqb && cqb.tooltip) cqb.tooltip(dirBtn, t("cqb_browse", t("Browse", "Browse")));
				dirField.appendChild(grp);
			} else {
				dirField.appendChild(dirEdit);
			}
			optCard.appendChild(dirField);
		}

		/* Label: one control row -- the select, or (on "New label...") the same
		 * row becomes an input group (text field + a square back-to-list button
		 * inside the group). data-mode toggles which is shown, driven by core's
		 * own select events; the custom trigger is left to the select lane. */
		var labelSel = document.getElementById("tadd_label_select");
		var labelTxt = document.getElementById("tadd_label");
		var labelBack = document.getElementById("tadd-return-select");
		if (labelSel && labelTxt && labelBack) {
			var lblField = document.createElement("div");
			lblField.className = "cqb-field-v";
			var lblLbl = dlg.querySelector('label[for="tadd_label"]');
			if (lblLbl) lblField.appendChild(lblLbl);
			var lblRow = document.createElement("div");
			lblRow.className = "cqb-label-ctl";
			lblRow.setAttribute("data-mode", "list");
			var trig = labelSel.nextElementSibling;
			lblRow.appendChild(labelSel);
			if (trig && trig.classList && trig.classList.contains("cqb-select-trigger")) lblRow.appendChild(trig);
			var lblGrp = document.createElement("div");
			lblGrp.className = "cqb-input-group cqb-label-group";
			lblGrp.appendChild(labelTxt);
			lblGrp.appendChild(labelBack);
			labelBack.classList.add("cqb-browse", "cqb-label-back");
			labelBack.textContent = "";
			if (cqb && cqb.tooltip) cqb.tooltip(labelBack, t("cqb_label_to_list", "Choose an existing label"));
			lblRow.appendChild(lblGrp);
			lblField.appendChild(lblRow);
			optCard.appendChild(lblField);
			var syncLabelMode = function () {
				lblRow.setAttribute("data-mode", labelSel.selectedIndex === 1 ? "new" : "list");
			};
			labelSel.addEventListener("change", syncLabelMode);
			labelBack.addEventListener("click", function () { lblRow.setAttribute("data-mode", "list"); });
			syncLabelMode();
		}

		/* The four add options as switch rows in a two-column grid. */
		var optsGrid = buildOptsGrid(dlg, ["not_add_path", "torrents_start_stopped", "fast_resume", "randomize_hash"]);
		if (optsGrid && optsGrid.children.length) optCard.appendChild(optsGrid);

		/* Place Source first, Options second, then tuck the (now emptied) file
		 * form -- it still holds #torrent_file + #add_button behind the cards. */
		cont.insertBefore(optCard, cont.firstChild);
		cont.insertBefore(srcCard, cont.firstChild);
		formFile.classList.add("cqb-file-tucked");

		/* Drag/drop feeds the native FileList; chips reflect it; Add re-syncs. */
		wireDropzone(zone, chips, fileInput, { multiple: true, onChange: function () { syncAdd(); } });

		/* Segmented toggle: show one panel at a time, keeping the other's value. */
		function setSrc(mode) {
			srcCard.setAttribute("data-src", mode);
			var isFile = mode === "file";
			segFile.classList.toggle("is-active", isFile);
			segUrl.classList.toggle("is-active", !isFile);
			segFile.setAttribute("aria-selected", isFile ? "true" : "false");
			segUrl.setAttribute("aria-selected", isFile ? "false" : "true");
		}
		segFile.addEventListener("click", function () { setSrc("file"); });
		segUrl.addEventListener("click", function () { setSrc("url"); });

		/* One primary Add: submit the active source if filled, else the other;
		 * both native submits stay wired behind the cards. */
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
			var hasUrl = !!(urlArea && urlArea.value.trim());
			var submitFile = function () { if (addFileBtn) { addFileBtn.disabled = false; addFileBtn.click(); } };
			var submitUrl = function () { if (addUrlBtn) { addUrlBtn.disabled = false; addUrlBtn.click(); } };
			if (srcCard.getAttribute("data-src") === "url") {
				if (hasUrl) submitUrl(); else if (hasFiles) submitFile();
			} else {
				if (hasFiles) submitFile(); else if (hasUrl) submitUrl();
			}
		});
		footer.appendChild(cancel);
		footer.appendChild(add);
		if (cont.parentNode === dlg) dlg.insertBefore(footer, cont.nextSibling);
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

		/* Read the console log as newline-separated text from its DOM structure,
		 * not innerText: the core writes one line per <br>, and innerText is empty
		 * while the log is display:none (the Formatted view hides it), which would
		 * collapse the whole dump onto one line. Walking child nodes turns each
		 * <br> into "\n" and keeps every text node verbatim, so parsing is the
		 * same whether the log is shown or hidden. Text only -- never re-injected
		 * as HTML. */
		function logText(el) {
			var out = "";
			(function walk(node) {
				for (var n = node.firstChild; n; n = n.nextSibling) {
					if (n.nodeType === 3) out += n.nodeValue;
					else if (n.nodeType === 1) {
						if (n.tagName === "BR") out += "\n";
						else walk(n);
					}
				}
			})(el);
			return out;
		}

		function renderMI() {
			if (ctx.task !== "mediainfo") {
				seg.style.display = "none";
				miWrap.style.display = "none";
				log.style.display = "";
				return;
			}
			var text = logText(log);
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
			pill.className = "cqb-task-status-pill cqb-status-" + status;
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
			if (header.querySelector(".cqb-task-status-pill")) return;
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
			opts.appendChild(cqbSwitchRow(cb, lbl, HELP[id]));
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
		var parts = t("cqb_tl_drop_hint", "Drag a .png here or {browse}").split("{browse}");
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

	/* CSS :empty misses a list that still holds a whitespace text node (the core
	 * markup indents its empty containers, so the box is never truly :empty), and
	 * that hid the empty-state sibling even with no rows. Drive it from the
	 * element-child count instead: toggle .cqb-list-empty on the list now and on
	 * every childList change, and the sibling card keys off that class. */
	function watchListEmpty(list) {
		if (!list || list.getAttribute("data-cqb-empty-watch") === "1") return;
		list.setAttribute("data-cqb-empty-watch", "1");
		function sync() { list.classList.toggle("cqb-list-empty", list.children.length === 0); }
		sync();
		if (window.MutationObserver) {
			new MutationObserver(sync).observe(list, { childList: true });
		}
	}

	/* An empty-state card shown only while a list has no rows, via the
	 * .cqb-list-empty + .cqb-empty sibling toggle. Text comes from theUILang. */
	function addEmptyState(listId, key, fallback) {
		var list = document.getElementById(listId);
		if (!list || !list.parentNode) return;
		if (list.nextElementSibling && list.nextElementSibling.classList.contains("cqb-empty")) {
			watchListEmpty(list);
			return;
		}
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
		watchListEmpty(list);
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
			var primary = footer.querySelector(".OK, input[type='submit'], .cqb-primary, .flm-diag-start");
			if (primary && primary.parentNode === footer) footer.appendChild(primary);
		});
	}

	/* File Manager dialogs (console + the shared modal window) are built
	 * lazily on first open, so they miss the one-shot run(). Decorate each
	 * when the dialog node lands in #dialog-container: trim the input-group /
	 * legend colons into the lane field layout, promote the start action to
	 * primary, and float it rightmost. Header glyph + layout are pure CSS. */
	function enhanceFileManager(dlg) {
		if (!dlg || dlg.getAttribute("data-cqb-flm") === "1") return;
		dlg.setAttribute("data-cqb-flm", "1");
		stripColons(dlg); /* label.input-group-text ("Rename to:") loses its colon */
		dlg.querySelectorAll("legend").forEach(function (l) {
			if (l.children.length) return;
			l.textContent = l.textContent.replace(/\s*:\s*$/, ""); /* "Command log:" / "Permissions:" */
		});
		/* Permissions grid cells ("User:", "Group:", "Everyone:") lose their colons. */
		dlg.querySelectorAll("td").forEach(function (td) {
			if (td.children.length) return;
			td.textContent = td.textContent.replace(/\s*:\s*$/, "");
		});
		/* The marked-for-removal checklist gets an empty-state sibling. */
		var checklist = dlg.querySelector(".checklist");
		if (checklist && !(checklist.nextElementSibling && checklist.nextElementSibling.classList.contains("cqb-empty"))) {
			var ce = document.createElement("div");
			ce.className = "cqb-empty";
			var ci = document.createElement("span");
			ci.className = "cqb-empty-icon";
			ci.setAttribute("aria-hidden", "true");
			var ct = document.createElement("span");
			ct.textContent = t("cqb_empty_checklist", "Nothing selected");
			ce.appendChild(ci);
			ce.appendChild(ct);
			checklist.insertAdjacentElement("afterend", ce);
		}
		if (checklist) watchListEmpty(checklist);
		var start = dlg.querySelector(".flm-diag-start");
		if (start) start.classList.add("cqb-primary");
		dlg.querySelectorAll(".buttons-list").forEach(function (f) {
			var p = f.querySelector(".cqb-primary, .OK, input[type='submit'], .flm-diag-start");
			if (p && p.parentNode === f) f.appendChild(p);
		});
	}

	var flmObserved = false;
	function observeFileManager() {
		if (flmObserved) return;
		var container = document.getElementById("dialog-container");
		if (!container) return;
		flmObserved = true;
		/* Decorate any FM dialogs already present, then watch for new ones. */
		container.querySelectorAll("[id^='flm_popup_'].dlg-window").forEach(function (d) {
			try { enhanceFileManager(d); } catch (e) { /* never break the dialog */ }
		});
		var obs = new MutationObserver(function (muts) {
			muts.forEach(function (m) {
				Array.prototype.forEach.call(m.addedNodes, function (n) {
					if (n.nodeType !== 1) return;
					if (n.id && n.id.indexOf("flm_popup_") === 0 && n.classList.contains("dlg-window")) {
						try { enhanceFileManager(n); } catch (e) { /* never break the dialog */ }
					}
				});
			});
		});
		obs.observe(container, { childList: true });
	}

	/* Edit Torrent (Torrent Properties): each row ships a "change this field"
	 * checkbox beside a value control, and the plugin submits set_<field>=<cb>
	 * with the value applied only when the box is on. With nothing disabling the
	 * value while the box is off, "Private [off] | Yes" read as a contradiction.
	 * Present the checkbox as a compact Change switch (the checkbox stays the
	 * submitted source of truth) and disable the value control while it is off. */
	var EDIT_FIELDS = [
		{ set: "eset_trackers", val: "etrackers" },
		{ set: "eset_comment", val: "ecomment" },
		{ set: "eset_private", val: "eprivate" }
	];
	function enhanceEditTorrent() {
		var dlg = document.getElementById("tedit");
		if (!dlg || dlg.getAttribute("data-cqb-edit") === "1") return;
		if (!document.getElementById("eset_trackers")) return; /* markup not ready */
		dlg.setAttribute("data-cqb-edit", "1");

		/* Private shows capitalized Yes/No; the submitted 0/1 values are untouched. */
		var priv = document.getElementById("eprivate");
		if (priv) {
			for (var o = 0; o < priv.options.length; o++) {
				var op = priv.options[o];
				if (op.value === "0") op.text = t("cqb_edit_no", "No");
				else if (op.value === "1") op.text = t("cqb_edit_yes", "Yes");
			}
			var vspan = priv.parentNode && priv.parentNode.querySelector(".cqb-select-value");
			var sel = priv.options[priv.selectedIndex];
			if (vspan && sel) vspan.textContent = sel.text;
		}

		EDIT_FIELDS.forEach(function (f) {
			var cb = document.getElementById(f.set);
			var val = document.getElementById(f.val);
			if (!cb || !val) return;
			var head = cb.closest("[class*='col-']") || cb.parentNode;
			head.classList.add("cqb-edit-head");
			var sw = document.createElement("label");
			sw.className = "cqb-switch cqb-edit-switch";
			sw.appendChild(cb);
			var track = document.createElement("span");
			track.className = "cqb-switch-track";
			sw.appendChild(track);
			var change = document.createElement("span");
			change.className = "cqb-edit-change";
			change.textContent = t("cqb_edit_change", "Change");
			var grp = document.createElement("span");
			grp.className = "cqb-edit-toggle";
			grp.appendChild(sw);
			grp.appendChild(change);
			head.appendChild(grp);
			var valCol = val.closest("[class*='col-']") || val.parentNode;
			function syncField() {
				var on = cb.checked;
				val.disabled = !on;
				valCol.classList.toggle("cqb-edit-off", !on);
			}
			cb.addEventListener("change", syncField);
			syncField();
		});

		/* The plugin repopulates checkboxes + values from the picked torrent on
		 * each open; re-gate the value controls after it does. */
		if (window.theDialogManager && theDialogManager.addHandler) {
			theDialogManager.addHandler("tedit", "afterShow", function () {
				EDIT_FIELDS.forEach(function (f) {
					var cb = document.getElementById(f.set);
					if (cb) cb.dispatchEvent(new Event("change"));
				});
			});
		}
	}

	/* Load Torrents and the search add dialog ship the same add booleans as Add
	 * Torrent but as native checkboxes; convert them to the shared switch grid.
	 * The core checkbox is MOVED (its id, checked state and submit handler stay
	 * live), the emptied legacy columns are removed, and the grid drops into a
	 * container so it collapses on its own width. Idempotent. */
	function enhanceAddOpts(dlgId, ids) {
		var dlg = document.getElementById(dlgId);
		if (!dlg || dlg.getAttribute("data-cqb-opts") === "1") return;
		var cols = [];
		ids.forEach(function (id) {
			var cb = document.getElementById(id);
			if (!cb) return;
			var col = cb.closest("[class*='col-']");
			if (col) cols.push(col);
		});
		if (!cols.length) return;
		var grid = buildOptsGrid(dlg, ids);
		if (!grid || !grid.children.length) return;
		dlg.setAttribute("data-cqb-opts", "1");
		var wrap = document.createElement("div");
		wrap.className = "cqb-opts-wrap col-12 col-md-9 offset-md-3";
		wrap.appendChild(grid);
		cols[0].parentNode.insertBefore(wrap, cols[0]);
		cols.forEach(function (c) { if (c !== wrap && !c.querySelector("input")) c.remove(); });
		return true;
	}

	/* Both dialogs are preloaded, but the task console is built a little after
	 * the add dialog; retry (idempotently) until both are decorated. */
	function run() {
		try { enhanceAddTorrent(); } catch (e) { /* never break the dialog */ }
		try { enhanceTaskConsole(); } catch (e) { /* never break the dialog */ }
		try { enhanceCreate(); } catch (e) { /* never break the dialog */ }
		try { enhanceFieldForms(); } catch (e) { /* never break the dialog */ }
		try { enhanceAddOpts("dlgLoadTorrents", ["RSSnot_add_path", "RSStorrents_start_stopped"]); } catch (e) { /* never break the dialog */ }
		try { enhanceAddOpts("tegLoadTorrents", ["tegnot_add_path", "tegtorrents_start_stopped", "tegfast_resume"]); } catch (e) { /* never break the dialog */ }
		try { enhanceUnpack(); } catch (e) { /* never break the dialog */ }
		try { enhanceTrackLabels(); } catch (e) { /* never break the dialog */ }
		try { enhanceEditTorrent(); } catch (e) { /* never break the dialog */ }
		try { enhanceEmptyStates(); } catch (e) { /* never break the dialog */ }
		try { decorateConfirms(); normalizeFooters(); } catch (e) { /* never break the dialog */ }
		try { observeFileManager(); } catch (e) { /* never break the dialog */ }
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
