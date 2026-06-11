export const SUPABASE_TABLES = {
  users: 'users',
  albums: 'albums',
  teams: 'teams',
  players: 'players',
  stickers: 'stickers',
  stickerTypes: 'sticker_types',
  userStickers: 'user_stickers',
  stickerDuplicates: 'sticker_duplicates',
  sharedCollections: 'shared_collections',
  confederations: 'confederations',
  auditLogs: 'audit_logs',
  accessLogs: 'access_logs',
  accounts: 'accounts',
  accountMembers: 'account_members',
  exchangeOffers: 'exchange_offers',
} as const;

export const SUPABASE_STORAGE = {
  stickers: 'stickers',
  avatars: 'avatars',
  teams: 'teams',
} as const;

export const ITEMS_PER_PAGE = 20;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
