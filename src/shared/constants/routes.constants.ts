export const ROUTES = {
  home: '/',
  login: '/login',
  callback: '/auth/callback',
  dashboard: '/dashboard',
  collection: '/collection',
  stickerDetail: (id: string) => `/collection/${id}`,
  statistics: '/statistics',
  settings: '/settings',
  share: (code: string) => `/share/${code}`,
} as const;
