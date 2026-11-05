# Verificación del MVP

Reproducible con `npm run verify`, después de `npm ci` y `npx playwright install chromium`.

**Resultado local, 5 de noviembre de 2026: correcto.** Sintaxis/catálogo, 19 pruebas unitarias, build estático y 17 pruebas de navegador completadas: **36 pruebas superadas, cero fallos**. Entorno: Windows, Node 22.12.0, Playwright 1.64.1 y Chromium 156 de Playwright. La inspección visual adicional se hizo en el navegador integrado de Codex.

La cámara de las pruebas es virtual. El Chrome del sistema entregó un stream de prueba terminado; se utilizó Chromium de Playwright para el pase reproducible, y se añadió detección de interrupciones al código de cámara. No se ha accedido a la cámara física.

## Cobertura

- Sintaxis e integridad de 50 fichas: IDs/números únicos, campos obligatorios, categorías, iconos y fuentes HTTPS registradas.
- Filtros combinados, tildes y progreso que excluye pendientes/IDs desconocidos.
- Cámara: solo vídeo, contexto seguro, permisos, liberación y ausencia de galería.
- IndexedDB: bytes y fechas tras reabrir, confirmación vinculada a captura, originales protegidos y transacciones.
- Copias: versión, relaciones, límites, MIME, imágenes dañadas, conflictos de IDs, restauración idempotente y descarga.
- Reconocimiento: desactivación por defecto, error, cancelación, evidencia insuficiente y ambigüedad.
- Navegador: 50 monedas apagadas, fuentes, filtros, estados vacíos, cámara virtual, pendientes, recarga, importación, giro 3D, borrado confirmado y movimiento reducido.
- Responsive a 320, 390, 768 y 1024 px: sin desbordamiento horizontal y con diálogos dentro del viewport. Captura de escritorio a 1440 px.
- Runtime OpenCV real: textura transformada y negativo sin rasgos; flujo de propuesta, rechazo y confirmación con referencia sintética solo de prueba.
- Build servido bajo `/MallorcaUnlocked/`, comprobando rutas de Pages y arranque sin dependencias externas.

## Límites

No demuestra precisión sobre monumentos reales, comportamiento de todos los navegadores, que la cámara sea física, acceso a los lugares, vigencia de horarios, permanencia garantizada del almacenamiento, una auditoría completa de accesibilidad ni despliegue público.

Inspección visual en escritorio y móvil simulado. Quedan pruebas de campo con cámara trasera, rotación, suspensión/reanudación y almacenamiento en Safari/iOS y Chrome/Android reales. El reconocimiento necesita evaluación retenida antes de activar el manifiesto.
