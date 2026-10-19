#!/usr/bin/env bash
#
# US-38, NFR-14. The contact-surface sweep.
#
# Asserts that no phone number, postal address or CV file is present in the working
# tree, the build output, or the full git history — and that commits carry a GitHub
# noreply address rather than a personal one.
#
# Run before every release:  pnpm sweep
#
# Exits non-zero on any finding. Every check prints what it searched and how much of
# it, because a check that reports "nothing found" identically for "clean" and "the
# pattern was wrong" is evidence of nothing. This project found eight controls that
# passed while not working; this one states its own scope so it cannot join them.

set -uo pipefail
cd "$(dirname "$0")/.." || exit 2

fail=0
note() { printf '  %s\n' "$*"; }
ok()   { printf '  PASS  %s\n' "$*"; }
bad()  { printf '  FAIL  %s\n' "$*"; fail=1; }

# Two addresses are already in the permanent history, reviewed and accepted. See D28 in
# docs/STATUS.md for why they were not removed by rewriting history.
#
# They are held as SHA-256 digests rather than plaintext. Writing the addresses into
# this file would add a fresh copy of them to the repository and to its history, which
# is the exact exposure the entry exists to record — documenting a leak by repeating it.
#
# This is not obfuscation for secrecy. Anyone who already knows an address can hash it
# and confirm it appears here. It avoids creating a NEW plaintext copy, which is the only
# part still under anyone's control.
#
# Anything whose digest is not on this list still fails.
ACCEPTED_DIGESTS='ad7a4f81ad9750c9710eb6383f5161d799439fc6a264bd726649593ea25633c8
e2af25ab005f355724633803a9b0e0890c9064b478202b68d651895caf928cd9'

accepted() { # $1 = address; true when its digest is on the accepted list
  printf '%s\n' "$ACCEPTED_DIGESTS" | grep -qxF "$(printf '%s' "$1" | sha256sum | cut -d' ' -f1)"
}

PHONE='(\+31|0031)[0-9 ()-]{6,}|\b06[-[:space:]]?[0-9]{8}\b'
POSTCODE='\b[0-9]{4}[[:space:]]?[A-Z]{2}\b'
STREET='\b(straat|laan|plein|kade|singel|gracht)\b'
MAIL='[A-Za-z0-9._%-]+@(gmail|outlook|hotmail|yahoo|proton|icloud)\.'

echo "=== 1. Commit metadata ==================================================="
total=$(git log --all --format='%H' | wc -l)
note "commits inspected: $total (all refs)"
offenders=''
for addr in $(git log --all --format='%ae%n%ce' | sort -u \
  | grep -vE '@users\.noreply\.github\.com$|^noreply@github\.com$'); do
  accepted "$addr" || offenders="$offenders $addr"
done
if [ -z "$offenders" ]; then
  ok "every author and committer uses a noreply address, or is on the accepted list"
else
  bad "personal address in commit metadata:"; printf '        %s\n' $offenders
fi

echo
echo "=== 2. Working tree ======================================================"
tracked=$(git ls-files | wc -l)
untracked=$(git status --porcelain --untracked-files=all | grep -c '^??' || true)
note "tracked files: $tracked, untracked and not ignored: $untracked"
# Tracked AND untracked-but-not-ignored, because `git grep` searches the index only
# and a file that has not been staged yet is still in the working tree NFR-14 names.
worklist=$(mktemp); trap 'rm -f "$worklist"' EXIT
# This script is excluded from the pattern checks, and only this script: it defines
# the patterns, so it necessarily contains the words it searches for. Excluding it
# by exact path keeps the exclusion visible and impossible to widen by accident.
SELF=build/contact-surface-sweep.sh
git ls-files --cached --others --exclude-standard | grep -vxF "$SELF" | tr '\n' '\0' > "$worklist"
for pair in "phone number:$PHONE" "postal code:$POSTCODE" "street name:$STREET" "personal email:$MAIL"; do
  what=${pair%%:*}; pat=${pair#*:}
  hits=$(xargs -0 -a "$worklist" grep -lIE "$pat" 2>/dev/null | wc -l)
  if [ "$hits" -eq 0 ]; then ok "no $what"; else bad "$what in $hits working-tree file(s)"; xargs -0 -a "$worklist" grep -nIE "$pat" 2>/dev/null | head -5; fi
done
docs=$(git ls-files | grep -icE '\.(pdf|docx?|odt)$' || true)
if [ "$docs" -eq 0 ]; then ok "no document or CV file tracked"; else bad "$docs document file(s) tracked"; fi

echo
echo "=== 3. Build output ======================================================"
if [ ! -d .output/public ]; then
  bad ".output/public is missing. Run 'pnpm generate' first — a sweep of a build that does not exist proves nothing."
else
  # Build inputs only. Nothing under docs/ reaches the build output, so a documentation
  # edit must not demand a rebuild — a check that fires when nothing relevant changed is
  # one people learn to ignore, which is how a control stops working.
  newest_src=$(git ls-files -- . ':(exclude)docs/*' | tr '\n' '\0' | xargs -0 ls -t 2>/dev/null | head -1)
  if [ -n "$newest_src" ] && [ "$newest_src" -nt .output/public/index.html ]; then
    bad "build output is older than $newest_src. Run 'pnpm generate' — a stale build proves nothing about this release."
  fi
  note "files in build output: $(find .output/public -type f | wc -l)"
  for pair in "phone number:$PHONE" "postal code:$POSTCODE" "street name:$STREET" "personal email:$MAIL"; do
    what=${pair%%:*}; pat=${pair#*:}
    hits=$(grep -rlIE "$pat" .output/public 2>/dev/null | wc -l)
    if [ "$hits" -eq 0 ]; then ok "no $what"; else bad "$what in $hits built file(s)"; grep -rhoIE "$pat" .output/public | sort -u | head -3; fi
  done
  found=$(find .output/public \( -iname '*.pdf' -o -iname '*.doc*' -o -iname '*.odt' \) | wc -l)
  if [ "$found" -eq 0 ]; then ok "no document or CV file served"; else bad "$found document file(s) in the build output"; fi
  note "every address served: $(grep -rhoIE '[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' .output/public 2>/dev/null | sort -u | tr '\n' ' ')"
fi

echo
echo "=== 4. Full history ======================================================"
stream=$(mktemp)
trap 'rm -f "$stream" "$worklist"' EXIT
git log --all -p --no-color -- . ":(exclude)$SELF" > "$stream" 2>/dev/null
note "diff stream: $(wc -l < "$stream") lines across $total commits"
for pair in "phone number:$PHONE" "postal code:$POSTCODE" "street name:$STREET"; do
  what=${pair%%:*}; pat=${pair#*:}
  c=$(grep -ciE "$pat" "$stream" || true)
  if [ "$c" -eq 0 ]; then ok "no $what ever committed"; else bad "$what on $c line(s) of history"; grep -iE "$pat" "$stream" | head -3; fi
done
unexpected=''
for addr in $(grep -ioE "$MAIL[A-Za-z]*" "$stream" | sort -u); do
  accepted "$addr" || unexpected="$unexpected $addr"
done
if [ -z "$unexpected" ]; then
  ok "no personal email in history beyond the accepted list (see D28)"
else
  bad "personal email in history that is not on the accepted list:"; printf '        %s\n' $unexpected
fi
ever=$(git log --all --diff-filter=A --name-only --format= | sort -u | grep -icE '\.(pdf|docx?|odt)$' || true)
if [ "$ever" -eq 0 ]; then ok "no document or CV file ever added"; else bad "$ever document file(s) exist in history"; fi

echo
if [ "$fail" -eq 0 ]; then
  echo "SWEEP PASSED"
else
  echo "SWEEP FAILED — do not tag a release until this is resolved."
fi
exit "$fail"
