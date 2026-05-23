export const ROUTES = {
  home: '/',
  login: '/login',
  callback: '/auth/callback',
  dashboard: '/dashboard',
  collection: '/collection',
  tracker: '/tracker',
  trackerMissing: '/tracker/missing',
  stickerDetail: (id: string) => `/collection/${id}`,
  statistics: '/statistics',
  settings: '/settings',
  share: (code: string) => `/share/${code}`,
} as const;
