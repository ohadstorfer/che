-- "medida de fuerza" in US English: a union's job action / strike, not "industrial action".
update public.lemmas set gloss_en = 'job action, union action (a strike or protest)' where lemma = 'medida de fuerza' and gloss_en = 'industrial action';
