-- The course is re-recorded in eleven_v4_turbo. The TTS job reads the model
-- from the voice's row, so this is the whole switch; clips already recorded
-- keep playing until `course:tts --force` replaces them.
update public.voices set model = 'eleven_v4_turbo';
alter table public.voices alter column model set default 'eleven_v4_turbo';
