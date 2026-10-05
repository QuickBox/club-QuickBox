/*
 * club-QuickBox skin for ruTorrent -- German strings.
 *
 * The ruTorrent theme plugin loads its OWN catalog (plugins/theme/lang/*.js),
 * not a skin's, so these strings are also registered inline by the skin's
 * modules (init.js and the js/*.js feature files). This file is the single
 * translation reference for the skin's own strings; keys are grouped by the
 * surface that uses them.
 */

/* Appearance + theme variants (init.js, topbar.js, extras.js). */
theUILang.qbAppearance      = "Darstellung";
theUILang.qbVariantAuto     = "Auto (Dashboard)";
theUILang.qbVariantSpectre  = "Spectre";
theUILang.qbVariantSmoked   = "Smoked";
theUILang.qbVariantReel     = "Reel";
theUILang.qbVariantLight    = "Hell";
theUILang.cqb_var_auto      = "Auto";

/* Settings dialog (settings.js, settings-plugins.js). */
theUILang.cqb_zero_unlimited = "0 für unbegrenzt eingeben.";
theUILang.cqb_decimals_hint  = "Eine Zelle leer lassen, um den Standard zu übernehmen.";
theUILang.cqb_filter_trackers = "Tracker filtern";
theUILang.cqb_tracker        = "Tracker";
theUILang.cqb_enabled        = "Aktiviert";
theUILang.cqb_grp_hashing    = "Hashing";
theUILang.cqb_grp_preload    = "Preload";
theUILang.cqb_grp_buffers    = "Puffer";
theUILang.cqb_grp_limits     = "Limits";
theUILang.cqb_grp_network    = "Netzwerk";
theUILang.cqb_grp_session    = "Sitzung und Timeouts";
theUILang.cqb_grp_flags      = "Flags";
theUILang.cqb_stg_empty      = "Keine passenden Tracker";
theUILang.cqb_browse         = "Durchsuchen";
theUILang.cqb_not_set        = "Nicht gesetzt";
theUILang.qbAutoLabel       = "AutoLabel";
theUILang.qbAutoMove        = "AutoMove";
theUILang.qbAutoWatch       = "AutoWatch";
theUILang.qbCookiesHelp     = "Ein Host pro Zeile. Format: host|name1=value1;name2=value2 (Beispiel: tracker.example|uid=123;pass=abc)";
theUILang.qbFindAtHelp      = "Eine Abfrage pro Zeile. Format: name|url -- {HASH} für den Torrent-Hash verwenden (Beispiel: Name|https://example.org/?q={HASH})";
theUILang.qbAnnounceHelp    = "Eine Announce-URL pro Zeile.";
theUILang.qbBrowse          = "Durchsuchen";

/* Add / Create / task-console dialogs (dialogs.js). */
theUILang.cqb_add_drop_hint   = ".torrent-Dateien hierher ziehen oder {browse}";
theUILang.cqb_tl_drop_hint    = "Eine .png hierher ziehen oder {browse}";
theUILang.cqb_mi_general      = "Allgemein";
theUILang.cqb_task_mediainfo  = "Media Info";
theUILang.cqb_task_screenshots = "Screenshots";
theUILang.cqb_task_create     = "Torrent erstellen";
theUILang.cqb_task_unpack     = "Entpacken";
theUILang.cqb_task_title      = "Aufgabe";
theUILang.cqb_create_source_ph = "Pfad zu einer Datei oder einem Ordner, oder einen auswählen";
theUILang.cqb_create_torrent  = "Torrent erstellen";
theUILang.cqb_add_source      = "Quelle";
theUILang.cqb_add_file        = "Datei";
theUILang.cqb_add_url         = "URL";
theUILang.cqb_add_dir_ph      = "Standard-Download-Verzeichnis";
theUILang.cqb_label_to_list   = "Eine vorhandene Gruppe wählen";
theUILang.cqb_help_trackers   = "Eine Tracker-URL pro Zeile.";
theUILang.cqb_help_seed       = "Mit dem Seeden beginnen, sobald der Torrent erstellt ist.";
theUILang.cqb_help_private    = "Als privat markieren: kein DHT oder Peer Exchange.";
theUILang.cqb_help_hybrid     = "Einen v1 + v2 Hybrid-Torrent erstellen.";

/* Inline edit of a torrent option (dialogs.js). */
theUILang.cqb_edit_yes        = "Ja";
theUILang.cqb_edit_no         = "Nein";
theUILang.cqb_edit_change     = "Ändern";

/* Chunks pane (chunks.js). */
theUILang.cqb_chunks_chunks     = "Chunks";
theUILang.cqb_chunks_size       = "Grösse";
theUILang.cqb_chunks_done       = "Fertig";
theUILang.cqb_chunks_seen       = "Gesehen";
theUILang.cqb_chunks_downloaded = "Heruntergeladen";
theUILang.cqb_chunks_mode       = "Chunk-Karten-Modus";
theUILang.cqb_chunks_one        = "Chunk {n}";
theUILang.cqb_chunks_range      = "Chunks {a}–{b}";
theUILang.cqb_chunks_seen_count = "{n}× gesehen";
theUILang.cqb_chunks_a11y_seen  = "Chunk-Verfügbarkeitskarte: {pct}% der Gruppen gesehen, {n} Chunks";
theUILang.cqb_chunks_a11y_done  = "Chunk-Fortschrittskarte: {pct}% fertig, {n} Chunks";
theUILang.cqb_chunks_cell_one   = "1 Zelle = {n} Chunk";
theUILang.cqb_chunks_cell_many  = "1 Zelle = {n} Chunks";

/* Details pane -- overview, file manager, traffic/speed toolbars (details.js). */
theUILang.cqb_det_copy          = "Kopieren";
theUILang.cqb_det_download      = "Download";
theUILang.cqb_det_upload        = "Upload";
theUILang.cqb_det_ratio         = "Rate";
theUILang.cqb_det_eta           = "ETA";
theUILang.cqb_det_elapsed       = "Verstrichen";
theUILang.cqb_det_remaining     = "Rest";
theUILang.cqb_det_swarm         = "Schwarm";
theUILang.cqb_det_seeds         = "Seeds";
theUILang.cqb_det_peers         = "Peers";
theUILang.cqb_det_wasted        = "Unbrauchbar";
theUILang.cqb_det_url           = "URL";
theUILang.cqb_det_status        = "Status";
theUILang.cqb_det_next_announce = "Nächstes Announce";
theUILang.cqb_det_storage       = "Speicher";
theUILang.cqb_det_save_path     = "Speicherpfad";
theUILang.cqb_det_open_fm       = "Im Dateimanager öffnen";
theUILang.cqb_det_free_disk     = "Freier Speicher";
theUILang.cqb_det_hash          = "Hash";
theUILang.cqb_det_comment       = "Kommentar";
theUILang.cqb_det_updown        = "{up} hoch / {down} runter";
theUILang.cqb_det_tracker_ok    = "OK";
theUILang.cqb_det_due_now       = "jetzt fällig";
theUILang.cqb_det_outside_fm    = "Ausserhalb Ihres Dateimanager-Ordners";
theUILang.cqb_det_no_comment    = "Kein Kommentar";
theUILang.cqb_det_parent_dir    = "Übergeordneter Ordner";
theUILang.cqb_det_new_folder    = "Neuer Ordner";
theUILang.cqb_det_path          = "Pfad";
theUILang.cqb_det_recent_folders = "Zuletzt verwendete Ordner";
theUILang.cqb_det_toggle        = "{name} umschalten";
theUILang.cqb_det_downloaded    = "Heruntergeladen";
theUILang.cqb_det_uploaded      = "Hochgeladen";
theUILang.cqb_det_clear_stats   = "Statistik löschen";
theUILang.cqb_det_console       = "Konsole";
theUILang.cqb_det_more_tabs     = "Weitere Tabs";
theUILang.cqb_det_more          = "Mehr";

/* Top app bar -- button tooltips + search (topbar.js). */
theUILang.cqb_tb_add        = "Torrent hinzufügen";
theUILang.cqb_tb_remove     = "Entfernen";
theUILang.cqb_tb_start      = "Start";
theUILang.cqb_tb_pause      = "Pause";
theUILang.cqb_tb_stop       = "Stopp";
theUILang.cqb_tb_settings   = "Einstellungen";
theUILang.cqb_tb_help       = "Hilfe";
theUILang.cqb_tb_logoff     = "Abmelden";
theUILang.cqb_tb_create     = "Torrent erstellen";
theUILang.cqb_tb_rss        = "RSS";
theUILang.cqb_tb_plugins    = "Plugins";
theUILang.cqb_search        = "Suchen";

/* Full-window drop zone + command palette (extras.js). */
theUILang.qbDropTitle       = "Zum Hinzufügen ablegen";
theUILang.qbDropSub         = ".torrent-Dateien überall ablegen, um sie hinzuzufügen";
theUILang.qbPalActions      = "Aktionen";
theUILang.qbPalAdd          = "Torrent hinzufügen";
theUILang.qbPalStart        = "Auswahl starten";
theUILang.qbPalPause        = "Auswahl pausieren";
theUILang.qbPalStop         = "Auswahl stoppen";
theUILang.qbPalRemove       = "Auswahl entfernen";
theUILang.qbPalSettings     = "Einstellungen";
theUILang.qbPalAppearance   = "Darstellung";
theUILang.qbPalSwitch       = "Wechseln zu ";
theUILang.qbPalFilters      = "Filter";
theUILang.qbPalAll          = "Alle Torrents";
theUILang.qbPalSearchGroup  = "Suchen";
theUILang.qbPalSearchFor    = "Torrents suchen nach";
theUILang.qbPalNoResults    = "Keine passenden Befehle";
theUILang.qbPalPlaceholder  = "Befehl eingeben oder Torrents suchen...";
theUILang.qbPalNavigate     = "navigieren";
theUILang.qbPalOpen         = "ausführen";
theUILang.qbPalClose        = "schliessen";

/* Settings page descriptions (settings.js). */
theUILang.cqb_stg_desc_gl          = "Oberflächenverhalten, Aktualisierungsintervall und Geschwindigkeitsvorgaben.";
theUILang.cqb_stg_desc_dl          = "Standard-Download-Bandbreitenlimits und -verhalten.";
theUILang.cqb_stg_desc_con         = "Lauschport, globale Ratenlimits und Verbindungsobergrenzen.";
theUILang.cqb_stg_desc_bt          = "DHT, Peer Exchange und andere BitTorrent-Funktionen.";
theUILang.cqb_stg_desc_fmt         = "Wie Grössen, Daten und Zahlen angezeigt werden.";
theUILang.cqb_stg_desc_ao          = "Erweiterte Optionen für fortgeschrittene Benutzer.";
theUILang.cqb_stg_desc_dev         = "Diagnose- und reine Entwickleroptionen.";
theUILang.cqb_stg_desc_loginmgr    = "Gespeicherte Tracker-Logins für Autotools und Suche.";
theUILang.cqb_stg_desc_autotools   = "Automatische Aktionen für passende Torrents.";
theUILang.cqb_stg_desc_xmpp        = "Chat-Benachrichtigungen über ein XMPP-Konto.";
theUILang.cqb_stg_desc_cookies     = "Cookies pro Host beim Abrufen von Torrents.";
theUILang.cqb_stg_desc_lookat      = "Benutzerdefinierte Suchlinks im Torrent-Menü.";
theUILang.cqb_stg_desc_retrackers  = "Tracker, die automatisch zu neuen Torrents hinzugefügt werden.";
theUILang.cqb_stg_desc_rss         = "RSS-Feeds und Auto-Download-Filter.";
theUILang.cqb_stg_desc_scheduler   = "Zeitfenster, die Limits automatisch ändern.";
theUILang.cqb_stg_desc_extsearch   = "Suchmaschinen für die Toolbar-Suche.";
theUILang.cqb_stg_desc_unpack      = "Automatisches Entpacken fertiger Archive.";
theUILang.cqb_stg_desc_throttle    = "Benannte Bandbreitenkanäle zum Gruppieren von Torrents.";
theUILang.cqb_stg_desc_ratio       = "Verhältnisgruppen und die Aktionen bei jedem Ziel.";
theUILang.cqb_stg_desc_screenshots = "Vorschaubilder aus Mediendateien.";
theUILang.cqb_stg_desc_uploadeta   = "Zielverhältnis und Zeit zur Schätzung des Seedens.";
theUILang.cqb_stg_desc_history     = "Aufbewahrung des Ereignisprotokolls und Benachrichtigungen.";

/* Settings nav + account table chrome (settings.js). */
theUILang.cqb_stg_grp_plugins = "Plugins";
theUILang.cqb_stg_filter      = "Einstellungen filtern";
theUILang.cqb_stg_no_match    = "Keine passenden Einstellungen";
theUILang.cqb_acct_login      = "{name} Login";
theUILang.cqb_acct_password   = "{name} Passwort";
theUILang.cqb_acct_autologin  = "{name} Autologin";
theUILang.cqb_unit_bytes      = "Bytes";

/* Advanced rtorrent option labels (settings.js, st_ao page). */
theUILang.cqb_ao_hash_interval        = "Hash-Prüfintervall";
theUILang.cqb_ao_hash_max_tries       = "Hash-Prüfung max. Versuche";
theUILang.cqb_ao_hash_read_ahead      = "Hash Read-Ahead";
theUILang.cqb_ao_preload_type         = "Preload-Typ";
theUILang.cqb_ao_preload_min_size     = "Preload-Mindestgrösse";
theUILang.cqb_ao_preload_required_rate = "Preload-Mindestrate";
theUILang.cqb_ao_receive_buffer_size  = "Empfangspuffergrösse";
theUILang.cqb_ao_send_buffer_size     = "Sendepuffergrösse";
theUILang.cqb_ao_max_downloads_div    = "Max. Downloads Divisor";
theUILang.cqb_ao_max_uploads_div      = "Max. Uploads Divisor";
theUILang.cqb_ao_max_file_size        = "Maximale Dateigrösse";
theUILang.cqb_ao_split_file_size      = "Split-Dateigrösse";
theUILang.cqb_ao_split_suffix         = "Split-Suffix";
theUILang.cqb_ao_http_cacert          = "HTTP-CA-Zertifikat";
theUILang.cqb_ao_http_capath          = "HTTP-CA-Pfad";
theUILang.cqb_ao_http_proxy           = "HTTP-Proxy";
theUILang.cqb_ao_proxy_address        = "Proxy-Adresse";
theUILang.cqb_ao_bind                 = "Bind-Adresse";
theUILang.cqb_ao_session              = "Sitzungsverzeichnis";
theUILang.cqb_ao_timeout_safe_sync    = "Safe-Sync-Timeout";
theUILang.cqb_ao_timeout_sync         = "Sync-Timeout";
theUILang.cqb_empty_ratio_rules       = "Noch keine Verhältnisregeln";
theUILang.cqb_empty_rss_filters       = "Noch keine Filter";
theUILang.cqb_empty_rss_group         = "Noch keine Feeds in dieser Gruppe";
theUILang.cqb_empty_checklist        = "Nichts ausgewählt";

/* Icon picker (js/icons.js). */
theUILang.cqb_icons_choose        = "Icon wählen";
theUILang.cqb_icons_tab_icons     = "Icons";
theUILang.cqb_icons_tab_upload    = "Bild hochladen";
theUILang.cqb_icons_search        = "Icons suchen";
theUILang.cqb_icons_categories    = "Kategorien";
theUILang.cqb_icons_tint          = "Farbton";
theUILang.cqb_icons_tint_auto     = "Auto (Variante)";
theUILang.cqb_icons_upload_aria   = "Ein PNG-Bild hochladen";
theUILang.cqb_icons_drop_title    = "Eine PNG hier ablegen oder zum Durchsuchen klicken";
theUILang.cqb_icons_drop_hint     = "Nur PNG. Wird auch im normalen ruTorrent angezeigt.";
theUILang.cqb_icons_upload_note   = "Ein hochgeladenes Bild bleibt unverändert und hat Vorrang vor einem gewählten Glyph. Entfernen Sie es, um auf den smarten Standard zurückzufallen.";
theUILang.cqb_icons_reset         = "Auf smarten Standard zurücksetzen";
theUILang.cqb_icons_use           = "Icon verwenden";
theUILang.cqb_icons_remove        = "Bild entfernen";
theUILang.cqb_icons_upload_btn    = "Hochladen";
theUILang.cqb_icons_no_match      = "Keine Icons passen zu “{term}”";
theUILang.cqb_icons_cat_all       = "Alle";
theUILang.cqb_icons_more_cats     = "Weitere Kategorien";
theUILang.cqb_icons_more          = "Mehr";
theUILang.cqb_icons_more_count    = "Mehr ({n})";
theUILang.cqb_icons_upload_failed = "Hochladen fehlgeschlagen: {msg}";
theUILang.cqb_icons_sub_tracker   = "Tracker: {name}";
theUILang.cqb_icons_sub_label     = "Gruppe: {name}";

/* Details empty states (js/details.js). */
theUILang.cqb_det_empty_general  = "Einen Torrent auswählen, um die Übersicht zu sehen";
theUILang.cqb_det_empty_files    = "Einen Torrent auswählen, um die Dateien zu sehen";
theUILang.cqb_det_empty_trackers = "Einen Torrent auswählen, um die Tracker zu sehen";
theUILang.cqb_det_empty_peers    = "Einen Torrent auswählen, um die Peers zu sehen";
theUILang.cqb_det_empty_pieces   = "Einen Torrent auswählen, um die Teile zu sehen";

/* Sidebar rail (js/sidebar.js). */
theUILang.cqb_nav_collapse = "Seitenleiste einklappen";
theUILang.cqb_nav_expand   = "Seitenleiste ausklappen";

/* Custom select popover (js/select.js). */
theUILang.qbNoMatches = "Keine Treffer";
theUILang.qbNoOptions = "Keine Optionen";

/* Peers pane (js/peers.js). */
theUILang.cqb_noPeers           = "Keine Peers verbunden";
theUILang.cqb_peerFlagIncoming  = "Eingehende Verbindung";
theUILang.cqb_peerFlagEncrypted = "Verschlüsselt";
theUILang.cqb_peerFlagSnubbed   = "Abgewiesen";

/* About / What's new (js/about.js; the palette command in js/extras.js). */
theUILang.cqb_wn_title         = "Neuigkeiten in club-QuickBox";
theUILang.cqb_wn_link          = "Neuigkeiten";
theUILang.cqb_wn_version       = "club-QuickBox v{version}";
theUILang.cqb_wn_update        = "Update verfügbar: v{version}";
theUILang.cqb_wn_update_qb     = "QuickBox Pro: {cmd} als Administrator ausführen.";
theUILang.cqb_wn_update_manual = "Manuelle Installation: {cmd} im Theme-Ordner ausführen.";
theUILang.cqb_wn_none          = "Noch keine Versionshinweise.";
theUILang.qbPalHelp            = "Hilfe";
