/*
 * club-QuickBox skin for ruTorrent -- French strings.
 *
 * The ruTorrent theme plugin loads its OWN catalog (plugins/theme/lang/*.js),
 * not a skin's, so these strings are also registered inline by the skin's
 * modules (init.js and the js/*.js feature files). This file is the single
 * translation reference for the skin's own strings; keys are grouped by the
 * surface that uses them.
 */

/* Appearance + theme variants (init.js, topbar.js, extras.js). */
theUILang.qbAppearance      = "Apparence";
theUILang.qbVariantAuto     = "Auto (tableau de bord)";
theUILang.qbVariantSpectre  = "Spectre";
theUILang.qbVariantSmoked   = "Smoked";
theUILang.qbVariantReel     = "Reel";
theUILang.qbVariantLight    = "Clair";
theUILang.cqb_var_auto      = "Auto";

/* Settings dialog (settings.js, settings-plugins.js). */
theUILang.cqb_zero_unlimited = "Mettez 0 pour illimité.";
theUILang.cqb_decimals_hint  = "Laissez une cellule vide pour hériter de la valeur par défaut.";
theUILang.cqb_filter_trackers = "Filtrer les trackers";
theUILang.cqb_tracker        = "Tracker";
theUILang.cqb_enabled        = "Activé";
theUILang.cqb_grp_hashing    = "Hashing";
theUILang.cqb_grp_preload    = "Preload";
theUILang.cqb_grp_buffers    = "Tampons";
theUILang.cqb_grp_limits     = "Limites";
theUILang.cqb_grp_network    = "Réseau";
theUILang.cqb_grp_session    = "Session et délais";
theUILang.cqb_grp_flags      = "Drapeaux";
theUILang.cqb_stg_empty      = "Aucun tracker correspondant";
theUILang.cqb_browse         = "Parcourir";
theUILang.cqb_not_set        = "Non défini";
theUILang.qbAutoLabel       = "AutoLabel";
theUILang.qbAutoMove        = "AutoMove";
theUILang.qbAutoWatch       = "AutoWatch";
theUILang.qbCookiesHelp     = "Un hôte par ligne. Format : host|name1=value1;name2=value2 (exemple : tracker.example|uid=123;pass=abc)";
theUILang.qbFindAtHelp      = "Une recherche par ligne. Format : name|url -- utilisez {HASH} pour le hash du torrent (exemple : Name|https://example.org/?q={HASH})";
theUILang.qbAnnounceHelp    = "Une URL d'announce par ligne.";
theUILang.qbBrowse          = "Parcourir";

/* Add / Create / task-console dialogs (dialogs.js). */
theUILang.cqb_add_drop_hint   = "Glissez des fichiers .torrent ici ou {browse}";
theUILang.cqb_tl_drop_hint    = "Glissez un .png ici ou {browse}";
theUILang.cqb_mi_general      = "Général";
theUILang.cqb_task_mediainfo  = "Media Info";
theUILang.cqb_task_screenshots = "Captures d'écran";
theUILang.cqb_task_create     = "Créer un torrent";
theUILang.cqb_task_unpack     = "Décompresser";
theUILang.cqb_task_title      = "Tâche";
theUILang.cqb_create_source_ph = "Chemin vers un fichier ou un dossier, ou choisissez-en un";
theUILang.cqb_create_torrent  = "Créer un torrent";
theUILang.cqb_add_source      = "Source";
theUILang.cqb_add_file        = "Fichier";
theUILang.cqb_add_url         = "URL";
theUILang.cqb_add_dir_ph      = "Répertoire de téléchargement par défaut";
theUILang.cqb_label_to_list   = "Choisissez une étiquette existante";
theUILang.cqb_help_trackers   = "Une URL de tracker par ligne.";
theUILang.cqb_help_seed       = "Commencer le partage dès que le torrent est créé.";
theUILang.cqb_help_private    = "Marquer comme privé : pas de DHT ni de peer exchange.";
theUILang.cqb_help_hybrid     = "Créer un torrent hybride v1 + v2.";

/* Inline edit of a torrent option (dialogs.js). */
theUILang.cqb_edit_yes        = "Oui";
theUILang.cqb_edit_no         = "Non";
theUILang.cqb_edit_change     = "Modifier";

/* Chunks pane (chunks.js). */
theUILang.cqb_chunks_chunks     = "Chunks";
theUILang.cqb_chunks_size       = "Taille";
theUILang.cqb_chunks_done       = "Terminé";
theUILang.cqb_chunks_seen       = "Vu";
theUILang.cqb_chunks_downloaded = "Téléchargé";
theUILang.cqb_chunks_mode       = "Mode de la carte des chunks";
theUILang.cqb_chunks_one        = "Chunk {n}";
theUILang.cqb_chunks_range      = "Chunks {a}–{b}";
theUILang.cqb_chunks_seen_count = "{n}× vu";
theUILang.cqb_chunks_a11y_seen  = "Carte de disponibilité des chunks : {pct}% des groupes vus, {n} chunks";
theUILang.cqb_chunks_a11y_done  = "Carte d'avancement des chunks : {pct}% terminé, {n} chunks";
theUILang.cqb_chunks_cell_one   = "1 cellule = {n} chunk";
theUILang.cqb_chunks_cell_many  = "1 cellule = {n} chunks";

/* Details pane -- overview, file manager, traffic/speed toolbars (details.js). */
theUILang.cqb_det_copy          = "Copier";
theUILang.cqb_det_download      = "Téléchargement";
theUILang.cqb_det_upload        = "Envoi";
theUILang.cqb_det_ratio         = "Ratio";
theUILang.cqb_det_eta           = "ETA";
theUILang.cqb_det_elapsed       = "Écoulé";
theUILang.cqb_det_remaining     = "Restant";
theUILang.cqb_det_swarm         = "Essaim";
theUILang.cqb_det_seeds         = "Sources";
theUILang.cqb_det_peers         = "Clients";
theUILang.cqb_det_wasted        = "Rejeté";
theUILang.cqb_det_url           = "URL";
theUILang.cqb_det_status        = "Statut";
theUILang.cqb_det_next_announce = "Prochain announce";
theUILang.cqb_det_storage       = "Stockage";
theUILang.cqb_det_save_path     = "Chemin de sauvegarde";
theUILang.cqb_det_open_fm       = "Ouvrir dans le Gestionnaire de fichiers";
theUILang.cqb_det_free_disk     = "Disque libre";
theUILang.cqb_det_hash          = "Hash";
theUILang.cqb_det_comment       = "Commentaire";
theUILang.cqb_det_updown        = "{up} envoi / {down} réception";
theUILang.cqb_det_tracker_ok    = "OK";
theUILang.cqb_det_due_now       = "dû maintenant";
theUILang.cqb_det_outside_fm    = "Hors de votre dossier du Gestionnaire de fichiers";
theUILang.cqb_det_no_comment    = "Aucun commentaire";
theUILang.cqb_det_parent_dir    = "Répertoire parent";
theUILang.cqb_det_new_folder    = "Nouveau dossier";
theUILang.cqb_det_path          = "Chemin";
theUILang.cqb_det_recent_folders = "Dossiers récents";
theUILang.cqb_det_toggle        = "Basculer {name}";
theUILang.cqb_det_downloaded    = "Téléchargé";
theUILang.cqb_det_uploaded      = "Envoyé";
theUILang.cqb_det_clear_stats   = "Effacer les statistiques";
theUILang.cqb_det_console       = "Console";
theUILang.cqb_det_more_tabs     = "Plus d'onglets";
theUILang.cqb_det_more          = "Plus";

/* Top app bar -- button tooltips + search (topbar.js). */
theUILang.cqb_tb_add        = "Ajouter un torrent";
theUILang.cqb_tb_remove     = "Retirer";
theUILang.cqb_tb_start      = "Démarrer";
theUILang.cqb_tb_pause      = "Pause";
theUILang.cqb_tb_stop       = "Arrêter";
theUILang.cqb_tb_settings   = "Paramètres";
theUILang.cqb_tb_help       = "Aide";
theUILang.cqb_tb_logoff     = "Déconnexion";
theUILang.cqb_tb_create     = "Créer un torrent";
theUILang.cqb_tb_rss        = "RSS";
theUILang.cqb_tb_plugins    = "Plugins";
theUILang.cqb_search        = "Rechercher";

/* Full-window drop zone + command palette (extras.js). */
theUILang.qbDropTitle       = "Déposez pour ajouter des torrents";
theUILang.qbDropSub         = "Déposez des fichiers .torrent n'importe où pour les ajouter";
theUILang.qbPalActions      = "Actions";
theUILang.qbPalAdd          = "Ajouter un torrent";
theUILang.qbPalStart        = "Démarrer la sélection";
theUILang.qbPalPause        = "Mettre en pause la sélection";
theUILang.qbPalStop         = "Arrêter la sélection";
theUILang.qbPalRemove       = "Retirer la sélection";
theUILang.qbPalSettings     = "Paramètres";
theUILang.qbPalAppearance   = "Apparence";
theUILang.qbPalSwitch       = "Basculer vers ";
theUILang.qbPalFilters      = "Filtres";
theUILang.qbPalAll          = "Tous les torrents";
theUILang.qbPalSearchGroup  = "Rechercher";
theUILang.qbPalSearchFor    = "Rechercher des torrents pour";
theUILang.qbPalNoResults    = "Aucune commande correspondante";
theUILang.qbPalPlaceholder  = "Tapez une commande ou recherchez des torrents...";
theUILang.qbPalNavigate     = "naviguer";
theUILang.qbPalOpen         = "exécuter";
theUILang.qbPalClose        = "fermer";

/* Settings page descriptions (settings.js). */
theUILang.cqb_stg_desc_gl          = "Comportement de l'interface, intervalle de mise à jour et préréglages de vitesse.";
theUILang.cqb_stg_desc_dl          = "Limites de bande passante de téléchargement et comportement par défaut.";
theUILang.cqb_stg_desc_con         = "Port d'écoute, limites de débit globales et plafonds de connexion.";
theUILang.cqb_stg_desc_bt          = "DHT, peer exchange et autres fonctions BitTorrent.";
theUILang.cqb_stg_desc_fmt         = "Comment les tailles, les dates et les nombres sont affichés.";
theUILang.cqb_stg_desc_ao          = "Options de bas niveau pour les utilisateurs avancés.";
theUILang.cqb_stg_desc_dev         = "Options de diagnostic et réservées aux développeurs.";
theUILang.cqb_stg_desc_loginmgr    = "Identifiants de tracker enregistrés utilisés par les autotools et la recherche.";
theUILang.cqb_stg_desc_autotools   = "Actions automatiques appliquées aux torrents correspondants.";
theUILang.cqb_stg_desc_xmpp        = "Notifications de chat envoyées via un compte XMPP.";
theUILang.cqb_stg_desc_cookies     = "Cookies par hôte envoyés lors de la récupération des torrents.";
theUILang.cqb_stg_desc_lookat      = "Liens de recherche personnalisés affichés dans le menu du torrent.";
theUILang.cqb_stg_desc_retrackers  = "Trackers ajoutés automatiquement aux nouveaux torrents.";
theUILang.cqb_stg_desc_rss         = "Flux RSS et filtres de téléchargement automatique.";
theUILang.cqb_stg_desc_scheduler   = "Plages horaires qui modifient les limites automatiquement.";
theUILang.cqb_stg_desc_extsearch   = "Moteurs de recherche utilisés par la recherche de la barre d'outils.";
theUILang.cqb_stg_desc_unpack      = "Extraction automatique des archives terminées.";
theUILang.cqb_stg_desc_throttle    = "Canaux de bande passante nommés pour regrouper les torrents.";
theUILang.cqb_stg_desc_ratio       = "Groupes de ratio et les actions prises à chaque objectif.";
theUILang.cqb_stg_desc_screenshots = "Aperçus miniatures générés à partir des fichiers multimédias.";
theUILang.cqb_stg_desc_uploadeta   = "Ratio cible et temps utilisés pour estimer le partage.";
theUILang.cqb_stg_desc_history     = "Rétention du journal d'événements et envoi des notifications.";

/* Settings nav + account table chrome (settings.js). */
theUILang.cqb_stg_grp_plugins = "Plugins";
theUILang.cqb_stg_filter      = "Filtrer les paramètres";
theUILang.cqb_stg_no_match    = "Aucun paramètre correspondant";
theUILang.cqb_acct_login      = "Identifiant {name}";
theUILang.cqb_acct_password   = "Mot de passe {name}";
theUILang.cqb_acct_autologin  = "Connexion auto {name}";
theUILang.cqb_unit_bytes      = "octets";

/* Advanced rtorrent option labels (settings.js, st_ao page). */
theUILang.cqb_ao_hash_interval        = "Intervalle de vérification du hash";
theUILang.cqb_ao_hash_max_tries       = "Essais max. de vérification du hash";
theUILang.cqb_ao_hash_read_ahead      = "Lecture anticipée du hash";
theUILang.cqb_ao_preload_type         = "Type de preload";
theUILang.cqb_ao_preload_min_size     = "Taille minimale de preload";
theUILang.cqb_ao_preload_required_rate = "Débit requis de preload";
theUILang.cqb_ao_receive_buffer_size  = "Taille du tampon de réception";
theUILang.cqb_ao_send_buffer_size     = "Taille du tampon d'envoi";
theUILang.cqb_ao_max_downloads_div    = "Diviseur de téléchargements max.";
theUILang.cqb_ao_max_uploads_div      = "Diviseur d'envois max.";
theUILang.cqb_ao_max_file_size        = "Taille de fichier maximale";
theUILang.cqb_ao_split_file_size      = "Taille de fractionnement de fichier";
theUILang.cqb_ao_split_suffix         = "Suffixe de fractionnement";
theUILang.cqb_ao_http_cacert          = "Certificat CA HTTP";
theUILang.cqb_ao_http_capath          = "Chemin CA HTTP";
theUILang.cqb_ao_http_proxy           = "Proxy HTTP";
theUILang.cqb_ao_proxy_address        = "Adresse du proxy";
theUILang.cqb_ao_bind                 = "Adresse de liaison";
theUILang.cqb_ao_session              = "Répertoire de session";
theUILang.cqb_ao_timeout_safe_sync    = "Délai de sync sûr";
theUILang.cqb_ao_timeout_sync         = "Délai de sync";
theUILang.cqb_empty_ratio_rules       = "Aucune règle de ratio pour l'instant";
theUILang.cqb_empty_rss_filters       = "Aucun filtre pour l'instant";
theUILang.cqb_empty_rss_group         = "Aucun flux dans ce groupe pour l'instant";
theUILang.cqb_empty_checklist        = "Rien de sélectionné";

/* Icon picker (js/icons.js). */
theUILang.cqb_icons_choose        = "Choisir une icône";
theUILang.cqb_icons_tab_icons     = "Icônes";
theUILang.cqb_icons_tab_upload    = "Téléverser une image";
theUILang.cqb_icons_search        = "Rechercher des icônes";
theUILang.cqb_icons_categories    = "Catégories";
theUILang.cqb_icons_tint          = "Teinte";
theUILang.cqb_icons_tint_auto     = "Auto (variante)";
theUILang.cqb_icons_upload_aria   = "Téléverser une image PNG";
theUILang.cqb_icons_drop_title    = "Déposez une PNG ici ou cliquez pour parcourir";
theUILang.cqb_icons_drop_hint     = "PNG uniquement. Affiché aussi dans ruTorrent standard.";
theUILang.cqb_icons_upload_note   = "Une image téléversée est conservée telle quelle et prime sur un glyphe choisi. Retirez-la pour revenir à la valeur intelligente par défaut.";
theUILang.cqb_icons_reset         = "Réinitialiser à la valeur intelligente par défaut";
theUILang.cqb_icons_use           = "Utiliser l'icône";
theUILang.cqb_icons_remove        = "Retirer l'image";
theUILang.cqb_icons_upload_btn    = "Téléverser";
theUILang.cqb_icons_no_match      = "Aucune icône ne correspond à “{term}”";
theUILang.cqb_icons_cat_all       = "Toutes";
theUILang.cqb_icons_more_cats     = "Plus de catégories";
theUILang.cqb_icons_more          = "Plus";
theUILang.cqb_icons_more_count    = "Plus ({n})";
theUILang.cqb_icons_upload_failed = "Échec du téléversement : {msg}";
theUILang.cqb_icons_sub_tracker   = "Tracker : {name}";
theUILang.cqb_icons_sub_label     = "Étiquette : {name}";

/* Details empty states (js/details.js). */
theUILang.cqb_det_empty_general  = "Sélectionnez un torrent pour voir son aperçu";
theUILang.cqb_det_empty_files    = "Sélectionnez un torrent pour voir ses fichiers";
theUILang.cqb_det_empty_trackers = "Sélectionnez un torrent pour voir ses trackers";
theUILang.cqb_det_empty_peers    = "Sélectionnez un torrent pour voir ses clients";
theUILang.cqb_det_empty_pieces   = "Sélectionnez un torrent pour voir ses pièces";

/* Sidebar rail (js/sidebar.js). */
theUILang.cqb_nav_collapse = "Réduire la barre latérale";
theUILang.cqb_nav_expand   = "Développer la barre latérale";

/* Custom select popover (js/select.js). */
theUILang.qbNoMatches = "Aucune correspondance";
theUILang.qbNoOptions = "Aucune option";

/* Peers pane (js/peers.js). */
theUILang.cqb_noPeers           = "Aucun client connecté";
theUILang.cqb_peerFlagIncoming  = "Connexion entrante";
theUILang.cqb_peerFlagEncrypted = "Chiffré";
theUILang.cqb_peerFlagSnubbed   = "Snobé";

/* About / What's new (js/about.js; the palette command in js/extras.js). */
theUILang.cqb_wn_title         = "Nouveautés de club-QuickBox";
theUILang.cqb_wn_link          = "Nouveautés";
theUILang.cqb_wn_version       = "club-QuickBox v{version}";
theUILang.cqb_wn_update        = "Mise à jour disponible : v{version}";
theUILang.cqb_wn_update_qb     = "QuickBox Pro : exécutez {cmd} en tant qu'administrateur.";
theUILang.cqb_wn_update_manual = "Installation manuelle : exécutez {cmd} dans le dossier du thème.";
theUILang.cqb_wn_none          = "Pas encore de notes de version.";
theUILang.qbPalHelp            = "Aide";
