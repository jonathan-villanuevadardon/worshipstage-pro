# WorshipStage Pro

Aplicación React + Express para administrar iglesias, equipos, servicios, canciones y repertorios. La autenticación, Postgres, Row Level Security, Realtime y Storage funcionan en Supabase.

## Requisitos

- Node.js 22 o posterior
- npm
- Un proyecto Supabase

## Configuración

Copia `.env.example` a `.env.production` para Docker. Las claves `SUPABASE_PUBLISHABLE_KEY` y `VITE_SUPABASE_PUBLISHABLE_KEY` son públicas por diseño; nunca agregues una clave `service_role` o `sb_secret_...` al frontend.

Variables principales:

- `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY`: conexión de la API Express.
- `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`: conexión del navegador.
- `VITE_API_SERVER_URL`: ruta pública de Express; por defecto `/hcgi/api`.
- `CORS_ORIGIN`: orígenes web autorizados, separados por comas.

El esquema reproducible está en `supabase/migrations/`. Todas las tablas públicas tienen RLS. El primer usuario registrado se convierte en `super_admin`; los demás registros abiertos reciben el rol `volunteer`.

En el panel de Supabase configura **Authentication > URL Configuration** con la URL del sitio y agrega `https://TU_DOMINIO/reset-password` a Redirect URLs. Si mantienes la confirmación de correo habilitada, configura también un proveedor SMTP para producción.

## Desarrollo y verificación

```bash
npm ci
npm run dev
```

Antes de publicar:

```bash
npm run check
```

## VPS con Docker Compose

```bash
docker compose --env-file .env.production -f compose.hostinger.yml up -d --build
```

El stack levanta Caddy y la API Node.js. La base de datos y Auth permanecen administrados por Supabase; no se necesita un volumen local de base de datos.

Comprobación:

```bash
curl -fsS https://TU_DOMINIO/hcgi/api/health
```

## Hosting Web/Cloud de Hostinger conectado a Git

El hosting compartido no ejecuta el código fuente de Vite. El workflow
`.github/workflows/publish-hostinger.yml` compila cada cambio de `main` y publica
solamente los archivos web listos en la rama `hostinger`.

En **hPanel > Sitios web > Administrar > Git** configura:

- Repositorio: `https://github.com/jonathan-villanuevadardon/worshipstage-pro.git`
- Rama: `hostinger`
- Ruta de instalación: vacía, para usar `/public_html`

Si la integración actual apunta a `main`, elimínala y vuelve a crearla apuntando a
`hostinger`; luego activa la implementación automática. En `public_html` deben quedar
`index.html`, `.htaccess`, `assets/` y los demás archivos compilados, no las carpetas
`apps/`, `deploy/` o `supabase/` del código fuente.

Si Hostinger detecta el despliegue como aplicación Node.js, la rama también incluye
un `package.json` mínimo. Usa `npm run build` como comando de compilación y
`npm start` como comando de inicio; el proceso escucha automáticamente el puerto
indicado por Hostinger mediante `PORT`.

Esta modalidad sirve el frontend y conecta directamente con Supabase. Las funciones
que pasan por la API Express (`/hcgi/api`, incluida la IA integrada) requieren el VPS
con Docker Compose o una URL de API externa configurada en la variable de repositorio
`VITE_API_SERVER_URL` antes de compilar.

La carpeta `apps/pocketbase/` se conserva únicamente como fuente histórica de la migración y no forma parte de los workspaces, scripts ni despliegues activos.
