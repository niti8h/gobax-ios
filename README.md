# Gobax

Gobax is an Expo SDK 57 mobile app for learning crypto, DeFi, and Web3 concepts.
It supports iOS, Android, and web from a shared TypeScript codebase.

## Included flows

- Secure sign-in and registration with a required security-check WebView
- Local verification-code challenge
- Encrypted session storage and session re-verification on app launch
- Guest access to educational content
- Password-recovery and in-app account-deletion flows
- Articles, glossary content, crypto quiz, profile settings, and Vietnamese/English UI

## Run locally

Use Node.js 22.13 or later, then install dependencies and start Expo:

```bash
npm ci
npm start
```

Useful targets:

```bash
npm run ios
npm run android
npm run web
```

## Android APK

The `preview` EAS profile produces an installable APK for internal testing:

```bash
npx eas-cli@latest build --platform android --profile preview
```

The `production` profile produces an Android App Bundle for Google Play submission.

## Authentication service

The app sends form-encoded requests to the configured Gobax API only after the
security-check page reports completion. Server error documents are never displayed
to users; non-JSON or unavailable responses are shown as concise error messages.

Before release, confirm that the production API accepts the mobile app’s login and
registration requests and that its security-check callback contract remains unchanged.
