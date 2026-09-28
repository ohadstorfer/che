const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// react-native-purchases requires RevenueCat's web SDK (~1 MB) at the top of
// its browser fallback, which only Expo Go and the browser use. A store build
// talks to the native SDK, so on iOS/Android that module is an empty stub:
// 1 MB less to download and to run at every launch.
const WEB_ONLY = new Set(['@revenuecat/purchases-js-hybrid-mappings']);
const EMPTY = path.resolve(__dirname, 'scripts/metro/empty.js');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform !== 'web' && WEB_ONLY.has(moduleName)) return { type: 'sourceFile', filePath: EMPTY };
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
