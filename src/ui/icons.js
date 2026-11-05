const drawings = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  camera: '<path d="M4 6h4l1.5-2h5L16 6h4a2 2 0 0 1 2 2v11H2V8a2 2 0 0 1 2-2Z"/><circle cx="12" cy="12.5" r="4"/><path d="M18 9h.01"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.2"/><rect x="14" y="3" width="7" height="7" rx="1.2"/><rect x="3" y="14" width="7" height="7" rx="1.2"/><rect x="14" y="14" width="7" height="7" rx="1.2"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 16-6-6L4 21"/>',
  settings: '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  chevron: '<path d="m8 4 8 8-8 8"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
  upload: '<path d="M12 15V3m-5 5 5-5 5 5M4 17v4h16v-4"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  flip: '<path d="M4 9a8 8 0 0 1 14-3l2 3m0-5v5h-5M20 15a8 8 0 0 1-14 3l-2-3m0 5v-5h5"/>',
  shield: '<path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6l8-4Z"/><path d="m8 12 3 3 5-6"/>',
  trash: '<path d="M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7"/>',
  refresh: '<path d="M20 8a8 8 0 1 0 0 8m0-13v5h-5"/>',
  spark: '<path d="m12 2 2.7 7.3L22 12l-7.3 2.7L12 22l-2.7-7.3L2 12l7.3-2.7L12 2Z"/>',
};

const landmarks = {
  cathedral: '<path d="M11 51V23l5-8 5 8v28m22 0V23l5-8 5 8v28M21 51V29l11-12 11 12v22M9 51h46M14 31h4m-4 7h4m28-7h4m-4 7h4M28 51V40a4 4 0 0 1 8 0v11"/><circle cx="32" cy="30" r="4"/><path d="M16 15V9m32 6V9M29 13h6m-3-3v8"/>',
  castle: '<path d="M10 51V26h10v-7h6v7h12v-7h6v7h10v25H10ZM10 26V15h5v5h5V12h5v7m14 0v-7h5v8h5v-5h5v11M27 51V40a5 5 0 0 1 10 0v11M17 32v4m30-4v4M8 51h48"/>',
  church: '<path d="M13 51V25l8-8 8 8v26m0-20 11-8 11 8v20H11m6-20h8m-8 8h8M18 51v-8h6v8m11 0V40a5 5 0 0 1 10 0v11M21 8v10m-4-7h8"/><circle cx="40" cy="32" r="2"/>',
  palace: '<path d="M9 51h46M12 51V28h40v23M9 28l23-14 23 14M17 33v5m10-5v5m10-5v5m10-5v5M18 51v-7h6v7m16 0v-7h6v7M29 51V40h6v11M32 14V8l8 3-8 3"/>',
  tower: '<path d="M20 51h24l-3-31H23l-3 31ZM23 20l-3-5h7v5m4 0v-5h5v5m5 0 3-5h-8M17 51h30M29 51V40h6v11m-5-22v4m5-4v4"/>',
  lighthouse: '<path d="M22 49h20l-5-27H27l-5 27ZM23 22h18V12H23v10Zm-2-10 11-7 11 7M19 49h26M12 54c4-4 6 4 10 0s6 4 10 0 6 4 10 0 6 4 10 0M7 15h9m32 0h9M29 30h8m-9 8h10M32 12v10"/>',
  windmill: '<path d="M21 52h22l-5-26H26l-5 26ZM18 52h28M29 52V41h6v11M29 23 15 9l-5 5 17 12m8 0 14-12-5-5-15 15m2 5L17 43l-5-5 15-15m8 0 15 15-5 5-14-16"/><circle cx="31" cy="25" r="3"/>',
  mountain: '<path d="m6 50 18-28 11 17 8-12 15 23H6Zm12-18 6 4 5-6M24 22l5-9 16 24M38 33l5 4 4-4M9 54h46"/><circle cx="45" cy="14" r="5"/>',
  cave: '<path d="m6 49 5-23L26 12l16 3 10 13 6 21H6Zm13 0 5-17 9-8 9 8 5 17M27 15l1 9m11-7-2 6M16 25l7 3m25 0-5 5M10 53h44"/>',
  arch: '<path d="M10 51h44M13 51V19h38v32M9 19h46v-7H9v7Zm14 32V35a9 9 0 0 1 18 0v16M18 24h5m18 0h5M18 31h3m22 0h3M28 12V8h8v4"/>',
  sculpture: '<path d="M20 53h24v-6H20v6Zm5-6V35l-7-8 7-6m0 14 12-3 5-12-6-5-7 6-4 14m12-3 4 15m-12-27 3-5"/><circle cx="33" cy="10" r="5"/>',
  garden: '<path d="M9 52h46M17 52V33m0 10C4 40 7 27 17 33c6-12 17-5 9 4l-9 6ZM44 52V20m0 14c-15-2-14-18-2-13 1-15 17-12 13 0 10 5 2 16-11 13ZM27 52v-6h9v6m-7-10v-5h5v5"/>',
  bridge: '<path d="M7 32h50M9 32V22h46v10M7 22h50M12 32v19h7V39a5 5 0 0 1 10 0v12h6V39a5 5 0 0 1 10 0v12h7V32M5 55c5-5 8 5 13 0s8 5 13 0 8 5 13 0 8 5 15 0"/>',
  house: '<path d="M12 51V27l20-15 20 15v24H12ZM8 27l24-19 24 19M28 51V37h9v14M18 30h6v7h-6v-7Zm24 0h5v7h-5v-7ZM18 44h5m18 0h6M41 15V9h7v12M9 51h46"/>',
  sea: '<path d="M7 46c6-7 11 7 17 0s11 7 17 0 11 7 17 0M7 54c6-7 11 7 17 0s11 7 17 0 11 7 17 0M9 36l11-15 10 8 13-17 12 24H9ZM37 22l6 4 4-5"/><circle cx="18" cy="13" r="4"/>',
};

export function icon(name, className = '') {
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${drawings[name] || drawings.spark}</svg>`;
}

export function landmark(name, number = 0) {
  // Small decorative variations keep the family consistent without pretending to be exact elevations.
  return `<svg class="landmark" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${landmarks[name] || landmarks.house}<path class="landmark-ground" d="M${14 + (number % 4)} 57h${34 - (number % 4) * 2}"/></svg>`;
}

export const landmarkNames = Object.keys(landmarks);
