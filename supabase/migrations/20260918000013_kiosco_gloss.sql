-- "kiosco" stops being translated.
--
-- The judge rejected all twelve sentences the writer built on it, every one for
-- the same reason: "kiosk" makes an English speaker picture a newsstand or a
-- mall stand, not the corner shop that sells drinks, sweets and bus cards
-- through a window onto the street. The course already handles this for
-- cortado, mate and medialuna — keep the Argentine word, explain it in a note —
-- and the unit's own tip already says what a kiosco is. This makes it
-- consistent, and gives the next writing pass an English it can use.
update public.lemmas
   set gloss_en = 'kiosco',
       gloss_note_en = 'the corner shop that sells drinks, sweets and bus cards, often through a window onto the street'
 where lemma = 'kiosco' and pos = 'noun';
