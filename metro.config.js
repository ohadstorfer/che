// Expo's default Metro config, plus the debug IDs Sentry uses to match a
// crash's stack trace to the source maps uploaded from the EAS build.
const path = require('path');
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

const config = getSentryExpoConfig(__dirname);

// Metro walks the whole repo before it serves anything. .claude/worktrees holds
// full copies of the repo (node_modules included, ~14 GB) and social/ the reel
// media (~5 GB): the app imports neither, and crawling them ran Metro out of memory.
const skip = ['.claude', 'social'].map(
  (dir) => new RegExp(`^${path.join(__dirname, dir).replace(/[/\\^$.*+?()[\]{}|]/g, '\\$&')}\\/.*`),
);
config.resolver.blockList = [...[].concat(config.resolver.blockList ?? []), ...skip];

module.exports = config;
