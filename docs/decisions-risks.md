# Decisions, findings and unresolved questions

Planning baseline: 18 October 2026, Asia/Dhaka. Hosting observations are a point-in-time record, not ongoing monitoring.

## Confirmed observations

| Finding | Evidence/limit |
| --- | --- |
| Existing app is procedural PHP with mixed presentation/business logic | Supplied PHP files; `index.php` approximately 17,000 lines |
| Relational database access uses PDO/MySQL syntax | Source inspection; actual schema not inspected |
| Parcel, finance and ride operations use transactions/row locks | Source inspection; concurrency behavior not runtime tested |
| Chat/presence/notifications use polling | Open chat approximately 2.5 seconds; presence and unread badge approximately 10 seconds in inspected code |
| cPanel package is `PH 5GB HOST` | Server Information |
| Account physical memory limit is 1 GB | Resource Usage |
| CPU SPEED limit is 100% | Resource Usage; not ownership of the server's 32 CPUs |
| Entry processes 20; process count limit 100 | Resource Usage; neither value is a registered-user capacity estimate |
| I/O limit 20 MB/s; IOPS 4096 | Resource Usage |
| Disk allowance approximately 5 GB | Dashboard; database usage may have separate accounting |
| MariaDB 11.4.13 | Server Information |
| Domain inherits PHP 8.2; 8.3/8.4 selectable | MultiPHP Manager |
| Node 20/22/24 choices visible | Node.js selector; no Node apps configured at inspection |
| Browser terminal usable, Git and cron interfaces available | Read-only cPanel inspection |
| Notification cron configured every minute | References a private FCM worker absent from local source; execution success not established |
| No cPanel-managed Git repositories configured | Git Version Control list; does not prove absence of every possible external deployment setup |
| No recent resource issues reported at inspection | Dashboard past-24-hour report; not a load benchmark |

## Proposed decisions

| Decision | Rationale |
| --- | --- |
| Next.js/TypeScript frontend + Laravel API | Preserve PHP business knowledge while improving UI and backend structure |
| Retain MariaDB initially | Avoid unnecessary database technology conversion |
| One repository, two deployable applications | Shared planning and coordinated releases with clear responsibilities |
| Laravel services own financial/custody mutations | One authoritative implementation for critical rules |
| Separate Next.js hosting initially | Preserve cPanel's limited memory and simplify Next.js runtime support |
| External CI builds/tests | Keep build workloads off shared production hosting |
| Preserve polling initially when adequate | Avoid requiring unverified WebSocket infrastructure for parity |
| Incremental, verified migration | Reduce cutover risk and expose gaps before replacing production |

These are planning recommendations. Final host/provider, budget and exact framework versions remain to be selected during implementation setup.

## Open items and handling

| Item | Why it matters | Next action |
| --- | --- | --- |
| Actual database schema/history | Correct model mapping and data preservation | Inspect schema and reconcile representative workflows |
| Complete source/action map | Prevent missing less visible features | Expand inventory to every handler and route |
| Private FCM worker | Delivery semantics and duplicate prevention | Read worker and document queue/token behavior |
| Android source/client contract | May block native changes | Inspect actual client behavior and obtain source if needed |
| PHP extensions/CLI version/Composer | Web PHP selection alone is insufficient | Verify deployment prerequisites without changing production |
| External SSH/SFTP access | Browser terminal does not prove CI connectivity | Verify transport before configuring deployment credentials |
| Persistent workers/Redis/WebSockets | Not established by cPanel tools | Confirm provider support only if needed; use bounded cron work initially |
| Next.js provider/hostnames | Sessions, latency, runtime and cost | Choose deployment arrangement and test cookie/server-rendering flows |
| Historical money discrepancies | Framework migration cannot certify balances | Produce a discrepancy report and explicit correction plan |
| Timezone semantics | Naive conversion can shift history | Inspect DATETIME/TIMESTAMP conventions first |
| Data growth/concurrency target | A quota alone does not predict capacity | Gather expected usage and stage a realistic workload |
| Visual design scope | Parity does not specify redesign depth | Preserve familiar workflows; decide visual changes before detailed UI work |
| Ride completion | Enum contains completion but UI behavior not established | Trace callers and confirm intended scope |
| Retention/deletion | Message/proof/audit history has different needs | Document existing semantics and desired retention |

## Main implementation risks

- A visually complete screen can hide missing permission, financial or failure behavior: require per-action acceptance evidence.
- Simultaneous legacy/new writes can diverge balances and custody: migrate ownership per workflow and control cutover writes.
- Directly copying local uploads into public storage can expose private documents: map visibility before migration.
- Treating current schema helpers as a clean schema can omit old columns/constraints: inspect the database itself.
- Cron may provide minute-level dispatch rather than immediate execution: measure acceptable notification/expiry delays.
- A database restore after new live transactions may lose legitimate activity: evaluate reconciliation/forward repair rather than assuming restore is harmless.
