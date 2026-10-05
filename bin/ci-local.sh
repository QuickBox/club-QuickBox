#!/usr/bin/env bash
# ci-local.sh - run the ci checks locally, exactly as .github/workflows/ci.yml
# runs them: from the repo root, with the same relative invocations, in the same
# order, stopping on the first failure.
#
# KEEP IN SYNC: this script and .github/workflows/ci.yml must list the SAME
# steps in the SAME order. Change one, change the other.
set -Eeuo pipefail

root=$(cd -- "$(dirname -- "$0")/.." >/dev/null 2>&1 && pwd)
cd "$root"

step() { echo; echo "== $* =="; }

# 1. conventional commit messages over the commits not yet on latest
step "commit messages are conventional"
if git rev-parse --verify -q origin/latest >/dev/null 2>&1; then
	range="origin/latest..HEAD"
else
	range="HEAD"
fi
echo "checking $range"
bash bin/check-version.sh messages "$range"

# 2. one consistent version across the sources
step "version consistency"
bash bin/check-version.sh consistency

# 3. syntax-check the theme scripts
step "node --check"
for f in init.js js/*.js lang/*.js; do node --check "$f"; done

# 4. string catalog
step "check-lang"
sh bin/check-lang.sh

# 5. asset cache stamp
step "stamp --check"
bash bin/stamp.sh --check

# 6-8. selftests
step "release --selftest"
bash bin/release.sh --selftest
step "stamp --selftest"
bash bin/stamp.sh --selftest
step "check-version --selftest"
bash bin/check-version.sh --selftest

echo
echo "ci-local: ALL GREEN"
