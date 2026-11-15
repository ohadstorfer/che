// Every YouTube learn video: one module per video in ./videos (shape: see videos/learn.mjs).
import learn from './videos/learn.mjs'; import vsSpainMexico from './videos/vs-spain-mexico.mjs';
import vos from './videos/vos.mjs'; import slang from './videos/slang.mjs';
import accent from './videos/accent.mjs'; import che from './videos/che.mjs';
import boludo from './videos/boludo.mjs';
import travelPhrases from './videos/travel-phrases.mjs';
import lunfardo from './videos/lunfardo.mjs';
import italian from './videos/italian.mjs';
import mate from './videos/mate.mjs';
import food from './videos/food.mjs';
import texting from './videos/texting.mjs';
import mistakes from './videos/mistakes.mjs';
import vosVerbs from './videos/vos-verbs.mjs';
import football from './videos/football.mjs';
import dating from './videos/dating.mjs';
import expressions from './videos/expressions.mjs';
import grammar from './videos/grammar.mjs';
export const VIDEOS = [learn, vsSpainMexico, vos, slang, accent, che, boludo, travelPhrases, lunfardo, italian, mate, food, texting, mistakes, vosVerbs, football, dating, expressions, grammar];
export const video = id => { const v = VIDEOS.find(v => v.id === id); if (!v) throw new Error('no video ' + id); return v; };
