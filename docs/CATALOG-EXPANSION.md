# Segunda edición: 50 incorporaciones

La ampliación añade exactamente **50 lugares**, con números estables 51–100 e IDs `mallorca-0051`–`mallorca-0100`. No reasigna los primeros cincuenta números. Las fuentes primarias se contrastaron mediante navegación el **5 de noviembre de 2026**; esto no equivale a una visita de campo ni garantiza apertura actual.

El módulo `src/data/extra-places.js` exporta `extraPlaces` y `extraSources`. Cada ficha conserva nombre, municipio, categoría, icono simbólico, descripción propia, precauciones de acceso, indicios visuales y referencias documentales. No incorpora fotografías de terceros ni referencias entrenadas. La familia de categorías es la misma del catálogo inicial.

## Selección y precisión

- Se incluyen yacimientos, torres, faros, espacios naturales, conjuntos históricos, museos y santuarios. Se prioriza una identidad física distinta: la Fundació Miró constituye una sola ficha, sin convertir cada uno de sus edificios en monedas separadas.
- **Capdepera** es el municipio de Coves d’Artà: el nombre de la cueva no debe confundirse con su municipio. Se usa la dirección de la ficha turística oficial, pese a una referencia ambigua a Artà en su introducción.
- **Sa Dragonera** pertenece a Andratx y es una isla del parque natural. Puede contemplarse desde Mallorca; el catálogo no presupone que exista transporte ni desembarco en cualquier momento.
- **S’Albufera** abarca Muro y Sa Pobla. La ficha utiliza Muro como referencia de los recorridos de acceso, sin afirmar que el parque pertenezca a un único municipio.
- **Far d’Alcanada** se contempla desde tierra; no se propone cruzar al islote. Los faros no presuponen acceso a recintos portuarios.
- **Fonts Ufanes** no brota permanentemente: la condición natural forma parte de la ficha y no se garantiza el fenómeno durante una visita.
- **Son Marroig** representa el conjunto cultural y su templete; **Sa Foradada** representa la formación natural. Son identidades distintas, no dos nombres de la misma moneda.
- **Museu de la Mar** es la sede del Port de Sóller, distinta de la sede de Ses Voltes de Palma. Los números de visitantes deben corresponder a la sede concreta.
- **Castell de Sant Elm**, Can Vivot, jardines, cuevas y museos tienen condiciones de acceso y fotografía propias. La documentación no concede permiso ni garantiza que todo el recinto sea público.
- Los indicios visuales son notas de curación, no una promesa de que el motor pueda distinguir cada lugar. Todas las referencias visuales permanecen vacías y el estado es `untrained`.

## Rareza

Los registros nuevos parten de `unranked` y «Sin datos de afluencia comparables». La dificultad de acceso deja de decidir rareza. La clasificación por visitas se aplica en una capa separada, con cifra, periodo, fuente y alcance de la medición: no se inventan recuentos ni se sustituye una cifra ausente por popularidad supuesta.

## Evidencia documental

Las URL exactas, títulos y fecha de consulta están en `extraSources`; cada ficha enlaza sus claves `sourceIds`. Se utilizan el portal turístico oficial de Illes Balears, Consell de Mallorca, ayuntamientos, oficinas turísticas municipales y gestores del patrimonio. Las descripciones son propias y breves, sin copiar textos ni reutilizar imágenes institucionales.

El Plan Territorial de Mallorca documenta una ruta arqueológica que incluye S’Hospitalet Vell, S’Illot, Son Fred y Son Corró; se cita como evidencia de identidad y municipio, sin trasladar a esta versión afirmaciones antiguas sobre apertura actual. Las fichas de la ampliación mantienen advertencias de consulta para evitar ese supuesto.
