# Componentes y contenido de terceros

El frontend y su lógica se escriben para Mallorca Unlocked. No hay dependencias de interfaz en tiempo de ejecución.

- **OpenCV 4.12.0**, distribuido por `@techstark/opencv-js@4.12.0-release.1`: licencia **Apache-2.0**. El build copia la licencia completa a `dist/vendor/OPENCV-LICENSE.txt`. Se utiliza únicamente como primitiva de visión para ORB, emparejado y homografía; el catálogo, las reglas de rechazo, la coordinación y la persistencia pertenecen a este proyecto. El runtime queda alojado junto a la web y no se carga mientras el reconocimiento permanezca desactivado. [Paquete y código](https://github.com/TechStark/opencv-js), [licencia de OpenCV](https://github.com/opencv/opencv/blob/4.12.0/LICENSE).
- **Playwright** (Apache-2.0) y **fake-indexeddb** (Apache-2.0): herramientas de desarrollo y pruebas. No se distribuyen en la aplicación.
- Las fuentes institucionales del catálogo se citan en [docs/CATALOG.md](docs/CATALOG.md). Son evidencia documental, no autorizaciones para reutilizar sus fotografías. Las descripciones se redactaron para el proyecto.
- Los iconos SVG son ilustraciones simbólicas originales del proyecto; no son levantamientos arquitectónicos exactos. Se usan fuentes del sistema, sin solicitudes a Google Fonts ni otros proveedores.

## Fotografías de muestra

Las tres fotografías sirven únicamente para las visitas simuladas solicitadas. No son capturas personales ni referencias del reconocimiento. La interfaz identifica las muestras y muestra autoría, fuente y licencia en la vista de fotografía.

| Archivo local | Autoría y fuente | Licencia |
| --- | --- | --- |
| `assets/demo/seu.jpg` | Diotime · [Catedral de Palma.JPG](https://commons.wikimedia.org/wiki/File:Catedral_de_Palma.JPG) | Dominio público, liberado por su autor |
| `assets/demo/bellver.jpg` | Friedrich Haag · [043 2015 06 02 Castell de Bellver.jpg](https://commons.wikimedia.org/wiki/File:043_2015_06_02_Castell_de_Bellver.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| `assets/demo/almudaina.jpg` | Sexta · [La Almudaina - Palma de Mallorca.jpg](https://commons.wikimedia.org/wiki/File:La_Almudaina_-_Palma_de_Mallorca.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |

Se distribuyen las versiones reducidas de Wikimedia Commons, sin retoques propios. La interfaz recorta circularmente su visualización; la vista completa conserva sus proporciones. Las fotografías CC BY-SA y cualquier adaptación visual conservan esa licencia. No se aplica esa licencia fotográfica al código del proyecto ni a las capturas privadas del usuario.

No se distribuyen pesos de modelos ni referencias visuales de entrenamiento. Cualquier incorporación futura debe registrar sus derechos y atribuciones.
