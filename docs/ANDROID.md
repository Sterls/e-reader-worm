# Android app: step by step

The Android app is built automatically by GitHub every time the game changes.
You never need Android Studio.

## 1. Try the app on your own phone (no Play Store needed)
1. Open https://github.com/Sterls/e-reader-worm/actions on your computer or phone (logged in to GitHub).
2. Click the latest **Android app** run with a green tick ✅.
3. Scroll to **Artifacts** and download **e-reader-worm-test-app-…** (a .zip file).
4. On your Android phone: open the .zip in the **Files** app, tap **app-debug.apk** and choose **Install**.
   Android will ask you to allow installing from this source: tap **Settings** → turn on **Allow** → go back → **Install**.
   (Easiest: download the zip directly on the phone. Or download on a computer and send the .apk to yourself.)
5. The app shows **test ads** (with a "Test Ad" label) until real AdMob IDs are added. That's expected.

## 2. Create your upload key (once, about 5 minutes)
Google Play needs every app update to be signed with your private **upload key**. GitHub will make it for you.

1. Think of a strong password (at least 8 characters) and save it in your password manager.
2. Go to https://github.com/Sterls/e-reader-worm/settings/secrets/actions
3. Click **New repository secret**. Name: `ANDROID_KEYSTORE_PASSWORD`. Secret: your password. Click **Add secret**.
4. Go to https://github.com/Sterls/e-reader-worm/actions/workflows/android-key.yml
5. Click **Run workflow** → **Run workflow** (green button). Wait about 1 minute for the green tick ✅.
6. Click that run, scroll to **Artifacts**, download **android-upload-key-DELETE-AFTER-DOWNLOAD**, and unzip it. Inside:
   - `upload.jks` is your key. **Back it up** (e.g. to your password manager as an attachment, plus a USB stick).
   - `upload-key-base64.txt` is the same key as text, for GitHub.
7. Back in https://github.com/Sterls/e-reader-worm/settings/secrets/actions, click **New repository secret**.
   Name: `ANDROID_KEYSTORE_BASE64`. Secret: open `upload-key-base64.txt` in a text editor, select all, copy and paste it here.
   Click **Add secret**.
8. Delete the downloaded files from your Downloads folder once they're backed up, and on the workflow run page
   click the 🗑️ next to the artifact to delete it from GitHub.

From now on, each **Android app** run also produces **e-reader-worm-play-store-…** containing `app-release.aab`.
That's the file you upload to Google Play.

If you ever lose the upload key, Google Play support can reset it (Play App Signing keeps the real app key safe),
so don't panic, but do keep the backup.

## 3. First upload to Google Play
1. Go to https://play.google.com/console → **Create app**.
   - App name: **E-Reader Worm** · Default language: **English (United Kingdom)** · **Game** · **Free**.
   - Tick the declarations → **Create app**.
2. Left menu → **Test and release** → **Testing** → **Internal testing** → **Create new release**.
   - If asked about **Play App Signing**, choose **Use Google-generated key** (recommended).
   - Upload `app-release.aab` (from the step 2 artifact), give the release a name like `0.1.0 (1)`, **Save** → **Review** → **Roll out**.
3. **Testers** tab → create an email list with your own Google account (and friends'), then open the
   **opt-in link** on your phone to install it from the Play Store.
4. Work through the **Dashboard** → **Set up your app** checklist. Answers are drafted in [PLAY_STORE.md](PLAY_STORE.md).

Every later upload must have a higher version number. GitHub handles that automatically: the number after
"play-store-" is the version code.

## 4. Real ads (when you're ready)
See the AdMob steps in [TODO.md](../TODO.md). Send Claude the IDs and it will switch the app from test ads to real ads.
**Never tap your own real ads** (Google can close accounts for that). Test ads are always safe to tap.
