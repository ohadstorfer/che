#!/bin/sh
# Moves the newest Gemini download (newer than the marker file) into the rig's gen folder as <name>.jpg.
#   sh rig/grab.sh <name>        run right after clicking "Download full size"
GEN=/Users/ohadstorfer/che/che/.course-work/pancho-rig/gen
for i in $(seq 1 30); do
  f=$(find ~/Downloads -maxdepth 1 -name 'Gemini_Generated_Image_*' -newer "$GEN/.mark" -name '*.jpeg' | head -1)
  [ -n "$f" ] && { mv "$f" "$GEN/$1.jpg"; touch "$GEN/.mark"; sips -g pixelWidth -g pixelHeight "$GEN/$1.jpg" | tail -2 | tr '\n' ' '; echo " -> $1"; exit 0; }
  sleep 1
done
echo "no new download for $1"; exit 1
