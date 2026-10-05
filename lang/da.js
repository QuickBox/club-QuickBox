/*
 * club-QuickBox skin for ruTorrent -- Danish strings.
 *
 * The ruTorrent theme plugin loads its OWN catalog (plugins/theme/lang/*.js),
 * not a skin's, so these strings are also registered inline by the skin's
 * modules (init.js and the js/*.js feature files). This file is the single
 * translation reference for the skin's own strings; keys are grouped by the
 * surface that uses them.
 */

/* Appearance + theme variants (init.js, topbar.js, extras.js). */
theUILang.qbAppearance      = "Udseende";
theUILang.qbVariantAuto     = "Auto (dashboard)";
theUILang.qbVariantSpectre  = "Spectre";
theUILang.qbVariantSmoked   = "Smoked";
theUILang.qbVariantReel     = "Reel";
theUILang.qbVariantLight    = "Lys";
theUILang.cqb_var_auto      = "Auto";

/* Settings dialog (settings.js, settings-plugins.js). */
theUILang.cqb_zero_unlimited = "Sæt 0 for ubegrænset.";
theUILang.cqb_decimals_hint  = "Lad en celle stå tom for at arve standarden.";
theUILang.cqb_filter_trackers = "Filtrér trackers";
theUILang.cqb_tracker        = "Tracker";
theUILang.cqb_enabled        = "Aktiveret";
theUILang.cqb_grp_hashing    = "Hashing";
theUILang.cqb_grp_preload    = "Preload";
theUILang.cqb_grp_buffers    = "Buffere";
theUILang.cqb_grp_limits     = "Grænser";
theUILang.cqb_grp_network    = "Netværk";
theUILang.cqb_grp_session    = "Session og timeouts";
theUILang.cqb_grp_flags      = "Flag";
theUILang.cqb_stg_empty      = "Ingen matchende trackers";
theUILang.cqb_browse         = "Gennemse";
theUILang.cqb_not_set        = "Ikke angivet";
theUILang.qbAutoLabel       = "AutoLabel";
theUILang.qbAutoMove        = "AutoMove";
theUILang.qbAutoWatch       = "AutoWatch";
theUILang.qbCookiesHelp     = "Én vært pr. linje. Format: host|name1=value1;name2=value2 (eksempel: tracker.example|uid=123;pass=abc)";
theUILang.qbFindAtHelp      = "Ét opslag pr. linje. Format: name|url -- brug {HASH} for torrentens hash (eksempel: Name|https://example.org/?q={HASH})";
theUILang.qbAnnounceHelp    = "Én announce-URL pr. linje.";
theUILang.qbBrowse          = "Gennemse";

/* Add / Create / task-console dialogs (dialogs.js). */
theUILang.cqb_add_drop_hint   = "Træk .torrent-filer hertil eller {browse}";
theUILang.cqb_tl_drop_hint    = "Træk en .png hertil eller {browse}";
theUILang.cqb_mi_general      = "Generelt";
theUILang.cqb_task_mediainfo  = "Media Info";
theUILang.cqb_task_screenshots = "Skærmbilleder";
theUILang.cqb_task_create     = "Opret torrent";
theUILang.cqb_task_unpack     = "Udpak";
theUILang.cqb_task_title      = "Opgave";
theUILang.cqb_create_source_ph = "Sti til en fil eller mappe, eller vælg en";
theUILang.cqb_create_torrent  = "Opret torrent";
theUILang.cqb_add_source      = "Kilde";
theUILang.cqb_add_file        = "Fil";
theUILang.cqb_add_url         = "URL";
theUILang.cqb_add_dir_ph      = "Standard download-mappe";
theUILang.cqb_label_to_list   = "Vælg en eksisterende etiket";
theUILang.cqb_help_trackers   = "Én tracker-URL pr. linje.";
theUILang.cqb_help_seed       = "Start seeding så snart torrenten er oprettet.";
theUILang.cqb_help_private    = "Markér som privat: ingen DHT eller peer exchange.";
theUILang.cqb_help_hybrid     = "Opret en v1 + v2 hybrid-torrent.";

/* Inline edit of a torrent option (dialogs.js). */
theUILang.cqb_edit_yes        = "Ja";
theUILang.cqb_edit_no         = "Nej";
theUILang.cqb_edit_change     = "Skift";

/* Chunks pane (chunks.js). */
theUILang.cqb_chunks_chunks     = "Chunks";
theUILang.cqb_chunks_size       = "Størrelse";
theUILang.cqb_chunks_done       = "Færdig";
theUILang.cqb_chunks_seen       = "Set";
theUILang.cqb_chunks_downloaded = "Downloadet";
theUILang.cqb_chunks_mode       = "Chunk-kort tilstand";
theUILang.cqb_chunks_one        = "Chunk {n}";
theUILang.cqb_chunks_range      = "Chunks {a}–{b}";
theUILang.cqb_chunks_seen_count = "{n}× set";
theUILang.cqb_chunks_a11y_seen  = "Chunk-tilgængelighedskort: {pct}% af grupper set, {n} chunks";
theUILang.cqb_chunks_a11y_done  = "Chunk-færdiggørelseskort: {pct}% færdig, {n} chunks";
theUILang.cqb_chunks_cell_one   = "1 celle = {n} chunk";
theUILang.cqb_chunks_cell_many  = "1 celle = {n} chunks";

/* Details pane -- overview, file manager, traffic/speed toolbars (details.js). */
theUILang.cqb_det_copy          = "Kopiér";
theUILang.cqb_det_download      = "Download";
theUILang.cqb_det_upload        = "Upload";
theUILang.cqb_det_ratio         = "Ratio";
theUILang.cqb_det_eta           = "ETA";
theUILang.cqb_det_elapsed       = "Forløbet";
theUILang.cqb_det_remaining     = "Tilbage";
theUILang.cqb_det_swarm         = "Sværm";
theUILang.cqb_det_seeds         = "Seeds";
theUILang.cqb_det_peers         = "Peers";
theUILang.cqb_det_wasted        = "Spildt";
theUILang.cqb_det_url           = "URL";
theUILang.cqb_det_status        = "Status";
theUILang.cqb_det_next_announce = "Næste announce";
theUILang.cqb_det_storage       = "Lager";
theUILang.cqb_det_save_path     = "Gemmesti";
theUILang.cqb_det_open_fm       = "Åbn i Filhåndtering";
theUILang.cqb_det_free_disk     = "Ledig plads";
theUILang.cqb_det_hash          = "Hash";
theUILang.cqb_det_comment       = "Kommentar";
theUILang.cqb_det_updown        = "{up} op / {down} ned";
theUILang.cqb_det_tracker_ok    = "OK";
theUILang.cqb_det_due_now       = "forfalder nu";
theUILang.cqb_det_outside_fm    = "Uden for din Filhåndtering-hjemmemappe";
theUILang.cqb_det_no_comment    = "Ingen kommentar";
theUILang.cqb_det_parent_dir    = "Overordnet mappe";
theUILang.cqb_det_new_folder    = "Ny mappe";
theUILang.cqb_det_path          = "Sti";
theUILang.cqb_det_recent_folders = "Seneste mapper";
theUILang.cqb_det_toggle        = "Skift {name}";
theUILang.cqb_det_downloaded    = "Downloadet";
theUILang.cqb_det_uploaded      = "Uploadet";
theUILang.cqb_det_clear_stats   = "Ryd statistik";
theUILang.cqb_det_console       = "Konsol";
theUILang.cqb_det_more_tabs     = "Flere faner";
theUILang.cqb_det_more          = "Mere";

/* Top app bar -- button tooltips + search (topbar.js). */
theUILang.cqb_tb_add        = "Tilføj torrent";
theUILang.cqb_tb_remove     = "Fjern";
theUILang.cqb_tb_start      = "Start";
theUILang.cqb_tb_pause      = "Pause";
theUILang.cqb_tb_stop       = "Stop";
theUILang.cqb_tb_settings   = "Indstillinger";
theUILang.cqb_tb_help       = "Hjælp";
theUILang.cqb_tb_logoff     = "Log af";
theUILang.cqb_tb_create     = "Opret torrent";
theUILang.cqb_tb_rss        = "RSS";
theUILang.cqb_tb_plugins    = "Plugins";
theUILang.cqb_search        = "Søg";

/* Full-window drop zone + command palette (extras.js). */
theUILang.qbDropTitle       = "Slip for at tilføje torrents";
theUILang.qbDropSub         = "Slip .torrent-filer hvor som helst for at tilføje dem";
theUILang.qbPalActions      = "Handlinger";
theUILang.qbPalAdd          = "Tilføj torrent";
theUILang.qbPalStart        = "Start valgte";
theUILang.qbPalPause        = "Pause valgte";
theUILang.qbPalStop         = "Stop valgte";
theUILang.qbPalRemove       = "Fjern valgte";
theUILang.qbPalSettings     = "Indstillinger";
theUILang.qbPalAppearance   = "Udseende";
theUILang.qbPalSwitch       = "Skift til ";
theUILang.qbPalFilters      = "Filtre";
theUILang.qbPalAll          = "Alle torrents";
theUILang.qbPalSearchGroup  = "Søg";
theUILang.qbPalSearchFor    = "Søg torrents efter";
theUILang.qbPalNoResults    = "Ingen matchende kommandoer";
theUILang.qbPalPlaceholder  = "Skriv en kommando eller søg torrents...";
theUILang.qbPalNavigate     = "naviger";
theUILang.qbPalOpen         = "kør";
theUILang.qbPalClose        = "luk";

/* Settings page descriptions (settings.js). */
theUILang.cqb_stg_desc_gl          = "Grænsefladeadfærd, opdateringsinterval og hastighedsforvalg.";
theUILang.cqb_stg_desc_dl          = "Standard båndbreddegrænser og adfærd for download.";
theUILang.cqb_stg_desc_con         = "Lytteport, globale hastighedsgrænser og forbindelseslofter.";
theUILang.cqb_stg_desc_bt          = "DHT, peer exchange og andre BitTorrent-funktioner.";
theUILang.cqb_stg_desc_fmt         = "Hvordan størrelser, datoer og tal vises.";
theUILang.cqb_stg_desc_ao          = "Lavniveauindstillinger for avancerede brugere.";
theUILang.cqb_stg_desc_dev         = "Diagnostik- og udviklerindstillinger.";
theUILang.cqb_stg_desc_loginmgr    = "Gemte tracker-logins brugt af autotools og søgning.";
theUILang.cqb_stg_desc_autotools   = "Automatiske handlinger anvendt på matchende torrents.";
theUILang.cqb_stg_desc_xmpp        = "Chat-notifikationer leveret via en XMPP-konto.";
theUILang.cqb_stg_desc_cookies     = "Cookies pr. vært sendt ved hentning af torrents.";
theUILang.cqb_stg_desc_lookat      = "Brugerdefinerede opslagslinks vist i torrent-menuen.";
theUILang.cqb_stg_desc_retrackers  = "Trackers tilføjet automatisk til nye torrents.";
theUILang.cqb_stg_desc_rss         = "RSS-feeds og auto-download-filtre.";
theUILang.cqb_stg_desc_scheduler   = "Tidsvinduer der ændrer grænser automatisk.";
theUILang.cqb_stg_desc_extsearch   = "Søgemaskiner brugt af værktøjslinjesøgningen.";
theUILang.cqb_stg_desc_unpack      = "Automatisk udpakning af fuldførte arkiver.";
theUILang.cqb_stg_desc_throttle    = "Navngivne båndbreddekanaler til gruppering af torrents.";
theUILang.cqb_stg_desc_ratio       = "Ratio-grupper og handlingerne ved hvert mål.";
theUILang.cqb_stg_desc_screenshots = "Miniaturevisninger genereret fra mediefiler.";
theUILang.cqb_stg_desc_uploadeta   = "Målratio og tid brugt til at estimere seeding.";
theUILang.cqb_stg_desc_history     = "Opbevaring af hændelseslog og levering af notifikationer.";

/* Settings nav + account table chrome (settings.js). */
theUILang.cqb_stg_grp_plugins = "Plugins";
theUILang.cqb_stg_filter      = "Filtrér indstillinger";
theUILang.cqb_stg_no_match    = "Ingen matchende indstillinger";
theUILang.cqb_acct_login      = "{name} login";
theUILang.cqb_acct_password   = "{name} adgangskode";
theUILang.cqb_acct_autologin  = "{name} autologin";
theUILang.cqb_unit_bytes      = "bytes";

/* Advanced rtorrent option labels (settings.js, st_ao page). */
theUILang.cqb_ao_hash_interval        = "Hash-tjek interval";
theUILang.cqb_ao_hash_max_tries       = "Hash-tjek maks. forsøg";
theUILang.cqb_ao_hash_read_ahead      = "Hash read-ahead";
theUILang.cqb_ao_preload_type         = "Preload-type";
theUILang.cqb_ao_preload_min_size     = "Preload minimumsstørrelse";
theUILang.cqb_ao_preload_required_rate = "Preload krævet hastighed";
theUILang.cqb_ao_receive_buffer_size  = "Modtagebufferstørrelse";
theUILang.cqb_ao_send_buffer_size     = "Sendebufferstørrelse";
theUILang.cqb_ao_max_downloads_div    = "Maks. downloads divisor";
theUILang.cqb_ao_max_uploads_div      = "Maks. uploads divisor";
theUILang.cqb_ao_max_file_size        = "Maksimal filstørrelse";
theUILang.cqb_ao_split_file_size      = "Opdel filstørrelse";
theUILang.cqb_ao_split_suffix         = "Opdelingssuffiks";
theUILang.cqb_ao_http_cacert          = "HTTP CA-certifikat";
theUILang.cqb_ao_http_capath          = "HTTP CA-sti";
theUILang.cqb_ao_http_proxy           = "HTTP-proxy";
theUILang.cqb_ao_proxy_address        = "Proxy-adresse";
theUILang.cqb_ao_bind                 = "Bind-adresse";
theUILang.cqb_ao_session              = "Session-mappe";
theUILang.cqb_ao_timeout_safe_sync    = "Safe sync timeout";
theUILang.cqb_ao_timeout_sync         = "Sync timeout";
theUILang.cqb_empty_ratio_rules       = "Ingen ratio-regler endnu";
theUILang.cqb_empty_rss_filters       = "Ingen filtre endnu";
theUILang.cqb_empty_rss_group         = "Ingen feeds i denne gruppe endnu";
theUILang.cqb_empty_checklist        = "Intet valgt";

/* Icon picker (js/icons.js). */
theUILang.cqb_icons_choose        = "Vælg ikon";
theUILang.cqb_icons_tab_icons     = "Ikoner";
theUILang.cqb_icons_tab_upload    = "Upload billede";
theUILang.cqb_icons_search        = "Søg ikoner";
theUILang.cqb_icons_categories    = "Kategorier";
theUILang.cqb_icons_tint          = "Farvetone";
theUILang.cqb_icons_tint_auto     = "Auto (variant)";
theUILang.cqb_icons_upload_aria   = "Upload et PNG-billede";
theUILang.cqb_icons_drop_title    = "Slip en PNG her eller klik for at gennemse";
theUILang.cqb_icons_drop_hint     = "Kun PNG. Vises også i almindelig ruTorrent.";
theUILang.cqb_icons_upload_note   = "Et uploadet billede bevares som det er og har forrang over en valgt glyf. Fjern det for at falde tilbage til den smarte standard.";
theUILang.cqb_icons_reset         = "Nulstil til smart standard";
theUILang.cqb_icons_use           = "Brug ikon";
theUILang.cqb_icons_remove        = "Fjern billede";
theUILang.cqb_icons_upload_btn    = "Upload";
theUILang.cqb_icons_no_match      = "Ingen ikoner matcher “{term}”";
theUILang.cqb_icons_cat_all       = "Alle";
theUILang.cqb_icons_more_cats     = "Flere kategorier";
theUILang.cqb_icons_more          = "Mere";
theUILang.cqb_icons_more_count    = "Mere ({n})";
theUILang.cqb_icons_upload_failed = "Upload mislykkedes: {msg}";
theUILang.cqb_icons_sub_tracker   = "Tracker: {name}";
theUILang.cqb_icons_sub_label     = "Etiket: {name}";

/* Details empty states (js/details.js). */
theUILang.cqb_det_empty_general  = "Vælg en torrent for at se dens oversigt";
theUILang.cqb_det_empty_files    = "Vælg en torrent for at se dens filer";
theUILang.cqb_det_empty_trackers = "Vælg en torrent for at se dens trackers";
theUILang.cqb_det_empty_peers    = "Vælg en torrent for at se dens peers";
theUILang.cqb_det_empty_pieces   = "Vælg en torrent for at se dens stykker";

/* Sidebar rail (js/sidebar.js). */
theUILang.cqb_nav_collapse = "Skjul sidebjælke";
theUILang.cqb_nav_expand   = "Udvid sidebjælke";

/* Custom select popover (js/select.js). */
theUILang.qbNoMatches = "Ingen match";
theUILang.qbNoOptions = "Ingen valg";

/* Peers pane (js/peers.js). */
theUILang.cqb_noPeers           = "Ingen peers forbundet";
theUILang.cqb_peerFlagIncoming  = "Indgående forbindelse";
theUILang.cqb_peerFlagEncrypted = "Krypteret";
theUILang.cqb_peerFlagSnubbed   = "Snubbet";

/* About / What's new (js/about.js; the palette command in js/extras.js). */
theUILang.cqb_wn_title         = "Nyheder i club-QuickBox";
theUILang.cqb_wn_link          = "Nyheder";
theUILang.cqb_wn_version       = "club-QuickBox v{version}";
theUILang.cqb_wn_update        = "Opdatering tilgængelig: v{version}";
theUILang.cqb_wn_update_qb     = "QuickBox Pro: kør {cmd} som administrator.";
theUILang.cqb_wn_update_manual = "Manuel installation: kør {cmd} i tema-mappen.";
theUILang.cqb_wn_none          = "Ingen udgivelsesnoter endnu.";
theUILang.qbPalHelp            = "Hjælp";
