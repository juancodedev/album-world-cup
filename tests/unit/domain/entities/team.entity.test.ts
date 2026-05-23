import { Team } from '../../../../src/domain/entities/team.entity';

describe('Team', () => {
  describe('create', () => {
    it('should create a team with required props', () => {
      const team = Team.create({
        albumId: 'album-1',
        confederationId: 'confed-1',
        name: 'Mexico',
        code: 'MEX',
      });

      expect(team.name).toBe('Mexico');
      expect(team.code).toBe('MEX');
      expect(team.albumId).toBe('album-1');
      expect(team.confederationId).toBe('confed-1');
      expect(team.flagUrl).toBeUndefined();
      expect(team.groupStage).toBeUndefined();
      expect(team.id).toBeDefined();
      expect(team.createdAt).toBeInstanceOf(Date);
    });

    it('should create a team with all optional props', () => {
      const team = Team.create({
        albumId: 'album-1',
        confederationId: 'confed-1',
        name: 'Brazil',
        code: 'BRA',
        flagUrl: 'https://example.com/bra.png',
        groupStage: 'C',
      });

      expect(team.flagUrl).toBe('https://example.com/bra.png');
      expect(team.groupStage).toBe('C');
    });
  });

  describe('constructor with explicit id', () => {
    it('should use provided id', () => {
      const team = new Team({
        id: 'fixed-id',
        albumId: 'album-1',
        confederationId: 'confed-1',
        name: 'Argentina',
        code: 'ARG',
      });

      expect(team.id).toBe('fixed-id');
    });
  });
});
