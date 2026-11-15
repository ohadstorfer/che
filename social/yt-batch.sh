#!/bin/zsh
# usage: ./yt-batch.sh <id>...   For each recorded YouTube video: check stills + contact sheet, full render,
#   subtitles, and a copy of video/thumb/srt in ~/che/posta-videos/youtube/. One render at a time.
cd "$(dirname "$0")"
S=/private/tmp/claude-501/-Users-ohadstorfer-che-che/f0b2b2f5-60b5-4e24-9f4e-66baaf1747f2/scratchpad
for id in "$@"; do
  echo "== $id"
  node render-yt.mjs $id --stills >/dev/null 2>&1 && python3 $S/sheet.py out/yt/check/$id $S/$id.jpg
  node render-yt.mjs $id 2>&1 | tail -1
  node yt-srt.mjs $id >/dev/null 2>&1
  cp out/yt/$id.mp4 out/yt/$id-thumb.png out/yt/$id.en.srt ~/che/posta-videos/youtube/ && echo "ok $id"
done
