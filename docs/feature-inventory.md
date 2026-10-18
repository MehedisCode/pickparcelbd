# Feature inventory and parity checklist

Status: the feature families below now have replacement code in the local application, except where [implementation status](implementation-status.md) identifies remaining work. This is the required parity inventory, not proof that every legacy action has been verified. Specialist recovery/reporting tools, production data import and device integrations require further comparison.

Legacy file paths below are relative to `PickparcelBD_old`. References identify inspected source areas, not proof that a workflow works in production. Each family must be expanded into individual actions and acceptance cases during discovery.

| ID | Feature family | Legacy evidence | Required parity |
| --- | --- | --- | --- |
| ACC-01 | Google authentication | `google-login.php`, `google-callback.php`, `logout.php` | OAuth state, account lookup/linking, profile refresh, logout and safe return navigation |
| ACC-02 | Profile completion and account details | `complete-profile.php`, `index.php` | Contact/address fields, coordinates, required profile checks and public/private fields |
| ACC-03 | Public identities and verification | `public-profile.php`, `user.php`, `index.php` | Existing public IDs, verification/member badges and profile links |
| ACC-04 | Phone privacy | `index.php`: `save_public_phone`, `toggle_phone_visibility` | Public alternative phone, visibility preferences and consistent display rules |
| MKT-01 | Product management | `index.php` | Create/edit/delete, listing/search, descriptions, images/media and ownership checks |
| MKT-02 | Product pricing and discounts | `index.php`: product discount schema and price helpers | Existing price/discount precedence, validation and amount rounding |
| MKT-03 | Public product and seller pages | `product.php`, `public-profile.php`, public modes in `index.php` | Anonymous access, sharing, pagination/search where present and buy/login navigation |
| MED-01 | External media | `index.php`, `product.php`, `public-profile.php` | YouTube, TikTok, Facebook and Drive handling, fallbacks and allowed URL behavior |
| SOC-01 | Social activity | `index.php`: `post_news`, `delete_news`, `toggle_follow`, `add_comment`, `share_user` | Existing news, follows, comments, sharing and counters |
| ORD-01 | Order lifecycle | `index.php`: `create_order`, `confirm_order`, `delete_public_order`, `get_order_details` | Buyer/seller permissions, confirmation, visibility and deletion semantics |
| DOC-01 | Cash memos | `index.php`: cash memo handlers | Existing memo creation/display, image roles, printing and status changes |
| DOC-02 | Payment proofs and uploads | `index.php`: `cash_memo_upload_image`, `cash_memo_clear_images` | Role-based upload/delete, MIME/size checks and protected retrieval |
| ORD-02 | Order to parcel conversion | `index.php`: `cash_memo_send_to_pickparcel` | Eligibility, duplicate handling, parcel creation and notifications |
| PAR-01 | Direct parcel booking | `index.php`: `direct_parcel_booking` | Sender/recipient fields, weight, charges, COD and tracking code |
| PAR-02 | Public tracking | public tracking handler and tracking events in `index.php` | Code parsing including supported legacy forms, status timeline and allowed disclosures |
| PAR-03 | Weight and delivery charges | `index.php`: `parcel_update_weight` | Who may update, calculation rules and related amount changes |
| ASN-01 | Sender rider assignment | `parcel_assign_sender_batch`, rider list/OTP list handlers | Eligible members, batch selection, assignment and notifications |
| ASN-02 | Assignment cancellation | `parcel_cancel_sender_rider`, `parcel_cancel_sender_batch` | Allowed stages, cleanup and resulting operational state |
| ASN-03 | Member self-assignment | `parcel_assign_self`, automatic batch assignment helper | Eligibility, duplicates and conflict handling |
| VER-01 | Pickup verification | `parcel_pickup_otp_preview`, `parcel_pickup_otp_accept`, `parcel_verify_pickup` | Existing code flow, authorized visibility, validation and replay handling |
| VER-02 | Delivery verification | `parcel_verify_delivery` and delivery authentication helpers | Confirmation method, participant checks and financial/parcel effects |
| PAR-04 | Status updates and parcel messages | `parcel_update_status`, `parcel_send_message` | Allowed transitions, actor checks, tracking messages and history |
| CUS-01 | Parcel custody | `parcel_custody_toggle`, custody tables/helpers | Holder identity, list visibility and safe updates |
| TRF-01 | Transfer creation and preview | `parcel_transfer_create`, `parcel_transfer_preview` | QR token, selected items, eligibility, expiry and preview disclosure |
| TRF-02 | Transfer acceptance | `parcel_transfer_accept` | Selected subset receipt, custody changes, unreceived items and replay protection |
| TRF-03 | Transfer history and export | history, batch details/download and partner details handlers | Accurate history, CSV values, printable/QR documents and access scope |
| TRF-04 | Transfer expiry | `pickparcelCleanupExpiredTransfers` | Expired pending batch cancellation and restoration of appropriate state |
| RET-01 | Returns | `parcel_return_request`, `parcel_return_accept` | Request/accept, custody, return history and associated financial state |
| COL-01 | Cash collection handovers | `parcel_transfer_mark_collection_handed_over` | Payer/payee, covered parcels, amounts, receipts and repeat handling |
| FIN-01 | Commission rules/calculation | `superadmin.php`: `save_commission_rules`, `calculate_parcel_commission` | Eligibility, rates, responsible members, participants and rounding |
| FIN-02 | Commission settlements | `settle_commission`, `credit_existing_member_wallet` | Member/company records, existing credit reconciliation and duplicate prevention |
| FIN-03 | Collections and wallet confirmation | `settle_collection`, `settle_return_collection`, `confirm_delivery_wallet` | COD/return collection state, correct wallet owner and district scope |
| FIN-04 | Wallet and financial views | `index.php`, `superadmin.php`, `rider_agent_management.php` | Transaction history, balances, receivables/payables and company totals |
| MSG-01 | User messaging | `user_chat_list/messages/send` handlers | Conversation order, authorized participants, read behavior and unread counts |
| MSG-02 | Order-linked messaging | `buyer_seller_chat_list/messages/send` handlers | Order membership, buyer/seller roles and block rules |
| MSG-03 | Message deletion | user chat delete message/conversation handlers | Delete-for-me vs supported shared deletion behavior and history visibility |
| NTF-01 | In-app notifications | notification heartbeat and `mark_notifications_read` | Recipient scope, unread counts, links and mark-read behavior |
| NTF-02 | Android FCM | `register-fcm-token.php`, configured private cron worker | Session/origin rules, token lifecycle, recipients, payloads, retries and deduplication |
| PRE-01 | Presence | `pp_presence` handlers in `index.php` | Heartbeats, stale expiry, offline/logout state and visible status |
| LOC-01 | Location and reverse geocoding | `update_user_location`, geocoding helpers | Coordinate validation, accuracy, derived locality and update thresholds |
| RID-01 | Driver state | `ride-share.php`: location, availability, driver state/count | Available/offline state, location freshness and count semantics |
| RID-02 | Ride requests and matching | `ride-share.php`: book, driver requests | Existing distance boundary (3 km in inspected code), notification rules and repeat booking behavior |
| RID-03 | Ride acceptance/cancellation | `ride-share.php`: accept, cancel, status | Single accepting driver, participant-only cancellation, history and notifications |
| BLK-01 | Buyer blocking | `block_buyer`, `unblock_buyer`, `seller_get_blocklist` | Seller scope and effects on orders/messages |
| FRD-01 | Fraud checking | `fraud_check` | Existing input matching, historical outcomes, visibility and query limits |
| ADM-01 | Member administration | `superadmin.php`: assign role and set verification | Role changes, district constraints, verification and audit records |
| ADM-02 | Rider/agent dashboard | `rider_agent_management.php` | Filters, detailed profile/categories, operational and financial totals |
| ADM-03 | Admin parcel intervention | `superadmin.php`: assign/reassign, controlled transfer, custody recovery | Preconditions, authorization, corrective effects and audit trail |
| ADM-04 | Financial/operational scans | `superadmin.php`: security, delivery-money, member and return scans | Finding definitions, severity, scope and resolution actions |
| ADM-05 | Recovery and safety snapshots | `superadmin.php`: snapshot, recover, rebuild settlement and repair handlers | Snapshot coverage, constrained recovery and repeat handling |
| ADM-06 | Readiness/audit/test tooling | `superadmin.php`: final audits, readiness/preparation scans, cleanup and E2E fixture/test actions | Separate production-safe checks from fixture/mutation tools; preserve useful reports with explicit permissions |
| INF-01 | Terms and support | `terms-and-conditions.php`, `help_support.php`, daily terms handler | Content, links and acknowledgement records |
| CMP-01 | Existing links and mobile entry points | all public PHP pages, query-based routes and APK references | Redirect/compatibility map, public identifiers and WebView behavior |

## Per-action tracking template

For each discovered action, record:

1. Inventory ID, legacy file/line and trigger.
2. Actor, resource ownership, role and district constraints.
3. Inputs, validation, success response and failure behavior.
4. Tables/files changed and transaction boundary.
5. Status transition, money calculation and notification effects.
6. Proposed API, service, screen and compatibility endpoint.
7. Automated acceptance cases and manual/device checks.
8. Status: discovered, specified, implemented, verified, or deferred with explicit scope approval.

An existing enum value, helper name or table is a discovery signal. It does not establish a complete user-facing feature without tracing its callers.
