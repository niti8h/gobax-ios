# Conditional security check — API contract

For Nguyen. Answers "should I send a key for security required from the backend?"

**Yes — send a challenge token. But the server, not the app, decides whether the
check passed.**

---

## The rule that matters

The app must never be able to grant itself a session. If the backend returns the
user's session alongside "security required", or trusts a `secure: true` that the
client sends back, then anyone using a modified client skips the check entirely
and the whole feature is decorative.

So: **no session data is returned until the server has independently recorded
that the challenge was satisfied.**

## Flow

### 1. Login attempt

`POST /Login/api_check_login` — `account`, `password` (unchanged).

Backend validates the credentials **first**. If they are wrong, return the normal
error; never issue a challenge for a bad password.

If credentials are good and your risk logic wants a check:

```json
{
  "code": 2,
  "info": "Security verification required",
  "security_check": {
    "required": true,
    "url": "https://gobax.010111902.workers.dev/security-check?t=CHALLENGE",
    "expires_in": 300
  }
}
```

`code: 2` = new "challenge required" state. Note what is **absent**: no
`user_id`, no profile, no session. Nothing usable.

If no check is needed, return `code: 1` with the profile exactly as today. The
app is unchanged for the majority of logins.

### 2. CHALLENGE token

Generated server-side, and:

- random, >=128 bits, unguessable
- **single use** — burned on first successful verification
- **short TTL** — 5 minutes is plenty
- **bound to that account and that login attempt**, so a token issued for user A
  can never complete a login for user B
- stored server-side with a status: `issued` -> `satisfied` / `failed` / `expired`

### 3. The check page

The app opens that exact URL in the WebView. The page runs your real risk
logic — whatever you actually want to assess.

When it passes, the page calls **your backend** to mark the challenge
`satisfied`, and only then signals the app:

```js
window.parent.postMessage(
  { type: "SECURITY_CHECK", status: "secure", token: CHALLENGE },
  "https://gobax.010111902.workers.dev"
);
```

Two things to keep right:

- The page must reach a **real verdict**. The old page ran
  `setTimeout(..., 1500)` and then always said secure — that is what Apple's
  guideline 2.1 calls placeholder functionality, and it is the one thing here
  that genuinely risks a rejection.
- On failure, mark the challenge `failed` and post `status: "failed"` with a
  reason. The app will show it.

### 4. Completing the login

The app re-posts to `api_check_login` with `account`, `password`, and
`security_token=CHALLENGE`.

The backend looks the token up **in its own store**. Only if it is `satisfied`,
unexpired, unused and bound to this account does it burn the token and return
`code: 1` with the profile. The `status: "secure"` the client sent is ignored
entirely — it is a UI hint, never the authority.

## App Review

- Rare step-up verification is normal and Apple is fine with it.
- **Exempt the reviewer's demo account (`test@test.com`) from the check, or
  guarantee it always passes.** A reviewer stuck behind a security screen they
  cannot clear is an immediate 2.1 rejection. This is the single biggest risk in
  the whole feature.
- The check must never be the first thing a new user sees with no way past it.
- We will describe the behaviour in the App Review notes.

## Suggested sequencing

Ship 1.0 without the check to clear the current "Information Needed" review,
then land this in 1.0.1 once the backend side is ready. Adding a new gated login
path to the build that is trying to answer "help us understand your app" invites
a second round.

## What I need to build the app side

1. The exact field names and the `code` value for "challenge required"
2. Whether the token rides in the URL query, or is posted to the page
3. The failure payload shape
4. Confirmation that the demo account is exempt
