# Reconocimiento visual

**Infraestructura y motor geométrico implementados; reconocimiento de Mallorca pendiente de referencias y evaluación de campo.** El manifiesto distribuido tiene `enabled: false`, `validated: false`, cero referencias y ningún informe de calibración. No propone identidades ni desbloquea lugares reales en esta versión.

## Implementación e investigación

El código carga configuración local, exige validación, ejecuta un worker, gestiona errores/cancelación, rechaza evidencia insuficiente o ambigua y pide confirmación. OpenCV calcula realmente ORB, vecinos con distancia Hamming y homografía RANSAC: no se escogen nombres al azar ni se usan nombres de archivo o GPS.

| Alternativa | Utilidad y límite |
| --- | --- |
| ORB + homografía | Local, correspondencias inspeccionables y útil para experimentar con fachadas con textura. Sensible a perspectivas lejanas, repeticiones y paisajes. Implementado como adaptador experimental. |
| Embeddings con Transformers.js / ONNX | Búsqueda visual en navegador. Exige elegir modelo/licencia, medir descarga y memoria, curar referencias y calibrar rechazo. No se distribuyen pesos sin esa evaluación. |
| Zero-shot con nombres de lugares | Elegir entre etiquetas no garantiza identidad de un edificio concreto ni rechazo de fotografías ajenas. No se usa para desbloquear. |
| Visión remota | Añade servidor, claves o transmisión de fotos, fuera del alcance local. |

Fuentes primarias: [OpenCV: features y homografía](https://docs.opencv.org/4.12.0/d1/de0/tutorial_py_feature_homography.html), [emparejado de descriptores](https://docs.opencv.org/4.12.0/dc/dc3/tutorial_py_matcher.html), [distribución OpenCV.js](https://github.com/TechStark/opencv-js), [Transformers.js](https://huggingface.co/docs/transformers.js/en/index). La elección es una decisión de ingeniería: estas fuentes no prueban precisión sobre nuestro catálogo.

## Contrato

`RecognitionService.recognize(capture, { signal })` recibe la foto, sin municipio seleccionado, lugar pulsado, rareza ni ubicación. Devuelve:

- `unavailable`: falta configuración validada, runtime, cobertura o hay error.
- `unknown`: evidencia insuficiente.
- `ambiguous`: varias identidades plausibles sin margen suficiente.
- `candidate`: ID, motor, fecha y evidencia; **todavía no es descubrimiento**.

`engineFactory` separa cálculo y coordinación. Un motor de embeddings futuro necesita su propia política calibrada mediante un adaptador explícito, conservando rechazo y confirmación. El score geométrico no es una probabilidad: no se muestra un porcentaje ficticio de confianza.

## Política inicial

Imágenes limitadas a 1024 px de lado largo; ORB; dos vecinos; ratio test; exclusión de puntos destino repetidos; homografía RANSAC con tolerancia de 3 px. Se registran coincidencias, inliers, proporción y cobertura por rectángulo de inliers en la consulta.

Mínimos de desarrollo: 28 coincidencias, 22 inliers, proporción 0,65, cobertura 0,12 y margen 0,15 entre lugares distintos. Ratio test máximo 0,7. **No son umbrales calibrados.** La cobertura por rectángulo no certifica una fachada: hace falta mejorar distribución espacial y rechazo de homografías degeneradas antes de activar en campo. Cada worker termina al cancelar o tras 45 segundos.

Las pruebas ejecutan OpenCV real sobre texturas sintéticas, incluida una transformación y un negativo sin rasgos. Un manifiesto interceptado solo en el test permite comprobar cámara virtual → propuesta → rechazo → pendiente → propuesta → confirmación. No se distribuye esa referencia ni se modifica el manifiesto real. Son pruebas de código, no métricas de reconocimiento de monumentos.

## Antes de activar

1. Elegir un piloto de fachadas distinguibles y obtener fotos propias o explícitamente licenciadas. Registrar autoría, URL, licencia y obligaciones; una web pública no concede derechos de sus fotos.
2. Cubrir perspectivas, distancias, luz y dispositivos. Separar capturas de evaluación independientes; impedir que original y recorte entren en conjuntos distintos.
3. Incluir negativos de otros edificios, iglesias similares, personas, paisajes, pantallas y fotos ajenas a Mallorca.
4. Medir falsos positivos, precisión de propuestas, recall, rechazo de desconocidos, latencia y memoria. Calibrar con validación y evaluar en un conjunto retenido. No publicar porcentajes sin resultados.
5. Añadir referencias locales con metadatos, versión del dataset e informe reproducible en `calibration.report`. Documentar cobertura por lugar. Esos campos no sustituyen la revisión del informe.
6. Solo después cambiar `validated` y `enabled`, verificar móviles reales y mantener confirmación obligatoria. Desconocidos, ambigüedad y cancelación nunca deben desbloquear.

Conviene comparar ORB con una combinación de búsqueda por embeddings y verificación geométrica. Llegar a 300–400 lugares requiere catálogo y dataset reales, no más etiquetas vacías.
