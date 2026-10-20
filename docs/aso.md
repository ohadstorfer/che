# Posta ASO: keywords, title and metadata

Research date: 2026-10-20 (US stores). There are no absolute search volumes here. Demand is inferred from Google autocomplete, App Store results (iTunes Search API, a close proxy for App Store search) and Google Play web search results. **Before launch, check the real numbers in Apple Ads** (see section 6).

## 1. Keyword landscape

**The main finding: the niche is almost empty.** On the App Store, searching "argentinian spanish" returns Che: Argentinian Dictionary (3 ratings), Porteño Spanish (17 ratings, Travel category) and Flamingo Spanish (Argentina) (2 ratings), followed by generic Spanish apps. On Google Play the biggest app is Learn Spanish Argentina, with 5K+ installs. "rioplatense", "voseo" and "lunfardo" return **no relevant app** on the App Store. Posta should reach the top 3 for every niche term. The real work is converting those searches into installs and picking up long-tail combinations.

| # | Term | Demand (signal) | Competition | Where it goes |
|---|---|---|---|---|
| 1 | argentinian spanish | Highest in the niche. Autocomplete: lessons, app, phrases, accent, slang, "learn … free/online/app/podcast/reddit" | Low (Che, Porteño Spanish, Flamingo; GP: Che 1K+, Learn Spanish Argentina 5K+) | Name |
| 2 | argentine spanish | Similar. "learn argentine…" gets mixed up with **argentine tango** | Low. **Apple treats it as a different word**: Che, which has "Argentinian" in its name, doesn't show up for "argentine spanish" | iOS keywords, GP short desc |
| 3 | argentina (spanish argentina, learn spanish argentina) | Medium | Low–medium (generic apps fill the results) | iOS keywords |
| 4 | argentinian / argentine slang | Medium–high (words, phrases, boludo, insults, "for friend/bro") | Low (GP: Argentinian Slangs 10+) | Subtitle ("slang") |
| 5 | spanish slang | Medium | Medium (Güey Spanish, Qué Onda, Slangly) | Combination of name + subtitle |
| 6 | argentinian spanish phrases / accent / pronunciation | Medium (autocomplete) | Low | iOS keywords |
| 7 | argentinian spanish lessons / course | Medium | Low | Keywords / description |
| 8 | rioplatense (spanish) | Low–medium (accent, dialect, vs mexican) | **None** on the App Store | iOS keywords |
| 9 | lunfardo | Low (English intent: meaning, words) | None on iOS; GP: Lunfardario | iOS keywords |
| 10 | voseo | Low, grammar intent (conjugation, vs tuteo) | None | iOS keywords |
| 11 | porteño spanish | Low ("porteño spanish app" exists) | Only Porteño Spanish | iOS keywords ("porteno" is fine: Apple ignores the ñ) |
| 12 | buenos aires spanish | Low–medium (school/classes/course intent) | Low (travel guides) | iOS keywords |
| 13 | ai tutor / spanish tutor / spanish conversation | High | **High** (Speak, Stella, Duolingo Max, Praktika) | Combination only. Not a realistic target at first |
| 14 | learn spanish | Very high | Very high | Only as part of longer combinations |
| 15 | castellano | Low among English speakers (results are Spanish dictionaries) | — | es-MX only |
| ✗ | argentinian spanish translator | Medium–high on Google | — | **Don't use.** Posta isn't a translator, and Apple rejects irrelevant keywords |
| ✗ | che, porteño spanish (as a phrase) | — | Names of competing apps | Apple bans competitor names in keywords. "porteno" alone is a generic word and is fine |

Brand: "posta" on its own is crowded with postal apps (Posta Shqiptare, Pošta Srbije, PosteID). In reels, say **"Posta Argentinian Spanish"**, not just "Posta".

## 2. Apple: name + subtitle

Rules (Apple, [developer.apple.com/app-store/search](https://developer.apple.com/app-store/search/)): only the name, subtitle, keywords and primary category are indexed. Promotional text is not. Words already in the name or subtitle shouldn't be repeated in keywords, and plurals count as repeats. Use commas without spaces, no "app"/"the" filler, and no competitor names. Apple combines words from all three fields **within the same localization**.

**Argentinian or Argentine?** Use **"Argentinian" in the name and "argentine" in keywords.** (a) On Google, "learn argentinian spanish" has the richer learner autocomplete, while "learn argentine" gets taken over by tango. (b) On Google Play, 4 of the top 5 titles say "Argentinian". (c) Apple doesn't merge the two words, so you need both tokens, and the name gets more weight. Make sure Argentine appears somewhere (keywords + an es-MX name, see section 5).

| | Name (≤30) | Subtitle (≤30) | Pros | Cons |
|---|---|---|---|---|
| **A ★** | Posta: Argentinian Spanish (26) | Learn slang, speak like locals (30) | "learn", "slang" and "speak" in heavily weighted fields. Covers "learn argentinian spanish", "argentinian slang", "speak argentinian spanish". Clear promise | Drops "vos/lunfardo" from the visible text (they go in keywords) |
| B | Posta: Argentinian Spanish (26) | Slang lessons & AI voice tutor (30) | Covers "lessons" and "AI tutor". Shows what sets Posta apart from dictionary apps | "learn" moves to keywords. "AI tutor" on its own is too competitive |
| C (current) | Posta: Argentinian Spanish (26) | Learn vos, slang & lunfardo (27) | Very clear to anyone who already knows the topic | "vos" and "lunfardo" get almost no searches and waste the subtitle's weight. A beginner doesn't understand them |
| D | Posta: Learn Argentine Spanish (30) | Slang, voseo & AI voice tutor (29) | Exact match for "learn argentine spanish" | Loses "Argentinian", the stronger form. Name is at the 30-character limit |
| E | Posta: Argentine Spanish (24) | Rioplatense slang & AI tutor (28) | Good as the **es-MX name** (section 5) | As the main name, same problem as D |

**Pick: A.** Keep the name as it is and change the subtitle to "Learn slang, speak like locals". If conversion is low after 6 weeks, try B (changing the subtitle requires a new version).

## 3. Apple keyword field (EN-US, for pick A)

```
argentine,argentina,lunfardo,voseo,rioplatense,porteno,buenos aires,ai,tutor,accent,phrases,lessons
```
**99/100.** No repeats of posta/argentinian/spanish/learn/slang/speak/like/locals.
What I dropped from the current field and why: `castellano` (English speakers don't search it, so it moves to es-MX), `speak` (now in the subtitle), `conversation` (12 characters, moves to es-MX), `travel`/`expat`/`chat` (moved to es-MX and UK).

If you choose B instead: `argentine,argentina,lunfardo,voseo,rioplatense,porteno,buenos aires,accent,phrases,learn,speak,chat` (99).

## 4. Google Play

Google indexes the title, the short description and the full description, and it understands variants. Searching "argentine spanish" returns apps with "Argentinian" in the title, so the brand doesn't have to change. Policy: no "best/#1/free" in the title, and no keyword lists or repeated keywords.

**Title (≤30)**
- **Posta: Argentinian Spanish (26) ★**: consistent with iOS
- Posta: Learn Argentine Spanish (30): adds "learn". Every GP competitor has it in the title
- Posta: Argentinian Spanish AI (29): only if the AI tutor becomes the main pitch

**Short description (≤80)**
- **"Learn Argentine Spanish & slang: vos, lunfardo, lessons & an AI voice tutor" (75) ★**: adds "learn" and "Argentine", the two words the title is missing
- "Speak Argentinian Spanish like a local: real slang, vos, lessons & an AI tutor" (78)
- Current: "Learn the Spanish Argentina actually speaks: vos, real slang, out-loud chats." (77): good tone, but it's missing "Argentine/Argentinian"

**Full description (~4,000 characters): terms to include naturally** (target total: the main keyword at about 1–2% of words, no lists)

| Term | Times |
|---|---|
| Argentinian Spanish | 4–6 (first sentence + at least one heading) |
| Argentine Spanish | 2–3 |
| Argentina / Argentines | 3–4 |
| learn / speak / practice | 3–5 total |
| slang / Argentinian slang | 4–6 |
| lunfardo | 2–3 |
| vos / voseo ("vos sos, not tú eres") | 2–3 |
| rioplatense, Uruguay | 1–2 |
| Buenos Aires, porteño | 2–3 |
| accent, pronunciation | 1–2 |
| phrases, words, vocabulary (~1,000 slang words) | 2–3 |
| AI tutor, voice chat, conversation, speaking practice (Pancho) | 2–3 |
| lessons, course, A1–B2 | 2–3 |
| travel, moving to Argentina, expat, partner/family | 1–2 each |
| culture, widget, streak | 1 each |

## 5. Localizations = more keyword space

According to Apple's table ([App Store localizations](https://developer.apple.com/help/app-store-connect/reference/app-store-localizations)), the **US store** also supports Spanish (Mexico), French, Portuguese (BR), Chinese, Korean, Russian, Arabic and Vietnamese. ASO tools report that **Spanish (Mexico) is indexed in the US**. Each localization has its own name, subtitle and keywords (+160 characters), but **words aren't combined across localizations**, so each one has to be able to complete a phrase on its own.

**Spanish (Mexico): do this first.** It's also the default language in Argentina and Mexico, so the copy can stay in English. Posta's UI is English.
- Name: `Posta: Argentine Spanish` (24): this way "argentine spanish" is in a name too
- Subtitle: `Rioplatense slang & AI tutor` (28)
- Keywords: `learn,speak,expat,travel,dictionary,words,conversation,pronunciation,dialect,uruguay,castellano,vos` (99)

**English (UK)**: used in the UK, and as an extra language in Australia, Argentina, Mexico, Spain and most other stores (useful for expats with an English-language phone). It's the only slot in the UK, so it has to cover everything on its own:
- Same name/subtitle as A
- Keywords: `argentine,argentina,lunfardo,voseo,rioplatense,porteno,buenos aires,ai,tutor,accent,phrases,expat` (97)

Optional later: French as a third US slot (indexing is less proven). Try it only once you have impression data. Risk: a user with a phone in that language sees that page, so keep it in English and well written.

## 6. What to measure and when to change things

**Before launch (free):** create an Apple Ads campaign without enabling it and look at the **popularity** (5–100) of: argentinian spanish, argentine spanish, argentina spanish, argentinian slang, rioplatense, lunfardo, voseo, buenos aires spanish, spanish slang, spanish tutor. If "argentine" turns out to be more popular than "argentinian", swap them (EN-US name ↔ es-MX name).

**Weekly after launch:**
- App Store Connect → Analytics → Sources: **App Store Search** impressions, product page views and downloads, and impression → download conversion (benchmark for Education: ~3–6%).
- Rankings for the 15 terms (Astro, AppFigures or AppTweak, any cheap tool). Target: top 3 in the niche within 2–3 weeks.
- Play Console → Store performance / Acquisition: **search terms** with visitors and installs.

**Iteration rhythm:**
- iOS: name, subtitle and keywords only change with a new version. Change one block at a time and wait **3–4 weeks** before judging. Swap out any keyword that still has no impressions after 4 weeks.
- **Product Page Optimization** (iOS): test icon and screenshots (up to 3 versions, ~2–4 weeks for a winner at this volume). First test: screenshot 1 with "vos sos, not tú eres" vs. a Pancho voice chat.
- **Custom product pages tied to keywords** (since 2025): one page per intent, for example slang/lunfardo (dictionary screenshots) vs. travel/Buenos Aires (phrases + culture screenshots).
- Google Play: **Store listing experiments** for the short description and screenshots (A/B test with 50/50 traffic).
- If conversion is good but impressions are low: the niche has no volume, so open up longer combinations ("spanish slang", "spanish tutor") in the subtitle (variant B). If impressions are good but conversion is low: work on screenshots first, not keywords.

## Sources
- Apple: [App Store search guidance](https://developer.apple.com/app-store/search/) · [App Store localizations table](https://developer.apple.com/help/app-store-connect/reference/app-store-localizations)
- Cross-localization (es-MX indexed in the US, no combining across locales): [MobileAction](https://www.mobileaction.co/blog/app-store-cross-localization/), [AppFollow](https://appfollow.io/blog/how-to-expand-on-iOS-localization-for-usa)
- Keyword field (commas, plurals, no repeats): [AppTweak](https://www.apptweak.com/en/aso-blog/how-to-optimize-your-ios-keyword-field)
- Custom product pages with keywords: [Phiture](https://phiture.com/blog/keyword-based-custom-product-pages-cpps-arrive-in-app-store-connect/), [Adapty](https://adapty.io/blog/custom-product-pages-app-store/)
- Competitors: iTunes Search API (US) and play.google.com/store/search (US), queried 2026-10-20; Google autocomplete (hl=en, gl=us) used as the demand signal.
