import { places, categories, rarities, sources } from './data/catalog.js';
import { icon, landmark } from './ui/icons.js';
import { placeIcons } from './data/place-icons.js';
import { withDemoVisits } from './data/demo.js';
import { filterPlaces, getProgress } from './lib/catalog.js';
import { CollectionStore, storageError } from './lib/storage.js';
import { createBackup, parseBackup } from './lib/backup.js';
import { Camera, cameraError } from './lib/camera.js';
import { RecognitionService } from './recognition/service.js';

const $ = (selector, parent = document) => parent.querySelector(selector);
const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const date = (value) => new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value));
const store = new CollectionStore();
const recognizer = new RecognitionService(places);
const state = {
  tab: 'collection', filters: { query: '', category: '', municipality: '', rarity: '', status: 'all' },
  discoveries: new Map(), captures: new Map(), photoUrls: new Map(), flipped: new Set(), storageReady: false, demoEnabled: new URLSearchParams(location.search).get('demo') !== '0',
};
const municipalities = [...new Set(places.map((place) => place.municipality))].sort((a, b) => a.localeCompare(b, 'es'));
let activeModal = null;
let toastTimer;

function options(items) { return items.map(({ id, label }) => `<option value="${escape(id)}">${escape(label)}</option>`).join(''); }
function categoryLabel(id) { return categories.find((category) => category.id === id)?.label || id; }
function rarityLabel(id) { return rarities.find((rarity) => rarity.id === id)?.label || id; }

const displayedDiscoveries = () => withDemoVisits(state.discoveries, state.demoEnabled);
const photoUrl = (discovery) => discovery?.demo ? discovery.photoUrl : state.photoUrls.get(discovery?.captureId);
const drawing = (place) => landmark(placeIcons[place.id] || place.icon, place.number);

function shell() {
  $('#app').innerHTML = `
    <header class="site-header">
      <div class="header-inner">
        <a class="brand" href="./" aria-label="Mallorca Unlocked, inicio"><span class="brand-symbol">${icon('sun')}</span><span class="brand-word">mallorca<span class="brand-small">UNLOCKED</span></span></a>
        <nav class="main-nav" aria-label="Principal">
          <button class="nav-link is-active" data-tab="collection" aria-current="page">${icon('grid')}<span>La colección</span></button>
          <button class="nav-link" data-tab="memories">${icon('image')}<span>Mis recuerdos</span><span class="nav-count" id="memory-count">0</span></button>
        </nav>
        <div class="header-end"><span class="local-label"><span class="status-dot"></span>Solo en tu dispositivo</span><button class="icon-button settings-button" id="settings" aria-label="Ajustes y copia de seguridad">${icon('settings')}</button></div>
      </div>
    </header>
    <main class="page-main">
      <section class="collection-intro" aria-labelledby="page-title">
        <div class="intro-heading"><p class="eyebrow">MALLORCA · ÁLBUM DE LUGARES</p><h1 id="page-title">Tu colección.</h1></div>
        <div class="collection-progress" aria-label="Progreso de la colección"><div class="progress-value"><strong id="progress-discovered">0</strong><span>/ ${places.length}</span></div><span class="progress-caption">lugares descubiertos</span><div class="progress-track" role="progressbar" aria-label="Lugares descubiertos" aria-valuemin="0" aria-valuemax="${places.length}" aria-valuenow="0"><span id="progress-fill"></span></div><span id="progress-message" class="sr-only"></span><span id="progress-percent" class="sr-only"></span></div>
        <button class="primary-button capture-button" id="open-camera">${icon('camera')}<span>Fotografiar un lugar</span><span class="button-orb">${icon('arrow')}</span></button>
      </section>
      <div class="collection-context"><div class="demo-note" id="demo-note"><span class="status-dot"></span><span id="demo-label">3 visitas de muestra</span><button id="toggle-demo" aria-label="Ocultar visitas de muestra">Ocultar ${icon('close')}</button></div><button class="recognition-hint" id="hero-recognition">Identificación pendiente ${icon('info')}</button></div>
      <div class="sr-only"><h2 id="collection-title">La colección</h2></div>
      <section id="collection" aria-label="Colección de lugares" tabindex="-1">
        <div class="filters-bar"><label class="search-field">${icon('search')}<span class="sr-only">Buscar un lugar o municipio</span><input id="search" type="search" placeholder="Buscar un lugar…" autocomplete="off" maxlength="100" /></label><div class="select-filters"><label class="select-field"><span class="sr-only">Categoría</span><select id="category" aria-label="Categoría"><option value="">Todas las categorías</option>${options(categories)}</select>${icon('down')}</label><label class="select-field"><span class="sr-only">Municipio</span><select id="municipality" aria-label="Municipio"><option value="">Todos los municipios</option>${municipalities.map((municipality) => `<option>${escape(municipality)}</option>`).join('')}</select>${icon('down')}</label><label class="select-field rarity-filter"><span class="sr-only">Rareza</span><select id="rarity" aria-label="Rareza"><option value="">Todas las rarezas</option>${options(rarities)}</select>${icon('down')}</label></div></div>
        <div class="collection-meta"><div class="status-filters" role="group" aria-label="Estado de la colección"><button class="text-filter is-active" data-status="all" aria-pressed="true">Todos</button><button class="text-filter" data-status="locked" aria-pressed="false">Por descubrir</button><button class="text-filter" data-status="discovered" aria-pressed="false">Descubiertos</button></div><span class="results-count" id="results-count" aria-live="polite"></span></div>
        <div class="coin-grid" id="coin-grid"></div>
        <div id="empty-state" class="empty-state" hidden></div>
        <section id="pending-section" class="pending-section" aria-labelledby="pending-title" hidden><div class="section-title"><h2 id="pending-title">Capturas pendientes</h2><span class="count-badge" id="pending-count"></span></div><p class="section-note">Guardadas en este dispositivo. Aún no desbloquean una moneda.</p><div class="pending-grid" id="pending-grid"></div></section>
      </section>
      <footer class="site-footer"><span>100 lugares. Una isla.</span><div><button id="rarity-info" class="footer-link">Rareza según afluencia</button><span class="footer-divider"></span><button id="recognition-info" class="footer-link"><span class="status-dot amber"></span>Reconocimiento en preparación</button><span class="footer-divider"></span><button id="about" class="footer-link">Sobre el proyecto ${icon('arrow')}</button></div></footer>
    </main><div id="toast" class="toast" role="status" hidden></div>`;

  $('#toggle-demo').addEventListener('click', () => {
    state.demoEnabled = !state.demoEnabled;
    const url = new URL(location.href); url.searchParams.set('demo', state.demoEnabled ? '1' : '0'); history.replaceState(null, '', url);
    state.flipped.clear(); updateProgress(); renderCollection();
  });
  $('#rarity-info').addEventListener('click', showRarityInfo);
  $('#settings').addEventListener('click', showSettings);
  $('#about').addEventListener('click', showAbout);
  $('#recognition-info').addEventListener('click', showRecognitionInfo);
  $('#hero-recognition').addEventListener('click', showRecognitionInfo);
  $('#open-camera').addEventListener('click', () => showCamera());
  document.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => {
    setTab(button.dataset.tab);
  }));
  for (const key of ['category', 'municipality', 'rarity']) $(`#${key}`).addEventListener('change', (event) => { state.filters[key] = event.target.value; renderCollection(); });
  $('#search').addEventListener('input', (event) => { state.filters.query = event.target.value; renderCollection(); });
  document.querySelectorAll('[data-status]').forEach((button) => button.addEventListener('click', () => { state.filters.status = button.dataset.status; renderCollection(); }));
  $('#coin-grid').addEventListener('click', (event) => {
    const info = event.target.closest('[data-details]');
    if (info) return showPlace(places.find((place) => place.id === info.dataset.details));
    const coin = event.target.closest('[data-coin]');
    if (!coin) return;
    const place = places.find((place) => place.id === coin.dataset.coin);
    if (!displayedDiscoveries().has(place.id)) return showPlace(place);
    if (state.flipped.has(place.id)) state.flipped.delete(place.id); else state.flipped.add(place.id);
    coin.classList.toggle('is-flipped', state.flipped.has(place.id));
    coin.setAttribute('aria-pressed', String(state.flipped.has(place.id)));
  });
  $('#pending-grid').addEventListener('click', (event) => {
    const button = event.target.closest('[data-capture]');
    if (button) showPending(state.captures.get(button.dataset.capture));
  });
}

function setTab(tab) {
  state.tab = tab;
  document.querySelectorAll('[data-tab]').forEach((item) => {
    const active = item.dataset.tab === tab;
    item.classList.toggle('is-active', active);
    if (active) item.setAttribute('aria-current', 'page'); else item.removeAttribute('aria-current');
  });
  state.filters.status = 'all';
  updateView();
}

function updateProgress() {
  const { discovered, total, percent } = getProgress(places, displayedDiscoveries());
  $('#progress-discovered').textContent = discovered;
  $('#progress-percent').textContent = `${percent}%`;
  // Transform uses a fixed stylesheet rule plus a semantic progress element, so CSP needs no inline styles.
  const progress = Object.assign(document.createElement('progress'), { max: total, value: discovered }); progress.setAttribute('aria-hidden', 'true'); $('#progress-fill').replaceChildren(progress);
  $('.progress-track').setAttribute('aria-valuenow', discovered);
  $('#progress-message').textContent = discovered ? `${total - discovered} lugares por descubrir.` : 'Todo empieza con una mirada.';
  $('#memory-count').textContent = discovered;
  const sampleCount = [...displayedDiscoveries().values()].filter((visit) => visit.demo).length;
  $('#demo-label').textContent = sampleCount ? sampleCount + ' visitas de muestra' : 'Tu colección personal';
  $('#toggle-demo').innerHTML = sampleCount ? 'Ocultar ' + icon('close') : 'Ver muestra ' + icon('arrow');
  $('#toggle-demo').setAttribute('aria-label', sampleCount ? 'Ocultar visitas de muestra' : 'Mostrar visitas de muestra');
}

function updateView() {
  const memories = state.tab === 'memories';
  $('#page-title').innerHTML = memories ? 'Tus recuerdos.' : 'Tu colección.';
  $('#collection-title').textContent = memories ? 'Mis recuerdos' : 'La colección';
  $('.status-filters').hidden = memories;
  renderCollection();
}

function renderCollection() {
  const filters = { ...state.filters, ...(state.tab === 'memories' ? { status: 'discovered' } : {}) };
  const visible = filterPlaces(places, filters, displayedDiscoveries());
  $('#results-count').textContent = `${visible.length} de ${places.length} lugares`;
  document.querySelectorAll('[data-status]').forEach((button) => {
    const active = button.dataset.status === state.filters.status;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  $('#coin-grid').innerHTML = visible.map((place) => {
    const discovery = displayedDiscoveries().get(place.id);
    const unlocked = Boolean(discovery);
    const photo = photoUrl(discovery);
    return `<article class="coin-card ${unlocked ? 'is-discovered' : 'is-locked'} ${discovery?.demo ? 'is-demo' : ''} rarity-${escape(place.rarity)}"><div class="coin-topline"><span class="coin-number">Nº ${String(place.number).padStart(3, '0')}</span>${unlocked ? `<button class="small-icon-button" data-details="${escape(place.id)}" aria-label="Detalles de ${escape(place.name)}">${icon('info')}</button>` : icon('lock', 'card-lock')}</div><button class="coin-button ${unlocked ? 'is-unlocked' : ''} ${state.flipped.has(place.id) ? 'is-flipped' : ''}" data-coin="${escape(place.id)}" aria-label="${escape(place.name)}. ${unlocked ? (discovery?.demo ? 'Visita de muestra. Girar moneda para ver la fotografía' : 'Descubierto. Girar moneda para ver tu fotografía') : 'Por descubrir. Ver detalles'}" ${unlocked ? `aria-pressed="${state.flipped.has(place.id)}"` : ''}><span class="coin-body"><span class="coin-face coin-front"><span class="coin-engraving">${drawing(place)}</span><span class="coin-stars" aria-hidden="true">· &nbsp; M A L L O R C A &nbsp; ·</span>${unlocked ? `<span class="coin-check">${icon('check')}</span>` : ''}</span><span class="coin-face coin-back">${photo ? `<img src="${photo}" alt="${discovery?.demo ? 'Fotografía de muestra de' : 'Tu fotografía de'} ${escape(place.name)}" loading="lazy" />` : drawing(place)}</span></span></button><h3>${escape(place.name)}</h3><p class="coin-municipality">${escape(place.municipality)}${discovery?.demo ? ' <span class="sample-marker">· muestra</span>' : ''}</p><span class="coin-rarity"><i class="rarity-dot"></i>${escape(rarityLabel(place.rarity))}</span></article>`;
  }).join('');
  const empty = $('#empty-state');
  empty.hidden = visible.length > 0;
  if (!visible.length) {
    const filtered = Boolean(filters.query || filters.category || filters.municipality || filters.rarity);
    empty.innerHTML = `${icon(state.tab === 'memories' ? 'image' : 'search')}<h3>${state.tab === 'memories' && !filtered ? 'Aquí vivirán tus recuerdos.' : 'No hay lugares con estos filtros.'}</h3><p>${state.tab === 'memories' && !filtered ? 'Tus monedas descubiertas mostrarán la foto que tomaste. Las capturas sin identificar aparecen debajo.' : 'Prueba otro nombre o vuelve a ver la colección completa.'}</p>${filtered ? '<button class="secondary-button" id="reset-filters">Quitar filtros</button>' : ''}`;
    $('#reset-filters')?.addEventListener('click', resetFilters);
  }
  renderPending();
}

function resetFilters() {
  state.filters = { query: '', category: '', municipality: '', rarity: '', status: 'all' };
  for (const key of ['category', 'municipality', 'rarity']) $(`#${key}`).value = '';
  $('#search').value = '';
  renderCollection();
}

function renderPending() {
  const used = new Set([...state.discoveries.values()].map((discovery) => discovery.captureId));
  const pending = [...state.captures.values()].filter((capture) => !used.has(capture.id)).sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));
  $('#pending-section').hidden = state.tab !== 'memories' || !pending.length;
  $('#pending-count').textContent = pending.length;
  $('#pending-grid').innerHTML = state.tab === 'memories' ? pending.map((capture) => `<button class="pending-card" data-capture="${escape(capture.id)}"><img src="${state.photoUrls.get(capture.id)}" alt="Captura pendiente de identificar" loading="lazy"/><span>${date(capture.capturedAt)}</span><small>Pendiente de identificar ${icon('arrow')}</small></button>`).join('') : '';
}

async function refreshState() {
  const snapshot = await store.snapshot();
  state.discoveries = new Map(snapshot.discoveries.map((discovery) => [discovery.placeId, discovery]));
  state.captures = new Map(snapshot.captures.map((capture) => [capture.id, capture]));
  for (const [id, url] of state.photoUrls) if (!state.captures.has(id)) { URL.revokeObjectURL(url); state.photoUrls.delete(id); }
  for (const capture of snapshot.captures) if (!state.photoUrls.has(capture.id)) state.photoUrls.set(capture.id, URL.createObjectURL(capture.photo));
  updateProgress();
  renderCollection();
}

function toast(message) {
  clearTimeout(toastTimer);
  $('#toast').textContent = message;
  $('#toast').hidden = false;
  toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 5500);
}

function modal({ title, label, content, className = '', cleanup = () => {} }) {
  activeModal?.close();
  const previous = document.activeElement;
  const dialog = document.createElement('dialog');
  dialog.className = `modal ${className}`;
  dialog.setAttribute('aria-labelledby', 'modal-title');
  dialog.innerHTML = `<div class="modal-header"><div>${label ? `<p class="eyebrow">${escape(label)}</p>` : ''}<h2 id="modal-title">${title}</h2></div><button class="icon-button" data-close aria-label="Cerrar">${icon('close')}</button></div><div class="modal-content">${content}</div>`;
  const context = { dialog, close: () => dialog.close() };
  activeModal = context;
  dialog.addEventListener('close', () => {
    cleanup();
    dialog.remove();
    if (activeModal === context) activeModal = null;
    if (!activeModal) {
      document.body.classList.remove('modal-open');
      if (previous?.isConnected) previous.focus();
    }
  }, { once: true });
  $('[data-close]', dialog).addEventListener('click', context.close);
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) context.close();
  });
  document.body.append(dialog);
  document.body.classList.add('modal-open');
  dialog.showModal();
  return context;
}

function showPlace(place) {
  if (!place) return;
  const discovery = displayedDiscoveries().get(place.id);
  const context = modal({ title: escape(place.name), label: `Nº ${String(place.number).padStart(3, '0')} · ${place.municipality}`, className: 'place-modal', content: `
    <div class="place-illustration rarity-${escape(place.rarity)} ${discovery ? 'is-unlocked' : ''}">${drawing(place)}</div><div class="place-tags"><span>${escape(categoryLabel(place.category))}</span><span class="rarity-${escape(place.rarity)}"><i class="rarity-dot"></i>${escape(rarityLabel(place.rarity))}</span></div><p class="place-description">${escape(place.description)}</p>
    ${discovery ? `<div class="discovery-note">${icon('check')}<span>${discovery.demo ? 'Visita de muestra · no es una captura tuya' : 'Tu recuerdo del ' + date(discovery.capturedAt)}</span></div><button class="secondary-button full-width" id="view-photo">${icon('image')}${discovery?.demo ? 'Ver fotografía de muestra' : 'Ver mi fotografía'}</button>` : `<button class="primary-button full-width" id="place-camera">${icon('camera')}Fotografiar este lugar</button>`}
    <details class="place-details"><summary>Sobre este lugar ${icon('down')}</summary><dl><dt>Acceso y fotografía</dt><dd>${escape(place.accessNotes)}</dd><dt>Criterio de rareza</dt><dd>${escape(place.rarityReason)}${place.visitation ? ` <a href="${escape(place.visitation.sourceUrl)}" target="_blank" rel="noopener noreferrer">Fuente de visitas (${place.visitation.year}) ↗</a>` : ''}</dd><dt>Rasgos visuales de referencia</dt><dd>${(place.visualHints || []).map(escape).join(' · ')}</dd></dl><p class="small-note">Ilustración simbólica de la categoría. No es una reproducción exacta del lugar.</p><div class="source-links">${place.sourceIds.map((id) => sources[id]).filter(Boolean).map((source) => `<a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.title)} ↗</a>`).join('')}</div></details>` });
  $('#place-camera', context.dialog)?.addEventListener('click', () => { context.close(); showCamera(); });
  $('#view-photo', context.dialog)?.addEventListener('click', () => { context.close(); showPhoto(place, discovery); });
}

function showPhoto(place, discovery) {
  if (discovery.demo) {
    modal({ title: escape(place.name), label: 'VISITA DE MUESTRA', className: 'photo-modal', content: `<img class="original-photo" src="${discovery.photoUrl}" alt="Fotografía de muestra de ${escape(place.name)}"/><p>Esta fotografía ilustra una visita simulada. No se ha identificado con la cámara ni forma parte de tu copia personal.</p><p class="small-note"><a href="${discovery.sourceUrl}" target="_blank" rel="noopener noreferrer">${escape(discovery.credit)} · Wikimedia Commons</a> · <a href="${discovery.licenseUrl}" target="_blank" rel="noopener noreferrer">${discovery.license}</a>. Vista circular recortada por la interfaz.</p>` });
    return;
  }
  modal({ title: escape(place.name), label: date(discovery.capturedAt), className: 'photo-modal', content: `<img class="original-photo" src="${state.photoUrls.get(discovery.captureId)}" alt="Tu fotografía de ${escape(place.name)}"/><p class="small-note">Tu captura original, guardada únicamente en este dispositivo.</p>` });
}

function showRecognitionInfo() {
  if (recognizer.ready) {
    modal({ title: 'La imagen decide.', label: 'RECONOCIMIENTO VISUAL', content: `<div class="notice"><span class="status-dot"></span><strong>Referencias visuales activas</strong></div><p>El motor compara detalles de la fotografía con las referencias locales disponibles. Puede rechazar imágenes desconocidas, encuadres insuficientes o lugares ambiguos.</p><p>Una propuesta necesita tu confirmación antes de iluminar la moneda. No todos los lugares del catálogo tienen necesariamente cobertura visual.</p><div class="privacy-note">${icon('shield')}<p>El análisis ocurre en este dispositivo. No se utiliza GPS ni se envían imágenes a servicios externos.</p></div>` });
    return;
  }
  modal({ title: 'Una identificación con criterio.', label: 'RECONOCIMIENTO VISUAL', content: `<div class="notice"><span class="status-dot amber"></span><strong>En preparación</strong></div><p>La cámara y el guardado local ya funcionan. Todavía no hay un conjunto de fotografías de referencia validado para reconocer estos lugares con fiabilidad.</p><p>Por ahora, las fotos se guardan como <strong>capturas pendientes</strong>. No iluminan monedas ni aumentan tu progreso.</p><p>Cuando el reconocimiento esté validado, propondrá un lugar a partir de la imagen y te pedirá confirmación. Una coincidencia débil o ambigua se rechazará.</p><div class="privacy-note">${icon('shield')}<p>Las fotografías permanecen en tu navegador. No se utiliza GPS ni se envían imágenes a servicios externos.</p></div>` });
}

function showRarityInfo() {
  modal({ title: 'Menos visitado, más raro.', label: 'RAREZA · AFLUENCIA DOCUMENTADA', content: `<p>La rareza se calcula con cifras anuales publicadas por los gestores. No depende de la dificultad de acceso, la importancia histórica ni tus visitas.</p><div class="rarity-key">${rarities.map((rarity) => `<p class="rarity-${rarity.id}"><i class="rarity-dot"></i><strong>${escape(rarity.label)}</strong><span>${escape(rarity.description)}</span></p>`).join('')}</div><p class="small-note">Sin una cifra comparable no asignamos rareza. Las entradas a un recinto no miden a todas las personas que fotografían su exterior. Año y fuente están disponibles en cada ficha.</p>` });
}

function showAbout() {
  const context = modal({ title: 'Una isla que guardar.', label: 'MALLORCA UNLOCKED · MVP 0.1', content: `<p>Una colección de lugares reales de Mallorca. Fotografías un lugar, el reconocimiento propone una identificación y, al confirmarla, su moneda guarda tu recuerdo.</p><p>Esta primera edición reúne <strong>${places.length} lugares documentados</strong>. El catálogo crecerá hacia los 300–400 sin añadir lugares de relleno.</p><div class="about-steps"><span>${icon('camera')}Fotografiar</span>${icon('arrow')}<span>${icon('spark')}Descubrir</span>${icon('arrow')}<span>${icon('image')}Recordar</span></div><p>La rareza depende de visitas anuales documentadas: a menor afluencia, mayor rareza. Sin cifras comparables, el lugar queda sin clasificar.</p><p>Sin cuentas ni sincronización. Tu colección vive en este navegador: exporta una copia para conservarla o cambiar de dispositivo.</p><button class="secondary-button full-width" id="about-recognition">Estado del reconocimiento ${icon('arrow')}</button><a class="project-link" href="https://github.com/aesgalexis/MallorcaUnlocked" target="_blank" rel="noopener noreferrer">Código y documentación ↗</a>` });
  $('#about-recognition', context.dialog).addEventListener('click', () => { context.close(); showRecognitionInfo(); });
}

async function showSettings() {
  let incoming = null;
  const context = modal({ title: 'Tu colección, a salvo.', label: 'AJUSTES', content: `
    <div class="settings-summary">${icon('shield')}<div><strong>Solo en este navegador</strong><p>${state.discoveries.size} lugares descubiertos · ${state.captures.size} fotografías</p></div></div><p class="small-note">Las fotos no se sincronizan. Borrar los datos del navegador o usar navegación privada puede eliminar la colección. Conserva una copia fuera del navegador.</p>
    <div class="settings-actions"><button class="settings-action" id="export-backup" ${!state.storageReady ? 'disabled' : ''}>${icon('download')}<span><strong>Exportar colección</strong><small>Un archivo con tus fotografías y fechas</small></span>${icon('chevron')}</button><label class="settings-action import-action" for="import-backup">${icon('upload')}<span><strong>Importar una copia</strong><small>Añade recuerdos sin sustituir los actuales</small></span>${icon('chevron')}<input id="import-backup" class="file-input" type="file" accept="application/json,.json" ${!state.storageReady ? 'disabled' : ''} /></label></div>
    <div id="import-preview" class="import-preview" hidden></div><p id="backup-message" class="action-message" aria-live="polite"></p><div class="storage-status"><div><strong>Protección del almacenamiento</strong><p id="persistence-status">Consultando el navegador…</p></div><button class="secondary-button compact" id="persist-storage">Proteger</button></div><p class="small-note">Las visitas de muestra no se guardan ni se exportan. Importar restaura una copia personal; no verifica de nuevo sus fotografías. Límite por copia: 200 MB.</p>` });
  const message = $('#backup-message', context.dialog);
  $('#export-backup', context.dialog).addEventListener('click', async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    message.textContent = 'Preparando tu copia…';
    try {
      const blob = await createBackup(await store.snapshot());
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mallorca-unlocked-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      message.textContent = 'Copia preparada. Conserva el archivo descargado en un lugar seguro.';
    } catch (error) { message.textContent = storageError(error); }
    finally { button.disabled = false; }
  });
  $('#import-backup', context.dialog).addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const preview = $('#import-preview', context.dialog);
    preview.hidden = true;
    incoming = null;
    message.textContent = 'Comprobando la copia…';
    try {
      incoming = await parseBackup(file, places);
      // Decode every imported image before making the database transaction possible.
      for (const capture of incoming.captures) {
        let bitmap;
        try { bitmap = await createImageBitmap(capture.photo); }
        catch { throw new Error('La copia contiene una fotografía que no se puede abrir.'); }
        const valid = bitmap.width > 0 && bitmap.height > 0 && bitmap.width * bitmap.height <= 50000000;
        bitmap.close();
        if (!valid) throw new Error('La copia contiene una imagen con dimensiones no admitidas.');
      }
      preview.innerHTML = `<strong>${incoming.discoveries.length} recuerdos y ${incoming.captures.length} fotografías</strong><p>${incoming.skipped ? `${incoming.skipped} lugares no pertenecen a este catálogo y se omitirán. ` : ''}Los lugares ya descubiertos conservarán tu fotografía actual.</p><button class="primary-button full-width" id="confirm-import">Importar esta copia ${icon('arrow')}</button>`;
      preview.hidden = false;
      message.textContent = '';
      $('#confirm-import', context.dialog).addEventListener('click', async (click) => {
        const button = click.currentTarget;
        button.disabled = true;
        try {
          const result = await store.merge(incoming);
          await refreshState();
          context.close();
          toast(`Copia importada: ${result.discoveries} nuevos lugares y ${result.captures} fotografías.`);
        } catch (error) { message.textContent = storageError(error); button.disabled = false; }
      });
    } catch (error) { message.textContent = `No se ha importado ningún dato. ${storageError(error)}`; }
    finally { event.target.value = ''; }
  });
  const persistenceStatus = $('#persistence-status', context.dialog);
  const persistenceButton = $('#persist-storage', context.dialog);
  if (!navigator.storage?.persist) { persistenceStatus.textContent = 'Este navegador no permite solicitar almacenamiento persistente.'; persistenceButton.hidden = true; }
  else {
    try {
      const persisted = await navigator.storage.persisted();
      persistenceStatus.textContent = persisted ? 'Protección persistente concedida por el navegador.' : 'El navegador puede liberar estos datos si necesita espacio.';
      persistenceButton.disabled = persisted;
    } catch { persistenceStatus.textContent = 'No se ha podido consultar la protección.'; }
    persistenceButton.addEventListener('click', async () => {
      try {
        const persisted = await navigator.storage.persist();
        persistenceStatus.textContent = persisted ? 'Protección persistente concedida. Mantén tus copias de seguridad.' : 'El navegador no ha concedido la protección. Exporta una copia para conservar tus recuerdos.';
        persistenceButton.disabled = persisted;
      } catch { persistenceStatus.textContent = 'No se ha podido solicitar protección. Puedes exportar una copia.'; }
    });
  }
}

function showCamera() {
  let camera, capture, previewUrl, saved = false, busy = false;
  const abort = new AbortController();
  const context = modal({ title: 'Una nueva mirada.', label: 'FOTOGRAFIAR UN LUGAR', className: 'camera-modal', cleanup: () => { camera?.stop(); abort.abort(); if (previewUrl) URL.revokeObjectURL(previewUrl); }, content: `
    <div class="camera-stage"><video id="camera-video" autoplay playsinline muted aria-label="Vista previa de la cámara" hidden></video><img id="camera-preview" alt="La fotografía que acabas de tomar" hidden /><div class="camera-placeholder" id="camera-placeholder">${icon('camera')}<p>Encuadra el lugar.<br>Guarda el momento.</p></div><div class="viewfinder" id="viewfinder" aria-hidden="true" hidden><i></i><i></i><i></i><i></i></div><span class="camera-mode" id="camera-mode">SOLO FOTOGRAFÍAS NUEVAS</span></div>
    <p class="camera-explanation" id="camera-explanation">Necesitamos permiso para usar tu cámara. No pedimos micrófono ni ubicación. La fotografía se queda en tu dispositivo.</p><div class="notice camera-notice" id="camera-notice"><span class="status-dot amber"></span><p>El reconocimiento está en preparación. Puedes guardar tu foto pendiente; aún no desbloqueará una moneda.</p></div><p class="action-message" id="camera-message" aria-live="polite"></p><div class="camera-actions" id="camera-actions"><button class="primary-button full-width" id="start-camera">${icon('camera')}Permitir cámara</button></div>` });
  const video = $('#camera-video', context.dialog);
  camera = new Camera(video);
  const message = $('#camera-message', context.dialog);
  const actions = $('#camera-actions', context.dialog);
  if (recognizer.ready) $('.camera-notice p', context.dialog).textContent = 'La identificación se realiza en este dispositivo. Cualquier propuesta necesitará tu confirmación.';
  if (!state.storageReady) {
    message.textContent = 'No se puede acceder al almacenamiento local. La cámara estará disponible cuando el navegador permita guardar las capturas.';
    $('#start-camera', context.dialog).disabled = true;
  }

  async function startCamera() {
    if (busy) return;
    busy = true;
    message.textContent = 'Esperando el permiso de la cámara…';
    $('#start-camera', context.dialog)?.setAttribute('disabled', '');
    try {
      video.hidden = false;
      if (!await camera.start() || !context.dialog.open) return;
      $('#camera-placeholder', context.dialog).hidden = true;
      $('#viewfinder', context.dialog).hidden = false;
      $('#camera-preview', context.dialog).hidden = true;
      $('#camera-mode', context.dialog).textContent = 'CÁMARA EN DIRECTO';
      $('#camera-explanation', context.dialog).textContent = 'Incluye el lugar completo y evita personas en primer plano. La imagen se guardará sin recortar.';
      message.textContent = '';
      actions.innerHTML = `<button class="shutter" id="take-photo" aria-label="Tomar fotografía"><span></span></button>`;
      $('#take-photo', context.dialog).addEventListener('click', takePhoto);
    } catch (error) {
      video.hidden = true;
      message.textContent = cameraError(error);
      actions.innerHTML = `<button class="primary-button full-width" id="start-camera">${icon('refresh')}Volver a intentar</button>`;
      $('#start-camera', context.dialog).addEventListener('click', startCamera);
    } finally { busy = false; }
  }

  async function takePhoto() {
    if (busy) return;
    busy = true;
    $('#take-photo', context.dialog).disabled = true;
    try {
      capture = await camera.capture();
      camera.stop();
      if (!context.dialog.open) return;
      saved = false;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl = URL.createObjectURL(capture.photo);
      $('#camera-preview', context.dialog).src = previewUrl;
      $('#camera-preview', context.dialog).hidden = false;
      video.hidden = true;
      $('#viewfinder', context.dialog).hidden = true;
      $('#camera-mode', context.dialog).textContent = 'TU CAPTURA';
      $('#camera-explanation', context.dialog).textContent = recognizer.ready ? 'Esta foto todavía no está guardada. Conserva la captura para comprobar su identificación visual.' : 'Esta foto todavía no está guardada. Puedes repetirla o conservarla como captura pendiente.';
      actions.innerHTML = `<button class="secondary-button" id="retake">${icon('refresh')}Repetir</button><button class="primary-button" id="save-pending">${recognizer.ready ? 'Guardar e identificar' : 'Guardar captura'} ${icon('arrow')}</button>`;
      $('#retake', context.dialog).addEventListener('click', startCamera);
      $('#save-pending', context.dialog).addEventListener('click', saveAndAnalyze);
    } catch (error) { message.textContent = cameraError(error); $('#take-photo', context.dialog)?.removeAttribute('disabled'); }
    finally { busy = false; }
  }

  async function saveAndAnalyze() {
    if (busy) return;
    busy = true;
    actions.querySelectorAll('button').forEach((button) => { button.disabled = true; });
    message.textContent = 'Guardando en este dispositivo…';
    try {
      if (!saved) { await store.saveCapture(capture); saved = true; }
      await refreshState();
      if (!context.dialog.open) return;
      message.textContent = 'Comprobando la identificación visual…';
      const result = await recognizer.recognize(capture, { signal: abort.signal });
      if (!context.dialog.open) return;
      context.close();
      if (result.status === 'candidate') showCandidate(capture, result);
      else { toast('Captura guardada. La encontrarás en Mis recuerdos, pendiente de identificar.'); showPending(capture, result); }
    } catch (error) { if (error.name !== 'AbortError') message.textContent = storageError(error); }
    finally { busy = false; actions.querySelectorAll('button').forEach((button) => { button.disabled = false; }); }
  }

  $('#start-camera', context.dialog).addEventListener('click', startCamera);
  camera.onInterrupted = () => {
    if (!context.dialog.open) return;
    video.hidden = true;
    $('#viewfinder', context.dialog).hidden = true;
    $('#camera-placeholder', context.dialog).hidden = false;
    message.textContent = 'La cámara ha dejado de emitir imágenes. Puedes volver a abrirla.';
    actions.innerHTML = `<button class="primary-button full-width" id="start-camera">${icon('camera')}Volver a abrir la cámara</button>`;
    $('#start-camera', context.dialog).addEventListener('click', startCamera);
  };
  const onHidden = () => {
    if (!document.hidden || !camera.stream) return;
    camera.stop();
    video.hidden = true;
    $('#viewfinder', context.dialog).hidden = true;
    $('#camera-placeholder', context.dialog).hidden = false;
    message.textContent = 'La cámara se ha pausado al salir de la página.';
    actions.innerHTML = `<button class="primary-button full-width" id="start-camera">${icon('camera')}Volver a abrir la cámara</button>`;
    $('#start-camera', context.dialog).addEventListener('click', startCamera);
  };
  document.addEventListener('visibilitychange', onHidden);
  context.dialog.addEventListener('close', () => document.removeEventListener('visibilitychange', onHidden), { once: true });
}

function showPending(capture, result = null) {
  if (!capture) return;
  const abort = new AbortController();
  const context = modal({ title: 'Un recuerdo pendiente.', label: date(capture.capturedAt), className: 'photo-modal', cleanup: () => abort.abort(), content: `<img class="original-photo" src="${state.photoUrls.get(capture.id)}" alt="Tu captura pendiente de identificar"/><div class="notice"><span class="status-dot amber"></span><strong>Pendiente de identificar</strong></div><p id="pending-explanation">${escape(result?.reason || 'Esta fotografía está guardada. Todavía no hay una identificación visual confirmada y no cuenta como lugar descubierto.')}</p><button class="primary-button full-width" id="retry-recognition">${icon('refresh')}Comprobar identificación</button><p class="action-message" id="pending-message" aria-live="polite"></p><button class="danger-link" id="delete-capture">${icon('trash')}Eliminar esta captura</button>` });
  $('#retry-recognition', context.dialog).addEventListener('click', async (event) => {
    event.currentTarget.disabled = true;
    const message = $('#pending-message', context.dialog);
    message.textContent = 'Analizando la imagen…';
    try {
      const outcome = await recognizer.recognize(capture, { signal: abort.signal });
      if (!context.dialog.open) return;
      if (outcome.status === 'candidate') { context.close(); showCandidate(capture, outcome); }
      else message.textContent = outcome.reason;
    } catch (error) { if (error.name !== 'AbortError') message.textContent = error.message; }
    finally { $('#retry-recognition', context.dialog).disabled = false; }
  });
  $('#delete-capture', context.dialog).addEventListener('click', () => {
    const button = $('#delete-capture', context.dialog);
    button.outerHTML = `<div class="delete-confirmation"><p>Se eliminará de este navegador. Esta acción no se puede deshacer.</p><button class="secondary-button" id="cancel-delete">Conservar</button><button class="danger-button" id="confirm-delete">Eliminar captura</button></div>`;
    $('#cancel-delete', context.dialog).addEventListener('click', () => { context.close(); showPending(capture); });
    $('#confirm-delete', context.dialog).addEventListener('click', async (event) => {
      const button = event.currentTarget;
      button.disabled = true;
      try { await store.deletePendingCapture(capture.id); await refreshState(); context.close(); toast('Captura eliminada de este dispositivo.'); }
      catch (error) { $('#pending-message', context.dialog).textContent = storageError(error); button.disabled = false; }
    });
  });
}

function showCandidate(capture, result) {
  const place = places.find((item) => item.id === result.placeId);
  if (!place) return showPending(capture);
  const context = modal({ title: '¿Es este lugar?', label: 'PROPUESTA VISUAL · NECESITA TU CONFIRMACIÓN', content: `<img class="candidate-photo" src="${state.photoUrls.get(capture.id)}" alt="Tu fotografía pendiente de confirmar"/><h3 class="candidate-title">${escape(place.name)}</h3><p class="candidate-municipality">${escape(place.municipality)}</p><p>El motor ha encontrado coincidencias visuales suficientes. Confirma solo si la fotografía muestra este lugar.</p><div class="candidate-actions"><button class="secondary-button" id="reject-candidate">No es este lugar</button><button class="primary-button" id="confirm-candidate">Sí, es este lugar ${icon('check')}</button></div><p class="action-message" id="candidate-message" aria-live="polite"></p>` });
  $('#reject-candidate', context.dialog).addEventListener('click', () => { context.close(); showPending(capture, { reason: 'La propuesta se ha descartado. Tu fotografía sigue guardada sin desbloquear ningún lugar.' }); });
  $('#confirm-candidate', context.dialog).addEventListener('click', async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
      const added = await store.confirmDiscovery(capture.id, place.id, result);
      await refreshState();
      context.close();
      toast(added ? `${place.name}: un nuevo recuerdo en tu colección.` : 'Ya tenías este lugar. Conservamos tu fotografía original.');
      if (added) {
        resetFilters(); setTab('collection');
        const coin = $(`[data-coin="${place.id}"]`);
        coin?.closest('.coin-card').classList.add('just-unlocked');
        coin?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
      }
    } catch (error) { $('#candidate-message', context.dialog).textContent = storageError(error); button.disabled = false; }
  });
}

async function initialize() {
  shell();
  updateProgress(); renderCollection();
  try { await store.open(); state.storageReady = true; await refreshState(); }
  catch (error) { toast(storageError(error)); $('#open-camera').disabled = true; }
  const status = await recognizer.initialize();
  if (status.ready) {
    $('#recognition-info').innerHTML = `<span class="status-dot"></span>Reconocimiento visual activo`;
    $('#hero-recognition').innerHTML = `<span class="status-dot"></span>Reconocimiento visual en este dispositivo`;
  }
  // No service worker: local photos persist, but offline loading of the application isn't promised.
}

initialize().catch((error) => {
  console.error('No se ha podido iniciar Mallorca Unlocked:', error);
  $('#app').innerHTML = '<main class="fatal-error"><h1>No se ha podido abrir la colección.</h1><p>Recarga la página. Tus datos guardados no se han modificado.</p></main>';
});
