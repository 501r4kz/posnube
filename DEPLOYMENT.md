# Guía de Despliegue

Esta guía te ayudará a desplegar tu Sistema POS en la nube.

## Opción 1: Vercel (Recomendado)

Vercel es la forma más fácil de desplegar aplicaciones React/Vite.

### Pasos:

1. **Crear cuenta en Vercel**
   - Ve a https://vercel.com
   - Regístrate con tu cuenta de GitHub

2. **Importar proyecto desde GitHub**
   - Haz clic en "Add New..." → "Project"
   - Selecciona tu repositorio de GitHub
   - Vercel detectará automáticamente que es un proyecto Vite

3. **Configurar variables de entorno**
   - En la sección "Environment Variables", agrega:
     - `VITE_SUPABASE_URL`: Tu URL de Supabase
     - `VITE_SUPABASE_ANON_KEY`: Tu clave anónima de Supabase

4. **Desplegar**
   - Haz clic en "Deploy"
   - Vercel construirá y desplegará tu aplicación
   - Recibirás una URL como: `https://tu-proyecto.vercel.app`

### Actualizaciones Automáticas

Cada vez que hagas push a la rama `main` en GitHub, Vercel desplegará automáticamente los cambios.

## Opción 2: Netlify

### Pasos:

1. **Crear cuenta en Netlify**
   - Ve a https://netlify.com
   - Regístrate con tu cuenta de GitHub

2. **Importar proyecto**
   - Haz clic en "Add new site" → "Import an existing project"
   - Selecciona GitHub y autoriza Netlify
   - Selecciona tu repositorio

3. **Configurar build**
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Variables de entorno**
   - Ve a "Site settings" → "Environment variables"
   - Agrega:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

5. **Desplegar**
   - Haz clic en "Deploy site"

## Opción 3: GitHub Pages

GitHub Pages es gratuito pero requiere configuración adicional.

### Pasos:

1. **Instalar gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Actualizar vite.config.ts**
   ```typescript
   export default defineConfig({
     plugins: [react()],
     base: '/nombre-de-tu-repositorio/',
     optimizeDeps: {
       exclude: ['lucide-react'],
     },
   });
   ```

3. **Actualizar package.json**
   Agregar scripts:
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

4. **Desplegar**
   ```bash
   npm run deploy
   ```

5. **Configurar GitHub Pages**
   - Ve a Settings → Pages en tu repositorio
   - Source: "Deploy from a branch"
   - Branch: `gh-pages`
   - Folder: `/ (root)`

**Nota**: GitHub Pages no soporta variables de entorno de forma nativa. Necesitarás una solución alternativa o usar otro servicio.

## Configuración de Supabase para Producción

### 1. Configurar URL del Sitio

En el dashboard de Supabase:
- Ve a Authentication → URL Configuration
- Agrega tu URL de producción a "Site URL"
- Agrega tu URL a "Redirect URLs"

### 2. Políticas de CORS

Supabase maneja CORS automáticamente, pero asegúrate de que tu dominio esté permitido.

### 3. Límites de Rate

En producción, considera configurar límites de rate para prevenir abuso:
- Ve a Project Settings → API
- Configura límites apropiados

## Monitoreo y Analytics

### Vercel Analytics

Si usas Vercel, puedes habilitar Analytics:

1. Instalar:
   ```bash
   npm install @vercel/analytics
   ```

2. Agregar en `main.tsx`:
   ```typescript
   import { Analytics } from '@vercel/analytics/react';

   // En tu renderizado
   <Analytics />
   ```

### Google Analytics

Para agregar Google Analytics:

1. Crear una propiedad en Google Analytics

2. Instalar el paquete:
   ```bash
   npm install react-ga4
   ```

3. Configurar en tu aplicación

## Checklist Pre-Despliegue

- [ ] Todas las pruebas pasan: `npm run build`
- [ ] Variables de entorno configuradas
- [ ] Base de datos Supabase configurada
- [ ] URLs de redirección configuradas en Supabase
- [ ] `.env` no está en el repositorio
- [ ] README actualizado con URL del sitio

## Dominios Personalizados

### En Vercel:

1. Ve a Settings → Domains
2. Agrega tu dominio personalizado
3. Configura los registros DNS según las instrucciones

### En Netlify:

1. Ve a Domain settings → Add custom domain
2. Sigue las instrucciones para configurar DNS

## SSL/HTTPS

Tanto Vercel como Netlify proporcionan certificados SSL automáticos y gratuitos.

## Problemas Comunes

### Error: "Failed to load module"

- Verifica que todas las dependencias estén en `package.json`
- Ejecuta `npm install` localmente
- Verifica que el build local funcione: `npm run build && npm run preview`

### Variables de entorno no funcionan

- Asegúrate de que comiencen con `VITE_`
- Reinicia el despliegue después de agregarlas
- Verifica que estén en el dashboard del servicio de hosting

### Error 404 en rutas

Para aplicaciones SPA, necesitas configurar redirects:

**Netlify** - Crear `public/_redirects`:
```
/* /index.html 200
```

**Vercel** - Crear `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

## Backup y Recuperación

### Backup de Base de Datos

Supabase hace backups automáticos, pero puedes hacer backups manuales:

1. Ve a Database → Backups en Supabase
2. Descarga el backup

### Rollback de Despliegue

**Vercel**:
- Ve a Deployments
- Selecciona un despliegue anterior
- Haz clic en "Promote to Production"

**Netlify**:
- Ve a Deploys
- Selecciona un despliegue anterior
- Haz clic en "Publish deploy"

## Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Netlify](https://docs.netlify.com/)
- [Guía de Vite para Despliegue](https://vitejs.dev/guide/static-deploy.html)
- [Documentación de Supabase](https://supabase.com/docs)
