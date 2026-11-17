// Hand-written guide pages for postaspanish.com. build-learn.mjs wraps each in
// the page shell (head, schema, nav, CTA, footer).
// Rules: plain English a B1 learner understands, vos everywhere (no usted, no
// tú except to show the contrast), no other learning apps named, and nothing
// stated as fact that we haven't checked.

export const guides = [
  {
    slug: 'learn-argentine-spanish',
    title: 'How to Learn Argentine Spanish (2026 Guide)',
    h1: 'How to learn Argentine Spanish',
    description: 'A step-by-step plan to learn the Spanish people speak in Argentina: vos, the "sh" sound, everyday slang, what to watch and listen to, and how to practice speaking.',
    crumb: 'Guide',
    faq: [
      ['Is Argentine Spanish hard to learn?', 'No harder than any other Spanish. Most of the grammar is the same. The big changes are vos instead of tú, the "sh" sound for ll and y, and a lot of local words. If you learn those from the start, you avoid having to unlearn things later.'],
      ['Can I learn Argentine Spanish if I already learned Spanish from Spain or Mexico?', 'Yes, and you are already most of the way there. Switch tú for vos, learn the vos verb forms (they are easier, with almost no irregular stems), start using ustedes for "you all", and learn the everyday words that change, like colectivo for bus and remera for T-shirt.'],
      ['Will Argentines understand me if I use tú?', 'Yes. Everyone understands tú from TV and from other countries. It just sounds foreign. Using vos is the fastest way to sound like you live there.'],
      ['How long does it take to learn Argentine Spanish?', 'It depends on how much time you put in. Ten to twenty minutes every day is enough to understand basic conversations in a few months. Daily practice matters more than long sessions once a week.'],
    ],
    body: `
<p class="lede">Argentine Spanish is the Spanish of Buenos Aires and most of Argentina. It uses <strong>vos</strong> instead of tú, says the ll and y as <strong>"sh"</strong>, and has hundreds of local words you won't find in a general Spanish course. This guide shows you what to learn first, what to watch and listen to, and how to practice every day.</p>

<h2>What is Argentine Spanish?</h2>
<div class="answer"><p>Argentine Spanish is the Spanish spoken in Argentina. The best-known version is <strong>Rioplatense Spanish</strong>, the Spanish of Buenos Aires and Montevideo, around the Río de la Plata. It is normal Spanish with three big differences: vos instead of tú, a "sh" sound for ll and y, and a lot of local slang called <strong>lunfardo</strong>.</p></div>
<p>The grammar you learn in any Spanish course still works. But if you learn only general Spanish, you will understand Argentines more slowly at first, and you will sound like a visitor when you speak. Learning the Argentine version from day one saves you that step.</p>

<h2>How is Argentine Spanish different?</h2>
<div class="answer"><p>Five things change: <strong>vos</strong> replaces tú, <strong>ustedes</strong> is used for "you all" (no vosotros), <strong>ll and y sound like "sh"</strong>, many <strong>everyday words</strong> are different, and the <strong>intonation</strong> sounds a bit Italian.</p></div>
<ul>
  <li><strong>Vos.</strong> "Vos sos", not "tú eres". "Vos tenés", not "tú tienes". Everyone uses it, with friends and with strangers. See <a href="/voseo">the full guide to vos</a>.</li>
  <li><strong>Ustedes.</strong> Like the rest of Latin America, Argentina uses ustedes for a group, never vosotros.</li>
  <li><strong>The "sh" sound.</strong> "Yo me llamo" sounds like "sho me shamo". "Calle" sounds like "cashe".</li>
  <li><strong>Words.</strong> A bus is a <a href="/slang/colectivo">colectivo</a> or a <a href="/slang/bondi">bondi</a>, a T-shirt is a <a href="/slang/remera">remera</a>, money is <a href="/slang/plata">plata</a> or <a href="/slang/guita">guita</a>, work is <a href="/slang/laburo">laburo</a>. See the <a href="/argentine-spanish-vs-other-spanish">full comparison table</a>.</li>
  <li><strong>Music.</strong> Millions of Italians moved to Argentina, and you can hear it in the rhythm and in words like <a href="/slang/laburo">laburo</a> (from Italian "lavoro") and nono / nona for grandpa and grandma.</li>
</ul>

<h2>Where should I start?</h2>
<div class="answer"><p>Start with vos and the 50 words people say every day. With those two things you will understand a big part of what you hear on the street, even before you know much grammar.</p></div>
<ol>
  <li><strong>Learn vos from the first day.</strong> The present tense with vos is easy: hablar becomes "vos hablás", comer becomes "vos comés", vivir becomes "vos vivís". Only ser ("vos sos") and ir ("vos vas") are really different.</li>
  <li><strong>Learn the 50 everyday words.</strong> <a href="/slang/che">Che</a>, <a href="/slang/dale">dale</a>, <a href="/slang/re">re</a>, <a href="/slang/boludo">boludo</a>, <a href="/slang/posta">posta</a>, <a href="/slang/quilombo">quilombo</a>… They are in almost every conversation. Here is <a href="/argentine-slang">the full list of 50</a>.</li>
  <li><strong>Get used to the "sh" sound.</strong> Listen first, then copy it. Read sentences out loud: "Ayer llovió en la calle" (asher shovió en la cashe).</li>
  <li><strong>Learn whole sentences, not lists.</strong> "¿Me pasás la sal?" teaches vos, a verb and a polite question at the same time. You remember sentences better than single words.</li>
  <li><strong>Speak out loud early.</strong> Even if you only say short phrases. Speaking is a separate skill: you can only get better at it by doing it.</li>
</ol>

<h2>What should I watch and listen to?</h2>
<div class="answer"><p>Watch Argentine films and series with Spanish subtitles, listen to Argentine music, and follow Argentine streaming channels. Real Argentines talking is the best way to train your ear for vos, the "sh" sound and the slang.</p></div>
<h3>Films and series</h3>
<ul>
  <li><strong>Relatos salvajes</strong> (Wild Tales, 2014): six short stories, lots of everyday anger and everyday slang.</li>
  <li><strong>Nueve reinas</strong> (Nine Queens, 2000): two con men in Buenos Aires. Fast, very porteño speech.</li>
  <li><strong>El secreto de sus ojos</strong> (2009): a crime drama that won the Oscar for best foreign film.</li>
  <li><strong>Argentina, 1985</strong> (2022): the trial of the military leaders. Clear speech, a lot of history.</li>
  <li><strong>El Eternauta</strong> (2025): a science fiction series set in Buenos Aires, based on a famous comic.</li>
  <li><strong>Okupas</strong> (2000): young people in an empty house in Buenos Aires. Lots of street slang.</li>
  <li><strong>Casi feliz</strong> (2020) and <strong>División Palermo</strong> (2023): comedies, good for everyday conversation.</li>
</ul>
<p class="note">Tip: watch with Spanish subtitles, not English. You will see how the words are written and hear how they sound at the same time.</p>
<h3>Music</h3>
<ul>
  <li><strong>Rock nacional</strong>: Charly García, Soda Stereo, Los Fabulosos Cadillacs, Babasónicos. Clear lyrics, lots of culture.</li>
  <li><strong>Today's music</strong>: Duki, Nicki Nicole, Trueno, and the Bzrp Music Sessions by Bizarrap. Full of modern slang.</li>
  <li><strong>Tango</strong>: the old lyrics are where much of lunfardo comes from. Hard, but fun once you know some slang.</li>
</ul>
<h3>Streaming, comics and football</h3>
<ul>
  <li><strong>Streaming channels</strong> like Olga and Luzu TV: young Argentines talking for hours, live, on YouTube. This is how people really speak.</li>
  <li><strong>Mafalda</strong>, the comic strip by Quino: short, funny, and full of vos.</li>
  <li><strong>Football</strong>: watch a match with Argentine commentators. You will learn <a href="/slang/golazo">golazo</a>, <a href="/slang/penal">penal</a>, <a href="/slang/hincha">hincha</a> and a lot of words you can't say at work.</li>
</ul>

<h2>How do I practice every day?</h2>
<div class="answer"><p>Ten to twenty minutes a day works better than two hours once a week. Each day: learn a few new sentences, review the old ones, and say something out loud.</p></div>
<p>A simple daily routine:</p>
<ul>
  <li><strong>5 minutes:</strong> a short lesson with new words inside real sentences.</li>
  <li><strong>5 minutes:</strong> review what you learned yesterday and last week, before you forget it.</li>
  <li><strong>5 minutes:</strong> speak. Order a coffee, ask for directions, talk about your day, out loud.</li>
  <li><strong>Whenever you can:</strong> one episode, a few songs, or a match.</li>
</ul>
<p>We made <strong>Posta</strong> for exactly this. It is an app that teaches only Argentine Spanish: a full course with vos from the first lesson, {{WORDS}} everyday words and slang inside real sentences, one-minute culture classes, and spoken chats with Pancho, a capybara who plays the waiter, the taxi driver or the kiosk owner and tells you how a porteño would say it.</p>

<h2>Learning for a trip, a move or a partner?</h2>
<ul>
  <li><strong>Traveling:</strong> focus on ordering food, transport (<a href="/slang/colectivo">colectivo</a>, <a href="/slang/subte">subte</a>, <a href="/slang/sube">SUBE</a>), money (<a href="/slang/luca">luca</a>, <a href="/slang/vuelto">vuelto</a>) and greetings (<a href="/slang/buen-dia">buen día</a>, <a href="/slang/que-onda">qué onda</a>, <a href="/slang/chau">chau</a>).</li>
  <li><strong>Moving to Buenos Aires:</strong> add renting (<a href="/slang/departamento">departamento</a>), work (<a href="/slang/laburo">laburo</a>, <a href="/slang/laburar">laburar</a>) and news words like <a href="/slang/paro">paro</a> (strike) and <a href="/slang/marcha">marcha</a> (protest march).</li>
  <li><strong>An Argentine partner or family:</strong> learn the family words (nono, nona), how people greet at a family lunch (one kiss on the cheek, with everyone), and what to say at an <a href="/slang/asado">asado</a> and when someone offers you <a href="/slang/mate">mate</a>.</li>
</ul>

<h2>Common questions</h2>
`,
  },

  {
    slug: 'argentine-spanish-vs-other-spanish',
    title: 'Argentine Spanish vs Spain and Mexico Spanish: The Differences',
    h1: 'Argentine Spanish vs the Spanish most courses teach',
    description: 'Vos vs tú, ustedes vs vosotros, the "sh" sound, and 20 everyday words that change between Argentina, Spain and Mexico, in one table.',
    crumb: 'Argentina vs Spain vs Mexico',
    faq: [
      ['What is the biggest difference in Argentine Spanish?', 'Vos. Argentines say "vos sos" instead of "tú eres" and "vos tenés" instead of "tú tienes", with everyone. Most courses and textbooks only teach tú.'],
      ['Is Argentine Spanish closer to Spain or to Mexico?', 'In grammar it is closer to Mexico and the rest of Latin America: ustedes for "you all", no vosotros. In sound and words it is its own thing: the "sh" sound for ll and y, and many words you only hear around the Río de la Plata.'],
      ['Do Argentines understand Spanish from Spain and Mexico?', 'Yes, completely. They hear it on TV, in films and online every day. The words that change are usually known, they just aren\'t the ones people use at home.'],
    ],
    body: `
<p class="lede">Most Spanish courses, apps and textbooks teach a general Spanish with <strong>tú</strong>, based on Spain or Mexico. In Argentina you will hear something a bit different. Here is what changes, in one place.</p>

<h2>What changes in the grammar?</h2>
<div class="answer"><p>Argentines use <strong>vos</strong> instead of tú, with its own verb forms, and <strong>ustedes</strong> for "you all". Everything else (tenses, gender, ser and estar) is the same.</p></div>
<div class="table"><table>
  <thead><tr><th></th><th>Argentina</th><th>Spain</th><th>Mexico</th></tr></thead>
  <tbody>
    <tr><td>You (one friend)</td><td class="vos">vos</td><td>tú</td><td>tú</td></tr>
    <tr><td>You are</td><td class="vos">vos sos</td><td>tú eres</td><td>tú eres</td></tr>
    <tr><td>You have</td><td class="vos">vos tenés</td><td>tú tienes</td><td>tú tienes</td></tr>
    <tr><td>You want</td><td class="vos">vos querés</td><td>tú quieres</td><td>tú quieres</td></tr>
    <tr><td>Come here!</td><td class="vos">¡vení!</td><td>¡ven!</td><td>¡ven!</td></tr>
    <tr><td>Tell me</td><td class="vos">decime</td><td>dime</td><td>dime</td></tr>
    <tr><td>You all</td><td class="vos">ustedes</td><td>vosotros</td><td>ustedes</td></tr>
    <tr><td>You, polite</td><td class="vos">vos (with a softer tone)</td><td>usted</td><td>usted</td></tr>
  </tbody>
</table></div>
<p>In Argentina, vos is used with almost everyone: friends, shop staff, doctors, older neighbors. People are polite with their tone and with phrases like "disculpá" (excuse me) or "¿no tendrás…?" (would you have…?). See the <a href="/voseo">full guide to vos</a> and the <a href="/vos/tener">vos forms of 50 common verbs</a>.</p>

<h2>How does it sound different?</h2>
<div class="answer"><p>In Buenos Aires, <strong>ll and y sound like "sh"</strong>: "yo" sounds like "sho" and "calle" like "cashe". The intonation goes up and down more, a bit like Italian.</p></div>
<div class="table"><table>
  <thead><tr><th>Written</th><th>Argentina</th><th>Spain and Mexico</th></tr></thead>
  <tbody>
    <tr><td>yo</td><td class="vos">"sho"</td><td>"yo"</td></tr>
    <tr><td>calle</td><td class="vos">"cashe"</td><td>"caye" / "calye"</td></tr>
    <tr><td>me llamo</td><td class="vos">"me shamo"</td><td>"me yamo"</td></tr>
    <tr><td>playa</td><td class="vos">"plasha"</td><td>"playa"</td></tr>
  </tbody>
</table></div>
<p>Like Mexico and the rest of Latin America, Argentina says <strong>z and soft c like s</strong>. "Gracias" sounds like "grasias", not "grathias" like in much of Spain.</p>

<h2>Which everyday words change?</h2>
<div class="answer"><p>Many of the words you use every day: food, clothes, transport and the home. Here are 20 of the most common.</p></div>
<div class="table"><table>
  <thead><tr><th>English</th><th>Argentina</th><th>Spain</th><th>Mexico</th></tr></thead>
  <tbody>
    <tr><td>bus</td><td class="vos"><a href="/slang/colectivo">colectivo</a>, <a href="/slang/bondi">bondi</a></td><td>autobús</td><td>camión</td></tr>
    <tr><td>car</td><td class="vos">auto</td><td>coche</td><td>carro, coche</td></tr>
    <tr><td>T-shirt</td><td class="vos"><a href="/slang/remera">remera</a></td><td>camiseta</td><td>playera</td></tr>
    <tr><td>jacket</td><td class="vos"><a href="/slang/campera">campera</a></td><td>chaqueta</td><td>chamarra</td></tr>
    <tr><td>sweatshirt</td><td class="vos"><a href="/slang/buzo">buzo</a></td><td>sudadera</td><td>sudadera</td></tr>
    <tr><td>sneakers</td><td class="vos"><a href="/slang/zapatillas">zapatillas</a></td><td>zapatillas, deportivas</td><td>tenis</td></tr>
    <tr><td>socks</td><td class="vos"><a href="/slang/medias">medias</a></td><td>calcetines</td><td>calcetines</td></tr>
    <tr><td>swimming pool</td><td class="vos"><a href="/slang/pileta">pileta</a></td><td>piscina</td><td>alberca</td></tr>
    <tr><td>fridge</td><td class="vos"><a href="/slang/heladera">heladera</a></td><td>nevera, frigorífico</td><td>refrigerador, refri</td></tr>
    <tr><td>apartment</td><td class="vos"><a href="/slang/departamento">departamento</a></td><td>piso</td><td>departamento</td></tr>
    <tr><td>bedroom</td><td class="vos"><a href="/slang/pieza">pieza</a></td><td>habitación</td><td>recámara, cuarto</td></tr>
    <tr><td>sidewalk</td><td class="vos"><a href="/slang/vereda">vereda</a></td><td>acera</td><td>banqueta</td></tr>
    <tr><td>avocado</td><td class="vos">palta</td><td>aguacate</td><td>aguacate</td></tr>
    <tr><td>strawberry</td><td class="vos">frutilla</td><td>fresa</td><td>fresa</td></tr>
    <tr><td>beans</td><td class="vos">porotos</td><td>alubias, judías</td><td>frijoles</td></tr>
    <tr><td>corn (on the cob)</td><td class="vos">choclo</td><td>mazorca</td><td>elote</td></tr>
    <tr><td>soft drink</td><td class="vos"><a href="/slang/gaseosa">gaseosa</a></td><td>refresco</td><td>refresco</td></tr>
    <tr><td>money (casual)</td><td class="vos"><a href="/slang/plata">plata</a>, <a href="/slang/guita">guita</a></td><td>pasta</td><td>lana</td></tr>
    <tr><td>work (casual)</td><td class="vos"><a href="/slang/laburo">laburo</a></td><td>curro</td><td>chamba</td></tr>
    <tr><td>cool</td><td class="vos"><a href="/slang/copado">copado</a></td><td>guay</td><td>padre, chido</td></tr>
  </tbody>
</table></div>

<h2>Which words only exist in Argentina?</h2>
<div class="answer"><p>A lot of them. Some come from <strong>lunfardo</strong>, the old slang of Buenos Aires, and some from Italian. You will hear them in almost every conversation.</p></div>
<ul>
  <li><a href="/slang/che">che</a>: hey (to call someone)</li>
  <li><a href="/slang/boludo">boludo</a>: dude; idiot (it depends on the tone)</li>
  <li><a href="/slang/re">re</a>: really, very ("re lindo")</li>
  <li><a href="/slang/dale">dale</a>: OK, sure, go on</li>
  <li><a href="/slang/quilombo">quilombo</a>: a mess</li>
  <li><a href="/slang/posta">posta</a>: for real, seriously</li>
  <li><a href="/slang/fiaca">fiaca</a>: laziness, not feeling like doing anything</li>
</ul>
<p>See <a href="/argentine-slang">the 50 Argentine words you'll hear every day</a>, or <a href="/slang">all slang words</a> by topic.</p>

<h2>So, which Spanish should I learn?</h2>
<div class="answer"><p>If you are going to Argentina, have Argentine friends or an Argentine partner, learn Argentine Spanish from the start. Everything you learn still works in other countries, and you won't have to unlearn tú later.</p></div>
<p>That is why we built <strong>Posta</strong>: a course that teaches only the Spanish of Argentina, with vos from the first lesson, the everyday words in this table, and spoken practice with real situations.</p>

<h2>Common questions</h2>
`,
  },

  {
    slug: 'voseo',
    title: 'Vos in Argentina: The Complete Guide to Voseo',
    h1: 'Vos in Argentina: how voseo works',
    description: 'What vos is, how to conjugate it (present, commands, past), the few irregular verbs, and the vos forms of the 50 most common verbs.',
    crumb: 'Vos',
    faq: [
      ['What is voseo?', 'Voseo is using vos instead of tú for "you" (one person). In Argentina everyone does it, in every situation. It has its own verb forms: "vos sos", "vos tenés", "vos querés".'],
      ['Is vos rude or informal?', 'No. In Argentina vos is the normal way to talk to anyone, including strangers. People show respect with their tone and with phrases like "disculpá", not by changing to usted.'],
      ['Is the past tense different with vos?', 'No. In the preterite, vos uses the same forms as tú: "vos tuviste", "vos fuiste", "vos comiste". Only the present and the commands change.'],
      ['Which countries use vos?', 'Argentina uses it everywhere, and so does most of Uruguay. It is also used in Paraguay, in much of Central America, and in parts of Colombia, Chile and Bolivia, sometimes with different verb forms.'],
    ],
    body: `
<p class="lede">In Argentina, "you" is <strong>vos</strong>, not tú. It is not slang and it is not rude: it is how everyone talks, to friends, to shop staff and to strangers. The good news: vos is easier than tú.</p>

<h2>What is vos?</h2>
<div class="answer"><p><strong>Vos</strong> is the word for "you" (one person) in Argentina and Uruguay. It replaces tú. "Vos sos" means "you are", "vos tenés" means "you have".</p></div>
<p>You will see "te", "tu" and "contigo" with vos too. Those don't change: "Vos te llamás Ana", "¿Es tu auto?", "Voy con vos" (here "con vos" replaces contigo).</p>

<h2>How do I make the present tense with vos?</h2>
<div class="answer"><p>Take the infinitive, remove the final <strong>-r</strong>, add <strong>-s</strong> and put the accent on the last vowel: hablar → <strong>hablás</strong>, comer → <strong>comés</strong>, vivir → <strong>vivís</strong>.</p></div>
<div class="table"><table>
  <thead><tr><th>Verb</th><th>Vos</th><th>Tú (not used)</th></tr></thead>
  <tbody>
    <tr><td>hablar (to talk)</td><td class="vos">vos hablás</td><td class="tu">tú hablas</td></tr>
    <tr><td>comer (to eat)</td><td class="vos">vos comés</td><td class="tu">tú comes</td></tr>
    <tr><td>vivir (to live)</td><td class="vos">vos vivís</td><td class="tu">tú vives</td></tr>
    <tr><td>querer (to want)</td><td class="vos">vos querés</td><td class="tu">tú quieres</td></tr>
    <tr><td>poder (can)</td><td class="vos">vos podés</td><td class="tu">tú puedes</td></tr>
    <tr><td>dormir (to sleep)</td><td class="vos">vos dormís</td><td class="tu">tú duermes</td></tr>
  </tbody>
</table></div>
<p>Look at the last three. With tú, many verbs change their stem (quiero → quieres, puedo → puedes). With vos they <strong>don't</strong>: querés, podés, dormís. That is why vos is easier.</p>

<h2>Which verbs are irregular with vos?</h2>
<div class="answer"><p>Almost none in the present. The only really different one is <strong>ser: vos sos</strong>. Ir, ver, dar and estar are short but follow the pattern: <strong>vos vas, vos ves, vos das, vos estás</strong>.</p></div>
<div class="table"><table>
  <thead><tr><th>Verb</th><th>Vos</th><th>Tú (not used)</th></tr></thead>
  <tbody>
    <tr><td><a href="/vos/ser">ser</a> (to be)</td><td class="vos">vos sos</td><td class="tu">tú eres</td></tr>
    <tr><td><a href="/vos/ir">ir</a> (to go)</td><td class="vos">vos vas</td><td class="tu">tú vas</td></tr>
    <tr><td><a href="/vos/estar">estar</a> (to be)</td><td class="vos">vos estás</td><td class="tu">tú estás</td></tr>
    <tr><td><a href="/vos/ver">ver</a> (to see)</td><td class="vos">vos ves</td><td class="tu">tú ves</td></tr>
  </tbody>
</table></div>

<h2>How do I give orders with vos?</h2>
<div class="answer"><p>Remove the <strong>-r</strong> and put the accent on the last vowel: hablar → <strong>hablá</strong>, comer → <strong>comé</strong>, venir → <strong>vení</strong>. Even verbs that are irregular with tú are regular with vos.</p></div>
<div class="table"><table>
  <thead><tr><th>Verb</th><th>Vos</th><th>Tú (not used)</th></tr></thead>
  <tbody>
    <tr><td>venir (to come)</td><td class="vos">¡vení!</td><td class="tu">¡ven!</td></tr>
    <tr><td>tener (to have)</td><td class="vos">tené</td><td class="tu">ten</td></tr>
    <tr><td>hacer (to do)</td><td class="vos">hacé</td><td class="tu">haz</td></tr>
    <tr><td>decir (to say)</td><td class="vos">decí, decime</td><td class="tu">di, dime</td></tr>
    <tr><td>poner (to put)</td><td class="vos">poné</td><td class="tu">pon</td></tr>
    <tr><td>salir (to go out)</td><td class="vos">salí</td><td class="tu">sal</td></tr>
    <tr><td>ir (to go)</td><td class="vos">andá</td><td class="tu">ve</td></tr>
  </tbody>
</table></div>
<p>With "me", "lo" or "la" attached, the accent moves so the word keeps its sound: <strong>decime</strong> (tell me), <strong>pasame</strong> (pass me), <strong>avisame</strong> (let me know), <strong>decímelo</strong> (tell me it). For "go", Argentines say <strong>andá</strong>, from andar.</p>

<h2>What about the past tense?</h2>
<div class="answer"><p>In the preterite, vos uses the <strong>same forms as tú</strong>: vos tuviste, vos fuiste, vos dijiste. The imperfect is also the same: vos tenías, vos ibas.</p></div>
<p>You will sometimes hear "tuvistes" or "fuistes" with an extra -s. Many people say it, but it is considered a mistake, so don't write it.</p>

<h2>Negative orders and the subjunctive</h2>
<p>For "don't…" and for the subjunctive, most Argentines use the same forms as tú: <strong>no vengas</strong>, <strong>no te preocupes</strong>, <strong>no digas nada</strong>. You may also hear "no vengás" with the accent at the end; it is common in speech, but "no vengas" is the safe choice.</p>

<h2>Vos forms of the 50 most common verbs</h2>
<p>Each page shows the present, the command and the past with vos, next to tú, plus real example sentences.</p>
<!--VERB_GRID-->

<h2>Common questions</h2>
`,
  },
  {
    slug: 'best-app-to-learn-argentine-spanish',
    title: 'Best App to Learn Argentine Spanish (2026): Vos, Slang & Speaking',
    h1: 'The best app to learn Argentine Spanish',
    description: 'What an app for Argentine Spanish has to teach (vos, lunfardo, the "sh" sound, real speaking practice), why most Spanish apps don\'t, and what Posta does.',
    crumb: 'Best app',
    app: true,
    shots: true,
    faq: [
      ['What is the best app to learn Argentine Spanish?', 'Look for an app made only for Argentine Spanish: one that teaches vos from the first lesson, uses Argentine words inside real sentences, plays every sentence in an Argentine accent and makes you speak out loud. Posta is built for exactly that, from complete beginner to fluent.'],
      ['Is there an app for Argentinian Spanish slang?', 'Yes. Posta has {{WORDS}} Argentine slang and everyday words, lunfardo included, each one inside an example sentence a real person would say, grouped by topic: people, money and work, food and drink, getting around, going out.'],
      ['Is there an app that teaches vos instead of tú?', 'Yes. Posta teaches vos from day one ("vos sos", "vos tenés", "vos querés") and never teaches tú or vosotros as the normal way to talk, because nobody in Argentina uses them.'],
      ['Do general Spanish apps teach Argentine Spanish?', 'Mostly no. Most Spanish courses teach tú and the vocabulary of Spain or Mexico, and mention vos in a note at most. You can still learn a lot of grammar from them, but you will have to relearn the verbs and the everyday words when you get to Argentina.'],
      ['Can I learn Argentine Spanish if I am a complete beginner?', 'Yes. Starting with Argentine Spanish is easier than switching later. The vos forms of the present tense are more regular than tú, so beginners have less to memorize.'],
      ['Is Posta free?', 'Posta is free to download and you can try it before paying. The full course, all the words and the speaking chats are part of Posta Premium, a subscription.'],
    ],
    body: `
<p class="lede">If you want the Spanish people really speak in Buenos Aires, most Spanish apps are the wrong tool: they teach tú, vosotros and the words of Madrid or Mexico City. This page explains what an Argentine Spanish app has to teach, and how Posta does it.</p>
<!--SHOTS-->
<p class="note">We make Posta, so we are not neutral. That's why this page gives you the checklist first: use it to judge any app, including ours.</p>

<h2>What is the best app to learn Argentine Spanish?</h2>
<div class="answer"><p>The best app for Argentine Spanish is one built only for it: <strong>vos from the first lesson</strong>, <strong>Argentine words inside real sentences</strong>, every sentence played in an <strong>Argentine accent</strong>, and <strong>speaking out loud</strong> with corrections. <strong>Posta</strong> is an app made for exactly that, for English speakers, from complete beginner to fluent.</p></div>

<h2>What should an Argentine Spanish app teach?</h2>
<div class="answer"><p>Six things. If an app misses the first two, it is teaching general Spanish, not Argentine Spanish.</p></div>
<ol>
  <li><strong>Vos, with its own verb forms.</strong> "Vos sos", "vos tenés", "vos querés", and commands like "vení" and "decime". Everyone in Argentina uses vos, with friends and with strangers. See <a href="/voseo">how vos works</a>.</li>
  <li><strong>Argentine everyday words.</strong> <a href="/slang/colectivo">Colectivo</a> for bus, <a href="/slang/remera">remera</a> for T-shirt, <a href="/slang/laburo">laburo</a> for work, <a href="/slang/plata">plata</a> for money. Not as a list at the end, but in the sentences you learn from day one.</li>
  <li><strong>Ustedes, never vosotros.</strong> Argentina uses ustedes for "you all", like the rest of Latin America.</li>
  <li><strong>The Argentine accent.</strong> "Yo me llamo" sounds like "sho me shamo". If the audio is in a Spain or Mexico accent, your ear won't be ready for Buenos Aires.</li>
  <li><strong>Speaking practice.</strong> Reading and tapping is not enough. You need to say things out loud in real situations (ordering, asking for directions, small talk) and get corrected.</li>
  <li><strong>Culture.</strong> Mate, asado, football, how to greet people with a kiss. It is what makes the words make sense.</li>
</ol>

<h2>Do general Spanish apps teach Argentine Spanish?</h2>
<div class="answer"><p>Mostly no. Most Spanish apps teach tú and the vocabulary of Spain or Mexico, and mention vos in a note at most. That Spanish is understood in Argentina, but it sounds foreign, and you will have to relearn the verbs and the everyday words when you arrive.</p></div>
<div class="table"><table>
  <thead><tr><th>What you need</th><th>Typical Spanish app</th><th>Posta</th></tr></thead>
  <tbody>
    <tr><td>"You"</td><td class="tu">tú (and vosotros)</td><td class="vos">vos (and ustedes)</td></tr>
    <tr><td>"Do you want…?"</td><td class="tu">¿Tú quieres…?</td><td class="vos">¿Vos querés…?</td></tr>
    <tr><td>Bus, T-shirt, work</td><td class="tu">autobús, camiseta, trabajo</td><td class="vos">colectivo, remera, laburo</td></tr>
    <tr><td>Slang and lunfardo</td><td>little or none</td><td>{{WORDS}} words, each in a real sentence</td></tr>
    <tr><td>Accent</td><td>Spain or Mexico</td><td>Argentine</td></tr>
    <tr><td>Speaking</td><td>varies</td><td>out-loud chats with corrections</td></tr>
  </tbody>
</table></div>

<h2>What does Posta teach?</h2>
<div class="answer"><p>Posta is a phone app for learning Argentine (Rioplatense) Spanish. It has four parts: a full course, a word list of Argentine slang, culture classes, and spoken chats with Pancho, a carpincho (capybara) who is your guide.</p></div>
<ul>
  <li><strong>The course.</strong> A full Argentine Spanish course, from complete beginner to fluent, in short daily lessons built from sentences people really say, with vos from day one.</li>
  <li><strong>Words.</strong> {{WORDS}} Argentine slang and everyday words, lunfardo included, each inside a sentence a real person would say. Start with <a href="/argentine-slang">the 50 words people say every day</a>.</li>
  <li><strong>Culture.</strong> One-minute classes on mate, asado, football, food and how Argentines really do things.</li>
  <li><strong>Speaking.</strong> Out-loud role-play chats: Pancho plays the waiter, the kiosquero, the taxi driver. When you make a mistake he shows you the fix, a one-line why, and how a porteño would say it. Four levels, from Beginner to Local.</li>
</ul>

<h2>Who is Posta for?</h2>
<div class="answer"><p>English speakers with a reason to sound Argentine: people visiting Argentina, people moving to Buenos Aires, and people with an Argentine partner or family. It works for complete beginners and for people who already speak another Spanish and want to switch to vos.</p></div>

<h2>Is Posta on iPhone and Android?</h2>
<div class="answer"><p>Posta is a phone app for iPhone and Android. It is free to download; the full app is a subscription called Posta Premium.</p></div>

<h2>What else helps you learn Argentine Spanish?</h2>
<p>An app is the daily habit, not the whole plan. Add Argentine series and podcasts, practice with Argentine friends or a tutor from Argentina, and learn the slang you hear around you. Our <a href="/learn-argentine-spanish">step-by-step guide to learning Argentine Spanish</a> has the full plan, and <a href="/argentine-spanish-vs-other-spanish">Argentine Spanish vs Spain and Mexico</a> shows what changes.</p>

<h2>Common questions</h2>
`,
  },
];

// The 50 words for /argentine-slang, in the order they appear.
export const top50 = [
  'che', 'boludo', 'dale', 're', 'posta', 'qué onda', 'todo bien', 'viste', 'o sea', 'tipo',
  'chabón', 'pibe', 'piba', 'mina', 'flaco', 'capo', 'loco', 'laburo', 'laburar', 'plata',
  'guita', 'luca', 'mango', 'garpar', 'birra', 'boliche', 'joda', 'previa', 'bondi', 'quilombo',
  'trucho', 'fiaca', 'bajón', 'bronca', 'embole', 'copado', 'mala onda', 'al pedo', 'ni en pedo', 'en pedo',
  'dar bola', 'es un montón', 'por las dudas', 'no te puedo creer', 'zafar', 'bancar', 'fijarse', 'morfar', 'chau', 'buen día',
];
