# GoBAX — Reply to App Review (Guideline 2.1, Information Needed)

Submission: 9ae434e0-3c12-455c-b216-f146b6ea15f5 · App ID 6812314223 · com.gobax.app

---

## 1. Screen recording

*(Attach the recording — see the capture checklist at the bottom of this file.)*

## 2. Purpose of the app and target audience

GoBAX is a cryptocurrency **education** app. It teaches newcomers the vocabulary
and safety practices of blockchain, Web3 and DeFi before they interact with any
real financial product.

**Problem it solves.** Newcomers to crypto — particularly in Vietnam, our primary
market — typically learn from unmoderated social media, where scams and
misinformation are common. There is little structured, beginner-level material
in Vietnamese that teaches the vocabulary and the security practices first.

**Value provided.** Curated reading, a plain-language glossary, security guidance
on common scams and wallet hygiene, and interactive quizzes that check
comprehension.

**Target audience.** Adults new to cryptocurrency, primarily Vietnamese-speaking.
Rated 17+ because the subject matter concerns financial risk.

**What the app explicitly does NOT do.** No trading or exchange. No wallet, no
private-key handling, no custody of assets. No deposits, withdrawals or
transfers. No payments or in-app purchases. No financial, investment or trading
advice. No price quotes presented as actionable data. The app is informational
and educational only.

**About "GOBX points".** These are an in-app score for completing quizzes. They
are **not a cryptocurrency, not a token, and have no monetary value**. They
cannot be bought, sold, withdrawn, transferred or exchanged for anything, inside
or outside the app. They exist only to track learning progress.

## 3. Setting up and accessing the main features

The app opens on the login screen. A four-digit verification code is shown on
screen and must be typed into the code field — this is a local anti-automation
check, not an SMS or email code.

**Demo account**
- Username: `test@test.com`
- Password: `11223344`

There is only one account type — no separate roles or tiers. **Guest mode** is
also available from the login screen ("Continue as guest") and reaches all
educational content without an account.

Once signed in, the bottom tab bar gives access to all four areas:

| Tab | What it does |
|---|---|
| **Home** | Dashboard with learning progress and entry points to the other sections |
| **Articles** | Curated cryptocurrency news; each item opens the original publisher's page |
| **Quiz** | Multiple-choice questions on a 20-second timer; awards GOBX points |
| **Settings** | Profile, language switch (Vietnamese/English), log out, **Delete Account** |

**Account registration** — from the login screen, "Register", using either an
email address or a phone number, plus a password. An invite code field is
optional and may be left blank.

**Account deletion** — Settings → **Delete Account**. A confirmation dialog
appears; confirming deletes the account server-side and returns the app to the
login screen. No sample files are needed anywhere in the app.

## 4. External services, tools and platforms

| Service | Purpose |
|---|---|
| **Cloudflare Workers** (`gobax.010111902.workers.dev`) | First-party backend: account registration, login, password reset and account deletion |
| **Cloudflare Workers** (`gobax.099909.workers.dev`) | First-party static pages: privacy policy, terms, support |
| **Hacker News Search API** (`hn.algolia.com`, operated by Algolia) | Public, read-only, unauthenticated feed supplying the headlines in the Articles tab |
| **Expo / EAS** (Expo, an Anthropic-unaffiliated third party) | React Native framework and build service used to compile the app |
| **Apple Keychain** via `expo-secure-store` | Local encrypted storage of the user's session on device |

No payment processors. No advertising or analytics SDKs. No AI or machine-
learning services. No data brokers. No third-party authentication providers —
sign-in is handled entirely by our own backend.

**On the Articles tab.** Headlines come from the public Hacker News search API.
The app displays the title, author attribution and a link out to the original
publisher; it never reproduces publisher article text. Users cannot post,
comment on, or upload content of any kind, so the app contains no
user-generated content and no social features.

## 5. Regional differences

**The app functions identically in all regions.** There are no region-locked
features, no geo-gating, and no regionally varying content.

The interface ships in Vietnamese and English, switchable at any time from
Settings. Vietnamese is the default because Vietnam is our primary market. The
Articles feed is the same worldwide — it is not filtered by country.

## 6. Regulated industry and third-party material

**GoBAX does not operate in a regulated capacity.** It is not a money
transmitter, exchange, broker, custodian or financial adviser, and provides no
regulated financial service. It holds no customer funds and executes no
transactions, so no financial licence applies to it.

All educational content — the glossary, security guidance and quiz questions —
is original material written by our team.

The only third-party material is the Hacker News headline feed, used through
Algolia's public API under its published terms. The app links to original
publishers rather than reproducing their articles.

---

## Capture checklist for the screen recording

Record on a **physical iPhone** running the current iOS (not the Simulator -
Apple asks for a real device). Single continuous take, portrait. Install
**build 5** from TestFlight, not build 2.

### Do NOT delete test@test.com on camera

`test@test.com` is the account Apple's reviewer signs in with. Account
deletion now genuinely deletes, so deleting it during the recording would
leave the reviewer unable to log in at all - an instant rejection.

Register a throwaway account and delete **that** one instead.

### Order

1. Start on the Home Screen and **tap the GoBAX icon** - the recording must begin with the launch.
2. **Register a new account**, e.g. `demo18sep@test.com` with any password. Type the four-digit code shown on screen, submit, land in the app.
3. Visit **each tab**: Home, Articles (open one article), Quiz (answer at least one question, show the points), Settings.
4. **Log out** from Settings.
5. **Log in as `test@test.com` / `11223344`** - show the reviewer's account working. Browse briefly.
6. **Log out** again.
7. **Log back in as the throwaway account** from step 2.
8. **Settings -> Delete Account**, confirm the dialog, show the app returning to login.
9. **Try logging in with the deleted account** - it should be refused. This is the proof Apple wants that deletion is real.
10. Optionally show **Continue as guest** from the login screen.

Keep it unhurried - let each screen finish loading. Three to five minutes is fine.

### Screenshots

While on the device, also capture four screenshots - Home, Articles, Quiz,
Settings - so the App Store listing uses genuine device captures rather than
the current web-export renders.
