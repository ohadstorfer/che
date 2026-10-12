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
    'scene-morning': '../../assets/images/widget/scene-morning.png',
    'scene-afternoon': '../../assets/images/widget/scene-afternoon.png',
    'scene-sunset': '../../assets/images/widget/scene-sunset.png',
    'scene-dusk': '../../assets/images/widget/scene-dusk.png',
    'scene-fire': '../../assets/images/widget/scene-fire.png',
    'scene-night': '../../assets/images/widget/scene-night.png',
    'scene-goal': '../../assets/images/widget/scene-goal.png',
    'scene-ice': '../../assets/images/widget/scene-ice.png',
    'scene-thaw': '../../assets/images/widget/scene-thaw.png',
    'pancho-waving': '../../assets/images/capybara/capybara-saludando-figure.png',
    'pancho-sideeye': '../../assets/images/capybara/capybara-sideeye-figure.png',
    'pancho-sad': '../../assets/images/capybara/capybara-sad-figure.png',
    'pancho-begging': '../../assets/images/capybara/capybara-begging-figure.png',
    'pancho-crying': '../../assets/images/capybara/capybara-crying-figure.png',
    'pancho-collapsed': '../../assets/images/capybara/capybara-collapsed-figure.png',
    'pancho-goal': '../../assets/images/capybara/capybara-futbol-gol-figure.png',
  },
});
