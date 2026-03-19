# Guía para Subir el Proyecto a GitHub

## Pasos Detallados

### 1. Verificar que Git esté Instalado

```bash
git --version
```

Si no tienes Git instalado, descárgalo desde: https://git-scm.com/

### 2. Configurar Git (Primera vez)

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"
```

### 3. Inicializar el Repositorio Local

En la carpeta del proyecto, ejecuta:

```bash
git init
```

### 4. Verificar el .gitignore

El archivo `.gitignore` ya está configurado para excluir:
- `node_modules/`
- `dist/`
- `.env`
- Archivos del sistema

### 5. Hacer el Primer Commit

```bash
git add .
git commit -m "Initial commit: Sistema POS completo en la nube"
```

### 6. Crear Repositorio en GitHub

1. Ve a https://github.com
2. Haz clic en el botón "New" o "New repository"
3. Completa la información:
   - **Repository name**: `sistema-pos-nube` (o el nombre que prefieras)
   - **Description**: "Sistema de Punto de Venta en la nube con React y Supabase"
   - **Visibilidad**: Público o Privado (según tu preferencia)
   - **NO** marques "Initialize this repository with a README" (ya tienes uno)
4. Haz clic en "Create repository"

### 7. Conectar el Repositorio Local con GitHub

GitHub te mostrará comandos similares a estos. Cópialos y ejecútalos:

```bash
git remote add origin https://github.com/tu-usuario/sistema-pos-nube.git
git branch -M main
git push -u origin main
```

**Reemplaza** `tu-usuario` y `sistema-pos-nube` con tus datos reales.

### 8. Verificar que se Subió Correctamente

Ve a tu repositorio en GitHub y verifica que todos los archivos estén presentes.

## Comandos Útiles de Git

### Ver el Estado de los Archivos

```bash
git status
```

### Agregar Cambios Nuevos

```bash
git add .
git commit -m "Descripción de los cambios"
git push
```

### Ver el Historial de Commits

```bash
git log
```

### Ver Archivos Ignorados

```bash
git status --ignored
```

## Estructura que se Subirá a GitHub

```
├── src/                    # Código fuente
├── public/                 # Archivos públicos
├── index.html             # HTML principal
├── package.json           # Dependencias
├── tsconfig.json          # Configuración TypeScript
├── vite.config.ts         # Configuración Vite
├── tailwind.config.js     # Configuración Tailwind
├── README.md              # Documentación
└── .gitignore             # Archivos a ignorar
```

## Archivos que NO se Subirán (Protegidos por .gitignore)

- `node_modules/` - Dependencias (se instalan con `npm install`)
- `dist/` - Build de producción
- `.env` - Variables de entorno (¡IMPORTANTE! Contiene claves secretas)
- `.DS_Store` - Archivos del sistema

## Clonar el Repositorio en Otro Equipo

Para trabajar en otro equipo:

```bash
git clone https://github.com/tu-usuario/sistema-pos-nube.git
cd sistema-pos-nube
npm install
```

**IMPORTANTE**: Necesitarás crear tu propio archivo `.env` con las credenciales de Supabase.

## Colaboración

### Para Actualizar tu Copia Local

```bash
git pull
```

### Para Crear una Rama Nueva

```bash
git checkout -b nombre-de-la-rama
```

### Para Cambiar de Rama

```bash
git checkout main
```

## Problemas Comunes

### Error: "remote origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/tu-usuario/sistema-pos-nube.git
```

### Error al Hacer Push

Si te pide autenticación, GitHub ahora requiere un Personal Access Token en lugar de contraseña:

1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Genera un nuevo token con permisos de `repo`
3. Usa ese token como contraseña cuando Git te lo pida

### Archivo .env Subido por Error

Si accidentalmente subiste el archivo `.env`:

```bash
git rm --cached .env
git commit -m "Remove .env from repository"
git push
```

**Luego** cambia tus claves de Supabase inmediatamente.

## Despliegue

### Opciones de Hosting Gratuito

1. **Vercel** (Recomendado)
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Netlify**
   ```bash
   npm install -g netlify-cli
   netlify deploy
   ```

3. **GitHub Pages**
   - Requiere configuración adicional en `vite.config.ts`

## Recursos Adicionales

- [Documentación de Git](https://git-scm.com/doc)
- [Guías de GitHub](https://guides.github.com/)
- [Aprende Git de Forma Interactiva](https://learngitbranching.js.org/)

## Soporte

Si tienes problemas, revisa:
1. El estado de Git: `git status`
2. Los remotos configurados: `git remote -v`
3. El log de commits: `git log --oneline`
