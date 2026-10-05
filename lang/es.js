/*
 * club-QuickBox skin for ruTorrent -- Spanish strings.
 *
 * The ruTorrent theme plugin loads its OWN catalog (plugins/theme/lang/*.js),
 * not a skin's, so these strings are also registered inline by the skin's
 * modules (init.js and the js/*.js feature files). This file is the single
 * translation reference for the skin's own strings; keys are grouped by the
 * surface that uses them.
 */

/* Appearance + theme variants (init.js, topbar.js, extras.js). */
theUILang.qbAppearance      = "Apariencia";
theUILang.qbVariantAuto     = "Auto (panel)";
theUILang.qbVariantSpectre  = "Spectre";
theUILang.qbVariantSmoked   = "Smoked";
theUILang.qbVariantReel     = "Reel";
theUILang.qbVariantLight    = "Claro";
theUILang.cqb_var_auto      = "Auto";

/* Settings dialog (settings.js, settings-plugins.js). */
theUILang.cqb_zero_unlimited = "Pon 0 para ilimitado.";
theUILang.cqb_decimals_hint  = "Deja una celda vacía para heredar el valor predeterminado.";
theUILang.cqb_filter_trackers = "Filtrar trackers";
theUILang.cqb_tracker        = "Tracker";
theUILang.cqb_enabled        = "Activado";
theUILang.cqb_grp_hashing    = "Hashing";
theUILang.cqb_grp_preload    = "Preload";
theUILang.cqb_grp_buffers    = "Búferes";
theUILang.cqb_grp_limits     = "Límites";
theUILang.cqb_grp_network    = "Red";
theUILang.cqb_grp_session    = "Sesión y tiempos de espera";
theUILang.cqb_grp_flags      = "Banderas";
theUILang.cqb_stg_empty      = "No hay trackers coincidentes";
theUILang.cqb_browse         = "Examinar";
theUILang.cqb_not_set        = "Sin definir";
theUILang.qbAutoLabel       = "AutoLabel";
theUILang.qbAutoMove        = "AutoMove";
theUILang.qbAutoWatch       = "AutoWatch";
theUILang.qbCookiesHelp     = "Un host por línea. Formato: host|name1=value1;name2=value2 (ejemplo: tracker.example|uid=123;pass=abc)";
theUILang.qbFindAtHelp      = "Una búsqueda por línea. Formato: name|url -- usa {HASH} para el hash del torrent (ejemplo: Name|https://example.org/?q={HASH})";
theUILang.qbAnnounceHelp    = "Una URL de announce por línea.";
theUILang.qbBrowse          = "Examinar";

/* Add / Create / task-console dialogs (dialogs.js). */
theUILang.cqb_add_drop_hint   = "Arrastra archivos .torrent aquí o {browse}";
theUILang.cqb_tl_drop_hint    = "Arrastra un .png aquí o {browse}";
theUILang.cqb_mi_general      = "General";
theUILang.cqb_task_mediainfo  = "Media Info";
theUILang.cqb_task_screenshots = "Capturas";
theUILang.cqb_task_create     = "Crear torrent";
theUILang.cqb_task_unpack     = "Descomprimir";
theUILang.cqb_task_title      = "Tarea";
theUILang.cqb_create_source_ph = "Ruta a un archivo o carpeta, o elige uno";
theUILang.cqb_create_torrent  = "Crear torrent";
theUILang.cqb_add_source      = "Origen";
theUILang.cqb_add_file        = "Archivo";
theUILang.cqb_add_url         = "URL";
theUILang.cqb_add_dir_ph      = "Directorio de descarga predeterminado";
theUILang.cqb_label_to_list   = "Elige una etiqueta existente";
theUILang.cqb_help_trackers   = "Una URL de tracker por línea.";
theUILang.cqb_help_seed       = "Empezar a compartir en cuanto se cree el torrent.";
theUILang.cqb_help_private    = "Marcar como privado: sin DHT ni peer exchange.";
theUILang.cqb_help_hybrid     = "Crear un torrent híbrido v1 + v2.";

/* Inline edit of a torrent option (dialogs.js). */
theUILang.cqb_edit_yes        = "Sí";
theUILang.cqb_edit_no         = "No";
theUILang.cqb_edit_change     = "Cambiar";

/* Chunks pane (chunks.js). */
theUILang.cqb_chunks_chunks     = "Chunks";
theUILang.cqb_chunks_size       = "Tamaño";
theUILang.cqb_chunks_done       = "Finalizado";
theUILang.cqb_chunks_seen       = "Visto";
theUILang.cqb_chunks_downloaded = "Descargado";
theUILang.cqb_chunks_mode       = "Modo del mapa de chunks";
theUILang.cqb_chunks_one        = "Chunk {n}";
theUILang.cqb_chunks_range      = "Chunks {a}–{b}";
theUILang.cqb_chunks_seen_count = "{n}× visto";
theUILang.cqb_chunks_a11y_seen  = "Mapa de disponibilidad de chunks: {pct}% de grupos vistos, {n} chunks";
theUILang.cqb_chunks_a11y_done  = "Mapa de completado de chunks: {pct}% completo, {n} chunks";
theUILang.cqb_chunks_cell_one   = "1 celda = {n} chunk";
theUILang.cqb_chunks_cell_many  = "1 celda = {n} chunks";

/* Details pane -- overview, file manager, traffic/speed toolbars (details.js). */
theUILang.cqb_det_copy          = "Copiar";
theUILang.cqb_det_download      = "Descarga";
theUILang.cqb_det_upload        = "Subida";
theUILang.cqb_det_ratio         = "Ratio";
theUILang.cqb_det_eta           = "ETA";
theUILang.cqb_det_elapsed       = "Transcurrido";
theUILang.cqb_det_remaining     = "Restante";
theUILang.cqb_det_swarm         = "Enjambre";
theUILang.cqb_det_seeds         = "Semillas";
theUILang.cqb_det_peers         = "Clientes";
theUILang.cqb_det_wasted        = "Desperdiciado";
theUILang.cqb_det_url           = "URL";
theUILang.cqb_det_status        = "Estado";
theUILang.cqb_det_next_announce = "Próximo announce";
theUILang.cqb_det_storage       = "Almacenamiento";
theUILang.cqb_det_save_path     = "Ruta de guardado";
theUILang.cqb_det_open_fm       = "Abrir en el Administrador de archivos";
theUILang.cqb_det_free_disk     = "Disco libre";
theUILang.cqb_det_hash          = "Hash";
theUILang.cqb_det_comment       = "Comentario";
theUILang.cqb_det_updown        = "{up} subida / {down} bajada";
theUILang.cqb_det_tracker_ok    = "OK";
theUILang.cqb_det_due_now       = "pendiente ahora";
theUILang.cqb_det_outside_fm    = "Fuera de tu carpeta del Administrador de archivos";
theUILang.cqb_det_no_comment    = "Sin comentario";
theUILang.cqb_det_parent_dir    = "Directorio superior";
theUILang.cqb_det_new_folder    = "Nueva carpeta";
theUILang.cqb_det_path          = "Ruta";
theUILang.cqb_det_recent_folders = "Carpetas recientes";
theUILang.cqb_det_toggle        = "Alternar {name}";
theUILang.cqb_det_downloaded    = "Descargado";
theUILang.cqb_det_uploaded      = "Subido";
theUILang.cqb_det_clear_stats   = "Borrar estadísticas";
theUILang.cqb_det_console       = "Consola";
theUILang.cqb_det_more_tabs     = "Más pestañas";
theUILang.cqb_det_more          = "Más";

/* Top app bar -- button tooltips + search (topbar.js). */
theUILang.cqb_tb_add        = "Añadir torrent";
theUILang.cqb_tb_remove     = "Eliminar";
theUILang.cqb_tb_start      = "Iniciar";
theUILang.cqb_tb_pause      = "Pausar";
theUILang.cqb_tb_stop       = "Detener";
theUILang.cqb_tb_settings   = "Ajustes";
theUILang.cqb_tb_help       = "Ayuda";
theUILang.cqb_tb_logoff     = "Cerrar sesión";
theUILang.cqb_tb_create     = "Crear torrent";
theUILang.cqb_tb_rss        = "RSS";
theUILang.cqb_tb_plugins    = "Plugins";
theUILang.cqb_search        = "Buscar";

/* Full-window drop zone + command palette (extras.js). */
theUILang.qbDropTitle       = "Suelta para añadir torrents";
theUILang.qbDropSub         = "Suelta archivos .torrent en cualquier lugar para añadirlos";
theUILang.qbPalActions      = "Acciones";
theUILang.qbPalAdd          = "Añadir torrent";
theUILang.qbPalStart        = "Iniciar selección";
theUILang.qbPalPause        = "Pausar selección";
theUILang.qbPalStop         = "Detener selección";
theUILang.qbPalRemove       = "Eliminar selección";
theUILang.qbPalSettings     = "Ajustes";
theUILang.qbPalAppearance   = "Apariencia";
theUILang.qbPalSwitch       = "Cambiar a ";
theUILang.qbPalFilters      = "Filtros";
theUILang.qbPalAll          = "Todos los torrents";
theUILang.qbPalSearchGroup  = "Buscar";
theUILang.qbPalSearchFor    = "Buscar torrents por";
theUILang.qbPalNoResults    = "No hay comandos coincidentes";
theUILang.qbPalPlaceholder  = "Escribe un comando o busca torrents...";
theUILang.qbPalNavigate     = "navegar";
theUILang.qbPalOpen         = "ejecutar";
theUILang.qbPalClose        = "cerrar";

/* Settings page descriptions (settings.js). */
theUILang.cqb_stg_desc_gl          = "Comportamiento de la interfaz, intervalo de actualización y perfiles de velocidad.";
theUILang.cqb_stg_desc_dl          = "Límites de ancho de banda de descarga y comportamiento predeterminados.";
theUILang.cqb_stg_desc_con         = "Puerto de escucha, límites de tasa globales y topes de conexión.";
theUILang.cqb_stg_desc_bt          = "DHT, peer exchange y otras funciones de BitTorrent.";
theUILang.cqb_stg_desc_fmt         = "Cómo se muestran los tamaños, las fechas y los números.";
theUILang.cqb_stg_desc_ao          = "Opciones de bajo nivel para usuarios avanzados.";
theUILang.cqb_stg_desc_dev         = "Opciones de diagnóstico y solo para desarrolladores.";
theUILang.cqb_stg_desc_loginmgr    = "Credenciales de tracker guardadas usadas por autotools y la búsqueda.";
theUILang.cqb_stg_desc_autotools   = "Acciones automáticas aplicadas a los torrents coincidentes.";
theUILang.cqb_stg_desc_xmpp        = "Notificaciones de chat enviadas a través de una cuenta XMPP.";
theUILang.cqb_stg_desc_cookies     = "Cookies por host enviadas al obtener torrents.";
theUILang.cqb_stg_desc_lookat      = "Enlaces de búsqueda personalizados mostrados en el menú del torrent.";
theUILang.cqb_stg_desc_retrackers  = "Trackers añadidos automáticamente a los torrents nuevos.";
theUILang.cqb_stg_desc_rss         = "Feeds RSS y filtros de descarga automática.";
theUILang.cqb_stg_desc_scheduler   = "Franjas horarias que cambian los límites automáticamente.";
theUILang.cqb_stg_desc_extsearch   = "Motores de búsqueda usados por la búsqueda de la barra.";
theUILang.cqb_stg_desc_unpack      = "Extracción automática de archivos completados.";
theUILang.cqb_stg_desc_throttle    = "Canales de ancho de banda con nombre para agrupar torrents.";
theUILang.cqb_stg_desc_ratio       = "Grupos de ratio y las acciones tomadas en cada objetivo.";
theUILang.cqb_stg_desc_screenshots = "Miniaturas generadas a partir de archivos multimedia.";
theUILang.cqb_stg_desc_uploadeta   = "Ratio objetivo y tiempo usados para estimar la siembra.";
theUILang.cqb_stg_desc_history     = "Retención del registro de eventos y envío de notificaciones.";

/* Settings nav + account table chrome (settings.js). */
theUILang.cqb_stg_grp_plugins = "Plugins";
theUILang.cqb_stg_filter      = "Filtrar ajustes";
theUILang.cqb_stg_no_match    = "No hay ajustes coincidentes";
theUILang.cqb_acct_login      = "Usuario de {name}";
theUILang.cqb_acct_password   = "Contraseña de {name}";
theUILang.cqb_acct_autologin  = "Autologin de {name}";
theUILang.cqb_unit_bytes      = "bytes";

/* Advanced rtorrent option labels (settings.js, st_ao page). */
theUILang.cqb_ao_hash_interval        = "Intervalo de verificación de hash";
theUILang.cqb_ao_hash_max_tries       = "Intentos máx. de verificación de hash";
theUILang.cqb_ao_hash_read_ahead      = "Lectura anticipada de hash";
theUILang.cqb_ao_preload_type         = "Tipo de preload";
theUILang.cqb_ao_preload_min_size     = "Tamaño mínimo de preload";
theUILang.cqb_ao_preload_required_rate = "Tasa requerida de preload";
theUILang.cqb_ao_receive_buffer_size  = "Tamaño del búfer de recepción";
theUILang.cqb_ao_send_buffer_size     = "Tamaño del búfer de envío";
theUILang.cqb_ao_max_downloads_div    = "Divisor de descargas máx.";
theUILang.cqb_ao_max_uploads_div      = "Divisor de subidas máx.";
theUILang.cqb_ao_max_file_size        = "Tamaño máximo de archivo";
theUILang.cqb_ao_split_file_size      = "Tamaño de división de archivo";
theUILang.cqb_ao_split_suffix         = "Sufijo de división";
theUILang.cqb_ao_http_cacert          = "Certificado CA de HTTP";
theUILang.cqb_ao_http_capath          = "Ruta CA de HTTP";
theUILang.cqb_ao_http_proxy           = "Proxy HTTP";
theUILang.cqb_ao_proxy_address        = "Dirección del proxy";
theUILang.cqb_ao_bind                 = "Dirección de enlace";
theUILang.cqb_ao_session              = "Directorio de sesión";
theUILang.cqb_ao_timeout_safe_sync    = "Tiempo de espera de sync seguro";
theUILang.cqb_ao_timeout_sync         = "Tiempo de espera de sync";
theUILang.cqb_empty_ratio_rules       = "Aún no hay reglas de ratio";
theUILang.cqb_empty_rss_filters       = "Aún no hay filtros";
theUILang.cqb_empty_rss_group         = "Aún no hay feeds en este grupo";
theUILang.cqb_empty_checklist        = "Nada seleccionado";

/* Icon picker (js/icons.js). */
theUILang.cqb_icons_choose        = "Elegir icono";
theUILang.cqb_icons_tab_icons     = "Iconos";
theUILang.cqb_icons_tab_upload    = "Subir imagen";
theUILang.cqb_icons_search        = "Buscar iconos";
theUILang.cqb_icons_categories    = "Categorías";
theUILang.cqb_icons_tint          = "Tono";
theUILang.cqb_icons_tint_auto     = "Auto (variante)";
theUILang.cqb_icons_upload_aria   = "Subir una imagen PNG";
theUILang.cqb_icons_drop_title    = "Suelta una PNG aquí o haz clic para examinar";
theUILang.cqb_icons_drop_hint     = "Solo PNG. Se muestra también en ruTorrent normal.";
theUILang.cqb_icons_upload_note   = "Una imagen subida se conserva tal cual y tiene prioridad sobre un glifo elegido. Elimínala para volver al valor inteligente predeterminado.";
theUILang.cqb_icons_reset         = "Restablecer al valor inteligente predeterminado";
theUILang.cqb_icons_use           = "Usar icono";
theUILang.cqb_icons_remove        = "Eliminar imagen";
theUILang.cqb_icons_upload_btn    = "Subir";
theUILang.cqb_icons_no_match      = "Ningún icono coincide con “{term}”";
theUILang.cqb_icons_cat_all       = "Todos";
theUILang.cqb_icons_more_cats     = "Más categorías";
theUILang.cqb_icons_more          = "Más";
theUILang.cqb_icons_more_count    = "Más ({n})";
theUILang.cqb_icons_upload_failed = "Error al subir: {msg}";
theUILang.cqb_icons_sub_tracker   = "Tracker: {name}";
theUILang.cqb_icons_sub_label     = "Etiqueta: {name}";

/* Details empty states (js/details.js). */
theUILang.cqb_det_empty_general  = "Selecciona un torrent para ver su resumen";
theUILang.cqb_det_empty_files    = "Selecciona un torrent para ver sus archivos";
theUILang.cqb_det_empty_trackers = "Selecciona un torrent para ver sus trackers";
theUILang.cqb_det_empty_peers    = "Selecciona un torrent para ver sus clientes";
theUILang.cqb_det_empty_pieces   = "Selecciona un torrent para ver sus piezas";

/* Sidebar rail (js/sidebar.js). */
theUILang.cqb_nav_collapse = "Contraer barra lateral";
theUILang.cqb_nav_expand   = "Expandir barra lateral";

/* Custom select popover (js/select.js). */
theUILang.qbNoMatches = "Sin coincidencias";
theUILang.qbNoOptions = "Sin opciones";

/* Peers pane (js/peers.js). */
theUILang.cqb_noPeers           = "No hay clientes conectados";
theUILang.cqb_peerFlagIncoming  = "Conexión entrante";
theUILang.cqb_peerFlagEncrypted = "Cifrado";
theUILang.cqb_peerFlagSnubbed   = "Ignorado";

/* About / What's new (js/about.js; the palette command in js/extras.js). */
theUILang.cqb_wn_title         = "Novedades en club-QuickBox";
theUILang.cqb_wn_link          = "Novedades";
theUILang.cqb_wn_version       = "club-QuickBox v{version}";
theUILang.cqb_wn_update        = "Actualización disponible: v{version}";
theUILang.cqb_wn_update_qb     = "QuickBox Pro: ejecuta {cmd} como administrador.";
theUILang.cqb_wn_update_manual = "Instalación manual: ejecuta {cmd} en la carpeta del tema.";
theUILang.cqb_wn_none          = "Aún no hay notas de la versión.";
theUILang.qbPalHelp            = "Ayuda";
