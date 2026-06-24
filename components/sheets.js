import { emptyState, statCard } from './ui.js';
import { escapeAttr, escapeHtml, formatGameDate, formatPrice, getAvatarSrc, getGameStatus, toInputDate, uniqueSports } from '../utils/format.js';

export function createGameSheet({ state, defaultDate }) {
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

export function gameDetailSheet(game) {
  const status = getGameStatus(game);
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
    <div class="card-actions">
      <button class="button button-secondary" type="button" data-action="favorite-game" data-id="${game.id}">${game.favorite ? 'В избранном' : 'Сохранить'}</button>
      <button class="button button-primary" type="button" data-action="join-game" data-id="${game.id}" ${game.current >= game.max && !game.joined ? 'disabled' : ''}>${game.joined ? 'Выйти из игры' : 'Участвовать'}</button>
    </div>
  `;
}

export function venueDetailSheet(venue) {
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
    <div class="chip-scroll wrap">${venue.amenities.map((item) => `<span class="meta-pill">${escapeHtml(item)}</span>`).join('')}</div>
    <div class="card-actions">
      <button class="button button-secondary" type="button" data-action="favorite-venue" data-id="${venue.id}">${venue.favorite ? 'В избранном' : 'Сохранить'}</button>
      <button class="button button-primary" type="button" data-action="create-game">Создать игру</button>
    </div>
  `;
}

export function teamRequestsSheet(team) {
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

export function notificationsSheet(notifications) {
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

export function profileDetailSheet(profile) {
  const nickname = profile.nickname || '#77777';
  const profileItems = [
    ['Расположение', profile.district || profile.city || 'Москва', './icons/Местоположение%20.png'],
    ['Номер игрока', nickname, './icons/Профиль.png'],
    ['Телефон', profile.phone || 'Не указан', './icons/Телефон.png'],
    ['Почта', profile.email || 'Не указана', './icons/Почта.png'],
    ['Соцсеть', profile.social || 'Не указана', './icons/Сайт.png']
  ];
  return `
    <section class="profile-detail-card">
      <span class="eyebrow profile-detail-kicker">Профиль игрока</span>
      <div class="profile-detail-heading">
        <h2>${escapeHtml(profile.name)}</h2>
        <p>${escapeHtml(nickname)}</p>
      </div>
      <div class="profile-detail-avatar-row">
        <button class="profile-detail-action is-primary" type="button" data-action="share-profile" aria-label="Поделиться профилем">
          <img src="./icons/поделиться.png" alt="" aria-hidden="true">
        </button>
        <button class="profile-detail-avatar-button" type="button" data-action="view-avatar" aria-label="Открыть аватар">
          <img class="profile-detail-avatar" src="${getAvatarSrc(profile.avatarId, profile.avatarDataUrl)}" alt="">
        </button>
        <button class="profile-detail-action" type="button" data-action="edit-profile" aria-label="Редактировать профиль">
          <img src="./icons/Редактировать.png" alt="" aria-hidden="true">
        </button>
      </div>
      <div class="profile-detail-metrics">
        ${statCard('Игр сыграно', profile.stats.games)}
        ${statCard('Очков SCORE', Number(profile.stats.scorePoints || 0).toLocaleString('ru-RU'))}
      </div>
      <div class="profile-info-grid">
        ${profileItems.map(([label, value, icon]) => `
          <div class="profile-info-item ${label === 'Почта' || label === 'Расположение' ? 'wide' : ''}">
            <img src="${icon}" alt="" aria-hidden="true">
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(value)}</strong>
          </div>
        `).join('')}
      </div>
      <div class="profile-sports-card profile-detail-sports">
        <span>Виды спорта</span>
        <div>${profile.sports.map((sport) => `<b>${escapeHtml(sport.type)}</b>`).join('')}</div>
      </div>
      <p class="profile-detail-about">${escapeHtml(profile.about)}</p>
    </section>
  `;
}

export function avatarViewSheet(profile) {
  return `
    <section class="avatar-view-card">
      <button class="avatar-view-close" type="button" data-close-sheet aria-label="Закрыть">
        <img src="./icons/Крестик.png" alt="" aria-hidden="true">
      </button>
      <img src="${getAvatarSrc(profile.avatarId, profile.avatarDataUrl)}" alt="">
    </section>
  `;
}

export function avatarChangeSheet(profile) {
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

export function profileEditSheet(profile) {
  return `
    <div class="sheet-heading">
      <span class="eyebrow">Профиль</span>
      <h2>Настроить профиль</h2>
    </div>
    <form id="profile-form" class="form-grid profile-edit-form">
      <button class="avatar-upload" type="button" data-action="change-avatar">
        <span><img src="${getAvatarSrc(profile.avatarId, profile.avatarDataUrl)}" alt=""></span>
        <strong>Аватар профиля</strong>
        <small>Откройте отдельный экран выбора</small>
        <b>Сменить аватар</b>
      </button>
      <section class="profile-form-card">
        <label class="field">Имя<input name="name" value="${escapeAttr(profile.name)}"></label>
        <label class="field">Никнейм<input name="nickname" value="${escapeAttr(profile.nickname || '#77777')}"></label>
        <label class="field">Район<input name="district" value="${escapeAttr(profile.district)}"></label>
        <label class="field">Телефон<input name="phone" value="${escapeAttr(profile.phone || '')}"></label>
        <label class="field">Почта<input name="email" value="${escapeAttr(profile.email || '')}"></label>
        <label class="field">Соцсеть<input name="social" value="${escapeAttr(profile.social || '')}"></label>
        <label class="field">О себе<textarea name="about">${escapeHtml(profile.about)}</textarea></label>
      </section>
      <section class="profile-form-card">
      <div class="form-pair">
        <label class="field">Цель<select name="goal"><option>${escapeHtml(profile.goal)}</option><option>Играть чаще</option><option>Найти команду</option><option>Ежедневная активность</option></select></label>
        <label class="field">Уровень<select name="level"><option>${escapeHtml(profile.level)}</option><option>Новичок</option><option>Любитель</option><option>Средний</option><option>Продвинутый</option></select></label>
      </div>
      <label class="field">Шаги в день<input name="stepGoal" type="number" min="4000" max="20000" step="500" value="${profile.stepGoal}"></label>
      </section>
      <button class="button button-primary button-full profile-submit" type="button" data-action="save-profile">Сохранить</button>
    </form>
  `;
}
