import { emptyState, statCard, statusPill } from './ui.js';
import { escapeAttr, escapeHtml, formatGameDate, formatPrice, getAvatarSrc, getGameStatus } from '../utils/format.js';

export function renderGameCard(game) {
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

export function renderVenueCard(venue) {
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

export function renderProfileCard(profile) {
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

export function renderTeamCard(team, compact = false) {
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

export function renderTeamEvent(event) {
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

export function renderMemberRow([name, meta], action = '') {
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

export function renderGameRow(game) {
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

export function renderEmptyGames() {
  return emptyState('Игр пока нет', 'Когда вы присоединитесь к игре, она появится здесь.', 'Найти игру', 'nav');
}
