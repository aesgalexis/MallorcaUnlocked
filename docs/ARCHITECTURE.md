# Arquitectura

HTML, CSS y módulos ES nativos. Node 22 se utiliza para desarrollo, empaquetado y pruebas, sin servidor de producción. No hay framework de interfaz, base remota, cuentas, analítica, claves, mapas ni GPS.

| Ruta | Responsabilidad |
| --- | --- |
| `index.html` | Entrada, metadatos y CSP |
| `src/app.js` | Interfaz, diálogos, confirmación y coordinación |
| `src/styles.css` | Responsive, monedas, giro 3D y movimiento reducido |
| `src/ui/icons.js` | Iconos SVG simbólicos propios |
| `src/data/catalog.js` | Lugares, IDs estables, fuentes y clasificación |
| `src/lib/catalog.js` | Búsqueda, filtros y progreso |
| `src/lib/camera.js` | Permiso, MediaStream, captura y liberación |
| `src/lib/storage.js` | Repositorio IndexedDB y transacciones |
| `src/lib/backup.js` | Copias versionadas y validación |
| `src/recognition/service.js` | Contrato sustituible del motor |
| `src/recognition/worker.js` | ORB, emparejado y homografía |
| `src/recognition/policy.js` | Activación, umbrales y rechazos |
| `recognition/reference-manifest.json` | Configuración local desactivada |
| `scripts/` | Servidor, comprobación y build |

## Captura y descubrimiento

1. Abrir el diálogo no solicita permisos. «Permitir cámara» pide solo vídeo con preferencia por cámara trasera; no hay galería ni fallback de archivos de imagen.
2. El disparador espera vídeo reproducible. Se captura el fotograma completo, sin recorte, manteniendo proporciones y limitando el lado largo a 1920 px. JPEG al 90 % es el original de la captura web, no RAW del sensor; no conserva EXIF ni ubicación. La fecha se almacena por separado.
3. El usuario decide guardar. Se persiste primero y se intenta reconocer después: un fallo de inferencia no pierde una foto ya guardada.
4. Desactivación, desconocimiento, ambigüedad o fallo dejan una captura pendiente, sin progreso.
5. Una propuesta suficiente necesita confirmación. Rechazar conserva la captura pendiente; aceptar crea un descubrimiento en una transacción.
6. Si ya existía el lugar, se conserva la primera fotografía y la nueva queda pendiente. La moneda muestra el recuerdo al girar y permite consultar la imagen completa desde sus detalles.

La cámara se libera al capturar, cerrar o pasar a segundo plano. Un permiso concedido después del cierre se libera inmediatamente. Una interrupción ofrece reabrir la cámara. Las URLs `blob:` se revocan al dejar de ser necesarias.

## Persistencia y migración

Base `mallorca-unlocked`, versión 1:

- `captures`, clave `id`: `photo: Blob`, `capturedAt`, `origin`.
- `discoveries`, clave `placeId`: `captureId`, `capturedAt`, `discoveredAt`, evidencia mínima y fecha de confirmación.

Las fechas se conservan ISO UTC y se muestran en el huso del navegador. El progreso cruza IDs conocidos con descubrimientos, excluyendo pendientes.

La exportación usa JSON con `format: mallorca-unlocked-collection`, `version: 1`, fotos base64 y fechas. Importar valida formato, IDs únicos, relaciones, fechas, MIME, tamaño y decodificación antes de ofrecer confirmación. La escritura es atómica. Fotos iguales se reutilizan; IDs en conflicto se reasignan; descubrimientos existentes conservan el original. La misma copia se puede restaurar repetidamente sin duplicados. Lugares de un catálogo futuro se omiten del progreso y sus fotos quedan pendientes.

Límites: 200 MB por copia, 12 MB por foto, 2000 capturas por importación, 50 millones de píxeles por imagen. Base64 requiere memoria adicional. Colecciones mayores necesitarán migración por bloques o ZIP futuro. Una copia personal no prueba una visita: se marca `restored`, sin fingir otra identificación.

El navegador puede desalojar IndexedDB. La interfaz permite pedir `navigator.storage.persist()` y conocer su resultado; no sustituye copias externas. No hay service worker ni apertura offline garantizada. Las pestañas simultáneas no se sincronizan en vivo: recargar refleja los últimos datos.

`CollectionStore` es la frontera de almacenamiento. Un futuro adaptador remoto puede implementar `snapshot`, `saveCapture`, `confirmDiscovery`, `merge` y `deletePendingCapture`. No se implementan cuentas o perfiles anticipadamente.

## Privacidad y seguridad

El arranque solicita recursos solo del mismo origen. Fuentes e iconos son locales. La CSP limita scripts, conexiones y workers al mismo origen, admite WebAssembly local y bloquea objetos y formularios. Los enlaces institucionales se abren por acción del usuario. El servidor local bloquea micrófono y geolocalización mediante Permissions-Policy; Pages no permite configurar esos encabezados por archivo, pero el código no pide esas APIs.

Se escapan los textos antes de insertarlos en HTML. Las copias solo admiten JPEG, PNG y WebP decodificables, nunca SVG. Las copias contienen fotografías personales: deben conservarse fuera de repositorios públicos.

No es un sistema antifraude: el propietario puede manipular sus datos locales. Una cámara disponible tampoco prueba que sea física ni demuestra presencia en un lugar.
