#!/bin/sh
# Brings the Chrome tab whose address contains "$1" to the front: makes it the active tab of its
# window, raises that window and activates Chrome.
#   sh raise-tab.sh gemini.google.com
# Why: Gemini only saves a downloaded image while its tab is really visible. A tab opened by automation
# usually sits behind the active tab; a download clicked there says "Image downloaded" and saves nothing.
# Needs macOS permission for the terminal to control Google Chrome (Privacy & Security > Automation).
osascript - "$1" <<'APPLESCRIPT'
on run argv
  set wanted to item 1 of argv
  tell application "Google Chrome"
    repeat with w in windows
      set i to 0
      repeat with t in tabs of w
        set i to i + 1
        if (URL of t) contains wanted then
          set active tab index of w to i
          set index of w to 1
          activate
          return "raised tab " & i & " of " & (count of tabs of w)
        end if
      end repeat
    end repeat
    return "no tab found for " & wanted
  end tell
end run
APPLESCRIPT
