// Optional rewarded ads. These only run inside the Android/iPhone apps.
// On the web there are no ads at all: isAvailable() is false and no ad buttons are shown.
import { AD_CONFIG } from './ad-config.js';

const EVENTS = {
  rewarded: 'onRewardedVideoAdReward',
  dismissed: 'onRewardedVideoAdDismissed',
  failedToShow: 'onRewardedVideoAdFailedToShow',
};

let AdMob = null;
let ready = false;
let adLoaded = false;
let loading = null;
let privacyRequired = false;

function isNative() {
  return !!window.Capacitor?.isNativePlatform?.();
}

function platform() {
  return window.Capacitor?.getPlatform?.() || 'web';
}

function preload() {
  if (!ready || adLoaded) return Promise.resolve();
  if (loading) return loading;
  const adId = AD_CONFIG[platform()]?.rewarded;
  if (!adId) return Promise.resolve();
  loading = AdMob.prepareRewardVideoAd({ adId, isTesting: AD_CONFIG.testing })
    .then(() => { adLoaded = true; })
    .catch((err) => console.warn('Rewarded ad did not load', err))
    .finally(() => { loading = null; });
  return loading;
}

export const Ads = {
  /** Starts the ad SDK and asks for consent where the law needs it (UK/EU). Safe to call on the web. */
  async init() {
    if (!isNative() || ready) return;
    try {
      AdMob = window.Capacitor.registerPlugin('AdMob');
      await AdMob.initialize({ initializeForTesting: AD_CONFIG.testing, maxAdContentRating: 'ParentalGuidance' });
      let info = await AdMob.requestConsentInfo();
      if (info.isConsentFormAvailable && info.status === 'REQUIRED') info = await AdMob.showConsentForm();
      privacyRequired = info.privacyOptionsRequirementStatus === 'REQUIRED';
      ready = info.canRequestAds !== false;
      preload();
    } catch (err) {
      console.warn('Ads unavailable', err);
    }
  },

  isAvailable() {
    return ready;
  },

  /** True when players must be offered a way to change their ad consent choice. */
  hasPrivacyOptions() {
    return isNative() && privacyRequired && !!AdMob;
  },

  async showPrivacyOptions() {
    try {
      await AdMob.showPrivacyOptionsForm();
    } catch (err) {
      console.warn(err);
    }
  },

  /** Shows a rewarded video. Resolves true only if the player watched it to the end. */
  async showRewarded() {
    if (!ready) return false;
    if (!adLoaded) {
      await preload();
      if (!adLoaded) return false;
    }
    adLoaded = false;
    return new Promise((resolve) => {
      let rewarded = false;
      let finished = false;
      const handles = [];
      const finish = (value) => {
        if (finished) return;
        finished = true;
        handles.forEach((h) => Promise.resolve(h).then((x) => x?.remove?.()));
        preload();
        resolve(value);
      };
      handles.push(AdMob.addListener(EVENTS.rewarded, () => { rewarded = true; }));
      handles.push(AdMob.addListener(EVENTS.dismissed, () => setTimeout(() => finish(rewarded), 300)));
      handles.push(AdMob.addListener(EVENTS.failedToShow, () => finish(false)));
      AdMob.showRewardVideoAd().then(() => { rewarded = true; }).catch(() => finish(false));
    });
  },
};
