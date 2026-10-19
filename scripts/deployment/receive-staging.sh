#!/usr/bin/env bash
# Install privately as shared/deployment/receive-staging.sh. Use as a forced SSH command.
set -euo pipefail
umask 077
root=/home/kinboame/pickparcel-staging
php=/opt/cpanel/ea-php84/root/usr/bin/php
shared="$root/shared"
exec 9>"$shared/deploy.lock"
/bin/flock -w 300 9
if [[ ! "${SSH_ORIGINAL_COMMAND:-}" =~ ^deploy\ ([0-9a-f]{40})\ ([0-9a-f]{64})$ ]]; then
  echo 'Only a staging deployment command is accepted.' >&2; exit 1
fi
commit=${BASH_REMATCH[1]}
digest=${BASH_REMATCH[2]}
release_id="$(date -u +%Y%m%d%H%M%S)-${commit:0:12}"
archive="$root/incoming/$release_id.tar.gz"
# Bound a single upload to 200 MiB. Do not accept arbitrary remote shell commands.
head -c 209715201 > "$archive"
[[ $(wc -c < "$archive") -le 209715200 ]] || { echo 'Release exceeds 200 MiB'; exit 1; }
printf '%s  %s\n' "$digest" "$archive" | sha256sum -c -
"$php" "$shared/deployment/validate-archive.php" "$archive" "$commit"
release="$root/releases/$release_id"
mkdir -m 711 "$release"
tar --extract --gzip --file "$archive" --directory "$release" --no-same-owner --no-same-permissions
chmod -R u=rwX,go=rX "$release/backend" "$release/frontend"
ln -s "$shared/backend.env" "$release/backend/.env"
ln -s "$shared/backend-storage" "$release/backend/storage"
mkdir -p "$release/backend/bootstrap/cache" "$release/backend/resources/views"
chmod 750 "$release/backend/bootstrap/cache"
cd "$release/backend"
trap 'printf "Deployment preparation failed at line %s. See private log: %s\n" "$LINENO" "$shared/deployment/$release_id-prepare.log" >&2' ERR
# An archive carries no live credentials or cached config. Package discovery runs here.
"$php" artisan package:discover --no-interaction > "$shared/deployment/$release_id-prepare.log" 2>&1
pending=$("$php" "$shared/deployment/pending-migrations.php" "$release/backend")
if [[ "$pending" != 0 ]]; then
  if [[ ! -f "$shared/deployment/approved-migration-$commit" ]]; then
    echo "Schema changes require a reviewed backup and private approval marker for this commit. Release not activated." >&2
    exit 1
  fi
  if [[ ! -f "$shared/migration.env" ]]; then
    echo 'Pending migrations require a private shared/migration.env for the migration account. Release not activated.' >&2
    exit 1
  fi
  ln -s "$shared/migration.env" .env.migration
  # Bypass the runtime cache while using the dedicated migration credentials.
  APP_CONFIG_CACHE="$release/backend/bootstrap/cache/migration-unused.php" \
    "$php" artisan migrate --env=migration --force --no-interaction >> "$shared/deployment/$release_id-prepare.log" 2>&1
fi
"$php" artisan config:cache >> "$shared/deployment/$release_id-prepare.log" 2>&1
"$php" artisan route:cache >> "$shared/deployment/$release_id-prepare.log" 2>&1
"$php" artisan view:cache >> "$shared/deployment/$release_id-prepare.log" 2>&1
"$php" "$shared/deployment/check-release.php" "$release/backend"
# Hold the same outer lock as the staging scheduler during the release switch.
exec 8>"$shared/scheduler.lock"
/bin/flock -w 180 8
previous=$(readlink -f "$root/current")
[[ "$previous" == "$root/releases/"* ]] || { echo "Invalid previous release path"; exit 1; }
ln -s "$release" "$root/current.next"
mv -Tf "$root/current.next" "$root/current"
# Passenger's stable application root is intentionally retained from initial setup.
passenger_root="$root/releases/20261018-b14733f/frontend"
mkdir -p "$passenger_root/tmp"
touch "$passenger_root/tmp/restart.txt"
rollback() {
  ln -s "$previous" "$root/current.rollback"
  mv -Tf "$root/current.rollback" "$root/current"
  touch "$passenger_root/tmp/restart.txt"
  echo 'Health check failed: previous code release restored. Database migrations were NOT reversed.' >&2
}
trap 'rollback' ERR
for target in \
  https://staging-api.pickparcelbd.com/up \
  https://staging.pickparcelbd.com/login \
  https://staging.pickparcelbd.com/api/v1/config; do
  curl --fail --silent --show-error --retry 6 --retry-all-errors --retry-delay 5 --max-time 30 "$target" -o /dev/null
done
# Check the actual Next build identity, so a stale Passenger process cannot pass.
build_id=$(cat "$release/frontend/runtime/.next/BUILD_ID")
curl --fail --silent --show-error --retry 6 --retry-all-errors --retry-delay 5 --max-time 30 \
  "https://staging.pickparcelbd.com/_next/static/$build_id/_buildManifest.js" -o /dev/null
trap - ERR
printf '%s\n' "$release_id" > "$shared/last-successful-deployment"
echo "Staging deployed: $commit ($release_id)"
# Retain releases and uploaded archives for operator-reviewed cleanup/rollback.
