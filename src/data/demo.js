// Presentation-only visits explicitly requested for this edition. Never persisted or exported.
export const demoVisits = Object.freeze([
  { placeId: 'mallorca-0001', demo: true, photoUrl: new URL('../../assets/demo/seu.jpg', import.meta.url).href, credit: 'Diotime', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Catedral_de_Palma.JPG', license: 'Dominio público', licenseUrl: 'https://commons.wikimedia.org/wiki/File:Catedral_de_Palma.JPG#Licensing' },
  { placeId: 'mallorca-0002', demo: true, photoUrl: new URL('../../assets/demo/bellver.jpg', import.meta.url).href, credit: 'Friedrich Haag', sourceUrl: 'https://commons.wikimedia.org/wiki/File:043_2015_06_02_Castell_de_Bellver.jpg', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/' },
  { placeId: 'mallorca-0003', demo: true, photoUrl: new URL('../../assets/demo/almudaina.jpg', import.meta.url).href, credit: 'Sexta', sourceUrl: 'https://commons.wikimedia.org/wiki/File:La_Almudaina_-_Palma_de_Mallorca.jpg', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/' },
]);

export function withDemoVisits(discoveries, enabled) {
  return enabled ? new Map([...demoVisits.map((visit) => [visit.placeId, visit]), ...discoveries]) : discoveries;
}
