import { escapeAttr, escapeHtml } from '../utils/format.js';

export function progressBar(value, max, label = '') {
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

export function statCard(label, value) {
  return `
    <div class="stat-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(String(value))}</strong>
    </div>
  `;
}

export function chip({ label, active = false, disabled = false, action = '', value = '', extraClass = '' }) {
  const actionAttrs = action ? `data-action="${escapeAttr(action)}" data-value="${escapeAttr(value)}"` : '';
  return `
    <button class="chip ${active ? 'is-active' : ''} ${disabled ? 'is-disabled' : ''} ${extraClass}" type="button" ${actionAttrs} ${disabled ? 'disabled' : ''}>
      ${escapeHtml(label)}
    </button>
  `;
}

export function statusPill(label, className = '') {
  return `<span class="status-pill ${escapeAttr(className)}">${escapeHtml(label)}</span>`;
}

export function emptyState(title, text, actionLabel = '', action = '', value = '') {
  const actionAttrs = action ? `data-action="${escapeAttr(action)}" ${value ? `data-value="${escapeAttr(value)}"` : ''}` : '';
  return `
    <article class="empty-state">
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(text)}</p>
      ${actionLabel ? `<button class="secondary-pill" type="button" ${actionAttrs}>${escapeHtml(actionLabel)}</button>` : ''}
    </article>
  `;
}

export function loadingState(text = 'Загружаем') {
  return `
    <div class="loading-state" aria-live="polite">
      <span></span>
      <p>${escapeHtml(text)}</p>
    </div>
  `;
}

export function searchBar({ scope, value, placeholder, buttonLabel = '', buttonAction = '' }) {
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

export function viewToggle(active) {
  return `
    <div class="view-toggle" role="group" aria-label="Вид">
      <button class="${active === 'list' ? 'is-active' : ''}" type="button" data-action="game-view" data-value="list">Список</button>
      <button class="${active === 'map' ? 'is-active' : ''}" type="button" data-action="game-view" data-value="map">Карта</button>
    </div>
  `;
}
