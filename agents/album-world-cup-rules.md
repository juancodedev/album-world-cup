# Album World Cup 2026 — Rules & Architecture

## Architecture

Clean Architecture con 4 capas que dependen hacia adentro:

```
Presentation (React/Next.js) → Application (use-cases, DTOs) → Domain (entities, repo interfaces) ← Infrastructure (Supabase, repos)
```

- **Domain**: cero imports de infraestructura, lógica de negocio pura
- **Application**: orquesta casos de uso, mapea DTOs, depende solo de interfaces de Domain
- **Infrastructure**: implementa repositorios concretos (`Supabase*Repository`), inyecta cliente Supabase
- **Presentation**: componentes React, hooks, providers. Los hooks llaman al contenedor DI

## Project Structure

```
src/
├── app/                    # Next.js App Router
├── application/            # Use cases, services, DTOs, mappers
├── domain/                 # Entities, value-objects, repo interfaces
├── infrastructure/         # Supabase repos, auth adapter, migrations
├── presentation/           # Components, hooks, providers, layouts
├── components/ui/          # shadcn/ui components
├── di/                     # DI container (singleton)
└── middleware.ts
```

### Route Groups
- `(auth)/` — login sin layout extra
- `(dashboard)/` — layout protegido (server-side auth check)
- `(public)/` — páginas públicas (ranking)
- `admin/` — layout con verificación de email admin
- `api/` — REST endpoints

## Database (Supabase)

- **Migrations**: `supabase/migrations/` con formato timestamp, aplicar con `supabase db push`
- **RLS**: habilitado en todas las tablas. El service role key (`SUPABASE_SERVICE_ROLE_KEY`) bypass RLS
- **Funciones clave**: `handle_new_auth_user()` (trigger sincroniza auth→public users), `create_personal_account()` (trigger al insertar user)
- **Storage**: bucket público `stickers`
- El anon key solo ve datos del usuario actual (RLS). Para queries multi-user se necesita service role

## Components (shadcn/ui + Tailwind v4)

- Componentes base en `components/ui/` (shadcn: button, card, dialog, avatar, badge, etc.)
- Componentes de negocio en `presentation/components/<domain>/`
- DashboardLayout con Header + Sidebar (desktop) + BottomNav (mobile)
- `<img>` en vez de `next/image` (Supabase CDN ya sirve webp optimizado, evitar 400 errors)
- Placeholder SVG para stickers sin imagen
- Skeleton loaders para estados de carga

## State Management

- TanStack React Query v5 para datos del servidor (`staleTime: 60000`, `retry: 1`)
- React Context para auth (`AuthProvider`)
- Debounce de 5s en tracker (acumula toggles, descarga batch)

## Auth

- Supabase Auth (Google OAuth, Email/Password, Magic Link)
- `AuthProvider` wrapper → `useAuth()` hook
- Server-side: usar SIEMPRE `supabase.auth.getUser()` (NUNCA `getSession()` por seguridad)
- `(dashboard)/layout.tsx` verifica auth server-side con redirect a `/login`
- `admin/layout.tsx` verifica email === `'cl.jmunoz@gmail.com'`
- `DashboardLayout` usa `useAccessGuard()` para verificar trial/subscription

### Access Control (SaaS)
- 10 días de trial automáticos al primer login
- `GET /api/access/check` verifica estado (trial/active/expired/disabled)
- Admin email (`cl.jmunoz@gmail.com`) bypass total — nunca expira
- `access_logs` tabla para auditoría de cambios de estado
- Fail-open: si el endpoint de access check falla, permitir acceso

## DI Container

- Singleton manual en `src/di/container.ts`
- Repositorios → Casos de uso → Servicios (cascada)
- React Query hooks obtienen servicios del contenedor: `container.getXxxService()`
- API routes NO usan el contenedor DI — instancian repos y casos de uso directamente

## CI/CD (GitHub Actions → Cloudflare Workers)

Flujo en `.github/workflows/deploy.yml`:

1. Push a `master` o `workflow_dispatch`
2. Checkout + pnpm setup + Node 22
3. `pnpm build:cf` (OpenNext Cloudflare build)
4. `wrangler secret put SUPABASE_SERVICE_ROLE_KEY` (desde GitHub Secret)
5. `pnpm deploy:cf` (OpenNext Cloudflare deploy)

### Env vars requeridas
- `NEXT_PUBLIC_SUPABASE_URL` (público, en wrangler.jsonc vars)
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (en wrangler.jsonc vars)
- `NEXT_PUBLIC_APP_URL` (en wrangler.jsonc vars)
- `SUPABASE_SERVICE_ROLE_KEY` (GitHub Secret, NUNCA en wrangler.jsonc)
- `CLOUDFLARE_API_TOKEN` (GitHub Secret)
- `CLOUDFLARE_ACCOUNT_ID` (GitHub Secret)

### Deploy local (solo dev)
```bash
pnpm build:cf
pnpm deploy:cf
```

## Testing

- Jest v30, testEnvironment: node
- Tests en `tests/unit/`, `tests/integration/`, `src/**/__tests__/`
- Nombres: `*.test.ts`
- Mocking: `jest.Mocked<T>`

## Environment Variables (Local)

En `.env.local` (gitignored via `.env*` en `.gitignore`):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Migraciones (base de datos)

- Crear migración: `supabase migration new <name>`
- Aplicar: `supabase db push`
- Convención de nombres: `YYYYMMDDHHMMSS_description.sql`
