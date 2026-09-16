# How Duolingo works: algorithms, data model, lesson building

Research date: 2026-09-16. This is compiled from Duolingo's own papers, code, datasets, blog posts and shareholder letters, plus outside analyses. It describes **mechanisms only**: no Duolingo sentences or exercises are copied into Che. The comparison with our code is in [`duolingo-vs-che.md`](duolingo-vs-che.md).

**How sure each claim is**
- **[P]** Primary: Duolingo's paper, code, dataset, blog, investor letter or staff-written article.
- **[T]** Third party: press, independent researchers, newsletters.
- **[C]** Community: fandom wiki, duoplanet, duome.eu, duolingodata.com, scraped API/session JSON.
- **[S]** Our own inference; not confirmed anywhere.

**Dates matter.** The system changed several times:

| Years | Era |
|---|---|
| 2012–2018 | Tree + strength bars (Leitner, then HLR) |
| 2018 | Crowns |
| 2019 | Cracked skills; CEFR rebuild of ES/FR/EN |
| 2020 | Birdbrain + adaptive lessons |
| 2021 | Volunteer Incubator ends |
| 2022 | The **path** |
| 2023+ | GPT-4 features and LLM-assisted content |
| 2025 | 148 AI-built courses; Energy replaces Hearts |
| 2026 | End-of-unit mastery check; content up to B2 |

---

## 0. Sources actually read

### research.duolingo.com
The page lists **21 publications and stops at 2021**. PDFs live at `research.duolingo.com/papers/<file>`.

| Read in full (text + code where it exists) | Summarised from abstract / secondary |
|---|---|
| Settles & Meeder 2016, *A Trainable Spaced Repetition Model* (HLR) + `github.com/duolingo/halflife-regression` | Streeter 2015, *Mixture Modeling of Individual Learning Curves* |
| Settles et al. 2018, *Second Language Acquisition Modeling* (SLAM) | Portnoff et al. 2021, *Assessment at Scale: Duolingo Case Study* (via its blog version) |
| Mayhew et al. 2020, *STAPLE* + `github.com/duolingo/duolingo-sharedtask-2020` | Settles et al. 2020, *Machine Learning–Driven Language Assessment* (TACL) |
| Yancey & Settles 2020, *Sleeping, Recovering Bandit* (KDD) | McCarthy et al. 2021, *Jump-Starting Item Parameters* |
| | Pajak 2016 ×2, Markant 2016, Römer 2019, and the reading / phonetics papers (low relevance) |

### Newer primary work not listed on research.duolingo.com
- Duolingo Method whitepaper (2023)
- Efficacy report DRR-24-04 (2024), the most precise official description of the path
- *From Tarzan to Tolkien* (CEFR-controlled LLM text, ACL Findings 2024)
- *LLM-Augmented Exercise Retrieval* (LAK 2024)
- Klinton Bicknell's paper list (klintonbicknell.com/papers.html), the best running index

### Other sources
- **Datasets (Harvard Dataverse):** HLR traces, SLAM 2018, STAPLE 2020, notification bandit.
- **GitHub:** the org has 12 public repos. Only `halflife-regression` and `duolingo-sharedtask-2020` are about learning; `whosaidit` (2026) is a speaker-attribute dataset. **Nothing** public exists for Birdbrain, the session generator, the course schema or the grader.
- **Blog:** blog.duolingo.com engineering and learning posts, cited inline below.
- **Investor letters:** Q1 FY2025 and Q1 FY2026 shareholder letters (SEC).
- **Outside analyses:** Papoušek 2017 (HLR critique), open-spaced-repetition srs-benchmark, IEEE Spectrum 2023 (Birdbrain, written by Duolingo staff), Jorge Mazal on Lenny's Newsletter, Mogavi et al. L@S 2022, duoplanet, duome.eu, duolingodata.com, and the KartikTalwar unofficial API.

---

## 1. Content data model

### 1.1 The atom is an inflected lexeme, not a word [P]
Every sentence in a course is run through a **lexeme tagger**, which works in two steps:
1. A finite-state transducer built on the Apertium dictionary and Wiktionary proposes candidate analyses.
2. An HMM picks the right analysis in context: `como` → `comer.V.PRES.P1.SG` vs `como.ADV.CNJ`.

Sentences are **indexed by these tags**. A skill or unit teaches a set of tags, and lessons pull the exercises indexed with those tags. A tree-era course taught **3,000–5,000 lexeme tags**. (HLR paper, Appendix A.1)

Tag format from the public HLR dataset:
```
surface/lemma<pos><features...>
es/ser<vbser><pri><p3><sg>
escribimos/escribir<vblex><pri><p1><pl>
blancos/blanco<adj><m><pl>
ellos/prpers<prn><tn><p3><m><pl>
y/y<cnjcoo>
<*sf>  = any surface form of the lemma      <*numb> = singular or plural
```

The unofficial vocabulary API exposed the same lexemes to learners [C]:
```js
{ word_string: "am", lexeme_id: "2ffc…", related_lexemes: ["bb73…"],   // other inflections of the lemma
  pos: "Preposition", gender: "Masculine", skill: "Dative Case",
  strength: 0.999987, strength_bars: 4, last_practiced: "2015-07-09T06:07:37Z" }
```

A 2020s session JSON tags each challenge with **knowledge components** [C]:
```json
"taggedKcIds": [{"legacyId": "72de088a…", "kcTypeStr": "lex"}]
```

### 1.2 Sentences and exercises [P + C]
- **"Each exercise attempts to introduce only one new word or inflection, so all other tokens should have been seen by the student before."** (SLAM 2018) Blog posts restate this as "one new concept per sentence" (*nuts and bolts of course creation*, 2020).
- **Parsing:** SLAM gold answers are parsed with Universal Dependencies (POS, morphological features, dependency head). This strongly suggests the course's sentence store carries parses.
- **Scraped challenge fields [C]:**
  - Text and answers: `prompt`, `correctSolutions`, `compactTranslations` (the compressed accepted set), `grader` (an FSM, §6)
  - Tokens and choices: `tokens[].hintTable` (the tap-for-meaning dictionary), `choices`, `correctIndices`, `correctTokens`, `wrongTokens`
  - Bookkeeping: `newWords`, `taggedKcIds`, `challengeGeneratorIdentifier`
- **Hints:** in the Incubator, a hint was "generally the translation of the best accepted solution" [C].

### 1.3 Curriculum hierarchy
```
course ─ section (CEFR band) ─ unit (can-do objective + guidebook) ─ level/node ─ lesson ─ exercises
```
- **Tree era [P]:**
  - Skills formed a dependency graph drawn on a grid (`coords_x/y`, `dependencies`).
  - Each skill had lessons, tips (`explanation`), `num_lexemes`, and a decaying `strength`.
  - Crowns (2018): levels 0–5 per skill, with harder content at higher levels.
- **Path [P] (announced May 2022, rolled out to everyone Nov 2022):**
  - One path circle equals one old crown level.
  - Levels from different old skills are **interleaved**.
  - Stories and review/practice lessons are **mandatory** nodes on the path.
  - Tips became unit **Guidebooks**, holding key phrases and grammar tips.
  - Legendary moved to the unit level.
- **Path, 2024 efficacy report [P]:**
  - Units each carry "a set of learning objectives".
  - Lessons exist at **three difficulty levels on the same material**: low (new material, mostly recognition), medium, and high (more recall and production). The three are interleaved.
- **Unit shape today [C]:**
  - About 10 levels per unit.
  - Node types: lesson, personalized practice (dumbbell), story, DuoRadio, roleplay/video call, chest, unit review/Legendary (trophy).
  - A lesson is "up to ~17 questions".
- **Spanish from English [C]** (duolingodata snapshot):

  | Section | CEFR | Units |
  |---|---|---|
  | 1 | intro | 8 |
  | 2–3 | A1 | 26, 28 |
  | 4 | A2 | 52 |
  | 5–6 | B1 | 50, 50 |
  | 7–8 | B2 | 36, 36 |

  About 7,650 lessons and about 8,000 words in total. Details: `docs/course/duolingo-structure.md` and `docs/research/duolingo-spanish-section-1.md`.
- **2026 [P] (Q1 FY26 letter):**
  - A **mastery session at the end of every unit** "won't let users proceed until they've mastered the previous concepts". Duolingo also uses it as a signal of how well each unit teaches.
  - Q1 2026 alone published **20,500 units**, up from 1,800 per quarter in 2024.

### 1.4 Key numbers

| Metric | Value | Source |
|---|---|---|
| New words per lesson | **5–7** | [P] blog *right level of difficulty*, 2024 |
| New items per sentence | **1** | [P] SLAM 2018 |
| Words per CEFR A-level | **~800** (A1, A2 each) | [P] blog *how courses are evolving*, 2019 |
| Checkpoint quiz | 15 questions | [P] same |
| Stories | 90% known / 10% new language | [P] 2024 |
| Sessions to finish A2 (section 4) | ~2,500 (~200 h) | [P] DRR-24-04 |
| **Average session accuracy** | **93% (ES)**: "intentionally… high" | [P] DRR-24-04 |
| Session mix (2015 cohort) | lessons 77%, practice 22%, tests 1% | [P] SLAM 2018 |
| Accepted answers per translation exercise | avg >200, up to 30,000 | [P] blog 2019 |
| Birdbrain "target difficulty" in session metadata | 0.89 | [C] scraped JSON |

---

## 2. Spaced repetition: HLR

### 2.1 Model [P] (paper + `experiment.py`)
```
p̂  = 2^(-Δ/ĥ)                 Δ = days since the lexeme was last practised
ĥ  = 2^(Θ·x)                  half-life in days, log-linear in features x
h_obs = -Δ / log2(p)          "observed" half-life from the session's recall rate

loss = (p - p̂)² + α(h_obs - ĥ)² + λ‖Θ‖²     α=0.01  λ=0.1  η=0.001
features x: bias=1, sqrt(1+history_correct), sqrt(1+history_wrong), [lexeme indicator]
clip: ĥ ∈ [15 min, 274 days];  p̂ ∈ [0.0001, 0.9999]
```

- **`p` is a session proportion**, not a single answer: `session_correct / session_seen` for one (user, lexeme) in one lesson or practice.
- **Leitner and Pimsleur are special cases:**
  - Leitner: `h = 2^(right − wrong)`
  - Pimsleur: `h = 2^(2.35·n − 16.46)`
- **Training:** SGD with per-feature AdaGrad-style rates, one shuffled pass, 90/10 split.

### 2.2 Data record [P] (Dataverse doi:10.7910/DVN/N8XJME, 12.9M rows, 2 weeks)
```
p_recall,timestamp,delta,user_id,learning_language,ui_language,lexeme_id,lexeme_string,history_seen,history_correct,session_seen,session_correct
1.0,1362076081,27649635,u:FO,de,en,76390c13…,lernt/lernen<vblex><pri><p3><sg>,6,4,2,2
```

### 2.3 Results and what actually shipped [P]

| Model | MAE ↓ | AUC ↑ | COR_h ↑ |
|---|---|---|---|
| HLR | 0.128 | 0.538 | 0.201 |
| HLR −lex | 0.128 | 0.537 | 0.160 |
| Leitner | 0.235 | 0.542 | −0.098 |
| Pimsleur | 0.445 | 0.510 | −0.132 |
| constant p̄=0.859 | 0.175 | — | — |

**A/B test I (HLR vs Leitner, ~1M users):**
- Practice sessions −7.3%, yet lessons +0.3%.
- Read as fewer people grinding "to keep the tree gold". HLR shipped.

**A/B test II (HLR −lex vs HLR, 3.3M users): any activity +12%, practice +9.5%, lessons +1.7%.**
- Per-word weights overfit: some words "decay rapidly regardless of how often they practiced".
- Per-word weights also have no data for new courses.
- **So production used only bias + √right + √wrong, with no word identity.** The paper suggests shared features instead (POS, tense, frequency, length).
- **Hard categories (negative weights):** past participles, gerunds, the imperfect, irregular forms. Spanish examples: `quedado` −0.73, `pensando` −0.33.

### 2.4 How HLR was used [P]
- **Strength bars:** the mean p̂ of a skill's words, shown as 4 bars.
- **Practice sessions:** "identical to lessons, except that the exercises are taken from those indexed with words due for practice".
- **Within a lesson:** a lesson "continues until the student masters all target words", estimated by a mixture model of short-term learning curves (Streeter 2015).

### 2.5 Critiques [T]
- **Papoušek 2017:**
  - Recall is lowest at *very short* lags (items not yet learned), which HLR can't express.
  - Most traces are only 2–3 reviews long.
  - There are no learner-level features.
- **srs-benchmark on Anki data:**

  | Model | Log loss | AUC |
  |---|---|---|
  | HLR | 0.469 | 0.637 |
  | predict the average | 0.395 | — |
  | FSRS-6 | 0.346 | 0.703 |

- **Lesson:** HLR matters historically, but it is not state of the art. What carries over is the *logging schema* and the *−lex* finding.

### 2.6 After HLR [P]
- **2018:** crowns removed visible decay ("whenever we tried to add harder content, engagement went down").
- **2019:** **cracked skills** brought skill-level spacing back.
- **2022:** the path removed visible decay again. Spacing now lives in **path order** plus separate **personalized practice**.
- **2022 blog:** "additional models determine when to practice previously learned words", separate from Birdbrain.
- **Dec 2023:** personalized practice "use[s] spaced repetition (along with accuracy) to select which words and grammar you'll review". **At the end of a lesson you review any mistakes you made.**

---

## 3. Difficulty and selection: Birdbrain + Session Generator

### 3.1 Session Generator [P] (2017 Scala rewrite)
- **Input:** course data compiled offline and serialised to S3, plus the user's personalisation data sent with each request.
- **Output:** an ordered list of exercises. Latency went from 750 ms to 14 ms after the rewrite.
- **Rules mentioned elsewhere:**
  - A cap on exercises of the same type per lesson.
  - The learner can switch word bank ↔ keyboard (2020).
  - Exercise mix varies by native language (e.g. English for Spanish speakers moves quickly past conjugation).

### 3.2 Birdbrain V1 (2020): IRT / Elo [P] (blog Oct 2020; IEEE Spectrum Feb 2023)
- **Idea:** logistic regression "inspired by item response theory". Each learner has an **ability**, each exercise a **difficulty**.
- **Update:** one SGD step per answered exercise, "a generalization of Elo". A wrong answer lowers ability and raises difficulty, by more when the outcome was surprising.
- **Difficulty is additive over components:** exercise type, the words in it, and so on.
- **Rollout:** more than 20% of lessons were personalised by Oct 2020; the model was retrained daily.
```
P(correct) = σ(θ_user − Σ_k d_k)       d_k: exercise format, each lexeme, …
θ_user += η (y − P);   d_k −= η (y − P)
```
[S] The update above is reconstructed from the prose description. Duolingo never published the exact equations.

### 3.3 Birdbrain V2 (2022+): LSTM [P]
- A learner's history is compressed into a 40-d state, updated after each exercise. It can separate "good at past tense" from "weak at future".
- **Scale:** V1 was switched off in May 2022. The model handles more than 500M–1B exercises a day, streamed mid-lesson so abandoned lessons still count.
- **2024:** separate models estimate **grammar-concept** proficiency and **vocabulary** proficiency.

### 3.4 What the generator targets
- **Selection criterion:** "which of all possible exercises are at just the right difficulty for *this* learner" [P]. The exact rule is **not published**.
- **Clues:**
  - Scraped session metadata shows `target difficulty: 0.89` [C].
  - Average session accuracy is kept at about 93% by design [P].
  - [S] This implies choosing exercises with predicted p(correct) around 0.85–0.9.
- **Adaptive lessons (May 2020) [P]:** "if you're getting everything right, the exercises at the end of the lesson are replaced with more challenging exercises from higher levels".
- **Difficulty labels (2021) [P]:** marking hard exercises as hard *raised* time spent, next-day return and willingness to try harder content.

### 3.5 Review exercises as measurement [P] (Portnoff et al. EDM 2021)
- About 300k randomly sampled **old** items a day are inserted into lessons purely to measure recall.
- They are analysed with regression discontinuity.
- **Findings:** levelling a skill beyond what's required, and moving on to later skills, both improve recall.

---

## 4. Lesson composition

### 4.1 Exercise formats [P + C]
- **In research data (SLAM):**
  - `reverse_translate`: typed translation into the target language
  - `reverse_tap`: word bank with distractors
  - `listen`: type what you hear
- **Formats named by the community [C]:**
  - Translation, both directions: typed or word bank
  - Matching and listening: tap the pairs (match), what do you hear, type what you hear
  - Speaking: speak this sentence
  - Choice and completion: fill in the blank (3 choices), select the image, complete the chat, read and respond
  - Timed: Match Madness, Rapid Review
- **Internal challenge types [C]:** `translate`, `listenTap`, `select`, `judge`, `form`, `name`, `characterMatch`, `completeReverseTranslation`, `listenComprehension`, `partialReverseTranslate`, `tapComplete`, `gapFill`, `assist`, `match`, `speak`.
- **2026 [P]:** "spoken tokens" let learners answer most exercises by voice, plus Flashcards and Speaking Adventures.

### 4.2 New vs review, and the ramp [P]
- **Per lesson:** 5–7 new words. Each sentence holds one new item; everything else is known ("i + 1").
- **Across a unit:** the same material comes back in low → medium → high difficulty lessons, i.e. recognition → recall → production.
- **Path order:** revisit soon after first contact, then at growing gaps. Spacing is **built into the path order**.
- **Per learner:** personalized practice nodes and the Practice Hub add review chosen by SRS plus accuracy.
- **End of lesson:** a replay of that lesson's mistakes.
- **Stories:** 90/10 known/new. Their text is checked with the CEFR Checker.

### 4.3 Practice outside the path [P + C]
- **Practice Hub modes:** Mistakes, Words (recommended words), Speaking, Listening, Stories, Radio, Adventures, Legendary (harder, no hints), Match Madness.
- **Access:** free since 2026.
- **Session size:** Mistakes and Listening sessions are 10 exercises [C].
- **Legendary:** 40 XP; lives and no hints [C].
- **Critique [T/C]:** the path removed learners' visible, personal decay, and practising old material got harder. This is the most common complaint about the path.

---

## 5. Leveling: CEFR and the Duolingo Score [P]

- **CEFR rebuild (2019):** ES, FR and EN were rebuilt around **CEFR can-do statements**, with ~800 words per A-level.
- **Curriculum steps (2020):**
  1. Communicative goals
  2. The words and phrases each goal needs
  3. Grammar concepts
  4. Vocabulary paired with a grammar topic

  CEFR "doesn't give more detail than that", so in-house research fills the gaps. Scope & Sequence documents exist for ES, FR and EN.
- **CEFR Checker:**
  - **Seed labels:** 8,800 English words labelled by hand (5.2k Spanish, 5.6k French).
  - **Model:** ordinal logistic regression on OpenSubtitles frequency plus multilingual embeddings.
  - **Used for:** levelling Stories and podcasts.
- **Duolingo Score (Oct 2024):** a 0–160 scale shared with the Duolingo English Test (DET). Its computation is not published.

  | Score | CEFR |
  |---|---|
  | 0–9 | very early A1 |
  | 10–29 | A1 |
  | 30–59 | A2 |
  | 60–99 | B1 |
  | 100–129 | B2 |
  | 130–160 | C1/C2 |

  Content reached Score 129 (B2) in 2026.
- **DET (TACL 2020):**
  - Item difficulty is predicted by ML "vocabulary" and "passage" scale models trained on CEFR-labelled data.
  - This avoids pilot testing new items. McCarthy 2021 extends it to jump-starting item parameters.
  - The same idea could rate new course content [S].
- **Placement:** the placement test can skip about the first 20% of the path. "Jump here?" tests skip to a later unit.

---

## 6. Grading and accepted answers

- **Accepted-answer lists [P]:**
  - Curated by humans: on average more than 200 accepted answers per translation exercise, up to 30,000 for long sentences.
  - About 10% of "my answer should be accepted" reports are valid.
  - Since 2019, a logistic regression over word and bigram features ranks reports for reviewers.
- **Matching [P]:**
  - "A finite-state machine aligns the learner's response to the most similar reference answer… based on token string edit distance."
  - Research labels ignore case, punctuation and accents.
  - Known grammar slips detected via lexeme tags (`es`/`est`) get a plain-language explanation. Anything else gets a **diff** against the closest accepted answer.
  - Scraped `grader` FSM [C]: `{"vertices":[[{"to":1,"lenient":""}],[{"to":2,"lenient":"ニ","orig":"に"},…]],"whitespaceDelimited":false}`
- **Typos:** "You have a typo" appears in the app. The **thresholds are not published.** [S] Probably one edit per word, as long as the typo doesn't form another valid word; a missing accent is flagged but accepted.
- **STAPLE 2020 [P]:**
  - A **weighted** accepted set per prompt, weighted by how often learners type each answer: `w_t = √(c_t+1) / Σ √(c_t'+1)`.
  - Japanese averages 342 answers per prompt, Korean 280, Portuguese 132.
  - The app accepts an answer but can still show a *preferred* translation.
  - Off-the-shelf MT covered the set poorly (weighted F1 0.04–0.28). The best systems reached about 0.55.
  ```
  prompt_65c6…|is my explanation clear?
  minha explicação está clara?|0.267
  minha explicação é clara?|0.162
  ```
- **Speech [P]:** in-house recognition. Chinese and Korean are graded *phonetically*. No thresholds are published.
- **Explain My Answer [P]:** GPT-4, opened by the learner. It sees the learner's answer, the correct answer and the exercise, and adapts to the learner's native language. Free since Jan 2026.

---

## 7. Content production

| Era | How content was made |
|---|---|
| 2013–2021 [P/C] | **Incubator**: volunteers wrote skills, words, sentences in both directions, accepted-answer lists and hints. First release of a course: about half of A1, 30+ skills, 2,000+ sentences, 9+ months. Ended Mar 2021 in favour of "strict timelines and specific templates". |
| 2022 [P] | 4-stage pipeline: **curriculum (human)** → **raw content** (AI helps, including generating accepted translations) → **exercises** (auto-derived gap and word-order exercises, TTS, speech grading) → **personalisation** (Birdbrain + spacing). |
| 2023 [P] | **"Mad Lib" prompts**: fixed rules (option count, character limit, CEFR level, tense) plus slots (word, theme, grammar). The LLM returns about 10 candidates; a Learning Designer picks about 3 and edits them. |
| 2024 [P] | CALM (*Tarzan to Tolkien*): an LLM held to a target CEFR level. Contractor cut of about 10% (Jan 2024) [T]. |
| 2025 [P] | **DuoRadio**: scripts written from scratch or machine-translated failed. What worked was **feeding existing curriculum sentences into prompts**, over-generating, and filtering with **LLM judges written by designers** (naturalness, grammaticality, coherence, logic). Episodes 300 → 15,000+, daily users 0.5M → 5M, cost −99%. **148 courses in under a year** via "shared content systems". "AI-first" memo (Apr 2025). |
| 2026 [P] | 20,500 units published in Q1. "Changes pushed across many courses at once". |

---

## 8. Engagement systems that touch lessons

- **XP [C]:**
  - A lesson is worth about 10–20 XP.
  - Combo bonus: +1 to +5 XP for correct answers in a row.
  - Legendary: 40 XP.
- **Hearts → Energy [P] (Jul 2025):**
  - Hearts: 5, one lost per mistake.
  - Energy: about 25 units. Every exercise costs energy, and runs of correct answers refund some.
  - The end-of-lesson mistake review is free.
  - Reason given: beginners were 2× more likely to run out of hearts mid-lesson.
  - Critics call it a paywall [T].
- **Streaks [T/P]:**
  - Tools: streak freeze, repair, wager.
  - A 10-day streak sharply cuts drop-off; users with 7+ day streaks make up about half of daily active users (DAU).
  - The key metric was current-user retention rate (CURR) (Mazal).
- **Leagues [C/T]:** 10 weekly tiers with cohorts of about 30. Leaderboards added 17% more learning time.
- **Notifications [P] (KDD 2020):**
  - Arms are hand-written templates with eligibility rules (e.g. a streak message needs a 3+ day streak).
  - Reward: a lesson completed within 2 h of the notification.
  - Novelty penalty: `s = ŝ − γ·0.5^(d/h)`, with h = 15 days and γ ≈ 0.017.
  - Result: +0.5% DAU, +2% new-user retention.
- **Gamification risk [T]** (Mogavi 2022): XP farming and league chasing crowd out learning.

---

## 9. What is not public

- The Session Generator's selection rule and the Birdbrain V2 architecture beyond "LSTM, 40-d".
- The current SRS model. It was "separate", and a vocabulary model has existed since 2024. No evidence supports the claim that "HLR was absorbed into Birdbrain".
- Typo thresholds, the speech-grading thresholds, and the Duolingo Score formula.
- The course content schema. Only its shadows are public: lexeme tags, session JSON and the SLAM format.
- How the end-of-unit mastery check (2026) decides "mastered".
