/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: 'widget',
  name: 'PostaWidget',
  displayName: 'Posta',
  // containerBackground and contentMarginsDisabled need iOS 17.
  deploymentTarget: '17.0',
  entitlements: {
    'com.apple.security.application-groups': config.ios.entitlements['com.apple.security.application-groups'],
  },
  images: {
    // Sized to the widget (3x pixels): iOS refuses to draw a widget whose images are too big.
    'scene-morning': '../../assets/images/widget/ios/scene-morning.png',
    'scene-morning-small': '../../assets/images/widget/ios/scene-morning-small.png',
    'scene-afternoon': '../../assets/images/widget/ios/scene-afternoon.png',
    'scene-afternoon-small': '../../assets/images/widget/ios/scene-afternoon-small.png',
    'scene-sunset': '../../assets/images/widget/ios/scene-sunset.png',
    'scene-sunset-small': '../../assets/images/widget/ios/scene-sunset-small.png',
    'scene-dusk': '../../assets/images/widget/ios/scene-dusk.png',
    'scene-dusk-small': '../../assets/images/widget/ios/scene-dusk-small.png',
    'scene-fire': '../../assets/images/widget/ios/scene-fire.png',
    'scene-fire-small': '../../assets/images/widget/ios/scene-fire-small.png',
    'scene-night': '../../assets/images/widget/ios/scene-night.png',
    'scene-night-small': '../../assets/images/widget/ios/scene-night-small.png',
    'scene-goal': '../../assets/images/widget/ios/scene-goal.png',
    'scene-goal-small': '../../assets/images/widget/ios/scene-goal-small.png',
    'scene-ice': '../../assets/images/widget/ios/scene-ice.png',
    'scene-ice-small': '../../assets/images/widget/ios/scene-ice-small.png',
    'scene-thaw': '../../assets/images/widget/ios/scene-thaw.png',
    'scene-thaw-small': '../../assets/images/widget/ios/scene-thaw-small.png',
    'pancho-waving': '../../assets/images/capybara/capybara-saludando-figure.png',
    'pancho-sideeye': '../../assets/images/capybara/capybara-sideeye-figure.png',
    'pancho-sad': '../../assets/images/capybara/capybara-sad-figure.png',
    'pancho-begging': '../../assets/images/capybara/capybara-begging-figure.png',
    'pancho-crying': '../../assets/images/capybara/capybara-crying-figure.png',
    'pancho-collapsed': '../../assets/images/capybara/capybara-collapsed-figure.png',
    'pancho-goal': '../../assets/images/capybara/capybara-futbol-gol-figure.png',
  },
});
