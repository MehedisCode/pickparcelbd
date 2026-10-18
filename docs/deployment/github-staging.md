# GitHub staging deployment

Status (18 October 2026): **workflow and server scripts prepared locally; automatic deployment is not enabled or verified**. Current staging remains on its manually activated release. No deployment key, repository deployment secrets, or remote `staging` branch has been provisioned by this setup yet.

## Intended flow

Push the frontend/backend monorepo to `staging`. GitHub Actions checks and builds Next.js on Node 24, prepares PHP 8.4 production dependencies, and creates one secret-free archive. A restricted SSH key streams the archive to a private receiver on cPanel. The receiver validates its digest, paths, types, size and commit metadata, prepares a new release, checks Laravel privately, switches the `current` symlink, restarts only staging Passenger, and checks HTTPS plus the Next build ID. Failure after the switch restores the previous code pointer. Database migrations are never automatically reversed.

Production `public_html`, its database and existing FCM cron are outside the receiver's target paths. The same cPanel account owns production and staging, so account-level isolation is not available: trusted deployed application code still runs under `kinboame`.

## Blocker discovered directly in cPanel

- cPanel exposes **SSH Access → Manage SSH Keys**, with no keys installed.
- Terminal reports server hostname `aberi.us.svlogins.com`.
- Port 22 did not provide an SSH host key when checked against the staging hostname and server hostname. This does not establish that SSH is disabled; the port may differ or traffic may be filtered.
- The jailed account cannot read `/etc/ssh/sshd_config`, does not expose SSH host public keys, and has neither `ss` nor `netstat`. A later read of `/proc/net/tcp` exposed listening ports, but it did not identify which service is SSH. A candidate on port 22282 timed out from outside; no SSH banner or host key was confirmed. Do not treat 22282 as a verified SSH port.
- Obtain the SSH hostname, port, host-key fingerprint, and confirmation of GitHub-hosted runner connectivity from the hosting provider. Do not port-scan or bypass host-key verification.

## Files

| File | Role |
| --- | --- |
| `.github/workflows/staging.yml` | Build on pushes to `staging`; deploy only when repository variable STAGING_DEPLOY_ENABLED is `true` |
| `scripts/deployment/package-staging.sh` | Bundle standalone Next and production Laravel dependencies without credentials/storage |
| `scripts/deployment/receive-staging.sh` | Restricted SSH receiver and atomic release switch |
| `scripts/deployment/validate-archive.php` | Validate archive before extraction |
| `scripts/deployment/pending-migrations.php` | Compare source migrations with staging's migration history |
| `scripts/deployment/check-release.php` | Private release/configuration readiness checks |
| `scripts/deployment/bootstrap-staging.php` | One-time stable routing through `current`, preserving the initial release as a baseline |

No persistent application test cases were added. Shell/PHP syntax, workflow YAML parsing, and a real 26 MB archive packaging/validation smoke check passed locally using the previously built staging artifacts. A server deployment and rollback still require verification before enabling the pipeline.

## One-time setup after transport is confirmed

1. Verify the SSH host fingerprint through a trusted hosting support/dashboard source; pin the exact known_hosts entry, including `[hostname]:port` when necessary.
2. Install the receiver and PHP helpers privately under `/home/kinboame/pickparcel-staging/shared/deployment`, mode 700 for the directory and scripts. Never install receiver scripts beneath a document root.
3. Generate a dedicated Ed25519 deployment key locally. After explicit authorization, append its public key to `~/.ssh/authorized_keys` using a forced command and no forwarding/PTY, e.g. `restrict,command="/bin/bash /home/kinboame/pickparcel-staging/shared/deployment/receive-staging.sh" ssh-ed25519 PUBLIC_KEY pickparcel-staging-actions`. Preserve existing keys. The private key goes only into the repository's Actions secret, never Git or chat.
4. Run `bootstrap-staging.php` once in cPanel Terminal. It preserves a sibling baseline release before replacing the original physical API entry point, avoiding a recursive `current` wrapper. The original cPanel physical document roots and Node application registration stay in place. The original `20261018-b14733f` anchor and `baseline-before-cicd` must not be removed by release cleanup.
5. Set repository Actions secrets `STAGING_SSH_KEY` and `STAGING_KNOWN_HOSTS`; variables `STAGING_SSH_HOST` and `STAGING_SSH_PORT`. The SSH account is fixed to `kinboame` in the workflow. Repository secrets support private repositories without requiring GitHub deployment environments. Access should be limited to trusted maintainers; they can change workflow code that uses these credentials.
6. Publish the reviewed workflow/source to a `staging` branch, then set repository variable `STAGING_DEPLOY_ENABLED=true`. A push or manual dispatch from that branch builds and deploys. The existing CI workflow also checks the branch independently; deployment runs its own required checks and does not depend on a separate workflow race.
7. Watch a real run, confirm the server's release marker/Next build identity, and check main-site preservation, staging sessions, CSRF and owner-completed Google login. Until that passes, do not claim automatic deployment works.

## Database changes

The running app keeps its existing private `shared/backend.env` using `kinboame_pp_stg_app`. If source has pending migrations, the receiver requires an operator-created private `shared/deployment/approved-migration-COMMIT_SHA` marker after reviewing a backup and the migration changes. It also requires `shared/migration.env` containing the same staging configuration but the separate `kinboame_pp_stg_mig` username/password. The owner must enter that password privately; do not commit it or give runtime users DDL rights. The migration process uses `.env.migration` and bypasses runtime configuration cache. Only `migrate --force` is allowed; no seeding, destructive refresh, or automatic down migrations.

Use backward-compatible additive migrations: migrations run before the code switch while old requests may still be served. A failed code health check does not undo committed schema changes. Take and verify a private database backup before schema-changing deployments; the receiver does not yet automate backup/restore. Until a backup process is configured and verified, keep schema-changing deployment approval manual.

## Operations

- Builds run in GitHub, not on the 1 GB shared host.
- GitHub concurrency prevents overlapping workflows, and the receiver uses a server lock. The release switch also waits for the staging scheduler's outer lock.
- Deployments retain old releases/archives. Monitor the hosting account's 4.88 GB quota and clean up reviewed inactive releases manually; automatic deletion is intentionally absent.
- Private preparation logs live in `shared/deployment/`; inspect them on cPanel if a deployment fails. Do not paste credential-bearing logs into chat.
- Rollback changes code pointers only. To roll back manually, choose a known-good non-anchor release, atomically replace `current`, then touch the original anchor's `frontend/tmp/restart.txt` and verify health.
- Disable new automatic deployments by setting `STAGING_DEPLOY_ENABLED=false`; this does not stop the currently running staging website.

References: [GitHub deployments](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/control-deployments), [cPanel SSH Access](https://docs.cpanel.net/cpanel/security/ssh-access/).
