# Mobile and legacy compatibility plan

## Confirmed evidence

The supplied directory contains `PickParcelBD.apk`, but no Android source. `register-fcm-token.php` accepts JSON tokens from an Android WebView, requires a website session and checks an exact HTTPS origin. cPanel cron references a private FCM worker every minute. The worker was inspected read-only on 18 October 2026. It joins active user tokens to unsent notifications, selects at most 100 pairs, records successful deliveries, and disables unregistered tokens. It sends data-only Android messages with HIGH priority and string notification_id, title, body and sender_image fields. The new sender preserves those fields and adds type/url.

## Android discovery

- Determine whether the APK wraps the website, calls independent APIs, or does both.
- Identify start URLs, hardcoded PHP endpoints, JavaScript bridges, user agent handling and external browser behavior.
- Test Google login redirects, cookie persistence, logout and return navigation on a representative device.
- Identify how device tokens are supplied, refreshed, associated with accounts and disabled.
- Check notification payload/deep-link expectations and tap behavior.
- Check geolocation permissions, camera/QR scanning, file selection, downloads, print/share and browser-back behavior.
- Obtain Android source when a client change is required; do not assume changes can be made from the APK alone.

## Public link compatibility map

| Legacy entry point | Proposed handling |
| --- | --- |
| `product.php?id=...` and product query URLs | Resolve existing product identifier to its new public product route |
| `public-profile.php?id=PP...` and `user.php` links | Preserve public user identifier and map to the seller/profile route |
| Public parcel tracking query URLs | Accept supported legacy formats and resolve to the tracking route |
| `google-login.php` and OAuth callback | Preserve required entry behavior or introduce a documented redirect; update provider callbacks only during authorized deployment |
| `complete-profile.php` and logout links | Map to replacement profile/session flows |
| `register-fcm-token.php` | Preserve an adapter if the current client needs this exact endpoint and response format |
| `ride-share.php` | Map browser navigation; retain compatible API behavior only if a client depends on it |
| Help, terms and APK download links | Preserve working destinations and document versions |
| Existing upload paths | Retain mapped public URLs where appropriate; protect private documents |

This is a mapping checklist. The exact query parameter combinations and response contracts require action-level tracing before redirects are implemented.

Redirects must preserve identifiers and safe return parameters. Use a compatibility controller for old API requests rather than redirecting POST requests and accidentally changing method/body semantics.

## FCM transition

Inspect the worker's selection rules, delivery keys, deduplication, token invalidation and retry/logging behavior. Preserve recipient selection and payload fields needed by existing clients. Prevent old and new workers from sending the same notification during cutover.

Use staging-controlled recipients/devices. Do not send migration or test notifications to production users. Store service credentials outside source control and outside public directories.

## Session transition

Plan whether users reauthenticate at cutover. Legacy PHP sessions and Laravel sessions are separate formats and may share cookie names unless configured deliberately. Test logout, multiple tabs, account switching and WebView persistence. A browser migration success does not establish Android compatibility.

## Acceptance evidence

Record device/app version, tested flow, expected result and outcome for login, token registration, notification reception/tap, location, QR, uploads/downloads and legacy links. Identify any required APK release before claiming full mobile parity.

## Implemented adapters

The replacement includes the exact `/register-fcm-token.php` JSON entry point with a web session, strict configured Origin check, rate limit and original success/message response. This endpoint alone uses the legacy Origin-based CSRF contract; ordinary API writes require XSRF protection. The frontend proxies PHP compatibility URLs to Laravel. Google login/callback entry points, profile, product, ride, support, terms and administrative entry pages have redirects. Root product/seller/tracking/cash-memo query links have Next.js routing adapters. Logout navigation leads to the authenticated settings flow; session termination uses POST.

These adapters do not establish APK compatibility. Legacy PHP sessions are not imported and users will reauthenticate. The existing APK is copied unchanged to the public download path. Real device testing and exact deep-link behavior remain pending.
