# Catálogo inicial de Mallorca

Edición de 50 lugares; consulta documental realizada el **5 de noviembre de 2026**. El objetivo de 300–400 queda pendiente de ampliación documentada. Los 50 registros son lugares reales, sin casillas de relleno, referencias fotográficas simuladas ni identificaciones entrenadas.

## Qué contiene cada ficha

El archivo `src/data/catalog.js` exporta categorías, rarezas, fuentes y lugares. Cada lugar tiene un ID estable (`mallorca-0001` a `mallorca-0050`), número, nombre, municipio, categoría, rareza editorial, icono, descripción breve, notas de acceso, razón de rareza, indicios visuales y las claves de sus fuentes. Los números son permanentes: una ampliación añade números, nunca reasigna los existentes.

`sourceIds` enlaza cada ficha con fuentes primarias: oficinas municipales de turismo, ayuntamientos, el Consell de Mallorca, el portal turístico oficial de las Illes Balears o el propio gestor del lugar. `sources` conserva el título, la URL exacta y `checkedAt`. Las descripciones están redactadas para este proyecto; no se reproducen textos ni fotografías de terceros.

Se han contrastado nombres, municipios y rasgos generales mediante navegación web. La comprobación documental no equivale a visita de campo ni garantiza que una página institucional esté actualizada. No se incorporan tarifas ni horarios que puedan caducar. Las notas de acceso separan el exterior observable de los interiores sujetos a entrada, permiso u horario.

## Rareza: criterio editorial reproducible

La rareza describe el esfuerzo o la condición de acceso al **elemento que se pretende fotografiar**. No representa importancia histórica, popularidad ni afluencia: no se dispone de una serie comparable de visitantes.

| Rareza | Regla usada | Ejemplos |
| --- | --- | --- |
| Común | Fachada, escultura o conjunto observable desde el entorno urbano | La Seu, Banc de Sóller, Molí des Fraret |
| Poco común | Desplazamiento específico fuera del centro o aproximación a pie con desnivel | Bellver, Lluc, El Calvari |
| Rara | Recinto regulado para observar el elemento, o ascenso de montaña a pie | Banys Àrabs, Ses Païsses, Castell d’Alaró |
| Épica | Reservada para incorporaciones con acceso extraordinariamente condicionado, sustentado por su fuente | Sin asignaciones en esta edición |

La ficha contiene el motivo individual para que pueda revisarse. Una fachada urbana sigue siendo común aunque el interior sea de pago. Una cueva cuenta como rara porque su elemento identificable está dentro del recinto. La Casa de Robert Graves se considera rara porque la casa y su jardín forman un recinto de visita: no se presupone una vista pública desde el exterior. Estos criterios son una propuesta de producto, no una clasificación oficial ni una evaluación de accesibilidad universal.

## Precisión y límites

- Se representan **20 municipios** y nueve categorías. No se pretende una cobertura estadística equilibrada: Palma y los monumentos arquitectónicos tienen mayor representación en este primer lote.
- El Torrent de Pareis corresponde a su **desembocadura en Sa Calobra**. La ficha no invita a descender el barranco.
- El nombre tradicional **Pont Romà** no demuestra un origen romano: la fuente municipal señala que su datación es incierta, y la descripción lo mantiene explícito.
- Las murallas de Alcúdia constituyen una sola ficha; no se han duplicado sus puertas para aumentar el número de monedas.
- La Seu y otras iglesias se plantean por sus exteriores. Los interiores, jardines cerrados, yacimientos y cuevas dependen de las condiciones del gestor. La app no concede acceso ni permiso de fotografía.
- En las Coves del Drach se permiten fotografías personales sin flash durante el recorrido, **excepto durante el concierto**. En las Coves dels Hams el gestor publica fotografías permitidas sin flash, trípode ni palos selfie. Deben atenderse las indicaciones locales que estén vigentes al visitar.
- Es Pontàs se contempla desde tierra. No se propone llegar al islote ni escalarlo.
- Algunos conjuntos y fachadas son visualmente parecidos. Los `visualHints` son notas de curación, **no descriptores de imagen, pruebas de precisión ni un modelo**.
- Todas las fichas tienen `recognition.status: 'untrained'` y `referenceImages: []`. No se han descargado imágenes institucionales para entrenamiento: que una fotografía esté en una web pública no otorga una licencia de reutilización.

## Índice de evidencia

Las referencias completas y la asociación de cada lugar también están disponibles en el módulo de datos para mostrarlas desde la propia aplicación.

| Registros | Evidencia primaria |
| --- | --- |
| 1 | [Catedral de Mallorca · Illes Balears Travel](https://www.illesbalears.travel/es/mallorca/catedral-la-seu-catedral-de-mallorca) |
| 2 | [Bellver · Guía familiar de Visit Palma](https://visitpalma.com/wp-content/uploads/2025/06/guiaturfamcastellano.pdf) |
| 3 | [Almudaina · Illes Balears Travel](https://www.illesbalears.travel/es/mallorca/edificio-singular-palau-reial-de-lalmudaina) |
| 4 | [Llotja · Illes Balears Travel](https://www.illesbalears.travel/es/mallorca/edificio-singular-la-llotja) |
| 5 | [Banys Àrabs · Illes Balears Travel](https://www.illesbalears.travel/es/mallorca/edificio-singular-banys-arabs) |
| 6 | [Sant Francesc · Illes Balears Travel](https://www.illesbalears.travel/es/mallorca/iglesia-basilica-sant-francesc) |
| 7 | [Santa Eulàlia · Visit Palma](https://visitpalma.com/es/dir/parroquia-de-santa-eulalia/) |
| 8 | [Ajuntament de Palma · Visit Palma](https://visitpalma.com/es/dir/ayuntamiento-de-palma/) |
| 9 | [Modernismo · Visit Palma](https://visitpalma.com/es/dir/modernismo/) |
| 10 | [Can Forteza Rey · Visit Palma](https://visitpalma.com/es/dir/can-forteza-rey/) |
| 11 | [Palma monumental · Illes Balears Travel](https://www.illesbalears.travel/es/mallorca/ruta-de-palma-monumental) |
| 12–13 | [Jonquet y Jaume I · Guía de Palma](https://visitpalma.com/wp-content/uploads/2025/06/guia-de-palma-esp.pdf) |
| 14–16 | [Lugares de interés · Ajuntament de Sóller](https://ajsoller.net/ca/anar), [Can Prunera · gestor](https://canprunera.com/casa-modernista/) |
| 17 | [Cartoixa · Illes Balears Travel](https://www.illesbalears.travel/index.php/ca/mallorca/conjunt-monumental-reial-cartoixa-de-valldemossa) |
| 18–19 | [Patrimonio · Visit Valldemossa](https://www.visitvalldemossa.es/municipi-valldemossa/) |
| 20 | [Fundació La Casa de Robert Graves](https://www.lacasaderobertgraves.org/) |
| 21 | [Deià · Fundació Mallorca Turisme](https://fundaciomallorcaturisme.net/destinos/serra-de-tramuntana/deia/), [iglesia y cementerio · Illes Balears Travel](https://www.illesbalears.travel/es/mallorca/cementerio-deia) |
| 22 | [Raixa · Illes Balears Travel](https://www.illesbalears.travel/es/mallorca/jardin-raixa) |
| 23 | [Alfàbia · Visit Bunyola](https://www.visitbunyola.com/es/el-pueblo/) |
| 24 | [Lluc · Illes Balears Travel](https://www.illesbalears.travel/es/mallorca/santuario-lluc) |
| 25 | [Torrent de Pareis · Illes Balears Travel](https://www.illesbalears.travel/es/mallorca/monumento-natural-torrent-de-pareis) |
| 26 | [Castell d’Alaró · Consorci Serra de Tramuntana](https://serradetramuntana.net/es/-/alaro-el-castillo-de-alaro) |
| 27 | [Santueri · Ajuntament de Felanitx](https://felanitx.org/en/node/14143) |
| 28 | [Sant Salvador de Felanitx · Illes Balears Travel](https://illesbalears.travel/es/mallorca/santuario-mare-de-deu-de-sant-salvador) |
| 29 | [Castell · Ajuntament de Capdepera](https://ajcapdepera.net/es/archivo-municipal/patronato-del-castillo) |
| 30 | [Far · Ajuntament de Capdepera](https://ajcapdepera.net/es/noticias/dia-mundial-de-los-faros) |
| 31 | [Sant Salvador · Ajuntament d’Artà](https://artamallorca.travel/es/santSalvador/) |
| 32 | [Ses Païsses · Ajuntament d’Artà](https://arta.cat/ajuntament/fitxaServeis.php?id=100) |
| 33–34 | [Centro histórico · Turismo de Alcúdia](https://alcudiamallorca.com/es/centro-historico) |
| 35 | [Ciudad romana de Pollentia · Ajuntament d’Alcúdia](https://www.alcudia.net/Pollentia/es/la-ciutat-romana/) |
| 36 | [Pont Romà · Ajuntament de Pollença](https://pollensa.com/es/descubrir-pollenca/lugares-de-interes/puente-romano) |
| 37 | [El Calvari · Ajuntament de Pollença](https://pollensa.com/es/descubrir-pollenca/lugares-de-interes/el-calvario) |
| 38 | [Colomer · Ajuntament de Pollença](https://pollensa.com/es/descubrir-pollenca/lugares-de-interes/mirador-del-colomer) |
| 39 | [Torre del Palau · Visit Manacor](https://visitmanacor.com/es/patrimonio/torre-del-palau/) |
| 40 | [Nostra Senyora dels Dolors · Visit Manacor](https://visitmanacor.com/es/patrimonio/iglesia-de-nostra-senyora-dels-dolors/) |
| 41 | [Drach · normas del gestor](https://www.cuevasdeldrach.com/normas.php), [folleto oficial](https://www.cuevasdeldrach.com/pdf/folleto-cuevas-drach-es.pdf) |
| 42 | [Hams · instalaciones y fotografía](https://cuevasdelshams.com/instalaciones/), [Hams · Visit Manacor](https://visitmanacor.com/ca/patrimonio/cuevas-dels-hams/) |
| 43 | [Formentor · Ajuntament de Pollença](https://pollensa.com/es/descubrir-pollenca/lugares-de-interes/el-faro-de-formentor) |
| 44 | [Torre del Verger · Consorci Serra de Tramuntana](https://serradetramuntana.net/en/-/les-torres-de-defensa) |
| 45 | [Santa Maria · guía del Ajuntament de Sineu](https://ajsineu.net/sites/cilma_sineu/files/2019-03/PLANOL%20CATALA%20-%20CASTELLANO.pdf) |
| 46 | [Santa Maria la Major · Ajuntament d’Inca](https://incaciutat.com/wp-content/uploads/en-visites-guiades-inca-08.pdf) |
| 47 | [Molí des Fraret · Consell de Mallorca](https://www.conselldemallorca.es/es/-/1-moli-des-fraret) |
| 48 | [Casa natal de Juníper Serra · Ajuntament de Petra](https://ajpetra.net/de/node/2731) |
| 49 | [Cura · Ajuntament d’Algaida](https://ajalgaida.net/ca/associacions-empreses-equipaments-i-installacions/santuari-de-cura), [Randa · Fundació Mallorca Turisme](https://fundaciomallorcaturisme.net/destinos/es-pla/algaida/) |
| 50 | [Es Pontàs · Turismo de Santanyí](https://visitcalador.com/puntos-de-interes/es-pontas/) |

## Cómo ampliar el catálogo

1. Abrir y conservar una fuente primaria que identifique el lugar y municipio. Si la fuente es ambigua, no incorporar el lugar todavía.
2. Comprobar el acceso al exterior y las condiciones para fotografiar; evitar lugares que requieran invadir propiedad privada.
3. Añadir una ficha con el siguiente número libre. Mantener nombres locales y explicar cualquier datación o atribución incierta.
4. Asignar rareza mediante el criterio de acceso y escribir su razón, revisable por separado de la importancia patrimonial.
5. Curar fotografías de referencia con autoría y licencia verificables; cubrir varios ángulos y edificios confundibles. No usar la URL de una fuente como si fuera una licencia de sus imágenes.
6. Validar el reconocimiento con capturas nuevas, negativos y vistas difíciles antes de cambiar `untrained` o permitir desbloqueos.
