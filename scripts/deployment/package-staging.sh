#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
: "${GITHUB_SHA:?Run from the staging workflow with a commit SHA}"
[[ "$GITHUB_SHA" =~ ^[0-9a-f]{40}$ ]] || exit 1
package_dir=$(mktemp -d)
trap 'rm -rf "$package_dir"' EXIT
mkdir -p "$package_dir/frontend/runtime" "$package_dir/backend"
cp -a frontend/.next/standalone/. "$package_dir/frontend/runtime/"
mkdir -p "$package_dir/frontend/runtime/.next"
cp -a frontend/.next/static "$package_dir/frontend/runtime/.next/static"
if [[ -d frontend/public ]]; then cp -a frontend/public "$package_dir/frontend/runtime/public"; fi
rsync -a backend/ "$package_dir/backend/" \
  --exclude='.env*' --exclude=storage --exclude='database/*.sqlite*' \
  --exclude='bootstrap/cache/*.php' --exclude='auth.json'
printf '{"commit":"%s","frontend":"https://staging.pickparcelbd.com","api":"https://staging-api.pickparcelbd.com"}\n' "$GITHUB_SHA" > "$package_dir/release.json"
# Dereference build-time links; the receiver rejects links and path traversal.
tar --dereference --exclude='.env' --exclude='.env.*' --exclude='auth.json' \
  -czf staging-release.tar.gz -C "$package_dir" backend frontend release.json
sha256sum staging-release.tar.gz > staging-release.sha256
