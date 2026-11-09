with top as (
  select l.id, l.lemma, count(distinct sf.sentence_id) n
  from lemmas l join forms f on f.lemma_id=l.id and f.status='published'
  join sentence_forms sf on sf.form_id=f.id
  join sentences s on s.id=sf.sentence_id and s.status='published'
  where l.pos='verb' and l.status='published'
  group by 1,2 order by n desc limit 62
),
fs as (
  select t.lemma, t.n, f.id fid, f.form, f.features, f.gloss_en
  from top t join forms f on f.lemma_id=t.id and f.status='published'
  where (f.features->>'voseo')='true' or f.features->>'verb_form'='inf'
),
ex as (
  select fs.lemma, fs.form, s.es, s.en, row_number() over (partition by fs.lemma order by length(s.es)) rn
  from fs join sentence_forms sf on sf.form_id=fs.fid
  join sentences s on s.id=sf.sentence_id and s.status='published' and length(s.es) between 15 and 80
  where fs.features->>'tense'='pres' and fs.features->>'mood'='ind'
)
select json_build_object(
  'verbs',(select json_agg(json_build_object('lemma',lemma,'n',n,'form',form,'f',features,'gloss',gloss_en)) from fs),
  'ex',(select json_agg(json_build_object('lemma',lemma,'form',form,'es',es,'en',en)) from ex where rn<=6)
) j;
