export interface ICategory {
  id?: string;
  name: string;
  displayName: string;
  displaySequence: number;
  zIndex: number;
  displayInMap: boolean;
  primaryKeyCol: string;
  searchable?: boolean;
  selectable: boolean;
  displayIcon: string;
  displayTitleAttribute: string;
  displayRatingAttribute?: string;
  displaySubtitle: string;
  entityIcon?: string;
  displayColorAttribute?: string;
  displayColors?: Array<{
    value: string;
    color: string;
  }>;
  mapLargeTable: string;
  attributes: Array<{
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
  }>;
  hideLayerinPanel?: boolean;
  toggelMergedLayer?: boolean;
  isXchangeLayer?: boolean;
}

export interface IMarketingRepresentation {
  shapeType: string;
  layerName: string;
  displayName: string;
  maplargeTable: string;
  primaryKey: string;
  icon: string;
}
