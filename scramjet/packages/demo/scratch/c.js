'use strict';

// 1. QUANTUM OS NAMESPACE
window.QuantumOS = {
  version: '1.0.0',
  state: {
    booted: false,
    loggedIn: false,
    currentUser: null,
    activeWindow: null,
    clipboard: null
  },
  apps: {},
  windows: new Map(),
  settings: {},
  fs: {},
  themes: {},
  notifications: [],
  widgets: [],
  workspaces: [1, 2],
  activeWorkspace: 1
};

// 2. DATA PERSISTENCE MODULE (Storage)
QuantumOS.Storage = {
  db: null,
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('QuantumOS', 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        ['files', 'settings', 'themes', 'profiles'].forEach(store => {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store);
          }
        });
      };
      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
      };
      request.onerror = (e) => reject(e.target.error);
    });
  },
  async saveDB(storeName, key, value) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        localStorage.setItem(`db_${storeName}_${key}`, JSON.stringify(value));
        resolve();
        return;
      }
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.put(value, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },
  async loadDB(storeName, key) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        const val = localStorage.getItem(`db_${storeName}_${key}`);
        resolve(val ? JSON.parse(val) : null);
        return;
      }
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
  async clearAll() {
    return new Promise((resolve, reject) => {
      localStorage.clear();
      if (!this.db) {
        resolve();
        return;
      }
      const stores = ['files', 'settings', 'themes', 'profiles'];
      const tx = this.db.transaction(stores, 'readwrite');
      stores.forEach(s => tx.objectStore(s).clear());
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },
  save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  load(key) {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  }
};

// 3. VIRTUAL FILE SYSTEM (FileSystem)
QuantumOS.FileSystem = {
  root: null,
  async init() {
    const saved = await QuantumOS.Storage.loadDB('files', 'root');
    if (saved) {
      this.root = saved;
    } else {
      this.root = {
        id: 'root',
        name: 'root',
        type: 'directory',
        children: {}
      };
      const defaults = ['Desktop', 'Documents', 'Downloads', 'Pictures', 'Videos', 'Music', 'Apps', 'Trash'];
      defaults.forEach(dir => {
        this.root.children[dir] = {
          id: dir.toLowerCase(),
          name: dir,
          type: 'directory',
          children: {},
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
      });
      // Add default readmes
      this.createFile('/Desktop', 'welcome.txt', 'Welcome to Quantum OS!\nExplore using settings, terminals, and applications.');
      this.createFile('/Documents', 'notes.txt', 'Virtual filesystem is active and persists to IndexedDB.');
      await this.save();
    }
  },
  async save() {
    await QuantumOS.Storage.saveDB('files', 'root', this.root);
  },
  _resolvePath(path) {
    if (!path || path === '/') return this.root;
    const parts = path.split('/').filter(p => p);
    let current = this.root;
    for (const part of parts) {
      if (!current.children || !current.children[part]) return null;
      current = current.children[part];
    }
    return current;
  },
  createFile(parentPath, name, content = '') {
    const parent = this._resolvePath(parentPath);
    if (!parent || parent.type !== 'directory' || parent.children[name]) return null;
    parent.children[name] = {
      id: 'file_' + Math.random().toString(36).substr(2, 9),
      name: name,
      type: 'file',
      content: content,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    this.save();
    return parent.children[name];
  },
  createFolder(parentPath, name) {
    const parent = this._resolvePath(parentPath);
    if (!parent || parent.type !== 'directory' || parent.children[name]) return null;
    parent.children[name] = {
      id: 'dir_' + Math.random().toString(36).substr(2, 9),
      name: name,
      type: 'directory',
      children: {},
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    this.save();
    return parent.children[name];
  },
  delete(path) {
    const parts = path.split('/').filter(p => p);
    if (parts.length === 0) return false;
    const name = parts[parts.length - 1];
    const parentPath = '/' + parts.slice(0, -1).join('/');
    const parent = this._resolvePath(parentPath);
    if (!parent || !parent.children[name]) return false;
    delete parent.children[name];
    this.save();
    return true;
  },
  move(srcPath, destPath) {
    const srcParts = srcPath.split('/').filter(p => p);
    const name = srcParts[srcParts.length - 1];
    const srcParent = this._resolvePath('/' + srcParts.slice(0, -1).join('/'));
    const destParent = this._resolvePath(destPath);
    if (!srcParent || !srcParent.children[name] || !destParent || destParent.type !== 'directory' || destParent.children[name]) return false;
    destParent.children[name] = srcParent.children[name];
    delete srcParent.children[name];
    this.save();
    return true;
  },
  copy(srcPath, destPath) {
    const srcParts = srcPath.split('/').filter(p => p);
    const name = srcParts[srcParts.length - 1];
    const srcNode = this._resolvePath(srcPath);
    const destParent = this._resolvePath(destPath);
    if (!srcNode || !destParent || destParent.type !== 'directory' || destParent.children[name]) return false;
    const clone = JSON.parse(JSON.stringify(srcNode));
    clone.id = (clone.type === 'directory' ? 'dir_' : 'file_') + Math.random().toString(36).substr(2, 9);
    clone.createdAt = Date.now();
    clone.updatedAt = Date.now();
    destParent.children[name] = clone;
    this.save();
    return true;
  },
  rename(path, newName) {
    const parts = path.split('/').filter(p => p);
    if (parts.length === 0) return false;
    const name = parts[parts.length - 1];
    const parent = this._resolvePath('/' + parts.slice(0, -1).join('/'));
    if (!parent || !parent.children[name] || parent.children[newName]) return false;
    const node = parent.children[name];
    node.name = newName;
    node.updatedAt = Date.now();
    parent.children[newName] = node;
    delete parent.children[name];
    this.save();
    return true;
  },
  get(path) {
    return this._resolvePath(path);
  },
  list(path) {
    const node = this._resolvePath(path);
    if (!node || node.type !== 'directory') return [];
    return Object.values(node.children);
  },
  search(query) {
    const results = [];
    const searchNode = (node, currentPath) => {
      if (node.name.toLowerCase().includes(query.toLowerCase()) && node.id !== 'root') {
        results.push({ path: currentPath, node });
      }
      if (node.type === 'directory') {
        for (const name in node.children) {
          searchNode(node.children[name], (currentPath === '/' ? '' : currentPath) + '/' + name);
        }
      }
    };
    searchNode(this.root, '/');
    return results;
  },
  trash(path) {
    const parts = path.split('/').filter(p => p);
    if (parts.length === 0 || parts[0] === 'Trash') return false;
    const name = parts[parts.length - 1];
    const parent = this._resolvePath('/' + parts.slice(0, -1).join('/'));
    const trashNode = this._resolvePath('/Trash');
    if (!parent || !parent.children[name] || !trashNode) return false;
    const node = parent.children[name];
    node.originalPath = path;
    let trashName = name;
    let counter = 1;
    while (trashNode.children[trashName]) {
      trashName = `${name}_${counter++}`;
    }
    trashNode.children[trashName] = node;
    delete parent.children[name];
    this.save();
    return true;
  },
  restore(trashName) {
    const trashNode = this._resolvePath('/Trash');
    if (!trashNode || !trashNode.children[trashName]) return false;
    const node = trashNode.children[trashName];
    const origPath = node.originalPath || `/Desktop/${node.name}`;
    const origParts = origPath.split('/').filter(p => p);
    const origName = origParts[origParts.length - 1];
    const origParentPath = '/' + origParts.slice(0, -1).join('/');
    let origParent = this._resolvePath(origParentPath) || this._resolvePath('/Desktop');
    let finalName = origName;
    let counter = 1;
    while (origParent.children[finalName]) {
      finalName = `${origName}_${counter++}`;
    }
    node.name = finalName;
    delete node.originalPath;
    origParent.children[finalName] = node;
    delete trashNode.children[trashName];
    this.save();
    return true;
  },
  emptyTrash() {
    const trashNode = this._resolvePath('/Trash');
    if (!trashNode) return false;
    trashNode.children = {};
    this.save();
    return true;
  }
};

// 4. THEME ENGINE
QuantumOS.ThemeEngine = {
  themes: ['dark', 'light', 'quantum', 'cyberpunk', 'glass', 'amoled', 'neon', 'nord', 'catppuccin', 'dracula'],
  current: 'dark',
  apply(themeName) {
    if (!this.themes.includes(themeName)) return false;
    this.current = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    QuantumOS.Storage.save('theme', themeName);
    QuantumOS.SettingsEngine.set('appearance.theme', themeName);
    return true;
  },
  export() {
    return JSON.stringify({ theme: this.current });
  },
  import(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data && data.theme) return this.apply(data.theme);
    } catch (e) {
      console.error(e);
    }
    return false;
  },
  customize(colors) {
    for (const [key, value] of Object.entries(colors)) {
      document.documentElement.style.setProperty(`--${key}`, value);
    }
    QuantumOS.Storage.save('custom_theme_colors', colors);
  }
};

// 5. SETTINGS ENGINE
QuantumOS.SettingsEngine = {
  defaults: {
    appearance: { theme: 'dark', fontFamily: 'Inter', fontSize: 13, transparency: true },
    desktop: { showIcons: true, arrangeGrid: true, wallpaper: 'gradient', iconSize: 'medium' },
    dock: { position: 'bottom', autohide: false, magnification: true, size: 50 },
    taskbar: { showClock: true, showNotifications: true, position: 'bottom' },
    windowManager: { snapEnabled: true, animationSpeed: 'medium', cascadeSpacing: 30 },
    accessibility: { highContrast: false, screenReader: false, largeCursor: false },
    performance: { effectsEnabled: true, maxParticles: 60 },
    notifications: { enabled: true, soundEnabled: true, timeout: 5000 },
    privacy: { telemetry: false, saveHistory: true },
    sound: { volume: 65, muted: false },
    input: { mouseSpeed: 5, keyboardRepeat: 10 },
    search: { engine: 'quantum', includeFiles: true },
    ai: { enabled: true, assistantName: 'Quantum AI', localModel: false },
    experimental: { webGPU: false, virtualReality: false }
  },
  current: {},
  listeners: {},
  init() {
    this.current = JSON.parse(JSON.stringify(this.defaults));
    this.load();
  },
  get(path) {
    return path.split('.').reduce((acc, part) => acc && acc[part] !== undefined ? acc[part] : undefined, this.current);
  },
  set(path, value) {
    const parts = path.split('.');
    let obj = this.current;
    for (let i = 0; i < parts.length - 1; i++) {
      if (obj[parts[i]] === undefined) obj[parts[i]] = {};
      obj = obj[parts[i]];
    }
    const lastPart = parts[parts.length - 1];
    const oldValue = obj[lastPart];
    obj[lastPart] = value;
    this.save();
    if (this.listeners[path]) {
      this.listeners[path].forEach(cb => cb(value, oldValue));
    }
    return true;
  },
  onChange(path, callback) {
    if (!this.listeners[path]) this.listeners[path] = [];
    this.listeners[path].push(callback);
  },
  reset(path) {
    const defaultValue = path.split('.').reduce((acc, part) => acc && acc[part] !== undefined ? acc[part] : undefined, this.defaults);
    if (defaultValue !== undefined) this.set(path, JSON.parse(JSON.stringify(defaultValue)));
  },
  resetAll() {
    this.current = JSON.parse(JSON.stringify(this.defaults));
    this.save();
    Object.keys(this.listeners).forEach(path => {
      this.listeners[path].forEach(cb => cb(this.get(path), undefined));
    });
  },
  save() {
    QuantumOS.Storage.save('settings', this.current);
  },
  load() {
    const saved = QuantumOS.Storage.load('settings');
    if (saved) this._deepMerge(this.current, saved);
  },
  _deepMerge(target, source) {
    for (const key of Object.keys(source)) {
      if (source[key] instanceof Object && target[key] instanceof Object) {
        this._deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  },
  export() {
    return JSON.stringify(this.current);
  },
  import(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data) {
        this.current = data;
        this.save();
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  }
};

// 6. WINDOW MANAGER
QuantumOS.WindowManager = {
  windows: new Map(),
  activeWindowId: null,
  nextZIndex: 100,
  snapThreshold: 20,
  createWindow(options = {}) {
    const id = options.id || 'win_' + Math.random().toString(36).substr(2, 9);
    if (this.windows.has(id)) {
      this.focus(id);
      return this.windows.get(id);
    }
    const defaults = {
      title: 'New Window',
      icon: 'window',
      content: '',
      x: 100 + (this.windows.size * 30) % 200,
      y: 100 + (this.windows.size * 30) % 150,
      w: 600,
      h: 400,
      minW: 300,
      minH: 200,
      workspace: QuantumOS.activeWorkspace
    };
    const config = Object.assign({}, defaults, options);
    config.id = id;
    config.zIndex = this.nextZIndex++;
    config.isMaximized = false;
    config.isMinimized = false;
    config.restoredRect = { x: config.x, y: config.y, w: config.w, h: config.h };

    const winEl = document.createElement('div');
    winEl.className = 'window';
    winEl.id = `window-${id}`;
    winEl.style.left = `${config.x}px`;
    winEl.style.top = `${config.y}px`;
    winEl.style.width = `${config.w}px`;
    winEl.style.height = `${config.h}px`;
    winEl.style.zIndex = config.zIndex;

    winEl.innerHTML = `
      <div class="window-header">
        <div class="window-title">
          <i data-lucide="${config.icon}"></i>
          <span>${config.title}</span>
        </div>
        <div class="window-controls">
          <button class="window-btn btn-minimize"><i data-lucide="minus"></i></button>
          <button class="window-btn btn-maximize"><i data-lucide="square"></i></button>
          <button class="window-btn btn-close"><i data-lucide="x"></i></button>
        </div>
      </div>
      <div class="window-body"></div>
      <div class="window-resizer resizer-n"></div>
      <div class="window-resizer resizer-s"></div>
      <div class="window-resizer resizer-e"></div>
      <div class="window-resizer resizer-w"></div>
      <div class="window-resizer resizer-se"></div>
      <div class="window-resizer resizer-sw"></div>
      <div class="window-resizer resizer-ne"></div>
      <div class="window-resizer resizer-nw"></div>
    `;

    const bodyEl = winEl.querySelector('.window-body');
    if (typeof config.content === 'string') {
      bodyEl.innerHTML = config.content;
    } else if (config.content instanceof HTMLElement) {
      bodyEl.appendChild(config.content);
    }

    document.getElementById('window-container').appendChild(winEl);
    config.element = winEl;
    this.windows.set(id, config);

    if (typeof lucide !== 'undefined') {
      lucide.createIcons({ attrs: { class: 'lucide-icon' } });
    }

    winEl.querySelector('.btn-minimize').addEventListener('click', (e) => {
      e.stopPropagation();
      this.minimize(id);
    });
    winEl.querySelector('.btn-maximize').addEventListener('click', (e) => {
      e.stopPropagation();
      if (config.isMaximized) this.restore(id);
      else this.maximize(id);
    });
    winEl.querySelector('.btn-close').addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeWindow(id);
    });
    winEl.addEventListener('mousedown', () => this.focus(id));

    this.setupDragAndResize(id);
    this.focus(id);
    QuantumOS.TaskbarController.syncRunningApps();
    return config;
  },
  setupDragAndResize(id) {
    const win = this.windows.get(id);
    const el = win.element;
    const header = el.querySelector('.window-header');

    header.addEventListener('mousedown', (e) => {
      if (e.target.closest('.window-controls')) return;
      if (win.isMaximized) return;
      e.preventDefault();
      const startX = e.clientX;
      const startY = e.clientY;
      const startLeft = win.x;
      const startTop = win.y;

      const onMouseMove = (moveEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        const newX = startLeft + dx;
        const newY = startTop + dy;

        const snapPreview = document.getElementById('snap-preview');
        const mouseX = moveEvent.clientX;
        const mouseY = moveEvent.clientY;

        if (mouseX < this.snapThreshold) {
          snapPreview.className = 'snap-preview snap-left';
          snapPreview.classList.remove('hidden');
        } else if (mouseX > window.innerWidth - this.snapThreshold) {
          snapPreview.className = 'snap-preview snap-right';
          snapPreview.classList.remove('hidden');
        } else if (mouseY < this.snapThreshold) {
          snapPreview.className = 'snap-preview snap-top';
          snapPreview.classList.remove('hidden');
        } else {
          snapPreview.className = 'snap-preview hidden';
        }

        win.x = newX;
        win.y = newY;
        el.style.left = `${newX}px`;
        el.style.top = `${newY}px`;
      };

      const onMouseUp = (upEvent) => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        const snapPreview = document.getElementById('snap-preview');
        snapPreview.classList.add('hidden');

        const mouseX = upEvent.clientX;
        const mouseY = upEvent.clientY;

        if (mouseX < this.snapThreshold) {
          this.snap(id, 'left');
        } else if (mouseX > window.innerWidth - this.snapThreshold) {
          this.snap(id, 'right');
        } else if (mouseY < this.snapThreshold) {
          this.maximize(id);
        } else {
          win.restoredRect = { x: win.x, y: win.y, w: win.w, h: win.h };
        }
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    const resizers = el.querySelectorAll('.window-resizer');
    resizers.forEach(resizer => {
      resizer.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const dir = resizer.className.replace('window-resizer resizer-', '');
        const startX = e.clientX;
        const startY = e.clientY;
        const startLeft = win.x;
        const startTop = win.y;
        const startW = win.w;
        const startH = win.h;

        const onMouseMove = (moveEvent) => {
          const dx = moveEvent.clientX - startX;
          const dy = moveEvent.clientY - startY;
          let newX = win.x, newY = win.y, newW = win.w, newH = win.h;

          if (dir.includes('e')) newW = Math.max(win.minW, startW + dx);
          if (dir.includes('w') && startW - dx >= win.minW) {
            newW = startW - dx;
            newX = startLeft + dx;
          }
          if (dir.includes('s')) newH = Math.max(win.minH, startH + dy);
          if (dir.includes('n') && startH - dy >= win.minH) {
            newH = startH - dy;
            newY = startTop + dy;
          }

          win.x = newX; win.y = newY; win.w = newW; win.h = newH;
          el.style.left = `${newX}px`;
          el.style.top = `${newY}px`;
          el.style.width = `${newW}px`;
          el.style.height = `${newH}px`;
        };

        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          win.restoredRect = { x: win.x, y: win.y, w: win.w, h: win.h };
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
    });
  },
  focus(id) {
    const win = this.windows.get(id);
    if (!win) return;
    if (this.activeWindowId && this.windows.has(this.activeWindowId)) {
      this.windows.get(this.activeWindowId).element.classList.remove('active');
    }
    win.zIndex = this.nextZIndex++;
    win.element.style.zIndex = win.zIndex;
    win.element.classList.add('active');
    win.element.classList.remove('minimized');
    win.isMinimized = false;
    this.activeWindowId = id;
    QuantumOS.state.activeWindow = id;
    QuantumOS.TaskbarController.syncRunningApps();
  },
  closeWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;
    win.element.remove();
    this.windows.delete(id);
    if (this.activeWindowId === id) {
      this.activeWindowId = null;
      let topWin = null;
      this.windows.forEach(w => {
        if (!w.isMinimized && w.workspace === QuantumOS.activeWorkspace && (!topWin || w.zIndex > topWin.zIndex)) {
          topWin = w;
        }
      });
      if (topWin) this.focus(topWin.id);
    }
    QuantumOS.TaskbarController.syncRunningApps();
  },
  minimize(id) {
    const win = this.windows.get(id);
    if (!win) return;
    win.isMinimized = true;
    win.element.classList.add('minimized');
    win.element.classList.remove('active');
    if (this.activeWindowId === id) {
      this.activeWindowId = null;
      let topWin = null;
      this.windows.forEach(w => {
        if (!w.isMinimized && w.workspace === QuantumOS.activeWorkspace && (!topWin || w.zIndex > topWin.zIndex)) {
          topWin = w;
        }
      });
      if (topWin) this.focus(topWin.id);
    }
    QuantumOS.TaskbarController.syncRunningApps();
  },
  maximize(id) {
    const win = this.windows.get(id);
    if (!win) return;
    win.restoredRect = { x: win.x, y: win.y, w: win.w, h: win.h };
    win.isMaximized = true;
    win.element.classList.add('maximized');
    win.element.style.left = '0px';
    win.element.style.top = '0px';
    win.element.style.width = '100%';
    win.element.style.height = `calc(100% - 40px)`;
    this.focus(id);
  },
  restore(id) {
    const win = this.windows.get(id);
    if (!win) return;
    win.isMaximized = false;
    win.element.classList.remove('maximized');
    win.x = win.restoredRect.x;
    win.y = win.restoredRect.y;
    win.w = win.restoredRect.w;
    win.h = win.restoredRect.h;
    win.element.style.left = `${win.x}px`;
    win.element.style.top = `${win.y}px`;
    win.element.style.width = `${win.w}px`;
    win.element.style.height = `${win.h}px`;
    this.focus(id);
  },
  snap(id, side) {
    const win = this.windows.get(id);
    if (!win) return;
    win.isMaximized = false;
    win.element.classList.remove('maximized');
    const w = window.innerWidth / 2;
    const h = window.innerHeight - 40;
    if (side === 'left') {
      win.x = 0; win.y = 0; win.w = w; win.h = h;
    } else {
      win.x = w; win.y = 0; win.w = w; win.h = h;
    }
    win.element.style.left = `${win.x}px`;
    win.element.style.top = `${win.y}px`;
    win.element.style.width = `${win.w}px`;
    win.element.style.height = `${win.h}px`;
    this.focus(id);
  },
  cascade() {
    const wins = Array.from(this.windows.values()).filter(w => !w.isMinimized && w.workspace === QuantumOS.activeWorkspace);
    const spacing = QuantumOS.SettingsEngine.get('windowManager.cascadeSpacing') || 30;
    wins.forEach((win, idx) => {
      this.restore(win.id);
      win.x = 60 + idx * spacing;
      win.y = 60 + idx * spacing;
      win.element.style.left = `${win.x}px`;
      win.element.style.top = `${win.y}px`;
      this.focus(win.id);
    });
  },
  tile() {
    const wins = Array.from(this.windows.values()).filter(w => !w.isMinimized && w.workspace === QuantumOS.activeWorkspace);
    if (wins.length === 0) return;
    const cols = Math.ceil(Math.sqrt(wins.length));
    const rows = Math.ceil(wins.length / cols);
    const w = window.innerWidth / cols;
    const h = (window.innerHeight - 40) / rows;
    wins.forEach((win, idx) => {
      this.restore(win.id);
      const c = idx % cols;
      const r = Math.floor(idx / cols);
      win.x = c * w; win.y = r * h; win.w = w; win.h = h;
      win.element.style.left = `${win.x}px`;
      win.element.style.top = `${win.y}px`;
      win.element.style.width = `${win.w}px`;
      win.element.style.height = `${win.h}px`;
    });
  }
};

// 7. BOOT SYSTEM
QuantumOS.BootSystem = {
  progress: 0,
  timer: null,
  init() {
    const fill = document.getElementById('boot-progress-fill');
    const status = document.getElementById('boot-status-text');
    const screen = document.getElementById('boot-screen');
    const steps = [
      { p: 15, t: 'Loading Kernel...' },
      { p: 40, t: 'Configuring Virtual Filesystem...' },
      { p: 70, t: 'Bootstrapping Modules...' },
      { p: 100, t: 'Complete.' }
    ];
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < steps.length) {
        fill.style.width = `${steps[idx].p}%`;
        status.innerText = steps[idx].t;
        idx++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          screen.classList.add('fade-out');
          setTimeout(() => {
            screen.classList.add('hidden');
            this.showLogin();
          }, 800);
        }, 300);
      }
    }, 300);
  },
  showLogin() {
    const login = document.getElementById('login-screen');
    login.classList.remove('hidden');
    login.classList.remove('fade-out');
    this.updateClock();
    this.timer = setInterval(() => this.updateClock(), 1000);
  },
  updateClock() {
    const timeEl = document.getElementById('login-time');
    const dateEl = document.getElementById('login-date');
    const now = new Date();
    if (timeEl) timeEl.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    if (dateEl) dateEl.innerText = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  },
  async login(username, password) {
    clearInterval(this.timer);
    const login = document.getElementById('login-screen');
    login.classList.add('fade-out');
    setTimeout(() => {
      login.classList.add('hidden');
      document.getElementById('desktop').classList.remove('hidden');
      document.getElementById('dock').classList.remove('hidden');
      document.getElementById('taskbar').classList.remove('hidden');

      QuantumOS.state.loggedIn = true;
      QuantumOS.state.currentUser = username;
      document.getElementById('start-user-name').innerText = username.charAt(0).toUpperCase() + username.slice(1);

      QuantumOS.DesktopManager.renderIcons();
      QuantumOS.DockController.updateIndicators();
      QuantumOS.WidgetSystem.init();
      QuantumOS.ParticleSystem.init();

      QuantumOS.NotificationSystem.notify({
        title: 'Quantum OS initialized',
        text: `Welcome back, ${username}!`,
        icon: 'smile'
      });
    }, 600);
    return true;
  },
  logout() {
    QuantumOS.state.loggedIn = false;
    QuantumOS.state.currentUser = null;
    document.getElementById('desktop').classList.add('hidden');
    document.getElementById('dock').classList.add('hidden');
    document.getElementById('taskbar').classList.add('hidden');
    this.showLogin();
  },
  lock() {
    if (!QuantumOS.state.loggedIn) return;
    const login = document.getElementById('login-screen');
    login.classList.remove('hidden');
    login.classList.remove('fade-out');
    this.updateClock();
    this.timer = setInterval(() => this.updateClock(), 1000);
  }
};

// 8. DESKTOP MANAGER
QuantumOS.DesktopManager = {
  selected: new Set(),
  init() {
    const desktop = document.getElementById('desktop');
    desktop.addEventListener('click', (e) => {
      if (!e.target.closest('.desktop-icon') && !e.target.closest('.widget') && !e.target.closest('.context-menu')) {
        this.deselect();
      }
    });

    desktop.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const icon = e.target.closest('.desktop-icon');
      if (icon) {
        this.showContextMenu(e.clientX, e.clientY, 'icon', icon.getAttribute('data-id'));
      } else {
        this.showContextMenu(e.clientX, e.clientY, 'desktop');
      }
    });

    document.addEventListener('click', () => {
      document.getElementById('desktop-context-menu').classList.add('hidden');
    });

    // Rubber band selection
    desktop.addEventListener('mousedown', (e) => {
      if (e.target !== desktop && e.target.id !== 'particle-canvas' && e.target.id !== 'desktop-icons') return;
      if (e.button !== 0) return;
      e.preventDefault();
      const rect = desktop.getBoundingClientRect();
      const startX = e.clientX - rect.left;
      const startY = e.clientY - rect.top;
      const sel = document.getElementById('selection-rect');
      sel.style.left = `${startX}px`;
      sel.style.top = `${startY}px`;
      sel.style.width = '0px';
      sel.style.height = '0px';
      sel.classList.remove('hidden');

      const onMouseMove = (moveEvent) => {
        const curX = moveEvent.clientX - rect.left;
        const curY = moveEvent.clientY - rect.top;
        const x = Math.min(startX, curX);
        const y = Math.min(startY, curY);
        const w = Math.abs(startX - curX);
        const h = Math.abs(startY - curY);

        sel.style.left = `${x}px`;
        sel.style.top = `${y}px`;
        sel.style.width = `${w}px`;
        sel.style.height = `${h}px`;

        this.checkIntersections(x, y, w, h);
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        sel.classList.add('hidden');
      };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    this.setupContextActions();
  },
  renderIcons() {
    const container = document.getElementById('desktop-icons');
    if (!container) return;
    container.innerHTML = '';

    const systemApps = [
      { id: 'fileExplorer', name: 'File Explorer', icon: 'folder' },
      { id: 'browser', name: 'Browser', icon: 'globe' },
      { id: 'aiChat', name: 'AI Chat', icon: 'bot' },
      { id: 'settings', name: 'Settings', icon: 'settings' },
      { id: 'terminal', name: 'Terminal', icon: 'terminal' },
      { id: 'cloudGaming', name: 'Cloud Gaming', icon: 'gamepad-2' },
      { id: 'calculator', name: 'Calculator', icon: 'calculator' },
      { id: 'textEditor', name: 'Text Editor', icon: 'file-text' },
      { id: 'musicPlayer', name: 'Music Player', icon: 'music' },
      { id: 'trash', name: 'Trash', icon: 'trash-2' }
    ];

    const files = QuantumOS.FileSystem.list('/Desktop');
    const items = [
      ...systemApps.map(a => ({ ...a, isApp: true })),
      ...files.map(f => ({
        id: f.id,
        name: f.name,
        icon: f.type === 'directory' ? 'folder' : this.getFileIcon(f.name),
        isApp: false,
        node: f
      }))
    ];

    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'desktop-icon';
      div.setAttribute('data-id', item.id);
      if (this.selected.has(item.id)) div.classList.add('selected');
      div.innerHTML = `<i data-lucide="${item.icon}"></i><span>${item.name}</span>`;

      div.addEventListener('click', (e) => {
        e.stopPropagation();
        this.select(item.id, e.ctrlKey);
      });
      div.addEventListener('dblclick', () => this.doubleClickHandle(item));

      div.setAttribute('draggable', 'true');
      div.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', item.isApp ? `app:${item.id}` : `path:/Desktop/${item.name}`);
      });

      if (!item.isApp && item.node && item.node.type === 'directory') {
        div.addEventListener('dragover', (e) => e.preventDefault());
        div.addEventListener('drop', (e) => {
          e.preventDefault();
          this.dropHandle(e, `/Desktop/${item.name}`);
        });
      }
      if (item.id === 'trash') {
        div.addEventListener('dragover', (e) => e.preventDefault());
        div.addEventListener('drop', (e) => {
          e.preventDefault();
          this.dropHandle(e, '/Trash');
        });
      }

      container.appendChild(div);
    });

    if (typeof lucide !== 'undefined') {
      lucide.createIcons({ attrs: { class: 'lucide-icon' } });
    }
  },
  getFileIcon(name) {
    const ext = name.split('.').pop().toLowerCase();
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'image';
    if (['mp3', 'wav', 'ogg'].includes(ext)) return 'music';
    if (['mp4', 'webm'].includes(ext)) return 'video';
    if (['js', 'html', 'css', 'json'].includes(ext)) return 'code';
    return 'file-text';
  },
  select(id, ctrl) {
    if (!ctrl) this.deselect();
    this.selected.add(id);
    const el = document.querySelector(`.desktop-icon[data-id="${id}"]`);
    if (el) el.classList.add('selected');
  },
  deselect() {
    this.selected.clear();
    document.querySelectorAll('.desktop-icon').forEach(el => el.classList.remove('selected'));
  },
  checkIntersections(x, y, w, h) {
    const desktop = document.getElementById('desktop');
    const dRect = desktop.getBoundingClientRect();
    document.querySelectorAll('.desktop-icon').forEach(icon => {
      const rect = icon.getBoundingClientRect();
      const ix = rect.left - dRect.left;
      const iy = rect.top - dRect.top;
      const iw = rect.width;
      const ih = rect.height;

      const intersects = x < ix + iw && x + w > ix && y < iy + ih && y + h > iy;
      const id = icon.getAttribute('data-id');
      if (intersects) {
        this.select(id, true);
      } else {
        this.selected.delete(id);
        icon.classList.remove('selected');
      }
    });
  },
  doubleClickHandle(item) {
    if (item.isApp) {
      if (QuantumOS.apps[item.id]) QuantumOS.apps[item.id].launch();
    } else {
      if (item.node.type === 'directory') {
        QuantumOS.apps.fileExplorer.launch(`/Desktop/${item.name}`);
      } else {
        QuantumOS.apps.textEditor.launch(`/Desktop/${item.name}`);
      }
    }
  },
  dropHandle(e, targetPath) {
    const data = e.dataTransfer.getData('text/plain');
    if (!data || !data.startsWith('path:')) return;
    const src = data.replace('path:', '');
    if (targetPath === '/Trash') {
      QuantumOS.FileSystem.trash(src);
      QuantumOS.NotificationSystem.showToast('Item moved to Trash');
    } else {
      QuantumOS.FileSystem.move(src, targetPath);
    }
    this.renderIcons();
  },
  showContextMenu(x, y, type, targetId) {
    const menu = document.getElementById('desktop-context-menu');
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.classList.remove('hidden');
    this.contextTarget = { type, id: targetId };
  },
  setupContextActions() {
    document.getElementById('ctx-new-folder').addEventListener('click', () => {
      let name = 'New Folder', idx = 1;
      while (QuantumOS.FileSystem.get(`/Desktop/${name}`)) name = `New Folder (${idx++})`;
      QuantumOS.FileSystem.createFolder('/Desktop', name);
      this.renderIcons();
    });
    document.getElementById('ctx-new-file').addEventListener('click', () => {
      let name = 'Untitled.txt', idx = 1;
      while (QuantumOS.FileSystem.get(`/Desktop/${name}`)) name = `Untitled (${idx++}).txt`;
      QuantumOS.FileSystem.createFile('/Desktop', name, '');
      this.renderIcons();
    });
    document.getElementById('ctx-refresh').addEventListener('click', () => {
      this.renderIcons();
      QuantumOS.NotificationSystem.showToast('Desktop refreshed');
    });
    document.getElementById('ctx-display-settings').addEventListener('click', () => {
      QuantumOS.apps.settings.launch('desktop');
    });
    document.getElementById('ctx-personalize').addEventListener('click', () => {
      QuantumOS.apps.settings.launch('appearance');
    });
  }
};

// 9. NOTIFICATION SYSTEM
QuantumOS.NotificationSystem = {
  notifications: [],
  notify(options) {
    const id = 'notif_' + Math.random().toString(36).substr(2, 9);
    const defaults = { id, title: 'Notification', text: '', icon: 'bell', time: new Date() };
    const config = Object.assign({}, defaults, options);
    this.notifications.unshift(config);

    if (QuantumOS.SettingsEngine.get('notifications.enabled')) {
      this.showToast(`${config.title}: ${config.text}`, config.icon);
    }
    this.renderCenter();
    return id;
  },
  showToast(text, icon = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i data-lucide="${icon}"></i><span>${text}</span>`;
    container.appendChild(toast);
    if (typeof lucide !== 'undefined') lucide.createIcons({ attrs: { class: 'lucide-icon' } });
    setTimeout(() => toast.classList.add('visible'), 50);
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  },
  dismiss(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.renderCenter();
  },
  clear() {
    this.notifications = [];
    this.renderCenter();
  },
  toggleCenter() {
    const center = document.getElementById('notification-center');
    center.classList.toggle('hidden');
    this.renderCenter();
  },
  renderCenter() {
    const list = document.getElementById('notification-list');
    const badge = document.getElementById('notification-badge');
    list.innerHTML = '';

    if (this.notifications.length === 0) {
      list.innerHTML = '<div class="notification-empty">No new notifications</div>';
      badge.classList.add('hidden');
      return;
    }

    badge.innerText = this.notifications.length;
    badge.classList.remove('hidden');

    this.notifications.forEach(n => {
      const div = document.createElement('div');
      div.className = 'notification-item';
      div.innerHTML = `
        <div class="notification-item-icon"><i data-lucide="${n.icon}"></i></div>
        <div class="notification-item-content">
          <span class="notification-item-title">${n.title}</span>
          <span class="notification-item-text">${n.text}</span>
        </div>
        <button class="notification-item-close"><i data-lucide="x"></i></button>
      `;
      div.querySelector('.notification-item-close').addEventListener('click', (e) => {
        e.stopPropagation();
        this.dismiss(n.id);
      });
      list.appendChild(div);
    });

    if (typeof lucide !== 'undefined') {
      lucide.createIcons({ attrs: { class: 'lucide-icon' } });
    }
  }
};

// 10. SEARCH SYSTEM
QuantumOS.SearchSystem = {
  init() {
    const input = document.getElementById('search-overlay-input');
    input.addEventListener('input', (e) => this.search(e.target.value));
    document.getElementById('search-overlay-backdrop').addEventListener('click', () => this.hide());
  },
  show() {
    document.getElementById('search-overlay').classList.remove('hidden');
    const input = document.getElementById('search-overlay-input');
    input.value = '';
    input.focus();
    this.search('');
  },
  hide() {
    document.getElementById('search-overlay').classList.add('hidden');
  },
  toggle() {
    const o = document.getElementById('search-overlay');
    if (o.classList.contains('hidden')) this.show();
    else this.hide();
  },
  search(query) {
    const appsList = document.getElementById('search-results-apps-list');
    const filesList = document.getElementById('search-results-files-list');
    const settingsList = document.getElementById('search-results-settings-list');

    appsList.innerHTML = '';
    filesList.innerHTML = '';
    settingsList.innerHTML = '';

    if (!query) {
      appsList.innerHTML = '<div class="search-empty">Type to search...</div>';
      return;
    }

    // Apps
    const apps = [
      { id: 'fileExplorer', name: 'File Explorer', icon: 'folder' },
      { id: 'browser', name: 'Browser', icon: 'globe' },
      { id: 'aiChat', name: 'AI Chat', icon: 'bot' },
      { id: 'settings', name: 'Settings', icon: 'settings' },
      { id: 'terminal', name: 'Terminal', icon: 'terminal' }
    ].filter(a => a.name.toLowerCase().includes(query.toLowerCase()));

    apps.forEach(app => {
      const div = document.createElement('div');
      div.className = 'search-item';
      div.innerHTML = `<i data-lucide="${app.icon}"></i><span>${app.name}</span>`;
      div.addEventListener('click', () => {
        this.hide();
        QuantumOS.apps[app.id].launch();
      });
      appsList.appendChild(div);
    });

    // Files
    const files = QuantumOS.FileSystem.search(query).slice(0, 5);
    files.forEach(f => {
      const div = document.createElement('div');
      div.className = 'search-item';
      const icon = f.node.type === 'directory' ? 'folder' : QuantumOS.DesktopManager.getFileIcon(f.node.name);
      div.innerHTML = `<i data-lucide="${icon}"></i><span>${f.node.name} (${f.path})</span>`;
      div.addEventListener('click', () => {
        this.hide();
        if (f.node.type === 'directory') {
          QuantumOS.apps.fileExplorer.launch(f.path);
        } else {
          QuantumOS.apps.textEditor.launch(f.path);
        }
      });
      filesList.appendChild(div);
    });

    // Settings
    const settings = [
      { name: 'Theme', cat: 'appearance' },
      { name: 'Wallpaper', cat: 'desktop' },
      { name: 'Performance Particles', cat: 'performance' }
    ].filter(s => s.name.toLowerCase().includes(query.toLowerCase()));

    settings.forEach(s => {
      const div = document.createElement('div');
      div.className = 'search-item';
      div.innerHTML = `<i data-lucide="settings"></i><span>${s.name} Settings</span>`;
      div.addEventListener('click', () => {
        this.hide();
        QuantumOS.apps.settings.launch(s.cat);
      });
      settingsList.appendChild(div);
    });

    if (typeof lucide !== 'undefined') {
      lucide.createIcons({ attrs: { class: 'lucide-icon' } });
    }
  }
};

// 11. WORKSPACE MANAGER
QuantumOS.WorkspaceManager = {
  workspaces: [1, 2],
  activeWorkspace: 1,
  init() {
    document.getElementById('workspace-add-btn').addEventListener('click', () => this.add());
    document.getElementById('workspace-overview').addEventListener('click', (e) => {
      if (e.target.id === 'workspace-overview') this.overviewHide();
    });
  },
  add() {
    const next = Math.max(...this.workspaces) + 1;
    this.workspaces.push(next);
    this.renderOverview();
    QuantumOS.NotificationSystem.showToast(`Workspace ${next} added`);
  },
  remove(id) {
    if (this.workspaces.length === 1) return;
    const fallback = this.workspaces.find(w => w !== id);
    QuantumOS.WindowManager.windows.forEach(w => {
      if (w.workspace === id) w.workspace = fallback;
    });
    this.workspaces = this.workspaces.filter(w => w !== id);
    if (this.activeWorkspace === id) this.switch(fallback);
    this.renderOverview();
  },
  switch(id) {
    if (!this.workspaces.includes(id)) return;
    this.activeWorkspace = id;
    QuantumOS.activeWorkspace = id;

    QuantumOS.WindowManager.windows.forEach(w => {
      if (w.workspace === id && !w.isMinimized) {
        w.element.classList.remove('hidden');
      } else {
        w.element.classList.add('hidden');
      }
    });

    let top = null;
    QuantumOS.WindowManager.windows.forEach(w => {
      if (w.workspace === id && !w.isMinimized && (!top || w.zIndex > top.zIndex)) {
        top = w;
      }
    });
    if (top) QuantumOS.WindowManager.focus(top.id);
    else {
      QuantumOS.WindowManager.activeWindowId = null;
      QuantumOS.state.activeWindow = null;
    }

    this.renderOverview();
    QuantumOS.TaskbarController.syncRunningApps();
  },
  overviewShow() {
    document.getElementById('workspace-overview').classList.remove('hidden');
    this.renderOverview();
  },
  overviewHide() {
    document.getElementById('workspace-overview').classList.add('hidden');
  },
  toggleOverview() {
    const o = document.getElementById('workspace-overview');
    if (o.classList.contains('hidden')) this.overviewShow();
    else this.overviewHide();
  },
  renderOverview() {
    const container = document.getElementById('workspace-thumbnails');
    container.innerHTML = '';

    this.workspaces.forEach(wsId => {
      const thumb = document.createElement('div');
      thumb.className = `workspace-thumbnail ${wsId === this.activeWorkspace ? 'active' : ''}`;
      thumb.innerHTML = `
        <div class="workspace-preview">
          <span class="workspace-label">Desktop ${wsId}</span>
          ${this.workspaces.length > 1 ? '<button class="workspace-delete-btn"><i data-lucide="x"></i></button>' : ''}
        </div>
      `;

      thumb.querySelector('.workspace-preview').addEventListener('click', (e) => {
        if (e.target.closest('.workspace-delete-btn')) return;
        this.switch(wsId);
        this.overviewHide();
      });

      const del = thumb.querySelector('.workspace-delete-btn');
      if (del) {
        del.addEventListener('click', (e) => {
          e.stopPropagation();
          this.remove(wsId);
        });
      }
      container.appendChild(thumb);
    });

    if (typeof lucide !== 'undefined') {
      lucide.createIcons({ attrs: { class: 'lucide-icon' } });
    }
  }
};

// 12. DOCK CONTROLLER
QuantumOS.DockController = {
  items: new Set(['fileExplorer', 'browser', 'aiChat', 'settings', 'terminal', 'cloudGaming', 'musicPlayer', 'trash']),
  init() {
    const container = document.getElementById('dock-container');
    container.addEventListener('click', (e) => {
      const item = e.target.closest('.dock-item');
      if (!item) return;
      const appId = item.getAttribute('data-app');
      this.bounce(appId);

      const win = QuantumOS.WindowManager.windows.get(appId);
      if (win) {
        if (win.isMinimized || QuantumOS.WindowManager.activeWindowId !== appId) {
          QuantumOS.WindowManager.focus(appId);
        } else {
          QuantumOS.WindowManager.minimize(appId);
        }
      } else {
        if (QuantumOS.apps[appId]) QuantumOS.apps[appId].launch();
        else if (appId === 'trash') QuantumOS.apps.fileExplorer.launch('/Trash');
      }
    });

    // Magnification effect
    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      container.querySelectorAll('.dock-item').forEach(child => {
        const cRect = child.getBoundingClientRect();
        const cx = cRect.left + cRect.width / 2 - rect.left;
        const d = Math.abs(mx - cx);
        if (d < 120) {
          const scale = 1 + (1 - d / 120) * 0.3;
          child.style.transform = `scale(${scale})`;
          child.style.margin = `0 ${(scale - 1) * 8}px`;
        } else {
          child.style.transform = 'scale(1)';
          child.style.margin = '0 4px';
        }
      });
    });

    container.addEventListener('mouseleave', () => {
      container.querySelectorAll('.dock-item').forEach(child => {
        child.style.transform = 'scale(1)';
        child.style.margin = '0 4px';
      });
    });
  },
  bounce(appId) {
    const el = document.getElementById(`dock-${appId}`);
    if (el) {
      el.classList.add('bounce');
      setTimeout(() => el.classList.remove('bounce'), 1000);
    }
  },
  add(appId, icon = 'app-window', label = appId) {
    if (this.items.has(appId)) return;
    this.items.add(appId);
    const container = document.getElementById('dock-container');
    const item = document.createElement('div');
    item.className = 'dock-item';
    item.id = `dock-${appId}`;
    item.setAttribute('data-app', appId);
    item.innerHTML = `<i data-lucide="${icon}"></i><div class="dock-tooltip">${label}</div><div class="dock-indicator"></div>`;
    
    const trash = document.getElementById('dock-trash');
    if (trash) container.insertBefore(item, trash);
    else container.appendChild(item);
    
    if (typeof lucide !== 'undefined') lucide.createIcons({ attrs: { class: 'lucide-icon' } });
    this.updateIndicators();
  },
  remove(appId) {
    if (!this.items.has(appId)) return;
    this.items.delete(appId);
    const el = document.getElementById(`dock-${appId}`);
    if (el) el.remove();
  },
  updateIndicators() {
    this.items.forEach(appId => {
      const el = document.getElementById(`dock-${appId}`);
      if (!el) return;
      const isOpen = QuantumOS.WindowManager.windows.has(appId);
      const isActive = QuantumOS.WindowManager.activeWindowId === appId;
      const ind = el.querySelector('.dock-indicator');
      if (ind) {
        ind.className = 'dock-indicator' + (isActive ? ' running active' : isOpen ? ' running' : '');
      }
    });
  }
};

// 13. TASKBAR CONTROLLER
QuantumOS.TaskbarController = {
  init() {
    document.getElementById('start-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleStartMenu();
    });
    document.getElementById('search-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      QuantumOS.SearchSystem.toggle();
    });
    document.getElementById('tray-notifications').addEventListener('click', (e) => {
      e.stopPropagation();
      QuantumOS.NotificationSystem.toggleCenter();
    });
    document.getElementById('tray-clock').addEventListener('click', () => {
      QuantumOS.WidgetSystem.toggleCalendar();
    });

    this.clockUpdate();
    setInterval(() => this.clockUpdate(), 1000);
    this.systemTrayUpdate();
  },
  clockUpdate() {
    const tEl = document.getElementById('tray-clock-time');
    const dEl = document.getElementById('tray-clock-date');
    const now = new Date();
    if (tEl) tEl.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    if (dEl) dEl.innerText = now.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: 'numeric' });
  },
  syncRunningApps() {
    const container = document.getElementById('taskbar-apps');
    if (!container) return;
    container.innerHTML = '';

    QuantumOS.WindowManager.windows.forEach(win => {
      if (win.workspace !== QuantumOS.activeWorkspace) return;
      const btn = document.createElement('button');
      btn.className = 'taskbar-app-icon' + (win.id === QuantumOS.WindowManager.activeWindowId ? ' active' : '') + (win.isMinimized ? ' minimized' : '');
      btn.innerHTML = `<i data-lucide="${win.icon}"></i>`;
      btn.addEventListener('click', () => {
        if (win.isMinimized || QuantumOS.WindowManager.activeWindowId !== win.id) {
          QuantumOS.WindowManager.focus(win.id);
        } else {
          QuantumOS.WindowManager.minimize(win.id);
        }
      });
      container.appendChild(btn);
    });

    if (typeof lucide !== 'undefined') {
      lucide.createIcons({ attrs: { class: 'lucide-icon' } });
    }
    QuantumOS.DockController.updateIndicators();
  },
  toggleStartMenu() {
    const start = document.getElementById('start-menu');
    start.classList.toggle('hidden');
    if (!start.classList.contains('hidden')) {
      document.getElementById('start-search-input').value = '';
      QuantumOS.StartMenu.render();
    }
  },
  systemTrayUpdate() {
    const vol = document.getElementById('tray-volume');
    if (vol) {
      const v = QuantumOS.SettingsEngine.get('sound.volume');
      vol.innerHTML = v === 0 ? '<i data-lucide="volume-x"></i>' : v < 40 ? '<i data-lucide="volume-1"></i>' : '<i data-lucide="volume-2"></i>';
    }
    if (typeof lucide !== 'undefined') lucide.createIcons({ attrs: { class: 'lucide-icon' } });
  }
};

// 14. START MENU CONTROLLER
QuantumOS.StartMenu = {
  pinned: [
    { id: 'fileExplorer', name: 'File Explorer', icon: 'folder' },
    { id: 'browser', name: 'Browser', icon: 'globe' },
    { id: 'aiChat', name: 'AI Chat', icon: 'bot' },
    { id: 'settings', name: 'Settings', icon: 'settings' },
    { id: 'terminal', name: 'Terminal', icon: 'terminal' },
    { id: 'cloudGaming', name: 'Cloud Gaming', icon: 'gamepad-2' },
    { id: 'calculator', name: 'Calculator', icon: 'calculator' },
    { id: 'textEditor', name: 'Text Editor', icon: 'file-text' }
  ],
  init() {
    const input = document.getElementById('start-search-input');
    input.addEventListener('input', (e) => this.search(e.target.value));

    document.addEventListener('click', (e) => {
      const menu = document.getElementById('start-menu');
      if (!menu.classList.contains('hidden') && !menu.contains(e.target) && !document.getElementById('start-btn').contains(e.target)) {
        menu.classList.add('hidden');
      }
    });

    document.getElementById('start-power-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.showPowerDropdown(e.clientX, e.clientY);
    });
  },
  open() {
    document.getElementById('start-menu').classList.remove('hidden');
  },
  close() {
    document.getElementById('start-menu').classList.add('hidden');
  },
  toggle() {
    QuantumOS.TaskbarController.toggleStartMenu();
  },
  search(query) {
    const grid = document.getElementById('start-pinned-grid');
    grid.innerHTML = '';
    const filtered = this.pinned.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
    filtered.forEach(app => {
      const div = document.createElement('div');
      div.className = 'start-pinned-item';
      div.innerHTML = `<div class="start-pinned-icon"><i data-lucide="${app.icon}"></i></div><span>${app.name}</span>`;
      div.addEventListener('click', () => {
        this.close();
        QuantumOS.apps[app.id].launch();
      });
      grid.appendChild(div);
    });
    if (typeof lucide !== 'undefined') lucide.createIcons({ attrs: { class: 'lucide-icon' } });
  },
  render() {
    const grid = document.getElementById('start-pinned-grid');
    grid.innerHTML = '';
    this.pinned.forEach(app => {
      const div = document.createElement('div');
      div.className = 'start-pinned-item';
      div.innerHTML = `<div class="start-pinned-icon"><i data-lucide="${app.icon}"></i></div><span>${app.name}</span>`;
      div.addEventListener('click', () => {
        this.close();
        QuantumOS.apps[app.id].launch();
      });
      grid.appendChild(div);
    });

    const recList = document.getElementById('start-recommended-list');
    recList.innerHTML = '';
    const recs = [
      { name: 'welcome.txt', meta: 'Recent', icon: 'file-text', path: '/Desktop/welcome.txt' },
      { name: 'notes.txt', meta: 'Persisted', icon: 'file-text', path: '/Documents/notes.txt' }
    ];
    recs.forEach(r => {
      const div = document.createElement('div');
      div.className = 'start-recommended-item';
      div.innerHTML = `
        <div class="start-recommended-icon"><i data-lucide="${r.icon}"></i></div>
        <div class="start-recommended-info"><span class="start-recommended-name">${r.name}</span><span class="start-recommended-meta">${r.meta}</span></div>
      `;
      div.addEventListener('click', () => {
        this.close();
        QuantumOS.apps.textEditor.launch(r.path);
      });
      recList.appendChild(div);
    });

    if (typeof lucide !== 'undefined') lucide.createIcons({ attrs: { class: 'lucide-icon' } });
  },
  showPowerDropdown(x, y) {
    const old = document.getElementById('power-dropdown-ctx');
    if (old) old.remove();

    const div = document.createElement('div');
    div.id = 'power-dropdown-ctx';
    div.className = 'context-menu';
    div.style.left = `${x - 100}px`;
    div.style.top = `${y - 120}px`;
    div.innerHTML = `
      <div class="context-menu-item" id="power-opt-lock"><i data-lucide="lock"></i><span>Lock</span></div>
      <div class="context-menu-item" id="power-opt-logout"><i data-lucide="log-out"></i><span>Sign Out</span></div>
      <div class="context-menu-item" id="power-opt-restart"><i data-lucide="rotate-cw"></i><span>Restart</span></div>
    `;
    document.body.appendChild(div);
    if (typeof lucide !== 'undefined') lucide.createIcons({ attrs: { class: 'lucide-icon' } });

    const clean = () => {
      div.remove();
      document.removeEventListener('click', clean);
    };
    setTimeout(() => document.addEventListener('click', clean), 50);

    div.querySelector('#power-opt-lock').addEventListener('click', () => QuantumOS.BootSystem.lock());
    div.querySelector('#power-opt-logout').addEventListener('click', () => QuantumOS.BootSystem.logout());
    div.querySelector('#power-opt-restart').addEventListener('click', () => window.location.reload());
  }
};

// 15. WIDGET SYSTEM
QuantumOS.WidgetSystem = {
  widgets: ['widget-clock', 'widget-calendar', 'widget-sysmonitor', 'widget-notes', 'widget-quicklaunch'],
  calDate: new Date(),
  init() {
    this.loadLayout();
    this.initClock();
    this.initCalendar();
    this.initSysMonitor();
    this.initNotes();
    this.initQuickLaunch();

    this.widgets.forEach(id => {
      const el = document.getElementById(id);
      if (el) this.makeDraggable(el);
    });
  },
  initClock() {
    const update = () => {
      const time = document.getElementById('widget-clock-time');
      const date = document.getElementById('widget-clock-date');
      const tz = document.getElementById('widget-clock-timezone');
      const now = new Date();
      if (time) time.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      if (date) date.innerText = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      if (tz) tz.innerText = Intl.DateTimeFormat().resolvedOptions().timeZone;
    };
    update();
    setInterval(update, 1000);
  },
  initCalendar() {
    const prev = document.getElementById('calendar-prev-btn');
    const next = document.getElementById('calendar-next-btn');
    if (prev && next) {
      prev.addEventListener('click', () => {
        this.calDate.setMonth(this.calDate.getMonth() - 1);
        this.renderCalendar();
      });
      next.addEventListener('click', () => {
        this.calDate.setMonth(this.calDate.getMonth() + 1);
        this.renderCalendar();
      });
    }
    this.renderCalendar();
  },
  renderCalendar() {
    const title = document.getElementById('calendar-month-year');
    const days = document.getElementById('calendar-days');
    if (!title || !days) return;
    days.innerHTML = '';
    const yr = this.calDate.getFullYear();
    const mo = this.calDate.getMonth();
    const names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    title.innerText = `${names[mo]} ${yr}`;

    const start = new Date(yr, mo, 1).getDay();
    const count = new Date(yr, mo + 1, 0).getDate();

    for (let i = 0; i < start; i++) {
      const span = document.createElement('span');
      span.className = 'calendar-day empty';
      days.appendChild(span);
    }
    const today = new Date();
    for (let d = 1; d <= count; d++) {
      const span = document.createElement('span');
      span.className = 'calendar-day';
      span.innerText = d;
      if (d === today.getDate() && mo === today.getMonth() && yr === today.getFullYear()) {
        span.classList.add('today');
      }
      days.appendChild(span);
    }
  },
  toggleCalendar() {
    const cal = document.getElementById('widget-calendar');
    if (cal) {
      cal.style.animation = 'widgetFlash 0.5s ease 2';
      setTimeout(() => cal.style.animation = '', 1000);
      cal.classList.add('highlighted');
      setTimeout(() => cal.classList.remove('highlighted'), 1500);
    }
  },
  initSysMonitor() {
    const cFill = document.getElementById('sysmonitor-cpu-fill');
    const cText = document.getElementById('sysmonitor-cpu-text');
    const rFill = document.getElementById('sysmonitor-ram-fill');
    const rText = document.getElementById('sysmonitor-ram-text');

    const update = () => {
      const cpu = Math.floor(10 + Math.random() * 40);
      const ram = Math.floor(50 + Math.random() * 15);
      if (cFill) cFill.style.width = `${cpu}%`;
      if (cText) cText.innerText = `${cpu}%`;
      if (rFill) rFill.style.width = `${ram}%`;
      if (rText) rText.innerText = `${ram}%`;
    };
    update();
    setInterval(update, 3000);
  },
  initNotes() {
    const notes = document.getElementById('widget-notes-input');
    if (!notes) return;
    notes.value = QuantumOS.Storage.load('widget_notes') || '';
    notes.addEventListener('input', (e) => {
      QuantumOS.Storage.save('widget_notes', e.target.value);
    });
  },
  initQuickLaunch() {
    document.querySelectorAll('.quicklaunch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const app = btn.getAttribute('data-app');
        if (QuantumOS.apps[app]) QuantumOS.apps[app].launch();
      });
    });
  },
  makeDraggable(el) {
    const header = el.querySelector('.widget-header');
    if (!header) return;
    header.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const parent = el.parentElement.getBoundingClientRect();
      const ox = e.clientX - rect.left;
      const oy = e.clientY - rect.top;

      const onMouseMove = (moveEvent) => {
        let x = moveEvent.clientX - parent.left - ox;
        let y = moveEvent.clientY - parent.top - oy;
        x = Math.max(0, Math.min(parent.width - rect.width, x));
        y = Math.max(0, Math.min(parent.height - rect.height, y));
        el.style.position = 'absolute';
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
      };
      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        this.saveLayout();
      };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  },
  saveLayout() {
    const layout = {};
    this.widgets.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        layout[id] = { left: el.style.left, top: el.style.top, pos: el.style.position };
      }
    });
    QuantumOS.Storage.save('widgets_layout', layout);
  },
  loadLayout() {
    const layout = QuantumOS.Storage.load('widgets_layout');
    if (!layout) return;
    this.widgets.forEach(id => {
      const el = document.getElementById(id);
      if (el && layout[id]) {
        el.style.position = layout[id].pos || 'absolute';
        el.style.left = layout[id].left || '';
        el.style.top = layout[id].top || '';
      }
    });
  }
};

// 16. USER PROFILE SYSTEM
QuantumOS.UserSystem = {
  users: [
    { username: 'quantum', name: 'Quantum User', icon: 'user' },
    { username: 'guest', name: 'Guest User', icon: 'user' },
    { username: 'admin', name: 'Administrator', icon: 'shield' }
  ],
  selectedUser: 'quantum',
  async init() {
    const saved = await QuantumOS.Storage.loadDB('profiles', 'userList');
    if (saved) this.users = saved;
    else await QuantumOS.Storage.saveDB('profiles', 'userList', this.users);

    this.render();
    this.setupListeners();
  },
  render() {
    const container = document.getElementById('login-user-switcher');
    if (!container) return;
    container.innerHTML = '';
    this.users.forEach(u => {
      const active = u.username === this.selectedUser ? 'active' : '';
      const div = document.createElement('div');
      div.className = `switcher-user ${active}`;
      div.setAttribute('data-user', u.username);
      div.id = `switcher-user-${u.username}`;
      div.innerHTML = `
        <div class="switcher-avatar"><i data-lucide="${u.icon}"></i></div>
        <span>${u.name}</span>
      `;
      container.appendChild(div);
    });
    if (typeof lucide !== 'undefined') lucide.createIcons({ attrs: { class: 'lucide-icon' } });
  },
  setupListeners() {
    const container = document.getElementById('login-user-switcher');
    if (!container) return;
    container.addEventListener('click', (e) => {
      const item = e.target.closest('.switcher-user');
      if (item) this.switch(item.getAttribute('data-user'));
    });
  },
  switch(username) {
    const user = this.users.find(u => u.username === username);
    if (!user) return;
    this.selectedUser = username;

    this.users.forEach(u => {
      const el = document.getElementById(`switcher-user-${u.username}`);
      if (el) el.classList.toggle('active', u.username === username);
    });

    const name = document.getElementById('login-username');
    const avatar = document.getElementById('login-avatar');
    if (name) name.innerText = user.name;
    if (avatar) {
      avatar.innerHTML = `<i data-lucide="${user.icon}"></i>`;
      if (typeof lucide !== 'undefined') lucide.createIcons({ attrs: { class: 'lucide-icon' } });
    }
  },
  async create(username, name, icon = 'user') {
    if (this.users.some(u => u.username === username)) return false;
    this.users.push({ username, name, icon });
    await QuantumOS.Storage.saveDB('profiles', 'userList', this.users);
    this.render();
    return true;
  },
  async delete(username) {
    if (username === 'quantum') return false;
    this.users = this.users.filter(u => u.username !== username);
    if (this.selectedUser === username) this.switch('quantum');
    await QuantumOS.Storage.saveDB('profiles', 'userList', this.users);
    this.render();
    return true;
  },
  async updateAvatar(username, icon) {
    const user = this.users.find(u => u.username === username);
    if (!user) return false;
    user.icon = icon;
    await QuantumOS.Storage.saveDB('profiles', 'userList', this.users);
    this.render();
    if (this.selectedUser === username) this.switch(username);
    return true;
  }
};

// 17. KEYBOARD SHORTCUTS
QuantumOS.Shortcuts = {
  bindings: new Map(),
  init() {
    window.addEventListener('keydown', (e) => {
      const parts = [];
      if (e.ctrlKey) parts.push('Ctrl');
      if (e.altKey) parts.push('Alt');
      if (e.shiftKey) parts.push('Shift');
      if (!['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
        parts.push(e.key === ' ' ? 'Space' : e.key.toUpperCase());
      } else return;

      const combo = parts.join('+');
      if (this.bindings.has(combo)) {
        e.preventDefault();
        this.bindings.get(combo)(e);
      }
    });

    this.register('CTRL+SPACE', () => QuantumOS.SearchSystem.toggle());
    this.register('CTRL+ALT+T', () => QuantumOS.apps.terminal.launch());
    this.register('CTRL+ALT+E', () => QuantumOS.apps.fileExplorer.launch());
    this.register('CTRL+ALT+W', () => QuantumOS.WorkspaceManager.toggleOverview());
    this.register('CTRL+ALT+L', () => QuantumOS.BootSystem.lock());
    this.register('ALT+F4', () => {
      if (QuantumOS.WindowManager.activeWindowId) {
        QuantumOS.WindowManager.closeWindow(QuantumOS.WindowManager.activeWindowId);
      }
    });
  },
  register(combo, cb) {
    this.bindings.set(combo.toUpperCase(), cb);
  },
  unregister(combo) {
    this.bindings.delete(combo.toUpperCase());
  }
};

// 18. PARTICLE SYSTEM
QuantumOS.ParticleSystem = {
  canvas: null,
  ctx: null,
  particles: [],
  max: 60,
  dist: 100,
  mouse: { x: null, y: null, r: 120 },
  init() {
    this.canvas = document.getElementById('particle-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();

    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });

    this.max = QuantumOS.SettingsEngine.get('performance.maxParticles') || 60;
    this.create();
    this.animate();
  },
  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },
  create() {
    this.particles = [];
    const active = QuantumOS.SettingsEngine.get('performance.effectsEnabled');
    if (!active) return;
    for (let i = 0; i < this.max; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1
      });
    }
  },
  animate() {
    if (!this.canvas || !QuantumOS.state.loggedIn) {
      requestAnimationFrame(() => this.animate());
      return;
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (QuantumOS.SettingsEngine.get('performance.effectsEnabled')) {
      this.update();
      this.draw();
    }
    requestAnimationFrame(() => this.animate());
  },
  update() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < this.mouse.r) {
          const force = (this.mouse.r - d) / this.mouse.r;
          p.x += (dx / d) * force * 1.5;
          p.y += (dy / d) * force * 1.5;
        }
      }
    });
  },
  draw() {
    const len = this.particles.length;
    for (let i = 0; i < len; i++) {
      for (let j = i + 1; j < len; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < this.dist) {
          const alpha = (1 - d / this.dist) * 0.12;
          this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        }
      }
    }
    this.particles.forEach(p => {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }
};

// 19. INIT FUNCTION
async function initQuantumOS() {
  console.log("Quantum OS loading...");
  await QuantumOS.Storage.init();
  QuantumOS.SettingsEngine.init();
  QuantumOS.ThemeEngine.apply(QuantumOS.Storage.load('theme') || 'dark');
  await QuantumOS.FileSystem.init();
  await QuantumOS.UserSystem.init();
  QuantumOS.Shortcuts.init();

  QuantumOS.DesktopManager.init();
  QuantumOS.DockController.init();
  QuantumOS.TaskbarController.init();
  QuantumOS.StartMenu.init();
  QuantumOS.SearchSystem.init();
  QuantumOS.WorkspaceManager.init();

  QuantumOS.BootSystem.init();

  // Wire up Login password Submit
  const submit = document.getElementById('login-submit');
  const passwordInput = document.getElementById('login-password');
  const attemptLogin = async () => {
    const user = QuantumOS.UserSystem.selectedUser;
    const pwd = passwordInput ? passwordInput.value : '';
    await QuantumOS.BootSystem.login(user, pwd);
  };
  if (submit) submit.addEventListener('click', attemptLogin);
  if (passwordInput) {
    passwordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') attemptLogin();
    });
  }

  // Cloud game modal close
  const gameClose = document.getElementById('cloud-game-modal-close');
  if (gameClose) {
    gameClose.addEventListener('click', () => {
      document.getElementById('cloud-game-modal').classList.add('hidden');
    });
  }

  // Notifications slider handlers
  const volRange = document.getElementById('qs-volume');
  const volVal = document.getElementById('qs-volume-value');
  if (volRange && volVal) {
    volRange.addEventListener('input', (e) => {
      volVal.innerText = `${e.target.value}%`;
      QuantumOS.SettingsEngine.set('sound.volume', parseInt(e.target.value));
      QuantumOS.TaskbarController.systemTrayUpdate();
    });
  }
  const brightRange = document.getElementById('qs-brightness');
  const brightVal = document.getElementById('qs-brightness-value');
  if (brightRange && brightVal) {
    brightRange.addEventListener('input', (e) => {
      brightVal.innerText = `${e.target.value}%`;
      document.body.style.filter = `brightness(${0.4 + (e.target.value / 100) * 0.6})`;
    });
  }

  const clearAllBtn = document.getElementById('notification-clear-all');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => QuantumOS.NotificationSystem.clear());
  }

  const qsTiles = document.querySelectorAll('.quick-setting-tile');
  qsTiles.forEach(tile => {
    tile.addEventListener('click', () => {
      tile.classList.toggle('active');
      const label = tile.querySelector('span').innerText;
      QuantumOS.NotificationSystem.showToast(`${label} toggled`);
    });
  });

  console.log("Quantum OS operational.");
}

// 20. SYSTEM DEFAULT APPLICATION LAUNCHERS
QuantumOS.apps = {
  fileExplorer: {
    launch(path = '/Desktop') {
      QuantumOS.WindowManager.createWindow({
        id: 'fileExplorer',
        title: 'File Explorer',
        icon: 'folder',
        content: `
          <div class="app-fileexplorer-container">
            <div class="explorer-toolbar" style="display:flex; gap:10px; padding:10px; border-bottom:1px solid var(--border);">
              <button class="explorer-btn btn-back" style="padding:4px 8px; background:var(--glass-bg); border-radius:4px;"><i data-lucide="arrow-left"></i></button>
              <input type="text" class="explorer-path-bar" style="flex:1; padding:4px 8px; background:var(--glass-bg); border-radius:4px;" value="${path}" readonly />
              <button class="explorer-btn btn-new-folder" style="padding:4px 8px; background:var(--glass-bg); border-radius:4px;"><i data-lucide="folder-plus"></i></button>
            </div>
            <div class="explorer-layout" style="display:flex; height:calc(100% - 50px);">
              <aside class="explorer-sidebar" style="width:150px; border-right:1px solid var(--border); padding:10px;">
                <ul style="display:flex; flex-direction:column; gap:8px;">
                  <li data-nav="/Desktop" style="cursor:pointer;"><i data-lucide="monitor"></i> Desktop</li>
                  <li data-nav="/Documents" style="cursor:pointer;"><i data-lucide="file-text"></i> Documents</li>
                  <li data-nav="/Downloads" style="cursor:pointer;"><i data-lucide="download"></i> Downloads</li>
                  <li data-nav="/Trash" style="cursor:pointer;"><i data-lucide="trash-2"></i> Trash</li>
                </ul>
              </aside>
              <main class="explorer-grid" style="flex:1; padding:15px; display:grid; grid-template-columns:repeat(auto-fill, 70px); grid-template-rows:repeat(auto-fill, 80px); gap:15px; overflow-y:auto;"></main>
            </div>
          </div>
        `
      });
      this.initDOM('fileExplorer', path);
    },
    initDOM(winId, path) {
      const win = document.getElementById(`window-${winId}`);
      if (!win) return;
      const grid = win.querySelector('.explorer-grid');
      const bar = win.querySelector('.explorer-path-bar');
      const back = win.querySelector('.btn-back');
      const newF = win.querySelector('.btn-new-folder');
      const sidebar = win.querySelectorAll('.explorer-sidebar li');
      let cur = path;
      const history = [];

      const render = () => {
        grid.innerHTML = '';
        bar.value = cur;
        const list = QuantumOS.FileSystem.list(cur);
        if (list.length === 0) grid.innerHTML = '<div style="grid-column:1/-1; opacity:0.5;">Empty Folder</div>';
        
        list.forEach(f => {
          const div = document.createElement('div');
          div.className = 'explorer-item';
          div.style.cssText = 'display:flex; flex-direction:column; align-items:center; cursor:pointer; font-size:11px; text-align:center;';
          const icon = f.type === 'directory' ? 'folder' : QuantumOS.DesktopManager.getFileIcon(f.name);
          div.innerHTML = `<i data-lucide="${icon}" style="width:36px; height:36px; margin-bottom:5px;"></i><span style="display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${f.name}</span>`;
          div.addEventListener('dblclick', () => {
            if (f.type === 'directory') {
              history.push(cur);
              cur = (cur === '/' ? '' : cur) + '/' + f.name;
              render();
            } else {
              QuantumOS.apps.textEditor.launch((cur === '/' ? '' : cur) + '/' + f.name);
            }
          });
          grid.appendChild(div);
        });

        if (typeof lucide !== 'undefined') lucide.createIcons({ attrs: { class: 'lucide-icon' } });
      };

      back.addEventListener('click', () => {
        if (history.length > 0) {
          cur = history.pop();
          render();
        }
      });
      sidebar.forEach(li => {
        li.addEventListener('click', () => {
          history.push(cur);
          cur = li.getAttribute('data-nav');
          render();
        });
      });
      newF.addEventListener('click', () => {
        let name = 'New Folder', idx = 1;
        while (QuantumOS.FileSystem.get((cur === '/' ? '' : cur) + '/' + name)) name = `New Folder (${idx++})`;
        QuantumOS.FileSystem.createFolder(cur, name);
        render();
      });
      render();
    }
  },
  browser: {
    launch() {
      QuantumOS.WindowManager.createWindow({
        id: 'browser',
        title: 'Web Browser',
        icon: 'globe',
        content: `
          <div class="app-browser-container" style="height:100%; display:flex; flex-direction:column;">
            <div style="display:flex; gap:8px; padding:10px; border-bottom:1px solid var(--border);">
              <input type="text" class="browser-address-bar" style="flex:1; padding:4px 8px; background:var(--glass-bg); border-radius:4px;" value="https://wikipedia.org" />
              <button class="btn-go" style="padding:4px 12px; background:var(--glass-bg); border-radius:4px;">Go</button>
            </div>
            <iframe class="browser-iframe" style="flex:1; border:none;" src="about:blank"></iframe>
          </div>
        `
      });
      const win = document.getElementById('window-browser');
      if (win) {
        const bar = win.querySelector('.browser-address-bar');
        const frame = win.querySelector('.browser-iframe');
        const go = win.querySelector('.btn-go');
        const load = () => {
          let url = bar.value.trim();
          if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
          bar.value = url;
          frame.src = url;
        };
        go.addEventListener('click', load);
        bar.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') load();
        });
        load();
      }
    }
  },
  aiChat: {
    launch() {
      QuantumOS.WindowManager.createWindow({
        id: 'aiChat',
        title: 'AI Assistant',
        icon: 'bot',
        content: `
          <div class="app-aichat-container" style="height:100%; display:flex; flex-direction:column; padding:10px;">
            <div class="chat-messages" style="flex:1; overflow-y:auto; margin-bottom:10px; display:flex; flex-direction:column; gap:8px;">
              <div style="padding:8px; background:var(--glass-bg); border-radius:6px; max-width:80%;">Hello! I can help you change themes (e.g. glass, amoled), create files, or explain Quantum OS.</div>
            </div>
            <div style="display:flex; gap:8px;">
              <input type="text" class="chat-input" style="flex:1; padding:6px 12px; background:var(--glass-bg); border-radius:6px;" placeholder="Ask anything..." />
              <button class="chat-send" style="padding:6px 16px; background:var(--glass-bg); border-radius:6px;">Send</button>
            </div>
          </div>
        `
      });
      const win = document.getElementById('window-aiChat');
      if (win) {
        const input = win.querySelector('.chat-input');
        const send = win.querySelector('.chat-send');
        const msgs = win.querySelector('.chat-messages');
        const handle = () => {
          const val = input.value.trim();
          if (!val) return;
          const uDiv = document.createElement('div');
          uDiv.style.cssText = 'padding:8px; background:rgba(255,255,255,0.15); border-radius:6px; max-width:80%; align-self:flex-end;';
          uDiv.innerText = val;
          msgs.appendChild(uDiv);
          input.value = '';
          msgs.scrollTop = msgs.scrollHeight;

          setTimeout(() => {
            const bDiv = document.createElement('div');
            bDiv.style.cssText = 'padding:8px; background:var(--glass-bg); border-radius:6px; max-width:80%;';
            const q = val.toLowerCase();
            if (q.includes('theme') || q.includes('dark') || q.includes('light')) {
              bDiv.innerText = "I can apply themes. Try typing: ThemeEngine.apply('amoled') in the terminal, or use the Settings app.";
            } else if (q.includes('folder') || q.includes('file')) {
              bDiv.innerText = "Use the File Explorer, or touch/mkdir commands in Terminal to orchestrate files.";
            } else {
              bDiv.innerText = `You asked: "${val}". Let me know how else I can support your workspace operations.`;
            }
            msgs.appendChild(bDiv);
            msgs.scrollTop = msgs.scrollHeight;
          }, 600);
        };
        send.addEventListener('click', handle);
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') handle();
        });
      }
    }
  },
  settings: {
    launch(category = 'appearance') {
      QuantumOS.WindowManager.createWindow({
        id: 'settings',
        title: 'Settings',
        icon: 'settings',
        content: `
          <div class="app-settings-container" style="display:flex; height:100%;">
            <aside style="width:140px; border-right:1px solid var(--border); padding:10px;">
              <ul style="display:flex; flex-direction:column; gap:8px;">
                <li data-cat="appearance" style="cursor:pointer;">Appearance</li>
                <li data-cat="desktop" style="cursor:pointer;">Desktop</li>
                <li data-cat="performance" style="cursor:pointer;">Performance</li>
                <li data-cat="about" style="cursor:pointer;">About</li>
              </ul>
            </aside>
            <main class="settings-body" style="flex:1; padding:20px;"></main>
          </div>
        `
      });
      this.initDOM(category);
    },
    initDOM(category) {
      const win = document.getElementById('window-settings');
      if (!win) return;
      const body = win.querySelector('.settings-body');
      const side = win.querySelectorAll('aside li');

      const render = (cat) => {
        body.innerHTML = '';
        if (cat === 'appearance') {
          body.innerHTML = `
            <h3>Appearance</h3>
            <div style="margin-top:15px;">
              <label>System Theme: </label>
              <select id="set-theme" style="padding:4px; background:var(--bg3); border:1px solid var(--border); color:inherit;">
                ${QuantumOS.ThemeEngine.themes.map(t => `<option value="${t}" ${QuantumOS.ThemeEngine.current === t ? 'selected' : ''}>${t}</option>`).join('')}
              </select>
            </div>
          `;
          body.querySelector('#set-theme').addEventListener('change', (e) => {
            QuantumOS.ThemeEngine.apply(e.target.value);
            QuantumOS.NotificationSystem.showToast(`Applied ${e.target.value} theme`);
          });
        } else if (cat === 'desktop') {
          body.innerHTML = `
            <h3>Desktop</h3>
            <div style="margin-top:15px;">
              <label><input type="checkbox" id="set-show-icons" ${QuantumOS.SettingsEngine.get('desktop.showIcons') ? 'checked' : ''} /> Show Desktop Icons</label>
            </div>
          `;
          body.querySelector('#set-show-icons').addEventListener('change', (e) => {
            QuantumOS.SettingsEngine.set('desktop.showIcons', e.target.checked);
            document.getElementById('desktop-icons').style.display = e.target.checked ? 'grid' : 'none';
          });
        } else if (cat === 'performance') {
          body.innerHTML = `
            <h3>Performance</h3>
            <div style="margin-top:15px;">
              <label><input type="checkbox" id="set-effects" ${QuantumOS.SettingsEngine.get('performance.effectsEnabled') ? 'checked' : ''} /> Background Particles</label>
            </div>
          `;
          body.querySelector('#set-effects').addEventListener('change', (e) => {
            QuantumOS.SettingsEngine.set('performance.effectsEnabled', e.target.checked);
            QuantumOS.ParticleSystem.create();
          });
        } else {
          body.innerHTML = `
            <h3>About Quantum OS</h3>
            <p style="margin-top:15px;">Version: ${QuantumOS.version}</p>
            <p>Premium dark glass aesthetics build using pure JavaScript.</p>
          `;
        }
      };

      side.forEach(li => {
        li.addEventListener('click', () => render(li.getAttribute('data-cat')));
      });
      render(category);
    }
  },
  terminal: {
    launch() {
      QuantumOS.WindowManager.createWindow({
        id: 'terminal',
        title: 'Console Terminal',
        icon: 'terminal',
        content: `
          <div class="app-terminal-container" style="height:100%; display:flex; flex-direction:column; padding:10px; font-family:monospace; background:#000;">
            <div class="terminal-output" style="flex:1; overflow-y:auto; margin-bottom:5px; white-space:pre-wrap;">Quantum Console [v${QuantumOS.version}]\nType "help" for commands.\n\n</div>
            <div style="display:flex;">
              <span>&gt;&nbsp;</span>
              <input type="text" class="terminal-input" style="flex:1; background:transparent; border:none; color:#fff; font-family:monospace;" autofocus />
            </div>
          </div>
        `
      });
      const win = document.getElementById('window-terminal');
      if (win) {
        const input = win.querySelector('.terminal-input');
        const output = win.querySelector('.terminal-output');
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            const val = input.value.trim();
            if (!val) return;
            output.innerText += `> ${val}\n`;
            const reply = this.exec(val);
            output.innerText += `${reply}\n\n`;
            input.value = '';
            output.scrollTop = output.scrollHeight;
          }
        });
      }
    },
    exec(cmd) {
      const parts = cmd.split(' ');
      const op = parts[0].toLowerCase();
      switch (op) {
        case 'help':
          return 'Commands:\n - help: Help menu\n - theme [theme]: Change theme\n - ls: List desktop files\n - touch [file]: Create file\n - clear: Clear screen';
        case 'clear':
          const win = document.getElementById('window-terminal');
          if (win) win.querySelector('.terminal-output').innerText = '';
          return 'Console cleared';
        case 'ls':
          const list = QuantumOS.FileSystem.list('/Desktop');
          return list.map(f => `${f.type === 'directory' ? '[DIR]' : '[FILE]'} ${f.name}`).join('\n') || 'Desktop empty.';
        case 'touch':
          if (!parts[1]) return 'Touch requires a filename';
          QuantumOS.FileSystem.createFile('/Desktop', parts[1], '');
          QuantumOS.DesktopManager.renderIcons();
          return `Created ${parts[1]} on Desktop`;
        case 'theme':
          if (!parts[1]) return `Current theme: ${QuantumOS.ThemeEngine.current}`;
          const res = QuantumOS.ThemeEngine.apply(parts[1]);
          return res ? `Switched to ${parts[1]}` : `Invalid theme: ${parts[1]}`;
        default:
          return `Command not found: "${op}"`;
      }
    }
  },
  cloudGaming: {
    launch() {
      QuantumOS.WindowManager.createWindow({
        id: 'cloudGaming',
        title: 'Cloud Games',
        icon: 'gamepad-2',
        content: `
          <div style="padding:15px;">
            <h3>Quantum Arcade</h3>
            <div style="display:flex; gap:15px; margin-top:15px;">
              <div class="game-card" data-title="Doom Classic" data-dev="id Software" data-img="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=300" style="cursor:pointer; border:1px solid var(--border); padding:8px; border-radius:6px;">
                <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=300" style="width:120px; height:80px; object-fit:cover; border-radius:4px; margin-bottom:5px;" />
                <div>Doom Classic</div>
              </div>
              <div class="game-card" data-title="Retro Pacman" data-dev="Namco" data-img="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=300" style="cursor:pointer; border:1px solid var(--border); padding:8px; border-radius:6px;">
                <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=300" style="width:120px; height:80px; object-fit:cover; border-radius:4px; margin-bottom:5px;" />
                <div>Retro Pacman</div>
              </div>
            </div>
          </div>
        `
      });
      const win = document.getElementById('window-cloudGaming');
      if (win) {
        win.querySelectorAll('.game-card').forEach(card => {
          card.addEventListener('click', () => {
            const title = card.getAttribute('data-title');
            const dev = card.getAttribute('data-dev');
            const img = card.getAttribute('data-img');
            document.getElementById('cloud-game-modal-title').innerText = title;
            document.getElementById('cloud-game-modal-name').innerText = dev;
            document.getElementById('cloud-game-modal-image').src = img;
            document.getElementById('cloud-game-modal').classList.remove('hidden');
          });
        });
      }
    }
  },
  calculator: {
    launch() {
      QuantumOS.WindowManager.createWindow({
        id: 'calculator',
        title: 'Calculator',
        icon: 'calculator',
        content: `
          <div style="padding:15px; display:flex; flex-direction:column; gap:8px;">
            <input type="text" class="calc-display" style="padding:8px; text-align:right; font-size:16px; background:var(--bg3); color:#fff; border:1px solid var(--border);" value="0" readonly />
            <div class="calc-buttons" style="display:grid; grid-template-columns:repeat(4,1fr); gap:6px;">
              <button style="padding:8px; background:var(--glass-bg);">C</button>
              <button style="padding:8px; background:var(--glass-bg);">/</button>
              <button style="padding:8px; background:var(--glass-bg);">*</button>
              <button style="padding:8px; background:var(--glass-bg);">-</button>
              <button style="padding:8px; background:var(--glass-bg);">7</button>
              <button style="padding:8px; background:var(--glass-bg);">8</button>
              <button style="padding:8px; background:var(--glass-bg);">9</button>
              <button style="padding:8px; background:var(--glass-bg);">+</button>
              <button style="padding:8px; background:var(--glass-bg);">4</button>
              <button style="padding:8px; background:var(--glass-bg);">5</button>
              <button style="padding:8px; background:var(--glass-bg);">6</button>
              <button style="padding:8px; background:var(--glass-bg);">=</button>
              <button style="padding:8px; background:var(--glass-bg);">1</button>
              <button style="padding:8px; background:var(--glass-bg);">2</button>
              <button style="padding:8px; background:var(--glass-bg);">3</button>
              <button style="padding:8px; background:var(--glass-bg);">0</button>
            </div>
          </div>
        `,
        w: 240,
        h: 300
      });
      const win = document.getElementById('window-calculator');
      if (win) {
        const display = win.querySelector('.calc-display');
        let expr = '';
        win.querySelectorAll('.calc-buttons button').forEach(btn => {
          btn.addEventListener('click', () => {
            const val = btn.innerText;
            if (val === 'C') {
              expr = ''; display.value = '0';
            } else if (val === '=') {
              try {
                const cleanExpr = expr.replace(/[^0-9+\-*/.]/g, '');
                const res = Function(`"use strict"; return (${cleanExpr})`)();
                display.value = res;
                expr = String(res);
              } catch (e) {
                display.value = 'Error'; expr = '';
              }
            } else {
              if (expr === '' && !isNaN(val)) expr = val;
              else expr += val;
              display.value = expr;
            }
          });
        });
      }
    }
  },
  textEditor: {
    launch(filePath = '') {
      const title = filePath ? filePath.split('/').pop() : 'Untitled.txt';
      const id = 'textEditor_' + Math.random().toString(36).substr(2, 9);
      QuantumOS.WindowManager.createWindow({
        id: id,
        title: `Text Editor - ${title}`,
        icon: 'file-text',
        content: `
          <div style="height:100%; display:flex; flex-direction:column;">
            <div style="padding:6px 12px; border-bottom:1px solid var(--border);">
              <button class="btn-save" style="padding:4px 10px; background:var(--glass-bg); border-radius:4px;"><i data-lucide="save"></i> Save</button>
            </div>
            <textarea class="editor-area" style="flex:1; padding:10px; background:transparent; border:none; resize:none; color:inherit; font-family:inherit; outline:none;"></textarea>
          </div>
        `
      });

      const win = document.getElementById(`window-${id}`);
      if (win) {
        const txt = win.querySelector('.editor-area');
        const save = win.querySelector('.btn-save');
        let target = filePath;
        if (target) {
          const file = QuantumOS.FileSystem.get(target);
          if (file) txt.value = file.content || '';
        }

        save.addEventListener('click', () => {
          if (!target) {
            let name = prompt("Filename:", "note.txt");
            if (!name) return;
            target = `/Desktop/${name}`;
            QuantumOS.FileSystem.createFile('/Desktop', name, txt.value);
            win.querySelector('.window-title span').innerText = `Text Editor - ${name}`;
          } else {
            const f = QuantumOS.FileSystem.get(target);
            if (f) {
              f.content = txt.value;
              f.updatedAt = Date.now();
              QuantumOS.FileSystem.save();
            }
          }
          QuantumOS.DesktopManager.renderIcons();
          QuantumOS.NotificationSystem.showToast('Saved successfully');
        });

        if (typeof lucide !== 'undefined') lucide.createIcons({ attrs: { class: 'lucide-icon' } });
      }
    }
  },
  musicPlayer: {
    launch() {
      QuantumOS.WindowManager.createWindow({
        id: 'musicPlayer',
        title: 'Music Player',
        icon: 'music',
        content: `
          <div style="padding:15px; display:flex; flex-direction:column; gap:12px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <div style="width:48px; height:48px; background:var(--glass-bg); border-radius:6px; display:flex; align-items:center; justify-content:center;"><i data-lucide="music"></i></div>
              <div>
                <strong>Ambient Dreams</strong><br/>
                <span style="opacity:0.6; font-size:11px;">Synthesizer Ensemble</span>
              </div>
            </div>
            <div style="display:flex; justify-content:center; gap:15px; margin:10px 0;">
              <button><i data-lucide="skip-back"></i></button>
              <button class="btn-play"><i data-lucide="play"></i></button>
              <button><i data-lucide="skip-forward"></i></button>
            </div>
          </div>
        `
      });
      const win = document.getElementById('window-musicPlayer');
      if (win) {
        const btn = win.querySelector('.btn-play');
        let play = false;
        btn.addEventListener('click', () => {
          play = !play;
          btn.innerHTML = play ? '<i data-lucide="pause"></i>' : '<i data-lucide="play"></i>';
          if (typeof lucide !== 'undefined') lucide.createIcons({ attrs: { class: 'lucide-icon' } });
          QuantumOS.NotificationSystem.showToast(play ? 'Music started' : 'Music paused');
        });
      }
    }
  }
};

// Trigger Initialization
document.addEventListener('DOMContentLoaded', () => {
  initQuantumOS();
});
