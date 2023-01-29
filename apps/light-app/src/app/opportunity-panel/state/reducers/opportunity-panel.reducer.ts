import { createReducer, on } from '@ngrx/store';

import * as opportunityPanelActions from '../actions/opportunity-panel.actions';
import { initialState, State } from '../opportunity-panel.state';

export const opportunityPanelFeatureKey = 'opportunity-panel';

const _opportunityPanelReducer = createReducer(
  initialState,
  on(opportunityPanelActions.getOpportunitiesSuccess, (state, { opportunities, totalOpportunities }): State => {
    return {
      ...state,
      error: null,
      opportunities,
      totalOpportunities
    };
  }),
  on(opportunityPanelActions.getOpportunitiesFail, (state, { errorMessage }): State => {
    return {
      ...state,
      error: errorMessage,
      opportunities: []
    };
  }),
  on(opportunityPanelActions.setSelectedOpportunityId, (state, { opportunityId }): State => {
    return {
      ...state,
      selectedOpportunityId: opportunityId
    };
  }),
  on(opportunityPanelActions.setSearchTerm, (state, { searchTerm }): State => {
    return {
      ...state,
      searchTerm,
      currentPageNumber: 1
    };
  }),
  on(opportunityPanelActions.getFilteredOpportunitiesSuccess, (state, { filteredOpportunities, totalOpportunities }): State => {
    return {
      ...state,
      isLoading: false,
      filteredOpportunities,
      totalOpportunities
    };
  }),
  on(opportunityPanelActions.getFilteredOpportunitiesFail, (state, { errorMessage }): State => {
    return {
      ...state,
      filteredOpportunities: [],
      error: errorMessage
    };
  }),
  on(opportunityPanelActions.setLassoSelection, (state, { selectedLassoArea }): State => {
    return {
      ...state,
      selectedLassoArea,
      currentPageNumber: 1,
      filteredOpportunities: null
    };
  }),
  on(opportunityPanelActions.setGISMapClickSelection, (state, { isShapeSelected }): State => {
    return {
      ...state,
      isShapeSelected
    };
  }),
  on(opportunityPanelActions.setLoaderFlag, (state, { showLoader }): State => {
    return {
      ...state,
      showLoader
    };
  }),
  on(opportunityPanelActions.setLayerAttributes, (state, { whereClause }): State => {
    return {
      ...state,
      whereClause,
      currentPageNumber: 1,
      filteredOpportunities: null
    };
  }),
  on(opportunityPanelActions.setSelectedLayers, (state, { selectedLayers, filterSelected }): State => {
    return {
      ...state,
      selectedLayers,
      currentPageNumber: 1,
      filterSelected,
      filteredOpportunities: null
    };
  }),
  on(opportunityPanelActions.loadMoreOpportunities, (state, { pageNumber }): State => {
    return {
      ...state,
      isLoading: true,
      currentPageNumber: pageNumber
    };
  }),
  on(opportunityPanelActions.setLayers, (state, { selectedLayers, filterSelected }): State => {
    return {
      ...state,
      selectedLayers,
      filterSelected
    };
  }),
  on(opportunityPanelActions.getMlConnectionInfoSuccess, (state, { mlConnectionInfo }): State => {
    return {
      ...state,
      mlConnectionInfo
    };
  }),
  on(opportunityPanelActions.isMapLoaded, (state, { isMapLoaded }): State => {
    return {
      ...state,
      isMapLoaded
    };
  }),
  on(opportunityPanelActions.getDataObjectCountSuccess, (state, { opportunities }): State => {
    return {
      ...state,
      filteredOpportunities: state?.filteredOpportunities
        ?.map((opp) => ({ ...opp }))
        .map((opp) => {
          const countOpportunity = opportunities?.filter((item) => item.opportunityId === opp.opportunityId);
          opp['dataObjects'] = countOpportunity?.[0]?.dataObjects ?? opp?.dataObjects;
          return opp;
        })
    };
  })
);

export function opportunityPanelReducer(state: any, action: any) {
  return _opportunityPanelReducer(state, action);
}
