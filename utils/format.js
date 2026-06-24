export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function escapeAttr(value) {
  return escapeHtml(value);
}

export function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

export function formatNumber(value) {
  return Number(value || 0).toLocaleString('ru-RU');
}

export function formatPrice(value, suffix = '₽') {
  const price = Number(value || 0);
  return price === 0 ? 'Бесплатно' : `${formatNumber(price)} ${suffix}`;
}

export function addDays(days) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + Number(days || 0));
  return date;
}

export function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function toInputDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function withGameDate(game) {
  if (game.startDateTime) return game;
  const date = addDays(Number(game.dateOffset) || 0);
  return { ...game, startDateTime: `${toInputDate(date)}T${game.time}:00` };
}

export function formatGameDate(game) {
  const date = new Date(game.startDateTime);
  const today = startOfToday();
  const tomorrow = addDays(1);
  const day = sameDay(date, today)
    ? 'Сегодня'
    : sameDay(date, tomorrow)
      ? 'Завтра'
      : new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(date);
  return `${day} · ${game.time}`;
}

export function uniqueSports(items) {
  return Array.from(new Set(items.map((item) => item.sport).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'ru'));
}

export function getSportImage(sport) {
  const map = {
    'Футбол': '../SCORE PLAY/photo-plays/футбол.svg',
    'Баскетбол': '../SCORE PLAY/photo-plays/баскетбол.svg',
    'Волейбол': '../SCORE PLAY/photo-plays/воллейбол.svg',
    'Теннис': '../SCORE PLAY/photo-plays/теннис.svg',
    'Падел': '../SCORE PLAY/photo-plays/падел.svg',
    'Хоккей': '../SCORE PLAY/photo-plays/хоккей.svg',
    'Бег': '../SCORE PLAY/icons/map-area-base.jpg'
  };
  return map[sport] || '../SCORE PLAY/icons/map-area-base.jpg';
}

export function getAvatarSrc(id, dataUrl = '') {
  if (String(dataUrl).startsWith('data:image/')) return dataUrl;
  return `../SCORE PLAY/avatar/avatar-${Number(id) || 1}.svg`;
}

export function getGameStatus(game) {
  if (game.current >= game.max) return { label: 'Собрана', className: 'is-full' };
  if (game.isNew) return { label: 'Новая', className: 'is-new' };
  if (game.max - game.current <= 2) return { label: 'Почти собрана', className: 'is-almost' };
  return { label: 'Набор открыт', className: 'is-open' };
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}
