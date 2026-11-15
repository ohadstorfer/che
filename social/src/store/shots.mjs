// Store screenshots, in upload order. **word** turns rosa. Screens are real app frames (status bar
// cleared, a 9:41 one is drawn on top) in public/store; the widgets shot is drawn (StoreShot WidgetHome).
// kicker: a small line above the title.
// stores: which stores get the shot (both unless set). Google Play takes 8 at most.
export const SHOTS = [
  {id: 'store-01', title: 'Learn the Spanish Argentina **actually** speaks.', screen: 'store/screen-01.png'},
  {id: 'store-02', kicker: 'Argentinian grammar', title: 'Vos sos. **Not tú eres.**', screen: 'store/screen-03.png'},
  {id: 'store-03', title: 'Mate, asado, fútbol. **The culture too.**', screen: 'store/screen-06.png'},
  {id: 'store-04', title: 'Argentinian AI **speaking practice.**', screen: 'store/screen-04.png'},
  {id: 'store-05', title: 'Lunfardo: **the local vocabulary.**', screen: 'store/screen-05.png'},
  {id: 'store-06', title: 'Sentences Argentines **actually say.**', screen: 'store/screen-02.png'},
  {id: 'store-07', title: 'Slang on your **Home Screen.**', widgets: true},
  {id: 'store-08', title: 'A few minutes a day. **That’s it.**', screen: 'store/screen-08.png'},
  {id: 'store-09', title: '¿Dale? Start talking **like a local.**', screen: 'store/screen-09.png', stores: ['ios']},
];
