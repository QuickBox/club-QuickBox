#!/bin/sh
# check-lang.sh -- verify the club-QuickBox skin string catalog.
#
# The skin reads its own strings from theUILang under two namespaces: cqb_*
# and qb<Capital>*. lang/en.js is the catalog of every such string; each other
# lang/<code>.js is a translation that must mirror en.js key-for-key. The theme
# plugin never loads the skin's lang/, so init.js loads it; this check keeps the
# catalog honest for both the base and the translations.
#
# PASS requires both:
#   1. every skin key the modules read (init.js + js/*.js) is assigned in
#      lang/en.js -- no string renders without a catalog entry;
#   2. every lang/<code>.js assigns exactly the same key set as lang/en.js --
#      no missing keys and no stray keys.
#
# POSIX sh + grep/sed/sort/comm only; no runtime dependency. Translators run it
# after adding or editing a lang file.
#
#   sh bin/check-lang.sh            # check this theme (exit 0 PASS, 1 FAIL)
#   sh bin/check-lang.sh <root>     # check the theme at <root>
#   sh bin/check-lang.sh --selftest # exercise PASS and both FAIL directions
set -u

# Keys ASSIGNED in a lang file: theUILang.<key> = ...
keys_of() {
	grep -oE 'theUILang\.[A-Za-z_][A-Za-z0-9_]*' "$1" 2>/dev/null \
		| sed 's/^theUILang\.//' | LC_ALL=C sort -u
}

# Run the two checks against a theme root. Prints findings; returns 0/1.
run_check() {
	root=$1
	lang="$root/lang"
	t=$(mktemp -d)
	rc=0

	# Keys the modules READ: every cqb_<lower>.. / qb<Upper>.. token in the
	# source (the underscore separates the cqb_ key namespace from cqb- CSS
	# classes; qb<Capital> separates the qb keys from qb_theme / qb-* cookies).
	# A leading-boundary match (start of line or a non-identifier char) keeps
	# the token from matching the "qb" inside a cqb<Capital> identifier such as
	# cqbTableReady; the second grep drops that boundary char.
	grep -hoE '(^|[^A-Za-z0-9_])(cqb_[a-z][A-Za-z0-9_]*|qb[A-Z][A-Za-z0-9_]*)' \
		"$root/init.js" "$root"/js/*.js 2>/dev/null \
		| grep -oE '(cqb_[a-z][A-Za-z0-9_]*|qb[A-Z][A-Za-z0-9_]*)' \
		| LC_ALL=C sort -u > "$t/used"

	keys_of "$lang/en.js" > "$t/en"

	# Check 1: used keys missing from en.js.
	comm -23 "$t/used" "$t/en" > "$t/missing"
	if [ -s "$t/missing" ]; then
		rc=1
		echo "FAIL: strings read by the skin but missing from lang/en.js:"
		sed 's/^/  - /' "$t/missing"
	fi

	# Check 2: every translation mirrors en.js key-for-key.
	for f in "$lang"/*.js; do
		[ -f "$f" ] || continue
		if [ "$f" = "$lang/en.js" ]; then continue; fi
		keys_of "$f" > "$t/tr"
		comm -13 "$t/en" "$t/tr" > "$t/extra"    # in translation, not in en
		comm -23 "$t/en" "$t/tr" > "$t/absent"   # in en, not in translation
		name=$(basename "$f")
		if [ -s "$t/extra" ] || [ -s "$t/absent" ]; then
			rc=1
			echo "FAIL: lang/$name key set differs from lang/en.js:"
			if [ -s "$t/absent" ]; then
				echo "  missing (in en.js, absent here):"
				sed 's/^/    - /' "$t/absent"
			fi
			if [ -s "$t/extra" ]; then
				echo "  stray (here, not in en.js):"
				sed 's/^/    - /' "$t/extra"
			fi
		fi
	done

	if [ "$rc" = 0 ]; then
		echo "LANG OK: $(wc -l < "$t/used" | tr -d ' ') keys read, $(wc -l < "$t/en" | tr -d ' ') in lang/en.js; all translations mirror en.js"
	fi
	rm -rf "$t"
	return "$rc"
}

selftest() {
	d=$(mktemp -d); fail=0; ec=0
	mkdir -p "$d/js" "$d/lang"
	printf ';(function(){ })();\n' > "$d/init.js"
	printf 'var a = t("cqb_hello", "Hi"), b = theUILang.qbBye;\n' > "$d/js/m.js"

	# OK: en.js lists exactly the read keys; de.js mirrors it.
	printf 'theUILang.cqb_hello = "Hi";\ntheUILang.qbBye = "Bye";\n' > "$d/lang/en.js"
	printf 'theUILang.cqb_hello = "Hej";\ntheUILang.qbBye = "Farvel";\n' > "$d/lang/de.js"
	ec=0; run_check "$d" >/dev/null 2>&1 || ec=$?
	[ "$ec" = 0 ] && echo "selftest ok-case: PASS" || { echo "selftest ok-case: FAIL ($ec)"; fail=1; }

	# FAIL direction 1: a module reads a key en.js does not list.
	printf 'var a = t("cqb_hello", "Hi"), b = theUILang.qbBye, c = t("cqb_gone", "X");\n' > "$d/js/m.js"
	ec=0; run_check "$d" >/dev/null 2>&1 || ec=$?
	[ "$ec" = 1 ] && echo "selftest missing-used-key: PASS" || { echo "selftest missing-used-key: FAIL ($ec)"; fail=1; }
	printf 'var a = t("cqb_hello", "Hi"), b = theUILang.qbBye;\n' > "$d/js/m.js"

	# FAIL direction 2a: a translation is missing an en.js key.
	printf 'theUILang.cqb_hello = "Hej";\n' > "$d/lang/de.js"
	ec=0; run_check "$d" >/dev/null 2>&1 || ec=$?
	[ "$ec" = 1 ] && echo "selftest translation-missing-key: PASS" || { echo "selftest translation-missing-key: FAIL ($ec)"; fail=1; }

	# FAIL direction 2b: a translation carries a key en.js does not have.
	printf 'theUILang.cqb_hello = "Hej";\ntheUILang.qbBye = "Farvel";\ntheUILang.cqb_stray = "Z";\n' > "$d/lang/de.js"
	ec=0; run_check "$d" >/dev/null 2>&1 || ec=$?
	[ "$ec" = 1 ] && echo "selftest translation-stray-key: PASS" || { echo "selftest translation-stray-key: FAIL ($ec)"; fail=1; }

	rm -rf "$d"
	return "$fail"
}

case "${1:-}" in
	--selftest) selftest; exit $? ;;
	-*) echo "usage: $0 [theme-root] | --selftest" >&2; exit 2 ;;
	*)
		root=${1:-}
		if [ -z "$root" ]; then
			root="$(dirname "$0")/.."
		fi
		run_check "$root"; exit $?
		;;
esac
