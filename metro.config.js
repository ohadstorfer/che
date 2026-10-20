// Expo's default Metro config, plus the debug IDs Sentry uses to match a
// crash's stack trace to the source maps uploaded from the EAS build.
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

module.exports = getSentryExpoConfig(__dirname);
