// Optional rewarded ads. These only exist in the Android/iPhone apps.
// On the web there are no ads at all: isAvailable() is false and no ad buttons are shown.
// The phone apps will replace this with the AdMob rewarded-ad plugin (see TODO.md).

export const Ads = {
  isAvailable() {
    return false;
  },
  /** Shows a rewarded ad. Resolves true only if the player watched it to the end. */
  async showRewarded(/* placement */) {
    return false;
  },
};
