# E-Reader Worm

An original letter-tile word puzzle game for phones and the web.
Swipe across touching letters to make words, chase long words and rare letters,
earn bonus tiles, and clear glitch tiles before they cost you a heart.

## Play it locally
You need [Node.js](https://nodejs.org) installed.

```bash
npm start
```
Then open http://localhost:8080 (add `?debug` to the address for test hooks).

## Android
After changing anything in `public/`, run `npx cap sync android` (GitHub does this automatically when building).
App icons/splash screens are made by `node scripts/make-android-art.cjs`.

## Run the tests
```bash
npm test
```

## How the code is organised
| Folder | What's in it |
| --- | --- |
| `public/` | The whole game website (this is what gets hosted) |
| `public/js/logic/` | Game rules: letters, words, scoring, levels, board, engine. No drawing code, fully tested |
| `public/js/render.js` | Draws the board and its animations on a canvas |
| `public/js/main.js` | Menus, touch controls, sounds and saving |
| `public/js/ads.js` | Rewarded-ad hook (off on the web; used by the phone apps later) |
| `public/words.txt` | The word list (ENABLE, public domain, see CREDITS.md) |
| `tests/` | Automated tests (`npm test`) |
| `android/` | The Android app project (Capacitor). Built by GitHub Actions |
| `capacitor.config.json` | App name and ID for the phone apps |
| `public/js/ad-config.js` | AdMob ad unit IDs (public IDs; test IDs for now) |
| `public/privacy.html` | Privacy policy page |
| `store/` | Play Store screenshots and feature graphic |
| `docs/HOSTING.md` | How to put the game online with Cloudflare |
| `docs/ANDROID.md` | Testing the Android app, upload key, first Play upload |
| `docs/PLAY_STORE.md` | Draft store listing text and Play form answers |
| `TODO.md` | Things the owner needs to do (accounts, store listings, etc.) |

## Game rules in short
- Words need 3+ letters. `Qu` is one tile. Diagonals count.
- Score = letter values × length bonus × bonus tiles (× streak bonus), times 10.
- 5 letters → gold tile (×2), 6 → wild tile, 7 → crystal (×3), 8+ → bolt (clears its row) + crystal.
- Glitch tiles count down after each word; at 0 you lose one of 3 hearts.
- Each level has 2–3 goals. Clearing them restores a heart and gives a shuffle and a hint.
