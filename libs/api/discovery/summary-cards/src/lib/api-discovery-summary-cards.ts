export interface SummaryCardsRequest {
  recordIds: string[]
}

export interface SummaryCardsResponse {
  results: SummaryCard[];
}

export interface SummaryCard {
  recordId: string;
  documents: DocumentRelationships;
  wellborelogs: WellBoreLogRelationships;
  seismic2d: Seismic2dRelashionsips;
}

export interface DocumentRelationships {
  hasDocuments: boolean;
  count: number;
}

export interface WellBoreLogRelationships {
  hasWellboreLog: boolean;
  count: number;
}

export interface Seismic2dRelashionsips {
  has2dBulk: boolean;
  count: number;
}