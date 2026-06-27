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

export function achievementDetailSheet(achievement) {
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

export function gameDetailSheet(game) {
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

export function profileDetailSheet(profile, editing = false) {
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
      <div class="profile-detail-avatar-row">
        <button class="profile-detail-action is-primary" type="button" data-action="share-profile" aria-label="Поделиться профилем">
          <img src="./icons/share.png" alt="" aria-hidden="true">
        </button>
        <button class="profile-detail-avatar-button" type="button" data-action="${avatarAction}" aria-label="${editing ? 'Сменить аватар' : 'Открыть аватар'}">
          <img class="profile-detail-avatar" src="${getAvatarSrc(profile.avatarId, profile.avatarDataUrl)}" alt="">
        </button>
        <button class="profile-detail-action" type="button" data-action="edit-profile" aria-label="Редактировать профиль">
          <img src="./icons/edit.png" alt="" aria-hidden="true">
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

export function avatarViewSheet(profile) {
  return `
    <section class="avatar-view-card">
      <button class="avatar-view-close" type="button" data-close-sheet aria-label="Закрыть">
        <img src="./icons/close.png" alt="" aria-hidden="true">
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
