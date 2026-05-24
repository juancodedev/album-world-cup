export const ROUTES = {
  home: '/',
  login: '/login',
  callback: '/auth/callback',
  dashboard: '/tracker',
  collection: '/collection',
  tracker: '/tracker',
  trackerMissing: '/tracker/missing',
  stickerDetail: (id: string) => `/collection/${id}`,
  statistics: '/statistics',
  settings: '/settings',
  share: (code: string) => `/share/${code}`,
} as const;
