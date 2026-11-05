/**
 * Published, full-calendar-year admissions. Never substitute reviews, GPS,
 * access difficulty, municipal tourist totals or app discoveries for visits.
 * These figures count recorded visits to a venue, not passers-by outside it.
 * The initial comparable reference set is the calendar year 2024.
 */
export const visitationReferenceYear = 2024;

export const visitationEvidence = {
  'mallorca-0003': {
    annualVisitors: 254192,
    year: 2024,
    period: 'calendar-year',
    scope: 'admissions',
    sourceUrl: 'https://www.patrimonionacional.es/sites/default/files/documents/MEMORIA%202024%20v3%20editada%20para%20web.pdf#page=60',
    title: 'Patrimonio Nacional · Memoria de actividades 2024, Visita pública',
    locator: 'Página impresa 59 · Real Sitio de la Almudaina',
    checkedAt: '2026-11-05',
    note: 'Visitas registradas al recinto. No mide todas las personas que contemplan o fotografían la fachada desde el exterior.',
  },
  'mallorca-0082': {
    annualVisitors: 20906,
    year: 2024,
    period: 'calendar-year',
    scope: 'admissions',
    sourceUrl: 'https://museumaritim.conselldemallorca.es/documents/867102/1036672/Mem%C3%B2ria%2BActivitats%2B2025.pdf/2128c381-01c6-def0-7a76-304a375b3486',
    title: 'Museu Marítim de Mallorca · Memòria d’activitats 2025',
    locator: 'Sección Inversions · Museu de la Mar, Port de Sóller · Any 2024',
    checkedAt: '2026-11-05',
    note: 'Corresponde a la sede Museu de la Mar del Port de Sóller, no a Ses Voltes en Palma. Se toma el total explícito de 2024; no se extrapola la cifra parcial de 2025.',
  },
  'mallorca-0087': {
    annualVisitors: 84158,
    year: 2024,
    period: 'calendar-year',
    scope: 'admissions',
    sourceUrl: 'https://esbaluard.org/uploads/2026/02/EsBaluardMuseu_Memoria2024_WEB_low.pdf',
    title: 'Es Baluard Museu · Memòria 2024',
    locator: 'Apartado de afluencia anual · 84.158 visitants',
    checkedAt: '2026-11-05',
    note: 'Visitas anuales publicadas por el museo. La celebración del 20 aniversario forma parte de la programación de ese año.',
  },
  'mallorca-0091': {
    annualVisitors: 24842,
    year: 2024,
    period: 'calendar-year',
    scope: 'admissions',
    sourceUrl: 'https://web.parlamentib.es/repositori/PUBLICACIONS/11/bopibs/bopib-11-094.pdf',
    title: 'Parlament de les Illes Balears · BOPIB 94, 6 de junio de 2025',
    locator: 'Página impresa 9144 · respuesta a la pregunta RGE 7645/25',
    checkedAt: '2026-11-05',
    note: 'Total anual comunicado por el conseller de Turisme, Cultura i Esports en respuesta parlamentaria sobre el Museu de Mallorca.',
  },
  'mallorca-0092': {
    annualVisitors: 6561,
    year: 2024,
    period: 'calendar-year',
    scope: 'admissions',
    sourceUrl: 'https://www.conselldemallorca.es/es/noticia1/-/asset_publisher/0kVpLMnZrHVi/content/visites-palau/695139',
    title: 'Consell de Mallorca · 6.561 personas visitan el Palau del Consell en el 2024',
    locator: 'Comunicado del Departamento de Presidencia · 2 de enero de 2025',
    checkedAt: '2026-11-05',
    note: 'Visitas concertadas al interior: no cuenta a quienes pasan por la fachada. El modelo de acceso influye en la cifra y se hace explícito.',
  },
};
