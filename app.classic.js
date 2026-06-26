// Classic bundle for file:// WebView support. Source modules live next to this file.
(() => {
'use strict';

// ---- MOB/utils/format.js ----
function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('ru-RU');
}

function formatPrice(value, suffix = '₽') {
  const price = Number(value || 0);
  return price === 0 ? 'Бесплатно' : `${formatNumber(price)} ${suffix}`;
}

function addDays(days) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + Number(days || 0));
  return date;
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function toInputDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function withGameDate(game) {
  if (game.startDateTime) return game;
  const date = addDays(Number(game.dateOffset) || 0);
  return { ...game, startDateTime: `${toInputDate(date)}T${game.time}:00` };
}

function formatGameDate(game) {
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

function uniqueSports(items) {
  return Array.from(new Set(items.map((item) => item.sport).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'ru'));
}

function getSportImage(sport) {
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

function getAvatarSrc(id, dataUrl = '') {
  if (String(dataUrl).startsWith('data:image/')) return dataUrl;
  return `../SCORE PLAY/avatar/avatar-${Number(id) || 1}.svg`;
}

function getGameStatus(game) {
  if (game.current >= game.max) return { label: 'Собрана', className: 'is-full' };
  if (game.isNew) return { label: 'Новая', className: 'is-new' };
  if (game.max - game.current <= 2) return { label: 'Почти собрана', className: 'is-almost' };
  return { label: 'Набор открыт', className: 'is-open' };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}


// ---- MOB/data/mock.js ----
const sports = ['Футбол', 'Баскетбол', 'Бег', 'Волейбол', 'Падел', 'Теннис', 'Сквош'];

const defaultProfile = {
  name: 'Саша Скоромиржа',
  nickname: '#77777',
  district: 'Москва, Текстильщики',
  city: 'Москва',
  phone: '+7 999 777-77-77',
  email: 'sasha.score@score.app',
  social: '@score_sasha',
  about: 'Игрок 5 лет. Люблю утренние тренировки, честную игру и быстрый сбор команд.',
  avatarId: 1,
  avatarDataUrl: '',
  goal: 'Играть чаще',
  level: 'Любитель',
  nextLevel: 'Средний',
  stepGoal: 10000,
  stepsDone: 6800,
  sports: [
    { type: 'Футбол', level: 'Любитель', position: 'Нападающий' },
    { type: 'Баскетбол', level: 'Средний', position: 'Разыгрывающий' }
  ],
  preferences: {
    radius: '5 км',
    time: 'Вечер',
    days: 'Любые',
    price: 'До 700 ₽'
  },
  stats: {
    games: 47,
    scorePoints: 12400,
    wins: 31,
    teams: 3,
    attendance: 91,
    levelScore: 47,
    levelTarget: 70,
    minutesOnVenues: 3760,
    bookings: 18,
    favoriteSport: 'Футбол',
    favoriteVenue: 'Арена Лужники 7×7',
    week: {
      games: 3,
      scorePoints: 860,
      minutes: 240,
      wins: 2,
      bookings: 1
    },
    month: {
      games: 12,
      scorePoints: 3200,
      minutes: 960,
      wins: 8,
      bookings: 5
    }
  },
  achievements: [
    { title: '50 игр', text: 'Осталось 3 игры до отметки', progress: 94, icon: '⚽', status: 'Почти готово', rarity: 'Редкое', date: '', unlocked: false },
    { title: 'Футбольный мастер', text: '25 матчей по футболу в SCORE', progress: 100, icon: '🏆', status: 'Получено', rarity: 'Эпическое', date: '12 июн.', unlocked: true },
    { title: 'Командный игрок', text: '10 командных матчей без пропусков', progress: 100, icon: '🤝', status: 'Получено', rarity: 'Редкое', date: '4 июн.', unlocked: true },
    { title: '100 игр', text: 'Большая сезонная цель', progress: 47, icon: '🔥', status: 'Цель', rarity: 'Легендарное', date: '', unlocked: false }
  ],
  history: {
    games: ['Вечерний футбол 5×5', 'Баскетбол 3×3 вечером', 'Беговая тренировка'],
    bookings: ['Арена Лужники 7×7 · 18 июн.', 'Belka Squash · 11 июн.']
  }
};

const notifications = [
  {
    id: 'n1',
    type: 'Игра',
    title: 'Вечерний футбол почти собран',
    text: 'Осталось 4 места на сегодня в 20:30.',
    time: '5 мин назад',
    unread: true
  },
  {
    id: 'n2',
    type: 'Площадка',
    title: 'Лужники доступны сегодня',
    text: 'Появилось окно на 21:00 рядом с метро Воробьевы горы.',
    time: '32 мин назад',
    unread: true
  },
  {
    id: 'n3',
    type: 'Команда',
    title: 'Новая заявка в SCORE UNITED',
    text: 'Никита хочет присоединиться как защитник.',
    time: 'Вчера',
    unread: false
  }
];

const homeMvp = {
  hero: {
    type: 'Ближайшая игра',
    title: 'Вечерний футбол 5×5',
    text: 'Сегодня в 20:30 · SCORE Arena Юго-Восток. Состав почти собран, подтвердите участие заранее.',
    action: 'Открыть игру',
    gameId: 'g1'
  },
  quickActions: [
    { title: 'Найти игру', text: 'Подбор рядом', action: 'find-game', icon: './icons/Игры.png' },
    { title: 'Создать игру', text: 'Собрать игроков', action: 'create-game', icon: './icons/Игры.png' },
    { title: 'Найти площадку', text: 'Фото, цена, метро', action: 'find-venue', icon: './icons/Площадки.png' },
    { title: 'Собрать команду', text: 'Состав и заявки', action: 'nav', value: 'team', icon: './icons/Профиль.png' },
    { title: 'Забронировать', text: 'Свободное время', action: 'book-venue', icon: './icons/Площадки.png' },
    { title: 'Позвать друзей', text: '+150 SCORE', action: 'invite-friends', icon: './icons/поделиться.png' }
  ],
  activity: [
    { label: 'Следующая игра', title: 'Вечерний футбол 5×5', meta: 'Сегодня · 20:30', action: 'game-detail', id: 'g1' },
    { label: 'Последняя площадка', title: 'Арена Лужники 7×7', meta: 'Сохранена · м. Воробьевы горы', action: 'venue-detail', id: 'v1' },
    { label: 'Созданная игра', title: 'Беговая тренировка', meta: '11 из 14 игроков', action: 'game-detail', id: 'g3' },
    { label: 'Новые приглашения', title: '2 приглашения', meta: 'Футбол и падел', action: 'open-notifications' }
  ],
  tasks: [
    { title: 'Подтвердить участие', text: 'Отметьте ближайшую игру до 18:00', progress: 70, reward: 120 },
    { title: 'Позвать друга', text: 'Пригласите игрока в SCORE', progress: 35, reward: 150 },
    { title: 'Сыграть 2 матча', text: 'Прогресс к достижению 50 игр', progress: 50, reward: 300 }
  ],
  news: [
    { type: 'Обновление', title: 'Фильтры площадок стали точнее', text: 'Добавили покрытие, освещение, размер и свободное время.' },
    { type: 'Акция', title: 'Первые бронирования без комиссии', text: 'На этой неделе SCORE возвращает бонусами до 10%.' },
    { type: 'Статья', title: 'Как собрать стабильную команду', text: 'Короткий гид по ролям, заявкам и расписанию.' }
  ]
};

const venues = [
  {
    id: 'v1',
    name: 'Арена Лужники 7×7',
    sport: 'Футбол',
    district: 'Хамовники',
    metro: 'Воробьевы горы',
    address: 'ул. Лужники, 24с4',
    price: 3200,
    rating: 4.8,
    distance: '1.8 км',
    freeTime: 'Сегодня · 21:00',
    surface: 'Искусственная трава',
    size: '7×7',
    reviews: 128,
    favorite: true,
    label: 'Популярная',
    free: false,
    indoor: false,
    photo: '../SCORE PLAY/venue-photos/1569331748_90f25b1dd39e8a909b8f28193946be12.jpg',
    amenities: ['Освещение', 'Раздевалка', 'Душ', 'Парковка'],
    schedule: ['19:00 занято', '20:00 занято', '21:00 свободно', '22:00 свободно'],
    description: 'Поле с искусственным покрытием, вечерним светом и быстрым доступом к раздевалкам.'
  },
  {
    id: 'v2',
    name: 'Поле «Луч» №2',
    sport: 'Футбол',
    district: 'Покровское-Стрешнево',
    metro: 'Спартак',
    address: 'Волоколамское шоссе, 88к9с1',
    price: 14100,
    rating: 4.6,
    distance: '4.2 км',
    freeTime: 'Завтра · 19:30',
    surface: 'Искусственная трава',
    size: '11×11',
    reviews: 86,
    favorite: false,
    label: 'Новая',
    free: false,
    indoor: false,
    photo: '../SCORE PLAY/venue-photos/luch-field-2-1.jpg',
    amenities: ['Освещение', 'Раздевалка', 'Wi-Fi', 'Инвентарь', 'Парковка'],
    schedule: ['18:00 занято', '19:30 свободно', '21:00 свободно'],
    description: 'Большое поле 100×64 для матчей, тренировок и командных сборов.'
  },
  {
    id: 'v3',
    name: 'Корты «Энергия»',
    sport: 'Теннис',
    district: 'Лефортово',
    metro: 'Лефортово',
    address: '2-й Краснокурсантский проезд, 12',
    price: 2400,
    rating: 4.7,
    distance: '6.1 км',
    freeTime: 'Сегодня · 18:00',
    surface: 'Грунт',
    size: 'Корт',
    reviews: 74,
    favorite: false,
    label: 'Открытая',
    free: false,
    indoor: false,
    photo: '../SCORE PLAY/venue-photos/energy-court-1.jpg',
    amenities: ['Душ', 'Раздевалка', 'Парковка', 'Инвентарь', 'Освещение'],
    schedule: ['18:00 свободно', '20:00 свободно', '21:00 занято'],
    description: 'Открытые корты с тенниситом, освещением и водой рядом с площадкой.'
  },
  {
    id: 'v4',
    name: 'Зал на Достоевской',
    sport: 'Волейбол',
    district: 'Тверской',
    metro: 'Достоевская',
    address: 'ул. Достоевского, 31',
    price: 4200,
    rating: 4.5,
    distance: '3.6 км',
    freeTime: 'Пт · 18:30',
    surface: 'Паркет',
    size: 'Зал',
    reviews: 59,
    favorite: false,
    label: 'В помещении',
    free: false,
    indoor: true,
    photo: '../SCORE PLAY/venue-photos/dostoevskaya-hall-1.jpg',
    amenities: ['Зал', 'Раздевалка', 'Инвентарь', 'Тренер', 'Душ'],
    schedule: ['18:30 свободно', '20:30 занято', '22:00 свободно'],
    description: 'Универсальный зал для волейбола и баскетбола с высоким потолком.'
  },
  {
    id: 'v5',
    name: 'Belka Squash',
    sport: 'Сквош',
    district: 'Беговой',
    metro: 'Динамо',
    address: 'Ленинградский проспект, 31',
    price: 1800,
    rating: 4.9,
    distance: '5.4 км',
    freeTime: 'Сегодня · 20:00',
    surface: 'Сквош-корт',
    size: 'Корт',
    reviews: 142,
    favorite: true,
    label: 'Популярная',
    free: false,
    indoor: true,
    photo: '../SCORE PLAY/venue-photos/belka-squash-1.jpg',
    amenities: ['Душ', 'Кафе', 'Раздевалка', 'Инвентарь'],
    schedule: ['19:00 занято', '20:00 свободно', '21:00 свободно'],
    description: 'Камерные корты для быстрых игр после работы и персональных тренировок.'
  },
  {
    id: 'v6',
    name: 'SCORE Run Point',
    sport: 'Бег',
    district: 'Сокольники',
    metro: 'Сокольники',
    address: 'Парк Сокольники',
    price: 0,
    rating: 4.7,
    distance: '1.2 км',
    freeTime: 'Всегда открыто',
    surface: 'Парк',
    size: 'Маршрут',
    reviews: 51,
    favorite: false,
    label: 'Открытая',
    free: true,
    indoor: false,
    photo: '../SCORE PLAY/icons/map-area-base.jpg',
    amenities: ['Бесплатно', 'Вода', 'Туалет', 'Парк'],
    schedule: ['07:00 группа', '19:00 группа', 'Любое время'],
    description: 'Точка сбора для беговых тренировок, интервалов и прогулочных групп.'
  }
];

const games = [
  {
    id: 'g1',
    title: 'Вечерний футбол 5×5',
    sport: 'Футбол',
    format: '5×5',
    level: 'Любитель',
    dateOffset: 0,
    time: '20:30',
    duration: 90,
    place: 'SCORE Arena Юго-Восток',
    metro: 'Волгоградский проспект',
    district: 'Текстильщики',
    price: 500,
    current: 6,
    max: 10,
    organizer: 'Илья В.',
    rating: 4.8,
    distance: '1.2 км',
    players: ['Саша', 'Илья', 'Марк', 'Данил', 'Кирилл', 'Антон'],
    chat: 8,
    comments: 3,
    coach: false,
    isNew: true,
    favorite: false,
    joined: true,
    nearby: true,
    image: '../SCORE PLAY/photo-plays/футбол.svg',
    description: 'Комфортный темп, без жесткого контакта. Собираемся за 10 минут до старта.'
  },
  {
    id: 'g2',
    title: 'Баскетбол 3×3 вечером',
    sport: 'Баскетбол',
    format: '3×3',
    level: 'Любитель',
    dateOffset: 1,
    time: '21:00',
    duration: 60,
    place: 'SCORE Court Park',
    metro: 'Бауманская',
    district: 'Басманный',
    price: 300,
    current: 5,
    max: 6,
    organizer: 'Алексей Н.',
    rating: 4.6,
    distance: '3.4 км',
    players: ['Алексей', 'Петр', 'Игорь', 'Лев', 'Степан'],
    chat: 5,
    comments: 2,
    coach: false,
    isNew: false,
    favorite: true,
    joined: false,
    nearby: false,
    image: '../SCORE PLAY/photo-plays/баскетбол.svg',
    description: 'Быстрые смены, игра до 21 очка, хороший свет и мягкое покрытие.'
  },
  {
    id: 'g3',
    title: 'Беговая тренировка',
    sport: 'Бег',
    format: 'Тренировка',
    level: 'Любитель',
    dateOffset: 0,
    time: '07:00',
    duration: 60,
    place: 'SCORE Run Point',
    metro: 'Сокольники',
    district: 'Сокольники',
    price: 0,
    current: 11,
    max: 14,
    organizer: 'Дарья А.',
    rating: 4.8,
    distance: '1.2 км',
    players: ['Дарья', 'Саша', 'Елена', 'Антон', 'Максим', 'Игорь', 'Оля', 'Никита', 'Марк', 'Роман', 'Лев'],
    chat: 14,
    comments: 6,
    coach: true,
    isNew: true,
    favorite: false,
    joined: false,
    nearby: true,
    image: '../SCORE PLAY/icons/map-area-base.jpg',
    description: 'Интервалы, заминка и несколько темповых групп для разного уровня.'
  },
  {
    id: 'g4',
    title: 'Падел для новичков',
    sport: 'Падел',
    format: '2×2',
    level: 'Новичок',
    dateOffset: 2,
    time: '10:30',
    duration: 90,
    place: 'SCORE Padel Hub',
    metro: 'Динамо',
    district: 'Аэропорт',
    price: 0,
    current: 3,
    max: 4,
    organizer: 'Марина К.',
    rating: 4.9,
    distance: '5.2 км',
    players: ['Марина', 'Саша', 'Ирина'],
    chat: 4,
    comments: 1,
    coach: true,
    isNew: true,
    favorite: false,
    joined: false,
    nearby: false,
    image: '../SCORE PLAY/photo-plays/падел.svg',
    description: 'Объясним правила, подберем пару и дадим ракетки на месте.'
  },
  {
    id: 'g5',
    title: 'Волейбол в зале',
    sport: 'Волейбол',
    format: '6×6',
    level: 'Средний',
    dateOffset: 3,
    time: '18:00',
    duration: 120,
    place: 'SCORE Hall Center',
    metro: 'Достоевская',
    district: 'Тверской',
    price: 450,
    current: 12,
    max: 12,
    organizer: 'SCORE Club',
    rating: 4.7,
    distance: '3.6 км',
    players: ['SCORE Club', 'Илья', 'Дарья', 'Елена', 'Антон', 'Максим', 'Олег', 'Петр', 'Лев', 'Роман', 'Никита', 'Кирилл'],
    chat: 21,
    comments: 7,
    coach: false,
    isNew: false,
    favorite: false,
    joined: false,
    nearby: false,
    image: '../SCORE PLAY/photo-plays/воллейбол.svg',
    description: 'Средний уровень, играем сетами, ждем игроков на замену.'
  }
];

const teams = [
  {
    id: 't1',
    name: 'SCORE UNITED',
    sport: 'Футбол',
    level: 'Любитель+',
    district: 'Юг Москвы',
    status: 'Нужны игроки',
    played: 42,
    wins: 26,
    attendance: 88,
    opponents: 14,
    members: [
      ['Саша Скоромиржа', 'Капитан · Нападающий'],
      ['Илья Воронов', 'Игрок · Вратарь'],
      ['Марк Громов', 'Игрок · Защитник'],
      ['Данил Ефремов', 'Игрок · Полузащитник'],
      ['Кирилл Ветров', 'Игрок · Защитник'],
      ['Антон Серов', 'Игрок · Нападающий']
    ],
    requests: [
      ['Никита Лавров', 'Любитель · Защитник'],
      ['Роман Ким', 'Средний · Вратарь']
    ],
    events: [
      { id: 'e1', type: 'Матч', title: 'Игра с North Side', time: 'Сегодня · 20:30', place: 'SCORE Arena', note: 'Нужно 2 игрока' },
      { id: 'e2', type: 'Тренировка', title: 'Тактика и стандарты', time: 'Чт · 19:00', place: 'Лужники 7×7', note: 'Подтверждено' }
    ],
    settings: ['Автоподбор игроков', 'Открытые заявки', 'Напоминание за 2 часа']
  },
  {
    id: 't2',
    name: 'Blue Hoops',
    sport: 'Баскетбол',
    level: 'Средний',
    district: 'Центр Москвы',
    status: 'Активна',
    played: 31,
    wins: 19,
    attendance: 78,
    opponents: 9,
    members: [
      ['Андрей Соколов', 'Капитан · Разыгрывающий'],
      ['Петр Власов', 'Игрок · Защитник'],
      ['Игорь Симонов', 'Игрок · Форвард'],
      ['Лев Макаров', 'Игрок · Центровой']
    ],
    requests: [['Степан Орлов', 'Средний · Центровой']],
    events: [
      { id: 'e3', type: 'Матч', title: 'Матч против Downtown Hoops', time: 'Сегодня · 21:00', place: 'SCORE Court', note: 'Состав подтвержден' },
      { id: 'e4', type: 'Тренировка', title: 'Бросковая сессия', time: 'Завтра · 19:30', place: 'SCORE Lab', note: 'Открыто 2 места' }
    ],
    settings: ['Закрытая команда', 'Ротация состава', 'Статистика матчей']
  }
];


// ---- MOB/components/ui.js ----

function progressBar(value, max, label = '') {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return `
    <div class="progress-block" aria-label="${escapeAttr(label)}">
      <div class="progress-meta">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(String(value))} / ${escapeHtml(String(max))}</strong>
      </div>
      <div class="progress-rail"><span style="width:${percent}%"></span></div>
    </div>
  `;
}

function statCard(label, value) {
  return `
    <div class="stat-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(String(value))}</strong>
    </div>
  `;
}

function chip({ label, active = false, disabled = false, action = '', value = '', extraClass = '' }) {
  const actionAttrs = action ? `data-action="${escapeAttr(action)}" data-value="${escapeAttr(value)}"` : '';
  return `
    <button class="chip ${active ? 'is-active' : ''} ${disabled ? 'is-disabled' : ''} ${extraClass}" type="button" ${actionAttrs} ${disabled ? 'disabled' : ''}>
      ${escapeHtml(label)}
    </button>
  `;
}

function statusPill(label, className = '') {
  return `<span class="status-pill ${escapeAttr(className)}">${escapeHtml(label)}</span>`;
}

function emptyState(title, text, actionLabel = '', action = '', value = '') {
  const actionAttrs = action ? `data-action="${escapeAttr(action)}" ${value ? `data-value="${escapeAttr(value)}"` : ''}` : '';
  return `
    <article class="empty-state">
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(text)}</p>
      ${actionLabel ? `<button class="secondary-pill" type="button" ${actionAttrs}>${escapeHtml(actionLabel)}</button>` : ''}
    </article>
  `;
}

function loadingState(text = 'Загружаем') {
  return `
    <div class="loading-state" aria-live="polite">
      <span></span>
      <p>${escapeHtml(text)}</p>
    </div>
  `;
}

function searchBar({ scope, value, placeholder, buttonLabel = '', buttonAction = '' }) {
  return `
    <div class="search-row">
      <label class="search-bar">
        <span>Поиск</span>
        <input data-search="${escapeAttr(scope)}" type="search" placeholder="${escapeAttr(placeholder)}" value="${escapeAttr(value)}">
      </label>
      ${buttonLabel ? `<button class="button button-secondary search-action" type="button" data-action="${escapeAttr(buttonAction)}">${escapeHtml(buttonLabel)}</button>` : ''}
    </div>
  `;
}

function viewToggle(active, action = 'game-view') {
  return `
    <div class="view-toggle" role="group" aria-label="Вид">
      <button class="${active === 'list' ? 'is-active' : ''}" type="button" data-action="${escapeAttr(action)}" data-value="list">Список</button>
      <button class="${active === 'map' ? 'is-active' : ''}" type="button" data-action="${escapeAttr(action)}" data-value="map">Карта</button>
    </div>
  `;
}


// ---- MOB/components/cards.js ----

function renderGameCard(game) {
  const status = getGameStatus(game);
  const occupancy = Math.min(100, Math.round((Number(game.current || 0) / Math.max(1, Number(game.max || 1))) * 100));
  return `
    <article class="game-card card-affordance" role="button" tabindex="0" data-action="game-detail" data-id="${game.id}">
      <div class="card-media game-media">
        <img src="${game.image}" alt="${escapeAttr(game.title)}">
        <div class="media-topline">
          ${statusPill(status.label, status.className)}
          <button class="save-button ${game.favorite ? 'is-active' : ''}" type="button" data-action="favorite-game" data-id="${game.id}">
            ${game.favorite ? 'Сохранено' : 'Сохранить'}
          </button>
        </div>
      </div>
      <div class="card-content">
        <div class="card-title-row">
          <h3>${escapeHtml(game.title)}</h3>
          <strong>${formatPrice(game.price)}</strong>
        </div>
        <p>${formatGameDate(game)} · ${escapeHtml(game.place)}</p>
        <div class="card-meta-row">
          <span>${escapeHtml(game.district)}</span>
          <span>м. ${escapeHtml(game.metro)}</span>
          <span>${escapeHtml(game.distance || 'рядом')}</span>
        </div>
        <div class="chip-line">
          <span>${escapeHtml(game.sport)}</span>
          <span>${escapeHtml(game.format)}</span>
          <span>${game.current}/${game.max}</span>
          ${game.coach ? '<span>С тренером</span>' : ''}
          ${game.nearby ? '<span>Рядом</span>' : ''}
        </div>
        <div class="card-meta-row">
          <span>${(game.players || []).slice(0, 3).map(escapeHtml).join(', ')}${(game.players || []).length > 3 ? ' +' + ((game.players || []).length - 3) : ''}</span>
          <span>Чат ${game.chat || 0}</span>
          <span>Комментарии ${game.comments || 0}</span>
        </div>
        <div class="card-fill">
          <div><span>Набор игроков</span><strong>${game.current}/${game.max}</strong></div>
          <i style="width:${occupancy}%"></i>
        </div>
        <div class="card-actions">
          <button class="button button-primary" type="button" data-action="join-game" data-id="${game.id}" ${game.current >= game.max && !game.joined ? 'disabled' : ''}>
            ${game.joined ? 'Вы участвуете' : game.current >= game.max ? 'Собрана' : 'Участвовать'}
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderVenueCard(venue) {
  return `
    <article class="venue-card card-affordance" role="button" tabindex="0" data-action="venue-detail" data-id="${venue.id}">
      <div class="card-media venue-media">
        <img src="${venue.photo}" alt="${escapeAttr(venue.name)}">
        <div class="media-topline">
          ${statusPill(venue.label, venue.free ? 'is-free' : venue.indoor ? 'is-indoor' : 'is-open')}
          <button class="save-button ${venue.favorite ? 'is-active' : ''}" type="button" data-action="favorite-venue" data-id="${venue.id}">
            ${venue.favorite ? 'Сохранено' : 'Сохранить'}
          </button>
        </div>
      </div>
      <div class="card-content">
        <div class="card-title-row">
          <h3>${escapeHtml(venue.name)}</h3>
          <strong>${venue.price === 0 ? 'Бесплатно' : `${formatPrice(venue.price)}/ч`}</strong>
        </div>
        <p>${escapeHtml(venue.district)} · м. ${escapeHtml(venue.metro)}</p>
        <div class="card-meta-row">
          <span>${escapeHtml(venue.address)}</span>
          <span>★ ${venue.rating}</span>
          <span>${escapeHtml(venue.distance || 'рядом')}</span>
        </div>
        <div class="chip-line">
          <span>${escapeHtml(venue.sport)}</span>
          <span>${venue.indoor ? 'В помещении' : 'Открытая'}</span>
          <span>${escapeHtml(venue.freeTime || 'Свободное время')}</span>
          <span>${escapeHtml(venue.surface || 'Покрытие')}</span>
          <span>${escapeHtml(venue.size || 'Размер')}</span>
          ${(venue.amenities || []).slice(0, 2).map((item) => `<span>${escapeHtml(item)}</span>`).join('')}
        </div>
      </div>
    </article>
  `;
}

function renderProfileCard(profile) {
  const nickname = profile.nickname || '#77777';
  const primarySport = profile.sports?.[0]?.type || 'Спорт';
  const nameParts = String(profile.name || '').trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || profile.name || 'Игрок';
  const lastName = nameParts.slice(1).join(' ');
  return `
    <article class="profile-card profile-hero card-affordance" role="button" tabindex="0" data-action="profile-detail">
      <div class="profile-head">
        <img src="${getAvatarSrc(profile.avatarId, profile.avatarDataUrl)}" alt="">
        <div class="profile-title">
          <p>${escapeHtml(nickname)}</p>
          <h2>
            <span>${escapeHtml(firstName)}</span>
            ${lastName ? `<span>${escapeHtml(lastName)}</span>` : ''}
          </h2>
        </div>
      </div>
      <div class="profile-identity-row">
        <span>${escapeHtml(primarySport)}</span>
        <span>${escapeHtml(profile.level)}</span>
        <span>${escapeHtml(profile.goal)}</span>
      </div>
      <div class="profile-metrics">
        ${statCard('Игр сыграно', profile.stats.games)}
        ${statCard('Очков SCORE', formatScorePoints(profile.stats.scorePoints))}
      </div>
      <div class="profile-sports-card">
        <span>Виды спорта</span>
        <div>
          ${profile.sports.map((sport) => `<b>${escapeHtml(sport.type)}</b>`).join('')}
        </div>
      </div>
    </article>
  `;
}

function formatScorePoints(value) {
  return Number(value || 0).toLocaleString('ru-RU');
}

function renderTeamCard(team, compact = false) {
  return `
    <article class="team-card">
      <div class="team-card-top">
        <div>
          <span class="eyebrow">${compact ? 'Моя команда' : 'Команда'}</span>
          <h2>${escapeHtml(team.name)}</h2>
          <p>${escapeHtml(team.sport)} · ${escapeHtml(team.level)} · ${escapeHtml(team.district)}</p>
        </div>
        ${statusPill(team.status, 'is-almost')}
      </div>
      <div class="stats-grid">
        ${statCard('Игры', team.played)}
        ${statCard('Победы', team.wins)}
        ${statCard('Состав', team.members.length)}
        ${statCard('Заявки', team.requests.length)}
      </div>
      <div class="card-actions">
        <button class="button button-secondary" type="button" data-action="nav" data-value="team">Открыть команду</button>
        <button class="button button-primary" type="button" data-action="open-team-requests">Заявки</button>
      </div>
    </article>
  `;
}

function renderTeamEvent(event) {
  return `
    <button class="event-card card-affordance" type="button" data-action="team-event" data-id="${event.id}">
      <div>
        ${statusPill(event.type, 'is-new')}
        <h3>${escapeHtml(event.title)}</h3>
        <p>${escapeHtml(event.time)} · ${escapeHtml(event.place)}</p>
      </div>
      <span>${escapeHtml(event.note)}</span>
    </button>
  `;
}

function renderMemberRow([name, meta], action = '') {
  return `
    <div class="list-row">
      <div>
        <strong>${escapeHtml(name)}</strong>
        <span>${escapeHtml(meta)}</span>
      </div>
      ${action || '<span class="meta-pill">Игрок</span>'}
    </div>
  `;
}

function renderGameRow(game) {
  return `
    <div class="list-row">
      <div>
        <strong>${escapeHtml(game.title)}</strong>
        <span>${formatGameDate(game)} · ${escapeHtml(game.place)}</span>
      </div>
      <button class="small-action" type="button" data-action="game-detail" data-id="${game.id}">Открыть</button>
    </div>
  `;
}

function renderEmptyGames() {
  return emptyState('Игр пока нет', 'Когда вы присоединитесь к игре, она появится здесь.', 'Найти игру', 'nav');
}


// ---- MOB/components/sheets.js ----

function createGameSheet({ state, defaultDate }) {
  return `
    <div class="sheet-state" data-sheet-state="form">
      <div class="sheet-heading">
        <span class="eyebrow">Новая игра</span>
        <h2>Создать игру</h2>
        <p>Заполните ключевые детали, чтобы игроки сразу понимали формат и условия.</p>
      </div>
      <form id="create-game-form" class="form-grid" novalidate>
        <label class="field">Название<input name="title" required placeholder="Например, Футбол вечером"></label>
        <div class="form-pair">
          <label class="field">Спорт<select name="sport" required>${uniqueSports(state.games).map((sport) => `<option>${escapeHtml(sport)}</option>`).join('')}<option>Сквош</option></select></label>
          <label class="field">Формат<select name="format" required><option>5×5</option><option>3×3</option><option>2×2</option><option>6×6</option><option>Тренировка</option></select></label>
        </div>
        <div class="form-pair">
          <label class="field">Дата<input name="date" type="date" required value="${toInputDate(defaultDate)}"></label>
          <label class="field">Время<input name="time" type="time" required value="20:00"></label>
        </div>
        <div class="form-pair">
          <label class="field">Мест всего<input name="max" type="number" min="1" required value="10"></label>
          <label class="field">Уже есть<input name="current" type="number" min="0" required value="1"></label>
        </div>
        <label class="field">Площадка<input name="place" required value="SCORE Arena"></label>
        <label class="field">Цена за игрока<input name="price" type="number" min="0" step="50" required value="500"></label>
        <label class="field">Описание<textarea name="description" placeholder="Темп, уровень, что взять с собой"></textarea></label>
        <div id="create-game-errors" class="form-errors" aria-live="polite"></div>
        <button class="button button-primary button-full" type="button" data-action="save-game" data-create-game-submit disabled>Опубликовать</button>
      </form>
    </div>
    <div class="sheet-success" data-sheet-state="success" hidden>
      <strong>Игра опубликована</strong>
      <p>Она добавлена в список игр и отмечена как ваша.</p>
      <button class="button button-primary button-full" type="button" data-close-sheet>Готово</button>
    </div>
  `;
}

function gameDetailSheet(game) {
  const status = getGameStatus(game);
  const players = game.players || [];
  return `
    <img class="sheet-hero" src="${game.image}" alt="${escapeAttr(game.title)}">
    <div class="sheet-heading">
      <span class="eyebrow">${escapeHtml(game.sport)} · ${escapeHtml(game.format)}</span>
      <h2>${escapeHtml(game.title)}</h2>
      <p>${escapeHtml(game.description)}</p>
    </div>
    <div class="stats-grid detail-grid">
      ${statCard('Когда', formatGameDate(game))}
      ${statCard('Место', game.place)}
      ${statCard('Состав', `${game.current}/${game.max}`)}
      ${statCard('Цена', formatPrice(game.price))}
      ${statCard('Уровень', game.level)}
      ${statCard('Статус', status.label)}
    </div>
    <section class="section-card flat">
      <div class="section-header compact">
        <div><span class="eyebrow">Организатор</span><h3>${escapeHtml(game.organizer)}</h3></div>
        <span class="meta-pill">Рейтинг ${game.rating}</span>
      </div>
    </section>
    <section class="section-card flat">
      <div class="section-header compact">
        <h3>Площадка</h3>
        <span class="meta-pill">${escapeHtml(game.distance || 'рядом')}</span>
      </div>
      <p class="detail-copy">${escapeHtml(game.place)} · м. ${escapeHtml(game.metro)} · ${escapeHtml(game.district)}</p>
    </section>
    <section class="section-card flat">
      <div class="section-header compact">
        <h3>Игроки</h3>
        <span class="meta-pill">${game.current}/${game.max}</span>
      </div>
      <div class="player-chip-grid">
        ${players.length ? players.map((name) => `<span>${escapeHtml(name)}</span>`).join('') : '<span>Список появится после подключения backend</span>'}
      </div>
    </section>
    <section class="section-card flat">
      <div class="game-social-grid">
        <button type="button" data-action="open-game-chat"><strong>Чат игры</strong><span>${game.chat || 0} сообщений</span></button>
        <button type="button" data-action="open-game-chat"><strong>Комментарии</strong><span>${game.comments || 0} обсуждений</span></button>
      </div>
    </section>
    <div class="card-actions">
      <button class="button button-secondary" type="button" data-action="favorite-game" data-id="${game.id}">${game.favorite ? 'В избранном' : 'Сохранить'}</button>
      <button class="button button-primary" type="button" data-action="join-game" data-id="${game.id}" ${game.current >= game.max && !game.joined ? 'disabled' : ''}>${game.joined ? 'Выйти из игры' : 'Участвовать'}</button>
    </div>
  `;
}

function venueDetailSheet(venue) {
  return `
    <img class="sheet-hero" src="${venue.photo}" alt="${escapeAttr(venue.name)}">
    <div class="sheet-heading">
      <span class="eyebrow">${escapeHtml(venue.sport)} · ${escapeHtml(venue.label)}</span>
      <h2>${escapeHtml(venue.name)}</h2>
      <p>${escapeHtml(venue.description)}</p>
    </div>
    <div class="stats-grid detail-grid">
      ${statCard('Цена', venue.price === 0 ? 'Бесплатно' : `${formatPrice(venue.price)}/ч`)}
      ${statCard('Метро', venue.metro)}
      ${statCard('Рейтинг', venue.rating)}
      ${statCard('Тип', venue.indoor ? 'В помещении' : 'Открытая')}
    </div>
    <section class="venue-gallery">
      <img src="${venue.photo}" alt="">
      <img src="${venue.photo}" alt="">
      <img src="${venue.photo}" alt="">
    </section>
    <section class="section-card flat">
      <div class="section-header compact"><h3>Описание</h3></div>
      <p class="detail-copy">${escapeHtml(venue.description)}</p>
      <div class="chip-scroll wrap">
        <span class="meta-pill">${escapeHtml(venue.distance || 'рядом')}</span>
        <span class="meta-pill">${escapeHtml(venue.surface || 'покрытие')}</span>
        <span class="meta-pill">${escapeHtml(venue.size || 'размер')}</span>
        <span class="meta-pill">${escapeHtml(venue.freeTime || 'свободное время')}</span>
      </div>
    </section>
    <section class="section-card flat">
      <div class="section-header compact">
        <h3>Отзывы</h3>
        <span class="meta-pill">${venue.reviews || 0} отзывов</span>
      </div>
      <p class="detail-copy">Игроки отмечают удобное расположение, чистые раздевалки и стабильное освещение вечером.</p>
    </section>
    <section class="section-card flat">
      <div class="section-header compact"><h3>Расписание</h3></div>
      <div class="schedule-grid">
        ${(venue.schedule || []).map((slot) => `<span>${escapeHtml(slot)}</span>`).join('')}
      </div>
    </section>
    <div class="chip-scroll wrap">${(venue.amenities || []).map((item) => `<span class="meta-pill">${escapeHtml(item)}</span>`).join('')}</div>
    <section class="section-card flat">
      <div class="section-header compact"><h3>Похожие площадки</h3></div>
      <p class="detail-copy">Еще 4 площадки с похожей ценой и доступным временем рядом с вашим районом.</p>
    </section>
    <div class="card-actions">
      <button class="button button-secondary" type="button" data-action="favorite-venue" data-id="${venue.id}">${venue.favorite ? 'В избранном' : 'Сохранить'}</button>
      <button class="button button-primary" type="button" data-action="book-selected-venue">Забронировать</button>
    </div>
  `;
}

function teamRequestsSheet(team) {
  return `
    <div class="sheet-heading">
      <span class="eyebrow">${escapeHtml(team.name)}</span>
      <h2>Заявки и приглашения</h2>
    </div>
    ${team.requests.length ? team.requests.map(([name, meta]) => `
      <div class="list-row">
        <div><strong>${escapeHtml(name)}</strong><span>${escapeHtml(meta)}</span></div>
        <button class="small-action is-primary" type="button">Принять</button>
      </div>
    `).join('') : emptyState('Заявок нет', 'Когда игроки захотят в команду, они появятся здесь.')}
  `;
}

function notificationsSheet(notifications) {
  return `
    <div class="sheet-heading">
      <span class="eyebrow">SCORE</span>
      <h2>Уведомления</h2>
      <p>Игры, площадки и заявки, которые требуют внимания.</p>
    </div>
    <div class="notification-list">
      ${notifications.length ? notifications.map((item) => `
        <article class="notification-card ${item.unread ? 'is-unread' : ''}">
          <div>
            <span>${escapeHtml(item.type)}</span>
            <small>${escapeHtml(item.time)}</small>
          </div>
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.text)}</p>
        </article>
      `).join('') : emptyState('Пока тихо', 'Когда появятся игры, заявки или обновления площадок, они будут здесь.')}
    </div>
  `;
}

function profileDetailSheet(profile, editing = false) {
  const nickname = profile.nickname || '#77777';
  const profileItems = [
    ['Расположение', 'district', profile.district || profile.city || 'Москва', './icons/Местоположение%20.png'],
    ['Номер игрока', 'nickname', nickname, './icons/Профиль.png'],
    ['Телефон', 'phone', profile.phone || 'Не указан', './icons/Телефон.png'],
    ['Почта', 'email', profile.email || 'Не указана', './icons/Почта.png'],
    ['Соцсеть', 'social', profile.social || 'Не указана', './icons/Сайт.png']
  ];
  const tag = editing ? 'form' : 'section';
  const formAttrs = editing ? ' id="profile-form"' : '';
  const avatarAction = editing ? 'change-avatar' : 'view-avatar';
  return `
    <${tag}${formAttrs} class="profile-detail-card ${editing ? 'is-editing' : ''}">
      <div class="profile-sticky-title" data-profile-sticky-title>Профиль игрока</div>
      <div class="profile-detail-avatar-row">
        <button class="profile-detail-action is-primary" type="button" data-action="share-profile" aria-label="Поделиться профилем">
          <img src="./icons/поделиться.png" alt="" aria-hidden="true">
        </button>
        <button class="profile-detail-avatar-button" type="button" data-action="${avatarAction}" aria-label="${editing ? 'Сменить аватар' : 'Открыть аватар'}">
          <img class="profile-detail-avatar" src="${getAvatarSrc(profile.avatarId, profile.avatarDataUrl)}" alt="">
        </button>
        <button class="profile-detail-action" type="button" data-action="edit-profile" aria-label="Редактировать профиль">
          <img src="./icons/Редактировать.png" alt="" aria-hidden="true">
        </button>
      </div>
      <div class="profile-detail-heading">
        ${editing ? `
          <label class="profile-inline-field is-name">Имя и фамилия<input name="name" value="${escapeAttr(profile.name)}"></label>
          <label class="profile-inline-field is-nickname">ID игрока<input name="nickname" value="${escapeAttr(nickname)}"></label>
        ` : `
          <h2>${escapeHtml(profile.name)}</h2>
          <p>${escapeHtml(nickname)}</p>
        `}
      </div>
      <div class="profile-detail-metrics">
        ${statCard('Игр сыграно', profile.stats.games)}
        ${statCard('Очков SCORE', Number(profile.stats.scorePoints || 0).toLocaleString('ru-RU'))}
      </div>
      <div class="profile-info-grid">
        ${profileItems.map(([label, name, value, icon]) => `
          <div class="profile-info-item">
            <img src="${icon}" alt="" aria-hidden="true">
            <span>${escapeHtml(label)}</span>
            ${editing && name !== 'nickname' ? `<input name="${name}" value="${escapeAttr(value)}">` : `<strong>${escapeHtml(value)}</strong>`}
          </div>
        `).join('')}
      </div>
      <div class="profile-sports-card profile-detail-sports">
        <span>Виды спорта</span>
        <div>${profile.sports.map((sport) => `<b>${escapeHtml(sport.type)}</b>`).join('')}</div>
      </div>
      ${editing ? `
        <label class="profile-detail-about is-editing">О себе<textarea name="about">${escapeHtml(profile.about)}</textarea></label>
        <button class="button button-primary button-full profile-submit" type="button" data-action="save-profile">Сохранить</button>
      ` : `<p class="profile-detail-about">${escapeHtml(profile.about)}</p>`}
    </${tag}>
  `;
}

function avatarViewSheet(profile) {
  return `
    <section class="avatar-view-card">
      <button class="avatar-view-close" type="button" data-close-sheet aria-label="Закрыть">
        <img src="./icons/Крестик.png" alt="" aria-hidden="true">
      </button>
      <img src="${getAvatarSrc(profile.avatarId, profile.avatarDataUrl)}" alt="">
    </section>
  `;
}

function avatarChangeSheet(profile) {
  const avatarIds = [1, 2, 3, 4, 5, 6, 7];
  return `
    <section class="avatar-change-card">
      <button class="avatar-sheet-close" type="button" data-close-sheet aria-label="Закрыть">
        <img src="./icons/Крестик.png" alt="" aria-hidden="true">
      </button>
      <h2>Сменить аватар</h2>
      <img class="avatar-change-preview" data-avatar-preview src="${getAvatarSrc(profile.avatarId, profile.avatarDataUrl)}" alt="">
      <div class="avatar-source-row">
        <label class="avatar-source-action">
          <img src="./icons/Профиль.png" alt="" aria-hidden="true">
          <span>Камера</span>
          <input name="avatar" type="file" accept="image/*" capture="user">
        </label>
        <label class="avatar-source-action">
          <img src="./icons/Почта.png" alt="" aria-hidden="true">
          <span>Галерея</span>
          <input name="avatar" type="file" accept="image/*">
        </label>
      </div>
      <h3>Аватары</h3>
      <div class="avatar-preset-grid">
        ${avatarIds.map((id) => `
          <button class="${Number(profile.avatarId) === id && !profile.avatarDataUrl ? 'is-active' : ''}" type="button" data-action="select-avatar" data-value="${id}" aria-label="Аватар ${id}">
            <img src="${getAvatarSrc(id, '')}" alt="">
          </button>
        `).join('')}
      </div>
    </section>
  `;
}


// ---- MOB/screens/index.js ----

function renderHome({ state, nextGame, home }) {
  const profile = state.profile;
  const stats = profile.stats || {};
  const hero = home?.hero || {};
  const heroGame = state.games.find((game) => game.id === hero.gameId) || nextGame;
  const quickActions = home?.quickActions || [];
  const activity = home?.activity || [];
  const tasks = home?.tasks || [];
  const news = home?.news || [];
  return `
    <div class="screen-stack">
      <article class="home-main-card mvp-hero-card">
        <div class="home-main-copy">
          <span class="eyebrow">${escapeHtml(hero.type || 'Главное сейчас')}</span>
          <h1>${escapeHtml(hero.title || heroGame.title)}</h1>
          <p>${escapeHtml(hero.text || `${formatGameDate(heroGame)} · ${heroGame.place}`)}</p>
        </div>
        <div class="home-game-panel" role="button" tabindex="0" data-action="game-detail" data-id="${heroGame.id}">
          <img src="${heroGame.image}" alt="">
          <div>
            <span>${heroGame.joined ? 'Вы участвуете' : 'Есть свободные места'}</span>
            <strong>${escapeHtml(heroGame.title)}</strong>
            <small>${formatGameDate(heroGame)} · ${heroGame.current} из ${heroGame.max} игроков · ${formatPrice(heroGame.price)}</small>
          </div>
        </div>
        <div class="home-main-actions">
          <button class="button button-primary" type="button" data-action="game-detail" data-id="${heroGame.id}">${escapeHtml(hero.action || 'Открыть игру')}</button>
          <button class="button button-secondary" type="button" data-action="nav" data-value="games">Все игры</button>
        </div>
      </article>

      <section class="home-block">
        <div class="section-header compact">
          <h2>Быстрые действия</h2>
        </div>
        <div class="quick-action-grid">
          ${quickActions.map(renderQuickAction).join('')}
        </div>
      </section>

      <section class="section-card">
        <div class="section-header compact">
          <h2>Моя активность</h2>
          <button class="link-action" type="button" data-action="open-notifications">Все ›</button>
        </div>
        <div class="activity-grid">
          ${activity.map(renderActivityCard).join('')}
        </div>
      </section>

      <section class="section-card">
        <div class="section-header compact">
          <h2>Ежедневные задания</h2>
          <span class="result-label">+${formatNumber(tasks.reduce((sum, task) => sum + Number(task.reward || 0), 0))} SCORE</span>
        </div>
        <div class="daily-task-list">
          ${tasks.map(renderDailyTask).join('')}
        </div>
      </section>

      <section class="home-score-card">
        <div>
          <span class="eyebrow">SCORE</span>
          <h2>${formatNumber(stats.scorePoints || 0)}</h2>
          <p>Уровень 4 · до уровня 5 осталось ${Math.max(0, Number(stats.levelTarget || 70) - Number(stats.levelScore || 0))} игр</p>
        </div>
        ${progressBar(stats.levelScore || 0, stats.levelTarget || 70, 'Прогресс уровня')}
      </section>

      <section class="home-block">
        <div class="section-header compact">
          <h2>Новости SCORE</h2>
          <button class="link-action" type="button" data-action="open-notifications">Все ›</button>
        </div>
        <div class="news-strip">
          ${news.map(renderNewsCard).join('')}
        </div>
      </section>
    </div>
  `;
}

function renderGamesScreen({ state, games }) {
  const gameSports = ['Все', ...uniqueSports(state.games)];
  const gameLevels = ['Все', ...Array.from(new Set(state.games.map((game) => game.level).filter(Boolean)))];
  return `
    <div class="screen-stack">
      ${searchBar({ scope: 'games', value: state.filters.games.query, placeholder: 'Поиск игр', buttonLabel: 'Создать', buttonAction: 'create-game' })}
      <div class="toolbar-row">
        <div class="chip-scroll">
          ${chip({ label: 'Все', active: allGameFiltersOff(state.filters.games), action: 'game-filter', value: 'reset' })}
          ${chip({ label: 'Сегодня', active: state.filters.games.today, action: 'game-filter', value: 'today' })}
          ${chip({ label: 'Бесплатно', active: state.filters.games.free, action: 'game-filter', value: 'free' })}
          ${chip({ label: 'С тренером', active: state.filters.games.coach, action: 'game-filter', value: 'coach' })}
          ${chip({ label: 'Рядом', active: state.filters.games.nearby, action: 'game-filter', value: 'nearby' })}
        </div>
      </div>
      <div class="filter-groups">
        <div>
          <span>Вид спорта</span>
          <div class="chip-scroll">${gameSports.map((sport) => chip({ label: sport, active: state.filters.games.sport === sport, action: 'game-filter', value: `sport:${sport}` })).join('')}</div>
        </div>
        <div>
          <span>Дата</span>
          <div class="chip-scroll">
            ${[
              ['any', 'Любая'],
              ['today', 'Сегодня'],
              ['week', 'На неделе']
            ].map(([value, label]) => chip({ label, active: state.filters.games.date === value, action: 'game-filter', value: `date:${value}` })).join('')}
          </div>
        </div>
        <div>
          <span>Время</span>
          <div class="chip-scroll">
            ${[
              ['any', 'Любое'],
              ['morning', 'Утро'],
              ['evening', 'Вечер']
            ].map(([value, label]) => chip({ label, active: state.filters.games.time === value, action: 'game-filter', value: `time:${value}` })).join('')}
          </div>
        </div>
        <div>
          <span>Расстояние</span>
          <div class="chip-scroll">
            ${[
              ['any', 'Любое'],
              ['near', 'До 2 км'],
              ['five', 'До 5 км']
            ].map(([value, label]) => chip({ label, active: state.filters.games.distance === value, action: 'game-filter', value: `distance:${value}` })).join('')}
          </div>
        </div>
        <div>
          <span>Уровень и места</span>
          <div class="chip-scroll">
            ${gameLevels.map((level) => chip({ label: level, active: state.filters.games.level === level, action: 'game-filter', value: `level:${level}` })).join('')}
            ${chip({ label: 'Есть места', active: state.filters.games.slots === 'open', action: 'game-filter', value: 'slots:open' })}
          </div>
        </div>
        <div>
          <span>Цена</span>
          <div class="chip-scroll">
            ${chip({ label: 'Любая', active: state.filters.games.price === 'any', action: 'game-filter', value: 'price:any' })}
            ${chip({ label: 'Бесплатно', active: state.filters.games.price === 'free', action: 'game-filter', value: 'price:free' })}
            ${chip({ label: 'Платные', active: state.filters.games.price === 'paid', action: 'game-filter', value: 'price:paid' })}
          </div>
        </div>
      </div>
      <div class="section-header compact">
        <span class="result-label">Найдено: ${games.length}</span>
        ${viewToggle(state.filters.games.view)}
      </div>
      ${state.filters.games.view === 'map' ? renderMapPreview(games) : ''}
      <div class="list-stack">
        ${games.length ? games.map(renderGameCard).join('') : emptyState('Игр не найдено', 'Попробуйте снять фильтр или создать свою игру.', 'Создать игру', 'create-game')}
      </div>
    </div>
  `;
}

function renderVenuesScreen({ state, venues }) {
  const sports = ['Все', ...uniqueSports(state.venues)];
  const locations = ['Все', ...Array.from(new Set(state.venues.flatMap((venue) => [venue.district, venue.metro]).filter(Boolean)))];
  const amenities = ['Все', ...Array.from(new Set(state.venues.flatMap((venue) => venue.amenities || [])))];
  const surfaces = ['Все', ...Array.from(new Set(state.venues.map((venue) => venue.surface).filter(Boolean)))];
  const sizes = ['Все', ...Array.from(new Set(state.venues.map((venue) => venue.size).filter(Boolean)))];
  return `
    <div class="screen-stack">
      ${searchBar({ scope: 'venues', value: state.filters.venues.query, placeholder: 'Поиск площадок' })}
      <div class="chip-scroll filter-rail">
        ${chip({ label: 'Все', active: allVenueFiltersOff(state.filters.venues), action: 'venue-filter', value: 'reset' })}
        ${chip({ label: 'Новые', active: state.filters.venues.isNew, action: 'venue-filter', value: 'isNew' })}
        ${chip({ label: 'Бесплатно', active: state.filters.venues.free, action: 'venue-filter', value: 'free' })}
        ${chip({ label: 'Избранное', active: state.filters.venues.favorite, action: 'venue-filter', value: 'favorite' })}
        ${chip({ label: 'В помещении', active: state.filters.venues.indoor, action: 'venue-filter', value: 'indoor' })}
        ${chip({ label: 'Открытая', active: state.filters.venues.open, action: 'venue-filter', value: 'open' })}
      </div>
      <div class="filter-groups">
        <div>
          <span>Вид спорта</span>
          <div class="chip-scroll">${sports.map((sport) => chip({ label: sport, active: state.filters.venues.sport === sport, action: 'venue-filter', value: `sport:${sport}` })).join('')}</div>
        </div>
        <div>
          <span>Стоимость</span>
          <div class="chip-scroll">
            ${[
              ['any', 'Любая'],
              ['free', 'Бесплатно'],
              ['low', 'до 2 500 ₽'],
              ['mid', '2 500-5 000 ₽'],
              ['paid', 'Платные']
            ].map(([value, label]) => chip({ label, active: state.filters.venues.price === value, action: 'venue-filter', value: `price:${value}` })).join('')}
          </div>
        </div>
        <div>
          <span>Расстояние</span>
          <div class="chip-scroll">
            ${[
              ['any', 'Любое'],
              ['near', 'До 2 км'],
              ['five', 'До 5 км']
            ].map(([value, label]) => chip({ label, active: state.filters.venues.distance === value, action: 'venue-filter', value: `distance:${value}` })).join('')}
          </div>
        </div>
        <div>
          <span>Покрытие</span>
          <div class="chip-scroll">${surfaces.map((surface) => chip({ label: surface, active: state.filters.venues.surface === surface, action: 'venue-filter', value: `surface:${surface}` })).join('')}</div>
        </div>
        <div>
          <span>Освещение</span>
          <div class="chip-scroll">
            ${[
              ['any', 'Любое'],
              ['yes', 'Есть свет']
            ].map(([value, label]) => chip({ label, active: state.filters.venues.lighting === value, action: 'venue-filter', value: `lighting:${value}` })).join('')}
          </div>
        </div>
        <div>
          <span>Размер площадки</span>
          <div class="chip-scroll">${sizes.map((size) => chip({ label: size, active: state.filters.venues.size === size, action: 'venue-filter', value: `size:${size}` })).join('')}</div>
        </div>
        <div>
          <span>Рейтинг и оплата</span>
          <div class="chip-scroll">
            ${chip({ label: '4.7+', active: state.filters.venues.rating === 'high', action: 'venue-filter', value: 'rating:high' })}
            ${chip({ label: 'Бесплатные', active: state.filters.venues.paid === 'free', action: 'venue-filter', value: 'paid:free' })}
            ${chip({ label: 'Платные', active: state.filters.venues.paid === 'paid', action: 'venue-filter', value: 'paid:paid' })}
          </div>
        </div>
        <div>
          <span>Расположение</span>
          <div class="chip-scroll">${locations.map((location) => chip({ label: location, active: state.filters.venues.location === location, action: 'venue-filter', value: `location:${location}` })).join('')}</div>
        </div>
        <div>
          <span>Удобства</span>
          <div class="chip-scroll">${amenities.map((amenity) => chip({ label: amenity, active: state.filters.venues.amenity === amenity, action: 'venue-filter', value: `amenity:${amenity}` })).join('')}</div>
        </div>
      </div>
      <div class="section-header compact">
        <span class="result-label">Найдено: ${venues.length}</span>
        ${viewToggle(state.filters.venues.view, 'venue-view')}
      </div>
      ${state.filters.venues.view === 'map' ? renderVenueMapPreview(venues) : ''}
      <div class="list-stack">
        ${venues.length ? venues.map(renderVenueCard).join('') : emptyState('Площадок не найдено', 'Измените фильтры или посмотрите соседний район.', 'Сбросить фильтры', 'venue-filter', 'reset')}
      </div>
    </div>
  `;
}

function renderProgressScreen({ state, joinedGames }) {
  const stats = state.profile.stats || {};
  const week = stats.week || {};
  const month = stats.month || {};
  const totalMinutes = Math.max(Number(month.minutes || 0) * 4, Number(stats.games || 0) * 78);
  const achievements = state.profile.achievements || [];
  const earnedAchievements = achievements.filter((item) => item.unlocked);
  const progressAchievements = achievements.filter((item) => !item.unlocked);
  const footballGames = state.games.filter((game) => game.sport === 'Футбол' && game.joined).length || 23;
  return `
    <div class="screen-stack">
      <section class="progress-hero-card">
        <div>
          <span class="eyebrow">SCORE Progress</span>
          <h2>${formatNumber(stats.scorePoints || 0)}</h2>
          <p>очков за активность, игры, команды и сохраненные площадки</p>
        </div>
        <div class="progress-level-ring" aria-label="Уровень 4">
          <span>Уровень</span>
          <strong>4</strong>
        </div>
        ${progressBar(stats.levelScore || stats.games || 0, stats.levelTarget || 70, 'До следующего уровня')}
      </section>

      <section class="section-card">
        <div class="section-header compact"><h2>Статистика</h2></div>
        <div class="progress-period-grid">
          ${renderPeriodStat('Неделя', week.games || 0, week.scorePoints || 0, week.minutes || 0)}
          ${renderPeriodStat('Месяц', month.games || 0, month.scorePoints || 0, month.minutes || 0)}
          ${renderPeriodStat('Все время', stats.games || joinedGames.length, stats.scorePoints || 0, totalMinutes)}
        </div>
      </section>

      <section class="section-card">
        <div class="section-header compact">
          <h2>Полученные достижения</h2>
          <span class="result-label">${earnedAchievements.length}</span>
        </div>
        <div class="achievement-grid">
          ${earnedAchievements.length ? earnedAchievements.map(renderAchievement).join('') : emptyState('Пока нет открытых достижений', 'Сыграйте первую игру или забронируйте площадку.')}
        </div>
      </section>

      <section class="section-card">
        <div class="section-header compact">
          <h2>В процессе</h2>
          <span class="result-label">${progressAchievements.length}</span>
        </div>
        <div class="achievement-grid">
          ${progressAchievements.map(renderAchievement).join('')}
        </div>
      </section>

      <section class="section-card progress-master-card">
        <div>
          <span class="eyebrow">Мастерство</span>
          <h2>Футбольный мастер</h2>
          <p>${footballGames} футбольных игр. Следующая цель: 30 игр и стабильная посещаемость выше 90%.</p>
        </div>
        ${progressBar(footballGames, 30, 'Футбольный мастер')}
      </section>

      <section class="section-card">
        <div class="section-header compact"><h2>Статистика игрока</h2></div>
        <div class="player-stat-grid">
          ${statCard('Игр', stats.games || 0)}
          ${statCard('Минут на площадках', formatNumber(stats.minutesOnVenues || totalMinutes))}
          ${statCard('Победы', stats.wins || 0)}
          ${statCard('Любимый спорт', stats.favoriteSport || 'Футбол')}
          ${statCard('Любимая площадка', stats.favoriteVenue || 'Арена Лужники')}
          ${statCard('Бронирования', stats.bookings || 0)}
        </div>
      </section>
    </div>
  `;
}

function renderProfileScreen({ state, teams, joinedGames, favoriteVenues = [], favoriteGames = [] }) {
  const history = state.profile.history || {};
  return `
    <div class="screen-stack">
      ${renderProfileCard(state.profile)}
      <section class="favorites-section">
        <div class="section-header compact"><h2>Сохраненные площадки</h2><span class="result-label">${favoriteVenues.length}</span></div>
        <div class="favorites-strip">
          ${favoriteVenues.length ? favoriteVenues.map(renderFavoriteVenueTile).join('') : emptyState('Площадок пока нет', 'Сохраняйте площадки из каталога, чтобы они появлялись в профиле.')}
        </div>
      </section>
      <section class="section-card">
        <div class="section-header compact"><h2>Избранные игры</h2><span class="result-label">${favoriteGames.length}</span></div>
        ${favoriteGames.length ? `<div class="profile-scroll-row">${favoriteGames.map(renderProfileGameTile).join('')}</div>` : emptyState('Избранных игр пока нет', 'Сохраняйте игры из ленты, чтобы вернуться к ним позже.')}
      </section>
      <section class="section-card">
        <div class="section-header"><h2>Мои игры</h2></div>
        ${joinedGames.length ? `<div class="profile-scroll-row">${joinedGames.map(renderProfileGameTile).join('')}</div>` : emptyState('Вы пока не участвуете в играх', 'Найдите игру рядом или создайте свою.', 'Найти игру', 'nav', 'games')}
      </section>
      <section class="section-card">
        <div class="section-header">
          <h2>Мои команды</h2>
          <button class="small-action" type="button" data-action="create-team">Создать</button>
        </div>
        <div class="mini-team-list profile-scroll-row">
          ${teams.length ? teams.map((team) => renderTeamCard(team, true)).join('') : emptyState('Команд пока нет', 'Создайте команду и пригласите игроков.', 'Создать команду', 'create-team')}
        </div>
      </section>
      <section class="section-card">
        <div class="section-header"><h2>История</h2></div>
        <div class="profile-history-grid">
          ${renderHistoryColumn('История игр', history.games || [])}
          ${renderHistoryColumn('История бронирований', history.bookings || [])}
        </div>
      </section>
      <section class="section-card">
        <div class="section-header"><h2>Настройки</h2></div>
        <div class="settings-list">
          ${['Аккаунт', 'Уведомления', 'Конфиденциальность', 'Поддержка'].map((item) => `
            <button class="settings-row" type="button" data-action="${item === 'Уведомления' ? 'open-notifications' : 'profile-detail'}">
              <span>${escapeHtml(item)}</span>
              <img src="./icons/стрелка.png" alt="" aria-hidden="true">
            </button>
          `).join('')}
        </div>
      </section>
    </div>
  `;
}

function renderTeamScreen({ state, team }) {
  return `
    <div class="screen-stack">
      <select class="inline-select full" data-team-switch aria-label="Команда">
        ${state.teams.map((item) => `<option value="${item.id}" ${item.id === team.id ? 'selected' : ''}>${escapeHtml(item.name)}</option>`).join('')}
      </select>
      ${renderTeamCard(team)}
      <section class="section-card">
        <div class="section-header">
          <h2>Состав команды</h2>
          <button class="small-action" type="button" data-action="invite-player">Пригласить</button>
        </div>
        ${team.members.map(renderMemberRow).join('')}
      </section>
      <section class="section-card">
        <div class="section-header">
          <h2>Ближайшие игры команды</h2>
          <button class="small-action" type="button" data-action="create-game">Создать</button>
        </div>
        <div class="list-stack dense">${team.events.map(renderTeamEvent).join('')}</div>
      </section>
      <section class="section-card">
        <div class="section-header">
          <h2>Заявки в команду</h2>
          <button class="small-action" type="button" data-action="open-team-requests">Все</button>
        </div>
        ${team.requests.length ? team.requests.map((request) => renderMemberRow(request, '<button class="small-action is-primary" type="button">Принять</button>')).join('') : emptyState('Новых заявок нет', 'Когда игроки откликнутся, заявки появятся здесь.')}
      </section>
      <section class="section-card">
        <div class="section-header"><h2>Настройки команды</h2></div>
        ${team.settings.map((item) => `<div class="list-row"><strong>${escapeHtml(item)}</strong><span class="meta-pill">Включено</span></div>`).join('')}
      </section>
    </div>
  `;
}

function renderQuickAction(item) {
  const dataValue = item.value ? ` data-value="${escapeHtml(item.value)}"` : '';
  return `
    <button class="quick-action-card card-affordance" type="button" data-action="${escapeHtml(item.action)}"${dataValue}>
      <span><img src="${escapeHtml(item.icon)}" alt="" aria-hidden="true"></span>
      <strong>${escapeHtml(item.title)}</strong>
      <small>${escapeHtml(item.text)}</small>
    </button>
  `;
}

function renderActivityCard(item) {
  const id = item.id ? ` data-id="${escapeHtml(item.id)}"` : '';
  return `
    <button class="activity-card card-affordance" type="button" data-action="${escapeHtml(item.action)}"${id}>
      <span>${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(item.title)}</strong>
      <small>${escapeHtml(item.meta)}</small>
    </button>
  `;
}

function renderDailyTask(task) {
  return `
    <article class="daily-task-card">
      <div>
        <strong>${escapeHtml(task.title)}</strong>
        <p>${escapeHtml(task.text)}</p>
      </div>
      <span>+${formatNumber(task.reward)} SCORE</span>
      ${progressBar(task.progress || 0, 100, 'Прогресс задания')}
    </article>
  `;
}

function renderNewsCard(item) {
  return `
    <article class="news-card">
      <span>${escapeHtml(item.type)}</span>
      <strong>${escapeHtml(item.title)}</strong>
      <p>${escapeHtml(item.text)}</p>
    </article>
  `;
}

function renderHistoryColumn(title, items) {
  return `
    <div class="history-column">
      <strong>${escapeHtml(title)}</strong>
      ${items.length ? items.map((item) => `<span>${escapeHtml(item)}</span>`).join('') : '<span>Пока пусто</span>'}
    </div>
  `;
}

function renderMapPreview(games) {
  const pins = games.slice(0, 8).map((game, index) => `<span style="--x:${18 + (index * 11) % 62}%;--y:${24 + (index * 17) % 52}%">${game.price ? `${game.price} ₽` : '0 ₽'}</span>`).join('');
  return `
    <section class="map-preview">
      ${pins}
      <strong>Игры рядом</strong>
    </section>
  `;
}

function renderVenueMapPreview(venues) {
  const pins = venues.slice(0, 8).map((venue, index) => `<span style="--x:${16 + (index * 13) % 64}%;--y:${20 + (index * 19) % 56}%">${venue.price === 0 ? 'Free' : `${formatNumber(venue.price)} ₽`}</span>`).join('');
  return `
    <section class="map-preview venue-map-preview">
      ${pins}
      <strong>Площадки рядом</strong>
    </section>
  `;
}

function allGameFiltersOff(filters) {
  return !filters.today
    && !filters.free
    && !filters.coach
    && !filters.nearby
    && !filters.favorite
    && filters.sport === 'Все'
    && filters.date === 'any'
    && filters.time === 'any'
    && filters.distance === 'any'
    && filters.level === 'Все'
    && filters.price === 'any'
    && filters.slots === 'any';
}

function allVenueFiltersOff(filters) {
  return !filters.free
    && !filters.favorite
    && !filters.indoor
    && !filters.open
    && !filters.isNew
    && filters.sport === 'Все'
    && filters.price === 'any'
    && filters.location === 'Все'
    && filters.amenity === 'Все'
    && filters.distance === 'any'
    && filters.surface === 'Все'
    && filters.lighting === 'any'
    && filters.size === 'Все'
    && filters.rating === 'any'
    && filters.paid === 'any';
}

function renderMiniGameTile(game) {
  return `
    <button class="mini-game-tile" type="button" data-action="game-detail" data-id="${game.id}">
      <img src="${game.image}" alt="">
      <span>${game.isNew ? 'Набор' : 'Матч'}</span>
      <strong>${escapeHtml(game.sport)}</strong>
      <small>${formatGameDate(game)}</small>
      <small>${escapeHtml(game.place)}</small>
      <b>${game.current} из ${game.max}</b>
    </button>
  `;
}

function renderFavoriteVenueTile(venue) {
  return `
    <button class="favorite-tile" type="button" data-action="venue-detail" data-id="${venue.id}">
      <img src="${venue.photo}" alt="">
      <span>${escapeHtml(venue.label)}</span>
      <strong>${escapeHtml(venue.name)}</strong>
      <small>${escapeHtml(venue.district)} · м. ${escapeHtml(venue.metro)}</small>
      <b>${venue.price === 0 ? 'Бесплатно' : `${formatNumber(venue.price)} ₽/ч`}</b>
    </button>
  `;
}

function renderPeriodStat(label, gamesCount, points, minutes) {
  return `
    <article class="period-stat-card">
      <span>${escapeHtml(label)}</span>
      <strong>${formatNumber(gamesCount)}</strong>
      <small>игр сыграно</small>
      <div>
        <b>${formatNumber(points)}</b><small>очков</small>
      </div>
      <div>
        <b>${formatNumber(minutes)}</b><small>минут</small>
      </div>
    </article>
  `;
}

function renderAchievement(item) {
  return `
    <article class="progress-achievement-card ${item.unlocked ? 'is-earned' : ''}">
      <div>
        <span>${escapeHtml(item.icon || '🏆')}</span>
        <small>${escapeHtml(item.unlocked ? `${item.rarity || 'Получено'} · ${item.date || 'сегодня'}` : item.status || 'Достижение')}</small>
      </div>
      <strong>${escapeHtml(item.title)}</strong>
      <p>${escapeHtml(item.text)}</p>
      <i><b style="width:${Math.max(0, Math.min(100, Number(item.progress || 0)))}%"></b></i>
    </article>
  `;
}

function renderProfileGameTile(game) {
  return `
    <button class="profile-game-tile" type="button" data-action="game-detail" data-id="${game.id}">
      <span>${game.isNew ? 'Набор' : 'Матч'}</span>
      <strong>${escapeHtml(game.title)}</strong>
      <small>${formatGameDate(game)}</small>
      <small>${escapeHtml(game.place)}</small>
      <b>${game.current} из ${game.max}</b>
    </button>
  `;
}

function renderNearbyGame(game) {
  return `
    <button class="nearby-row" type="button" data-action="game-detail" data-id="${game.id}">
      <span>${game.sport === 'Футбол' ? '⚽' : game.sport === 'Баскетбол' ? '🏀' : '🏐'}</span>
      <div><strong>${escapeHtml(game.sport)}</strong><small>${escapeHtml(game.place)}</small></div>
      <b>${game.nearby ? '1.2 км' : '3.5 км'}</b>
      <small>${game.current}/${game.max}</small>
    </button>
  `;
}


// ---- MOB/app.js ----

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
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
  }

  bindLogin();
  bindNavigation();
  bindGlobalEvents();
  updateGreeting();

  if (state.authorized) {
    showApp();
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
    achievements: (defaultProfile.achievements || []).map((item) => ({
      ...item,
      ...(savedAchievements.find((saved) => saved.title === item.title) || {})
    })),
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


})();
