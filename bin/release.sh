#!/usr/bin/env bash
# release.sh - derive the next version from conventional commits, write the
# version literals and the changelog set, and re-stamp. It never commits, tags
# or pushes; it prints the commit to make.
#
#   bash bin/release.sh                      # compute + write for the next version
#   bash bin/release.sh --dry-run            # compute + print, write nothing
#   bash bin/release.sh --ci                 # non-interactive write; exit 3 when nothing to release
#   bash bin/release.sh --version X.Y.Z      # seed/override the version
#   bash bin/release.sh --since <ref>        # override the changelog range base
#   bash bin/release.sh --highlights <file>  # prepend a highlights paragraph
#   bash bin/release.sh --selftest
#
# Version base: the highest vX.Y.Z tag reachable from HEAD. Bump from the commit
# subjects since it: feat -> minor; fix/perf/refactor -> patch; a `!` subject or
# a BREAKING CHANGE body -> major; docs/chore/test/style/ci only -> nothing to
# release (refused unless --version). The changelog range is that same tag, or
# --since when the reachable tag predates the line being released. Bot release
# commits, stamp-only commits and merges never drive a bump or reach a changelog.
set -Eeuo pipefail

self_dir=$(cd -- "$(dirname -- "$0")" >/dev/null 2>&1 && pwd)
default_repo=$(dirname -- "$self_dir")
# Absolute path to this script, so a re-invocation works from any cwd.
self="$self_dir/$(basename -- "$0")"
repo="${CLUB_QB_REPO:-$default_repo}"

dry_run=0 version_override="" since_ref="" highlights_file="" do_selftest=0 ci=0
while [ $# -gt 0 ]; do
	case "$1" in
		--dry-run) dry_run=1 ;;
		--ci) ci=1 ;;
		--version) version_override="${2:-}"; shift ;;
		--since) since_ref="${2:-}"; shift ;;
		--highlights) highlights_file="${2:-}"; shift ;;
		--selftest) do_selftest=1 ;;
		-h|--help) sed -nE 's/^# ?//p' "$0" | sed -n '1,20p'; exit 0 ;;
		*) echo "unknown argument: $1" >&2; exit 2 ;;
	esac
	shift
done

die() { echo "release.sh: $*" >&2; exit 1; }
is_semver() { printf '%s' "$1" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; }

# Bot release commits, stamp-only commits and merges never drive a version bump
# and never appear in a generated changelog.
excluded_subject() { printf '%s' "$1" | grep -qE '^(chore\((release|stamp)\)|Merge )'; }

# Highest vX.Y.Z tag that is an ancestor of HEAD. Empty if none.
highest_reachable_tag() { # <repo>
	local r=$1 t
	for t in $(git -C "$r" tag --list 'v[0-9]*.[0-9]*.[0-9]*' 2>/dev/null); do
		printf '%s\n' "$t" | grep -qE '^v[0-9]+\.[0-9]+\.[0-9]+$' || continue
		git -C "$r" merge-base --is-ancestor "$t" HEAD 2>/dev/null && printf '%s\n' "${t#v}"
	done | sort -t. -k1,1n -k2,2n -k3,3n | tail -1
}

# Bump kind across commits in a range. Prints major|minor|patch|none.
bump_kind() { # <repo> <range>
	local r=$1 range=$2 kind=none sub
	if git -C "$r" log --no-merges --format='%b' "$range" 2>/dev/null | grep -q 'BREAKING CHANGE'; then
		echo major; return
	fi
	while IFS= read -r sub; do
		[ -n "$sub" ] || continue
		excluded_subject "$sub" && continue
		if printf '%s' "$sub" | grep -qE '^[a-z]+(\([^)]*\))?!:'; then echo major; return; fi
		if printf '%s' "$sub" | grep -qE '^feat(\([^)]*\))?:'; then kind=minor; continue; fi
		if printf '%s' "$sub" | grep -qE '^(fix|perf|refactor)(\([^)]*\))?:'; then
			[ "$kind" = minor ] || kind="patch"
		fi
	done < <(git -C "$r" log --no-merges --format='%s' "$range" 2>/dev/null)
	echo "$kind"
}

apply_bump() { # <prev X.Y.Z> <kind>
	local x y z; IFS=. read -r x y z <<<"$1"
	case "$2" in
		major) echo "$((x+1)).0.0" ;;
		minor) echo "$x.$((y+1)).0" ;;
		patch) echo "$x.$y.$((z+1))" ;;
		*) return 1 ;;
	esac
}

# A commit whose every changed file sits under lang/ is a translation change.
is_lang_only() { # <repo> <sha>
	local r=$1 sha=$2 files
	files=$(git -C "$r" show --name-only --format= "$sha" 2>/dev/null | grep -v '^$' || true)
	[ -n "$files" ] || return 1
	! printf '%s\n' "$files" | grep -qvE '^lang/'
}

cap_first() { printf '%s%s' "$(printf '%s' "${1:0:1}" | tr '[:lower:]' '[:upper:]')" "${1:1}"; }

# Build the per-version changelog body on stdout: heading, optional highlights,
# then the sections present. <range> empty means the whole history.
gen_changelog_body() { # <repo> <version> <date> <range> <highlights>
	local r=$1 ver=$2 date=$3 range=$4 hl=$5 sha sub typ scope desc sec
	local -a added=() fixed=() perf=() changed=() trans=()
	while IFS=$'\t' read -r sha sub; do
		printf '%s' "$sub" | grep -qE '^[a-z]+(\([^)]*\))?!?:' || continue
		excluded_subject "$sub" && continue
		typ=$(printf '%s' "$sub" | sed -E 's/^([a-z]+).*/\1/')
		scope=$(printf '%s' "$sub" | sed -nE 's/^[a-z]+\(([^)]*)\)!?:.*/\1/p')
		desc=$(printf '%s' "$sub" | sed -E 's/^[a-z]+(\([^)]*\))?!?:[[:space:]]*//')
		desc=$(cap_first "$desc")
		sec=""
		if [ "$scope" = i18n ] || is_lang_only "$r" "$sha"; then sec=trans
		else case "$typ" in
			feat) sec=added ;; fix) sec=fixed ;; perf) sec=perf ;; refactor) sec=changed ;;
		esac; fi
		case "$sec" in
			added) added+=("- $desc") ;; fixed) fixed+=("- $desc") ;;
			perf) perf+=("- $desc") ;; changed) changed+=("- $desc") ;;
			trans) trans+=("- $desc") ;;
		esac
	done < <(git -C "$r" log --no-merges --format='%H%x09%s' "$range" 2>/dev/null)

	printf '## v%s (%s)\n' "$ver" "$date"
	if [ -n "$hl" ] && [ -f "$hl" ]; then printf '\n'; cat "$hl"; fi
	local -a names=(Added Fixed Performance Changed Translations)
	local i=0 arr
	for arr in added fixed perf changed trans; do
		local -n ref=$arr
		if [ "${#ref[@]}" -gt 0 ]; then
			printf '\n### %s\n\n' "${names[$i]}"
			printf '%s\n' "${ref[@]}"
		fi
		i=$((i+1))
	done
}

# index.json from every changelogs/v*.md, newest first.
gen_index() { # <repo>
	local r=$1 f ver date first=1
	printf '['
	while IFS=' ' read -r ver date file; do
		[ -n "$ver" ] || continue
		[ "$first" = 1 ] || printf ','
		first=0
		printf '\n  {"version": "%s", "date": "%s", "file": "%s"}' "$ver" "$date" "$file"
	done < <(
		for f in "$r"/changelogs/v*.md; do
			[ -e "$f" ] || continue
			sed -nE 's/^## v([0-9]+\.[0-9]+\.[0-9]+) \(([0-9]{4}-[0-9]{2}-[0-9]{2})\).*/\1 \2 changelogs\/'"$(basename "$f")"'/p' "$f" | head -1
		done | sort -t. -k1,1nr -k2,2nr -k3,3nr
	)
	printf '\n]\n'
}

# CHANGELOG.md: a header then every per-version file, newest first.
gen_aggregate() { # <repo>
	local r=$1 ver f
	printf '# Changelog\n\n'
	printf 'Release notes for the club-QuickBox ruTorrent skin, newest first.\n'
	while IFS=' ' read -r ver file; do
		[ -n "$ver" ] || continue
		printf '\n'
		cat "$r/$file"
	done < <(
		for f in "$r"/changelogs/v*.md; do
			[ -e "$f" ] || continue
			sed -nE 's/^## v([0-9]+\.[0-9]+\.[0-9]+) \(.*/\1 changelogs\/'"$(basename "$f")"'/p' "$f" | head -1
		done | sort -t. -k1,1nr -k2,2nr -k3,3nr
	)
}

write_plugin_info_version() { # <repo> <ver>
	local r=$1 ver=$2
	grep -qE '^version:' "$r/plugin.info" || die "plugin.info has no version: line"
	sed -i -E "s/^version:.*/version: $ver/" "$r/plugin.info"
}

write_init_version() { # <repo> <ver>
	local r=$1 ver=$2
	if grep -qE '^[[:space:]]*var CQB_VERSION = "[^"]*";' "$r/init.js"; then
		sed -i -E "s/^([[:space:]]*var CQB_VERSION = \")[^\"]*(\";)/\1$ver\2/" "$r/init.js"
	else
		grep -qE '^[[:space:]]*var CQB_REV = "[^"]*";' "$r/init.js" || die "init.js has no CQB_REV line to anchor CQB_VERSION"
		sed -i -E "/^[[:space:]]*var CQB_REV = \"[^\"]*\";/a\\	var CQB_VERSION = \"$ver\";" "$r/init.js"
	fi
}

run_release() {
	is_semver "${version_override:-1.0.0}" || die "--version must be X.Y.Z"
	local base_ver range_base range kind new_ver date
	base_ver=$(highest_reachable_tag "$repo")
	if [ -n "$since_ref" ]; then range_base=$since_ref
	elif [ -n "$base_ver" ]; then range_base="v$base_ver"
	else range_base=""; fi
	if [ -n "$range_base" ]; then range="$range_base..HEAD"; else range="HEAD"; fi

	if [ -n "$version_override" ]; then
		new_ver=$version_override
		kind="(forced)"
	else
		[ -n "$base_ver" ] || die "no vX.Y.Z tag reachable from HEAD; pass --version to seed"
		kind=$(bump_kind "$repo" "$range")
		if [ "$kind" = none ]; then
			if [ "$ci" = 1 ]; then echo "nothing to release: no feat/fix/perf/refactor commits since v$base_ver"; exit 3; fi
			die "nothing to release: only docs/chore/test/style/ci commits since v$base_ver (pass --version to override)"
		fi
		new_ver=$(apply_bump "$base_ver" "$kind")
	fi

	date=$(date -u +%F)
	echo "base version:  ${base_ver:-<none>}"
	echo "range:         ${range}"
	echo "bump:          ${kind}"
	echo "next version:  ${new_ver}"
	echo "release date:  ${date}"
	echo "---- changelog preview ----"
	gen_changelog_body "$repo" "$new_ver" "$date" "$range" "$highlights_file"
	echo "---------------------------"

	if [ "$dry_run" = 1 ]; then echo "(dry-run: nothing written)"; return 0; fi

	mkdir -p "$repo/changelogs"
	local cf="$repo/changelogs/v$new_ver.md"
	if [ -s "$cf" ]; then
		echo "kept existing changelogs/v$new_ver.md (curated; not overwritten)"
	else
		gen_changelog_body "$repo" "$new_ver" "$date" "$range" "$highlights_file" > "$cf"
		echo "wrote $cf"
	fi
	gen_index "$repo" > "$repo/changelogs/index.json"
	gen_aggregate "$repo" > "$repo/CHANGELOG.md"
	write_plugin_info_version "$repo" "$new_ver"
	write_init_version "$repo" "$new_ver"
	if [ -x "$repo/bin/stamp.sh" ]; then bash "$repo/bin/stamp.sh" --write "$repo"; fi

	if [ "$ci" = 1 ]; then
		echo "ci-version=$new_ver"
		return 0
	fi
	echo
	echo "Files written: plugin.info init.js changelogs/v$new_ver.md changelogs/index.json CHANGELOG.md"
	echo "Commit to make (do not tag or push):"
	echo "  git -C \"$repo\" add -A && git -C \"$repo\" commit -m 'chore(release): v$new_ver'"
}

selftest() {
	local fail=0 tmp d ver
	tmp=$(mktemp -d); trap 'rm -rf "$tmp"' RETURN
	mk() { # <dir> then subjects via stdin
		d="$tmp/$1"; mkdir -p "$d"; git -C "$d" init -q
		git -C "$d" config user.email t@t; git -C "$d" config user.name t
		printf 'version: 1.0.0\n' > "$d/plugin.info"; printf 'var CQB_REV = "dev";\n' > "$d/init.js"
		echo seed > "$d/f"; git -C "$d" add -A; git -C "$d" commit -qm 'chore: seed'
		git -C "$d" tag v1.0.0
		local s n=0
		while IFS= read -r s; do [ -n "$s" ] || continue; n=$((n+1)); echo "$n" > "$d/f$n"; git -C "$d" add -A; git -C "$d" commit -qm "$s"; done
	}
	expect() { # <dir> <expected-version> <label>
		local got; got=$(CLUB_QB_REPO="$tmp/$1" bash "$self" --dry-run 2>/dev/null | sed -nE 's/^next version:  //p')
		if [ "$got" = "$2" ]; then echo "selftest $3: PASS ($got)"; else echo "selftest $3: FAIL (got '$got', want '$2')"; fail=1; fi
	}
	expect_refuse() { # <dir> <label>
		local ec=0; CLUB_QB_REPO="$tmp/$1" bash "$self" --dry-run >/dev/null 2>&1 || ec=$?
		if [ "$ec" != 0 ]; then echo "selftest $2: PASS (refused)"; else echo "selftest $2: FAIL (did not refuse)"; fail=1; fi
	}
	ci_expect() { # <dir> <expected-version> <label>
		local out rc got; out=$(CLUB_QB_REPO="$tmp/$1" bash "$self" --ci 2>/dev/null); rc=$?
		got=$(printf '%s' "$out" | sed -nE 's/^ci-version=//p')
		if [ "$rc" = 0 ] && [ "$got" = "$2" ]; then echo "selftest $3: PASS ($got)"; else echo "selftest $3: FAIL (rc=$rc got '$got' want '$2')"; fail=1; fi
	}
	ci_expect_nothing() { # <dir> <label>
		local rc=0; CLUB_QB_REPO="$tmp/$1" bash "$self" --ci >/dev/null 2>&1 || rc=$?
		if [ "$rc" = 3 ]; then echo "selftest $2: PASS (exit 3)"; else echo "selftest $2: FAIL (rc=$rc)"; fail=1; fi
	}
	mk feat <<-'EOF'
	feat(topbar): add a search field
	docs: tweak readme
	EOF
	mk fixonly <<-'EOF'
	fix(table): stop the status pill flicker
	chore: bump dev dep
	EOF
	mk breaking <<-'EOF'
	feat(api): new loader
	refactor(core)!: drop the legacy cookie path
	EOF
	mk docsonly <<-'EOF'
	docs: expand the readme
	chore: reorder
	EOF
	expect feat 1.1.0 "feat-history-minor"
	expect fixonly 1.0.1 "fix-only-patch"
	expect breaking 2.0.0 "breaking-major"
	expect_refuse docsonly "docs-only-refused"
	# --version override on a docs-only history still releases
	ver=$(CLUB_QB_REPO="$tmp/docsonly" bash "$self" --dry-run --version 9.9.9 2>/dev/null | sed -nE 's/^next version:  //p')
	if [ "$ver" = 9.9.9 ]; then echo "selftest version-override: PASS (9.9.9)"; else echo "selftest version-override: FAIL ($ver)"; fail=1; fi

	# --ci generated path: writes files and reports the version; nothing-to-release exits 3
	ci_expect feat 1.1.0 "ci-generated-minor"
	ci_expect_nothing docsonly "ci-nothing-to-release-exit3"

	# --ci must drop bot release commits, stamp commits and merges from the notes
	d="$tmp/excl"; mkdir -p "$d"; git -C "$d" init -q
	git -C "$d" config user.email t@t; git -C "$d" config user.name t
	printf 'version: 1.0.0\n' > "$d/plugin.info"; printf 'var CQB_REV = "dev";\n' > "$d/init.js"
	echo seed > "$d/f"; git -C "$d" add -A; git -C "$d" commit -qm 'chore: seed'
	git -C "$d" tag v1.0.0; base=$(git -C "$d" branch --show-current)
	echo a > "$d/a"; git -C "$d" add -A; git -C "$d" commit -qm 'feat(ui): add a real feature'
	git -C "$d" checkout -q -b side; echo b > "$d/b"; git -C "$d" add -A; git -C "$d" commit -qm 'fix(side): a side fix'
	git -C "$d" checkout -q "$base"; git -C "$d" merge -q --no-ff side -m 'Merge branch side'
	echo c > "$d/c"; git -C "$d" add -A; git -C "$d" commit -qm 'chore(release): v0.0.0'
	echo e > "$d/e"; git -C "$d" add -A; git -C "$d" commit -qm 'chore(stamp): restamp assets'
	ci_expect excl 1.1.0 "ci-excludes-noise-version"
	f="$tmp/excl/changelogs/v1.1.0.md"
	if [ -f "$f" ] && grep -q 'real feature' "$f" && grep -q 'side fix' "$f" \
		&& ! grep -qiE 'restamp|Merge branch|chore\(release\)|v0\.0\.0' "$f"; then
		echo "selftest ci-excludes-noise-notes: PASS"
	else echo "selftest ci-excludes-noise-notes: FAIL"; fail=1; fi

	# a prepared (pre-curated) per-version changelog survives a --ci run
	mk prep <<-'EOF'
	feat(x): a feature
	EOF
	mkdir -p "$tmp/prep/changelogs"; printf '## v1.1.0 (2000-01-01)\n\nhand-curated note\n' > "$tmp/prep/changelogs/v1.1.0.md"
	CLUB_QB_REPO="$tmp/prep" bash "$self" --ci >/dev/null 2>&1
	if grep -q 'hand-curated note' "$tmp/prep/changelogs/v1.1.0.md"; then echo "selftest ci-preserves-curated: PASS"; else echo "selftest ci-preserves-curated: FAIL"; fail=1; fi
	return "$fail"
}

if [ "$do_selftest" = 1 ]; then selftest; exit $?; fi
run_release
