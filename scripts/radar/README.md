# Posta Radar

Finds fresh conversations about Argentine Spanish and drafts a comment for each.
Results live in the "Posta Radar" artifact: https://claude.ai/artifact/HEwSNcCarngaroDHeWMCDJ
(tabs: Oportunidades, Grupos de Facebook). It never posts anything: you paste by hand.

- `reddit.mjs [hours]`: public Reddit RSS (2 requests, no login). Remembers what it
  showed in `~/.posta-radar/seen.json`. `DRY=1` to test without remembering.
- `daily-prompt.md`: the prompt for the daily scheduled task (Claude desktop app →
  Scheduled tasks), which runs reddit.mjs + web search + reads the FB groups, then
  writes the drafts into the artifact.
