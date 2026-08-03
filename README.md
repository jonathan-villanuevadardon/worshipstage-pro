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

La carpeta `apps/pocketbase/` se conserva únicamente como fuente histórica de la migración y no forma parte de los workspaces, scripts ni despliegues activos.
