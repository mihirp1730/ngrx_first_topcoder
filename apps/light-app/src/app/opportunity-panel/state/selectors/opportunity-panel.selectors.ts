import { createFeatureSelector, createSelector } from '@ngrx/store';

import { State } from '../opportunity-panel.state';
import { opportunityPanelFeatureKey } from '../reducers/opportunity-panel.reducer';
import { State as MapWrapperState } from './../../../map-wrapper/state/map-wrapper.state';
import { mapWrapperFeatureKey } from './../../../map-wrapper/state/reducers/map-wrapper.reducer';

export const selectFeature = createFeatureSelector<State>(opportunityPanelFeatureKey);
export const mapWrapperSelectFeature = createFeatureSelector<MapWrapperState>(mapWrapperFeatureKey);

export const selectOpportunities = createSelector(selectFeature, (opportunityPanelState) => opportunityPanelState.opportunities);

export const selectOpportunitiesError = createSelector(selectFeature, (opportunityPanelState) => opportunityPanelState.error);

export const selectedOpportunityId = createSelector(selectFeature, (opportunityPanelState) => opportunityPanelState.selectedOpportunityId);

export const selectSearchTerm = createSelector(selectFeature, (opportunityPanelState) => opportunityPanelState.searchTerm);

export const selectFilteredOpportunities = createSelector(
  selectFeature,
  (opportunityPanelState) => opportunityPanelState.filteredOpportunities
);

export const selectLassoArea = createSelector(selectFeature, (opportunityPanelState) => opportunityPanelState.selectedLassoArea);

export const selectFilterWhereClause = createSelector(selectFeature, (opportunityPanelState) => opportunityPanelState.whereClause);

export const selectFilteredLayers = createSelector(selectFeature, (opportunityPanelState) => opportunityPanelState.selectedLayers);

export const selectCurrentPageNumber = createSelector(selectFeature, (opportunityPanelState) => opportunityPanelState.currentPageNumber);

export const opportunitiesTotal = createSelector(selectFeature, (opportunityPanelState) => opportunityPanelState.totalOpportunities);

export const selectIsFilterSelected = createSelector(selectFeature, (opportunityPanelState) => opportunityPanelState.filterSelected);

export const selectIsMapLoaded = createSelector(selectFeature, (opportunityPanelState) => opportunityPanelState.isMapLoaded);

export const selectLoader = createSelector(selectFeature, (opportunityPanelState) => opportunityPanelState.isLoading);

export const selectMlConnectionInfo = createSelector(
  selectFeature,
  (opportunityPanelState) => opportunityPanelState.mlConnectionInfo
);

export const deduceOpportunities = createSelector(selectOpportunities, selectSearchTerm, (opportunities, filters) => {
  return opportunities?.filter((item) => {
    if (filters === '' || filters === null || item.opportunityName.toLowerCase().includes(filters.toLowerCase())) {
      return true;
    }
    return false;
  });
});

export const selectUseMapExtents = createSelector(mapWrapperSelectFeature, (mapWrapperState) => mapWrapperState.useMapExtents);
export const dataOpportunityWorkFlow = createSelector(
  mapWrapperSelectFeature,
  (mapWrapperState) => mapWrapperState.dataOpportunityWorkflow
);

export const selectLoaderFlag = createSelector(selectFeature, (opportunityPanelState) => opportunityPanelState.showLoader);
