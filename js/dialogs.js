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

		/* 1. Drop-zone card. A <label for> natively opens the file picker, so
		 * browsing needs no JS. The native input is tucked but left wired. */
		var zone = document.createElement("label");
		zone.className = "cqb-dropzone";
		zone.setAttribute("for", "torrent_file");

		var zi = document.createElement("span");
		zi.className = "cqb-dropzone-icon";
		zi.setAttribute("aria-hidden", "true");

		var zt = document.createElement("span");
		zt.className = "cqb-dropzone-title";
		zt.textContent = t("Add_from_file", "Add torrent files");

		var zh = document.createElement("span");
		zh.className = "cqb-dropzone-hint";
		var browse = document.createElement("span");
		browse.className = "cqb-dropzone-browse";
		browse.textContent = t("browse", "browse");
		zh.appendChild(document.createTextNode("Drag .torrent files here or "));
		zh.appendChild(browse);

		zone.appendChild(zi);
		zone.appendChild(zt);
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
		add.textContent = t("add_button", "Add");
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

	function run() {
		try { enhanceAddTorrent(); } catch (e) { /* never break the dialog */ }
	}

	if (document.getElementById("tadd")) run();
	else if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", run);
	} else {
		/* dialog may be built slightly after this module; retry briefly */
		var tries = 0;
		var iv = setInterval(function () {
			if (document.getElementById("tadd") || ++tries > 20) {
				clearInterval(iv);
				run();
			}
		}, 150);
	}
})(window.cqb);
