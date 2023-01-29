export interface Environment {
  api: {
    metadataService: string;
  };
}

export interface IAttribute {
  name: string;
  displayName: string;
  type: string;
  isGlobalFilter?: boolean;
  isFilterable: boolean;
  filterType?: string;
  displayInSearchResults: boolean;
  displayInSearchDetails: boolean;
  identity?: boolean;
  displaySequence: number;
  mapLargeAttribute: string;
}

export interface ICategory {
  name: string;
  displayName: string;
  displaySequence: number;
  displayInMap: boolean;
  searchable: boolean;
  selectable: boolean;
  displayIcon: string;
  displayTitleAttribute: string;
  displaySubtitle: string;
  attributes: IAttribute[];
  mapLargeTable: string;
}

export interface IOppotunitiesMetadata {
  assetTypes: string[];
  deliveryTypes: string[];
  offerTypes: string[];
  contractTypes: string[];
  phaseTypes: string[];
}
