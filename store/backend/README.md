# Replacement for `/security-check`

`security-check.html` replaces the page currently served at
`https://gobax.010111902.workers.dev/security-check`.

**Deploy target:** the Cloudflare Worker that serves that route. Only the
backend team can deploy it.

## What was wrong with the old page

Its entire logic was:

```js
// Simulate security checks
setTimeout(function () {
  status.textContent = "Security check completed";
  window.parent.postMessage({ type: "SECURITY_CHECK", status: "secure" }, "*");
}, 1500);
```

A 1.5 second timer that checked nothing and then told the user, and the app,
that the device was secure. Apple rejects placeholder features like this under
Guideline 2.1 (App Completeness), and it misleads users regardless.

## What the new page does

1. Reads the challenge token from the URL (`?t=`, `?token=` or `?key=`).
2. Collects real client signals: user agent, platform, languages, timezone,
   screen and pixel ratio, hardware concurrency, device memory, touch points,
   WebGL renderer, plus automation tells (`navigator.webdriver`, headless
   user-agent markers, plugin count).
3. POSTs them with the token to **`/Login/api_security_verify`**.
4. Displays and reports whatever the **server** concluded. The page never
   decides for itself.
5. On network failure or a 15 second timeout it reports a real failure with a
   retry button, rather than passing.

## Endpoint you need to implement

`POST /Login/api_security_verify`

```json
{
  "token": "<challenge token from the login response>",
  "signals": { "userAgent": "...", "webdriver": false, "timezone": "Asia/Ho_Chi_Minh", "...": "..." }
}
```

Respond with a pass:

```json
{ "ok": true }
```

or a failure with a reason the user will see:

```json
{ "ok": false, "reason": "This device could not be verified." }
```

`{ "code": 1 }`, `{ "secure": true }` and `{ "status": "secure" }` are also
accepted as a pass, so it can match your existing response style.

The scoring rules are yours. The page's only job is to gather the evidence
honestly and report your verdict truthfully.

## Note on enforcement

For the check to be more than advisory, the login response that raises
`security_check` should withhold the session (no `user_id`, no profile) until
this endpoint has confirmed the token. Today the login response returns both at
once, so the gate is advisory only. See `../ios/security-check-contract.md`.
