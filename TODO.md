# TODO

Things **you** need to do are marked 👤. Things Claude can do next are marked 🤖.

## Now: play it with friends
- [ ] 👤 Put the game online with Cloudflare: follow [docs/HOSTING.md](docs/HOSTING.md) (about 5 minutes, free).
- [ ] 👤 Play it, share the link, and note anything that feels too hard, too easy, confusing or ugly.
- [ ] 👤 Decide whether "E-Reader Worm" is the final name. Before launch, search the name on
      Google Play, the App Store and the UK IPO trade mark search (https://www.gov.uk/search-for-trademark).
      Don't use the word "Bookworm" in the name or store text (it's another company's game brand).

## Android app (current focus) — full guide: [docs/ANDROID.md](docs/ANDROID.md)
- [x] 🤖 Android app with Capacitor, built automatically by GitHub (Actions → "Android app").
- [x] 🤖 Rewarded ads (Google *test* ads for now): extra shuffles/hints, keep going after game over, unlock colour themes.
- [x] 🤖 UK/EU consent form + "Privacy settings" button, privacy policy page (`/privacy.html`).
- [x] 🤖 Store screenshots and feature graphic (`store/` folder), draft store text and form answers ([docs/PLAY_STORE.md](docs/PLAY_STORE.md)).
- [ ] 👤 Install the test app on your phone and try it (docs/ANDROID.md, step 1).
- [ ] 👤 Check you're happy with the app ID **`com.ereaderworm.game`**. It can **never** change after the first
      Play upload. Tell Claude now if you want something else (e.g. matching your Whoosh Blocks style).
- [ ] 👤 Create your upload key (docs/ANDROID.md, step 2).
- [ ] 👤 Get a **support email** that isn't your personal one (e.g. a new free Gmail just for the game).
      Play needs a public contact email; Claude can add it to the privacy page if you like.
- [ ] 👤 Create the app in Play Console and do an internal test release (docs/ANDROID.md, step 3).
- [ ] 👤 **AdMob**: sign in at https://admob.google.com with the Google account you use for Play.
      Add two apps (Android + iOS), create one **Rewarded** ad unit for each, and send Claude the
      *App IDs* and *Ad unit IDs* (they look like `ca-app-pub-…`; these are public, safe to share).
      Android first; the iOS one can wait.
- [ ] 👤 AdMob → **Privacy & messaging**: create the GDPR consent message (required for UK/EU players)
      and the iOS "IDFA explainer" message.
- [ ] 👤 AdMob → **Payments**: add your bank details and tax info (UK sole trader; complete the US W-8BEN form).
- [ ] 👤 Make sure you're registered for **Self Assessment** with HMRC (ad income is taxable).

## Google Play (you already have a developer account)
- [ ] 👤 Play Console → **Create app** (free game, contains ads: **Yes**).
- [ ] 👤 **Data safety** form: ads collect *device or other IDs* and *app interactions* for advertising;
      data is encrypted in transit; users can't request deletion of AdMob data via you (Claude will draft answers).
- [ ] 👤 **Content rating** questionnaire, **Target audience** (choose 13+ to stay out of the strict Families
      programme), **Ads** declaration: Yes.
- [ ] 👤 Check whether your account needs **closed testing first** (personal accounts made after Nov 2023
      need 12 testers for 14 days before a production release).

## Apple App Store (later)
- [ ] 👤 **Apple Developer Program**: enrol as an *Individual* at https://developer.apple.com/programs/enroll/
      (£79 a year; needs an Apple ID with two-factor sign-in). Approval can take a few days.
- [ ] 🤖 Add the iPhone project and a GitHub Actions build on macOS.
- [ ] 👤 App Store Connect → **New App** (after enrolment).
- [ ] 👤 **App Privacy** answers (Claude will draft them), age rating, screenshots.
- [ ] 👤 Create an **App Store Connect API key** for GitHub Actions and add it to GitHub *Secrets*
      (Claude will give exact steps; never commit the `.p8` file).
- [ ] 👤 EU **trader status**: as a sole trader selling in the EU, Apple and Google show your address and
      contact details on EU store pages. Consider a business address or virtual office.

## Website
- [ ] 👤 (Optional) Buy a domain in Cloudflare and connect it (see docs/HOSTING.md).
- [ ] 🤖 Add `app-ads.txt` to the site once AdMob is set up (required for ad income).

## Later ideas
- [ ] 🤖 Online leaderboard (Supabase free plan).
- [ ] 🤖 Filter offensive words before they could be shown to other players (e.g. on a leaderboard).
- [ ] 🤖 Daily puzzle, more themes as rewarded-ad loot, achievements.
