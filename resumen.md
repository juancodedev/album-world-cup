Resumen completo del proyecto: Album World Cup 2026
1. Estructura del proyecto -- Directorios principales y su propósito
album-world-cup/
├── src/
│   ├── app/                        # Next.js App Router (rutas, layouts, pages)
│   │   ├── (auth)/                 # Route group: páginas de autenticación (login)
│   │   ├── (dashboard)/            # Route group: páginas protegidas con layout compartido
│   │   │   ├── dashboard/          # Página principal
│   │   │   ├── tracker/            # Tracker de stickers + missing + ranking
│   │   │   ├── collection/         # Vista de colección
│   │   │   ├── statistics/         # Estadísticas
│   │   │   ├── share/              # Compartir colección
│   │   │   ├── search/             # Búsqueda
│   │   │   └── settings/           # Configuración
│   │   ├── (public)/               # Route group: páginas públicas
│   │   │   └── tracker/ranking/    # Ranking público (sin login)
│   │   ├── admin/                  # Panel de administración (restringido)
│   │   ├── api/                    # API routes (REST endpoints)
│   │   ├── auth/callback/          # OAuth callback handler
│   │   ├── expired/                # Página de acceso expirado
│   │   ├── layout.tsx              # Layout raíz
│   │   └── providers.tsx           # Providers del lado del cliente
│   │
│   ├── application/                # Capa de aplicación (casos de uso, servicios, DTOs, mapeadores)
│   │   ├── use-cases/              # Casos de uso (collection, search, share, auth, sticker, album, account)
│   │   ├── services/               # Servicios de aplicación (Collection, Search, Statistics, Share, Auth)
│   │   ├── dtos/                   # Objetos de transferencia de datos
│   │   ├── mappers/                # Mapeadores entidad <-> DTO
│   │   └── validators/             # Validadores de entrada
│   │
│   ├── domain/                     # Capa de dominio (pura, sin dependencias externas)
│   │   ├── entities/               # Entidades (Sticker, Album, Team, Player, User, Account, etc.)
│   │   ├── value-objects/          # Objetos valor (Rarity, StickerType, StickerState, Progress, etc.)
│   │   ├── repositories/           # Interfaces de repositorio (contratos)
│   │   ├── specifications/         # Patrón Specification (RaritySpecification, etc.)
│   │   ├── errors/                 # Errores de dominio (NotFoundError, ValidationError, etc.)
│   │   └── types/                  # Tipos compartidos (Result<T,E>, Success, Failure)
│   │
│   ├── infrastructure/             # Infraestructura (implementaciones concretas)
│   │   ├── auth/                   # Adaptador de autenticación (SupabaseAuthAdapter)
│   │   ├── database/               # Configuración de Supabase (client, server, config, migrations)
│   │   ├── repositories/           # Implementaciones de repositorios (Supabase*Repository)
│   │   ├── storage/                # Optimización de imágenes
│   │   └── seed/                   # Scripts de seed
│   │
│   ├── presentation/               # Capa de presentación (React components, hooks, providers)
│   │   ├── components/             # Componentes UI
│   │   │   ├── common/             # Header, Sidebar, BottomNav, LoadingSpinner, ErrorBoundary, etc.
│   │   │   ├── tracker/            # GroupCard, TeamRow, StickerGrid, SpecialCard, etc.
│   │   │   ├── collection/         # CollectionStats, AlbumProgress, TeamSection, etc.
│   │   │   ├── stickers/           # StickerCard, RareStickerBadge
│   │   │   ├── dashboard/          # DashboardHero, RecentStickers, ProgressCard
│   │   │   ├── search/             # SearchBar, SearchResults, FilterDrawer
│   │   │   └── share/              # ShareModal
│   │   ├── hooks/                  # (useStickers, useCollection, useTracker, useAuth, etc.)
│   │   ├── layouts/                # DashboardLayout
│   │   └── providers/              # AuthProvider, QueryClientProvider
│   │
│   ├── components/ui/              # Componentes shadcn/ui (button, card, input, dialog, etc.)
│   ├── config/                     # Configuración de entorno (env.ts con validación Zod)
│   ├── di/                         # Contenedor DI (DIContainer singleton)
│   ├── lib/                        # Utilidades (cn() para clsx+tailwind-merge)
│   ├── shared/                     # Código compartido
│   │   ├── constants/              # Constantes (rutas, rarity, tipos sticker, confederaciones, banderas, tracker)
│   │   ├── schemas/                # Esquemas Zod (sticker, collection, album, search, share)
│   │   └── utils/                  # Utilidades compartidas (format, debounce)
│   ├── middleware.ts               # Next.js middleware (refresco de sesión Supabase)
│   └── utils/supabase/             # Clientes Supabase (client, server, middleware)
│
├── supabase/                       # Configuración de Supabase local
│   └── migrations/                 # Migraciones de base de datos (9 archivos)
├── tests/                          # Tests unitarios e integración
│   ├── unit/                       # Tests de dominio (value objects, entities) y servicios
│   └── integration/                # Tests de integración (use cases)
├── scripts/                        # Scripts de seed (seed-worldcup.mjs)
├── .github/workflows/              # CI/CD (deploy.yml)
├── open-next.config.ts             # Configuración de OpenNext para Cloudflare
└── wrangler.jsonc                  # Configuración de Wrangler (Cloudflare Workers)
2. Patrón de arquitectura -- Clean Architecture (Arquitectura Limpia)
El proyecto sigue estrictamente Clean Architecture (Arquitectura Limpia hexagonal) con 4 capas que dependen hacia adentro:
┌─────────────────────────────────────────────────────┐
│  Presentation (React/Next.js)                       │
│  → componentes, hooks, providers, layouts             │
│  → depende de Application y DI                        │
├─────────────────────────────────────────────────────┤
│  Application (use-cases, services, DTOs, mappers)   │
│  → orquesta casos de uso, mapea DTOs                  │
│  → depende de Domain (repositories interfaces)        │
├─────────────────────────────────────────────────────┤
│  Domain (entities, value-objects, repo interfaces)  │
│  → lógica de negocio pura, sin dependencias externas  │
│  → cero imports de infraestructura                    │
├─────────────────────────────────────────────────────┤
│  Infrastructure (Supabase repos, auth adapter)      │
│  → implementaciones concretas de interfaces           │
│  → depende de Domain                                  │
└─────────────────────────────────────────────────────┘
Patrones de diseño identificados:
- Repository Pattern -- interfaces en domain/repositories/, implementaciones en infrastructure/repositories/
- Specification Pattern -- domain/specifications/sticker.specification.ts
- Adapter Pattern -- infrastructure/auth/supabase-auth.adapter.ts
- Value Object Pattern -- Rarity, StickerType, StickerState, Progress, ShareCode, Confederation
- Result Pattern -- domain/types/index.ts (Success/Failure clases)
- Mapper Pattern -- application/mappers/ (transformación dominio <-> DTO)
- Service Layer -- application/services/ (orquesta múltiples casos de uso)
- Dependency Injection -- contenedor DI manual en src/di/container.ts
- Singleton Pattern -- contenedor DI, adaptador auth, clientes Supabase
3. Pruebas -- Jest + React Testing Library
Aspecto	Detalle
Framework	Jest (v30) con next/jest
Ubicación	tests/unit/, tests/integration/, src/**/__tests__/
Convención de nombres	*.test.ts
Config	jest.config.js -- busca en <rootDir>/src/**/__tests__/**/*.test.ts y <rootDir>/tests/**/*.test.ts
Total	126 tests, 20 suites (según README)
Entorno	testEnvironment: 'node'
Mocking	Mocks manuales con jest.Mocked<T>
Cobertura	Value Objects (rarity, progress, sticker-state, sticker-type), Domain Entities (user-collection, team, sticker, user, album, account, account-member), Use Cases (add-sticker, get-shared-collection), Services (statistics)
Alias	@/ mapeado a ./src/
4. Manejo de estado
Estado del servidor (datos de API): TanStack React Query v5
- Cliente Query -- Configurado en QueryClientProvider con staleTime: 60s, retry: 1, refetchOnWindowFocus: false
- Hooks personalizados -- Todos los hooks de presentación (useStickers, useCollection, useTracker, useStatistics, useSearch, useShare) envuelven useQuery/useMutation de React Query
- Optimistic Updates -- useCollection implementa actualizaciones optimistas para añadir/remover stickers con rollback en error
- Invalidación -- Invalidación en cascada de queries relacionadas al mutar (coleccion, stats, progreso, etc.)
- Estrategia de debounce -- useTracker acumula toggles y los descarga cada 5 segundos
Estado de autenticación: React Context (AuthProvider)
Estado local: useState + useRef para UI state (tabs, filtros, búsqueda, carga)
5. Patrones de componentes -- shadcn/ui + Tailwind CSS v4
shadcn/ui:
- components.json confirma shadcn/ui con estilo "base-nova", iconos lucide-react, RSC habilitado
- Componentes instalados: button, card, input, dialog, sheet, dropdown-menu, avatar, badge, progress, skeleton, separator, scroll-area, select, tabs, tooltip, label, sonner (toast)
Organización de componentes:
components/ui/          → Componentes base shadcn (genéricos, reutilizables)
presentation/components/common/  → Componentes compartidos de la app
presentation/components/tracker/ → Componentes específicos del tracker
presentation/components/collection/ → Componentes de colección
presentation/components/dashboard/ → Componentes del dashboard
presentation/components/stickers/  → Componentes de stickers
presentation/components/search/    → Componentes de búsqueda
presentation/components/share/     → Componentes para compartir
Patrones de UI:
- DashboardLayout con Sidebar (desktop) + BottomNav (mobile) + Header -- responsive
- Acceso condicional con useAccessGuard -- verifica trial/subscription
- Header muestra avatar, nombre, badge de trial restante
- Placeholder SVG para stickers sin imagen
- Esqueletos shimmer para estados de carga
- Componentes vacíos (EmptyState) para ausencia de datos
- ErrorBoundary para manejo de errores
6. Enrutamiento -- App Router con grupos de rutas
Estructura de grupos de ruta:
(auth)/     → Sin layout adicional, páginas públicas de auth (/login)
(dashboard)/ → Layout protegido que verifica sesión (redirect a /login si no autenticado)
(public)/   → Páginas públicas (/tracker/ranking)
admin/      → Layout con verificación de email admin (solo cl.jmunoz@gmail.com)
api/        → API routes REST
auth/       → Callback OAuth
expired/    → Página de acceso expirado
share/      → Páginas públicas de colección compartida
Protección de rutas:
- (dashboard)/layout.tsx -- Server component que verifica supabase.auth.getUser(), redirect a /login si no hay sesión
- admin/layout.tsx -- Verifica user.email === ADMIN_EMAIL, redirect a /dashboard si no es admin
- DashboardLayout del lado del cliente -- usa useAccessGuard() para verificar acceso trial/subscription
- Páginas individuales también verifican auth del lado del cliente con redirección
API Routes:
- GET /api/teams -- Lista de equipos
- GET/POST /api/collection -- CRUD de colección de usuario
- GET /api/ranking -- Ranking público (sin auth)
- GET /api/share -- Colección compartida por código
- GET /api/access/check -- Verificación de acceso trial/subscription
- GET /api/user/profile -- Perfil de usuario
- POST /api/stickers -- Consulta de stickers
- Rutas admin: /api/access/admin/users, /api/collection, /api/ranking, /api/profile
Middleware: src/middleware.ts -- Refresca sesión de Supabase en cada request, excluyendo activos estáticos.
7. CI/CD -- GitHub Actions + Cloudflare Workers
Archivo: .github/workflows/deploy.yml
Flujo:
1. Trigger: Push a master o workflow_dispatch manual
2. Setup: Checkout + pnpm setup + Node 22 + cache de pnpm
3. Install: pnpm install
4. Build: pnpm run build:cf (usa @opennextjs/cloudflare)
5. Secret: SUPABASE_SERVICE_ROLE_KEY inyectado como secreto de Wrangler
6. Deploy: pnpm run deploy:cf a Cloudflare Workers
Secretos de entorno:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- NEXT_PUBLIC_APP_URL
- SUPABASE_SERVICE_ROLE_KEY
- CLOUDFLARE_API_TOKEN
- CLOUDFLARE_ACCOUNT_ID
8. Infraestructura
Supabase:
- URL: https://qwlopuygvhkopgsatdcl.supabase.co
- Auth Providers: Google OAuth, Email/Password, Magic Link
- Base de datos: PostgreSQL con extensiones pg_trgm (búsqueda de texto), pgcrypto, uuid-ossp
- Row Level Security (RLS): Habilitado en todas las tablas con políticas detalladas basadas en membresía de cuenta (get_account_ids_for_user())
- Storage: Bucket público stickers para imágenes de stickers
Cloudflare Workers + OpenNext:
- wrangler.jsonc -- Configura worker con nodejs_compat, assets binding, images binding
- open-next.config.ts -- Configuración por defecto de OpenNext para Cloudflare
- Scripts de deploy: pnpm build:cf + pnpm deploy:cf
- Server External Packages: @supabase/ssr marcado como externo para evitar bundling
Tablas de base de datos:
Tabla	Propósito
users	Usuarios de la plataforma (sincronizados con auth.users)
accounts	Cuentas multi-tenant (personales/grupales)
account_members	Membresías de cuenta con roles (owner/admin/member)
albums	Álbumes (ej. Mundial 2026)
teams	Equipos (48 selecciones)
players	Jugadores
stickers	Láminas (1005 total) con rarity, tipo, relaciones
sticker_types	Tipos de lámina (player, team, stadium, etc.)
user_stickers	Stickers que posee un usuario (con cantidad)
sticker_duplicates	Stickers repetidos (con cantidad)
shared_collections	Colecciones compartidas públicamente
confederations	Confederaciones (CONMEBOL, UEFA, etc.)
categories	Categorías de stickers
audit_logs	Registro de auditoría
access_logs	Registro de acceso trial/subscription
Funciones de BD destacadas:
- create_personal_account() -- Trigger que crea cuenta personal al insertar usuario
- handle_new_auth_user() -- Sincroniza auth.users -> public.users
- get_account_ids_for_user() -- Obtiene IDs de cuenta para el usuario actual
- get_collection_progress() -- Calcula progreso de colección
- generate_share_code() -- Genera código de compartir aleatorio
Migraciones: 9 migraciones en supabase/migrations/ + migraciones de infraestructura en src/infrastructure/database/migrations/
9. Contenedor DI
Archivo: src/di/container.ts
Patrón: Contenedor singleton manual con lazy initialization y caching de instancias
Estructura:
class DIContainer {
  private instances = new Map<string, unknown>();
  private supabaseClient = null;
  
  // Cliente Supabase
  getSupabaseClient()
  
  // Repositorios (10) -- get*Repository()
  // Casos de uso (19) -- get*UseCase()  
  // Servicios (5) -- get*Service()
  
  // Factory method privado con caching
  private getInstance(key, factory)
}
export const container = new DIContainer();
Árbol de dependencias:
Supabase Client
  → Repositorios (inyectan SupabaseClient)
    → Casos de uso (inyectan repositorios + mappers)
      → Servicios (inyectan casos de uso)
        → Hooks de presentación (obtienen servicios/casos de uso del contenedor)
Los hooks de React Query llaman al contenedor directamente:
// Ejemplo: useCollection.ts
const collectionService = container.getCollectionService();
Los API routes instancian repositorios y casos de uso directamente:
// En API routes, cada handler crea sus propias dependencias
const repo = new SupabaseUserCollectionRepository(supabase);
const useCase = new AddStickerUseCase(repo, stickerRepo, mapper);
10. Base de datos -- Migraciones y tablas clave
Migraciones de Supabase (orden cronológico):
Migración	Fecha
20260523014718_remote_schema.sql	Mayo 23
20260523020000_storage_setup.sql	Mayo 23
20260523020001_backfill_missing_accounts.sql	Mayo 23
20260523020002_auth_user_trigger.sql	Mayo 23
20260523020003_albums_rls_policy.sql	Mayo 23
20260523030000_albums_admin_policies.sql	Mayo 23
20260523220625_subscription_access.sql	Mayo 23
20260524001819_remote_schema.sql	Mayo 24
20260601000000_seed_worldcup_2026.sql	Junio 1
Tablas clave del dominio:
- stickers (1005 registros) -- 5 rarezas (common, rare, legendary, holographic, limited), 7 tipos, relaciones a equipos/jugadores/álbumes
- teams (48 selecciones) -- con campos group_stage (A-L), confederation_id, flag_url
- user_stickers -- Relación N:M entre usuarios y stickers con quantity_owned, account_id para multi-tenant
- accounts + account_members -- Multi-tenancy: una cuenta por usuario (creada automáticamente), soporte para cuentas grupales
11. Flujo de autenticación
Arquitectura de autenticación:
Cliente (Browser)                    Servidor (Next.js)              Supabase
─────────────────                    ──────────────────             ────────
AuthProvider (Context)               middleware.ts                    Auth Service
  ↓                                    ↓                               ↓
useAuth() hook                       updateSession()                 OAuth / Email
  ↓                                    ↓                               ↓
SupabaseAuthAdapter                  createServerSideClient()        JWT Tokens
  (onAuthStateChange)                  (cookies SSR)                   ↓
  ↓                                    ↓                           public.users
signInWithGoogle()                   auth/callback/route.ts          (sincronizado)
signInWithEmail()                      ↓
signOut()                            Intercambio código por sesión
                                       Creación de usuario en public.users
Flujo detallado:
1. Middleware global (src/middleware.ts): Ejecuta updateSession() en cada request para refrescar la sesión de Supabase (usa @supabase/ssr para manejo de cookies).
2. AuthProvider (presentation/providers/AuthProvider.tsx):
   - Contexto React que envuelve la app
   - Usa SupabaseAuthAdapter (singleton lazy) para interactuar con Supabase Auth
   - Escucha onAuthStateChange para mantener sesión sincronizada
   - Expone métodos: signInWithGoogle(), signInWithEmail(), signUp(), signOut()
3. AuthAdapter (infrastructure/auth/supabase-auth.adapter.ts):
   - Patrón adaptador que abstrae Supabase Auth
   - Proporciona interfaz limpia para el AuthProvider
   - Maneja Google OAuth, Email/Password, Magic Link
   - Normaliza AuthSession con user.id, email, fullName, avatarUrl
4. Auth Callback (app/auth/callback/route.ts):
   - Intercambia código OAuth por sesión
   - Sincroniza usuario con tabla public.users
   - Redirige a /dashboard o página solicitada
5. Protección del lado del servidor:
   - (dashboard)/layout.tsx verifica supabase.auth.getUser() antes de renderizar
   - admin/layout.tsx además verifica email admin
   - API routes verifican auth.getUser() para endpoints protegidos
6. Protección del lado del cliente:
   - Cada página dashboard verifica useAuth() y redirige con useRouter().replace('/login')
   - DashboardLayout usa useAccessGuard() para verificar estado de trial/subscription
7. Acceso trial/subscription:
   - GET /api/access/check verifica access_status del usuario (trial/active/expired/disabled)
   - Los nuevos usuarios obtienen automáticamente 10 días de prueba
   - Al expirar, se redirige a /expired solicitando pago
Formas de autenticación soportadas:
- Google OAuth
- Email + Password
- Magic Link (email sin contraseña)