import { Sticker } from '../../domain/entities/sticker.entity';
import { StickerDTO, StickerDetailDTO } from '../dtos/sticker.dto';

import { RarityValue } from '../../domain/value-objects/rarity.vo';

interface StickerRaw extends Record<string, unknown> {
  id: string;
  album_id: string;
  number: number;
  player_id?: string | null;
  team_id?: string | null;
  sticker_type_id: string;
  rarity: string;
  image_url: string;
  image_thumbnail?: string | null;
  is_special: boolean;
  special_attribute?: string | null;
  created_at: string;
  players?: { name: string; position: string; jersey_number: number } | null;
  teams?: { name: string; code: string; flag_url: string } | null;
  sticker_types?: { name: string } | null;
  albums?: { name: string } | null;
}

export class StickerMapper {
  toDTO(sticker: Sticker, context?: {
    playerName?: string | null;
    teamName?: string | null;
    teamFlag?: string | null;
    stickerTypeName?: string;
    state?: 'missing' | 'obtained' | 'duplicate';
    duplicateCount?: number;
  }): StickerDTO {
    return {
      id: sticker.id,
      albumId: sticker.albumId,
      number: sticker.number,
      playerId: sticker.playerId || null,
      playerName: context?.playerName || null,
      teamId: sticker.teamId || null,
      teamName: context?.teamName || null,
      teamFlag: context?.teamFlag || null,
      stickerTypeId: sticker.stickerTypeId,
      stickerTypeName: context?.stickerTypeName || '',
      rarity: sticker.rarity.value,
      rarityLabel: sticker.rarity.label,
      imageUrl: sticker.imageUrl,
      imageThumbnail: sticker.imageThumbnail || null,
      isSpecial: sticker.isSpecial,
      specialAttribute: sticker.specialAttribute || null,
      state: context?.state || 'missing',
      duplicateCount: context?.duplicateCount || 0,
      createdAt: sticker.createdAt.toISOString(),
    };
  }

  toDetailDTO(sticker: Sticker, context?: {
    playerName?: string | null;
    playerPosition?: string | null;
    playerJerseyNumber?: number | null;
    teamName?: string | null;
    teamFlag?: string | null;
    stickerTypeName?: string;
    confederation?: string | null;
    albumName?: string;
    state?: 'missing' | 'obtained' | 'duplicate';
    duplicateCount?: number;
  }): StickerDetailDTO {
    const base = this.toDTO(sticker, context);
    return {
      ...base,
      playerPosition: context?.playerPosition || null,
      playerJerseyNumber: context?.playerJerseyNumber || null,
      confederation: context?.confederation || null,
      albumName: context?.albumName || '',
    };
  }

  fromPersistence(raw: StickerRaw, _userState?: { owned: boolean; duplicates: number }): Sticker {
    const sticker = new Sticker({
      id: raw.id,
      albumId: raw.album_id,
      number: raw.number,
      playerId: raw.player_id || undefined,
      teamId: raw.team_id || undefined,
      stickerTypeId: raw.sticker_type_id,
      rarity: raw.rarity as RarityValue,
      imageUrl: raw.image_url,
      imageThumbnail: raw.image_thumbnail || undefined,
      isSpecial: raw.is_special,
      specialAttribute: raw.special_attribute || undefined,
      createdAt: new Date(raw.created_at),
    });

    return sticker;
  }

  toPersistence(sticker: Sticker): Record<string, unknown> {
    return {
      id: sticker.id,
      album_id: sticker.albumId,
      number: sticker.number,
      player_id: sticker.playerId || null,
      team_id: sticker.teamId || null,
      sticker_type_id: sticker.stickerTypeId,
      rarity: sticker.rarity.value,
      image_url: sticker.imageUrl,
      image_thumbnail: sticker.imageThumbnail || null,
      is_special: sticker.isSpecial,
      special_attribute: sticker.specialAttribute || null,
    };
  }
}

export const stickerMapper = new StickerMapper();
