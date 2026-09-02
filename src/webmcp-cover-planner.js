(() => {
  'use strict';

  const SEARCH_STORAGE_KEY = 'tubesaku_webmcp_cover_last_search';
  const PLAYLIST_STORAGE_KEY = 'tubesaku_webmcp_cover_playlist';

  const $ = (id) => document.getElementById(id);


  let coverPlaylistState = {
    videoIds: [],
    videos: [],
    index: 0,
    title: '',
  };

  function youtubeEmbedUrl(videoId) {
    return `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?rel=0&playsinline=1`;
  }

  function updateCoverPlayer() {
    const iframe = $('webmcp-cover-player');
    const label = $('webmcp-cover-player-label');
    const prevButton = $('webmcp-cover-prev');
    const nextButton = $('webmcp-cover-next');
    const openLink = $('webmcp-cover-open-youtube');
    const { videoIds, videos } = coverPlaylistState;

    if (!iframe || !videoIds.length) return;

    let index = Number(coverPlaylistState.index || 0);
    index = Math.max(0, Math.min(videoIds.length - 1, index));
    coverPlaylistState.index = index;

    const videoId = videoIds[index];
    const video = videos[index] || {};

    // Deliberately use a plain iframe instead of the YouTube IFrame Player API.
    // Direct YouTube embeds already work in TubeSaku/ChatGPT's browser context,
    // while dynamically loading iframe_api can remain unresolved there.
    iframe.src = youtubeEmbedUrl(videoId);
    iframe.title = `${video.title || coverPlaylistState.title || 'TubeSaku AI Cover Playlist'} - YouTube player`;

    if (label) {
      const title = video.title || video.channel_title || videoId;
      label.textContent = `${index + 1} / ${videoIds.length}  ${title}`;
    }
    if (prevButton) prevButton.disabled = videoIds.length <= 1;
    if (nextButton) nextButton.disabled = videoIds.length <= 1;
    if (openLink) {
      openLink.href = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
    }
  }

  function setCoverPlaylist(videos, title) {
    const safeVideos = (videos || []).filter((video) => video && video.video_id);
    coverPlaylistState = {
      videos: safeVideos,
      videoIds: safeVideos.map((video) => video.video_id),
      index: 0,
      title: title || 'TubeSaku AI Cover Playlist',
    };
    updateCoverPlayer();
  }

  function moveCoverPlaylist(delta) {
    const count = coverPlaylistState.videoIds.length;
    if (!count) return;
    coverPlaylistState.index = (coverPlaylistState.index + delta + count) % count;
    updateCoverPlayer();
  }

  function text(value) {
    return value === null || value === undefined || value === '' ? '—' : String(value);
  }

  function compactNumber(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return '—';
    if (n >= 100000000) return `${(n / 100000000).toFixed(1).replace(/\.0$/, '')}億`;
    if (n >= 10000) return `${(n / 10000).toFixed(1).replace(/\.0$/, '')}万`;
    return n.toLocaleString('ja-JP');
  }

  function makeElement(tag, className, value) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (value !== undefined) el.textContent = value;
    return el;
  }

  function metric(label, value, toneClass = 'text-slate-800') {
    const box = makeElement('div', 'rounded-xl bg-slate-50 px-3 py-2 text-center');
    box.appendChild(makeElement('div', 'text-[10px] text-slate-400', label));
    box.appendChild(makeElement('div', `text-sm font-bold ${toneClass}`, value));
    return box;
  }

  function chartLabels(song) {
    const charts = song.charts || {};
    const parts = [];
    if (charts.trending) parts.push(`急上昇 ${charts.trending}位`);
    if (charts.weekly) parts.push(`週間 ${charts.weekly}位`);
    if (charts.shorts_daily) parts.push(`Shorts ${charts.shorts_daily}位`);
    return parts;
  }

  function buildSongCard(song, playlistVideo) {
    const article = makeElement('article', 'bg-white border border-slate-200 rounded-2xl p-3 md:p-4');
    const top = makeElement('div', 'flex gap-3');

    if (song.thumbnail_url) {
      const img = document.createElement('img');
      img.src = song.thumbnail_url;
      img.alt = song.title || '';
      img.loading = 'lazy';
      img.className = 'w-20 h-12 rounded-lg object-cover bg-slate-100 shrink-0';
      top.appendChild(img);
    }

    const body = makeElement('div', 'min-w-0 flex-1');
    body.appendChild(makeElement('div', 'font-bold text-slate-800 leading-snug', text(song.title)));
    if (song.artists) body.appendChild(makeElement('div', 'text-xs text-slate-500 mt-0.5', text(song.artists)));

    const badges = makeElement('div', 'flex flex-wrap gap-1.5 mt-2');
    for (const label of chartLabels(song)) {
      badges.appendChild(makeElement('span', 'text-[10px] bg-indigo-50 text-indigo-700 rounded-full px-2 py-1', label));
    }
    for (const signal of song.signals || []) {
      const display = {
        low_supply: '最近の新着少なめ',
        no_recent_covers: '最近の新着未確認',
        shorts_growth: 'Shorts伸長',
        popular_covers: '歌ってみた投稿増',
        existing_supply_checked: '既存供給調査済み',
      }[signal];
      if (display) badges.appendChild(makeElement('span', 'text-[10px] bg-slate-100 text-slate-600 rounded-full px-2 py-1', display));
    }
    body.appendChild(badges);
    top.appendChild(body);
    article.appendChild(top);

    const metrics = makeElement('div', 'grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3');
    metrics.appendChild(metric('原曲人気度', `${Math.round(Number(song.chart_demand_score || 0))} / 100`));
    metrics.appendChild(metric('直近歌ってみた', song.recent_cover_count === null || song.recent_cover_count === undefined ? '未観測' : `${song.recent_cover_count}本`, 'text-emerald-700'));
    metrics.appendChild(metric('既存カバー確認', song.existing_cover_count === null || song.existing_cover_count === undefined ? '未調査' : `${song.existing_cover_count}本`, 'text-blue-700'));
    metrics.appendChild(metric('既存再生中央値', compactNumber(song.existing_views_median), 'text-purple-700'));
    article.appendChild(metrics);

    const footer = makeElement('div', 'mt-3 flex flex-wrap items-center gap-2 text-xs');
    if (playlistVideo) {
      const playLink = document.createElement('a');
      playLink.href = playlistVideo.youtube_url;
      playLink.target = '_blank';
      playLink.rel = 'noopener noreferrer';
      playLink.className = 'font-bold text-red-600 hover:underline';
      playLink.textContent = `▶ ${playlistVideo.channel_title || '歌ってみた動画'} (${playlistVideo.duration_seconds}秒)`;
      footer.appendChild(playLink);
    } else {
      footer.appendChild(makeElement('span', 'text-slate-400', '30秒以上の検証済み歌唱動画は現在候補なし'));
    }
    if (song.search_url) {
      const searchLink = document.createElement('a');
      searchLink.href = song.search_url;
      searchLink.target = '_blank';
      searchLink.rel = 'noopener noreferrer';
      searchLink.className = 'font-medium text-brand-600 hover:underline';
      searchLink.textContent = 'YouTubeで歌ってみたを検索';
      footer.appendChild(searchLink);
    }
    article.appendChild(footer);
    return article;
  }

  async function renderCoverPlaylist({ heading, songs }) {
    const section = $('webmcp-cover-playlist');
    const headingEl = $('webmcp-cover-heading');
    const summaryEl = $('webmcp-cover-summary');
    const listEl = $('webmcp-cover-list');
    const playerWrap = $('webmcp-cover-player-wrap');
    const playerHost = $('webmcp-cover-player');

    if (!section || !headingEl || !summaryEl || !listEl || !playerWrap || !playerHost) {
      throw new Error('TubeSaku AI Cover Planner UI is not available on this page.');
    }

    headingEl.textContent = heading || 'AI Cover Picks';
    listEl.replaceChildren();

    const selectedVideos = [];
    const usedVideoIds = new Set();
    for (const song of songs) {
      const video = (song.playlist_videos || []).find((candidate) => {
        if (!candidate || !candidate.video_id || usedVideoIds.has(candidate.video_id)) return false;
        return true;
      }) || null;
      if (video) {
        usedVideoIds.add(video.video_id);
        selectedVideos.push(video);
      }
      listEl.appendChild(buildSongCard(song, video));
    }

    summaryEl.textContent = `${songs.length}曲をAIエージェントが選択・${selectedVideos.length}本をListening Playlistに追加`;

    section.hidden = false;

    if (selectedVideos.length) {
      playerWrap.hidden = false;
      setCoverPlaylist(selectedVideos, heading || 'TubeSaku AI Cover Playlist');
    } else {
      coverPlaylistState = { videoIds: [], videos: [], index: 0, title: '' };
      playerHost.src = 'about:blank';
      playerWrap.hidden = true;
    }

    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function restorePlaylist() {
    try {
      const raw = sessionStorage.getItem(PLAYLIST_STORAGE_KEY);
      if (!raw) return;
      const stored = JSON.parse(raw);
      if (stored && Array.isArray(stored.songs) && stored.songs.length) {
        renderCoverPlaylist(stored).catch((error) => {
          console.warn('[TubeSaku WebMCP] Could not restore YouTube playlist:', error);
        });
      }
    } catch (error) {
      console.warn('[TubeSaku WebMCP] Could not restore cover playlist:', error);
    }
  }

  async function registerTools() {
    if (typeof document.modelContext?.registerTool !== 'function') {
      console.info('[TubeSaku WebMCP] document.modelContext is not available.');
      return;
    }

    await document.modelContext.registerTool({
      name: 'search_cover_songs',
      title: 'Search TubeSaku Japanese cover-song opportunities',
      description:
        "Search TubeSaku's Japan YouTube Charts and cover-song observations. " +
        'Use this to compare demand, recent cover supply, existing cover supply, and early spread performance. ' +
        'Song titles and artist names remain in their original language. ' +
        'Use require_playlist_video=true when the user also wants a listening playlist.',
      inputSchema: {
        type: 'object',
        properties: {
          scope: {
            type: 'string',
            enum: ['all', 'low_supply', 'no_recent_covers', 'shorts_growth', 'popular_covers', 'top_demand'],
            default: 'all',
            description:
              'Dataset slice. Use all for cross-signal comparison; low_supply for popular songs with few recent covers; ' +
              'no_recent_covers for songs with no recent high-confidence TubeSaku match; shorts_growth for songs whose cover Shorts spread strongly; ' +
              'popular_covers for songs receiving many recent covers; top_demand for strongest original-song demand.',
          },
          keyword: {
            type: 'string',
            maxLength: 100,
            description: 'Optional title or artist substring.',
          },
          require_playlist_video: {
            type: 'boolean',
            default: false,
            description: 'If true, only return songs with at least one validated cover video for the TubeSaku listening playlist.',
          },
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: 50,
            default: 30,
          },
        },
        additionalProperties: false,
      },
      annotations: {
        readOnlyHint: true,
        untrustedContentHint: true,
      },
      execute: async (input = {}, { signal } = {}) => {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(input || {})) {
          if (value !== undefined && value !== null && value !== '') {
            params.set(key, String(value));
          }
        }
        const response = await fetch(`/api/utattemita-ranking/search?${params.toString()}`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          signal,
        });
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.message || `TubeSaku cover-song API returned HTTP ${response.status}`);
        }
        const data = await response.json();
        sessionStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(data));
        return data;
      },
    });

    await document.modelContext.registerTool({
      name: 'show_cover_playlist',
      title: 'Show an AI-selected cover-song playlist on TubeSaku',
      description:
        'Display songs selected from the latest search_cover_songs result as AI Cover Picks on the TubeSaku page, ' +
        'and build an in-page YouTube listening playlist from validated cover videos. ' +
        'Only song IDs returned by the latest search can be used.',
      inputSchema: {
        type: 'object',
        properties: {
          song_ids: {
            type: 'array',
            minItems: 1,
            maxItems: 10,
            items: { type: 'string', minLength: 8, maxLength: 40 },
            description: 'TubeSaku song IDs selected from the most recent search_cover_songs result.',
          },
          heading: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
            description: 'Short title for the selected plan or listening playlist.',
          },
        },
        required: ['song_ids'],
        additionalProperties: false,
      },
      annotations: {
        readOnlyHint: false,
        untrustedContentHint: true,
      },
      execute: async ({ song_ids, heading = 'AI Cover Picks' }) => {
        const raw = sessionStorage.getItem(SEARCH_STORAGE_KEY);
        if (!raw) {
          throw new Error('No TubeSaku cover-song search result is available. Run search_cover_songs first.');
        }
        const searchResult = JSON.parse(raw);
        const allowed = new Map((searchResult.songs || []).map((song) => [song.song_id, song]));
        const songs = [];
        const seen = new Set();
        for (const id of song_ids || []) {
          if (seen.has(id) || !allowed.has(id)) continue;
          seen.add(id);
          songs.push(allowed.get(id));
        }
        if (!songs.length) {
          throw new Error('None of the requested song IDs were present in the latest TubeSaku search result.');
        }

        const payload = { heading, songs };
        await renderCoverPlaylist(payload);
        sessionStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(payload));

        const playlistVideoIds = [];
        const used = new Set();
        for (const song of songs) {
          const video = (song.playlist_videos || []).find((v) => v && v.video_id && !used.has(v.video_id));
          if (video) {
            used.add(video.video_id);
            playlistVideoIds.push(video.video_id);
          }
        }

        return {
          success: true,
          heading,
          displayed_song_count: songs.length,
          playlist_video_count: playlistVideoIds.length,
          song_ids: songs.map((song) => song.song_id),
          playlist_video_ids: playlistVideoIds,
        };
      },
    });

    console.info('[TubeSaku WebMCP] search_cover_songs and show_cover_playlist registered.');
  }

  const closeButton = $('webmcp-cover-close');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      const section = $('webmcp-cover-playlist');
      if (section) section.hidden = true;
      const iframe = $('webmcp-cover-player');
      if (iframe) iframe.src = 'about:blank';
    });
  }

  const prevButton = $('webmcp-cover-prev');
  if (prevButton) prevButton.addEventListener('click', () => moveCoverPlaylist(-1));

  const nextButton = $('webmcp-cover-next');
  if (nextButton) nextButton.addEventListener('click', () => moveCoverPlaylist(1));


  restorePlaylist();
  registerTools().catch((error) => console.error('[TubeSaku WebMCP] registration failed:', error));
})();
