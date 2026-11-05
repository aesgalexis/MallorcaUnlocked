# Rareza por visitas

La rareza depende ahora de **las visitas anuales registradas a cada lugar**: menos visitas, más raro. Sustituye al criterio anterior de dificultad o condiciones de acceso. Las notas de acceso siguen siendo útiles para visitar un lugar, pero no asignan rareza.

## Regla reproducible

| Rareza | Visitas registradas durante un año completo |
| --- | --- |
| Común | 250.000 o más |
| Poco común | De 50.000 a 249.999 |
| Rara | De 10.000 a 49.999 |
| Épica | Menos de 10.000 |
| Sin clasificar | No hay una cifra anual verificable y comparable |

Los umbrales son una decisión de producto, no una clasificación oficial. `src/lib/rarity.js` los aplica a `src/data/visitation.js`. El cálculo exige un número entero no negativo, año completo de 2024 o 2025, ámbito de entradas/visitas registradas y una fuente HTTPS identificada. Rechaza datos parciales, cantidades en texto, estimaciones sin respaldo y datos de otros ámbitos. Cero solo es válido si una fuente lo publica explícitamente: nunca se usa cero para rellenar un dato ausente.

## Evidencia incorporada

Este primer lote utiliza exclusivamente **2024** como año de referencia común; no mezcla cifras parciales de 2025 con años completos.

| ID | Lugar | Visitas 2024 | Rareza | Fuente primaria |
| --- | --- | ---: | --- | --- |
| mallorca-0003 | Palau de l’Almudaina | 254.192 | Común | [Patrimonio Nacional, Memoria 2024](https://www.patrimonionacional.es/sites/default/files/documents/MEMORIA%202024%20v3%20editada%20para%20web.pdf#page=60), página impresa 59, apartado Visita pública |
| mallorca-0082 | Museu de la Mar, Port de Sóller | 20.906 | Rara | [Memoria del Museu Marítim](https://museumaritim.conselldemallorca.es/documents/867102/1036672/Mem%C3%B2ria%2BActivitats%2B2025.pdf/2128c381-01c6-def0-7a76-304a375b3486), sección Inversions, cifra explícita del año 2024 |
| mallorca-0087 | Es Baluard | 84.158 | Poco común | [Memoria 2024 del propio museo](https://esbaluard.org/uploads/2026/02/EsBaluardMuseu_Memoria2024_WEB_low.pdf), apartado de afluencia anual |
| mallorca-0091 | Museu de Mallorca | 24.842 | Rara | [BOPIB 94, 6 de junio de 2025](https://web.parlamentib.es/repositori/PUBLICACIONS/11/bopibs/bopib-11-094.pdf), página impresa 9144, respuesta RGE 7645/25 |
| mallorca-0092 | Palau del Consell | 6.561 | Épica | [Comunicado del Consell de Mallorca](https://www.conselldemallorca.es/es/noticia1/-/asset_publisher/0kVpLMnZrHVi/content/visites-palau/695139), 2 de enero de 2025 |

Los datos se comprobaron el 5 de noviembre de 2026. Se conservan el año, el ámbito, el documento y su localización en cada registro para permitir su revisión. No se han copiado imágenes de las fuentes.

## Alcance y límites

Estas fuentes contabilizan **visitas o entradas al recinto**, no visitantes únicos ni afluencia total de los espacios públicos que lo rodean. Una persona puede hacer varias visitas. Las políticas de entrada, los aforos, las citas, el calendario de apertura o una programación extraordinaria influyen en el resultado. El Palau del Consell, por ejemplo, publica visitas concertadas al interior: no sería correcto tratar esa cifra como todo el tránsito de su fachada.

La clasificación expresa por tanto rareza según **visitas registradas disponibles**, con el alcance indicado; no afirma saber cuánta gente fotografía un exterior. No se extrapolan museos o municipios enteros a una fachada o mirador particular. No se atribuyen a la sede de Sóller cifras de Ses Voltes ni al edificio del Gran Hotel cifras generales de CaixaForum sin identificar su ámbito.

Para lugares sin aforo o datos publicados —muchos miradores, faros, iglesias y fachadas— se muestra «Sin clasificar». **Falta de datos no equivale a pocas visitas.** No se emplean reseñas, importancia histórica, popularidad supuesta, acceso difícil, visitas simuladas ni fotografías de usuarios como sustitutos de estadísticas de afluencia. La Seu y Bellver no reciben una cifra inventada para completar una distribución de rarezas.

La memoria de Patrimonio Nacional de 2025 y algunos comunicados posteriores publican cifras de distinto alcance para la Almudaina. Se ha mantenido el dato explícito y comparable de la memoria 2024, en lugar de mezclarlo con otra cifra o escoger el año que cambie su categoría.

## Ampliación

Para clasificar un nuevo lugar, incorporar una fuente primaria con el total de un año natural completo, comprobar identidad exacta del recinto y alcance, registrar los metadatos y ejecutar las pruebas de límites. Al cambiar el año de referencia, actualizar las fichas disponibles como un conjunto y documentar coberturas y diferencias de medición. La función no interpreta una cifra parcial como un año completo.
