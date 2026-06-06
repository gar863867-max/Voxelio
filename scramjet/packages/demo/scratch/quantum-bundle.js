/* Quantum OS — all-in-one bundle (embedded in 1.html) */
'use strict';

window.cloudGames = window.cloudGames || [
  { id: 1027, name: "Tomb Raider - Definitive Edition", img: "https://download-oss.raccoongame.com/uploads/image/20260515/20260515162225786.jpg" },
  { id: 598, name: "Elden Ring", img: "https://download-oss.raccoongame.com/uploads/image/20260515/2026051516303039.jpg" },
  { id: 600, name: "Red Dead Redemption 2", img: "https://download-oss.raccoongame.com/uploads/image/20260407/20260407165500251.jpg" },
  { id: 117, name: "Cyberpunk 2077", img: "https://download-oss.raccoongame.com/uploads/image/20260410/20260410170557349.jpg" },
  { id: 10, name: "Baldur's Gate 3", img: "https://download-oss.raccoongame.com/uploads/image/20260410/20260410173748437.jpg" },
  { id: 209, name: "Grand Theft Auto V", img: "https://download-oss.raccoongame.com/uploads/image/20260304/20260304175808508.jpg" },
  { id: 621, name: "Forza Horizon 5", img: "https://download-oss.raccoongame.com/uploads/image/20260305/20260305115627492.jpg" },
  { id: 963, name: "God of War: Ragnarök", img: "https://download-oss.raccoongame.com/uploads/image/20251218/20251218002037369.jpg" },
  { id: 2, name: "Hollow Knight", img: "https://download-oss.raccoongame.com/uploads/image/20250331/20250331165157210.jpg" }
];

window.PREMADE_SHORTCUTS = [
  { id: 'yt', name: 'YouTube', icon: 'youtube', url: 'https://www.youtube.com' },
  { id: 'google', name: 'Google', icon: 'search', url: 'https://www.google.com' },
  { id: 'chatgpt', name: 'ChatGPT', icon: 'bot', url: 'https://chat.openai.com' },
  { id: 'github', name: 'GitHub', icon: 'github', url: 'https://github.com' },
  { id: 'discord', name: 'Discord', icon: 'message-circle', url: 'https://discord.com/app' }
];

window.MOVIE_CATEGORIES = [
  { id: 'popular', label: 'Popular' },
  { id: 'trending', label: 'Trending' },
  { id: 'top_rated', label: 'Top Rated' },
  { id: 'apple', label: 'Apple TV+' },
  { id: 'netflix', label: 'Netflix Style' },
  { id: 'action', label: 'Action' },
  { id: 'comedy', label: 'Comedy' },
  { id: 'horror', label: 'Horror' }
];

window.QuantumExtras = {
  proxyReady: false,
  ctrlInstance: null,

  init() {
    this.patchWindowManager();
    this.patchSettings();
    this.setupUI();
    this.setupModals();
    this.registerMoviesApp();
    this.patchBrowser();
    this.patchDockAndDesktop();
    this.patchFileHandlers();
    this.hookAfterLogin();
  },

  patchWindowManager() {
    const wm = QuantumOS.WindowManager;
    const origMin = wm.minimize.bind(wm);
    const origFocus = wm.focus.bind(wm);

    wm.minimize = function (id) {
      const win = this.windows.get(id);
      if (!win) return;
      win._minTimer && clearTimeout(win._minTimer);
      win.isMinimized = true;
      const el = win.element;
      el.classList.remove('active');
      el.classList.add('minimizing');
      const hide = () => {
        el.classList.remove('minimizing');
        el.classList.add('minimized');
        el.style.display = 'none';
      };
      el.addEventListener('animationend', hide, { once: true });
      win._minTimer = setTimeout(hide, 450);
      if (this.activeWindowId === id) {
        this.activeWindowId = null;
        let top = null;
        this.windows.forEach(w => {
          if (!w.isMinimized && w.workspace === QuantumOS.activeWorkspace && (!top || w.zIndex > top.zIndex))
            top = w;
        });
        if (top) origFocus.call(this, top.id);
      }
      QuantumOS.TaskbarController.syncRunningApps();
    };

    wm.focus = function (id) {
      const win = this.windows.get(id);
      if (!win) return;
      win._minTimer && clearTimeout(win._minTimer);
      win.isMinimized = false;
      const el = win.element;
      el.classList.remove('minimized', 'minimizing', 'closing');
      el.style.display = '';
      origFocus.call(this, id);
    };
  },

  patchSettings() {
    const d = QuantumOS.SettingsEngine.defaults;
    d.appearance.taskbarOpacity = 0.55;
    d.appearance.dockOpacity = 0.65;
    d.browser = d.browser || {};
    d.browser.searchEngine = 'duckduckgo';
    d.browser.videoPlayer = 'vidking';
    d.browser.tmdbKey = '';
    if (!QuantumOS.SettingsEngine.get('appearance.taskbarOpacity'))
      QuantumOS.SettingsEngine.set('appearance.taskbarOpacity', 0.55);
  },

  applyChromeStyles() {
    const tb = parseFloat(QuantumOS.SettingsEngine.get('appearance.taskbarOpacity') ?? 0.55);
    const dk = parseFloat(QuantumOS.SettingsEngine.get('appearance.dockOpacity') ?? 0.65);
    document.documentElement.style.setProperty('--taskbar-opacity', String(tb));
    document.documentElement.style.setProperty('--dock-opacity', String(dk));
    const taskbar = document.getElementById('taskbar');
    const dock = document.querySelector('.dock-container');
    if (taskbar) taskbar.style.background = `rgba(12,12,12,${tb})`;
    if (dock) dock.style.background = `rgba(24,24,24,${dk})`;
  },

  setupUI() {
    document.getElementById('search-btn')?.remove();
    document.querySelector('.start-section:nth-of-type(2)')?.remove();
    document.getElementById('start-recommended-list')?.closest('.start-section')?.remove();
    document.getElementById('widget-sysmonitor')?.remove();
    document.getElementById('widget-quicklaunch')?.remove();
    document.getElementById('widget-clock')?.remove();
    document.getElementById('desktop-icon-musicPlayer')?.remove();
    document.getElementById('dock-musicPlayer')?.remove();

    const notes = document.getElementById('widget-notes');
    if (notes) {
      notes.classList.add('desktop-notes-corner');
      notes.querySelector('.widget-header span').textContent = 'Notes';
    }

    this.renderShortcuts();

    const searchIcon = document.querySelector('#search-overlay .search-overlay-input-container > i');
    if (searchIcon) searchIcon.style.display = 'none';
    const hint = document.querySelector('.search-shortcut-hint');
    if (hint) {
      hint.style.marginLeft = 'auto';
      const wrap = hint.parentElement;
      if (wrap) wrap.style.display = 'flex';
    }
    ['search-results-apps', 'search-results-files', 'search-results-settings'].forEach(id => {
      document.getElementById(id)?.closest('.search-results-section')?.remove();
    });

    this.applyChromeStyles();
  },

  renderShortcuts() {
    const bar = document.getElementById('taskbar-shortcuts');
    if (!bar) return;
    const custom = JSON.parse(localStorage.getItem('qos_shortcuts') || '[]');
    const all = [...PREMADE_SHORTCUTS, ...custom];
    bar.innerHTML = '';
    all.forEach(s => {
      const b = document.createElement('button');
      b.className = 'taskbar-shortcut-btn';
      b.title = s.name;
      b.innerHTML = `<i data-lucide="${s.icon || 'link'}"></i>`;
      b.addEventListener('click', () => this.openUrlWithChoice(s.url, s.name));
      bar.appendChild(b);
    });
    if (typeof lucide !== 'undefined') lucide.createIcons({ attrs: { class: 'lucide-icon' } });
  },

  setupModals() {
    if (document.getElementById('qos-choice-modal')) return;
    const m = document.createElement('div');
    m.id = 'qos-choice-modal';
    m.className = 'modal-overlay hidden';
    m.innerHTML = `
      <div class="modal-content qos-choice-box">
        <h3 id="qos-choice-title">Open link</h3>
        <p id="qos-choice-desc"></p>
        <div class="qos-choice-actions">
          <button id="qos-choice-proxy" class="modal-btn modal-btn-primary">Open via Proxy</button>
          <button id="qos-choice-direct" class="modal-btn modal-btn-secondary">Open Direct</button>
          <button id="qos-choice-about" class="modal-btn">Open in about:blank</button>
          <button id="qos-choice-cancel" class="modal-btn">Cancel</button>
        </div>
      </div>`;
    document.body.appendChild(m);
    this._choiceCb = null;
    m.querySelector('#qos-choice-proxy').onclick = () => { this._resolveChoice('proxy'); };
    m.querySelector('#qos-choice-direct').onclick = () => { this._resolveChoice('direct'); };
    m.querySelector('#qos-choice-about').onclick = () => { this._resolveChoice('about'); };
    m.querySelector('#qos-choice-cancel').onclick = () => { this._resolveChoice('cancel'); };
    m.addEventListener('click', e => { if (e.target === m) this._resolveChoice('cancel'); });

    const g = document.createElement('div');
    g.id = 'games-choice-modal';
    g.className = 'modal-overlay hidden';
    g.innerHTML = `
      <div class="modal-content qos-choice-box">
        <h3>Play games</h3>
        <p>Choose how you want to play.</p>
        <div class="qos-choice-actions">
          <button id="games-choice-local" class="modal-btn modal-btn-primary">Local Games Library</button>
          <button id="games-choice-cloud" class="modal-btn modal-btn-secondary">Cloud Gaming</button>
          <button id="games-choice-cancel" class="modal-btn">Cancel</button>
        </div>
      </div>`;
    document.body.appendChild(g);
    g.querySelector('#games-choice-local').onclick = () => { g.classList.add('hidden'); AppRegistry.open('gamesBrowser'); };
    g.querySelector('#games-choice-cloud').onclick = () => { g.classList.add('hidden'); AppRegistry.open('cloudGaming'); };
    g.querySelector('#games-choice-cancel').onclick = () => g.classList.add('hidden');
  },

  showChoice(title, desc, cb) {
    const m = document.getElementById('qos-choice-modal');
    document.getElementById('qos-choice-title').textContent = title;
    document.getElementById('qos-choice-desc').textContent = desc || '';
    this._choiceCb = cb;
    m.classList.remove('hidden');
  },

  _resolveChoice(mode) {
    document.getElementById('qos-choice-modal').classList.add('hidden');
    const cb = this._choiceCb;
    this._choiceCb = null;
    if (cb) cb(mode);
  },

  openUrlWithChoice(url, title) {
    this.showChoice(title || 'Open site', url, mode => {
      if (mode === 'cancel') return;
      if (mode === 'about') {
        const w = window.open('about:blank', '_blank');
        if (!w) { QuantumOS.NotificationSystem.showToast('Allow popups'); return; }
        w.location.href = url;
        return;
      }
      if (mode === 'direct') {
        window.open(url, '_blank');
        return;
      }
      AppRegistry.open('browser', { url });
    });
  },

  showGamesChoice() {
    document.getElementById('games-choice-modal').classList.remove('hidden');
  },

  getSearchUrl(q) {
    const engine = QuantumOS.SettingsEngine.get('browser.searchEngine') || 'duckduckgo';
    if (/^https?:\/\//i.test(q)) return q;
    if (/\.\w{2,}/.test(q)) return 'https://' + q;
    if (engine === 'google') return 'https://www.google.com/search?q=' + encodeURIComponent(q);
    return 'https://duckduckgo.com/?q=' + encodeURIComponent(q);
  },

  async initProxy() {
    if (this.proxyReady) return true;
    try {
      if (!window.ScramjetController || !window.LibcurlClient) return false;
      const reg = await navigator.serviceWorker.register('https://intelligent-dedication-production-f8d8.up.railway.app/sw.js');
      await navigator.serviceWorker.ready;
      while (!window.LibcurlClient) await new Promise(r => setTimeout(r, 50));
      const transport = new window.LibcurlClient();
      window.$scramjetController = new window.ScramjetController({ transport, prefix: '/service/' });
      const wisp = (location.protocol === 'https:' ? 'wss://' : 'ws://') + 'intelligent-dedication-production-f8d8.up.railway.app/wisp/';
      const { Controller } = window.$scramjetController;
      this.ctrlInstance = new Controller({
        serviceworker: navigator.serviceWorker.controller || (await navigator.serviceWorker.ready).active,
        transport: new window.LibcurlClient({ wisp }),
        scramjetConfig: window.defaultConfigDev || {}
      });
      await this.ctrlInstance.wait();
      this.proxyReady = true;
      return true;
    } catch (e) {
      console.warn('Proxy init', e);
      return false;
    }
  },

  encodeUrl(url) {
    if (window.$scramjetController?.encodeUrl) {
      try { return window.$scramjetController.encodeUrl(url); } catch (e) {}
    }
    return url;
  },

  patchBrowser() {
    const orig = AppRegistry.apps.get('browser');
    if (!orig || orig._qosPatched) return;
    const self = this;
    const origComp = orig.component;
    orig.component = function (container, options) {
      origComp(container, options);
      const go = container.querySelector('.btn-go');
      const input = container.querySelector('.browser-url-input');
      if (!go || !input) return;
      const nav = async () => {
        let v = input.value.trim();
        if (!v) return;
        v = self.getSearchUrl(v);
        self.showChoice('Navigate', v, async mode => {
          if (mode === 'cancel') return;
          if (mode === 'about') {
            const w = window.open('about:blank', '_blank');
            if (w) w.location.href = v;
            return;
          }
          if (mode === 'direct') {
            const iframe = container.querySelector('iframe');
            if (iframe) iframe.src = v;
            return;
          }
          await self.initProxy();
          const iframe = container.querySelector('iframe');
          if (iframe) iframe.src = self.encodeUrl(v);
        });
      };
      go.replaceWith(go.cloneNode(true));
      container.querySelector('.btn-go').addEventListener('click', nav);
      input.onkeydown = e => { if (e.key === 'Enter') nav(); };
      if (options?.url) {
        input.value = options.url;
        setTimeout(nav, 100);
      }
    };
    orig._qosPatched = true;
  },

  patchDockAndDesktop() {
    const dock = document.getElementById('dock-container');
    if (dock && !document.getElementById('dock-movies')) {
      const movies = document.createElement('div');
      movies.className = 'dock-item';
      movies.id = 'dock-movies';
      movies.setAttribute('data-app', 'movies');
      movies.innerHTML = `<i data-lucide="clapperboard"></i><div class="dock-tooltip">Movies</div><div class="dock-indicator"></div>`;
      const games = document.getElementById('dock-cloudGaming');
      if (games) dock.insertBefore(movies, games);
      else dock.appendChild(movies);
      movies.addEventListener('click', e => { e.stopPropagation(); AppRegistry.open('movies'); });
    }
    if (dock && !document.getElementById('dock-gamesBrowser')) {
      const g = document.createElement('div');
      g.className = 'dock-item';
      g.id = 'dock-gamesBrowser';
      g.setAttribute('data-app', 'gamesBrowser');
      g.innerHTML = `<i data-lucide="gamepad-2"></i><div class="dock-tooltip">Games</div><div class="dock-indicator"></div>`;
      const cg = document.getElementById('dock-cloudGaming');
      dock.insertBefore(g, cg || null);
      g.addEventListener('click', () => this.showGamesChoice());
    }

    document.getElementById('dock-cloudGaming')?.addEventListener('click', e => {
      e.stopPropagation();
      e.preventDefault();
      this.showGamesChoice();
    }, true);

    document.querySelectorAll('.desktop-icon[data-app="cloudGaming"]').forEach(el => {
      el.addEventListener('dblclick', e => {
        e.stopPropagation();
        QuantumOS.Extras.showGamesChoice();
      });
    });
  },

  movieEmbed(type, tmdbId, season, episode) {
    const player = QuantumOS.SettingsEngine.get('browser.videoPlayer') || 'vidking';
    if (player === 'vidlink') {
      if (type === 'tv') return `https://vidlink.pro/tv/${tmdbId}/${season || 1}/${episode || 1}?autoplay=true`;
      return `https://vidlink.pro/movie/${tmdbId}?autoplay=true`;
    }
    if (type === 'tv') return `https://www.vidking.net/embed/tv/${tmdbId}/${season || 1}/${episode || 1}?autoPlay=true&nextEpisode=true&episodeSelector=true`;
    return `https://www.vidking.net/embed/movie/${tmdbId}?autoPlay=true`;
  },

  registerMoviesApp() {
    if (AppRegistry.apps.has('movies')) return;
    const self = this;
    AppRegistry.register({
      id: 'movies',
      name: 'Movies & TV',
      icon: 'clapperboard',
      category: 'Entertainment',
      defaultWidth: 1000,
      defaultHeight: 640,
      singleton: true,
      component(container) {
        let cat = 'popular';
        let query = '';
        let view = 'browse';
        let current = null;
        const key = QuantumOS.SettingsEngine.get('browser.tmdbKey') || '';

        container.innerHTML = `
          <div class="movies-app" style="display:flex;flex-direction:column;height:100%;background:var(--bg2);color:var(--t1);">
            <div style="display:flex;gap:8px;padding:10px;border-bottom:1px solid var(--border);flex-wrap:wrap;align-items:center;">
              <input class="movies-search" placeholder="Search movies & TV..." style="flex:1;min-width:180px;padding:8px 12px;background:rgba(255,255,255,0.05);border:1px solid var(--border);border-radius:8px;color:inherit;"/>
              <button class="movies-back hidden" style="padding:8px 12px;border:1px solid var(--border);border-radius:8px;">Back</button>
            </div>
            <div class="movies-cats" style="display:flex;gap:6px;padding:8px 10px;overflow-x:auto;border-bottom:1px solid var(--border);"></div>
            <div class="movies-body" style="flex:1;overflow:auto;padding:12px;"></div>
          </div>`;

        const catsEl = container.querySelector('.movies-cats');
        const body = container.querySelector('.movies-body');
        const search = container.querySelector('.movies-search');
        const back = container.querySelector('.movies-back');

        MOVIE_CATEGORIES.forEach(c => {
          const b = document.createElement('button');
          b.textContent = c.label;
          b.className = 'movies-cat-btn' + (c.id === cat ? ' active' : '');
          b.style.cssText = 'padding:6px 12px;border-radius:20px;border:1px solid var(--border);white-space:nowrap;font-size:12px;color:inherit;background:rgba(255,255,255,0.04);';
          b.onclick = () => { cat = c.id; catsEl.querySelectorAll('.movies-cat-btn').forEach(x => x.classList.remove('active')); b.classList.add('active'); load(); };
          catsEl.appendChild(b);
        });

        async function tmdb(path) {
          if (!key) return null;
          const r = await fetch(`https://api.themoviedb.org/3${path}&api_key=${key}`);
          if (!r.ok) return null;
          return r.json();
        }

        function demo() {
          return [
            { id: 550, title: 'Fight Club', poster: null, type: 'movie' },
            { id: 119051, title: 'Wednesday', poster: null, type: 'tv' },
            { id: 1078605, title: 'Demo Feature', poster: null, type: 'movie' }
          ];
        }

        async function load() {
          view = 'browse';
          back.classList.add('hidden');
          body.innerHTML = '<div style="opacity:0.6;padding:20px;">Loading...</div>';
          let items = demo();
          if (key) {
            const path = cat === 'tv' || cat === 'apple' ? '/tv/popular' : `/movie/${cat}`;
            const data = await tmdb(path.includes('tv') ? '/tv/popular' : `/movie/${cat}`);
            if (data?.results) items = data.results.map(r => ({
              id: r.id, title: r.title || r.name, poster: r.poster_path ? `https://image.tmdb.org/t/p/w342${r.poster_path}` : null,
              type: r.title ? 'movie' : 'tv'
            }));
          }
          if (query) {
            const data = key ? await tmdb(`/search/multi?query=${encodeURIComponent(query)}`) : null;
            if (data?.results) items = data.results.filter(r => r.media_type === 'movie' || r.media_type === 'tv').map(r => ({
              id: r.id, title: r.title || r.name, poster: r.poster_path ? `https://image.tmdb.org/t/p/w342${r.poster_path}` : null,
              type: r.media_type
            }));
          }
          body.innerHTML = `<div class="movies-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:12px;"></div>`;
          const grid = body.querySelector('.movies-grid');
          items.forEach(item => {
            const card = document.createElement('div');
            card.style.cssText = 'cursor:pointer;border:1px solid var(--border);border-radius:10px;overflow:hidden;background:var(--bg3);';
            card.innerHTML = `<div style="aspect-ratio:2/3;background:#222;display:flex;align-items:center;justify-content:center;">${item.poster ? `<img src="${item.poster}" style="width:100%;height:100%;object-fit:cover"/>` : '<i data-lucide="film"></i>'}</div><div style="padding:8px;font-size:11px;font-weight:600;">${item.title}</div>`;
            card.onclick = () => play(item);
            grid.appendChild(card);
          });
          if (typeof lucide !== 'undefined') lucide.createIcons({ attrs: { class: 'lucide-icon' } });
        }

        function play(item) {
          current = item;
          view = 'player';
          back.classList.remove('hidden');
          const src = self.movieEmbed(item.type === 'tv' ? 'tv' : 'movie', item.id, 1, 1);
          body.innerHTML = `<div style="display:flex;flex-direction:column;height:100%;"><h3 style="padding:8px 12px;">${item.title}</h3><iframe src="${src}" style="flex:1;border:none;background:#000;" allowfullscreen></iframe></div>`;
        }

        search.oninput = () => { query = search.value; load(); };
        back.onclick = () => load();
        load();
      }
    });

    QuantumOS.apps.movies = { launch: () => AppRegistry.open('movies') };
  },

  patchFileHandlers() {
    const dm = QuantumOS.DesktopManager;
    const orig = dm.doubleClickHandle.bind(dm);
    dm.doubleClickHandle = function (item) {
      if (!item.isApp && item.node?.type === 'file') {
        const name = item.node.name.toLowerCase();
        if (name.endsWith('.html') || name.endsWith('.htm')) {
          const path = item.node.path || `/Desktop/${item.name}`;
          const file = QuantumOS.FileSystem.get(path);
          if (file) {
            const blob = new Blob([file.content || ''], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            AppRegistry.open('browser', { url });
            return;
          }
        }
        if (name.endsWith('.txt')) {
          QuantumOS.apps.textEditor.launch(`/Desktop/${item.name}`);
          return;
        }
      }
      orig(item);
    };

    const origCtx = dm.setupContextActions.bind(dm);
    dm.setupContextActions = function () {
      origCtx();
      const dl = async () => {
        const sel = [...this.selected];
        if (!sel.length) return;
        sel.forEach(async id => {
          const el = document.querySelector(`.desktop-icon[data-id="${id}"]`);
          const name = el?.querySelector('span')?.textContent;
          if (!name) return;
          const node = QuantumOS.FileSystem.get(`/Desktop/${name}`);
          if (!node || node.type !== 'file') return;
          const blob = new Blob([node.content || ''], { type: 'text/plain' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = name;
          a.click();
        });
      };
      let btn = document.getElementById('ctx-download');
      if (!btn) {
        btn = document.createElement('div');
        btn.className = 'context-menu-item';
        btn.id = 'ctx-download';
        btn.innerHTML = '<i data-lucide="download"></i><span>Download</span>';
        document.getElementById('desktop-context-menu')?.insertBefore(btn, document.getElementById('ctx-refresh'));
        btn.addEventListener('click', dl);
      }
    };
    dm.setupContextActions();
  },

  hookAfterLogin() {
    const orig = QuantumOS.BootSystem.login.bind(QuantumOS.BootSystem);
    QuantumOS.BootSystem.login = async function (u, p) {
      await orig(u, p);
      QuantumOS.WidgetSystem.init = function () {
        QuantumOS.WidgetSystem.initNotes();
      };
      QuantumOS.Extras.applyChromeStyles();
    };
  }
};

QuantumOS.Extras = window.QuantumExtras;

function bootExtras() {
  if (typeof QuantumOS === 'undefined') return;
  QuantumOS.Extras.init();
  if (typeof AppRegistry !== 'undefined') {
    QuantumOS.apps.gamesBrowser = { launch: () => AppRegistry.open('gamesBrowser') };
    QuantumOS.apps.movies = { launch: () => AppRegistry.open('movies') };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(bootExtras, 50);
});
