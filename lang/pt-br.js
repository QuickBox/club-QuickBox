/*
 * club-QuickBox skin for ruTorrent -- Portuguese strings.
 *
 * The ruTorrent theme plugin loads its OWN catalog (plugins/theme/lang/*.js),
 * not a skin's, so these strings are also registered inline by the skin's
 * modules (init.js and the js/*.js feature files). This file is the single
 * translation reference for the skin's own strings; keys are grouped by the
 * surface that uses them.
 */

/* Appearance + theme variants (init.js, topbar.js, extras.js). */
theUILang.qbAppearance      = "Aparência";
theUILang.qbVariantAuto     = "Auto (painel)";
theUILang.qbVariantSpectre  = "Spectre";
theUILang.qbVariantSmoked   = "Smoked";
theUILang.qbVariantReel     = "Reel";
theUILang.qbVariantLight    = "Claro";
theUILang.cqb_var_auto      = "Auto";

/* Settings dialog (settings.js, settings-plugins.js). */
theUILang.cqb_zero_unlimited = "Defina 0 para ilimitado.";
theUILang.cqb_decimals_hint  = "Deixe uma célula em branco para herdar o padrão.";
theUILang.cqb_filter_trackers = "Filtrar rastreadores";
theUILang.cqb_tracker        = "Rastreador";
theUILang.cqb_enabled        = "Ativado";
theUILang.cqb_grp_hashing    = "Hashing";
theUILang.cqb_grp_preload    = "Preload";
theUILang.cqb_grp_buffers    = "Buffers";
theUILang.cqb_grp_limits     = "Limites";
theUILang.cqb_grp_network    = "Rede";
theUILang.cqb_grp_session    = "Sessão e tempos limite";
theUILang.cqb_grp_flags      = "Flags";
theUILang.cqb_stg_empty      = "Nenhum rastreador correspondente";
theUILang.cqb_browse         = "Procurar";
theUILang.cqb_not_set        = "Não definido";
theUILang.qbAutoLabel       = "AutoLabel";
theUILang.qbAutoMove        = "AutoMove";
theUILang.qbAutoWatch       = "AutoWatch";
theUILang.qbCookiesHelp     = "Um host por linha. Formato: host|name1=value1;name2=value2 (exemplo: tracker.example|uid=123;pass=abc)";
theUILang.qbFindAtHelp      = "Uma busca por linha. Formato: name|url -- use {HASH} para o hash do torrent (exemplo: Name|https://example.org/?q={HASH})";
theUILang.qbAnnounceHelp    = "Uma URL de announce por linha.";
theUILang.qbBrowse          = "Procurar";

/* Add / Create / task-console dialogs (dialogs.js). */
theUILang.cqb_add_drop_hint   = "Arraste arquivos .torrent aqui ou {browse}";
theUILang.cqb_tl_drop_hint    = "Arraste um .png aqui ou {browse}";
theUILang.cqb_mi_general      = "Geral";
theUILang.cqb_task_mediainfo  = "Media Info";
theUILang.cqb_task_screenshots = "Capturas de tela";
theUILang.cqb_task_create     = "Criar torrent";
theUILang.cqb_task_unpack     = "Descompactar";
theUILang.cqb_task_title      = "Tarefa";
theUILang.cqb_create_source_ph = "Caminho para um arquivo ou pasta, ou escolha um";
theUILang.cqb_create_torrent  = "Criar torrent";
theUILang.cqb_add_source      = "Origem";
theUILang.cqb_add_file        = "Arquivo";
theUILang.cqb_add_url         = "URL";
theUILang.cqb_add_dir_ph      = "Diretório de download padrão";
theUILang.cqb_label_to_list   = "Escolha um rótulo existente";
theUILang.cqb_help_trackers   = "Uma URL de rastreador por linha.";
theUILang.cqb_help_seed       = "Começar a semear assim que o torrent for criado.";
theUILang.cqb_help_private    = "Marcar como privado: sem DHT ou peer exchange.";
theUILang.cqb_help_hybrid     = "Criar um torrent híbrido v1 + v2.";

/* Inline edit of a torrent option (dialogs.js). */
theUILang.cqb_edit_yes        = "Sim";
theUILang.cqb_edit_no         = "Não";
theUILang.cqb_edit_change     = "Alterar";

/* Chunks pane (chunks.js). */
theUILang.cqb_chunks_chunks     = "Chunks";
theUILang.cqb_chunks_size       = "Tamanho";
theUILang.cqb_chunks_done       = "Concluído";
theUILang.cqb_chunks_seen       = "Visto";
theUILang.cqb_chunks_downloaded = "Baixado";
theUILang.cqb_chunks_mode       = "Modo do mapa de chunks";
theUILang.cqb_chunks_one        = "Chunk {n}";
theUILang.cqb_chunks_range      = "Chunks {a}–{b}";
theUILang.cqb_chunks_seen_count = "{n}× visto";
theUILang.cqb_chunks_a11y_seen  = "Mapa de disponibilidade de chunks: {pct}% dos grupos vistos, {n} chunks";
theUILang.cqb_chunks_a11y_done  = "Mapa de conclusão de chunks: {pct}% concluído, {n} chunks";
theUILang.cqb_chunks_cell_one   = "1 célula = {n} chunk";
theUILang.cqb_chunks_cell_many  = "1 célula = {n} chunks";

/* Details pane -- overview, file manager, traffic/speed toolbars (details.js). */
theUILang.cqb_det_copy          = "Copiar";
theUILang.cqb_det_download      = "Download";
theUILang.cqb_det_upload        = "Upload";
theUILang.cqb_det_ratio         = "Proporção";
theUILang.cqb_det_eta           = "ETA";
theUILang.cqb_det_elapsed       = "Decorrido";
theUILang.cqb_det_remaining     = "Restante";
theUILang.cqb_det_swarm         = "Enxame";
theUILang.cqb_det_seeds         = "Sementes";
theUILang.cqb_det_peers         = "Pares";
theUILang.cqb_det_wasted        = "Desperdiçado";
theUILang.cqb_det_url           = "URL";
theUILang.cqb_det_status        = "Status";
theUILang.cqb_det_next_announce = "Próximo announce";
theUILang.cqb_det_storage       = "Armazenamento";
theUILang.cqb_det_save_path     = "Caminho de salvamento";
theUILang.cqb_det_open_fm       = "Abrir no Gerenciador de arquivos";
theUILang.cqb_det_free_disk     = "Disco livre";
theUILang.cqb_det_hash          = "Hash";
theUILang.cqb_det_comment       = "Comentário";
theUILang.cqb_det_updown        = "{up} envio / {down} recebimento";
theUILang.cqb_det_tracker_ok    = "OK";
theUILang.cqb_det_due_now       = "vence agora";
theUILang.cqb_det_outside_fm    = "Fora da sua pasta do Gerenciador de arquivos";
theUILang.cqb_det_no_comment    = "Sem comentário";
theUILang.cqb_det_parent_dir    = "Diretório pai";
theUILang.cqb_det_new_folder    = "Nova pasta";
theUILang.cqb_det_path          = "Caminho";
theUILang.cqb_det_recent_folders = "Pastas recentes";
theUILang.cqb_det_toggle        = "Alternar {name}";
theUILang.cqb_det_downloaded    = "Baixado";
theUILang.cqb_det_uploaded      = "Enviado";
theUILang.cqb_det_clear_stats   = "Limpar estatísticas";
theUILang.cqb_det_console       = "Console";
theUILang.cqb_det_more_tabs     = "Mais abas";
theUILang.cqb_det_more          = "Mais";

/* Top app bar -- button tooltips + search (topbar.js). */
theUILang.cqb_tb_add        = "Adicionar torrent";
theUILang.cqb_tb_remove     = "Remover";
theUILang.cqb_tb_start      = "Iniciar";
theUILang.cqb_tb_pause      = "Pausar";
theUILang.cqb_tb_stop       = "Parar";
theUILang.cqb_tb_settings   = "Configurações";
theUILang.cqb_tb_help       = "Ajuda";
theUILang.cqb_tb_logoff     = "Sair";
theUILang.cqb_tb_create     = "Criar torrent";
theUILang.cqb_tb_rss        = "RSS";
theUILang.cqb_tb_plugins    = "Plugins";
theUILang.cqb_search        = "Buscar";

/* Full-window drop zone + command palette (extras.js). */
theUILang.qbDropTitle       = "Solte para adicionar torrents";
theUILang.qbDropSub         = "Solte arquivos .torrent em qualquer lugar para adicioná-los";
theUILang.qbPalActions      = "Ações";
theUILang.qbPalAdd          = "Adicionar torrent";
theUILang.qbPalStart        = "Iniciar selecionados";
theUILang.qbPalPause        = "Pausar selecionados";
theUILang.qbPalStop         = "Parar selecionados";
theUILang.qbPalRemove       = "Remover selecionados";
theUILang.qbPalSettings     = "Configurações";
theUILang.qbPalAppearance   = "Aparência";
theUILang.qbPalSwitch       = "Mudar para ";
theUILang.qbPalFilters      = "Filtros";
theUILang.qbPalAll          = "Todos os torrents";
theUILang.qbPalSearchGroup  = "Buscar";
theUILang.qbPalSearchFor    = "Buscar torrents por";
theUILang.qbPalNoResults    = "Nenhum comando correspondente";
theUILang.qbPalPlaceholder  = "Digite um comando ou busque torrents...";
theUILang.qbPalNavigate     = "navegar";
theUILang.qbPalOpen         = "executar";
theUILang.qbPalClose        = "fechar";

/* Settings page descriptions (settings.js). */
theUILang.cqb_stg_desc_gl          = "Comportamento da interface, intervalo de atualização e predefinições de velocidade.";
theUILang.cqb_stg_desc_dl          = "Limites de banda de download e comportamento padrão.";
theUILang.cqb_stg_desc_con         = "Porta de escuta, limites de taxa globais e limites de conexão.";
theUILang.cqb_stg_desc_bt          = "DHT, peer exchange e outros recursos do BitTorrent.";
theUILang.cqb_stg_desc_fmt         = "Como tamanhos, datas e números são exibidos.";
theUILang.cqb_stg_desc_ao          = "Opções de baixo nível para usuários avançados.";
theUILang.cqb_stg_desc_dev         = "Opções de diagnóstico e apenas para desenvolvedores.";
theUILang.cqb_stg_desc_loginmgr    = "Logins de rastreador salvos usados pelos autotools e pela busca.";
theUILang.cqb_stg_desc_autotools   = "Ações automáticas aplicadas aos torrents correspondentes.";
theUILang.cqb_stg_desc_xmpp        = "Notificações de chat entregues por uma conta XMPP.";
theUILang.cqb_stg_desc_cookies     = "Cookies por host enviados ao obter torrents.";
theUILang.cqb_stg_desc_lookat      = "Links de busca personalizados exibidos no menu do torrent.";
theUILang.cqb_stg_desc_retrackers  = "Rastreadores adicionados automaticamente a novos torrents.";
theUILang.cqb_stg_desc_rss         = "Feeds RSS e filtros de download automático.";
theUILang.cqb_stg_desc_scheduler   = "Janelas de tempo que alteram os limites automaticamente.";
theUILang.cqb_stg_desc_extsearch   = "Mecanismos de busca usados pela busca da barra de ferramentas.";
theUILang.cqb_stg_desc_unpack      = "Extração automática de arquivos concluídos.";
theUILang.cqb_stg_desc_throttle    = "Canais de banda nomeados para agrupar torrents.";
theUILang.cqb_stg_desc_ratio       = "Grupos de proporção e as ações tomadas em cada meta.";
theUILang.cqb_stg_desc_screenshots = "Miniaturas geradas a partir de arquivos de mídia.";
theUILang.cqb_stg_desc_uploadeta   = "Proporção alvo e tempo usados para estimar a semeadura.";
theUILang.cqb_stg_desc_history     = "Retenção do registro de eventos e entrega de notificações.";

/* Settings nav + account table chrome (settings.js). */
theUILang.cqb_stg_grp_plugins = "Plugins";
theUILang.cqb_stg_filter      = "Filtrar configurações";
theUILang.cqb_stg_no_match    = "Nenhuma configuração correspondente";
theUILang.cqb_acct_login      = "Login de {name}";
theUILang.cqb_acct_password   = "Senha de {name}";
theUILang.cqb_acct_autologin  = "Autologin de {name}";
theUILang.cqb_unit_bytes      = "bytes";

/* Advanced rtorrent option labels (settings.js, st_ao page). */
theUILang.cqb_ao_hash_interval        = "Intervalo de verificação de hash";
theUILang.cqb_ao_hash_max_tries       = "Máx. de tentativas de verificação de hash";
theUILang.cqb_ao_hash_read_ahead      = "Leitura antecipada de hash";
theUILang.cqb_ao_preload_type         = "Tipo de preload";
theUILang.cqb_ao_preload_min_size     = "Tamanho mínimo de preload";
theUILang.cqb_ao_preload_required_rate = "Taxa exigida de preload";
theUILang.cqb_ao_receive_buffer_size  = "Tamanho do buffer de recebimento";
theUILang.cqb_ao_send_buffer_size     = "Tamanho do buffer de envio";
theUILang.cqb_ao_max_downloads_div    = "Divisor de downloads máx.";
theUILang.cqb_ao_max_uploads_div      = "Divisor de uploads máx.";
theUILang.cqb_ao_max_file_size        = "Tamanho máximo de arquivo";
theUILang.cqb_ao_split_file_size      = "Tamanho de divisão de arquivo";
theUILang.cqb_ao_split_suffix         = "Sufixo de divisão";
theUILang.cqb_ao_http_cacert          = "Certificado CA HTTP";
theUILang.cqb_ao_http_capath          = "Caminho CA HTTP";
theUILang.cqb_ao_http_proxy           = "Proxy HTTP";
theUILang.cqb_ao_proxy_address        = "Endereço do proxy";
theUILang.cqb_ao_bind                 = "Endereço de vínculo";
theUILang.cqb_ao_session              = "Diretório de sessão";
theUILang.cqb_ao_timeout_safe_sync    = "Tempo limite de sync seguro";
theUILang.cqb_ao_timeout_sync         = "Tempo limite de sync";
theUILang.cqb_empty_ratio_rules       = "Ainda não há regras de proporção";
theUILang.cqb_empty_rss_filters       = "Ainda não há filtros";
theUILang.cqb_empty_rss_group         = "Ainda não há feeds neste grupo";
theUILang.cqb_empty_checklist        = "Nada selecionado";

/* Icon picker (js/icons.js). */
theUILang.cqb_icons_choose        = "Escolher ícone";
theUILang.cqb_icons_tab_icons     = "Ícones";
theUILang.cqb_icons_tab_upload    = "Enviar imagem";
theUILang.cqb_icons_search        = "Buscar ícones";
theUILang.cqb_icons_categories    = "Categorias";
theUILang.cqb_icons_tint          = "Tom";
theUILang.cqb_icons_tint_auto     = "Auto (variante)";
theUILang.cqb_icons_upload_aria   = "Enviar uma imagem PNG";
theUILang.cqb_icons_drop_title    = "Solte uma PNG aqui ou clique para procurar";
theUILang.cqb_icons_drop_hint     = "Apenas PNG. Mostrado também no ruTorrent normal.";
theUILang.cqb_icons_upload_note   = "Uma imagem enviada é mantida como está e tem prioridade sobre um glifo escolhido. Remova-a para voltar ao padrão inteligente.";
theUILang.cqb_icons_reset         = "Redefinir para o padrão inteligente";
theUILang.cqb_icons_use           = "Usar ícone";
theUILang.cqb_icons_remove        = "Remover imagem";
theUILang.cqb_icons_upload_btn    = "Enviar";
theUILang.cqb_icons_no_match      = "Nenhum ícone corresponde a “{term}”";
theUILang.cqb_icons_cat_all       = "Todos";
theUILang.cqb_icons_more_cats     = "Mais categorias";
theUILang.cqb_icons_more          = "Mais";
theUILang.cqb_icons_more_count    = "Mais ({n})";
theUILang.cqb_icons_upload_failed = "Falha no envio: {msg}";
theUILang.cqb_icons_sub_tracker   = "Rastreador: {name}";
theUILang.cqb_icons_sub_label     = "Rótulo: {name}";

/* Details empty states (js/details.js). */
theUILang.cqb_det_empty_general  = "Selecione um torrent para ver sua visão geral";
theUILang.cqb_det_empty_files    = "Selecione um torrent para ver seus arquivos";
theUILang.cqb_det_empty_trackers = "Selecione um torrent para ver seus rastreadores";
theUILang.cqb_det_empty_peers    = "Selecione um torrent para ver seus pares";
theUILang.cqb_det_empty_pieces   = "Selecione um torrent para ver suas peças";

/* Sidebar rail (js/sidebar.js). */
theUILang.cqb_nav_collapse = "Recolher barra lateral";
theUILang.cqb_nav_expand   = "Expandir barra lateral";

/* Custom select popover (js/select.js). */
theUILang.qbNoMatches = "Sem correspondências";
theUILang.qbNoOptions = "Sem opções";

/* Peers pane (js/peers.js). */
theUILang.cqb_noPeers           = "Nenhum par conectado";
theUILang.cqb_peerFlagIncoming  = "Conexão de entrada";
theUILang.cqb_peerFlagEncrypted = "Criptografado";
theUILang.cqb_peerFlagSnubbed   = "Ignorado";

/* About / What's new (js/about.js; the palette command in js/extras.js). */
theUILang.cqb_wn_title         = "Novidades no club-QuickBox";
theUILang.cqb_wn_link          = "Novidades";
theUILang.cqb_wn_version       = "club-QuickBox v{version}";
theUILang.cqb_wn_update        = "Atualização disponível: v{version}";
theUILang.cqb_wn_update_qb     = "QuickBox Pro: execute {cmd} como administrador.";
theUILang.cqb_wn_update_manual = "Instalação manual: execute {cmd} na pasta do tema.";
theUILang.cqb_wn_none          = "Ainda não há notas de versão.";
theUILang.qbPalHelp            = "Ajuda";
