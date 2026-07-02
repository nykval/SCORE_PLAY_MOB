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
    'Футбол': './assets/sports/football.svg',
    'Баскетбол': './assets/sports/basketball.svg',
    'Волейбол': './assets/sports/volleyball.svg',
    'Теннис': './assets/sports/tennis.svg',
    'Падел': './assets/sports/padel.svg',
    'Хоккей': './assets/sports/hockey.svg',
    'Бег': './assets/sports/map-area-base.jpg'
  };
  return map[sport] || './assets/sports/map-area-base.jpg';
}

function getSportFilterIcon(sport) {
  const map = {
    'Футбол': './icons/buicons/футбол.png',
    'Баскетбол': './icons/buicons/баскетбол.png',
    'Волейбол': './icons/buicons/воллейбол.png',
    'Теннис': './icons/buicons/большой теннис.png',
    'Хоккей': './icons/buicons/хоккей.png'
  };
  return map[sport] || getSportImage(sport);
}

function getAvatarSrc(id, dataUrl = '') {
  if (String(dataUrl).startsWith('data:image/')) return dataUrl;
  return `./assets/avatars/avatar-${Number(id) || 1}.svg`;
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

const MILLION_PLUS_CITIES = [
  'Москва',
  'Санкт-Петербург',
  'Новосибирск',
  'Екатеринбург',
  'Казань',
  'Нижний Новгород',
  'Красноярск',
  'Челябинск',
  'Самара',
  'Уфа',
  'Ростов-на-Дону',
  'Краснодар',
  'Омск',
  'Воронеж',
  'Пермь',
  'Волгоград'
];

const RUSSIAN_CITIES = `
Абакан, Азов, Альметьевск, Анапа, Ангарск, Анжеро-Судженск, Арзамас, Армавир, Арсеньев, Артём, Архангельск, Астрахань, Ачинск,
Балаково, Балашиха, Балашов, Барнаул, Батайск, Белгород, Белебей, Белово, Белогорск, Белорецк, Белореченск, Бердск, Березники, Бийск, Биробиджан, Благовещенск, Бор, Братск, Брянск, Бугульма, Будённовск,
Великие Луки, Великий Новгород, Верхняя Пышма, Видное, Владивосток, Владикавказ, Владимир, Волгоград, Волгодонск, Волжский, Вологда, Вольск, Воронеж, Воткинск, Всеволожск, Выборг, Выкса, Вязьма,
Гатчина, Геленджик, Георгиевск, Глазов, Горно-Алтайск, Грозный, Губкин,
Дербент, Дзержинск, Димитровград, Дмитров, Долгопрудный, Домодедово,
Евпатория, Егорьевск, Екатеринбург, Елабуга, Елец, Ессентуки,
Железногорск (Курская область), Железногорск (Красноярский край), Жигулёвск,
Заречный (Пензенская область), Зеленодольск, Зеленогорск, Златоуст,
Иваново, Ижевск, Иркутск, Искитим, Ишим,
Йошкар-Ола,
Казань, Калининград, Калуга, Каменск-Уральский, Камышин, Канск, Каспийск, Кемерово, Керчь, Кинешма, Киров, Кирово-Чепецк, Киселёвск, Кисловодск, Клин, Ковров, Коломна, Комсомольск-на-Амуре, Копейск, Королёв, Кострома, Котлас, Красногорск, Краснодар, Краснокаменск, Краснокамск, Краснотурьинск, Красноярск, Кропоткин, Крымск, Кстово, Кузнецк, Кумертау, Курган, Курск, Кызыл,
Лабинск, Лениногорск, Ленинск-Кузнецкий, Лесосибирск, Липецк, Лиски, Лобня, Лысьва, Люберцы,
Магадан, Магнитогорск, Майкоп, Махачкала, Междуреченск, Миасс, Минеральные Воды, Минусинск, Михайловка, Мичуринск, Москва, Мурманск, Муром, Мытищи,
Набережные Челны, Назрань, Нальчик, Находка, Невинномысск, Нерюнгри, Нефтекамск, Нефтеюганск, Нижневартовск, Нижнекамск, Нижний Новгород, Нижний Тагил, Новоалтайск, Новокузнецк, Новокуйбышевск, Новомосковск, Новороссийск, Новосибирск, Новотроицк, Новочебоксарск, Новочеркасск, Новошахтинск, Новый Уренгой, Ногинск, Норильск, Ноябрьск,
Обнинск, Одинцово, Октябрьский, Омск, Орёл, Оренбург, Орехово-Зуево, Орск,
Павлово, Пенза, Первоуральск, Пермь, Петрозаводск, Петропавловск-Камчатский, Подольск, Прокопьевск, Прохладный, Псков, Пушкино, Пятигорск,
Раменское, Реутов, Рославль, Россошь, Ростов-на-Дону, Рубцовск, Рыбинск, Рязань,
Салават, Сальск, Самара, Санкт-Петербург, Саранск, Сарапул, Саратов, Саров, Саяногорск, Свободный, Северодвинск, Северск, Сергиев Посад, Серов, Серпухов, Симферополь, Смоленск, Соликамск, Солнечногорск, Сосновый Бор, Сочи, Ставрополь, Старый Оскол, Стерлитамак, Ступино, Сургут, Сызрань, Сыктывкар,
Таганрог, Тамбов, Тверь, Тимашёвск, Тихвин, Тихорецк, Тобольск, Тольятти, Томск, Троицк (Челябинская область), Туапсе, Туймазы, Тула, Тюмень,
Улан-Удэ, Ульяновск, Усолье-Сибирское, Уссурийск, Усть-Илимск, Уфа, Ухта,
Феодосия, Фрязино,
Хабаровск, Ханты-Мансийск, Хасавюрт, Химки,
Чайковский, Чапаевск, Чебоксары, Челябинск, Черемхово, Череповец, Черкесск, Черногорск, Чехов, Чита,
Шадринск, Шахты, Шуя,
Щёлково,
Элиста, Энгельс,
Южно-Сахалинск, Юрга,
Якутск, Ялта, Ярославль
`.split(',')
  .map((city) => city.trim())
  .filter(Boolean)
  .filter((city, index, list) => list.indexOf(city) === index)
  .sort((a, b) => a.localeCompare(b, 'ru'));

const CITY_ALPHABET = ['Все', ...Array.from(new Set(RUSSIAN_CITIES.map((city) => city[0]?.toUpperCase()).filter(Boolean)))];


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
    {
      id: 'start-welcome',
      series: 'Старт',
      title: 'Добро пожаловать в игру',
      text: 'Создать аккаунт',
      detail: 'Первый шаг сделан: профиль SCORE создан, а значит можно искать игры, площадки и команду',
      progress: 100,
      icon: './icons/achievements/1.png',
      status: 'Получено',
      rarity: 'Базовая',
      date: 'Сегодня',
      unlocked: true
    },
    {
      id: 'start-profile',
      series: 'Старт',
      title: 'Первый контракт',
      text: 'Полностью заполнить профиль',
      detail: 'Профиль заполнен: игрокам проще понять ваш уровень, город и спортивные интересы',
      progress: 100,
      icon: './icons/achievements/2.png',
      status: 'Получено',
      rarity: 'Базовая',
      date: 'Сегодня',
      unlocked: true
    },
    {
      id: 'start-colors',
      series: 'Старт',
      title: 'Под своими цветами',
      text: 'Выбрать любимый вид спорта',
      detail: 'Любимый спорт выбран. SCORE будет точнее подбирать игры, площадки и задания',
      progress: 100,
      icon: './icons/achievements/3.png',
      status: 'Получено',
      rarity: 'Базовая',
      date: 'Сегодня',
      unlocked: true
    },
    {
      id: 'start-first-game',
      series: 'Старт',
      title: 'Первый выход на поле',
      text: 'Сыграть первую игру',
      detail: 'Первая игра засчитана. Теперь начинается история ваших матчей и прогресса в SCORE',
      progress: 100,
      icon: './icons/achievements/4.png',
      status: 'Получено',
      rarity: 'Базовая',
      date: 'Сегодня',
      unlocked: true
    },
    {
      id: 'start-home',
      series: 'Старт',
      title: 'Здесь мой дом',
      text: 'Добавить первую площадку в избранное',
      detail: 'Любимая площадка сохранена, чтобы быстрее возвращаться к бронированию и играм',
      progress: 100,
      icon: './icons/achievements/5.png',
      status: 'Получено',
      rarity: 'Базовая',
      date: 'Сегодня',
      unlocked: true
    },
    {
      id: 'games-warmup',
      series: 'Игры',
      title: 'Разминка',
      text: 'Сыграть 3 игры',
      detail: 'Три игры сыграны: SCORE уже видит ваш ритм и спортивную активность',
      progress: 100,
      icon: './icons/achievements/6.png',
      status: 'Получено',
      rarity: 'Базовая',
      date: 'Сегодня',
      unlocked: true
    },
    {
      id: 'games-regular',
      series: 'Игры',
      title: 'Постоянный игрок',
      text: 'Сыграть 10 игр',
      detail: 'Десять игр за плечами: вы уже не случайный участник, а стабильный игрок',
      progress: 100,
      icon: './icons/achievements/7.png',
      status: 'Получено',
      rarity: 'Редкая',
      date: 'Сегодня',
      unlocked: true
    },
    {
      id: 'games-machine',
      series: 'Игры',
      title: 'Машина матчей',
      text: 'Сыграть 50 игр',
      detail: 'До отметки 50 игр осталось совсем немного: продолжайте выходить на площадку',
      progress: 94,
      icon: './icons/achievements/8.png',
      status: 'В процессе',
      rarity: 'Эпическая',
      date: '',
      unlocked: false
    },
    {
      id: 'games-legend',
      series: 'Игры',
      title: 'Легенда SCORE',
      text: 'Сыграть 100 игр',
      detail: 'Большая цель сезона: сыграть 100 игр и закрепить статус легенды SCORE',
      progress: 47,
      icon: './icons/achievements/9.png',
      status: 'В процессе',
      rarity: 'Легендарная',
      date: '',
      unlocked: false
    },
    {
      id: 'games-no-subs',
      series: 'Игры',
      title: 'Без замен',
      text: 'Сыграть 10 игр подряд без большого перерыва',
      detail: 'Серия держится, но для ачивки нужно сыграть 10 игр подряд без большого перерыва',
      progress: 60,
      icon: './icons/achievements/10.png',
      status: 'В процессе',
      rarity: 'Редкая',
      date: '',
      unlocked: false
    },
    {
      id: 'games-habit',
      series: 'Игры',
      title: 'Спортивная привычка',
      text: 'Играть каждую неделю в течение месяца',
      detail: 'Нужно удержать спортивный ритм: играть каждую неделю в течение месяца',
      progress: 75,
      icon: './icons/achievements/11.png',
      status: 'В процессе',
      rarity: 'Редкая',
      date: '',
      unlocked: false
    }
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
    { title: 'Найти игру', text: 'Подбор рядом', action: 'find-game', icon: './icons/games.png' },
    { title: 'Создать игру', text: 'Собрать игроков', action: 'create-game', icon: './icons/games.png' },
    { title: 'Найти площадку', text: 'Фото, цена, метро', action: 'find-venue', icon: './icons/venues.png' },
    { title: 'Собрать команду', text: 'Состав и заявки', action: 'nav', value: 'team', icon: './icons/profile.png' },
    { title: 'Забронировать', text: 'Свободное время', action: 'book-venue', icon: './icons/venues.png' },
    { title: 'Позвать друзей', text: '+150 SCORE', action: 'invite-friends', icon: './icons/share.png' }
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
    photo: './assets/venues/luzhniki-7x7.jpg',
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
    photo: './assets/venues/luch-field-2.jpg',
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
    photo: './assets/venues/energy-court.jpg',
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
    photo: './assets/venues/dostoevskaya-hall.jpg',
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
    photo: './assets/venues/belka-squash.jpg',
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
    photo: './assets/sports/map-area-base.jpg',
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
    image: './assets/sports/football.svg',
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
    image: './assets/sports/basketball.svg',
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
    image: './assets/sports/map-area-base.jpg',
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
    image: './assets/sports/padel.svg',
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
    image: './assets/sports/volleyball.svg',
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
  const isFilterable = scope === 'games' || scope === 'venues';
  const filterCount = scope === 'games'
    ? activeGameFilterCount(state.filters.games)
    : scope === 'venues'
      ? activeVenueFilterCount(state.filters.venues)
      : 0;
  const sortActive = isFilterable && state.filters[scope]?.sort && state.filters[scope].sort !== 'recommended';
  const entity = scope === 'games' ? 'game' : scope === 'venues' ? 'venue' : scope;
  return `
    <div class="search-row ${isFilterable ? 'has-tools' : ''}">
      <label class="search-bar">
        <span>Поиск</span>
        <img src="./icons/поиск.png" alt="" aria-hidden="true">
        <input data-search="${escapeAttr(scope)}" type="search" placeholder="${escapeAttr(placeholder)}" value="${escapeAttr(value)}">
      </label>
      ${isFilterable ? `
        <button class="search-tool ${sortActive ? 'is-active' : ''}" type="button" data-action="open-${escapeAttr(entity)}-sort" aria-label="Сортировка">
          <img src="./icons/сортировка.png" alt="" aria-hidden="true">
        </button>
        <button class="search-tool ${filterCount ? 'is-active' : ''}" type="button" data-action="open-${escapeAttr(entity)}-filters" aria-label="Фильтры">
          <img src="./icons/фильтр.png" alt="" aria-hidden="true">
          ${filterCount ? `<b>${filterCount}</b>` : ''}
        </button>
      ` : ''}
      ${buttonLabel ? `<button class="button button-secondary search-action" type="button" data-action="${escapeAttr(buttonAction)}">${escapeHtml(buttonLabel)}</button>` : ''}
    </div>
  `;
}

function viewToggle(active, action = 'game-view') {
  return `
    <div class="view-toggle" role="group" aria-label="Вид" data-view="${escapeAttr(active)}">
      <span class="view-toggle-indicator" aria-hidden="true"></span>
      <button class="${active === 'list' ? 'is-active' : ''}" type="button" data-action="${escapeAttr(action)}" data-value="list">Список</button>
      <button class="${active === 'map' ? 'is-active' : ''}" type="button" data-action="${escapeAttr(action)}" data-value="map">Карта</button>
    </div>
  `;
}

function filterPill({ label, active = false, action = '', value = '', chevron = false }) {
  const actionAttrs = action ? `data-action="${escapeAttr(action)}" ${value ? `data-value="${escapeAttr(value)}"` : ''}` : '';
  return `
    <button class="filter-pill ${active ? 'is-active' : ''} ${chevron ? 'has-chevron' : ''}" type="button" ${actionAttrs}>
      <span>${escapeHtml(label)}</span>
      ${chevron ? '<img src="./icons/arrow.png" alt="" aria-hidden="true">' : ''}
    </button>
  `;
}

const quickGameFilterValues = new Set(['date:today', 'price:free', 'distance:near', 'slots:open', 'almostFull']);
const quickVenueFilterValues = new Set(['distance:near', 'price:free', 'availableToday', 'type:indoor', 'favorite']);

function isQuickFilterValue(scope, value) {
  return scope === 'games' ? quickGameFilterValues.has(value) : quickVenueFilterValues.has(value);
}

function isFilterValueActive(scope, filters, value) {
  if (!value) return false;
  if (typeof filters[value] === 'boolean') return filters[value];
  if (scope === 'games' && value.startsWith('date:')) return filters.date === value.slice(5);
  if (scope === 'games' && value.startsWith('price:')) return filters.price === value.slice(6);
  if (scope === 'games' && value.startsWith('distance:')) return filters.distance === value.slice(9);
  if (scope === 'games' && value.startsWith('slots:')) return filters.slots === value.slice(6);
  if (scope === 'venues' && value.startsWith('price:')) return filters.price === value.slice(6);
  if (scope === 'venues' && value.startsWith('distance:')) return filters.distance === value.slice(9);
  if (scope === 'venues' && value.startsWith('type:')) return filters.type === value.slice(5);
  return false;
}

function getVenueSportValues(filters) {
  if (Array.isArray(filters.sports)) return filters.sports.filter(Boolean);
  if (Array.isArray(filters.sport)) return filters.sport.filter((item) => item && item !== 'Все');
  return filters.sport && filters.sport !== 'Все' ? [filters.sport] : [];
}

function setVenueSportValues(filters, values) {
  filters.sports = Array.from(new Set((values || []).filter(Boolean)));
  filters.sport = filters.sports.length ? filters.sports[0] : 'Все';
}

function normalizeVenueFilters(filters) {
  const normalized = { ...filters };
  setVenueSportValues(normalized, getVenueSportValues(filters));
  normalized.priceMin = normalized.priceMin || '';
  normalized.priceMax = normalized.priceMax || '';
  normalized.distanceKm = clamp(normalized.distanceKm || 100, 1, 100);
  return normalized;
}

function resetVenueFilterValues(filters) {
  setVenueSportValues(filters, []);
  filters.price = 'any';
  filters.priceMin = '';
  filters.priceMax = '';
  filters.type = 'any';
  filters.distance = 'any';
  filters.distanceKm = 100;
  filters.size = 'Все';
  filters.availableToday = false;
  filters.favorite = false;
  filters.indoor = false;
  filters.open = false;
  filters.isNew = false;
  filters.quickPinned = '';
}

function hasVenueFilterChanges() {
  if (!venueFilterDraft) return false;
  return JSON.stringify(normalizeVenueFilters(venueFilterDraft)) !== JSON.stringify(normalizeVenueFilters(state.filters.venues));
}

function orderQuickFilters(filters, items) {
  return items
    .map((item, index) => ({ ...item, index }))
    .sort((a, b) => {
      const aPinned = a.active && a.value === filters.quickPinned;
      const bPinned = b.active && b.value === filters.quickPinned;
      if (aPinned !== bPinned) return aPinned ? -1 : 1;
      if (a.active !== b.active) return a.active ? -1 : 1;
      return a.index - b.index;
    });
}

function filterLauncher(scope, count) {
  return `
    <button class="filter-launcher" type="button" data-action="open-${escapeAttr(scope)}-filters" aria-label="Все фильтры">
      <span class="filter-bars" aria-hidden="true"><i></i><i></i><i></i></span>
      ${count ? `<b>${count}</b>` : ''}
    </button>
  `;
}

function activeGameFilterCount(filters) {
  return [
    filters.sport !== 'Все',
    filters.date !== 'any' && filters.date !== 'today',
    filters.time !== 'any',
    filters.distance !== 'any' && filters.distance !== 'near',
    filters.level !== 'Все',
    filters.price !== 'any' && filters.price !== 'free',
    filters.slots !== 'any' && filters.slots !== 'open'
  ].filter(Boolean).length;
}

function activeVenueFilterCount(filters) {
  const sports = getVenueSportValues(filters);
  return [
    sports.length > 0,
    (filters.price !== 'any' && filters.price !== 'free') || filters.priceMin !== '' || filters.priceMax !== '',
    filters.distance !== 'any' && filters.distance !== 'near',
    filters.type !== 'any' && filters.type !== 'indoor',
    filters.size !== 'Все'
  ].filter(Boolean).length;
}

function filterOption({ label, meta = '', active = false, action, value }) {
  return `
    <button class="filter-option ${active ? 'is-active' : ''}" type="button" data-action="${escapeAttr(action)}" data-value="${escapeAttr(value)}">
      <span>
        <strong>${escapeHtml(label)}</strong>
        ${meta ? `<small>${escapeHtml(meta)}</small>` : ''}
      </span>
      <i aria-hidden="true"></i>
    </button>
  `;
}

function filterSection(title, options) {
  return `
    <section class="filter-sheet-section">
      ${title ? `<h3>${escapeHtml(title)}</h3>` : ''}
      <div class="filter-option-list">${options}</div>
    </section>
  `;
}

function sheetHeader(label, title = '', text = '') {
  return `
    <div class="filter-sheet-header sheet-standard-header">
      <span>${escapeHtml(label)}</span>
      ${title ? `<h2>${escapeHtml(title)}</h2>` : ''}
      ${text ? `<p>${escapeHtml(text)}</p>` : ''}
    </div>
  `;
}

function uniqueImageList(images) {
  const seen = new Set();
  return images.filter((src) => {
    if (!src || seen.has(src)) return false;
    seen.add(src);
    return true;
  });
}

function detailPhotoSlider(images, title, meta = '') {
  const slides = uniqueImageList(images).slice(0, 4);
  if (!slides.length) return '';
  return `
    <section class="detail-photo-slider" aria-label="Фотографии">
      <div class="detail-photo-track">
        ${slides.map((src, index) => `
          <figure class="detail-photo-slide">
            <img src="${escapeAttr(src)}" alt="${escapeAttr(`${title} фото ${index + 1}`)}">
          </figure>
        `).join('')}
      </div>
      ${slides.length > 1 ? `<div class="detail-photo-dots">${slides.map((_, index) => `<span class="${index === 0 ? 'is-active' : ''}"></span>`).join('')}</div>` : ''}
    </section>
  `;
}

function bindDetailPhotoSliders() {
  document.querySelectorAll('.detail-photo-slider').forEach((slider) => {
    const track = slider.querySelector('.detail-photo-track');
    const dots = Array.from(slider.querySelectorAll('.detail-photo-dots span'));
    if (!track || !dots.length) return;
    let frame = 0;
    const syncDots = () => {
      frame = 0;
      const index = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
      dots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === index));
    };
    track.addEventListener('scroll', () => {
      if (frame) return;
      frame = requestAnimationFrame(syncDots);
    }, { passive: true });
    syncDots();
  });
}

function getGameDetailPhotos(game) {
  const relatedVenues = state.venues.filter((venue) => venue.name === game.place || venue.sport === game.sport);
  return uniqueImageList([
    ...relatedVenues.map((venue) => venue.photo),
    game.image,
    getSportImage(game.sport)
  ]);
}

function getVenueDetailPhotos(venue) {
  const relatedVenues = state.venues.filter((item) => item.id !== venue.id && item.sport === venue.sport);
  return uniqueImageList([
    venue.photo,
    ...relatedVenues.map((item) => item.photo)
  ]);
}

function sportMultiSection(filters, sports) {
  const selected = getVenueSportValues(filters);
  return `
    <section class="filter-sheet-section sport-filter-section">
      <div class="filter-section-title-row">
        <h3>Вид спорта</h3>
      </div>
      <div class="sport-filter-grid">
        ${sports.map((sport) => `
          <button class="sport-filter-card ${selected.includes(sport) ? 'is-active' : ''}" type="button" data-action="venue-filter-draft" data-value="sport:${escapeAttr(sport)}">
            <img src="${escapeAttr(getSportFilterIcon(sport))}" alt="" aria-hidden="true">
            <span>${escapeHtml(sport)}</span>
          </button>
        `).join('')}
      </div>
    </section>
  `;
}

function priceRangeSection(filters) {
  const min = filters.priceMin || '';
  const max = filters.priceMax || '';
  const hasRange = min !== '' || max !== '';
  return `
    <div class="filter-control-group">
      <h3 class="filter-block-title">Цена</h3>
      <section class="filter-sheet-section price-range-section ${hasRange ? 'is-active' : ''}">
        <div class="price-input-row">
          <label><span>₽</span><input type="number" inputmode="numeric" min="0" placeholder="0" value="${escapeAttr(min)}" data-price-bound="min"></label>
          <b>-</b>
          <label><span>₽</span><input type="number" inputmode="numeric" min="0" placeholder="10000" value="${escapeAttr(max)}" data-price-bound="max"></label>
        </div>
      </section>
    </div>
  `;
}

function distanceRangeSection(filters, action) {
  const value = filters.distance === 'near'
    ? 2
    : filters.distance === 'five'
      ? 5
      : clamp(filters.distanceKm || 100, 1, 100);
  const activeValue = filters.distance === 'any' ? 'any' : String(value);
  const options = [
    ['any', 'Все'],
    ['2', 'до 2 км'],
    ['5', 'до 5 км'],
    ['10', 'до 10 км'],
    ['20', 'до 20 км'],
    ['50', 'до 50 км']
  ];
  return `
    <div class="filter-control-group">
      <h3 class="filter-block-title">Расстояние</h3>
      <section class="filter-sheet-section distance-range-section">
        <div class="distance-choice-grid">
          ${options.map(([optionValue, label]) => `
            <button class="distance-choice-button ${activeValue === optionValue ? 'is-active' : ''}" type="button" data-action="${escapeAttr(action === 'venues' ? 'venue-filter-draft' : `${action}-filter`)}" data-value="distance:${optionValue}">
              ${escapeHtml(label)}
            </button>
          `).join('')}
        </div>
      </section>
    </div>
  `;
}

function typeSegmentSection(filters) {
  const options = [
    ['any', 'Любой тип'],
    ['indoor', 'Крытая'],
    ['open', 'Открытая']
  ];
  return `
    <section class="filter-sheet-section type-segment-section">
      <h3>Тип площадки</h3>
      <div class="type-segment" data-active="${escapeAttr(filters.type || 'any')}">
        ${options.map(([value, label]) => `
          <button class="${filters.type === value ? 'is-active' : ''}" type="button" data-action="venue-filter-draft" data-value="type:${value}">${escapeHtml(label)}</button>
        `).join('')}
      </div>
    </section>
  `;
}

function renderGamesFilterRail() {
  const filters = state.filters.games;
  const items = orderQuickFilters(filters, [
    { label: 'Сегодня', active: filters.date === 'today', action: 'game-filter', value: 'date:today' },
    { label: 'Бесплатно', active: filters.price === 'free', action: 'game-filter', value: 'price:free' },
    { label: 'Рядом', active: filters.distance === 'near', action: 'game-filter', value: 'distance:near' },
    { label: 'Есть свободные места', active: filters.slots === 'open', action: 'game-filter', value: 'slots:open' },
    { label: 'Почти собрана', active: filters.almostFull, action: 'game-filter', value: 'almostFull' }
  ]);
  return `
    <div class="chip-scroll filter-rail">
      ${items.map((item) => filterPill(item)).join('')}
    </div>
  `;
}

function renderVenuesFilterRail() {
  const filters = state.filters.venues;
  const items = orderQuickFilters(filters, [
    { label: 'Рядом', active: filters.distance === 'near', action: 'venue-filter', value: 'distance:near' },
    { label: 'Бесплатные', active: filters.price === 'free', action: 'venue-filter', value: 'price:free' },
    { label: 'Свободно сегодня', active: filters.availableToday, action: 'venue-filter', value: 'availableToday' },
    { label: 'Крытые', active: filters.type === 'indoor', action: 'venue-filter', value: 'type:indoor' },
    { label: 'Избранные', active: filters.favorite, action: 'venue-filter', value: 'favorite' }
  ]);
  return `
    <div class="chip-scroll filter-rail">
      ${items.map((item) => filterPill(item)).join('')}
    </div>
  `;
}

function gamesFiltersSheet() {
  const filters = state.filters.games;
  const sports = ['Все', ...uniqueSports(state.games)];
  const levels = ['Все', ...Array.from(new Set(state.games.map((game) => game.level).filter(Boolean)))];
  return `
    <div class="filter-sheet">
      <div class="filter-sheet-header">
        <span>Фильтры</span>
      </div>
      <div class="filter-sheet-body">
        ${filterSection('Вид спорта', sports.map((sport) => filterOption({ label: sport, active: filters.sport === sport, action: 'game-filter', value: `sport:${sport}` })).join(''))}
        ${filterSection('Дата', [
          ['any', 'Любая дата', 'Все ближайшие игры'],
          ['today', 'Сегодня', 'Игры на сегодня'],
          ['week', 'На неделе', 'Ближайшие 7 дней']
        ].map(([value, label, meta]) => filterOption({ label, meta, active: filters.date === value, action: 'game-filter', value: `date:${value}` })).join(''))}
        ${filterSection('Время', [
          ['any', 'Любое время'],
          ['morning', 'Утро'],
          ['evening', 'Вечер']
        ].map(([value, label]) => filterOption({ label, active: filters.time === value, action: 'game-filter', value: `time:${value}` })).join(''))}
        ${filterSection('Стоимость', [
          ['price:any', 'Любая цена'],
          ['price:free', 'Бесплатно'],
          ['price:paid', 'Платные']
        ].map(([value, label]) => filterOption({
          label,
          active: filters.price === value.slice(6),
          action: 'game-filter',
          value
        })).join(''))}
        ${filterSection('Расстояние', [
          ['any', 'Все расстояния'],
          ['near', 'До 2 км'],
          ['five', 'До 5 км']
        ].map(([value, label]) => filterOption({ label, active: filters.distance === value, action: 'game-filter', value: `distance:${value}` })).join(''))}
        ${filterSection('Уровень игры', levels.map((level) => filterOption({ label: level, active: filters.level === level, action: 'game-filter', value: `level:${level}` })).join(''))}
        ${filterSection('Свободные места', [
          ['slots:any', 'Не важно'],
          ['slots:open', 'Есть свободные места']
        ].map(([value, label]) => filterOption({
          label,
          active: filters.slots === value.slice(6),
          action: 'game-filter',
          value
        })).join(''))}
      </div>
      <div class="filter-sheet-footer">
        <button class="button button-secondary filter-reset-button" type="button" data-action="game-filter" data-value="reset">Сбросить</button>
        <button class="button button-primary filter-apply-button is-active" type="button" data-action="filters-done">Применить</button>
      </div>
    </div>
  `;
}

function venuesFiltersSheet() {
  const filters = normalizeVenueFilters(venueFilterDraft || state.filters.venues);
  const sportOptions = ['Футбол', 'Баскетбол', 'Волейбол', 'Теннис', 'Хоккей'];
  const sizes = ['Все', ...Array.from(new Set(state.venues.map((venue) => venue.size).filter(Boolean)))];
  const hasChanges = hasVenueFilterChanges();
  const canReset = hasChanges || activeVenueFilterCount(filters) > 0;
  return `
    <div class="filter-sheet">
      <div class="filter-sheet-header">
        <span>Фильтры</span>
      </div>
      <div class="filter-sheet-body">
        ${sportMultiSection(filters, sportOptions)}
        ${priceRangeSection(filters)}
        ${distanceRangeSection(filters, 'venues')}
        ${typeSegmentSection(filters)}
        ${filterSection('Размер площадки', sizes.map((size) => filterOption({ label: size, active: filters.size === size, action: 'venue-filter-draft', value: `size:${size}` })).join(''))}
      </div>
      <div class="filter-sheet-footer">
        <button class="button button-secondary filter-reset-button ${canReset ? 'is-active' : ''}" type="button" data-action="venue-filter-draft" data-value="reset">Сбросить</button>
        <button class="button button-primary filter-apply-button ${hasChanges ? 'is-active' : ''}" type="button" data-action="apply-venue-filters" ${hasChanges ? '' : 'disabled'}>Применить</button>
      </div>
    </div>
  `;
}

function gamesSortSheet() {
  const current = state.filters.games.sort || 'recommended';
  return `
    <div class="filter-sheet sort-sheet">
      <div class="filter-sheet-header">
        <span>Сортировка</span>
      </div>
      ${filterSection('', [
        ['recommended', 'По релевантности', 'Лучшие совпадения'],
        ['distance', 'По расстоянию', 'Ближе к вам'],
        ['start-time', 'По времени начала', 'Скоро начнутся'],
        ['price', 'По стоимости', 'Сначала дешевле'],
        ['popular', 'По популярности', 'Самые активные наборы']
      ].map(([value, label, meta]) => filterOption({ label, meta, active: current === value, action: 'game-sort', value })).join(''))}
      <div class="filter-sheet-footer is-single">
        <button class="button button-primary" type="button" data-action="filters-done">Применить</button>
      </div>
    </div>
  `;
}

function venuesSortSheet() {
  const current = state.filters.venues.sort || 'recommended';
  return `
    <div class="filter-sheet sort-sheet">
      <div class="filter-sheet-header">
        <span>Сортировка</span>
      </div>
      ${filterSection('', [
        ['recommended', 'По релевантности', 'Лучшие совпадения'],
        ['distance', 'По расстоянию', 'Ближе к вам'],
        ['rating', 'По рейтингу', 'Сначала лучшие оценки'],
        ['price', 'По цене', 'Сначала дешевле'],
        ['popular', 'По популярности', 'Чаще сохраняют']
      ].map(([value, label, meta]) => filterOption({ label, meta, active: current === value, action: 'venue-sort', value })).join(''))}
      <div class="filter-sheet-footer is-single">
        <button class="button button-primary" type="button" data-action="filters-done">Применить</button>
      </div>
    </div>
  `;
}

function refreshFilterSheet(scope) {
  if (!dom.sheetPanel?.classList.contains('is-filter-sheet')) return;
  dom.sheetContent.innerHTML = scope === 'games' ? gamesFiltersSheet() : venuesFiltersSheet();
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
      ${sheetHeader('Новая игра', 'Создать игру', 'Заполните ключевые детали, чтобы игроки сразу понимали формат и условия.')}
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

function achievementDetailSheet(achievement) {
  const isImageIcon = typeof achievement.icon === 'string' && /\.(svg|png|jpe?g|webp)$/i.test(achievement.icon);
  const isUnlocked = achievement.unlocked !== false;
  const isGamesSeries = achievement.series === 'Игры';
  const logoSrc = isGamesSeries ? './icons/logo-green.png' : './icons/logo-blue.png';
  const progress = Math.max(0, Math.min(100, Number(achievement.progress) || 0));
  const remaining = Math.max(0, 100 - progress);
  return `
    <div class="achievement-detail-sheet">
      <article class="achievement-share-card ${isUnlocked ? 'is-earned' : 'is-locked'} ${isGamesSeries ? 'is-games-series' : ''}">
        <div class="achievement-share-medal">
          ${isImageIcon ? `<img src="${escapeAttr(achievement.icon)}" alt="">` : `<b>${escapeHtml(achievement.icon || '🏆')}</b>`}
        </div>
        <strong>${escapeHtml(achievement.title)}</strong>
        <p>${escapeHtml(achievement.text)}</p>
        <img class="achievement-card-logo" src="${escapeAttr(logoSrc)}" alt="SCORE">
      </article>
      ${isUnlocked
        ? `<button class="button button-primary achievement-share-button ${isGamesSeries ? 'is-green' : ''}" type="button" data-action="share-achievement" data-id="${escapeAttr(achievement.id || achievement.title)}">Поделиться</button>`
        : `<button class="button achievement-share-button achievement-progress-button" type="button" disabled>Осталось ${remaining}%</button>`}
    </div>
  `;
}

function gameDetailSheet(game) {
  const status = getGameStatus(game);
  const players = game.players || [];
  return `
    <div class="detail-sheet game-detail-sheet">
      <div class="detail-scroll-body">
        ${detailPhotoSlider(getGameDetailPhotos(game), game.title, `${game.sport} · ${game.place}`)}
        ${sheetHeader(`${game.sport} · ${game.format}`, game.title, game.description)}
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
      </div>
      <div class="card-actions">
        <button class="button button-primary" type="button" data-action="join-game" data-id="${game.id}" ${game.current >= game.max && !game.joined ? 'disabled' : ''}>${game.joined ? 'Выйти из игры' : 'Участвовать'}</button>
        <button class="detail-favorite-button ${game.favorite ? 'is-active' : ''}" type="button" data-action="favorite-game" data-id="${game.id}" aria-label="${game.favorite ? 'Убрать из избранного' : 'Добавить в избранное'}">
          <img src="./icons/favorite.png" alt="" aria-hidden="true">
        </button>
      </div>
    </div>
  `;
}

function venueDetailSheet(venue) {
  return `
    <div class="detail-sheet venue-detail-sheet">
      <div class="detail-scroll-body">
        ${detailPhotoSlider(getVenueDetailPhotos(venue), venue.name, `${venue.sport} · ${venue.label}`)}
        ${sheetHeader(`${venue.sport} · ${venue.label}`, venue.name, venue.description)}
        <div class="stats-grid detail-grid">
          ${statCard('Цена', venue.price === 0 ? 'Бесплатно' : `${formatPrice(venue.price)}/ч`)}
          ${statCard('Метро', venue.metro)}
          ${statCard('Рейтинг', venue.rating)}
          ${statCard('Тип', venue.indoor ? 'В помещении' : 'Открытая')}
        </div>
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
      </div>
      <div class="card-actions">
        <button class="button button-primary" type="button" data-action="book-selected-venue">Забронировать</button>
        <button class="detail-favorite-button ${venue.favorite ? 'is-active' : ''}" type="button" data-action="favorite-venue" data-id="${venue.id}" aria-label="${venue.favorite ? 'Убрать из избранного' : 'Добавить в избранное'}">
          <img src="./icons/favorite.png" alt="" aria-hidden="true">
        </button>
      </div>
    </div>
  `;
}

function teamRequestsSheet(team) {
  return `
    ${sheetHeader(team.name, 'Заявки и приглашения')}
    ${team.requests.length ? team.requests.map(([name, meta]) => `
      <div class="list-row">
        <div><strong>${escapeHtml(name)}</strong><span>${escapeHtml(meta)}</span></div>
        <button class="small-action is-primary" type="button">Принять</button>
      </div>
    `).join('') : emptyState('Заявок нет', 'Когда игроки захотят в команду, они появятся здесь.')}
  `;
}

function notificationsSheet(notifications) {
  const unreadCount = notifications.filter((item) => item.unread).length;
  return `
    <section class="notifications-sheet">
      ${sheetHeader('Уведомления')}
      <div class="notification-summary-card">
        <span>Сегодня</span>
        <strong>${unreadCount ? `${unreadCount} новых события` : 'Все спокойно'}</strong>
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
    </section>
  `;
}

function normalizeCitySearch(value) {
  return String(value || '').trim().toLowerCase().replaceAll('ё', 'е');
}

function cityMatchesQuery(city, query) {
  if (!query) return true;
  return normalizeCitySearch(city).includes(query);
}

function cityOption(city, current) {
  return `
    <button class="location-option ${current === city ? 'is-active' : ''}" type="button" data-action="location-select" data-value="${escapeAttr(city)}">
      <span>${escapeHtml(city)}</span>
      <i aria-hidden="true"></i>
    </button>
  `;
}

function renderCityGroup(title, cities, current, featured = false) {
  if (!cities.length) return '';
  return `
    <section class="location-city-group ${featured ? 'is-featured' : ''}">
      <h3>${escapeHtml(title)}</h3>
      <div class="location-option-list">
        ${cities.map((city) => cityOption(city, current)).join('')}
      </div>
    </section>
  `;
}

function renderLocationCityList(query = '', letter = 'Все') {
  const current = state.profile.city || 'Москва';
  const normalizedQuery = normalizeCitySearch(query);
  const activeLetter = letter || 'Все';
  if (activeLetter !== 'Все') {
    const cities = RUSSIAN_CITIES
      .filter((city) => city[0]?.toUpperCase() === activeLetter)
      .filter((city) => cityMatchesQuery(city, normalizedQuery));
    return renderCityGroup(activeLetter, cities, current).trim() || '<p class="location-empty">Город не найден</p>';
  }
  const millionCities = MILLION_PLUS_CITIES.filter((city) => cityMatchesQuery(city, normalizedQuery));
  const otherCities = RUSSIAN_CITIES
    .filter((city) => !MILLION_PLUS_CITIES.includes(city))
    .filter((city) => cityMatchesQuery(city, normalizedQuery));
  const grouped = otherCities.reduce((groups, city) => {
    const letter = city[0]?.toUpperCase() || '';
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(city);
    return groups;
  }, {});
  const alphabetGroups = Object.keys(grouped)
    .sort((a, b) => a.localeCompare(b, 'ru'))
    .map((letter) => renderCityGroup(letter, grouped[letter], current))
    .join('');
  const html = `
    ${renderCityGroup('Города-миллионники', millionCities, current, true)}
    ${alphabetGroups}
  `;
  return html.trim() || '<p class="location-empty">Город не найден</p>';
}

function locationSheet() {
  return `
    <section class="location-sheet">
      ${sheetHeader('Город')}
      <label class="location-search">
        <img src="./icons/поиск.png" alt="" aria-hidden="true">
        <input type="search" value="" placeholder="Поиск города" data-city-search autocomplete="off">
      </label>
      <div class="location-letter-rail" aria-label="Фильтр по алфавиту">
        ${CITY_ALPHABET.map((letter, index) => `
          <button class="${index === 0 ? 'is-active' : ''}" type="button" data-action="city-letter" data-value="${escapeAttr(letter)}">${escapeHtml(letter)}</button>
        `).join('')}
      </div>
      <div class="location-city-list" data-city-list data-letter="Все">
        ${renderLocationCityList()}
      </div>
    </section>
  `;
}

function profileDetailSheet(profile, editing = false) {
  const nickname = profile.nickname || '#77777';
  const profileItems = [
    ['Расположение', 'district', profile.district || profile.city || 'Москва', './icons/location.png'],
    ['Номер игрока', 'nickname', nickname, './icons/profile.png'],
    ['Телефон', 'phone', profile.phone || 'Не указан', './icons/phone.png'],
    ['Почта', 'email', profile.email || 'Не указана', './icons/email.png'],
    ['Соцсеть', 'social', profile.social || 'Не указана', './icons/website.png']
  ];
  const tag = editing ? 'form' : 'section';
  const formAttrs = editing ? ' id="profile-form"' : '';
  const avatarAction = editing ? 'change-avatar' : 'view-avatar';
  return `
    <${tag}${formAttrs} class="profile-detail-card ${editing ? 'is-editing' : ''}">
      <div class="profile-sticky-title" data-profile-sticky-title>Профиль игрока</div>
      <div class="profile-detail-hero">
        <div class="profile-detail-hero-top">
          <span>${editing ? 'Редактирование' : 'Профиль игрока'}</span>
          <b>${escapeHtml(profile.level || 'Любитель')}</b>
        </div>
        <div class="profile-detail-avatar-row">
          <button class="profile-detail-action ${editing ? '' : 'is-primary'}" type="button" ${editing ? 'data-close-sheet' : 'data-action="share-profile"'} aria-label="${editing ? 'Закрыть' : 'Поделиться профилем'}">
            <img src="./icons/${editing ? 'close' : 'share'}.png" alt="" aria-hidden="true">
          </button>
          <button class="profile-detail-avatar-button" type="button" data-action="${avatarAction}" aria-label="${editing ? 'Сменить аватар' : 'Открыть аватар'}">
            <img class="profile-detail-avatar" src="${getAvatarSrc(profile.avatarId, profile.avatarDataUrl)}" alt="">
            ${editing ? '<span>Сменить фото</span>' : ''}
          </button>
          <button class="profile-detail-action" type="button" data-action="${editing ? 'save-profile' : 'edit-profile'}" aria-label="${editing ? 'Сохранить профиль' : 'Редактировать профиль'}">
            <img src="./icons/${editing ? 'check' : 'edit'}.png" alt="" aria-hidden="true">
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
        <div class="profile-edit-footer">
          <button class="button button-secondary" type="button" data-close-sheet>Отменить</button>
          <button class="button button-primary profile-submit" type="button" data-action="save-profile">Сохранить</button>
        </div>
      ` : `<p class="profile-detail-about">${escapeHtml(profile.about)}</p>`}
    </${tag}>
  `;
}

function avatarViewSheet(profile) {
  return `
    <section class="avatar-view-card">
      <button class="avatar-view-close" type="button" data-close-sheet aria-label="Закрыть">
        <img src="./icons/close.png" alt="" aria-hidden="true">
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
        <img src="./icons/close.png" alt="" aria-hidden="true">
      </button>
      <h2>Сменить аватар</h2>
      <img class="avatar-change-preview" data-avatar-preview src="${getAvatarSrc(profile.avatarId, profile.avatarDataUrl)}" alt="">
      <div class="avatar-source-row">
        <label class="avatar-source-action">
          <img src="./icons/profile.png" alt="" aria-hidden="true">
          <span>Камера</span>
          <input name="avatar" type="file" accept="image/*" capture="user">
        </label>
        <label class="avatar-source-action">
          <img src="./icons/email.png" alt="" aria-hidden="true">
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
  return `
    <div class="screen-stack catalog-screen">
      ${searchBar({ scope: 'games', value: state.filters.games.query, placeholder: 'Поиск игр' })}
      ${renderGamesFilterRail()}
      <div data-catalog-results="games">
        ${renderGamesResults(games)}
      </div>
    </div>
  `;
}

function renderGamesResults(games) {
  return `
      <div class="section-header compact">
        <span class="result-label">Найдено: ${games.length}</span>
        ${viewToggle(state.filters.games.view)}
      </div>
      ${state.filters.games.view === 'map' ? renderMapPreview(games) : ''}
      <div class="list-stack">
        ${games.length ? games.map(renderGameCard).join('') : emptyState('Игр не найдено', 'Попробуйте снять фильтр или создать свою игру.', 'Создать игру', 'create-game')}
      </div>
  `;
}

function renderVenuesScreen({ state, venues }) {
  return `
    <div class="screen-stack catalog-screen">
      ${searchBar({ scope: 'venues', value: state.filters.venues.query, placeholder: 'Поиск площадок' })}
      ${renderVenuesFilterRail()}
      <div data-catalog-results="venues">
        ${renderVenuesResults(venues)}
      </div>
    </div>
  `;
}

function renderVenuesResults(venues) {
  return `
      <div class="section-header compact">
        <span class="result-label">Найдено: ${venues.length}</span>
        ${viewToggle(state.filters.venues.view, 'venue-view')}
      </div>
      ${state.filters.venues.view === 'map' ? renderVenueMapPreview(venues) : ''}
      <div class="list-stack">
        ${venues.length ? venues.map(renderVenueCard).join('') : emptyState('Площадок не найдено', 'Измените фильтры или посмотрите соседний район.', 'Сбросить фильтры', 'venue-filter', 'reset')}
      </div>
  `;
}

function renderProgressScreen({ state, joinedGames }) {
  const achievements = state.profile.achievements || [];
  const series = groupAchievements(achievements);
  return `
    <div class="screen-stack achievements-screen">
      ${series.length ? series.map(renderAchievementSeries).join('') : emptyState('Пока нет ачивок', 'Скоро здесь появятся первые серии SCORE.')}
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
              <img src="./icons/arrow.png" alt="" aria-hidden="true">
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
    && !filters.nearby
    && !filters.openSlots
    && !filters.almostFull
    && filters.sport === 'Все'
    && filters.date === 'any'
    && filters.time === 'any'
    && filters.distance === 'any'
    && filters.level === 'Все'
    && filters.price === 'any'
    && filters.slots === 'any';
}

function allVenueFiltersOff(filters) {
  return !filters.nearby
    && !filters.free
    && !filters.availableToday
    && !filters.favorite
    && !filters.indoor
    && getVenueSportValues(filters).length === 0
    && filters.price === 'any'
    && (filters.priceMin || '') === ''
    && (filters.priceMax || '') === ''
    && filters.distance === 'any'
    && Number(filters.distanceKm || 100) >= 100
    && filters.type === 'any'
    && filters.size === 'Все';
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

function groupAchievements(achievements) {
  const groups = [];
  achievements.forEach((item) => {
    const title = item.series || 'Достижения';
    let group = groups.find((entry) => entry.title === title);
    if (!group) {
      group = { title, items: [] };
      groups.push(group);
    }
    group.items.push(item);
  });
  return groups;
}

function renderAchievementSeries(series) {
  const unlocked = series.items.filter((item) => item.unlocked).length;
  return `
    <section class="achievement-series-card">
      <div class="achievement-series-header">
        <div>
          <h2>${escapeHtml(series.title)}</h2>
        </div>
        <strong>${unlocked}/${series.items.length}</strong>
      </div>
      <div class="achievement-trophy-grid">
        ${series.items.map(renderAchievement).join('')}
      </div>
    </section>
  `;
}

function renderAchievement(item) {
  const isImageIcon = typeof item.icon === 'string' && /\.(svg|png|jpe?g|webp)$/i.test(item.icon);
  return `
    <button class="achievement-trophy ${item.unlocked ? 'is-earned' : 'is-locked'}" type="button" data-action="achievement-detail" data-id="${escapeAttr(item.id || item.title)}">
      <span class="achievement-medal">
        ${isImageIcon ? `<img src="${escapeAttr(item.icon)}" alt="">` : `<b>${escapeHtml(item.icon || '🏆')}</b>`}
      </span>
      <strong>${escapeHtml(item.title)}</strong>
    </button>
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
  floatingCreateGame: document.querySelector('#floating-create-game'),
  profileShortcut: document.querySelector('#profile-shortcut'),
  notificationsShortcut: document.querySelector('#notifications-shortcut'),
  sheet: document.querySelector('#sheet'),
  sheetPanel: document.querySelector('.sheet-panel'),
  sheetContent: document.querySelector('#sheet-content'),
  toast: document.querySelector('#toast')
};

const state = hydrateState();
const SHEET_CLOSE_ANIMATION_MS = 320;
let sheetCloseTimer = 0;
let venueFilterDraft = null;

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
  const safeTop = Math.max(
    0,
    Number(webApp?.safeAreaInset?.top || 0),
    Number(webApp?.contentSafeAreaInset?.top || 0)
  );
  const isTelegramEmbedded = Boolean(
    webApp?.initData ||
    (webApp?.initDataUnsafe && Object.keys(webApp.initDataUnsafe).length) ||
    new URLSearchParams(window.location.search).has('tgWebAppPlatform') ||
    /Telegram/i.test(navigator.userAgent)
  );
  const telegramChromeOffset = isTelegramEmbedded ? Math.max(safeTop, webApp.isFullscreen ? 0 : 88) : 0;
  root.style.setProperty('--tg-top-offset', `${telegramChromeOffset}px`);
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
        sports: [],
        price: 'any',
        priceMin: '',
        priceMax: '',
        type: 'any',
        location: 'Все',
        amenity: 'Все',
        distance: 'any',
        distanceKm: 100,
        surface: 'Все',
        lighting: 'any',
        size: 'Все',
        rating: 'any',
        paid: 'any',
        sort: 'recommended',
        quickPinned: '',
        view: 'list',
        nearby: false,
        free: false,
        availableToday: false,
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
        openSlots: false,
        almostFull: false,
        sort: 'recommended',
        quickPinned: '',
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
      home: { ...fallback.home, ...(saved.home || {}), quickActions: fallback.home.quickActions },
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
    venues: normalizeVenueFilters({ ...fallback.venues, ...(saved.venues || {}) }),
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
  if (actionName === 'open-game-filters') {
    openSheet(gamesFiltersSheet());
    return;
  }
  if (actionName === 'open-venue-filters') {
    venueFilterDraft = normalizeVenueFilters(clone(state.filters.venues));
    openSheet(venuesFiltersSheet());
    return;
  }
  if (actionName === 'open-game-sort') {
    openSheet(gamesSortSheet());
    return;
  }
  if (actionName === 'open-venue-sort') {
    openSheet(venuesSortSheet());
    return;
  }
  if (actionName === 'open-location-sheet') {
    openSheet(locationSheet());
    return;
  }
  if (actionName === 'city-letter' && value) {
    const list = dom.sheetContent?.querySelector('[data-city-list]');
    const search = dom.sheetContent?.querySelector('[data-city-search]');
    dom.sheetContent?.querySelectorAll('[data-action="city-letter"]').forEach((button) => {
      button.classList.toggle('is-active', button === action);
    });
    if (list instanceof HTMLElement) {
      list.dataset.letter = value;
      list.innerHTML = renderLocationCityList(search instanceof HTMLInputElement ? search.value : '', value);
      list.scrollTop = 0;
    }
    return;
  }
  if (actionName === 'location-select' && value) {
    state.profile.city = value;
    if (!state.profile.district || state.profile.district === 'Москва') state.profile.district = value;
    saveState();
    renderApp();
    closeSheet();
    return;
  }
  if (actionName === 'filters-done') {
    closeSheet();
    return;
  }
  if (actionName === 'apply-venue-filters') {
    if (venueFilterDraft && hasVenueFilterChanges()) {
      state.filters.venues = normalizeVenueFilters({ ...state.filters.venues, ...venueFilterDraft });
      saveState();
      renderApp();
    }
    closeSheet();
    return;
  }
  if (actionName === 'game-sort') {
    state.filters.games.sort = value || 'recommended';
    saveState();
    renderApp();
    openSheet(gamesSortSheet());
    return;
  }
  if (actionName === 'venue-sort') {
    state.filters.venues.sort = value || 'recommended';
    saveState();
    renderApp();
    openSheet(venuesSortSheet());
    return;
  }
  if (actionName === 'game-filter') {
    const railScrollLeft = action.closest('.filter-rail')?.scrollLeft;
    toggleFilter('games', value);
    saveState();
    if (typeof railScrollLeft === 'number') {
      renderGamesOnly();
      restoreFilterRailScroll('games', railScrollLeft);
    } else {
      renderApp();
      refreshFilterSheet('games');
    }
    return;
  }
  if (actionName === 'venue-filter') {
    const railScrollLeft = action.closest('.filter-rail')?.scrollLeft;
    toggleFilter('venues', value);
    saveState();
    if (typeof railScrollLeft === 'number') {
      renderVenuesOnly();
      restoreFilterRailScroll('venues', railScrollLeft);
    } else {
      renderApp();
      refreshFilterSheet('venues');
    }
    return;
  }
  if (actionName === 'venue-filter-draft') {
    updateVenueFilterDraft(value);
    if (value?.startsWith('type:')) {
      syncVenueTypeSegment();
      updateVenueApplyButton();
      return;
    }
    refreshVenueFilterDraftSheet();
    return;
  }
  if (actionName === 'game-view') {
    state.filters.games.view = value || 'list';
    saveState();
    renderApp();
    return;
  }
  if (actionName === 'venue-view') {
    state.filters.venues.view = value || 'list';
    saveState();
    renderApp();
    return;
  }
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
    renderCatalogResults('games');
  }

  if (target.matches('[data-search="venues"]')) {
    state.filters.venues.query = target.value;
    saveState();
    renderCatalogResults('venues');
  }

  if (target.matches('[data-city-search]')) {
    const list = dom.sheetContent?.querySelector('[data-city-list]');
    dom.sheetContent?.querySelectorAll('[data-action="city-letter"]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.value === 'Все');
    });
    if (list instanceof HTMLElement) {
      list.dataset.letter = 'Все';
      list.innerHTML = renderLocationCityList(target.value, 'Все');
      list.scrollTop = 0;
    }
  }

  if (target.matches('[data-distance-range="venues"]')) {
    setVenueDraftDistanceRange(target.value);
    updateDistanceRangeControl(target);
    updateVenueApplyButton();
  }

  if (target.matches('[data-price-bound]')) {
    const nextPrice = setVenueDraftPriceBound(target.dataset.priceBound, target.value);
    syncVenuePriceControls(nextPrice);
    updateVenueApplyButton();
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

  if (target.matches('[data-distance-range="venues"]')) {
    setVenueDraftDistanceRange(target.value);
    refreshVenueFilterDraftSheet();
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
  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    dom.mobileApp?.scrollTo?.({ top: 0, left: 0, behavior: 'auto' });
    document.querySelector(`#screen-${screen}`)?.scrollTo?.({ top: 0, left: 0, behavior: 'auto' });
  });
}

function renderApp() {
  dom.screens.forEach((screen) => screen.classList.toggle('is-active', screen.dataset.screen === state.activeScreen));
  dom.navButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.nav === state.activeScreen));
  if (dom.screenTitle) dom.screenTitle.textContent = screenTitles[state.activeScreen] || 'SCORE PLAY';
  if (dom.screenLocation) dom.screenLocation.textContent = state.profile.city || 'Москва';
  if (dom.floatingCreateGame) dom.floatingCreateGame.hidden = state.activeScreen !== 'games';
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

function renderCatalogResults(scope) {
  const container = document.querySelector(`[data-catalog-results="${scope}"]`);
  if (!container) {
    if (scope === 'games') renderGamesOnly();
    if (scope === 'venues') renderVenuesOnly();
    return;
  }
  container.innerHTML = scope === 'games' ? renderGamesResults(getFilteredGames()) : renderVenuesResults(getFilteredVenues());
}

function restoreFilterRailScroll(scope, scrollLeft) {
  requestAnimationFrame(() => {
    const rail = document.querySelector(`#screen-${scope} .filter-rail`);
    if (rail) rail.scrollLeft = scrollLeft;
  });
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
  const scale = 2;
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.scale(scale, scale);

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
  ctx.font = '800 68px Nunito, Arial, sans-serif';
  const titleLines = getWrappedLines(ctx, achievement.title, 920).slice(0, 3);
  drawCenteredLines(ctx, titleLines, width / 2, 620, 82);

  ctx.fillStyle = '#5D6F94';
  ctx.font = '800 38px Nunito, Arial, sans-serif';
  const descriptionLines = getWrappedLines(ctx, achievement.text, 820).slice(0, 2);
  drawCenteredLines(ctx, descriptionLines, width / 2, 620 + titleLines.length * 82 + 34, 50);

  if (logo) drawContainedImage(ctx, logo, 420, 1150, 240);

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
        await navigator.share({ files: [file], text: payload.text });
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
  const result = state.games
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
      if (filters.almostFull) {
        const occupancy = Number(game.current || 0) / Math.max(1, Number(game.max || 1));
        if (game.current >= game.max || occupancy < 0.7) return false;
      }
      return true;
    });
  return sortGames(result, filters.sort);
}

function getFilteredVenues() {
  const filters = state.filters.venues;
  const query = normalize(filters.query);
  const selectedSports = getVenueSportValues(filters);
  const priceMin = filters.priceMin !== '' ? Number(filters.priceMin) : null;
  const priceMax = filters.priceMax !== '' ? Number(filters.priceMax) : null;
  const result = state.venues.filter((venue) => {
    if (query && !normalize([venue.name, venue.sport, venue.district, venue.metro, venue.address].join(' ')).includes(query)) return false;
    if (selectedSports.length && !selectedSports.includes(venue.sport)) return false;
    if (filters.price === 'free' && venue.price > 0) return false;
    if (filters.price === 'low' && venue.price > 2500) return false;
    if (filters.price === 'mid' && (venue.price < 2500 || venue.price > 5000)) return false;
    if (filters.price === 'high' && venue.price < 5000) return false;
    if (filters.price === 'paid' && venue.price === 0) return false;
    if (priceMin !== null && Number(venue.price || 0) < priceMin) return false;
    if (priceMax !== null && Number(venue.price || 0) > priceMax) return false;
    if (filters.distance === 'near' && parseDistance(venue.distance) > 2) return false;
    if (filters.distance === 'five' && parseDistance(venue.distance) > 5) return false;
    if (filters.distance === 'range' && parseDistance(venue.distance) > clamp(filters.distanceKm || 100, 1, 100)) return false;
    if (filters.type === 'indoor' && !venue.indoor) return false;
    if (filters.type === 'open' && venue.indoor) return false;
    if (filters.size !== 'Все' && venue.size !== filters.size) return false;
    if (filters.availableToday && !/сегодня|свобод/i.test(String(venue.nextSlot || ''))) return false;
    if (filters.favorite && !venue.favorite) return false;
    return true;
  });
  return sortVenues(result, filters.sort);
}

function parseDistance(value = '') {
  return Number(String(value).replace(',', '.').match(/\d+(\.\d+)?/)?.[0] || 99);
}

function sortGames(games, sort = 'recommended') {
  const sorted = [...games];
  if (sort === 'distance') return sorted.sort((a, b) => parseDistance(a.distance) - parseDistance(b.distance));
  if (sort === 'price' || sort === 'price-low') return sorted.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
  if (sort === 'popular' || sort === 'slots') return sorted.sort((a, b) => (Number(b.current || 0) / Math.max(1, Number(b.max || 1))) - (Number(a.current || 0) / Math.max(1, Number(a.max || 1))));
  if (sort === 'start-time' || sort === 'soon') return sorted.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));
  return sorted.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));
}

function sortVenues(venues, sort = 'recommended') {
  const sorted = [...venues];
  if (sort === 'distance') return sorted.sort((a, b) => parseDistance(a.distance) - parseDistance(b.distance));
  if (sort === 'price' || sort === 'price-low') return sorted.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
  if (sort === 'rating') return sorted.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
  if (sort === 'popular' || sort === 'available') return sorted.sort((a, b) => Number(b.favorite || b.label === 'Популярная') - Number(a.favorite || a.label === 'Популярная'));
  return sorted.sort((a, b) => Number(b.favorite || b.label === 'Популярная') - Number(a.favorite || a.label === 'Популярная'));
}

function toggleFilter(scope, value) {
  const filters = state.filters[scope];
  if (!filters) return;
  if (value === 'reset') {
    Object.keys(filters).forEach((key) => {
      if (typeof filters[key] === 'boolean') filters[key] = false;
      if (key === 'query') filters[key] = '';
      if (key === 'sport') filters[key] = 'Все';
      if (key === 'sports') filters[key] = [];
      if (key === 'price') filters[key] = 'any';
      if (key === 'priceMin') filters[key] = '';
      if (key === 'priceMax') filters[key] = '';
      if (key === 'type') filters[key] = 'any';
      if (key === 'location') filters[key] = 'Все';
      if (key === 'amenity') filters[key] = 'Все';
      if (key === 'distance') filters[key] = 'any';
      if (key === 'distanceKm') filters[key] = 100;
      if (key === 'surface') filters[key] = 'Все';
      if (key === 'lighting') filters[key] = 'any';
      if (key === 'size') filters[key] = 'Все';
      if (key === 'rating') filters[key] = 'any';
      if (key === 'paid') filters[key] = 'any';
      if (key === 'sort') filters[key] = 'recommended';
      if (key === 'quickPinned') filters[key] = '';
      if (key === 'date') filters[key] = 'any';
      if (key === 'time') filters[key] = 'any';
      if (key === 'level') filters[key] = 'Все';
      if (key === 'slots') filters[key] = 'any';
    });
    return;
  }
  if (typeof filters[value] === 'boolean') filters[value] = !filters[value];
  if (scope === 'venues' && value?.startsWith('sport:')) {
    const sport = value.slice(6);
    setVenueSportValues(filters, getVenueSportValues(filters).includes(sport) ? [] : [sport]);
  }
  if (scope === 'venues' && value?.startsWith('price:')) filters.price = filters.price === value.slice(6) ? 'any' : value.slice(6);
  if (scope === 'venues' && value?.startsWith('type:')) filters.type = filters.type === value.slice(5) ? 'any' : value.slice(5);
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
  if (isQuickFilterValue(scope, value)) {
    filters.quickPinned = isFilterValueActive(scope, filters, value) ? value : '';
  }
}

function setVenueDistanceRange(value) {
  const distanceKm = clamp(value, 1, 100);
  state.filters.venues.distanceKm = distanceKm;
  state.filters.venues.distance = distanceKm >= 100 ? 'any' : 'range';
  if (state.filters.venues.quickPinned === 'distance:near') state.filters.venues.quickPinned = '';
}

function updateVenueFilterDraft(value) {
  if (!venueFilterDraft) venueFilterDraft = normalizeVenueFilters(clone(state.filters.venues));
  if (value === 'reset') {
    resetVenueFilterValues(venueFilterDraft);
    return;
  }
  if (value?.startsWith('sport:')) {
    const sport = value.slice(6);
    const selected = getVenueSportValues(venueFilterDraft);
    setVenueSportValues(
      venueFilterDraft,
      selected.includes(sport) ? selected.filter((item) => item !== sport) : [...selected, sport]
    );
    return;
  }
  if (value?.startsWith('type:')) {
    venueFilterDraft.type = value.slice(5);
    return;
  }
  if (value?.startsWith('distance:')) {
    const next = value.slice(9);
    const distanceKm = next === 'any' ? 100 : clamp(next, 1, 100);
    venueFilterDraft.distanceKm = distanceKm;
    venueFilterDraft.distance = next === 'any' || distanceKm >= 100 ? 'any' : 'range';
    if (venueFilterDraft.quickPinned === 'distance:near') venueFilterDraft.quickPinned = '';
    return;
  }
  if (value?.startsWith('size:')) {
    const next = value.slice(5);
    venueFilterDraft.size = venueFilterDraft.size === next ? 'Все' : next;
  }
}

function setVenueDraftDistanceRange(value) {
  if (!venueFilterDraft) venueFilterDraft = normalizeVenueFilters(clone(state.filters.venues));
  const distanceKm = clamp(value, 1, 100);
  venueFilterDraft.distanceKm = distanceKm;
  venueFilterDraft.distance = distanceKm >= 100 ? 'any' : 'range';
  if (venueFilterDraft.quickPinned === 'distance:near') venueFilterDraft.quickPinned = '';
}

function setVenueDraftPriceBound(bound, value) {
  if (!venueFilterDraft) venueFilterDraft = normalizeVenueFilters(clone(state.filters.venues));
  const clean = String(value || '').replace(/[^\d]/g, '');
  if (bound === 'min') venueFilterDraft.priceMin = clean;
  if (bound === 'max') venueFilterDraft.priceMax = clean;
  const min = Number(venueFilterDraft.priceMin);
  const max = Number(venueFilterDraft.priceMax);
  if (venueFilterDraft.priceMin !== '' && venueFilterDraft.priceMax !== '' && max < min) {
    if (bound === 'max') {
      venueFilterDraft.priceMax = venueFilterDraft.priceMin;
    } else {
      venueFilterDraft.priceMax = venueFilterDraft.priceMin;
    }
  }
  const hasPriceRange = Boolean(venueFilterDraft.priceMin || venueFilterDraft.priceMax);
  venueFilterDraft.price = hasPriceRange ? 'range' : 'any';
  return { min: venueFilterDraft.priceMin, max: venueFilterDraft.priceMax };
}

function syncVenuePriceControls(price) {
  const next = price || {
    min: venueFilterDraft?.priceMin || '',
    max: venueFilterDraft?.priceMax || ''
  };
  const minInput = dom.sheetContent?.querySelector('[data-price-bound="min"]');
  const maxInput = dom.sheetContent?.querySelector('[data-price-bound="max"]');
  if (minInput instanceof HTMLInputElement) minInput.value = next.min;
  if (maxInput instanceof HTMLInputElement) maxInput.value = next.max;
}

function updateVenueApplyButton() {
  const button = dom.sheetContent?.querySelector('[data-action="apply-venue-filters"]');
  const resetButton = dom.sheetContent?.querySelector('.filter-reset-button');
  if (!button) return;
  const hasChanges = hasVenueFilterChanges();
  const canReset = hasChanges || activeVenueFilterCount(normalizeVenueFilters(venueFilterDraft || state.filters.venues)) > 0;
  button.disabled = !hasChanges;
  button.classList.toggle('is-active', hasChanges);
  resetButton?.classList.toggle('is-active', canReset);
}

function syncVenueTypeSegment() {
  const segment = dom.sheetContent?.querySelector('.type-segment');
  if (!(segment instanceof HTMLElement)) return;
  const activeType = venueFilterDraft?.type || 'any';
  segment.dataset.active = activeType;
  segment.querySelectorAll('button[data-value]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.value === `type:${activeType}`);
  });
}

function refreshVenueFilterDraftSheet() {
  const body = dom.sheetContent?.querySelector('.filter-sheet-body');
  const scrollTop = body?.scrollTop || 0;
  dom.sheetContent.innerHTML = venuesFiltersSheet();
  const nextBody = dom.sheetContent?.querySelector('.filter-sheet-body');
  if (nextBody) nextBody.scrollTop = scrollTop;
}

function updateDistanceRangeControl(input) {
  const value = clamp(input.value, 1, 100);
  const control = input.closest('.distance-range-control');
  const section = input.closest('.distance-range-section');
  control?.style.setProperty('--range-progress', `${((value - 1) / 99) * 100}%`);
  const label = section?.querySelector('[data-distance-value]');
  if (label) label.textContent = value >= 100 ? 'до 100 км' : `до ${value} км`;
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
    ${sheetHeader(event.type, event.title, `${event.time} · ${event.place}`)}
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
  const action = collection === 'games' ? 'favorite-game' : 'favorite-venue';
  const button = document.querySelector(`[data-action="${action}"][data-id="${escapeAttr(id)}"]`);
  if (button instanceof HTMLElement) {
    button.classList.remove('is-bouncing');
    button.offsetHeight;
    button.classList.add('is-bouncing');
    button.classList.toggle('is-active', item.favorite);
    button.setAttribute('aria-label', item.favorite ? 'Убрать из избранного' : 'Добавить в избранное');
    window.setTimeout(() => button.classList.remove('is-bouncing'), 420);
  }
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
  clearTimeout(sheetCloseTimer);
  dom.sheetContent.innerHTML = markup;
  dom.sheetContent.scrollTop = 0;
  bindDetailPhotoSliders();
  dom.sheetPanel?.classList.toggle('is-achievement-sheet', markup.includes('achievement-detail-sheet'));
  dom.sheetPanel?.classList.toggle('is-filter-sheet', markup.includes('filter-sheet'));
  dom.sheetPanel?.classList.toggle('is-sort-sheet', markup.includes('sort-sheet'));
  dom.sheetPanel?.classList.toggle('is-notifications-sheet', markup.includes('notifications-sheet'));
  dom.sheetPanel?.classList.toggle('is-detail-sheet', markup.includes('class="detail-sheet'));
  dom.sheetPanel?.classList.toggle('is-location-sheet', markup.includes('location-sheet'));
  updateProfileStickyTitle();
  dom.sheet.hidden = false;
  dom.sheet.setAttribute('aria-hidden', 'false');
  dom.sheet.classList.remove('is-open', 'is-closing', 'is-dragging');
  document.body.classList.add('has-open-sheet');
  if (dom.sheetPanel) {
    dom.sheetPanel.style.transform = 'translate3d(0, 105%, 0)';
  }
  dom.sheet.offsetHeight;
  requestAnimationFrame(() => {
    dom.sheet.classList.add('is-open');
    if (dom.sheetPanel) dom.sheetPanel.style.transform = '';
  });
}

function closeSheet() {
  if (!dom.sheet || dom.sheet.hidden || dom.sheet.classList.contains('is-closing')) return;
  clearTimeout(sheetCloseTimer);
  dom.sheet.setAttribute('aria-hidden', 'true');
  dom.sheet.classList.remove('is-open', 'is-dragging');
  dom.sheet.classList.add('is-closing');
  if (dom.sheetPanel) {
    dom.sheetPanel.style.transform = 'translate3d(0, 105%, 0)';
  }
  sheetCloseTimer = setTimeout(() => {
    dom.sheet.hidden = true;
    dom.sheet.classList.remove('is-closing');
    dom.sheetContent.innerHTML = '';
    dom.sheetPanel?.classList.remove('is-achievement-sheet');
    dom.sheetPanel?.classList.remove('is-filter-sheet');
    dom.sheetPanel?.classList.remove('is-sort-sheet');
    dom.sheetPanel?.classList.remove('is-notifications-sheet');
    dom.sheetPanel?.classList.remove('is-detail-sheet');
    dom.sheetPanel?.classList.remove('is-location-sheet');
    venueFilterDraft = null;
    if (dom.sheetPanel) dom.sheetPanel.style.transform = '';
    document.body.classList.remove('has-open-sheet');
  }, SHEET_CLOSE_ANIMATION_MS);
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
  let lastY = 0;
  let lastTime = 0;
  let velocity = 0;
  let dragging = false;

  dom.sheetPanel.addEventListener('pointerdown', (event) => {
    if (dom.sheet?.classList.contains('is-closing')) return;
    if (event.target.closest('input, textarea, select, button')) return;
    const rect = dom.sheetPanel.getBoundingClientRect();
    if (!event.target.closest('.sheet-handle') && event.clientY - rect.top > 72) return;
    startY = event.clientY;
    currentY = 0;
    lastY = event.clientY;
    lastTime = performance.now();
    velocity = 0;
    dragging = true;
    dom.sheet?.classList.add('is-dragging');
    dom.sheetPanel.setPointerCapture(event.pointerId);
  });

  dom.sheetPanel.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const now = performance.now();
    currentY = Math.max(0, event.clientY - startY);
    velocity = (event.clientY - lastY) / Math.max(1, now - lastTime);
    lastY = event.clientY;
    lastTime = now;
    dom.sheetPanel.style.transform = `translate3d(0, ${currentY}px, 0)`;
  });

  function finishDrag() {
    if (!dragging) return;
    dragging = false;
    dom.sheet?.classList.remove('is-dragging');
    if (currentY > 92 || (currentY > 36 && velocity > 0.7)) {
      closeSheet();
      return;
    }
    dom.sheetPanel.style.transform = '';
  }

  dom.sheetPanel.addEventListener('pointerup', finishDrag);
  dom.sheetPanel.addEventListener('pointercancel', finishDrag);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}


})();
