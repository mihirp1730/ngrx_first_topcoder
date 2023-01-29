import { createFeatureSelector, createSelector } from '@ngrx/store';

import { State } from '../opportunity-catalog.state';
import { intersection } from 'lodash';
import { opportunityCatalogFeatureKey } from '../reducers/opportunity-catalog.reducer';

export const selectFeature = createFeatureSelector<State>(opportunityCatalogFeatureKey);
export const selectOpportunities = createSelector(
  selectFeature,
  (opportunityCatalogState) => opportunityCatalogState.opportunities
);
export const selectFilters = createSelector(
  selectFeature,
  (opportunityCatalogState) => opportunityCatalogState.filters
);
export const selectIsLoadingWhileGetting = createSelector(
  selectFeature,
  (opportunityState) => opportunityState.isLoadingWhileGetting
);

export const selectPendingPublishOpportunityIds = createSelector(
  selectFeature,
  (opportunityState) => opportunityState.pendingPublishedOpportunityIds
);

export const selectAttendeeSubscriptionsCreated = createSelector(
  selectFeature,
  (opportunityState) => opportunityState.opportunitySubscriptionIds
);

export const selectMedia = createSelector(
  selectFeature,
  (opportunityState) => opportunityState.catalogMedia
);

export const selectLayerMetadata = createSelector(
  selectFeature,
  (opportunityState) => opportunityState.layerMetadata
);

export const selectMlConnectionInfo = createSelector(
  selectFeature,
  (opportunityState) => opportunityState.mlConnectionInfo
);

export const selectActiveTables = createSelector(
  selectFeature,
  (opportunityState) => opportunityState.activeTables
);

export const selectDataObjectsFetched = createSelector(
  selectFeature,
  (opportunityState) => opportunityState.dataObjectsFetched
);

const notAvailable = 'Not available'; // All Filters append an option based on selection of option 'Not available'.
export const deduceOpportunities = createSelector(
  selectOpportunities,
  selectFilters,
  (opportunities, filters) => {
    return opportunities
      .filter((item) => { // Search by Name
        if (filters.opportunityName === null || filters.opportunityName === ''
          || item.opportunityName.toLowerCase().includes(filters.opportunityName.toLowerCase())
        ) {
          return true;
        }
        return false;
      })
      .filter((item) => { // Filter asset type
        if (filters.assetType === null ||
          filters.assetType === '' ||
          filters.assetType?.length === 0) {
          return true;
        }
         // getting blank value so need to check the first value.
        const assetsTypeData = (!item.assetType[0]) ? [ notAvailable ] : item.assetType;
        if (intersection(assetsTypeData, filters.assetType).length > 0) {
          return true;
        }
        return false;
      })
      .filter((item) => { // Filter offer type
        if (filters.offerType === null ||
          filters.offerType === '' ||
          filters.offerType.length === 0
        ) {
          return true;
        }
        const offerTypeData = (!item.offerType[0]) ? [ notAvailable ] : item.offerType;
        if (intersection(offerTypeData, filters.offerType).length > 0) {
          return true;
        }
        return false;
      })
      .filter((item) => { // Filter delivery type
        if (filters.deliveryType === null ||
          filters.deliveryType === '' ||
          filters.deliveryType?.length === 0
        ) {
          return true;
        }
        const deliveryTypeData = (!item.deliveryType[0]) ? [ notAvailable ] : item.deliveryType;
        if (intersection(deliveryTypeData, filters.deliveryType).length > 0) {
          return true;
        }
        return false;
      })
      .filter((item) => { // Filter Status
        if (filters.status === null ||
          filters.status === '' ||
          filters.status.length === 0
        ) {
          return true;
        }
        if (filters.status.includes(item.opportunityStatus)) {
          return true;
        }
        return false;
      }); // Will add more filters afterwards
  }
);
