export const normalize = (value) => String(value).normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('es');

export function filterPlaces(places, filters, discoveries = new Map()) {
  const query = normalize(filters.query || '').trim();
  return places.filter((place) =>
    (!filters.category || place.category === filters.category) &&
    (!filters.municipality || place.municipality === filters.municipality) &&
    (!filters.rarity || place.rarity === filters.rarity) &&
    (filters.status !== 'discovered' || discoveries.has(place.id)) &&
    (filters.status !== 'locked' || !discoveries.has(place.id)) &&
    (!query || normalize(`${place.name} ${place.municipality}`).includes(query))
  );
}

export function getProgress(places, discoveries) {
  const discovered = places.reduce((count, place) => count + Number(discoveries.has(place.id)), 0);
  return { discovered, total: places.length, percent: places.length ? Math.round(discovered / places.length * 100) : 0 };
}
