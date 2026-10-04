/*
 * club-QuickBox skin for ruTorrent -- English strings.
 *
 * The ruTorrent theme plugin loads its OWN catalog (plugins/theme/lang/*.js),
 * not a skin's, so these strings are also registered inline by the skin's
 * modules (init.js and the js/*.js feature files). This file is the single
 * translation reference for the skin's own strings; keys are grouped by the
 * surface that uses them.
 */

/* Appearance + theme variants (init.js, topbar.js, extras.js). */
theUILang.qbAppearance      = "Appearance";
theUILang.qbVariantAuto     = "Auto (dashboard)";
theUILang.qbVariantSpectre  = "Spectre";
theUILang.qbVariantSmoked   = "Smoked";
theUILang.qbVariantReel     = "Reel";
theUILang.qbVariantLight    = "Light";
theUILang.cqb_var_auto      = "Auto";

/* Settings dialog (settings.js, settings-plugins.js). */
theUILang.cqb_zero_unlimited = "Set 0 for unlimited.";
theUILang.cqb_decimals_hint  = "Leave a cell blank to inherit the default.";
theUILang.cqb_filter_trackers = "Filter trackers";
theUILang.cqb_tracker        = "Tracker";
theUILang.cqb_enabled        = "Enabled";
theUILang.cqb_grp_hashing    = "Hashing";
theUILang.cqb_grp_preload    = "Preload";
theUILang.cqb_grp_buffers    = "Buffers";
theUILang.cqb_grp_limits     = "Limits";
theUILang.cqb_grp_network    = "Network";
theUILang.cqb_grp_session    = "Session and timeouts";
theUILang.cqb_grp_flags      = "Flags";
theUILang.cqb_stg_empty      = "No matching trackers";
theUILang.cqb_browse         = "Browse";
theUILang.cqb_not_set        = "Not set";
theUILang.qbAutoLabel       = "AutoLabel";
theUILang.qbAutoMove        = "AutoMove";
theUILang.qbAutoWatch       = "AutoWatch";
theUILang.qbCookiesHelp     = "One host per line. Format: host|name1=value1;name2=value2 (example: tracker.example|uid=123;pass=abc)";
theUILang.qbFindAtHelp      = "One lookup per line. Format: name|url -- use {HASH} for the torrent hash (example: Name|https://example.org/?q={HASH})";
theUILang.qbAnnounceHelp    = "One announce URL per line.";
theUILang.qbBrowse          = "Browse";

/* Add / Create / task-console dialogs (dialogs.js). */
theUILang.cqb_add_drop_hint   = "Drag .torrent files here or {browse}";
theUILang.cqb_mi_general      = "General";
theUILang.cqb_task_mediainfo  = "Media Info";
theUILang.cqb_task_screenshots = "Screenshots";
theUILang.cqb_task_create     = "Create Torrent";
theUILang.cqb_task_unpack     = "Unpack";
theUILang.cqb_task_title      = "Task";
theUILang.cqb_create_source_ph = "Path to a file or folder, or pick one";
theUILang.cqb_create_torrent  = "Create torrent";
theUILang.cqb_help_trackers   = "One tracker URL per line.";
theUILang.cqb_help_seed       = "Start seeding as soon as the torrent is created.";
theUILang.cqb_help_private    = "Mark as private: no DHT or peer exchange.";
theUILang.cqb_help_hybrid     = "Create a v1 + v2 hybrid torrent.";

/* Chunks pane (chunks.js). */
theUILang.cqb_chunks_chunks     = "Chunks";
theUILang.cqb_chunks_size       = "Size";
theUILang.cqb_chunks_done       = "Done";
theUILang.cqb_chunks_seen       = "Seen";
theUILang.cqb_chunks_downloaded = "Downloaded";
theUILang.cqb_chunks_mode       = "Chunk map mode";
theUILang.cqb_chunks_one        = "Chunk {n}";
theUILang.cqb_chunks_range      = "Chunks {a}–{b}";
theUILang.cqb_chunks_seen_count = "{n}× seen";
theUILang.cqb_chunks_a11y_seen  = "Chunk availability map: {pct}% of groups seen, {n} chunks";
theUILang.cqb_chunks_a11y_done  = "Chunk completion map: {pct}% complete, {n} chunks";
theUILang.cqb_chunks_cell_one   = "1 cell = {n} chunk";
theUILang.cqb_chunks_cell_many  = "1 cell = {n} chunks";

/* Details pane -- overview, file manager, traffic/speed toolbars (details.js). */
theUILang.cqb_det_copy          = "Copy";
theUILang.cqb_det_download      = "Download";
theUILang.cqb_det_upload        = "Upload";
theUILang.cqb_det_ratio         = "Ratio";
theUILang.cqb_det_eta           = "ETA";
theUILang.cqb_det_elapsed       = "Elapsed";
theUILang.cqb_det_remaining     = "Remaining";
theUILang.cqb_det_swarm         = "Swarm";
theUILang.cqb_det_seeds         = "Seeds";
theUILang.cqb_det_peers         = "Peers";
theUILang.cqb_det_wasted        = "Wasted";
theUILang.cqb_det_url           = "URL";
theUILang.cqb_det_status        = "Status";
theUILang.cqb_det_next_announce = "Next announce";
theUILang.cqb_det_storage       = "Storage";
theUILang.cqb_det_save_path     = "Save path";
theUILang.cqb_det_open_fm       = "Open in File Manager";
theUILang.cqb_det_free_disk     = "Free disk";
theUILang.cqb_det_hash          = "Hash";
theUILang.cqb_det_comment       = "Comment";
theUILang.cqb_det_updown        = "{up} up / {down} down";
theUILang.cqb_det_tracker_ok    = "OK";
theUILang.cqb_det_due_now       = "due now";
theUILang.cqb_det_outside_fm    = "Outside your File Manager home";
theUILang.cqb_det_no_comment    = "No comment";
theUILang.cqb_det_empty         = "Select a torrent to see its details";
theUILang.cqb_det_parent_dir    = "Parent directory";
theUILang.cqb_det_new_folder    = "New folder";
theUILang.cqb_det_path          = "Path";
theUILang.cqb_det_recent_folders = "Recent folders";
theUILang.cqb_det_toggle        = "Toggle {name}";
theUILang.cqb_det_downloaded    = "Downloaded";
theUILang.cqb_det_uploaded      = "Uploaded";
theUILang.cqb_det_clear_stats   = "Clear statistics";
theUILang.cqb_det_console       = "Console";
theUILang.cqb_det_more_tabs     = "More tabs";
theUILang.cqb_det_more          = "More";

/* Top app bar -- button tooltips + search (topbar.js). */
theUILang.cqb_tb_add        = "Add torrent";
theUILang.cqb_tb_remove     = "Remove";
theUILang.cqb_tb_start      = "Start";
theUILang.cqb_tb_pause      = "Pause";
theUILang.cqb_tb_stop       = "Stop";
theUILang.cqb_tb_settings   = "Settings";
theUILang.cqb_tb_help       = "Help";
theUILang.cqb_tb_logoff     = "Log off";
theUILang.cqb_tb_create     = "Create torrent";
theUILang.cqb_tb_rss        = "RSS";
theUILang.cqb_tb_plugins    = "Plugins";
theUILang.cqb_search        = "Search";

/* Full-window drop zone + command palette (extras.js). */
theUILang.qbDropTitle       = "Drop to add torrents";
theUILang.qbDropSub         = "Release .torrent files anywhere to add them";
theUILang.qbPalActions      = "Actions";
theUILang.qbPalAdd          = "Add torrent";
theUILang.qbPalStart        = "Start selected";
theUILang.qbPalPause        = "Pause selected";
theUILang.qbPalStop         = "Stop selected";
theUILang.qbPalRemove       = "Remove selected";
theUILang.qbPalSettings     = "Settings";
theUILang.qbPalAppearance   = "Appearance";
theUILang.qbPalSwitch       = "Switch to ";
theUILang.qbPalFilters      = "Filters";
theUILang.qbPalAll          = "All torrents";
theUILang.qbPalSearchGroup  = "Search";
theUILang.qbPalSearchFor    = "Search torrents for";
theUILang.qbPalNoResults    = "No matching commands";
theUILang.qbPalPlaceholder  = "Type a command or search torrents...";
theUILang.qbPalNavigate     = "navigate";
theUILang.qbPalOpen         = "run";
theUILang.qbPalClose        = "close";
