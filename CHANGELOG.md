# Changelog

Release notes for the club-QuickBox ruTorrent skin, newest first.

## v2.6.0 (2026-10-05)

club-QuickBox v2.6.0 is a ground-up modernization of the skin, rebuilt around a shared design system that mirrors the QuickBox dashboard. It ships four color variants, Spectre, Smoked, Reel and Light, plus an Auto mode that follows your dashboard theme and switches with it, and reskins every surface of ruTorrent: a new top app bar and sidebar, a reworked torrent table and details drawer, redesigned dialogs, and a grouped, filterable Settings layout in one scroll region. New tools include a Ctrl K command palette, drag and drop to add torrents, a Chunks completion heatmap, smart label icons with a searchable picker, themed popover dropdowns, and a Media Info reader. The skin is translated into seven languages, follows the language you pick in ruTorrent, and carries a content cache key so an update never leaves your browser serving stale files.

### Added

- Four color variants, Spectre, Smoked, Reel and Light, selectable from an appearance picker in Settings beside the stock theme list.
- An Auto mode that follows your QuickBox dashboard theme and re-checks it when the tab regains focus, so a theme change in the dashboard is followed here with no reload.
- A reskinned top app bar and sidebar, torrent table and details drawer, dialogs and Settings, so the whole client reads as one design system.
- A Ctrl K command palette to add a torrent, start, pause or stop the selection, jump to Settings, or switch variant from the keyboard.
- Drag and drop to add torrents, with a full-window drop overlay and a drop-zone card in the Add Torrent dialog.
- A Chunks tab heatmap of piece completion with a Downloaded or Seen toggle.
- A General tab torrent overview with a completion ring, transfer sparklines, a ratio gauge, and Swarm, Tracker and Storage cards.
- Smart label and tracker icons in the sidebar, with a searchable icon picker for labels.
- A grouped, filterable Settings layout in one scroll region, themed popover dropdowns in place of native selects, and one token-styled tooltip across the whole skin.
- A Media Info reader that parses task-console output into readable section cards with a Formatted or Raw switch.
- The installed version in the Help dialog, a What's new viewer with every release's notes (also in the Ctrl K palette), and a once-a-day check that tells you when a newer release is out and how to update.
- Translations in English, Danish, German, Spanish, French, Portuguese and Chinese (Simplified), following the language you pick in ruTorrent.

### Changed

- A content cache key on every theme asset URL, so an update never leaves a browser serving a stale stylesheet or script.
