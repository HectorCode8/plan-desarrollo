# Plan Desarrollo Teocuitatlán 2027-2030

Sitio ciudadano que comunica la visión y los ejes estratégicos para Teocuitatlán 2027-2030.

## Requisitos

- Node.js 20+
- npm 10+

## Scripts útiles

```bash
npm install     # instala dependencias
npm run lint    # valida el HTML principal
npm run build   # genera artefactos minificados en dist/
```

La carpeta `dist/` es la salida de producción usada por Netlify.

## Flujo de Deploy

1. Trabaja en una rama, abre PR contra `main`.
2. GitHub Actions ejecutará lint y build automáticamente.
3. Una vez fusionado en `main`, Netlify detectará el cambio y publicará.
4. Revisa Netlify logs para confirmar el deploy.

## Archivos Clave

- `netlify.toml`: configuración de publicación.
- `build.mjs`: pipeline de minificación.
- `robots.txt` y `sitemap.xml`: SEO básico.
- `.github/workflows/ci.yml`: verificación automática en cada push.
