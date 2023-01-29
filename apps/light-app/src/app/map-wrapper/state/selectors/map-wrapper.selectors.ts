import { createFeatureSelector, createSelector } from '@ngrx/store';

import { State as OpportunityState } from '../../../opportunity-panel/state/opportunity-panel.state';
import { opportunityPanelFeatureKey } from '../../../opportunity-panel/state/reducers/opportunity-panel.reducer';
import { SidePanelViews } from '../../enums';
import { State } from '../map-wrapper.state';
import { mapWrapperFeatureKey } from '../reducers/map-wrapper.reducer';
//
// State Selectors:
//

export const selectFeature = createFeatureSelector<State>(mapWrapperFeatureKey);

export const opporPanelSelectFeature = createFeatureSelector<OpportunityState>(opportunityPanelFeatureKey);

export const selectMapSelectionSpatialQuery = createSelector(
  selectFeature,
  (mapWrapperState) => mapWrapperState.map.selection.spatialQuery
);
export const selectShowingHamburgerMenu = createSelector(selectFeature, (mapWrapperState) => mapWrapperState.showingHamburgerMenu);
export const selectShowingLayerPanel = createSelector(selectFeature, (mapWrapperState) => mapWrapperState.showingLayerPanel);
export const selectShowingRecordDetailsPanel = createSelector(
  selectFeature,
  (mapWrapperState) => mapWrapperState.showingRecordDetailsPanel
);
export const selectShowingRecordListPanel = createSelector(selectFeature, (mapWrapperState) => mapWrapperState.showingRecordListPanel);
export const selectSelectedOpportunityId = createSelector(selectFeature, (mapWrapperState) => mapWrapperState.selectedOpportunityId);
export const selectShowingBasemap = createSelector(selectFeature, (mapWrapperState) => mapWrapperState.showingBasemap);
export const selectUseMapExtents = createSelector(selectFeature, (mapWrapperState) => mapWrapperState.useMapExtents);
export const selectLayersOrFiltersHaveChanged = createSelector(
  selectFeature,
  (mapWrapperState) => mapWrapperState.layersOrFiltersHaveChanged
);
export const selectSearchTerm = createSelector(selectFeature, (mapWrapperState) => mapWrapperState.searchTerm);

export const dataOpportunityWorkFlow = createSelector(selectFeature, (mapWrapperState) => mapWrapperState.dataOpportunityWorkflow);

// #region oppor panel selectors
export const selectFilterWhereClause = createSelector(
  opporPanelSelectFeature,
  (opportunityPanelState) => opportunityPanelState.whereClause
);
export const selectLassoArea = createSelector(opporPanelSelectFeature, (opportunityPanelState) => opportunityPanelState.selectedLassoArea);
export const selectGISMapClickShape = createSelector(
  opporPanelSelectFeature,
  (opportunityPanelState) => opportunityPanelState.isShapeSelected
);

export const selectFilterSearchTerm = createSelector(opporPanelSelectFeature, (opportunityPanelState) => opportunityPanelState.searchTerm);
export const selectFilteredLayers = createSelector(
  opporPanelSelectFeature,
  (opportunityPanelState) => opportunityPanelState.selectedLayers
);
export const selectFilteredOpportunities = createSelector(
  opporPanelSelectFeature,
  (opportunityPanelState) => opportunityPanelState.filteredOpportunities
);

export const selectTotalOpportunities = createSelector(
  opporPanelSelectFeature,
  (opportunityPanelState) => opportunityPanelState.totalOpportunities
);

// #endregion oppor panel selectors

//
// State Deductions: (use above state selectors to derive logical values)
//

export const deduceCurrentSidepanel = createSelector(
  selectShowingHamburgerMenu,
  selectShowingLayerPanel,
  selectShowingRecordDetailsPanel,
  selectShowingRecordListPanel,
  (showingHamburgerMenu, showingLayerPanel, recordDetailsPanel, recordListPanel) => {
    if (showingLayerPanel) {
      return SidePanelViews.LAYERS;
    }
    if (showingHamburgerMenu) {
      return SidePanelViews.MENU;
    }
    if (recordDetailsPanel) {
      return SidePanelViews.DETAIL;
    }
    if (recordListPanel) {
      return SidePanelViews.RESULTS;
    }
    return SidePanelViews.EMPTY;
  }
);
export const deduceGisGetSearchResultRequest = createSelector(
  selectLayersOrFiltersHaveChanged,
  selectMapSelectionSpatialQuery,
  selectSearchTerm,
  (layersOrFiltersHaveChanged, spatialQuery, searchTerm) => {
    return { layersOrFiltersHaveChanged, spatialQuery, searchTerm };
  }
);
export const deduceShowSearchBar = createSelector(deduceCurrentSidepanel, (sidePanelView) => {
  // Sonarqube was not wanting to have a simple switch statement
  //  so we've got a basic return statement.
  return sidePanelView !== SidePanelViews.LAYERS;
});
export const deduceShowSidepanel = createSelector(deduceCurrentSidepanel, (sidePanelView) => {
  // Sonarqube was not wanting to have a simple switch statement
  //  so we've got a basic return statement.
  return sidePanelView !== SidePanelViews.EMPTY;
});
