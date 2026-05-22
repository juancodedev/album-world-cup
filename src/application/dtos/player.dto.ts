export interface PlayerDTO {
  id: string;
  teamId: string;
  teamName: string;
  name: string;
  position: string;
  jerseyNumber: number | null;
  photoUrl: string | null;
  stats: Record<string, unknown> | null;
}
