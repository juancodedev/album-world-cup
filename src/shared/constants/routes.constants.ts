export const ROUTES = {
  home: '/',
  login: '/login',
  callback: '/auth/callback',
  dashboard: '/tracker',
  tracker: '/tracker',
  trackerMissing: '/tracker/missing',
  settings: '/settings',
  share: (code: string) => `/share/${code}`,
} as const;
