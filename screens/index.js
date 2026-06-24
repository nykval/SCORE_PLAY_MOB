import { renderGameCard, renderGameRow, renderMemberRow, renderProfileCard, renderTeamCard, renderTeamEvent, renderVenueCard } from '../components/cards.js';
import { chip, emptyState, progressBar, searchBar, viewToggle } from '../components/ui.js';
import { escapeHtml, formatGameDate, formatNumber, formatPrice, uniqueSports } from '../utils/format.js';

export function renderHome({ state, nextGame }) {
  const profile = state.profile;
  const stepsLeft = Math.max(0, Number(profile.stepGoal || 0) - Number(profile.stepsDone || 0));
  const joinedGames = state.games.filter((game) => game.joined);
  const suggestedGames = state.games.filter((game) => !game.joined && game.current < game.max).slice(0, 2);
  return `
    <div class="screen-stack">
      <article class="home-main-card">
        <div class="home-main-copy">
          <span class="eyebrow">Сегодня</span>
          <h1>${escapeHtml(nextGame.sport)} уже ждёт</h1>
          <p>${formatGameDate(nextGame)} · ${escapeHtml(nextGame.place)}</p>
        </div>
        <div class="home-game-panel" role="button" tabindex="0" data-action="game-detail" data-id="${nextGame.id}">
          <img src="${nextGame.image}" alt="">
          <div>
            <span>${nextGame.joined ? 'Вы участвуете' : 'Можно присоединиться'}</span>
            <strong>${escapeHtml(nextGame.title)}</strong>
            <small>${nextGame.current} из ${nextGame.max} игроков · ${formatPrice(nextGame.price)}</small>
          </div>
        </div>
        <div class="home-main-actions">
          <button class="button button-primary" type="button" data-action="game-detail" data-id="${nextGame.id}">Открыть игру</button>
          <button class="button button-secondary" type="button" data-action="nav" data-value="games">Все игры</button>
        </div>
      </article>

      <section class="home-progress-card">
        <div>
          <div>
            <span class="eyebrow">Активность</span>
            <h2>${formatNumber(profile.stepsDone)} шагов</h2>
            <p>До цели осталось ${formatNumber(stepsLeft)}. Держим мягкий темп без перегруза.</p>
          </div>
          <strong>${Math.round((profile.stepsDone / profile.stepGoal) * 100)}%</strong>
        </div>
        ${progressBar(profile.stepsDone, profile.stepGoal, 'Прогресс')}
      </section>

      <section class="home-profile-card card-affordance" role="button" tabindex="0" data-action="profile-detail">
        <div>
          <span class="eyebrow">Профиль</span>
          <h2>${escapeHtml(profile.name)}</h2>
          <p>${escapeHtml(profile.nickname || '#77777')} · ${escapeHtml(profile.city || 'Москва')}</p>
        </div>
        <div class="home-profile-stats">
          <span><b>${profile.stats.games}</b><small>игр</small></span>
          <span><b>${formatNumber(profile.stats.scorePoints)}</b><small>очков</small></span>
          <span><b>${profile.sports.length}</b><small>спорта</small></span>
        </div>
      </section>

      <section class="home-row-section">
        <div class="section-header compact">
          <h2>${joinedGames.length > 1 ? 'Твои игры' : 'Подходит рядом'}</h2>
          <button class="link-action" type="button" data-action="nav" data-value="games">Все ›</button>
        </div>
        <div class="home-game-strip">
          ${(joinedGames.length > 1 ? joinedGames : suggestedGames).map(renderMiniGameTile).join('')}
        </div>
      </section>

      <section class="section-card home-recommendation">
        <div class="section-header compact">
          <div>
            <span class="eyebrow">Рекомендация</span>
            <h2>Золотой час</h2>
            <p>Лучшее окно для тренировки сегодня: меньше людей, мягкий свет и комфортный темп.</p>
          </div>
          <strong>19:10</strong>
        </div>
      </section>
    </div>
  `;
}

export function renderGamesScreen({ state, games }) {
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

export function renderVenuesScreen({ state, venues }) {
  const sports = ['Все', ...uniqueSports(state.venues)];
  const locations = ['Все', ...Array.from(new Set(state.venues.flatMap((venue) => [venue.district, venue.metro]).filter(Boolean)))];
  const amenities = ['Все', ...Array.from(new Set(state.venues.flatMap((venue) => venue.amenities || [])))];
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
              ['mid', '2 500-5 000 ₽']
            ].map(([value, label]) => chip({ label, active: state.filters.venues.price === value, action: 'venue-filter', value: `price:${value}` })).join('')}
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
      </div>
      <div class="list-stack">
        ${venues.length ? venues.map(renderVenueCard).join('') : emptyState('Площадок не найдено', 'Измените фильтры или посмотрите соседний район.', 'Сбросить фильтры', 'venue-filter', 'reset')}
      </div>
    </div>
  `;
}

export function renderFavoritesScreen({ games, venues }) {
  return `
    <div class="screen-stack">
      <section class="favorites-section">
        <div class="section-header compact"><h2>Избранные площадки</h2><span class="result-label">${venues.length}</span></div>
        <div class="favorites-strip">
          ${venues.length ? venues.map(renderFavoriteVenueTile).join('') : emptyState('Пока пусто', 'Сохраняйте площадки, чтобы быстро вернуться к ним.')}
        </div>
      </section>
      <section class="favorites-section">
        <div class="section-header compact"><h2>Избранные игры</h2><span class="result-label">${games.length}</span></div>
        <div class="favorites-strip">
          ${games.length ? games.map(renderFavoriteGameTile).join('') : emptyState('Игр пока нет', 'Сохраняйте интересные игры из списка.')}
        </div>
      </section>
    </div>
  `;
}

export function renderProfileScreen({ state, teams, joinedGames }) {
  return `
    <div class="screen-stack">
      ${renderProfileCard(state.profile)}
      <section class="section-card">
        <div class="section-header"><h2>Мои игры</h2></div>
        ${joinedGames.length ? joinedGames.map(renderGameRow).join('') : emptyState('Вы пока не участвуете в играх', 'Найдите игру рядом или создайте свою.', 'Найти игру', 'nav', 'games')}
      </section>
      <section class="section-card">
        <div class="section-header"><h2>Мои команды</h2></div>
        <div class="mini-team-list">
          ${teams.length ? teams.map((team) => renderTeamCard(team, true)).join('') : emptyState('Команд пока нет', 'Создайте команду и пригласите игроков.', 'Создать команду', 'create-team')}
        </div>
      </section>
      <section class="section-card">
        <div class="section-header"><h2>Любимые виды спорта</h2></div>
        <div class="chip-scroll wrap">
          ${state.profile.sports.map((sport) => chip({ label: `${sport.type} · ${sport.level}`, active: true, action: 'remove-sport', value: sport.type })).join('')}
          ${chip({ label: 'Добавить', action: 'add-sport' })}
        </div>
      </section>
    </div>
  `;
}

export function renderTeamScreen({ state, team }) {
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

function renderMapPreview(games) {
  const pins = games.slice(0, 8).map((game, index) => `<span style="--x:${18 + (index * 11) % 62}%;--y:${24 + (index * 17) % 52}%">${game.price ? `${game.price} ₽` : '0 ₽'}</span>`).join('');
  return `
    <section class="map-preview">
      ${pins}
      <strong>Игры рядом</strong>
    </section>
  `;
}

function allGameFiltersOff(filters) {
  return !filters.today && !filters.free && !filters.coach && !filters.nearby && !filters.favorite;
}

function allVenueFiltersOff(filters) {
  return !filters.free && !filters.favorite && !filters.indoor && !filters.open && !filters.isNew && filters.sport === 'Все' && filters.price === 'any' && filters.location === 'Все' && filters.amenity === 'Все';
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

function renderFavoriteGameTile(game) {
  return `
    <button class="favorite-tile" type="button" data-action="game-detail" data-id="${game.id}">
      <img src="${game.image}" alt="">
      <span>${game.isNew ? 'Набор' : 'Матч'}</span>
      <strong>${escapeHtml(game.sport)}</strong>
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
