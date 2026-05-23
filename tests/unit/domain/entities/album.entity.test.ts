import { Album } from '../../../../src/domain/entities/album.entity';

describe('Album', () => {
  describe('create', () => {
    it('should create an active album', () => {
      const album = Album.create({
        name: 'FIFA World Cup 2026',
        year: 2026,
        tournamentType: 'world_cup',
        totalStickers: 1005,
        specialStickers: 45,
      });

      expect(album.name).toBe('FIFA World Cup 2026');
      expect(album.year).toBe(2026);
      expect(album.tournamentType).toBe('world_cup');
      expect(album.totalStickers).toBe(1005);
      expect(album.specialStickers).toBe(45);
      expect(album.isActive).toBe(true);
      expect(album.id).toBeDefined();
    });

    it('should create album with description and image', () => {
      const album = Album.create({
        name: 'FIFA World Cup 2026',
        year: 2026,
        tournamentType: 'world_cup',
        totalStickers: 1005,
        specialStickers: 45,
        description: 'Official sticker album',
        imageUrl: 'https://example.com/cover.jpg',
      });

      expect(album.description).toBe('Official sticker album');
      expect(album.imageUrl).toBe('https://example.com/cover.jpg');
    });
  });

  describe('constructor with explicit values', () => {
    it('should create inactive album', () => {
      const album = new Album({
        id: 'album-fixed',
        name: 'Test Album',
        year: 2025,
        tournamentType: 'test',
        totalStickers: 100,
        specialStickers: 10,
        isActive: false,
      });

      expect(album.id).toBe('album-fixed');
      expect(album.isActive).toBe(false);
    });
  });

  describe('completionPercentage', () => {
    it('should return 0', () => {
      const album = Album.create({
        name: 'Test',
        year: 2026,
        tournamentType: 'test',
        totalStickers: 100,
        specialStickers: 10,
      });

      expect(album.completionPercentage).toBe(0);
    });
  });
});
