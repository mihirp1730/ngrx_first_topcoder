export interface State {
  map: {
    center: {
      lat: number;
      lng: number;
    };
    isLoading: boolean;
    selection: {
      spatialQuery: string;
    };
    zoom: number;
    zoomToRadius: {
      [zoomLevel: string]: number;
    };
  };
  showingHamburgerMenu: boolean;
  showingLayerPanel: boolean;
  showingRecordDetailsPanel: boolean;
  showingRecordListPanel: boolean;
  selectedOpportunityId: string;
  showingBasemap: boolean;
  useMapExtents: boolean;
  layersOrFiltersHaveChanged: boolean;
  searchTerm: string;
  dataOpportunityWorkflow: boolean;
  openModularChat: boolean;
}

export const initialState: State = {
  map: {
    center: {
      lat: null,
      lng: null
    },
    isLoading: true,
    selection: {
      spatialQuery: null
    },
    zoom: null,
    zoomToRadius: {}
  },
  showingHamburgerMenu: false,
  showingLayerPanel: false,
  showingRecordDetailsPanel: false,
  showingRecordListPanel: false,
  selectedOpportunityId: null,
  showingBasemap: false,
  useMapExtents: false,
  layersOrFiltersHaveChanged: false,
  searchTerm: null,
  dataOpportunityWorkflow: false,
  openModularChat: false
};
