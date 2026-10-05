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
theUILang.cqb_tl_drop_hint    = "Drag a .png here or {browse}";
theUILang.cqb_mi_general      = "General";
theUILang.cqb_task_mediainfo  = "Media Info";
theUILang.cqb_task_screenshots = "Screenshots";
theUILang.cqb_task_create     = "Create Torrent";
theUILang.cqb_task_unpack     = "Unpack";
theUILang.cqb_task_title      = "Task";
theUILang.cqb_create_source_ph = "Path to a file or folder, or pick one";
theUILang.cqb_create_torrent  = "Create torrent";
theUILang.cqb_add_source      = "Source";
theUILang.cqb_add_file        = "File";
theUILang.cqb_add_url         = "URL";
theUILang.cqb_add_dir_ph      = "Default download directory";
theUILang.cqb_label_to_list   = "Choose an existing label";
theUILang.cqb_help_trackers   = "One tracker URL per line.";
theUILang.cqb_help_seed       = "Start seeding as soon as the torrent is created.";
theUILang.cqb_help_private    = "Mark as private: no DHT or peer exchange.";
theUILang.cqb_help_hybrid     = "Create a v1 + v2 hybrid torrent.";

/* Inline edit of a torrent option (dialogs.js). */
theUILang.cqb_edit_yes        = "Yes";
theUILang.cqb_edit_no         = "No";
theUILang.cqb_edit_change     = "Change";

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

/* Settings page descriptions (settings.js). */
theUILang.cqb_stg_desc_gl          = "Interface behavior, update interval and speed presets.";
theUILang.cqb_stg_desc_dl          = "Default download bandwidth limits and behavior.";
theUILang.cqb_stg_desc_con         = "Listening port, global rate limits and connection caps.";
theUILang.cqb_stg_desc_bt          = "DHT, peer exchange and other BitTorrent features.";
theUILang.cqb_stg_desc_fmt         = "How sizes, dates and numbers are displayed.";
theUILang.cqb_stg_desc_ao          = "Lower-level options for advanced users.";
theUILang.cqb_stg_desc_dev         = "Diagnostic and developer-only options.";
theUILang.cqb_stg_desc_loginmgr    = "Stored tracker logins used by autotools and search.";
theUILang.cqb_stg_desc_autotools   = "Automatic actions applied to matching torrents.";
theUILang.cqb_stg_desc_xmpp        = "Chat notifications delivered over an XMPP account.";
theUILang.cqb_stg_desc_cookies     = "Per-host cookies sent when fetching torrents.";
theUILang.cqb_stg_desc_lookat      = "Custom lookup links shown on the torrent menu.";
theUILang.cqb_stg_desc_retrackers  = "Trackers appended automatically to new torrents.";
theUILang.cqb_stg_desc_rss         = "RSS feeds and auto-download filters.";
theUILang.cqb_stg_desc_scheduler   = "Time windows that change limits automatically.";
theUILang.cqb_stg_desc_extsearch   = "Search engines used by the toolbar search.";
theUILang.cqb_stg_desc_unpack      = "Automatic extraction of completed archives.";
theUILang.cqb_stg_desc_throttle    = "Named bandwidth channels for grouping torrents.";
theUILang.cqb_stg_desc_ratio       = "Ratio groups and the actions taken at each target.";
theUILang.cqb_stg_desc_screenshots = "Thumbnail previews generated from media files.";
theUILang.cqb_stg_desc_uploadeta   = "Target ratio and time used to estimate seeding.";
theUILang.cqb_stg_desc_history     = "Event log retention and notification delivery.";

/* Settings nav + account table chrome (settings.js). */
theUILang.cqb_stg_grp_plugins = "Plugins";
theUILang.cqb_stg_filter      = "Filter settings";
theUILang.cqb_stg_no_match    = "No matching settings";
theUILang.cqb_acct_login      = "{name} login";
theUILang.cqb_acct_password   = "{name} password";
theUILang.cqb_acct_autologin  = "{name} autologin";
theUILang.cqb_unit_bytes      = "bytes";

/* Advanced rtorrent option labels (settings.js, st_ao page). */
theUILang.cqb_ao_hash_interval        = "Hash check interval";
theUILang.cqb_ao_hash_max_tries       = "Hash check max tries";
theUILang.cqb_ao_hash_read_ahead      = "Hash read-ahead";
theUILang.cqb_ao_preload_type         = "Preload type";
theUILang.cqb_ao_preload_min_size     = "Preload minimum size";
theUILang.cqb_ao_preload_required_rate = "Preload required rate";
theUILang.cqb_ao_receive_buffer_size  = "Receive buffer size";
theUILang.cqb_ao_send_buffer_size     = "Send buffer size";
theUILang.cqb_ao_max_downloads_div    = "Max downloads divisor";
theUILang.cqb_ao_max_uploads_div      = "Max uploads divisor";
theUILang.cqb_ao_max_file_size        = "Maximum file size";
theUILang.cqb_ao_split_file_size      = "Split file size";
theUILang.cqb_ao_split_suffix         = "Split suffix";
theUILang.cqb_ao_http_cacert          = "HTTP CA certificate";
theUILang.cqb_ao_http_capath          = "HTTP CA path";
theUILang.cqb_ao_http_proxy           = "HTTP proxy";
theUILang.cqb_ao_proxy_address        = "Proxy address";
theUILang.cqb_ao_bind                 = "Bind address";
theUILang.cqb_ao_session              = "Session directory";
theUILang.cqb_ao_timeout_safe_sync    = "Safe sync timeout";
theUILang.cqb_ao_timeout_sync         = "Sync timeout";
theUILang.cqb_empty_ratio_rules       = "No ratio rules yet";
theUILang.cqb_empty_rss_filters       = "No filters yet";
theUILang.cqb_empty_rss_group         = "No feeds in this group yet";
theUILang.cqb_empty_checklist        = "Nothing selected";

/* Icon picker (js/icons.js). */
theUILang.cqb_icons_choose        = "Choose icon";
theUILang.cqb_icons_tab_icons     = "Icons";
theUILang.cqb_icons_tab_upload    = "Upload image";
theUILang.cqb_icons_search        = "Search icons";
theUILang.cqb_icons_categories    = "Categories";
theUILang.cqb_icons_tint          = "Tint";
theUILang.cqb_icons_tint_auto     = "Auto (variant)";
theUILang.cqb_icons_upload_aria   = "Upload a PNG image";
theUILang.cqb_icons_drop_title    = "Drop a PNG here or click to browse";
theUILang.cqb_icons_drop_hint     = "PNG only. Shown in plain ruTorrent too.";
theUILang.cqb_icons_upload_note   = "An uploaded image is kept as-is and takes priority over a chosen glyph. Remove it to fall back to the smart default.";
theUILang.cqb_icons_reset         = "Reset to smart default";
theUILang.cqb_icons_use           = "Use icon";
theUILang.cqb_icons_remove        = "Remove image";
theUILang.cqb_icons_upload_btn    = "Upload";
theUILang.cqb_icons_no_match      = "No icons match “{term}”";
theUILang.cqb_icons_cat_all       = "All";
theUILang.cqb_icons_more_cats     = "More categories";
theUILang.cqb_icons_more          = "More";
theUILang.cqb_icons_more_count    = "More ({n})";
theUILang.cqb_icons_upload_failed = "Upload failed: {msg}";
theUILang.cqb_icons_sub_tracker   = "Tracker: {name}";
theUILang.cqb_icons_sub_label     = "Label: {name}";

/* Details empty states (js/details.js). */
theUILang.cqb_det_empty_general  = "Select a torrent to see its overview";
theUILang.cqb_det_empty_files    = "Select a torrent to see its files";
theUILang.cqb_det_empty_trackers = "Select a torrent to see its trackers";
theUILang.cqb_det_empty_peers    = "Select a torrent to see its peers";
theUILang.cqb_det_empty_pieces   = "Select a torrent to see its pieces";

/* Sidebar rail (js/sidebar.js). */
theUILang.cqb_nav_collapse = "Collapse sidebar";
theUILang.cqb_nav_expand   = "Expand sidebar";

/* Custom select popover (js/select.js). */
theUILang.qbNoMatches = "No matches";
theUILang.qbNoOptions = "No options";

/* Peers pane (js/peers.js). */
theUILang.cqb_noPeers           = "No peers connected";
theUILang.cqb_peerFlagIncoming  = "Incoming connection";
theUILang.cqb_peerFlagEncrypted = "Encrypted";
theUILang.cqb_peerFlagSnubbed   = "Snubbed";

/* About / What's new (js/about.js; the palette command in js/extras.js). */
theUILang.cqb_wn_title         = "What's new in club-QuickBox";
theUILang.cqb_wn_link          = "What's new";
theUILang.cqb_wn_version       = "club-QuickBox v{version}";
theUILang.cqb_wn_update        = "Update available: v{version}";
theUILang.cqb_wn_update_qb     = "QuickBox Pro: run {cmd} as an admin.";
theUILang.cqb_wn_update_manual = "Manual install: run {cmd} in the theme folder.";
theUILang.cqb_wn_none          = "No release notes yet.";
theUILang.qbPalHelp            = "Help";
