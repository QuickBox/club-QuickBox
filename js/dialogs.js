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
		zh.appendChild(document.createTextNode("Drag .torrent files here or "));
		zh.appendChild(browse);

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

		/* 2. Drag + drop onto the zone feeds the native input's FileList. */
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
			if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
				setFiles(e.dataTransfer.files);
			}
		});

		/* 3. File chips reflect the current selection; remove rebuilds it. */
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
		fileInput.addEventListener("change", function () { renderChips(); syncAdd(); });

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
				if (!cur) { cur = { name: "General", rows: [] }; sections.push(cur); }
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
			mediainfo: "Media Info", screenshots: "Screenshots",
			create: "Create Torrent", unpack: "Unpack"
		};
		var ctx = { task: "", title: "Task", sub: "", status: "running" };

		/* Capture the task name/title as each console task starts. */
		var origStart = theWebUI.startConsoleTask;
		theWebUI.startConsoleTask = function (taskName) {
			ctx.task = taskName || "";
			ctx.title = LABELS[taskName] || (window.theUILang && theUILang[taskName]) || "Task";
			ctx.sub = "";
			return origStart.apply(this, arguments);
		};

		/* Thin running-progress bar under the header. */
		var bar = document.createElement("div");
		bar.className = "cqb-task-bar";
		headerBar.insertAdjacentElement("afterend", bar);

		/* MediaInfo formatted view + Raw toggle, inserted before the raw log. */
		var toolbar = document.createElement("div");
		toolbar.className = "cqb-mi-toolbar";
		toolbar.style.display = "none";
		var rawBtn = document.createElement("button");
		rawBtn.type = "button";
		rawBtn.className = "cqb-secondary";
		var showRaw = false;
		rawBtn.textContent = t("raw", "Raw");
		rawBtn.addEventListener("click", function () { showRaw = !showRaw; renderMI(); });
		toolbar.appendChild(rawBtn);
		var miWrap = document.createElement("div");
		miWrap.className = "cqb-mi";
		miWrap.style.display = "none";
		log.parentNode.insertBefore(toolbar, log);
		log.parentNode.insertBefore(miWrap, log);

		function basename(p) {
			var s = String(p).replace(/[\\/]+$/, "");
			var i = Math.max(s.lastIndexOf("/"), s.lastIndexOf("\\"));
			return i >= 0 ? s.slice(i + 1) : s;
		}

		function renderMI() {
			if (ctx.task !== "mediainfo") {
				toolbar.style.display = "none";
				miWrap.style.display = "none";
				log.style.display = "";
				return;
			}
			var text = log.innerText || log.textContent || "";
			var sections = parseMediaInfo(text);
			if (!sections.length) {
				toolbar.style.display = "none";
				miWrap.style.display = "none";
				log.style.display = "";
				return;
			}
			toolbar.style.display = "flex";
			rawBtn.textContent = showRaw ? t("Formatted", "Formatted") : t("raw", "Raw");
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

		/* Footer: compact, one row. Hide screenshot-only controls off that flow. */
		function decorateFooter() {
			if (ctx.task !== "screenshots") {
				var sc = dlg.querySelectorAll(".scplay");
				Array.prototype.forEach.call(sc, function (b) { b.style.display = "none"; });
			}
			[["tskCopy", "Copy"], ["tskSaveLog", "Save Log"]].forEach(function (pair) {
				var b = document.getElementById(pair[0]);
				if (b && !b.classList.contains("cqb-icon-btn")) {
					b.classList.add("cqb-icon-btn");
					if (window.cqb && cqb.tooltip) cqb.tooltip(b, b.textContent.trim() || pair[1]);
				}
			});
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

	function enhanced(id, attr) {
		var el = document.getElementById(id);
		return el ? el.getAttribute(attr) === "1" : false;
	}

	/* Both dialogs are preloaded, but the task console is built a little after
	 * the add dialog; retry (idempotently) until both are decorated. */
	function run() {
		try { enhanceAddTorrent(); } catch (e) { /* never break the dialog */ }
		try { enhanceTaskConsole(); } catch (e) { /* never break the dialog */ }
		return enhanced("tadd", "data-cqb-add") && enhanced("tskConsole", "data-cqb-tsk");
	}

	if (run()) return;
	var tries = 0;
	var iv = setInterval(function () {
		if (run() || ++tries > 40) clearInterval(iv);
	}, 150);
})(window.cqb);
