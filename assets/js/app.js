(() => {
  'use strict';

  const DESIGN_WIDTH = 2560;
  const DESIGN_HEIGHT = 1440;
  const PASSWORD = '18817962338';
  const screen = document.getElementById('screen');
  const passwordGate = document.getElementById('passwordGate');
  const passwordForm = document.getElementById('passwordForm');
  const passwordInput = document.getElementById('passwordInput');
  const passwordVisibility = document.getElementById('passwordVisibility');
  const controls = Object.fromEntries([
    'sidebar', 'monitorTab', 'eventTab', 'parameterTab', 'mapPrev', 'mapNext',
    'faultEvent', 'language', 'theme', 'parameterQuery', 'parameterBack'
  ].map(id => [id, document.getElementById(id)]));

  const state = {
    language: 'en',
    theme: 'light',
    page: 'monitor',
    parameterView: 'main',
    mapView: 'satellite',
    sidebarOpen: true
  };
  const mapViews = ['satellite', 'network', 'operation'];
  let assetsReady = false;
  let preloadPromise = null;
  const preloadCache = [];

  function imagePath() {
    const sidebar = state.sidebarOpen ? 'unfold' : 'fold';
    let view = state.mapView;
    if (state.page === 'event') view = 'event';
    if (state.page === 'parameter') view = `parameter-${state.parameterView}`;
    return `assets/images/${state.language}-${state.theme}-${view}-${sidebar}.png`;
  }

  function allImagePaths() {
    const paths = [];
    for (const language of ['en', 'cn']) {
      for (const theme of ['light', 'dark']) {
        for (const sidebar of ['unfold', 'fold']) {
          for (const view of ['satellite', 'network', 'operation', 'event', 'parameter-main', 'parameter-result']) {
            paths.push(`assets/images/${language}-${theme}-${view}-${sidebar}.png`);
          }
        }
      }
    }
    return paths;
  }

  function preloadAllImages() {
    if (preloadPromise) return preloadPromise;
    const paths = allImagePaths();
    preloadPromise = Promise.all(paths.map((path, index) => new Promise(resolve => {
      const image = new Image();
      image.decoding = 'async';
      image.fetchPriority = index === 0 ? 'high' : 'low';
      preloadCache.push(image);
      const done = () => resolve();
      image.onload = done;
      image.onerror = done;
      image.src = path;
    }))).then(() => { assetsReady = true; });
    return preloadPromise;
  }

  function bounds() {
    const tabStart = state.sidebarOpen ? 216 : 70;
    const shift = state.sidebarOpen ? 0 : -56;
    return {
      sidebar: [0, 0, 70, 70],
      monitorTab: [tabStart, 0, 215, 70],
      eventTab: [tabStart + 215, 0, 217, 70],
      parameterTab: [tabStart + 432, 0, 218, 70],
      mapPrev: [1835, 445, 43, 65],
      mapNext: [1878, 445, 43, 65],
      faultEvent: [2465, 330, 75, 120],
      language: [2400, 0, 50, 70],
      theme: [2450, 0, 50, 70],
      parameterQuery: [1870 + shift, 188, 64, 32],
      parameterBack: [1504 + shift, 168, 116, 32]
    };
  }

  function setControlActive(name, active) {
    controls[name].style.display = active ? 'block' : 'none';
    controls[name].style.pointerEvents = active ? 'auto' : 'none';
  }

  function layout() {
    const scale = Math.min(innerWidth / DESIGN_WIDTH, innerHeight / DESIGN_HEIGHT);
    const offsetX = (innerWidth - DESIGN_WIDTH * scale) / 2;
    const offsetY = (innerHeight - DESIGN_HEIGHT * scale) / 2;
    Object.assign(screen.style, {
      left: `${offsetX}px`,
      top: `${offsetY}px`,
      width: `${DESIGN_WIDTH * scale}px`,
      height: `${DESIGN_HEIGHT * scale}px`
    });
    Object.entries(bounds()).forEach(([name, [x, y, width, height]]) => {
      Object.assign(controls[name].style, {
        left: `${offsetX + x * scale}px`,
        top: `${offsetY + y * scale}px`,
        width: `${width * scale}px`,
        height: `${height * scale}px`
      });
    });
  }

  function render() {
    screen.src = imagePath();
    document.documentElement.dataset.theme = state.theme;
    const monitoring = state.page === 'monitor';
    setControlActive('mapPrev', monitoring);
    setControlActive('mapNext', monitoring);
    setControlActive('faultEvent', monitoring);
    setControlActive('parameterQuery', state.page === 'parameter' && state.parameterView === 'main');
    setControlActive('parameterBack', state.page === 'parameter' && state.parameterView === 'result');
    layout();
  }

  function switchPage(page) {
    state.page = page;
    if (page === 'parameter') state.parameterView = 'main';
    render();
  }

  passwordForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (passwordInput.value !== PASSWORD) {
      passwordInput.select();
      return;
    }
    passwordInput.disabled = true;
    passwordInput.value = '';
    passwordInput.placeholder = assetsReady ? 'Ready' : 'Loading…';
    await preloadAllImages();
    render();
    await screen.decode().catch(() => {});
    passwordGate.classList.add('is-hidden');
    passwordGate.setAttribute('aria-hidden', 'true');
  });

  passwordVisibility.addEventListener('click', () => {
    const visible = passwordInput.type === 'text';
    passwordInput.type = visible ? 'password' : 'text';
    passwordVisibility.textContent = visible ? '◉' : '◌';
    passwordVisibility.setAttribute('aria-label', visible ? 'Show password' : 'Hide password');
  });

  controls.sidebar.addEventListener('click', () => { state.sidebarOpen = !state.sidebarOpen; render(); });
  controls.monitorTab.addEventListener('click', () => switchPage('monitor'));
  controls.eventTab.addEventListener('click', () => switchPage('event'));
  controls.parameterTab.addEventListener('click', () => switchPage('parameter'));
  controls.faultEvent.addEventListener('click', () => switchPage('event'));
  controls.parameterQuery.addEventListener('click', () => { state.parameterView = 'result'; render(); });
  controls.parameterBack.addEventListener('click', () => { state.parameterView = 'main'; render(); });

  controls.mapPrev.addEventListener('click', () => {
    const index = mapViews.indexOf(state.mapView);
    state.mapView = mapViews[(index + mapViews.length - 1) % mapViews.length];
    render();
  });
  controls.mapNext.addEventListener('click', () => {
    const index = mapViews.indexOf(state.mapView);
    state.mapView = mapViews[(index + 1) % mapViews.length];
    render();
  });
  controls.language.addEventListener('click', () => { state.language = state.language === 'en' ? 'cn' : 'en'; render(); });
  controls.theme.addEventListener('click', () => { state.theme = state.theme === 'light' ? 'dark' : 'light'; render(); });

  addEventListener('resize', layout);
  document.documentElement.dataset.theme = state.theme;
  layout();
  preloadAllImages();
})();
