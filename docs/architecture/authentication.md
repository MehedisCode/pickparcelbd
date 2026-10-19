# Google signup and login

Updated: 18 October 2026 (Asia/Dhaka).

The owner selected Google-only authentication, preserving the original website's login method. Email/password and phone OTP authentication are outside the selected scope.

## Flow

1. Open `/login` and choose **Continue with Google**.
2. Laravel creates the OAuth state and stores a validated application return path in the session.
3. Google returns to `/auth/google/callback` through the frontend origin.
4. Socialite validates the OAuth state and exchanges the code. Only an identity with a verified email can continue.
5. The account is resolved using Google's stable subject ID. A new identity receives a customer account, a public ID and a zero wallet balance. Returning users retain their public ID, role, delivery profile and wallet.
6. Accounts needing contact/address details go to `/complete-profile`, retaining the intended destination. Completed accounts return to that destination, or their customer/operations/admin workspace.
7. Login regenerates the session. Logout invalidates it and regenerates the CSRF token.

Existing records must retain their Google subject IDs during migration. An email match alone does not link or merge an existing account, since it could transfer that account's role or financial access. Conflicting or unlinked records require deliberate identity reconciliation.

## Local configuration

The owner supplied a newly created local-development OAuth client. Its Client ID and Client Secret are now configured privately in the backend's ignored `.env`, replacing the previously reused legacy credentials. Outgoing login requests were checked against the new Client ID and the exact local callback. Credential values are not recorded in documentation or source control.

```env
FRONTEND_URL=http://127.0.0.1:3000
GOOGLE_CLIENT_ID=<private configuration>
GOOGLE_CLIENT_SECRET=<private configuration>
GOOGLE_REDIRECT_URI=http://127.0.0.1:3000/auth/google/callback
```

The environment must also have a persistent `APP_KEY`, working database session storage and appropriate cookie settings. After editing the environment, run `php artisan config:clear`. Use `127.0.0.1` consistently for this configuration.

Open the login page to start authentication. Opening the callback directly has no OAuth state or authorization code; it now returns to login with an explanation.

## Previous redirect mismatch and current verification

The owner reported **Error 400: redirect_uri_mismatch** with the previously configured OAuth client. A new local-development client has since been configured, and the app sends its Client ID with the callback shown above. Successful real sign-in and token exchange with this new client still require the owner to complete Google sign-in. If the mismatch recurs, check the new client’s Authorized redirect URIs using the steps below.

In [Google Cloud OAuth clients](https://console.cloud.google.com/auth/clients):

1. Select the project/client matching `GOOGLE_CLIENT_ID` in the private backend environment.
2. Open **Google Auth Platform → Clients → the Web application client**.
3. Add this exact entry under **Authorized redirect URIs**:

   ```text
   http://127.0.0.1:3000/auth/google/callback
   ```

4. Keep existing production callback entries. Do not replace or reset the live site's client secret to solve a redirect mismatch.
5. Save the client, then start a new login from `/login`. Allow time for Google's configuration change to propagate if it is not immediately reflected.

The scheme, hostname, port and path must match. An Authorized JavaScript origin entry does not substitute for an Authorized redirect URI. See [Google's redirect error documentation](https://developers.google.com/identity/protocols/oauth2/web-server#authorization-errors-redirect-uri-mismatch).

Cloud Console did not finish loading in the in-app browser, and the owner reported failure in their regular browser too. Host-level checks resolved and reached the console, static-content domain and Google account service; this does not prove every browser request succeeds. Try a private browser window or a different network/mobile hotspot, as described in [Google's console troubleshooting guide](https://docs.cloud.google.com/support/docs/troubleshoot-console-page-loading). No browser security protection or system network configuration was disabled.

## Failure handling

| Condition | App behavior |
| --- | --- |
| Missing configuration | Login displays temporary unavailability |
| Cancelled Google login | Returns to login with a cancellation message |
| Direct callback, absent state/code, invalid or expired state | Returns to login with instructions to start again |
| Unverified email | Rejects authentication with a clear message |
| Existing email belongs to another or unlinked identity | Rejects automatic linking and preserves existing account access |
| Provider request or account-write failure | Shows a generic failure; logs only the exception class, excluding provider messages/tokens |
| Unsafe return URL or authentication loop | Uses a safe internal workspace destination |
| Expired application session | Clears the frontend's signed-in identity and prompts another login |
| Stale CSRF token on a mutation | Refreshes the cookie and retries once; other mutation errors are not automatically replayed |

## Verification evidence and limits

- TypeScript, ESLint, PHP syntax/formatting and production build passed during this change.
- Temporary development checks used a separate SQLite database and substituted Google identities to verify new/repeated login, identity conflicts, email-only linking rejection, role/wallet preservation, session regeneration, profile return and logout.
- Actual Socialite state validation rejected an invalid state before any token exchange.
- Frontend helper checks covered safe return paths, role destinations, one CSRF refresh/retry, expired-session notification and bounded failure behavior.
- HTTP checks verified the configured outgoing callback/state and invalid/direct/cancelled callback redirects. The local browser visibly replaced the previous `InvalidStateException` page with the helpful login screen.
- These checks are not a committed automated application test suite, as requested. Real Google token exchange, successful real-account signup/login, staging cookies and Android/WebView login remain unverified until provider configuration and device checks are completed.

Local preview accounts remain a separate development feature, enabled only with local environment plus `PREVIEW_LOGIN=true`. They do not verify real Google authentication and cannot be enabled in production by that flag alone.

## cPanel staging preparation

The owner selected `https://staging.pickparcelbd.com` for Next.js and `https://staging-api.pickparcelbd.com` for Laravel in cPanel. Google credentials were transferred privately with permission, and the owner reported adding the staging callback. The hosted login reached Google’s account chooser with the correct callback. Owner-completed sign-in remains unverified. Preserve the current APP_KEY, Google credentials, and host-only session cookies through the Next.js proxy. See [manual deployment](../deployment/cpanel-staging.md).
