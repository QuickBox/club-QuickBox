/*
 *  club-QuickBox skin for ruTorrent -- custom select.
 *
 *  Mirrors the v4 dashboard Select across every ruTorrent <select>: a themed
 *  trigger over a body-level portal listbox, with keyboard, type-ahead, a
 *  filter field for long lists and optgroup headers. The native <select> is
 *  never cloned or replaced -- it stays in the DOM as the single source of
 *  truth (value, options, disabled) and is only visually hidden. On a pick we
 *  set its selectedIndex and dispatch change + input (bubbling), so every core
 *  and plugin handler fires exactly as before. Selects added later (dialogs,
 *  dynamic settings, plugin panes) are enhanced by a body observer; the trigger
 *  stays in sync when core changes a select programmatically.
 *
 *  Runs in global scope with jQuery ($, $$), theUILang and window.cqb. The
 *  leading semicolon keeps the file safe if it is ever concatenated.
 */
;(function (cqb) {
	"use strict";

	var FILTER_THRESHOLD = 10;
	var openController = null; /* the one open panel's controller, or null */

	function t(key, fallback) {
		return (window.theUILang && theUILang[key]) || fallback;
	}

	function prefersReducedMotion() {
		return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	}

	/* A select we must leave alone: multi-select (a different control), one the
	 * element itself hides (display:none, e.g. a stashed priority picker), one a
	 * sibling lane has claimed, or one already enhanced. An ancestor being
	 * hidden (a closed dialog, the chunks container) does NOT disqualify it --
	 * the trigger simply inherits that hidden state until the surface shows. */
	function shouldSkip(select) {
		if (!select || select.tagName !== "SELECT") return true;
		if (select.multiple) return true;
		if (select.getAttribute("data-cqb-enhanced") === "1") return true;
		if (select.hasAttribute("data-cqb-native") || select.hasAttribute("data-cqb-skip")) return true;
		var cs = window.getComputedStyle(select);
		/* `display`/`visibility` here resolve to the select's OWN value, not an
		 * ancestor's, so this catches a self-hidden select and nothing else. */
		if (cs.display === "none" || cs.visibility === "hidden") return true;
		return false;
	}

	function isFullWidth(select) {
		if (select.classList.contains("form-select") ||
			select.classList.contains("form-control") ||
			select.classList.contains("w-100")) return true;
		var cs = window.getComputedStyle(select);
		return cs.display === "block";
	}

	function parentIsFlex(select) {
		var p = select.parentElement;
		if (!p) return false;
		var d = window.getComputedStyle(p).display;
		return d === "flex" || d === "inline-flex";
	}

	/* ============================================================
	 * Model: read the live <select> into an ordered option list.
	 * ============================================================ */
	function readModel(select) {
		var model = [];
		var kids = select.children;
		for (var i = 0; i < kids.length; i++) {
			var node = kids[i];
			if (node.tagName === "OPTGROUP") {
				var label = node.getAttribute("label") || "";
				var opts = node.children;
				for (var j = 0; j < opts.length; j++) pushOption(model, opts[j], label);
			} else if (node.tagName === "OPTION") {
				pushOption(model, node, null);
			}
		}
		return model;
	}
	function pushOption(model, optionEl, group) {
		if (optionEl.tagName !== "OPTION" || optionEl.hidden) return;
		model.push({
			index: optionEl.index,
			label: (optionEl.textContent || "").trim() || optionEl.value || "",
			value: optionEl.value,
			/* Extra search terms carried on the option so a user can find a row
			 * by a name that is not its visible label (e.g. the English name of a
			 * language whose label is its own native name). Any select can opt in
			 * by setting data-cqb-keywords on its options. */
			keywords: optionEl.getAttribute("data-cqb-keywords") || "",
			disabled: optionEl.disabled,
			group: group
		});
	}

	/* ============================================================
	 * Enhance one select.
	 * ============================================================ */
	function enhance(select) {
		if (shouldSkip(select)) return;
		select.setAttribute("data-cqb-enhanced", "1");
		select.classList.add("cqb-native");

		/* ruTorrent's language picker lists each language in its own native name,
		 * so enrich it with English (+ active-UI) search terms. Any other select
		 * can request the same enrichment with data-cqb-lang-keywords. */
		if (select.id === "webui.lang" || select.hasAttribute("data-cqb-lang-keywords")) {
			stampLanguageKeywords(select);
		}

		var trigger = document.createElement("button");
		trigger.type = "button";
		trigger.className = "cqb-select-trigger";
		trigger.setAttribute("role", "combobox");
		trigger.setAttribute("aria-haspopup", "listbox");
		trigger.setAttribute("aria-expanded", "false");
		if (parentIsFlex(select)) trigger.setAttribute("data-cqb-grow", "");
		else if (isFullWidth(select)) trigger.setAttribute("data-cqb-block", "");
		/* Carry an accessible name across from the native control. */
		var aria = select.getAttribute("aria-label");
		if (aria) trigger.setAttribute("aria-label", aria);
		else {
			var lab = select.id && document.querySelector('label[for="' + cssEscape(select.id) + '"]');
			if (lab) trigger.setAttribute("aria-label", (lab.textContent || "").trim());
		}

		var value = document.createElement("span");
		value.className = "cqb-select-value";
		var chevron = document.createElement("span");
		chevron.className = "cqb-select-chevron";
		chevron.setAttribute("aria-hidden", "true");
		trigger.appendChild(value);
		trigger.appendChild(chevron);

		/* The trigger sits immediately after the native control, taking the row
		 * the (now hidden) select used to hold. */
		if (select.nextSibling) select.parentNode.insertBefore(trigger, select.nextSibling);
		else select.parentNode.appendChild(trigger);

		var ctx = { select: select, trigger: trigger, valueEl: value, model: [], active: -1, query: "" };

		function resync() {
			ctx.model = readModel(select);
			var dis = select.disabled;
			trigger.disabled = dis;
			if (dis) trigger.setAttribute("aria-disabled", "true");
			else trigger.removeAttribute("aria-disabled");
			var idx = select.selectedIndex;
			var opt = idx >= 0 ? select.options[idx] : null;
			var text = opt ? ((opt.textContent || "").trim() || opt.value) : "";
			var placeholder = !text;
			value.textContent = placeholder ? (select.getAttribute("data-cqb-placeholder") || "") : text;
			value.classList.toggle("cqb-is-placeholder", placeholder);
			fitTriggerWidth();
			syncVisibility();
			if (openController === ctx) renderList();
		}
		select.__cqbResync = resync;

		/* Mirror the native control's rendered visibility. Core ruTorrent toggles
		 * some selects with jQuery .hide()/.show() (e.g. the Add Torrent label
		 * select when "New label..." is chosen), setting inline display, the
		 * hidden attribute, or a hiding class on the native element. The trigger
		 * is a separate node, so it must follow or it stays stranded next to the
		 * control core swapped in. Reading the native's computed display catches
		 * all three mechanisms cheaply; hiding also closes an open panel. */
		function syncVisibility() {
			var hidden = select.hidden || window.getComputedStyle(select).display === "none";
			if (hidden) {
				if (openController === ctx) close(false);
				trigger.style.display = "none";
				trigger.setAttribute("aria-hidden", "true");
			} else if (trigger.style.display === "none") {
				trigger.style.display = "";
				trigger.removeAttribute("aria-hidden");
			}
		}

		/* Size an inline trigger to its longest option so the full label shows
		 * without clipping against the chevron (spec: the trigger is at least as
		 * wide as its longest option, capped at the row). Flex/full triggers
		 * already fill their row; the collapsed clock trigger stays square.
		 * Measurement is best-effort and never throws the control. */
		function fitTriggerWidth() {
			try {
				if (trigger.hasAttribute("data-cqb-grow") ||
					trigger.hasAttribute("data-cqb-block") ||
					trigger.classList.contains("cqb-flm-recent")) return;
				if (!ctx.fitFont) {
					var cs = window.getComputedStyle(trigger);
					ctx.fitFont = "500 " + (cs.fontSize || "14px") + " " + (cs.fontFamily || "sans-serif");
				}
				var longest = 0;
				for (var i = 0; i < ctx.model.length; i++) {
					var w = measureText(ctx.model[i].label, ctx.fitFont);
					if (w > longest) longest = w;
				}
				/* 12+10 trigger padding + 10 value/chevron gap + 16 chevron. */
				var preferred = Math.ceil(longest) + 48;
				if (preferred > 120) {
					trigger.style.setProperty("--cqb-fit-width", preferred + "px");
					trigger.setAttribute("data-cqb-fit", "");
				} else {
					trigger.style.removeProperty("--cqb-fit-width");
					trigger.removeAttribute("data-cqb-fit");
				}
			} catch (e) { /* measurement is best-effort, never fatal */ }
		}

		/* ---- Commit a pick back through the native control. ---- */
		function commitIndex(nativeIndex) {
			var opt = select.options[nativeIndex];
			if (!opt || opt.disabled) return;
			if (select.selectedIndex !== nativeIndex) {
				select.selectedIndex = nativeIndex;
			}
			select.dispatchEvent(new Event("input", { bubbles: true }));
			select.dispatchEvent(new Event("change", { bubbles: true }));
			resync();
		}

		/* ---- Panel ---- */
		var panel = null, listEl = null, searchEl = null, reposition = null;

		function hasFilter() { return ctx.model.length > FILTER_THRESHOLD; }

		function visibleModel() {
			if (!ctx.query) return ctx.model;
			var q = ctx.query.toLowerCase();
			return ctx.model.filter(function (m) {
				return m.label.toLowerCase().indexOf(q) !== -1 ||
					(m.value && m.value.toLowerCase().indexOf(q) !== -1) ||
					(m.keywords && m.keywords.toLowerCase().indexOf(q) !== -1);
			});
		}

		function renderList() {
			if (!listEl) return;
			listEl.textContent = "";
			var rows = visibleModel();
			if (!rows.length) {
				var empty = document.createElement("div");
				empty.className = "cqb-select-empty";
				empty.textContent = ctx.query ? t("qbNoMatches", "No matches") : t("qbNoOptions", "No options");
				listEl.appendChild(empty);
				return;
			}
			var lastGroup = null;
			var selIndex = select.selectedIndex;
			rows.forEach(function (m, pos) {
				if (m.group && m.group !== lastGroup) {
					var g = document.createElement("div");
					g.className = "cqb-select-group";
					g.setAttribute("role", "presentation");
					g.textContent = m.group;
					listEl.appendChild(g);
				}
				lastGroup = m.group;
				var row = document.createElement("button");
				row.type = "button";
				row.className = "cqb-select-option" + (m.group ? " cqb-in-group" : "");
				row.setAttribute("role", "option");
				row.id = ctx.listId + "-opt-" + pos;
				var isSel = m.index === selIndex;
				row.setAttribute("aria-selected", isSel ? "true" : "false");
				if (m.disabled) row.setAttribute("aria-disabled", "true");
				if (pos === ctx.active) row.classList.add("cqb-active");
				var lbl = document.createElement("span");
				lbl.className = "cqb-select-option-label";
				lbl.textContent = m.label;
				row.appendChild(lbl);
				if (isSel) {
					var ck = document.createElement("span");
					ck.className = "cqb-select-check";
					ck.setAttribute("aria-hidden", "true");
					row.appendChild(ck);
				}
				row.addEventListener("mouseenter", function () {
					if (m.disabled) return;
					setActive(pos);
				});
				row.addEventListener("click", function (e) {
					e.preventDefault();
					if (m.disabled) return;
					commitIndex(m.index);
					close(true);
				});
				listEl.appendChild(row);
			});
			updateActiveDescendant();
		}

		function setActive(pos) {
			if (pos === ctx.active) return;
			var rows = listEl.querySelectorAll(".cqb-select-option");
			if (ctx.active >= 0 && rows[ctx.active]) rows[ctx.active].classList.remove("cqb-active");
			ctx.active = pos;
			if (pos >= 0 && rows[pos]) {
				rows[pos].classList.add("cqb-active");
				rows[pos].scrollIntoView({ block: "nearest" });
			}
			updateActiveDescendant();
		}
		function updateActiveDescendant() {
			if (ctx.active >= 0) trigger.setAttribute("aria-activedescendant", ctx.listId + "-opt-" + ctx.active);
			else trigger.removeAttribute("aria-activedescendant");
		}

		function moveActive(delta) {
			var rows = visibleModel();
			if (!rows.length) return;
			var i = ctx.active;
			for (var step = 0; step < rows.length; step++) {
				i += delta;
				if (i < 0) i = rows.length - 1;
				if (i >= rows.length) i = 0;
				if (!rows[i].disabled) { setActive(i); return; }
			}
		}

		function placePanel() {
			var r = trigger.getBoundingClientRect();
			var vw = document.documentElement.clientWidth;
			var vh = document.documentElement.clientHeight;
			var pad = 8, gap = 4;
			/* Panel floor: at least the trigger width, never below 180px, and
			 * never wider than the viewport inset -- so a narrow trigger (e.g.
			 * the collapsed Recent-folders clock) still opens a readable list
			 * instead of a cramped sliver at the viewport edge. */
			panel.style.minWidth = Math.min(Math.max(r.width, 180), vw - pad * 2) + "px";
			/* Keep the list's scroll offset across the measure: clearing maxHeight
			 * to read the natural height momentarily makes the list unscrollable,
			 * which clamps scrollTop to 0. Restore it after the cap is re-applied
			 * so any re-placement (resize, page scroll) never jumps the list. */
			var savedScroll = listEl.scrollTop;
			panel.style.maxHeight = "";
			listEl.style.maxHeight = "";
			var ph = panel.offsetHeight;
			var below = vh - r.bottom - pad;
			var above = r.top - pad;
			var flipUp = below < Math.min(ph, 320) && above > below;
			var avail = flipUp ? above : below;
			var cap = Math.min(320, Math.floor(vh * 0.7), avail);
			listEl.style.maxHeight = cap + "px";
			listEl.scrollTop = savedScroll;
			ph = panel.offsetHeight;
			var pw = panel.offsetWidth;
			var top = flipUp ? (r.top - gap - ph) : (r.bottom + gap);
			var left = Math.min(Math.max(pad, r.left), Math.max(pad, vw - pw - pad));
			panel.style.top = Math.max(pad, top) + "px";
			panel.style.left = left + "px";
			panel.classList.toggle("cqb-flip-up", flipUp);
		}

		function open() {
			if (openController) openController.close(false);
			openController = ctx;
			ctx.query = "";
			panel = document.createElement("div");
			panel.className = "cqb-select-panel";
			panel.setAttribute("role", "presentation");
			panel.addEventListener("mousedown", function (e) { e.preventDefault(); });
			ctx.listId = "cqb-listbox-" + (++listSeq);

			if (hasFilter()) {
				searchEl = document.createElement("div");
				searchEl.className = "cqb-select-search";
				var si = document.createElement("span");
				si.className = "cqb-select-search-icon";
				si.setAttribute("aria-hidden", "true");
				var input = document.createElement("input");
				input.type = "text";
				input.setAttribute("aria-label", t("search", "Search"));
				input.placeholder = t("search", "Search") + "...";
				input.addEventListener("input", function () {
					ctx.query = input.value;
					ctx.active = -1;
					renderList();
					firstActive();
				});
				searchEl.appendChild(si);
				searchEl.appendChild(input);
				panel.appendChild(searchEl);
				ctx.searchInput = input;
			} else {
				ctx.searchInput = null;
			}

			listEl = document.createElement("div");
			listEl.className = "cqb-select-list";
			listEl.id = ctx.listId;
			listEl.setAttribute("role", "listbox");
			if (trigger.getAttribute("aria-label")) listEl.setAttribute("aria-label", trigger.getAttribute("aria-label"));
			panel.appendChild(listEl);
			document.body.appendChild(panel);

			trigger.setAttribute("aria-expanded", "true");
			trigger.setAttribute("aria-controls", ctx.listId);

			/* Start the highlight on the selected option. */
			var vis = visibleModel();
			ctx.active = -1;
			for (var k = 0; k < vis.length; k++) {
				if (vis[k].index === select.selectedIndex && !vis[k].disabled) { ctx.active = k; break; }
			}
			renderList();
			if (ctx.active < 0) firstActive();

			placePanel();
			if (prefersReducedMotion()) panel.classList.add("cqb-open");
			else requestAnimationFrame(function () { if (panel) panel.classList.add("cqb-open"); });
			if (ctx.active >= 0) {
				var rows = listEl.querySelectorAll(".cqb-select-option");
				if (rows[ctx.active]) rows[ctx.active].scrollIntoView({ block: "nearest" });
			}
			if (ctx.searchInput) ctx.searchInput.focus();

			reposition = function (e) {
				if (!panel) return;
				if (cqb && cqb.panelScrolledInside && cqb.panelScrolledInside(e, panel)) return;
				placePanel();
			};
			window.addEventListener("scroll", reposition, true);
			window.addEventListener("resize", reposition);
			document.addEventListener("mousedown", onDocDown, true);
		}

		function firstActive() {
			var vis = visibleModel();
			for (var k = 0; k < vis.length; k++) {
				if (!vis[k].disabled) { setActive(k); return; }
			}
			setActive(-1);
		}

		function onDocDown(e) {
			if (trigger.contains(e.target)) return;
			if (panel && panel.contains(e.target)) return;
			close(false);
		}

		ctx.close = close;
		function close(refocus) {
			if (openController === ctx) openController = null;
			window.removeEventListener("scroll", reposition, true);
			window.removeEventListener("resize", reposition);
			document.removeEventListener("mousedown", onDocDown, true);
			reposition = null;
			if (panel && panel.parentNode) panel.parentNode.removeChild(panel);
			panel = listEl = searchEl = null;
			ctx.searchInput = null;
			ctx.active = -1;
			trigger.setAttribute("aria-expanded", "false");
			trigger.removeAttribute("aria-controls");
			trigger.removeAttribute("aria-activedescendant");
			if (refocus) trigger.focus();
		}

		/* ---- Trigger interactions ---- */
		trigger.addEventListener("click", function () {
			if (trigger.disabled) return;
			if (openController === ctx) close(true);
			else open();
		});

		trigger.addEventListener("keydown", function (e) {
			if (trigger.disabled) return;
			var isOpen = openController === ctx;
			var key = e.key;
			if (!isOpen) {
				if (key === "ArrowDown" || key === "ArrowUp" || key === "Enter" || key === " " || key === "Spacebar") {
					e.preventDefault();
					open();
				} else if (isTypeAhead(key)) {
					open();
					typeAhead(key);
				}
				return;
			}
			/* Open: when the filter field holds focus, leave text keys to it. */
			var inSearch = ctx.searchInput && document.activeElement === ctx.searchInput;
			switch (key) {
				case "ArrowDown": e.preventDefault(); moveActive(1); break;
				case "ArrowUp": e.preventDefault(); moveActive(-1); break;
				case "Home": e.preventDefault(); ctx.active = -1; firstActive(); break;
				case "End": e.preventDefault(); endActive(); break;
				case "Enter":
					e.preventDefault();
					pickActive();
					break;
				case "Escape": e.preventDefault(); close(true); break;
				case "Tab": close(false); break;
				case " ":
				case "Spacebar":
					if (!inSearch) { e.preventDefault(); pickActive(); }
					break;
				default:
					if (!inSearch && isTypeAhead(key)) { e.preventDefault(); typeAhead(key); }
			}
		});

		function endActive() {
			var vis = visibleModel();
			for (var k = vis.length - 1; k >= 0; k--) {
				if (!vis[k].disabled) { setActive(k); return; }
			}
		}
		function pickActive() {
			var vis = visibleModel();
			if (ctx.active >= 0 && vis[ctx.active]) { commitIndex(vis[ctx.active].index); close(true); }
		}

		/* Type-ahead over the visible rows (used when no filter field). */
		var taBuf = "", taAt = 0;
		function isTypeAhead(key) { return typeof key === "string" && key.length === 1 && key !== " "; }
		function typeAhead(key) {
			var now = Date.now();
			taBuf = (now - taAt < 800 ? taBuf : "") + key.toLowerCase();
			taAt = now;
			var vis = visibleModel();
			for (var k = 0; k < vis.length; k++) {
				if (!vis[k].disabled && vis[k].label.toLowerCase().indexOf(taBuf) === 0) { setActive(k); return; }
			}
		}

		/* ---- Keep the trigger in step with programmatic changes ---- */
		select.addEventListener("change", resync);
		if (window.MutationObserver) {
			var mo = new MutationObserver(function () { resync(); });
			mo.observe(select, { childList: true, subtree: true, attributes: true,
				attributeFilter: ["disabled", "aria-label", "style", "class", "hidden"] });
		}
		/* Raw `el.value = ` / `el.selectedIndex = ` go through the native setters;
		 * wrap them on this instance so the trigger follows. jQuery's .val() takes
		 * the option.selected path instead and is covered by the global wrap. */
		hookSetter(select, "value", resync);
		hookSetter(select, "selectedIndex", resync);

		resync();
	}

	var listSeq = 0;

	/* One shared canvas measures option-label widths for trigger auto-fit, so
	 * no hidden DOM node or reflow is needed. Falls back to a rough per-char
	 * estimate if 2D canvas is unavailable. */
	var measureCtx = null, measureCtxReady = false;
	function measureText(text, font) {
		if (!measureCtxReady) {
			measureCtxReady = true;
			try { measureCtx = document.createElement("canvas").getContext("2d"); }
			catch (e) { measureCtx = null; }
		}
		if (!measureCtx) return String(text).length * 7.5;
		measureCtx.font = font;
		return measureCtx.measureText(String(text)).width;
	}

	function hookSetter(el, prop, after) {
		try {
			if (el["__cqbHook_" + prop]) return;
			var desc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, prop);
			if (!desc || !desc.set || !desc.get) return;
			Object.defineProperty(el, prop, {
				configurable: true,
				enumerable: desc.enumerable,
				get: function () { return desc.get.call(this); },
				set: function (v) { desc.set.call(this, v); try { after(); } catch (e) {} }
			});
			el["__cqbHook_" + prop] = true;
		} catch (e) { /* a hostile descriptor must never break the control */ }
	}

	/* Region-coded language codes ruTorrent ships that Intl.DisplayNames needs
	 * as a proper BCP-47 tag before it will name them. */
	var LANG_CODE_MAP = { "zh-cn": "zh-Hans", "zh-tw": "zh-Hant", "pt-br": "pt-BR", "pt-pt": "pt-PT" };
	function toLangTag(code) {
		var lc = String(code || "").toLowerCase();
		return LANG_CODE_MAP[lc] || code;
	}

	/* A language select whose options are labelled in their own native names
	 * (ruTorrent's language list). Stamp the English name -- and the active UI
	 * language's name when that differs -- as searchable keywords on each
	 * option, so "Chinese"/"Simplified"/"German" find a row labelled, e.g.,
	 * "简体中文". Best-effort: without Intl.DisplayNames the rows stay searchable
	 * by their label and code, and a stamp runs at most once per select. */
	function stampLanguageKeywords(select) {
		if (!select || select.getAttribute("data-cqb-lang-stamped") === "1") return;
		if (!window.Intl || typeof Intl.DisplayNames !== "function") return;
		var enNames, uiNames = null;
		try { enNames = new Intl.DisplayNames(["en"], { type: "language" }); }
		catch (e) { return; }
		select.setAttribute("data-cqb-lang-stamped", "1");
		var activeTag = toLangTag(select.value);
		if (String(activeTag).toLowerCase().split("-")[0] !== "en") {
			try { uiNames = new Intl.DisplayNames([activeTag], { type: "language" }); }
			catch (e) { uiNames = null; }
		}
		var opts = select.options;
		for (var i = 0; i < opts.length; i++) {
			var tag = toLangTag(opts[i].value);
			var names = [];
			try { var en = enNames.of(tag); if (en && en !== tag) names.push(en); } catch (e) {}
			if (uiNames) {
				try { var ui = uiNames.of(tag); if (ui && ui !== tag && names.indexOf(ui) === -1) names.push(ui); } catch (e) {}
			}
			if (names.length) {
				var existing = opts[i].getAttribute("data-cqb-keywords");
				opts[i].setAttribute("data-cqb-keywords", (existing ? existing + " " : "") + names.join(" "));
			}
		}
	}

	/* Minimal CSS.escape for a label[for] lookup on older engines. */
	function cssEscape(s) {
		if (window.CSS && CSS.escape) return CSS.escape(s);
		return String(s).replace(/([^\w-])/g, "\\$1");
	}

	/* ============================================================
	 * Sweep + observe: enhance every current and future select.
	 * ============================================================ */
	function enhanceAll(root) {
		if (!root || !root.querySelectorAll) return;
		if (root.tagName === "SELECT") { safeEnhance(root); return; }
		var sels = root.querySelectorAll("select");
		for (var i = 0; i < sels.length; i++) safeEnhance(sels[i]);
	}
	function safeEnhance(select) {
		try { enhance(select); } catch (e) { /* one bad select must not stop the rest */ }
	}

	function start() {
		enhanceAll(document.body || document.documentElement);
		if (window.MutationObserver) {
			new MutationObserver(function (muts) {
				for (var i = 0; i < muts.length; i++) {
					var added = muts[i].addedNodes;
					for (var j = 0; j < added.length; j++) {
						if (added[j].nodeType === 1) enhanceAll(added[j]);
					}
				}
			}).observe(document.documentElement, { subtree: true, childList: true });
		}
		/* jQuery .val(v) on a select sets option.selected, which no observer or
		 * property hook sees. Wrap the setter once so enhanced selects resync. */
		if (window.jQuery && window.jQuery.fn && !window.jQuery.fn.val.__cqb) {
			var origVal = window.jQuery.fn.val;
			var wrapped = function () {
				var r = origVal.apply(this, arguments);
				if (arguments.length) {
					try {
						this.each(function () {
							if (this.tagName === "SELECT" && typeof this.__cqbResync === "function") this.__cqbResync();
						});
					} catch (e) {}
				}
				return r;
			};
			wrapped.__cqb = true;
			window.jQuery.fn.val = wrapped;
		}
	}

	if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
	else start();
})(window.cqb);
