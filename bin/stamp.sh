#!/usr/bin/env bash
# stamp.sh - content stamp for the club-QuickBox theme's cache key.
#
# init.js is injected fresh by the server on every request, so it carries
# `var CQB_REV = "<stamp>";` and appends `cqb=<stamp>` to every module CSS/JS URL
# and to the three plugin-loaded sheets. The stamp is a hash of every asset the
# theme loads BY URL, so any change to any of them changes every URL and no
# browser keeps a stale file.
#
#   bash bin/stamp.sh [repo]            # print the stamp for the working tree
#   bash bin/stamp.sh --write [repo]    # write it into <repo>/init.js (the ship step)
#   bash bin/stamp.sh --check [repo]    # exit 1 unless init.js's CQB_REV equals the stamp
#   bash bin/stamp.sh --selftest
#
# The working branch keeps CQB_REV = "dev"; the bench sync stamps the bench copy.
set -Eeuo pipefail

self_dir=$(cd -- "$(dirname -- "$0")" >/dev/null 2>&1 && pwd)
default_repo=$(dirname -- "$self_dir")
# Absolute path to this script, so a re-invocation works from any cwd.
self="$self_dir/$(basename -- "$0")"

stamp_of() { # <repo>
	local r=$1
	# find, not ls: an empty glob must not fail the pipeline under pipefail
	find "$r" -maxdepth 2 -type f \( -path "$r/style.css" -o -path "$r/stable.css" -o -path "$r/plugins.css" \
		-o -path "$r/css/*.css" -o -path "$r/js/*.js" -o -path "$r/lang/*.js" \) -printf '%P\n' \
		| LC_ALL=C sort | while IFS= read -r f; do printf '%s\0' "$f"; cat -- "$r/$f"; done | sha256sum | cut -c1-10
}
rev_of() { sed -nE 's/^[[:space:]]*var CQB_REV = "([^"]*)";.*/\1/p' "$1/init.js" | head -1; }
write_rev() { # <repo> <stamp>
	grep -qE '^[[:space:]]*var CQB_REV = "[^"]*";' "$1/init.js" || { echo "init.js has no 'var CQB_REV = \"...\";' line" >&2; return 2; }
	sed -i -E "s/^([[:space:]]*var CQB_REV = \")[^\"]*(\";)/\1$2\2/" "$1/init.js"
}

selftest() {
	local d fail=0 a b ec; d=$(mktemp -d); trap 'rm -r "$d"' RETURN
	mkdir -p "$d/css" "$d/js" "$d/lang"
	printf 'a{}' > "$d/style.css"; printf 'b{}' > "$d/css/base.css"; printf 'x=1' > "$d/js/t.js"
	printf '(function(){\n\tvar CQB_REV = "dev";\n})();\n' > "$d/init.js"
	a=$(stamp_of "$d"); printf 'b{color:red}' > "$d/css/base.css"; b=$(stamp_of "$d")
	[ "$a" != "$b" ] && echo "selftest change-changes-stamp: PASS" || { echo "selftest change-changes-stamp: FAIL"; fail=1; }
	ec=0; bash "$self" --check "$d" >/dev/null 2>&1 || ec=$?
	[ "$ec" = 1 ] && echo "selftest check-fails-on-dev: PASS" || { echo "selftest check-fails-on-dev: FAIL ($ec)"; fail=1; }
	bash "$self" --write "$d" >/dev/null; ec=0; bash "$self" --check "$d" >/dev/null 2>&1 || ec=$?
	[ "$ec" = 0 ] && echo "selftest write-then-check: PASS" || { echo "selftest write-then-check: FAIL ($ec)"; fail=1; }
	[ "$(rev_of "$d")" = "$b" ] && echo "selftest written-value: PASS" || { echo "selftest written-value: FAIL"; fail=1; }
	printf 'x=2' > "$d/js/t.js"; ec=0; bash "$self" --check "$d" >/dev/null 2>&1 || ec=$?
	[ "$ec" = 1 ] && echo "selftest stale-after-edit: PASS" || { echo "selftest stale-after-edit: FAIL ($ec)"; fail=1; }
	return "$fail"
}

case "${1:-}" in
	--selftest) selftest; exit $? ;;
	--write) r=${2:-$default_repo}; s=$(stamp_of "$r"); write_rev "$r" "$s"; echo "CQB_REV = $s written to $r/init.js" ;;
	--check) r=${2:-$default_repo}; s=$(stamp_of "$r"); v=$(rev_of "$r")
		if [ "$v" = "$s" ]; then echo "STAMP OK $s"; else echo "STAMP STALE: init.js CQB_REV=\"$v\", assets hash to $s (run --write)"; exit 1; fi ;;
	-*) echo "usage: $0 [repo] | --write [repo] | --check [repo] | --selftest" >&2; exit 2 ;;
	*) stamp_of "${1:-$default_repo}" ;;
esac
