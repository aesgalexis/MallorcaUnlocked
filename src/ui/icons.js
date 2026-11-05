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

// A shared fine-line treatment gives the illustrations the rhythm of an engraving.
// The small stone courses are subordinate to the silhouette at coin size.
const engraving = (paths) => `<g class="landmark-detail" stroke-width=".65" opacity=".48">${paths}</g>`;
const rose = (x, y, radius) => `<circle cx="${x}" cy="${y}" r="${radius}"/><circle cx="${x}" cy="${y}" r="${radius * 0.35}"/>${engraving(`<path d="M${x - radius} ${y}h${radius * 2}m-${radius} -${radius}v${radius * 2}m-${radius * 0.7} -${radius * 1.7} ${radius * 1.4} ${radius * 1.4}m-${radius * 1.4} 0 ${radius * 1.4} -${radius * 1.4}"/>`)}`;

const landmarks = {
  cathedral: '<path d="M10 51V29l5-9 5 9v22m24 0V29l5-9 5 9v22M20 51V25l12-13 12 13v26M7 51h50M27 51V40l5-5 5 5v11M15 20v-6m34 6v-6M32 12V6m-3 3h6"/>' + rose(32, 27, 4.5) + engraving('<path d="M13 32h4m-4 7h4m30-7h4m-4 7h4M23 32v15m18-15v15M11 46h8m26 0h8"/>'),
  castle: '<path d="M9 51V25h10v-7h6v7h14v-7h6v7h10v26H9Zm0-26V14h5v6h5V12h6v6m14 0v-6h6v8h5v-6h5v11M26 51V39a6 6 0 0 1 12 0v12M7 51h50M15 29v6m34-6v6"/>' + engraving('<path d="M10 42h15m14 0h15M10 47h15m14 0h15M19 42v5m26-5v5M27 29h10m-5-4v4M10 36h14m16 0h14"/>'),
  church: '<path d="M10 51V25l7-8 7 8v26m0-20 13-11 15 11v20H7M17 17V9m-3 4h6M14 51v-9a3 3 0 0 1 6 0v9m11 0V40a6 6 0 0 1 12 0v11"/>' + rose(37, 31, 3.2) + engraving('<path d="M13 28h8m-8 7h8M28 35v14m20-14v14M25 47h5m14 0h7M12 22h10M11 39h12"/>'),
  palace: '<path d="M9 51h46M12 51V27h40v24M9 27l23-13 23 13H9Zm8 0v-5m30 5v-5M28 51V39a4 4 0 0 1 8 0v12M18 33h5v7h-5zm23 0h5v7h-5zM32 14V7l7 3-7 3"/>' + engraving('<path d="M13 44h14m10 0h14M15 48h10m14 0h10M28 29h8M30 25h4M20 33v7m23-7v7M13 30h38"/>'),
  tower: '<path d="M19 51h26l-3-31H22l-3 31ZM22 20l-3-6h8v6m3 0v-6h5v6m7 0 3-6H35M16 51h32M28 51V40a4 4 0 0 1 8 0v11m-6-24v6h4v-6z"/>' + engraving('<path d="M22 36h20M21 44h6m10 0h6M23 25h5m8 0h5M25 36v5m14-5v5M24 47h3m10 0h5"/>'),
  lighthouse: '<path d="M22 48h20l-5-27H27l-5 27ZM24 21V12h16v9M21 12l11-7 11 7M20 21h24M20 48h24M29 48V39h6v9M31 25h2v5h-2zM7 16h10m30 0h10M8 52c7-4 10 4 17 0s10 4 17 0 10 4 15 0"/>' + engraving('<path d="M26 32h12M25 36h14M25 43h3m8 0h4M28 12v9m8-9v9M6 10l10 3m32 6 10 3M9 56h9m11 0h12m10 0h5"/>'),
  windmill: '<path d="M21 52h22l-5-24H26l-5 24ZM18 52h28M28 52V41a4 4 0 0 1 8 0v11M29 25 12 10l-5 6 19 13m9 0 18-13-5-6-19 15m0 6L14 48l-6-5 19-17m8 0 18 17-5 5-17-18"/><circle cx="31" cy="28" r="3"/>' + engraving('<path d="m11 14 17 14m7 0 16-14M12 43l16-15m7 1 15 15M25 36h13M23 46h4m10 0h4M21 12l-5 5m7-2-5 5m26-8 5 5m-8-2 5 5M14 36l5 5m-2-8 5 5m20-1 5-5m-8 2 5-5"/>'),
  mountain: '<path d="M5 51 21 29l10 13 11-23 17 32M17 35l4 3 4-3m12-6 5 4 5-3M20 30l7-16 10 16M7 51h50"/><circle cx="48" cy="13" r="4"/>' + engraving('<path d="m8 48 13-13m6-16-3 11m20 7-7 12m7-5 5-8M11 55h12m5 0h19M9 24h7m-4-3v6"/>'),
  cave: '<path d="m6 51 5-25L25 13l17 3 10 12 6 23H6Zm12 0 6-18 10-8 9 10 5 16M25 15l3 10m10-8-2 7M15 27l7 5m26-4-5 7M25 51l4-9 3 9m4 0 4-13 3 13"/>' + engraving('<path d="m10 42 6-9m-3 15 5-10m32 2 3 8M31 28l-1 8m8-7 1 9M15 22l5 2m24-3 3 3M22 55h20"/>'),
  arch: '<path d="M9 51h46M13 51V18h38v33M10 18v-6h44v6H10Zm13 33V36a9 9 0 0 1 18 0v15M16 24h6m20 0h6M28 12V8h8v4"/>' + engraving('<path d="M14 31h8m20 0h8M14 38h7m22 0h7M14 45h7m22 0h7M18 18v6m28-6v6M14 24v7m36-7v7M27 34l3 2m4-1 3-2M16 12v6m32-6v6"/>'),
  sculpture: '<path d="M18 53h28v-6H18v6Zm7-6V34l-7-8 7-6m0 14 12-3 5-12-6-5-7 6-4 14m12-3 4 16m-12-27 3-5"/><circle cx="33" cy="9" r="4.5"/>' + engraving('<path d="M21 47v6m22-6v6M24 39l8-5m-5-12 4 4m5-8 3 2M27 43h9M22 56h20"/>'),
  garden: '<path d="M7 52h50M15 52V32m0 10C3 40 5 27 15 32c4-12 16-7 12 2-1 5-7 7-12 8Zm33 10V21m0 13c-13 0-16-14-4-15 1-13 14-12 13-1 8 5 2 15-9 16ZM25 52v-7h14v7M24 45h16M30 45v-8h4v8"/>' + engraving('<path d="M10 36l5 6 6-5M48 22v12m-5-8 5 5 5-8M28 37h8M32 31v6m-5-3h10M10 55h12m21 0h10"/>'),
  bridge: '<path d="M6 28h52M8 28V20h48v8M6 20h52M10 28v23h7V39a6 6 0 0 1 12 0v12h6V39a6 6 0 0 1 12 0v12h7V28M6 54c6-4 9 4 15 0s9 4 15 0 9 4 15 0 6 1 8 0"/>' + engraving('<path d="M11 32h8m7 0h12m7 0h8M11 38h5m32 0h5M10 45h6m14-9h4m14 9h6M14 20v8m9-8v8m18-8v8m9-8v8"/>'),
  house: '<path d="M11 51V27l21-15 21 15v24H11ZM7 27l25-19 25 19M27 51V38a5 5 0 0 1 10 0v13M17 30h6v8h-6zm24 0h6v8h-6zM42 16V9h7v12M8 51h48"/>' + engraving('<path d="M19 30v8m24-8v8M14 44h10m16 0h10M14 47h10m16 0h10M23 22h18M29 18h6M17 54h30"/>'),
  sea: '<path d="M6 48c6-5 10 5 16 0s10 5 16 0 10 5 16 0M8 54c6-5 10 5 16 0s10 5 16 0 10 5 16 0M6 41l10-19 10 7 13-18 19 30M35 17l4 5 5-3"/><circle cx="16" cy="12" r="4"/>' + engraving('<path d="m10 36 7-10m7 7-5 7m20-15-8 14m13-9-3 9M7 44h13m14 0h17M49 15h7m-4-3v6"/>'),

  // Illustrated editions: the catalogue's most distinctive silhouettes.
  seu: '<path d="M9 51V27l4-6 4 6v24m30 0V27l4-6 4 6v24M17 51V23l15-12 15 12v28M8 51h48M25 51V40l7-6 7 6v11M21 49V32m22 17V32M13 21V16m38 5V16M32 11V6m-3 3h6"/>' + rose(32, 24, 5.5) + engraving('<path d="M17 23h30M12 30h3m-3 6h3m-3 7h3m34-13h3m-3 6h3m-3 7h3M27 42h10m-5-7v16M20 29l2-3 2 3m16 0 2-3 2 3M8 54h15m18 0h15M18 46h5m18 0h5"/>'),
  bellver: '<path d="M9 51V32c0-6 35-6 35 0v19M9 32c0 6 35 6 35 0M9 43c0 6 35 6 35 0M44 51h12V17H44v34ZM43 17V11h4v4h4v-4h5v6M11 29v-6h4v4h5v-4h5v4h5v-4h5v4h5v-4h4v7M44 26l-6 4M22 51V42a4 4 0 0 1 8 0v9M6 51h53"/>' + engraving('<path d="M13 35v6m6-5v7m17-8v7m-5-5v6m16-22h6m-6 8h6m-6 8h6M17 47v5m20-5v5M12 55h40"/>'),
  almudaina: '<path d="M8 51h49M11 51V27h10v-7h15v7h8V16h10v35M44 16V9h4v4h3V9h4v7M10 27V19h4v4h4v-4h4v8M25 20V13h3v4h4v-4h4v7M29 51V40a4 4 0 0 1 8 0v11M49 9V4l7 2-7 3"/>' + engraving('<path d="M13 32h6m-6 7h6m5-13h17M25 31h4v5h-4zm10 0h4v5h-4zM47 22h4v6h-4zm0 12h4v6h-4zM11 46h16m12 0h15M25 46v5m17-5v5M14 54h36"/>'),
  llotja: '<path d="M9 51V23l4-4 4 4v28m30 0V23l4-4 4 4v28M17 51V21h30v30M8 51h48M13 19V12m38 7V12M17 21v-5h4v5h4v-5h4v5h6v-5h4v5h4v-5h4v5M24 51V38l8-7 8 7v13M20 26h5v6h-5zm19 0h5v6h-5z"/>' + engraving('<path d="M25 39h14M28 37v14m8-14v14M11 28h4m34 0h4M11 35h4m34 0h4M18 44h5m18 0h5M19 47h4m18 0h5M12 54h40"/>'),
  banys: '<path d="M10 51h44M14 51V31a18 18 0 0 1 36 0v20M12 31h40M20 51V33m24 18V33M27 51V34m10 17V34M18 32a7 7 0 0 1 12 0m4 0a7 7 0 0 1 12 0M20 14h24M29 14v-4h6v4"/>' + engraving('<path d="M16 25h32M19 20h26M21 35h5m12 0h5M18 47h4m20 0h4M25 47h4m6 0h4M29 18h6M31 23h2M13 54h38M14 39h5m26 0h5"/>'),
  francesc: '<path d="M13 51V27h31v24M10 27h37M13 27c11-1 3-9 15-10 10 1 6 9 16 10M25 17v-6h6v6M44 51V17h9v34M43 17l5-8 6 8M20 51V40c0-8 17-8 17 0v11M24 51V40a4 4 0 0 1 8 0v11M9 51h47"/>' + rose(28.5, 29, 3) + engraving('<path d="M16 33h5m15 0h5M18 37v12m22-12v12M46 23h5m-5 7h5m-4 4v7M16 47h4m17 0h6M23 54h20"/>'),
  eulalia: '<path d="M10 51V24l6-8 6 8v27m0-24 14-12 16 12v24H7M16 16V9m-3 4h6M13 27h6v9h-6zM31 51V39l6-5 6 5v12M25 27h25M26 31v20m22-20v20"/>' + rose(37, 27, 3.5) + engraving('<path d="M11 22h10m-10 17h10M15 43v8m17-11h10m-5-5v16M28 46h2m14 0h2M26 22l10-8 11 8M10 54h44"/>'),
  cort: '<path d="M10 51V20h44v31M7 20l4-6h42l4 6H7ZM8 51h48M27 51V40a5 5 0 0 1 10 0v11M15 26h7v8h-7zm27 0h7v8h-7zM27 24h10v10H27Zm-1 13h12M13 38h11m16 0h11M14 45h8m20 0h8"/><circle cx="32" cy="28" r="2.5"/>' + engraving('<path d="M11 17h42M16 26v8m4-8v8m24-8v8m3-8v8M30 28h2v-2M13 48h11m16 0h11M15 51v-3m34 3v-3M13 22h38M18 54h28"/>'),
  granhotel: '<path d="M12 51V23h40v28M9 23l5-7h13l5-6 5 6h13l5 7H9ZM9 51h46M27 51V40a5 5 0 0 1 10 0v11M17 27h7v9h-7zm23 0h7v9h-7zM27 23h10v10H27ZM15 39h11m12 0h11M16 41h7v7h-7zm25 0h7v7h-7z"/>' + engraving('<path d="M15 20h11m12 0h11M29 16h6M18 27v9m4-9v9m20-9v9m4-9v9M30 23v10m4-10v10M14 36h11m14 0h11M27 36h10M18 12c2-3 5-3 7 0m14 0c2-3 5-3 7 0M17 54h30"/>'),
  fortezarey: '<path d="M14 51V17h36v34M11 51h42M12 17c6 0 4-7 10-7s5 7 10 2c5 5 4-2 10-2s4 7 10 7M20 51V41a5 5 0 0 1 10 0v11m7-1V41a5 5 0 0 1 10 0v11M19 21h9v10h-9zm17 0h9v10h-9zM17 31c4 4 9 4 13 0m4 0c4 4 9 4 13 0"/>' + engraving('<path d="M22 21v10m3-10v10m14-10v10m3-10v10M15 36h34M16 24h2m11 0h6m11 0h3M15 45h4m12 0h5M21 14l2 2 2-2m14 0 2 2 2-2M18 54h28"/>'),
  jonquet: '<path d="M5 51h54M9 51l2-15h10l2 15m5 0 2-24h12l3 24m3 0 1-16h8l2 16M12 35 5 28m12 8 7-8m-7 8 7 7m-12-7-7 7M32 26 21 15m16 11 11-11M32 31 21 42m16-11 11 11M51 34l-6-6m10 6 6-6M51 38l-6 6m10-6 6 6M33 51V40h5v11"/><circle cx="14.5" cy="36" r="2"/><circle cx="34.5" cy="28.5" r="3"/><circle cx="53" cy="36" r="2"/>' + engraving('<path d="M11 44h9m11-7h8m-8-3h8m11 10h6M7 55h14m5 0h17m5 0h11M24 17l21 23m-21 0 21-23"/>'),
  jaumei: '<path d="M18 52h29v-6H18v6Zm5-6v-6h19v6M20 33l3-8 9 1 7-3 6 5 5 1-1 6-6-1-4 5-10-1-6-5-3 8m8-3-1 5m12-4 2 4M20 32l-5-6M31 26l-1-9 5-5 5 6-5 4v5M40 18l7-5M35 12V6"/><circle cx="35" cy="9" r="3"/>' + engraving('<path d="m24 28 3 4 10 1m8-5-1 4M22 49h21M25 43h15M29 16l-5 5m-6 33h31"/>'),
  sollerchurch: '<path d="M10 51V30h36v21M7 30c10-2 7-11 14-12l7-4 7 4c7 1 4 10 14 12M21 18v-5m14 5v-5M46 51V20h7v31M45 20l5-11 5 11M50 9V5M20 51V41l8-6 8 6v10M8 51h48"/>' + rose(28, 27, 4.5) + engraving('<path d="M13 34h30M15 38v11m26-11v11M23 42h10m-5-6v15M48 25h3m-3 7h3m-3 7h3M11 47h7m20 0h7M14 54h38"/>'),
  sollerbank: '<path d="M11 51V22h42v29M8 51h48M9 22c6-1 6-6 12-6h22c6 0 5 5 12 6M14 25h13v14H14zm23 0h13v14H37ZM12 39l8 4 9-4m6 0 9 4 8-4M27 51V39a5 5 0 0 1 10 0v12M17 51v-6m30 6v-6"/>' + engraving('<path d="M18 25v14m5-14v14m18-14v14m5-14v14M14 31h13m10 0h13M29 45l3-4 3 4m-6 3 3-4 3 4M16 18h33M14 47h9m18 0h9M18 54h29"/>'),
  prunera: '<path d="M13 51V20h38v31M10 20c8 0 6-8 12-8 5 0 5 6 10 2 5 4 5-2 10-2 6 0 4 8 12 8M10 51h44M19 26h8v10h-8zm18 0h8v10h-8zM19 36c2 5 6 5 10 1m6 0c4 4 8 4 12-1M21 51V45a4 4 0 0 1 8 0v6m7 0V45a4 4 0 0 1 8 0v6"/>' + engraving('<path d="M22 26v10m3-10v10m15-10v10m3-10v10M16 23c0-3 4-3 4 0m24 0c0-3 4-3 4 0M15 40h34M26 17h12M15 47h5m10 0h5m10 0h5M18 54h29"/>'),
  cartoixa: '<path d="M10 51V31h29v20M7 31l17-11 18 11M37 51V21h13v30M35 21h17l-4-6h-9l-4 6ZM40 15V9h7v6m-8-6 4-5 5 5M18 51V40a6 6 0 0 1 12 0v11M8 51h47"/><circle cx="43.5" cy="28" r="3"/>' + engraving('<path d="M11 34h26M14 39v10m20-10v10M41 36h5v7h-5zM38 46h11M43 25v3h2M17 26h14M43 9v6M15 54h34"/>'),
  graves: '<path d="M16 51V30l16-12 20 12v21M13 30l19-16 22 16M26 51V39h8v12M39 34h7v8h-7zM20 32h5v6h-5zM10 51V36m0 7C0 42 2 31 10 35c3-9 13-4 9 2-1 5-5 6-9 6ZM6 51h51"/>' + engraving('<path d="M16 47h9m10 0h16M18 44h6M41 34v8m3-8v8M23 25h18M7 38l3 5 5-5M19 54h27M47 51v-5m4 5v-4"/>'),
  raixa: '<path d="M10 51h44M24 51V39h16v12M22 39h20M25 35h14M27 31h10M18 31V19h29v12M15 19l17-9 18 9H15ZM22 24h5v7h-5zm16 0h5v7h-5zM28 51V39m8 12V39M12 51V29m0 10c-7-1-8-9-2-10-1-8 8-9 8-2 5 2 1 12-6 12ZM51 51V31m0 10c-7-1-8-9-2-10-1-8 7-9 8-2 5 2 1 12-6 12Z"/>' + engraving('<path d="M24 43h16m-16 4h16M29 27h7M31 18v-5M21 22h24M9 54h46M9 35l3 4 3-5m33 3 3 4 3-5"/>'),
  alfabia: '<path d="M8 51h48M13 51V27h38v24M10 27h44M17 27V18h6v9m18 0v-9h6v9M15 18h10m14 0h10M20 18c2-8 9-7 12-4 4-5 11-3 12 4M22 51v-6h20v6M20 45h24M29 45v-9h6v9M26 36h12"/>' + engraving('<path d="M18 30v11m7-11v9m14-9v9m8-9v11M14 32h36M32 27v9m-5-5 5 3 5-3M16 15l4 3 3-4m19 0 3 4 3-3M12 54h40"/>'),
  lluc: '<path d="M6 51h52M9 51V32h12v-9l11-9 11 9v9h12v19M18 32h28M22 51V37a10 10 0 0 1 20 0v14M28 51V39a4 4 0 0 1 8 0v12M32 14V8m-3 3h6M11 51v-9a3 3 0 0 1 6 0v9m30 0v-9a3 3 0 0 1 6 0v9"/>' + rose(32, 25, 3) + engraving('<path d="M9 35h12m22 0h12M22 45h5m10 0h5M11 39h6m30 0h6M24 33h16M15 54h34"/>'),
  calvari: '<path d="M14 52h36M18 48h28M21 44h22M24 40h16M26 36h12M27 32h10M25 32V21l7-7 7 7v11M23 21h18M30 32v-7h4v7M32 14V8m-3 3h6M9 52V20m0 24c-5-9-5-19 0-26 5 7 5 17 0 26ZM55 52V20m0 24c-5-9-5-19 0-26 5 7 5 17 0 26Z"/>' + engraving('<path d="m26 33-11 19m23-19 11 19M10 40l4 3m40-3-4 3M20 54h24M28 19h8"/>'),
  pontroma: '<path d="M7 39c9-4 18-8 27-8 7 0 14 2 23 6M8 34c10-5 19-9 28-8 7 0 13 2 20 5M8 34v15h9v-4a8 8 0 0 1 16 0v4h7v-6a6 6 0 0 1 12 0v6h5V37M33 34l3-3 3 3v4h-6v-4ZM6 53c6-4 9 4 15 0s9 4 15 0 9 4 15 0 6 1 8 0"/>' + engraving('<path d="M11 37v7m8-11 1 5m9-9 1 5m11-5v6m8-3-1 5M12 48h4m18-3h5m14 1h4M6 57h10m9 0h13m10 0h10"/>'),
  pontas: '<path d="M8 48c4-4 8 4 12 0s8 4 12 0 8 4 12 0 8 4 12 0M7 54c5-4 8 4 13 0s8 4 13 0 8 4 13 0 8 4 13 0M12 46l4-20 10-13 12-2 11 10 6 25M22 46l3-13 6-9 6 1 5 8 3 13"/>' + engraving('<path d="m19 28 6-10m-8 20 3-7m24-11 3 9m-7-14 3 5M28 18l6-3m-4 14 4-3m12 13 3 5M12 51h7m13 0h8m9 0h7"/>'),
  talaiot: '<path d="M7 51V30l11-6h28l11 6v21H7ZM7 30h50M20 51V39l5-5h14l5 5v12M25 51V39h14v12M9 25l11-6h25l10 6M12 19l12-6h17l11 6"/>' + engraving('<path d="M8 37h12m24 0h12M8 44h12m24 0h12M14 30v7m35-7v7M11 37v7m42-7v7M17 44v7m30-7v7M18 25v5m13-5v5m14-5v5M24 19v6m15-6v6M13 54h38"/>'),
  pollentia: '<path d="M7 51h50M12 51V25h8v26m-10-26v-5h12v5H10Zm20 26V31h8v20m-10-20v-5h12v5H28Zm18 20V18h8v33M44 18v-5h12v5H44ZM22 51v-6h6m12 6v-9h4M9 13l15-6 15 6"/>' + engraving('<path d="M14 28v19m4-19v19m14-13v13m4-13v13m12-26v26m4-26v26M10 47h12m6 0h12m4 0h12M15 54h35M10 16h26M8 38h3m10 0h7m11-4h6"/>'),
};

export function icon(name, className = '') {
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${drawings[name] || drawings.spark}</svg>`;
}

export function landmark(name, number = 0) {
  // `number` stays in the public API for compatibility; a place's drawing is stable.
  return `<svg class="landmark" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><g class="landmark-structure">${landmarks[name] || landmarks.house}</g></svg>`;
}

export const landmarkNames = Object.freeze(Object.keys(landmarks));
