# punchballstreet-website

Guía para publicar en GitHub Pages y ejecutar main.html.

Pasos recomendados:

1. Asegúrate de que tu repositorio esté en GitHub. Sube todo el contenido del proyecto (incluyendo la carpeta `src`, `main.html`, `index.html`, CSS y JS).
2. Archivo de entrada: GitHub Pages sirve `index.html` por defecto. En este repo se creó `index.html` que redirige a `main.html` automáticamente. Si prefieres, puedes renombrar `main.html` a `index.html` y eliminar el archivo de redirección.
3. Rutas relativas: Todas las rutas a recursos (imágenes, videos, CSS, JS) deben ser relativas (por ejemplo `src/logo-ball.png`, `styles.css`). Evita rutas absolutas como `/src/logo-ball.png`.
4. Sensibilidad a mayúsculas/minúsculas: GitHub Pages corre sobre Linux, así que `src/ramon.png` es distinto a `src/RAMON.png`. Verifica que los nombres coincidan exactamente con los archivos en `src/`.
5. Habilitar GitHub Pages:
   - Ve a Settings > Pages de tu repositorio en GitHub.
   - En "Source", selecciona la rama `main` (o `master`) y la carpeta `/ (root)`.
   - Guarda. GitHub generará una URL como `https://<tu-usuario>.github.io/<nombre-del-repo>/`.
6. Espera 1-3 minutos a que se despliegue. Visita la URL. Deberías ver `index.html` y ser redirigido a `main.html`.
7. Si usas un dominio personalizado, agrega un archivo `CNAME` en la raíz con tu dominio (opcional) y configura DNS.

Comandos útiles (local): abre `index.html` en tu navegador para probar. Si todo carga localmente con rutas relativas, debería cargar en Pages.

Solución incluida:
- Se añadió `index.html` con redirección inmediata hacia `main.html` para que GitHub Pages sirva el sitio sin cambiar el nombre del archivo principal.

Avisos:
- En `main.html` hay enlaces a `src/baseball_street_013.apk` y `src/trailer.mp4` que no existen en el repositorio listado. Si no agregas esos archivos, esos enlaces devolverán 404 en GitHub Pages. Sube los archivos o elimina/ajusta los enlaces.