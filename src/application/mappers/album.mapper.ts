import { Album } from '../../domain/entities/album.entity';
import { AlbumDTO, CreateAlbumDTO } from '../dtos/album.dto';

export class AlbumMapper {
  toDTO(album: Album): AlbumDTO {
    return {
      id: album.id,
      name: album.name,
      year: album.year,
      tournamentType: album.tournamentType,
      description: album.description || null,
      imageUrl: album.imageUrl || null,
      totalStickers: album.totalStickers,
      specialStickers: album.specialStickers,
      isActive: album.isActive,
      createdAt: album.createdAt.toISOString(),
      updatedAt: album.updatedAt.toISOString(),
    };
  }

  toDomain(dto: CreateAlbumDTO): Album {
    return Album.create({
      name: dto.name,
      year: dto.year,
      tournamentType: dto.tournamentType,
      description: dto.description,
      imageUrl: dto.imageUrl,
      totalStickers: dto.totalStickers,
      specialStickers: dto.specialStickers || 0,
    });
  }

  toPersistence(album: Album): Record<string, unknown> {
    return {
      id: album.id,
      name: album.name,
      year: album.year,
      tournament_type: album.tournamentType,
      description: album.description,
      image_url: album.imageUrl,
      total_stickers: album.totalStickers,
      special_stickers: album.specialStickers,
      is_active: album.isActive,
      created_at: album.createdAt.toISOString(),
      updated_at: album.updatedAt.toISOString(),
    };
  }
}

export const albumMapper = new AlbumMapper();
