(() => {
  'use strict';

  const DESIGN_WIDTH = 10240;
  const DESIGN_HEIGHT = 5760;
  const screen = document.getElementById('screen');
  const passwordGate = document.getElementById('passwordGate');
  const passwordForm = document.getElementById('passwordForm');
  const passwordInput = document.getElementById('passwordInput');
  const passwordVisibility = document.getElementById('passwordVisibility');
  const controls = {
    sidebar: document.getElementById('sidebar'),
    monitorTab: document.getElementById('monitorTab'),
    eventTab: document.getElementById('eventTab'),
    mapPrev: document.getElementById('mapPrev'),
    mapNext: document.getElementById('mapNext'),
    faultEvent: document.getElementById('faultEvent'),
    language: document.getElementById('language'),
    theme: document.getElementById('theme')
  };

  let language = 'en';
  let theme = 'light';
  let page = 'monitor';
  let mapView = 'satellite';
  let sidebarOpen = true;
  const mapViews = ['satellite', 'network', 'operation'];

  const bounds = {
    sidebar: [0, 0, 520, 700],
    monitorTab: [865, 0, 865, 300],
    eventTab: [1730, 0, 865, 300],
    mapPrev: [7350, 1830, 120, 180],
    mapNext: [7480, 1830, 120, 180],
    faultEvent: [9900, 1370, 270, 360],
    language: [9660, 40, 100, 200],
    theme: [9840, 40, 100, 200]
  };

  function imagePath() {
    const view = page === 'event' ? 'event' : mapView;
    const sidebar = sidebarOpen ? 'unfold' : 'fold';
    return `assets/images/${language}-${theme}-${view}-${sidebar}.png`;
  }

  function setControlActive(name, active) {
    const control = controls[name];
    control.style.pointerEvents = active ? 'auto' : 'none';
    control.style.display = active ? 'block' : 'none';
  }

  function layout() {
    const scale = window.innerHeight / DESIGN_HEIGHT;
    const offsetX = (window.innerWidth - DESIGN_WIDTH * scale) / 2;
    Object.entries(bounds).forEach(([name, rect]) => {
      const control = controls[name];
      control.style.left = `${offsetX + rect[0] * scale}px`;
      control.style.top = `${rect[1] * scale}px`;
      control.style.width = `${rect[2] * scale}px`;
      control.style.height = `${rect[3] * scale}px`;
    });
  }

  function render() {
    screen.src = imagePath();
    document.documentElement.dataset.theme = theme;
    const monitoring = page === 'monitor';
    setControlActive('mapPrev', monitoring);
    setControlActive('mapNext', monitoring);
    setControlActive('faultEvent', monitoring);
    layout();
  }

  passwordForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (passwordInput.value === '18817962338') {
      passwordGate.classList.add('is-hidden');
      passwordInput.value = '';
    } else {
      passwordInput.select();
    }
  });

  passwordVisibility.addEventListener('click', () => {
    const visible = passwordInput.type === 'text';
    passwordInput.type = visible ? 'password' : 'text';
    passwordVisibility.textContent = visible ? '◉' : '◌';
    passwordVisibility.setAttribute('aria-label', visible ? 'Show password' : 'Hide password');
  });

  controls.sidebar.addEventListener('click', () => {
    sidebarOpen = !sidebarOpen;
    render();
  });

  controls.monitorTab.addEventListener('click', () => {
    page = 'monitor';
    render();
  });

  controls.eventTab.addEventListener('click', () => {
    page = 'event';
    render();
  });

  controls.mapPrev.addEventListener('click', () => {
    const index = mapViews.indexOf(mapView);
    mapView = mapViews[(index + mapViews.length - 1) % mapViews.length];
    render();
  });

  controls.mapNext.addEventListener('click', () => {
    const index = mapViews.indexOf(mapView);
    mapView = mapViews[(index + 1) % mapViews.length];
    render();
  });

  controls.faultEvent.addEventListener('click', () => {
    page = 'event';
    render();
  });

  controls.language.addEventListener('click', (event) => {
    event.stopPropagation();
    language = language === 'en' ? 'cn' : 'en';
    render();
  });

  controls.theme.addEventListener('click', (event) => {
    event.stopPropagation();
    theme = theme === 'light' ? 'dark' : 'light';
    render();
  });

  window.addEventListener('resize', layout);
  render();
})();
