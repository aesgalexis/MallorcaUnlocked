# Componentes y contenido de terceros

El frontend y su lógica se escriben para Mallorca Unlocked. No hay dependencias de interfaz en tiempo de ejecución.

- **OpenCV 4.12.0**, distribuido por `@techstark/opencv-js@4.12.0-release.1`: licencia **Apache-2.0**. El build copia la licencia completa a `dist/vendor/OPENCV-LICENSE.txt`. Se utiliza únicamente como primitiva de visión para ORB, emparejado y homografía; el catálogo, las reglas de rechazo, la coordinación y la persistencia pertenecen a este proyecto. El runtime queda alojado junto a la web y no se carga mientras el reconocimiento permanezca desactivado. [Paquete y código](https://github.com/TechStark/opencv-js), [licencia de OpenCV](https://github.com/opencv/opencv/blob/4.12.0/LICENSE).
- **Playwright** (Apache-2.0) y **fake-indexeddb** (Apache-2.0): herramientas de desarrollo y pruebas. No se distribuyen en la aplicación.
- Las fuentes institucionales del catálogo se citan en [docs/CATALOG.md](docs/CATALOG.md). Son evidencia documental, no autorizaciones para reutilizar sus fotografías. Las descripciones se redactaron para el proyecto.
- Los iconos SVG son ilustraciones simbólicas originales del proyecto; no son levantamientos arquitectónicos exactos. Se usan fuentes del sistema, sin solicitudes a Google Fonts ni otros proveedores.

No se incluyen fotografías de terceros, pesos de modelos, datos de entrenamiento ni referencias visuales con licencia pendiente. Una futura incorporación de imágenes o modelos deberá registrar autoría, fuente, licencia y obligaciones de atribución antes de su distribución.
