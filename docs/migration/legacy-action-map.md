# Legacy action cross-reference

Static comparison completed 18 October 2026. These rows identify replacement entry points and deliberate redesigns. They do not certify identical output, historic-record compatibility, provider integration or every legacy report definition. Routes below are relative to `/api/v1` unless stated otherwise. The source locations refer to the supplied old directory.

## index.php

| Legacy action / line | Replacement |
| --- | --- |
| `update_user_location` · 1891 | POST /account/location; optional POST /account/reverse-geocode |
| `cash_memo_upload_image` · 1959 | POST /cash-memos/{id}/documents |
| `cash_memo_clear_images` · 1963 | DELETE /documents/{id} with role/owner checks |
| `post_news` · 2036 | PATCH /account news |
| `delete_news` · 2086 | PATCH /account news=null |
| `save_public_phone` · 2093 | PATCH /account public_phone |
| `toggle_phone_visibility` · 2105 | PATCH /account phone_public |
| `toggle_follow` · 2132 | POST /profiles/{id}/follow |
| `add_comment` · 2161 | POST /profiles/{id}/comments |
| `share_user` · 2181 | POST /profiles/{id}/share |
| `delete_public_order` · 2194 | DELETE /orders/{id}; per-party visibility |
| `mark_terms_daily_view` · 2237 | POST /account/terms; checkout/booking acknowledgement timestamp |
| `create_order` · 2251 | POST /orders/quote then POST /orders |
| `confirm_order` · 2317 | POST /orders/{id}/confirm |
| `cash_memo_send_to_pickparcel` · 2347 | POST /cash-memos/{id}/send |
| `direct_parcel_booking` · 2393 | POST /parcels |
| `parcel_update_weight` · 2502 | POST /parcels/{code}/weight |
| `parcel_assign_sender_batch` · 2545 | POST /parcels/assign |
| `parcel_sender_rider_list` · 2663 | GET /members |
| `parcel_sender_rider_otp_list` · 2739 | GET /parcels + participant-only GET /parcels/{code}/codes |
| `parcel_pickup_otp_preview` · 2793 | POST /parcels/pickup-batch with anchor parcel + OTP |
| `parcel_pickup_otp_accept` · 2892 | POST /parcels/pickup-batch with selected codes |
| `parcel_cancel_sender_rider` · 3028 | POST /parcels/cancel-assignments; atomic selected batch, or per-parcel cancellation |
| `parcel_cancel_sender_batch` · 3159 | POST /parcels/cancel-assignments; atomic selected batch, or per-parcel cancellation |
| `parcel_sender_group_details` · 3243 | GET /parcels + GET /parcels/{code}; sender-scoped details |
| `parcel_assign_self` · 3284 | POST /parcels/assign with the member’s own ID |
| `parcel_verify_pickup` · 3403 | POST /parcels/{code}/verify-pickup |
| `parcel_verify_delivery` · 3492 | POST /parcels/{code}/verify-delivery |
| `parcel_update_status` · 3576 | Explicit pickup-ready, verification, out-for-delivery and return actions; generic unsafe status writes removed |
| `parcel_send_message` · 3632 | POST /parcels/{code}/message; typed template text may be sent as body |
| `parcel_custody_toggle` · 3706 | POST /parcels/{code}/list; holder-owned pickup/custody organization without moving ownership |
| `parcel_return_request` · 3730 | POST /parcels/{code}/return-request |
| `parcel_return_accept` · 3806 | POST /parcels/{code}/return-accept |
| `parcel_transfer_create` · 3878 | POST /transfers |
| `parcel_transfer_preview` · 3942 | POST /transfers/preview using a bearer token |
| `parcel_transfer_accept` · 3986 | POST /transfers/accept with selected codes |
| `parcel_transfer_history` · 4065 | GET /transfers and parcel events |
| `parcel_transfer_batch_details` · 4080 | GET /transfers/{id} |
| `parcel_transfer_download` · 4080 | GET /transfers/{id}/export; CSV injection protection |
| `parcel_transfer_mark_collection_handed_over` · 4113 | POST /transfers/{id}/collection-handover |
| `parcel_transfer_partner_details` · 4146 | GET /transfers/{id}; scoped sender/receiver and parcel details |
| `fraud_check` · 4218 | GET /fraud-check; deliberately limited to the caller’s sent parcels |
| `block_buyer` · 4279 | POST /buyer-blocks/{id} |
| `unblock_buyer` · 4293 | DELETE /buyer-blocks/{id} |
| `seller_get_blocklist` · 4304 | GET /buyer-blocks |
| `user_chat_list` · 4318 | GET /conversations; paginated |
| `user_chat_messages` · 4330 | GET /conversations/{id}; cursor history |
| `user_chat_send` · 4343 | POST /conversations/{id} |
| `user_chat_delete_conversation` · 4353 | DELETE /conversations/{id}; me/everyone semantics |
| `user_chat_delete_message` · 4366 | DELETE /messages/{id}; sender-only shared deletion |
| `buyer_seller_chat_list` · 4384 | GET /conversations and order participant links |
| `buyer_seller_chat_messages` · 4408 | GET /conversations/{id}?order_id=... |
| `buyer_seller_chat_send` · 4426 | POST /conversations/{id} with order_id |
| `get_order_details` · 4445 | GET /orders/{id} |
| `mark_notifications_read` · 4471 | POST /notifications/read |

## superadmin.php

| Legacy action / line | Replacement |
| --- | --- |
| `save_commission_rules` · 374 | PUT /admin/commission-rules |
| `calculate_parcel_commission` · 386 | POST /admin/finance/{code}/calculate-commission |
| `set_user_verification` · 485 | PATCH /admin/users/{id} |
| `assign_role` · 520 | PATCH /admin/users/{id} |
| `credit_existing_member_wallet` · 552 | POST /admin/finance/{code}/recovery/repair-member-credit; existing paid settlement evidence required |
| `settle_commission` · 610 | POST /admin/settlements |
| `admin_financial_security_scan` · 695 | POST /admin/audits type=financial; normalized-ledger findings, not the legacy report schema |
| `settle_collection` · 782 | POST /admin/finance/{code}/receive-collection |
| `settle_return_collection` · 795 | POST /admin/finance/{code}/receive-return |
| `confirm_delivery_wallet` · 814 | POST /admin/finance/{code}/confirm-wallet |
| `admin_create_safety_snapshot` · 833 | POST /admin/recovery action=snapshot; custody-only restoration scope |
| `admin_recover_snapshot_custody` · 874 | POST /admin/recovery action=restore-custody; live eligibility and pending-transfer checks |
| `admin_final_financial_audit` · 931 | POST /admin/audits type=financial; normalized-ledger findings, not the legacy report schema |
| `admin_production_readiness_scan` · 977 | POST /admin/audits type=production_readiness plus build/schema/deployment checks; old step-specific fixture checks are not copied |
| `admin_production_step8a_scan` · 1038 | POST /admin/audits type=production_readiness plus build/schema/deployment checks; old step-specific fixture checks are not copied |
| `admin_production_preparation_scan` · 1126 | POST /admin/audits type=production_readiness plus build/schema/deployment checks; old step-specific fixture checks are not copied |
| `admin_full_end_to_end_financial_test` · 1284 | Not added: legacy E2E fixture creation/cleanup tooling; test cases deferred at the owner’s request |
| `prepare_step7a_e2e_test_data` · 1370 | Not added: legacy E2E fixture creation/cleanup tooling; test cases deferred at the owner’s request |
| `admin_step9_cleanup_preview` · 1522 | Not added: legacy E2E fixture creation/cleanup tooling; test cases deferred at the owner’s request |
| `admin_step9_cleanup_execute` · 1539 | Not added: legacy E2E fixture creation/cleanup tooling; test cases deferred at the owner’s request |
| `admin_final_system_audit` · 1581 | POST /admin/audits type=production_readiness plus build/schema/deployment checks; old step-specific fixture checks are not copied |
| `admin_delivery_money_scan` · 1610 | POST /admin/audits type=financial; normalized-ledger findings, not the legacy report schema |
| `admin_rebuild_missing_settlement` · 1637 | POST /admin/finance/{code}/recovery/reconcile-delivery; verifies delivery history and rejects conflicting paid history |
| `admin_return_security_repair` · 1656 | POST /admin/finance/{code}/recovery/repair-return-request; accepted return recovery also available |
| `admin_return_security_scan` · 1692 | POST /admin/audits type=returns; return evidence and safe recovery paths |
| `admin_member_performance_scan` · 1711 | POST /admin/audits type=member_accountability + GET /admin/users/{id}/report; detailed legacy metric definitions still need sign-off |
| `admin_member_accountability_scan` · 1779 | POST /admin/audits type=member_accountability + GET /admin/users/{id}/report; detailed legacy metric definitions still need sign-off |
| `admin_resolve_missing_custody` · 1832 | POST /admin/recovery action=controlled-transfer with explicit target/reason |
| `admin_clear_closed_custody` · 1834 | POST /admin/recovery action=clear-closed-custody |
| `admin_cancel_stuck_transfer` · 1836 | POST /admin/recovery action=cancel-transfer |
| `admin_safe_reassign_unpicked` · 1838 | POST /admin/recovery action=reassign |
| `admin_recover_inactive_custody` · 1868 | POST /admin/recovery action=controlled-transfer |
| `admin_controlled_transfer` · 1893 | POST /admin/recovery action=controlled-transfer |
| `admin_assign_parcel` · 1945 | POST /parcels/assign or admin/recovery action=reassign |
| `admin_step10_post_cleanup_verification` · 1964 | POST /admin/audits type=production_readiness plus build/schema/deployment checks; old step-specific fixture checks are not copied |

## ride-share.php

| Legacy action / line | Replacement |
| --- | --- |
| `location` · 59 | POST /account/location |
| `availability` · 67 | POST /rides/availability |
| `book` · 74 | POST /rides |
| `accept` · 106 | POST /rides/{id}/accept |
| `cancel` · 119 | POST /rides/{id}/cancel |
| `status` · 130 | GET /rides and GET /rides/requests; completion added |

## Other entry points

Google sign-in/callback, profile completion and logout use Laravel web-session routes. Product create/update/delete/upload use the products API; public products/profiles/tracking use explicit public endpoints. Presence and notification polling use account heartbeat and notifications. Public PHP navigation is adapted in `routes/compatibility.php` and Next.js rewrites; root query routes are handled by the home page. Legacy cash_memo is a public seller ID, while cash_memo_id identifies a specific memo; they are deliberately mapped separately.

The old member-management page is a read/report surface rather than its own POST action dispatcher. Replacement member lists, detail reports, parcel/financial tables and district filters need owner review against real operational reporting before full parity sign-off. Old report snapshots and migration-specific repair state cannot be represented by pretending a normalized-table scan is the same report.

## Intentional differences

- Generic status writes become explicit guarded transitions; pickup readiness is separate from physical pickup verification.
- List organization changes a custody bucket without changing the holder.
- Fraud history is restricted to the seller’s own sent parcels.
- Transfer previews require the secure token rather than allowing a guessable transfer ID to reveal a live token.
- Existing member-credit recovery requires a paid settlement item and remains idempotent; it never accepts an arbitrary amount.
- Test/fixture mutation and cleanup endpoints are omitted as requested. Production migration must account for any such records in the old snapshot separately.
- Terms acknowledgement stores the latest timestamp rather than a separate legacy daily-view table. Checkout and direct booking creation require explicit acknowledgement.
