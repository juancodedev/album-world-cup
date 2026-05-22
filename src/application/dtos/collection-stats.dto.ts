export interface CollectionStatsDTO {
  totalStickers: number;
  ownedStickers: number;
  missingStickers: number;
  duplicateStickers: number;
  totalDuplicates: number;
  progressPercentage: number;
  completePercentage: number;
  isComplete: boolean;
  byTeam: TeamStatsDTO[];
  byRarity: RarityStatsDTO[];
  recentlyAdded: number;
}

export interface TeamStatsDTO {
  teamId: string;
  teamName: string;
  teamFlag: string | null;
  total: number;
  owned: number;
  progressPercentage: number;
}

export interface RarityStatsDTO {
  rarity: string;
  rarityLabel: string;
  total: number;
  owned: number;
  progressPercentage: number;
}
