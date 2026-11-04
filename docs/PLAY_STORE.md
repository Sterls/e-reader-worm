# Google Play: draft answers and listing text

Check everything before submitting. These are drafts based on how the app works today.

## Store listing
- **App name** (max 30): `E-Reader Worm: Word Puzzle`
- **Short description** (max 80):
  `Swipe letters into words, earn bonus tiles and squash glitches. Endless levels!`
- **Full description**:

```
Link letters. Make words. Keep the worm happy!

E-Reader Worm is a cosy word puzzle with a twist. Swipe across touching letter tiles to spell words in any direction. Longer words and rare letters score big, and every few levels the challenge grows.

★ SWIPE TO SPELL: up, down, sideways or diagonal. Let go to play your word.
★ BONUS TILES: long words earn gold (×2), crystal (×3), wild tiles that become any letter, and bolts that blast a whole row.
★ GLITCH TILES: they count down with every word you play. Use them before they hit zero or lose a heart!
★ ENDLESS LEVELS: each level has fresh goals. Clear them for a heart, a shuffle and a hint.
★ JUICY & RELAXING: satisfying pops, cheers for big words, confetti for level clears.
★ PLAY ONE-HANDED: made for portrait play on any phone, even on the bus.
★ FAIR & FREE: no forced ads, ever. Watch an optional video only if you want extra shuffles, hints, a second chance or new colour themes.
★ PLAYS OFFLINE: no account and no sign-up needed.

Over 160,000 valid words. How long can you keep going?
```

- **Category**: Game → Word · **Tags**: Word, Puzzle, Casual, Offline
- **Graphics** (in the `store/` folder of the repo):
  - App icon 512×512: `public/icons/icon-512.png`
  - Feature graphic 1024×500: `store/feature-graphic.png`
  - Phone screenshots: `store/screenshot-*.png`
- **Privacy policy URL**: `https://<your Cloudflare address>/privacy.html`

## App content answers
- **Ads**: Yes, the app contains ads.
- **App access**: All functionality is available without special access.
- **Content rating** (IARC questionnaire): Category **Game, Puzzle**. No violence, sex, language, drugs, gambling;
  no user-generated content or chat; no purchases. (Note: the word list contains everyday words, including some rude ones,
  that players can spell, but the game never shows them unless typed by the player.) Expected rating: PEGI 3 / Everyone.
- **Target audience and content**: choose **13–15, 16–17 and 18+** (not under 13). "Could the app unintentionally appeal to children?" **No**
  is reasonable for a word game, but be honest: if Google disagrees, it may ask for Families policy compliance.
- **News app**: No. **Government app**: No. **Financial features**: None. **Health**: None.
- **Data safety** (from Google's AdMob guidance; double-check at
  https://developers.google.com/admob/android/privacy/play-data-disclosure):
  - Does the app collect or share user data? **Yes** (via the Google Mobile Ads SDK).
  - Is all data encrypted in transit? **Yes**.
  - Can users request deletion? Choose the option that data is not linked to an account / handled by Google.
  - Data types:
    - **Location → Approximate location**: Collected, Shared. Purposes: Advertising or marketing, Analytics, Fraud prevention.
    - **App activity → App interactions**: Collected, Shared. Purposes: Advertising or marketing, Analytics.
    - **App info and performance → Diagnostics**: Collected, Shared. Purposes: Analytics, Fraud prevention.
    - **Device or other IDs**: Collected, Shared. Purposes: Advertising or marketing, Analytics, Fraud prevention.
  - For each: processed ephemerally? **No**. Required or optional? **Required** (ads SDK runs when the app starts).
- **Advertising ID** declaration: **Yes**, the app uses the advertising ID, for **Advertising or marketing** and **Analytics**.
