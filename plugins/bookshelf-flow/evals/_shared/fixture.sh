#!/usr/bin/env bash
# Copies the bookshelf API into the eval workspace (the current directory).
# Usage: fixture.sh [patch-file...]; each patch is applied with `git apply` after the copy.
set -euo pipefail

shared="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$(cd "$shared/../../../.." && pwd)"

cp -R "$root/src" "$root/test" ./
cp "$root/package.json" "$root/package-lock.json" "$root/tsconfig.json" "$root/CLAUDE.md" ./
rm -rf test/hooks
ln -s "$root/node_modules" node_modules

git init -q
git add -A
git -c user.name=eval -c user.email=eval@example.invalid commit -qm "fixture"

for patch in "$@"; do
  git apply "$shared/$patch"
done
