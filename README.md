# Sistema POS en la Nube

Sistema completo de Punto de Venta (POS) en la nube desarrollado con React, TypeScript y Supabase.

## Características

- **Registro de Ventas**: Interfaz intuitiva para procesar ventas con búsqueda de productos, carrito de compras y cálculo automático de impuestos
- **Gestión de Inventario**: Control de stock en tiempo real con alertas de productos críticos
- **Cierre de Turno**: Reconciliación de efectivo con auditoría y registro de diferencias
- **Panel Administrativo**: Dashboard con reportes consolidados, gráficos de ventas y análisis de inventario
- **Modo Offline**: Funcionalidad para trabajar sin conexión y sincronización automática
- **Multi-usuario**: Sistema de autenticación con roles de cajero y administrador
- **Reportes en Tiempo Real**: Visualización de ventas por método de pago y tendencias

## Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: Tailwind CSS
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Iconos**: Lucide React

## Requisitos Previos

- Node.js 18 o superior
- npm o yarn
- Cuenta de Supabase (ya configurada)

## Instalación

1. Clonar el repositorio:
```bash
git clone <tu-repositorio>
cd <nombre-del-proyecto>
```

2. Instalar dependencias:
```bash
npm install
```

3. El archivo `.env` ya está configurado con las credenciales de Supabase.

4. Ejecutar las migraciones de base de datos (ya aplicadas automáticamente).

## Uso en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Construcción para Producción

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist/`

## Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── Login.tsx       # Pantalla de inicio de sesión
│   ├── POSRegister.tsx # Registro de ventas
│   ├── ShiftClose.tsx  # Cierre de turno
│   └── AdminPanel.tsx  # Panel administrativo
├── contexts/           # Contextos React
│   └── AuthContext.tsx # Contexto de autenticación
├── hooks/              # Hooks personalizados
│   └── useOffline.ts   # Hook para detectar modo offline
├── lib/                # Utilidades y configuración
│   └── supabase.ts     # Cliente de Supabase
├── types/              # Tipos TypeScript
│   ├── database.ts     # Tipos de base de datos
│   └── pos.ts          # Tipos del sistema POS
├── App.tsx             # Componente principal
└── main.tsx            # Punto de entrada
```

## Base de Datos

### Tablas Principales

- **products**: Catálogo de productos con SKU, precio y stock
- **cash_registers**: Cajas registradoras
- **shifts**: Turnos de cajeros con reconciliación
- **sales**: Ventas completadas
- **sale_items**: Items individuales de cada venta

## Funcionalidades Principales

### 1. Registro de Ventas
- Búsqueda rápida de productos por nombre o SKU
- Carrito de compras con cantidades ajustables
- Aplicación de descuentos porcentuales
- Cálculo automático de IVA (13%)
- Procesamiento de ventas en efectivo o tarjeta

### 2. Cierre de Turno
- Resumen de ventas del turno
- Conteo de efectivo y tarjetas
- Detección automática de diferencias
- Registro obligatorio de observaciones

### 3. Panel Administrativo
- Gráficos de ventas consolidadas (últimos 30 días)
- Inventario global con estados de stock
- Alertas de stock crítico
- Total de ventas y transacciones

### 4. Modo Offline
- Detección automática de pérdida de conexión
- Almacenamiento local de ventas pendientes
- Sincronización automática al recuperar conexión

## Usuarios de Prueba

Para crear un usuario, usa la pantalla de registro o ejecuta:

```sql
-- En Supabase SQL Editor
-- Los usuarios se crean a través de la interfaz de autenticación
```

## Subir a GitHub

1. Inicializar repositorio Git (si no existe):
```bash
git init
```

2. Agregar archivos:
```bash
git add .
git commit -m "Initial commit: Sistema POS completo"
```

3. Crear repositorio en GitHub y conectar:
```bash
git remote add origin https://github.com/tu-usuario/tu-repositorio.git
git branch -M main
git push -u origin main
```

## Variables de Entorno

El archivo `.env` contiene:
```
VITE_SUPABASE_URL=<tu-url-de-supabase>
VITE_SUPABASE_ANON_KEY=<tu-clave-anonima>
```

**IMPORTANTE**: No subas el archivo `.env` a GitHub. Ya está incluido en `.gitignore`.

## Seguridad

- Row Level Security (RLS) habilitado en todas las tablas
- Políticas de acceso basadas en autenticación
- Validación de permisos en operaciones CRUD
- Protección contra inyección SQL

## Soporte

Para reportar problemas o sugerencias, crea un issue en el repositorio de GitHub.

## Licencia

MIT
