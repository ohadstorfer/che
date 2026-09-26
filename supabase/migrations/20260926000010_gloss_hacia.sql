-- "hacía" is also the imperfect of hacer ("used to make / was doing"), not only weather ("hacía frío"). Keep both senses.
update public.forms set gloss_en = 'I used to do/make, he/she used to do/make; it was (weather)' where form = 'hacía' and gloss_en = 'it was (weather)';
