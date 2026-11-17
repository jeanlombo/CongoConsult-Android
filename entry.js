import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import './app.js';
window.africaOpenExternal = async (url) => {
  if (Capacitor.isNativePlatform()) {
    await Browser.open({ url, presentationStyle: 'popover' });
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};
if (Capacitor.isNativePlatform()) {
  App.addListener('backButton', () => {
    if (typeof window.africaHandleBack === 'function' && window.africaHandleBack()) return;
    App.exitApp();
  });
}
