import { IMlConnectionInfo } from "@apollo/app/services/opportunity";

export interface State {
  opportunities: any[];
  filteredOpportunities: any[];
  selectedOpportunityId: string;
  searchTerm: string;
  whereClause: any;
  selectedLassoArea: any;
  error: string;
  selectedLayers: string[];
  currentPageNumber: number;
  totalOpportunities: number;
  filterSelected: boolean;
  isShapeSelected: boolean;
  showLoader: boolean;
  mlConnectionInfo: IMlConnectionInfo;
  activeTables: any[];
  isMapLoaded: boolean;
  isLoading: boolean;
}

export const initialState: State = {
  opportunities: [],
  selectedOpportunityId: null,
  filteredOpportunities: null,
  searchTerm: '',
  selectedLassoArea: '',
  whereClause: [],
  error: null,
  selectedLayers: [],
  currentPageNumber: 1,
  totalOpportunities: 0,
  filterSelected: false,
  isShapeSelected: false,
  showLoader: false,
  mlConnectionInfo: null,
  activeTables: [],
  isMapLoaded: false,
  isLoading: false
};
