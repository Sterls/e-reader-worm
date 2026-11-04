// AdMob IDs. These are PUBLIC IDs (they ship inside every app), so they are safe to keep here.
// Until the real IDs are added, Google's official TEST IDs are used, which only ever show test ads.
// When adding real IDs: put the rewarded ad unit IDs below, set testing to false,
// and put the AdMob *app* ID in android/app/build.gradle (admobAppId).
export const AD_CONFIG = {
  testing: true,
  android: { rewarded: 'ca-app-pub-3940256099942544/5224354917' },
  ios: { rewarded: 'ca-app-pub-3940256099942544/1712485313' },
};
