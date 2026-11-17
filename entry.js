import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import './app.js';
window.congoOpenExternal = async (url) => {
  if (Capacitor.isNativePlatform()) {
    await Browser.open({ url, presentationStyle: 'popover' });
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};
if (Capacitor.isNativePlatform()) {
  App.addListener('backButton', () => {
    if (typeof window.congoHandleBack === 'function' && window.congoHandleBack()) return;
    App.exitApp();
  });
}
