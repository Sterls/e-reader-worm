# TODO

Things **you** need to do are marked 👤. Things Claude can do next are marked 🤖.

## Now: play it with friends
- [ ] 👤 Put the game online with Cloudflare: follow [docs/HOSTING.md](docs/HOSTING.md) (about 5 minutes, free).
- [ ] 👤 Play it, share the link, and note anything that feels too hard, too easy, confusing or ugly.
- [ ] 👤 Decide whether "E-Reader Worm" is the final name. Before launch, search the name on
      Google Play, the App Store and the UK IPO trade mark search (https://www.gov.uk/search-for-trademark).
      Don't use the word "Bookworm" in the name or store text (it's another company's game brand).

## Before the phone apps
- [ ] 🤖 Wrap the game with Capacitor for Android and iPhone.
- [ ] 🤖 Add AdMob rewarded ads (only optional "watch a video for..." buttons; no banners, no forced ads).
- [ ] 🤖 Write a privacy policy page (needed because AdMob collects advertising data) and host it on the site.
- [ ] 🤖 Set up GitHub Actions to build the iPhone app on Apple's macOS machines.
- [ ] 🤖 Make store screenshots and a feature graphic.
- [ ] 👤 **Apple Developer Program**: enrol as an *Individual* at https://developer.apple.com/programs/enroll/
      (£79 a year; needs an Apple ID with two-factor sign-in). Approval can take a few days, so start early.
- [ ] 👤 **AdMob**: sign in at https://admob.google.com with the Google account you use for Play.
      Add two apps (Android + iOS), create one **Rewarded** ad unit for each, and send Claude the
      *App IDs* and *Ad unit IDs* (they look like `ca-app-pub-…`; these are public, safe to share).
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
- [ ] 👤 Create the **upload key** when Claude gives you the steps. Keep it and its password somewhere safe
      (password manager + backup). It must **never** go in the GitHub repo; it goes in GitHub *Secrets*.

## Apple App Store
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
