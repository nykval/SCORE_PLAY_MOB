import { defaultProfile, games, homeMvp, notifications, sports, teams, venues } from './data/mock.js';
import { achievementDetailSheet, avatarChangeSheet, avatarViewSheet, createGameSheet, gameDetailSheet, notificationsSheet, profileDetailSheet, teamRequestsSheet, venueDetailSheet } from './components/sheets.js';
import { renderGamesScreen, renderHome, renderProfileScreen, renderProgressScreen, renderTeamScreen, renderVenuesScreen } from './screens/index.js';
import { addDays, getAvatarSrc, getSportImage, normalize, startOfToday, toInputDate, withGameDate } from './utils/format.js';

const STORAGE_KEY = 'scoreplay_mob_state';
const LOGIN = 'SCORE';
const PASSWORD = 'SCORE123';

const screenTitles = {
  home: 'Главная',
  venues: 'Площадки',
  games: 'Игры',
  progress: 'Прогресс',
  team: 'Команда',
  profile: 'Профиль'
};

const dom = {
  loginScreen: document.querySelector('#login-screen'),
  loginForm: document.querySelector('#login-form'),
  loginInput: document.querySelector('#login-input'),
  passwordInput: document.querySelector('#password-input'),
  loginError: document.querySelector('#login-error'),
  mobileApp: document.querySelector('#mobile-app'),
  screenTitle: document.querySelector('#screen-title'),
  screenLocation: document.querySelector('#screen-location'),
  greeting: document.querySelector('#greeting'),
  screens: Array.from(document.querySelectorAll('.app-screen')),
  navButtons: Array.from(document.querySelectorAll('[data-nav]')),
  profileShortcut: document.querySelector('#profile-shortcut'),
  notificationsShortcut: document.querySelector('#notifications-shortcut'),
  sheet: document.querySelector('#sheet'),
  sheetPanel: document.querySelector('.sheet-panel'),
  sheetContent: document.querySelector('#sheet-content'),
  toast: document.querySelector('#toast')
};

const state = hydrateState();

init();

function init() {
  initTelegramViewport();

  bindLogin();
  bindNavigation();
  bindGlobalEvents();
  updateGreeting();

  if (state.authorized) {
    showApp();
  }
}

function initTelegramViewport() {
  const webApp = window.Telegram?.WebApp;
  if (!webApp) {
    setTelegramViewportVars();
    window.addEventListener('resize', setTelegramViewportVars);
    return;
  }

  webApp.ready();
  webApp.expand();

  if (typeof webApp.requestFullscreen === 'function') {
    try {
      webApp.requestFullscreen();
    } catch (_) {}
  }

  if (typeof webApp.disableVerticalSwipes === 'function') {
    try {
      webApp.disableVerticalSwipes();
    } catch (_) {}
  }

  if (typeof webApp.setHeaderColor === 'function') {
    try {
      webApp.setHeaderColor('#E7EDFC');
    } catch (_) {}
  }

  if (typeof webApp.setBackgroundColor === 'function') {
    try {
      webApp.setBackgroundColor('#E7EDFC');
    } catch (_) {}
  }

  setTelegramViewportVars();
  webApp.onEvent?.('viewportChanged', setTelegramViewportVars);
  webApp.onEvent?.('fullscreenChanged', setTelegramViewportVars);
  window.addEventListener('resize', setTelegramViewportVars);
}

function setTelegramViewportVars() {
  const root = document.documentElement;
  const webApp = window.Telegram?.WebApp;
  const viewportHeight = Number(webApp?.viewportStableHeight || webApp?.viewportHeight || window.innerHeight || 0);
  if (viewportHeight > 0) {
    root.style.setProperty('--tg-viewport-height', `${viewportHeight}px`);
  }
}

function hydrateState() {
  const fallback = {
    authorized: false,
    activeScreen: 'home',
    profile: clone(defaultProfile),
    notifications: clone(notifications),
    home: clone(homeMvp),
    venues: clone(venues),
    games: games.map(withGameDate),
    teams: clone(teams),
    selectedTeamId: 't1',
    filters: {
      venues: {
        query: '',
        sport: 'Все',
        price: 'any',
        location: 'Все',
        amenity: 'Все',
        distance: 'any',
        surface: 'Все',
        lighting: 'any',
        size: 'Все',
        rating: 'any',
        paid: 'any',
        view: 'list',
        free: false,
        favorite: false,
        indoor: false,
        open: false,
        isNew: false
      },
      games: {
        query: '',
        sport: 'Все',
        date: 'any',
        time: 'any',
        distance: 'any',
        level: 'Все',
        price: 'any',
        slots: 'any',
        today: false,
        free: false,
        coach: false,
        nearby: false,
        favorite: false,
        view: 'list'
      }
    }
  };

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!saved) return fallback;
    return {
      ...fallback,
      ...saved,
      activeScreen: saved.activeScreen === 'favorites' ? 'progress' : saved.activeScreen,
      profile: mergeProfile(saved.profile),
      notifications: Array.isArray(saved.notifications) ? saved.notifications : fallback.notifications,
      home: { ...fallback.home, ...(saved.home || {}) },
      venues: mergeById(fallback.venues, saved.venues),
      games: mergeById(fallback.games, saved.games).map(withGameDate),
      teams: mergeById(fallback.teams, saved.teams),
      filters: mergeFilters(fallback.filters, saved.filters)
    };
  } catch {
    return fallback;
  }
}

function mergeProfile(profile = {}) {
  const mergedStats = {
    ...clone(defaultProfile.stats),
    ...(profile.stats || {}),
    week: { ...defaultProfile.stats.week, ...((profile.stats || {}).week || {}) },
    month: { ...defaultProfile.stats.month, ...((profile.stats || {}).month || {}) }
  };
  const savedAchievements = Array.isArray(profile.achievements) ? profile.achievements : [];
  return {
    ...clone(defaultProfile),
    ...profile,
    nickname: String(profile.nickname || defaultProfile.nickname || '#77777'),
    phone: String(profile.phone || defaultProfile.phone || ''),
    email: String(profile.email || defaultProfile.email || ''),
    social: String(profile.social || defaultProfile.social || ''),
    avatarDataUrl: String(profile.avatarDataUrl || ''),
    preferences: { ...defaultProfile.preferences, ...(profile.preferences || {}) },
    stats: mergedStats,
    sports: Array.isArray(profile.sports) ? profile.sports : clone(defaultProfile.sports),
    achievements: (defaultProfile.achievements || []).map((item) => {
      const saved = savedAchievements.find((saved) => saved.title === item.title || saved.id === item.id) || {};
      return {
        ...item,
        unlocked: saved.unlocked ?? item.unlocked,
        progress: saved.progress ?? item.progress,
        status: saved.status ?? item.status,
        rarity: saved.rarity ?? item.rarity,
        date: saved.date ?? item.date
      };
    }),
    history: { ...clone(defaultProfile.history || {}), ...(profile.history || {}) }
  };
}

function mergeById(base, saved) {
  if (!Array.isArray(saved)) return clone(base);
  return base.map((item) => ({ ...item, ...(saved.find((savedItem) => savedItem.id === item.id) || {}) }))
    .concat(saved.filter((item) => !base.some((baseItem) => baseItem.id === item.id)));
}

function mergeFilters(fallback, saved = {}) {
  return {
    venues: { ...fallback.venues, ...(saved.venues || {}) },
    games: { ...fallback.games, ...(saved.games || {}) }
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function bindLogin() {
  dom.loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const login = normalize(dom.loginInput.value).toUpperCase();
    const password = dom.passwordInput.value.trim();
    if (login !== LOGIN || password !== PASSWORD) {
      dom.loginError.textContent = 'Неверный логин или пароль';
      dom.loginForm.classList.add('is-shaking');
      setTimeout(() => dom.loginForm.classList.remove('is-shaking'), 320);
      return;
    }

    state.authorized = true;
    state.activeScreen = 'home';
    dom.loginError.textContent = '';
    saveState();
    showApp();
  });
}

function bindNavigation() {
  dom.navButtons.forEach((button) => {
    button.addEventListener('click', () => {
      navigate(button.dataset.nav);
    });
  });

  dom.profileShortcut.addEventListener('click', () => navigate('profile'));
}

function bindGlobalEvents() {
  document.addEventListener('click', handleClick);
  document.addEventListener('input', handleInput);
  document.addEventListener('change', handleChange);
  dom.sheetContent?.addEventListener('scroll', updateProfileStickyTitle, { passive: true });
  document.querySelectorAll('[data-close-sheet]').forEach((button) => button.addEventListener('click', closeSheet));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeSheet();
    if ((event.key === 'Enter' || event.key === ' ') && event.target instanceof HTMLElement && event.target.matches('[role="button"][tabindex="0"]')) {
      event.preventDefault();
      event.target.click();
    }
  });
  bindSheetDrag();
}

function handleClick(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.closest('[data-close-sheet]')) {
    closeSheet();
    return;
  }
  const action = target.closest('[data-action]');
  if (!action) return;

  const { action: actionName, id, value } = action.dataset;

  if (actionName === 'nav' && value) navigate(value);
  if (actionName === 'profile-shortcut') navigate('profile');
  if (actionName === 'game-filter') toggleFilter('games', value);
  if (actionName === 'venue-filter') toggleFilter('venues', value);
  if (actionName === 'game-view') state.filters.games.view = value || 'list';
  if (actionName === 'venue-view') state.filters.venues.view = value || 'list';
  if (actionName === 'find-game') navigate('games');
  if (actionName === 'find-venue') navigate('venues');
  if (actionName === 'book-venue') navigate('venues');
  if (actionName === 'invite-friends') showToast('Ссылка приглашения подготовлена');
  if (actionName === 'book-selected-venue') showToast('Окно бронирования подготовлено');
  if (actionName === 'open-game-chat') showToast('Чат игры будет доступен после подключения backend');
  if (actionName === 'create-game') openCreateGameSheet();
  if (actionName === 'open-notifications') openNotificationsSheet();
  if (actionName === 'save-game') saveGameFromSheet(action);
  if (actionName === 'game-detail') openGameSheet(id);
  if (actionName === 'venue-detail') openVenueSheet(id);
  if (actionName === 'favorite-game') toggleFavorite('games', id);
  if (actionName === 'favorite-venue') toggleFavorite('venues', id);
  if (actionName === 'join-game') toggleJoinGame(id);
  if (actionName === 'team-event') openTeamEventSheet(id);
  if (actionName === 'open-team-requests') openSheet(teamRequestsSheet(getSelectedTeam()));
  if (actionName === 'achievement-detail') openAchievementSheet(id);
  if (actionName === 'share-achievement') shareAchievement(id);
  if (actionName === 'invite-player') showToast('Ссылка приглашения подготовлена');
  if (actionName === 'create-team') showToast('Создание команды будет следующим шагом MVP');
  if (actionName === 'profile-detail') openSheet(profileDetailSheet(state.profile));
  if (actionName === 'share-profile') shareProfile();
  if (actionName === 'view-avatar') openSheet(avatarViewSheet(state.profile));
  if (actionName === 'change-avatar') openSheet(avatarChangeSheet(state.profile));
  if (actionName === 'select-avatar') selectProfileAvatar(value);
  if (actionName === 'edit-profile') openSheet(profileDetailSheet(state.profile, true));
  if (actionName === 'save-profile') saveProfileFromSheet();
  if (actionName === 'add-sport') addProfileSport();
  if (actionName === 'remove-sport') removeProfileSport(value);
  if (actionName === 'logout') logout();

  if (actionName !== 'save-game') {
    saveState();
    renderApp();
  }
}

function handleInput(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  if (target.matches('[data-search="games"]')) {
    state.filters.games.query = target.value;
    saveState();
    renderGamesOnly();
  }

  if (target.matches('[data-search="venues"]')) {
    state.filters.venues.query = target.value;
    saveState();
    renderVenuesOnly();
  }

  if (target.closest('#create-game-form')) {
    updateCreateGameValidation();
  }
}

function handleChange(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  if (target.matches('input[name="avatar"]')) {
    previewAvatarFile(target);
    if (target.closest('.avatar-change-card')) saveAvatarFileFromInput(target);
  }

  if (target.matches('[data-select="venue-sport"]')) {
    state.filters.venues.sport = target.value;
    saveState();
    renderVenuesOnly();
  }

  if (target.matches('[data-team-switch]')) {
    state.selectedTeamId = target.value;
    saveState();
    renderTeamOnly();
  }

  if (target.closest('#create-game-form')) {
    updateCreateGameValidation();
  }
}

function showApp() {
  dom.loginScreen.hidden = true;
  dom.mobileApp.hidden = false;
  renderApp();
}

function logout() {
  state.authorized = false;
  state.activeScreen = 'home';
  saveState();
  closeSheet();
  dom.mobileApp.hidden = true;
  dom.loginScreen.hidden = false;
}

function navigate(screen) {
  if (screen === 'favorites') screen = 'progress';
  if (!screenTitles[screen]) return;
  state.activeScreen = screen;
  saveState();
  renderApp();
}

function renderApp() {
  dom.screens.forEach((screen) => screen.classList.toggle('is-active', screen.dataset.screen === state.activeScreen));
  dom.navButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.nav === state.activeScreen));
  if (dom.screenTitle) dom.screenTitle.textContent = screenTitles[state.activeScreen] || 'SCORE PLAY';
  if (dom.screenLocation) dom.screenLocation.textContent = state.profile.city || 'Москва';
  const avatarImage = dom.profileShortcut?.querySelector('img');
  if (avatarImage) avatarImage.src = getAvatarSrc(state.profile.avatarId, state.profile.avatarDataUrl);
  renderHomeOnly();
  renderVenuesOnly();
  renderGamesOnly();
  renderProgressOnly();
  renderTeamOnly();
  renderProfileOnly();
}

function renderHomeOnly() {
  const screen = document.querySelector('#screen-home');
  const nextGame = state.games.find((game) => game.joined) || state.games[0];
  screen.innerHTML = renderHome({ state, nextGame, home: state.home });
}

function renderGamesOnly() {
  document.querySelector('#screen-games').innerHTML = renderGamesScreen({ state, games: getFilteredGames() });
}

function renderProgressOnly() {
  document.querySelector('#screen-progress').innerHTML = renderProgressScreen({
    state,
    joinedGames: state.games.filter((game) => game.joined)
  });
}

function renderVenuesOnly() {
  document.querySelector('#screen-venues').innerHTML = renderVenuesScreen({ state, venues: getFilteredVenues() });
}

function renderTeamOnly() {
  document.querySelector('#screen-team').innerHTML = renderTeamScreen({ state, team: getSelectedTeam() });
}

function renderProfileOnly() {
  document.querySelector('#screen-profile').innerHTML = renderProfileScreen({
    state,
    teams: state.teams,
    joinedGames: state.games.filter((game) => game.joined),
    favoriteVenues: state.venues.filter((venue) => venue.favorite),
    favoriteGames: state.games.filter((game) => game.favorite)
  });
}

function openAchievementSheet(id) {
  const achievement = state.profile.achievements.find((item) => String(item.id || item.title) === String(id));
  if (!achievement) return;
  openSheet(achievementDetailSheet(achievement));
}

function getAppShareUrl() {
  if (window.location.protocol === 'file:') return 'https://t.me/score_app';
  return window.location.href.split(/[?#]/)[0];
}

function buildAchievementSharePayload(achievement) {
  const appUrl = getAppShareUrl();
  const messageLines = [
    `Я получил достижение «${achievement.title}» в SCORE.`,
    achievement.text ? `Задание: ${achievement.text}` : '',
    'Залетай в SCORE: найди игру рядом, собери команду и открой свои достижения.'
  ].filter(Boolean);
  const text = [...messageLines, `Открыть приложение: ${appUrl}`].join('\n\n');

  return {
    title: `SCORE: ${achievement.title}`,
    text,
    telegramText: messageLines.join('\n\n'),
    url: appUrl
  };
}

function resolveAssetUrl(src) {
  if (!src) return '';
  if (String(src).startsWith('data:')) return src;
  return new URL(src, document.baseURI).href;
}

function loadCanvasImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    if (/^https?:/i.test(src)) image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = resolveAssetUrl(src);
  });
}

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawContainedImage(ctx, image, x, y, size) {
  const ratio = Math.min(size / image.width, size / image.height);
  const width = image.width * ratio;
  const height = image.height * ratio;
  ctx.drawImage(image, x + (size - width) / 2, y + (size - height) / 2, width, height);
}

function getWrappedLines(ctx, text, maxWidth) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth || !current) {
      current = next;
      return;
    }
    lines.push(current);
    current = word;
  });
  if (current) lines.push(current);
  return lines;
}

function drawCenteredLines(ctx, lines, centerX, y, lineHeight) {
  lines.forEach((line, index) => {
    ctx.fillText(line, centerX, y + index * lineHeight);
  });
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.96));
}

async function createAchievementShareFile(achievement) {
  const canvas = document.createElement('canvas');
  const width = 1080;
  const height = 1350;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const isGamesSeries = achievement.series === 'Игры';
  const logoSrc = isGamesSeries ? './icons/logo-green.png' : './icons/logo-blue.png';
  const [medal, logo] = await Promise.all([
    loadCanvasImage(achievement.icon),
    loadCanvasImage(logoSrc).catch(() => null)
  ]);

  ctx.fillStyle = '#E4F0FF';
  roundedRect(ctx, 0, 0, width, height, 72);
  ctx.fill();
  ctx.strokeStyle = '#BFD4FF';
  ctx.lineWidth = 4;
  roundedRect(ctx, 18, 18, width - 36, height - 36, 64);
  ctx.stroke();

  drawContainedImage(ctx, medal, 360, 170, 360);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#101318';
  ctx.font = '800 68px Manrope, Arial, sans-serif';
  const titleLines = getWrappedLines(ctx, achievement.title, 920).slice(0, 3);
  drawCenteredLines(ctx, titleLines, width / 2, 620, 82);

  ctx.fillStyle = '#5D6F94';
  ctx.font = '800 38px Manrope, Arial, sans-serif';
  const descriptionLines = getWrappedLines(ctx, achievement.text, 820).slice(0, 2);
  drawCenteredLines(ctx, descriptionLines, width / 2, 620 + titleLines.length * 82 + 34, 50);

  if (logo) drawContainedImage(ctx, logo, 420, 1124, 240);

  const blob = await canvasToBlob(canvas);
  if (!blob) return null;
  const fileName = `score-${String(achievement.id || 'achievement').replace(/[^a-z0-9_-]/gi, '-')}.png`;
  return new File([blob], fileName, { type: 'image/png' });
}

function openTelegramAchievementShare(payload) {
  const webApp = window.Telegram?.WebApp;
  if (!webApp || typeof webApp.openTelegramLink !== 'function') return false;

  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(payload.url)}&text=${encodeURIComponent(payload.telegramText || payload.text)}`;
  webApp.openTelegramLink(shareUrl);
  return true;
}

async function shareAchievement(id) {
  const achievement = state.profile.achievements.find((item) => String(item.id || item.title) === String(id));
  if (!achievement || achievement.unlocked === false) return;
  const payload = buildAchievementSharePayload(achievement);

  if (navigator.share && typeof File !== 'undefined') {
    try {
      const file = await createAchievementShareFile(achievement);
      if (file && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share({ files: [file], title: payload.title, text: payload.text });
        return;
      }
    } catch (_) {}
  }

  if (navigator.share) {
    navigator.share({ title: payload.title, text: payload.text, url: payload.url }).catch(() => {});
    return;
  }

  if (openTelegramAchievementShare(payload)) return;

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(payload.text)
      .then(() => showToast('Текст ачивки скопирован'))
      .catch(() => showToast('Ачивка готова к отправке'));
    return;
  }

  showToast('Ачивка готова к отправке');
}

function getFilteredGames() {
  const filters = state.filters.games;
  const query = normalize(filters.query);
  return state.games
    .filter((game) => {
      if (query && !normalize([game.title, game.sport, game.place, game.metro, game.district].join(' ')).includes(query)) return false;
      if (filters.sport !== 'Все' && game.sport !== filters.sport) return false;
      if (filters.date === 'today' && game.dateOffset !== 0) return false;
      if (filters.date === 'week' && game.dateOffset > 7) return false;
      if (filters.time === 'morning' && Number(game.time.slice(0, 2)) >= 12) return false;
      if (filters.time === 'evening' && Number(game.time.slice(0, 2)) < 18) return false;
      if (filters.distance === 'near' && parseDistance(game.distance) > 2) return false;
      if (filters.distance === 'five' && parseDistance(game.distance) > 5) return false;
      if (filters.level !== 'Все' && game.level !== filters.level) return false;
      if (filters.price === 'free' && game.price > 0) return false;
      if (filters.price === 'paid' && game.price === 0) return false;
      if (filters.slots === 'open' && game.current >= game.max) return false;
      if (filters.today && game.dateOffset !== 0) return false;
      if (filters.free && game.price > 0) return false;
      if (filters.coach && !game.coach) return false;
      if (filters.nearby && !game.nearby) return false;
      if (filters.favorite && !game.favorite) return false;
      return true;
    })
    .sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));
}

function getFilteredVenues() {
  const filters = state.filters.venues;
  const query = normalize(filters.query);
  return state.venues.filter((venue) => {
    if (query && !normalize([venue.name, venue.sport, venue.district, venue.metro, venue.address].join(' ')).includes(query)) return false;
    if (filters.sport !== 'Все' && venue.sport !== filters.sport) return false;
    if (filters.price === 'free' && venue.price > 0) return false;
    if (filters.price === 'low' && venue.price > 2500) return false;
    if (filters.price === 'mid' && (venue.price < 2500 || venue.price > 5000)) return false;
    if (filters.price === 'paid' && venue.price === 0) return false;
    if (filters.distance === 'near' && parseDistance(venue.distance) > 2) return false;
    if (filters.distance === 'five' && parseDistance(venue.distance) > 5) return false;
    if (filters.surface !== 'Все' && venue.surface !== filters.surface) return false;
    if (filters.lighting === 'yes' && !(venue.amenities || []).includes('Освещение')) return false;
    if (filters.size !== 'Все' && venue.size !== filters.size) return false;
    if (filters.rating === 'high' && Number(venue.rating || 0) < 4.7) return false;
    if (filters.paid === 'free' && venue.price > 0) return false;
    if (filters.paid === 'paid' && venue.price === 0) return false;
    if (filters.location !== 'Все' && venue.district !== filters.location && venue.metro !== filters.location) return false;
    if (filters.amenity !== 'Все' && !venue.amenities.includes(filters.amenity)) return false;
    if (filters.isNew && venue.label !== 'Новая') return false;
    if (filters.free && !venue.free && venue.price > 0) return false;
    if (filters.favorite && !venue.favorite) return false;
    if (filters.indoor && !venue.indoor) return false;
    if (filters.open && venue.indoor) return false;
    return true;
  });
}

function parseDistance(value = '') {
  return Number(String(value).replace(',', '.').match(/\d+(\.\d+)?/)?.[0] || 99);
}

function toggleFilter(scope, value) {
  const filters = state.filters[scope];
  if (!filters) return;
  if (value === 'reset') {
    Object.keys(filters).forEach((key) => {
      if (typeof filters[key] === 'boolean') filters[key] = false;
      if (key === 'query') filters[key] = '';
      if (key === 'sport') filters[key] = 'Все';
      if (key === 'price') filters[key] = 'any';
      if (key === 'location') filters[key] = 'Все';
      if (key === 'amenity') filters[key] = 'Все';
      if (key === 'distance') filters[key] = 'any';
      if (key === 'surface') filters[key] = 'Все';
      if (key === 'lighting') filters[key] = 'any';
      if (key === 'size') filters[key] = 'Все';
      if (key === 'rating') filters[key] = 'any';
      if (key === 'paid') filters[key] = 'any';
      if (key === 'date') filters[key] = 'any';
      if (key === 'time') filters[key] = 'any';
      if (key === 'level') filters[key] = 'Все';
      if (key === 'slots') filters[key] = 'any';
    });
    return;
  }
  if (typeof filters[value] === 'boolean') filters[value] = !filters[value];
  if (scope === 'venues' && value?.startsWith('sport:')) filters.sport = filters.sport === value.slice(6) ? 'Все' : value.slice(6);
  if (scope === 'venues' && value?.startsWith('price:')) filters.price = filters.price === value.slice(6) ? 'any' : value.slice(6);
  if (scope === 'venues' && value?.startsWith('location:')) filters.location = filters.location === value.slice(9) ? 'Все' : value.slice(9);
  if (scope === 'venues' && value?.startsWith('amenity:')) filters.amenity = filters.amenity === value.slice(8) ? 'Все' : value.slice(8);
  if (scope === 'venues' && value?.startsWith('distance:')) filters.distance = filters.distance === value.slice(9) ? 'any' : value.slice(9);
  if (scope === 'venues' && value?.startsWith('surface:')) filters.surface = filters.surface === value.slice(8) ? 'Все' : value.slice(8);
  if (scope === 'venues' && value?.startsWith('lighting:')) filters.lighting = filters.lighting === value.slice(9) ? 'any' : value.slice(9);
  if (scope === 'venues' && value?.startsWith('size:')) filters.size = filters.size === value.slice(5) ? 'Все' : value.slice(5);
  if (scope === 'venues' && value?.startsWith('rating:')) filters.rating = filters.rating === value.slice(7) ? 'any' : value.slice(7);
  if (scope === 'venues' && value?.startsWith('paid:')) filters.paid = filters.paid === value.slice(5) ? 'any' : value.slice(5);
  if (scope === 'games' && value?.startsWith('sport:')) filters.sport = filters.sport === value.slice(6) ? 'Все' : value.slice(6);
  if (scope === 'games' && value?.startsWith('date:')) filters.date = filters.date === value.slice(5) ? 'any' : value.slice(5);
  if (scope === 'games' && value?.startsWith('time:')) filters.time = filters.time === value.slice(5) ? 'any' : value.slice(5);
  if (scope === 'games' && value?.startsWith('distance:')) filters.distance = filters.distance === value.slice(9) ? 'any' : value.slice(9);
  if (scope === 'games' && value?.startsWith('level:')) filters.level = filters.level === value.slice(6) ? 'Все' : value.slice(6);
  if (scope === 'games' && value?.startsWith('price:')) filters.price = filters.price === value.slice(6) ? 'any' : value.slice(6);
  if (scope === 'games' && value?.startsWith('slots:')) filters.slots = filters.slots === value.slice(6) ? 'any' : value.slice(6);
}

function openCreateGameSheet() {
  openSheet(createGameSheet({ state, defaultDate: addDays(1) }));
  updateCreateGameValidation(false);
}

function openNotificationsSheet() {
  openSheet(notificationsSheet(state.notifications));
}

function saveGameFromSheet(button) {
  const form = document.querySelector('#create-game-form');
  if (!(form instanceof HTMLFormElement)) return;
  const validation = validateCreateGameForm(form);
  renderCreateGameErrors(validation.errors);
  if (!validation.valid) return;

  button.disabled = true;
  button.classList.add('is-loading');
  button.textContent = 'Публикуем...';

  window.setTimeout(() => {
    const data = new FormData(form);
    const date = String(data.get('date'));
    const time = String(data.get('time'));
    const sport = String(data.get('sport'));
    const max = Number(data.get('max'));
    const current = Number(data.get('current'));
    const price = Number(data.get('price'));

    state.games.unshift({
      id: `g${Date.now()}`,
      title: String(data.get('title')).trim(),
      sport,
      format: String(data.get('format')),
      level: state.profile.level,
      dateOffset: Math.round((new Date(`${date}T00:00:00`) - startOfToday()) / 86400000),
      time,
      duration: 90,
      place: String(data.get('place')).trim(),
      metro: 'Уточнить',
      district: state.profile.district,
      price,
      current,
      max,
      organizer: state.profile.name,
      rating: 5,
      coach: false,
      isNew: true,
      favorite: false,
      joined: true,
      nearby: true,
      image: getSportImage(sport),
      description: String(data.get('description') || 'Открытая игра в комфортном темпе.').trim(),
      startDateTime: `${date}T${time}:00`
    });

    state.activeScreen = 'games';
    saveState();
    renderApp();
    const formState = document.querySelector('[data-sheet-state="form"]');
    const successState = document.querySelector('[data-sheet-state="success"]');
    if (formState) formState.hidden = true;
    if (successState) successState.hidden = false;
  }, 450);
}

function validateCreateGameForm(form) {
  const data = new FormData(form);
  const title = String(data.get('title') || '').trim();
  const sport = String(data.get('sport') || '').trim();
  const format = String(data.get('format') || '').trim();
  const date = String(data.get('date') || '').trim();
  const time = String(data.get('time') || '').trim();
  const place = String(data.get('place') || '').trim();
  const max = Number(data.get('max'));
  const current = Number(data.get('current'));
  const price = Number(data.get('price'));
  const errors = [];

  if (!title || !sport || !format || !date || !time || !place) errors.push('Заполните обязательные поля.');
  if (!Number.isFinite(max) || max <= 0) errors.push('Мест всего должно быть больше 0.');
  if (!Number.isFinite(current) || current < 0) errors.push('Уже есть не может быть меньше 0.');
  if (current > max) errors.push('Уже есть не должно быть больше общего количества мест.');
  if (!Number.isFinite(price) || price < 0) errors.push('Цена не может быть меньше 0.');

  return { valid: errors.length === 0, errors };
}

function updateCreateGameValidation(showErrors = true) {
  const form = document.querySelector('#create-game-form');
  const submit = document.querySelector('[data-create-game-submit]');
  if (!(form instanceof HTMLFormElement) || !(submit instanceof HTMLButtonElement)) return;
  const validation = validateCreateGameForm(form);
  submit.disabled = !validation.valid;
  renderCreateGameErrors(showErrors ? validation.errors : []);
}

function renderCreateGameErrors(errors) {
  const container = document.querySelector('#create-game-errors');
  if (!container) return;
  container.innerHTML = errors.map((error) => `<p>${error}</p>`).join('');
}

function openGameSheet(id) {
  const game = state.games.find((item) => item.id === id);
  if (game) openSheet(gameDetailSheet(game));
}

function openVenueSheet(id) {
  const venue = state.venues.find((item) => item.id === id);
  if (venue) openSheet(venueDetailSheet(venue));
}

function openTeamEventSheet(id) {
  const event = getSelectedTeam().events.find((item) => item.id === id);
  if (!event) return;
  openSheet(`
    <div class="sheet-heading">
      <span class="eyebrow">${event.type}</span>
      <h2>${event.title}</h2>
      <p>${event.time} · ${event.place}</p>
    </div>
    <section class="section-card flat"><strong>${event.note}</strong></section>
    <button class="button button-primary button-full" type="button" data-action="create-game">Создать похожую игру</button>
  `);
}

async function saveProfileFromSheet() {
  const form = document.querySelector('#profile-form');
  if (!(form instanceof HTMLFormElement)) return;
  const data = new FormData(form);
  const avatarFile = data.get('avatar');
  state.profile.name = String(data.get('name') || state.profile.name).trim();
  state.profile.nickname = String(data.get('nickname') || state.profile.nickname || '#77777').trim();
  state.profile.district = String(data.get('district') || state.profile.district).trim();
  state.profile.phone = String(data.get('phone') || state.profile.phone || '').trim();
  state.profile.email = String(data.get('email') || state.profile.email || '').trim();
  state.profile.social = String(data.get('social') || state.profile.social || '').trim();
  state.profile.about = String(data.get('about') || state.profile.about).trim();
  if (avatarFile instanceof File && avatarFile.size > 0) {
    try {
      state.profile.avatarDataUrl = await readImageFile(avatarFile);
    } catch {
      showToast('Не удалось загрузить аватарку');
      return;
    }
  }
  saveState();
  renderApp();
  openSheet(profileDetailSheet(state.profile));
  showToast('Профиль обновлен');
}

function updateProfileStickyTitle() {
  const title = dom.sheetContent?.querySelector('[data-profile-sticky-title]');
  if (!title) return;
  title.classList.toggle('is-visible', dom.sheetContent.scrollTop > 96);
}

function shareProfile() {
  const nickname = state.profile.nickname || '#77777';
  const text = `SCORE профиль: ${state.profile.name} ${nickname}`;
  if (navigator.share) {
    navigator.share({ title: 'SCORE профиль', text }).catch(() => {});
    return;
  }

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => showToast('Профиль скопирован'))
      .catch(() => showToast('Профиль готов к отправке'));
    return;
  }

  showToast('Профиль готов к отправке');
}

function selectProfileAvatar(value) {
  const avatarId = Number(value);
  if (!Number.isFinite(avatarId)) return;
  state.profile.avatarId = avatarId;
  state.profile.avatarDataUrl = '';
  saveState();
  renderApp();
  openSheet(avatarChangeSheet(state.profile));
  showToast('Аватар обновлен');
}

async function saveAvatarFileFromInput(input) {
  if (!(input instanceof HTMLInputElement) || !input.files?.[0]) return;
  try {
    state.profile.avatarDataUrl = await readImageFile(input.files[0]);
    saveState();
    renderApp();
    showToast('Аватар обновлен');
  } catch {
    showToast('Не удалось загрузить аватарку');
  }
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result || '')));
    reader.addEventListener('error', () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

function previewAvatarFile(input) {
  if (!(input instanceof HTMLInputElement) || !input.files?.[0]) return;
  const file = input.files[0];
  const label = document.querySelector('[data-avatar-file-label]');
  const preview = document.querySelector('[data-avatar-preview]');
  if (label) label.textContent = file.name;
  if (!(preview instanceof HTMLImageElement)) return;
  readImageFile(file)
    .then((src) => {
      preview.src = src;
    })
    .catch(() => {
      showToast('Не удалось показать фото');
    });
}

function addProfileSport() {
  const next = sports.find((sport) => !state.profile.sports.some((item) => item.type === sport));
  if (!next) return showToast('Все виды спорта уже добавлены');
  state.profile.sports.push({ type: next, level: state.profile.level, position: 'Игрок' });
  showToast(`${next} добавлен`);
}

function removeProfileSport(type) {
  if (state.profile.sports.length <= 1) return showToast('Оставьте хотя бы один спорт');
  state.profile.sports = state.profile.sports.filter((sport) => sport.type !== type);
}

function toggleFavorite(collection, id) {
  const item = state[collection].find((entry) => entry.id === id);
  if (!item) return;
  item.favorite = !item.favorite;
  showToast(item.favorite ? 'Сохранено' : 'Убрано из сохраненных');
}

function toggleJoinGame(id) {
  const game = state.games.find((item) => item.id === id);
  if (!game) return;
  if (game.joined) {
    game.joined = false;
    game.current = Math.max(0, game.current - 1);
    showToast('Вы вышли из игры');
  } else if (game.current < game.max) {
    game.joined = true;
    game.current += 1;
    showToast('Вы участвуете');
  } else {
    showToast('Игра уже собрана');
  }
  closeSheet();
}

function openSheet(markup) {
  dom.sheetContent.innerHTML = markup;
  dom.sheetContent.scrollTop = 0;
  dom.sheetPanel?.classList.toggle('is-achievement-sheet', markup.includes('achievement-detail-sheet'));
  updateProfileStickyTitle();
  dom.sheet.hidden = false;
  dom.sheet.setAttribute('aria-hidden', 'false');
  document.body.classList.add('has-open-sheet');
  if (dom.sheetPanel) dom.sheetPanel.style.transform = '';
}

function closeSheet() {
  dom.sheet.hidden = true;
  dom.sheet.setAttribute('aria-hidden', 'true');
  dom.sheetContent.innerHTML = '';
  dom.sheetPanel?.classList.remove('is-achievement-sheet');
  document.body.classList.remove('has-open-sheet');
}

function showToast(message) {
  dom.toast.textContent = message;
  dom.toast.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    dom.toast.hidden = true;
  }, 1800);
}

function getSelectedTeam() {
  return state.teams.find((team) => team.id === state.selectedTeamId) || state.teams[0];
}

function updateGreeting() {
  const hour = new Date().getHours();
  if (dom.greeting) dom.greeting.textContent = hour < 12 ? 'Доброе утро.' : hour < 18 ? 'Добрый день.' : 'Добрый вечер.';
}

function bindSheetDrag() {
  if (!dom.sheetPanel) return;
  let startY = 0;
  let currentY = 0;
  let dragging = false;

  dom.sheetPanel.addEventListener('pointerdown', (event) => {
    if (event.target.closest('input, textarea, select, button')) return;
    const rect = dom.sheetPanel.getBoundingClientRect();
    if (!event.target.closest('.sheet-handle') && event.clientY - rect.top > 72) return;
    startY = event.clientY;
    currentY = 0;
    dragging = true;
    dom.sheetPanel.setPointerCapture(event.pointerId);
  });

  dom.sheetPanel.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    currentY = Math.max(0, event.clientY - startY);
    dom.sheetPanel.style.transform = `translateY(${currentY}px)`;
  });

  dom.sheetPanel.addEventListener('pointerup', () => {
    if (!dragging) return;
    dragging = false;
    if (currentY > 92) {
      closeSheet();
      return;
    }
    dom.sheetPanel.style.transform = '';
  });
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
