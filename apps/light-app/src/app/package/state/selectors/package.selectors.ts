import { createFeatureSelector, createSelector } from '@ngrx/store';

import { State } from '../package.state';
import { packageFeatureKey } from '../reducers/package.reducer';

//
// State Selectors:
//

export const selectFeature = createFeatureSelector<State>(packageFeatureKey);
export const selectSelectedProfileId = createSelector(selectFeature, (packageState) => packageState.selectedProfileId);
export const selectSelectedPackageProfileVendorId = createSelector(
  selectFeature,
  (packageState) => packageState.selectedPackageProfile?.vendorId ?? null
);
export const selectSelectedPackage = createSelector(selectFeature, (packageState) => packageState.selectedPackage);
export const selectSelectedPackageSubscription = createSelector(
  selectSelectedPackage,
  (selectedPackage) => selectedPackage?.subscription ?? null
);
export const selectSelectedPackageSubscriptionStatus = createSelector(
  selectSelectedPackageSubscription,
  (subscription) => subscription?.status ?? null
);
export const selectSelectedPackageSubscriptionStartTime = createSelector(
  selectSelectedPackageSubscription,
  (subscription) => subscription?.subscriptionStartTime ?? null
);
export const selectSelectedPackageSubscriptionEndTime = createSelector(
  selectSelectedPackageSubscription,
  (subscription) => subscription?.subscriptionEndTime ?? null
);
export const selectSelectedPackageSubscriptionLastRequestTime = createSelector(
  selectSelectedPackageSubscription,
  (subscription) => subscription?.lastRequestTime ?? null
);
export const selectSelectedPackageDownloading = createSelector(selectFeature, (packageState) => packageState.selectedPackageDownloading);
export const selectSelectedPackageRequesting = createSelector(selectFeature, (packageState) => packageState.selectedPackageRequesting);

//
// State Deductions: (use above state selectors to derive logical values)
//

export const deduceHasProfileSelected = createSelector(selectSelectedProfileId, (selectedProfileId) => selectedProfileId !== null);
export const deduceSelectedPackageSubscriptionStartTimeDate = createSelector(selectSelectedPackageSubscriptionStartTime, (startTime) =>
  startTime ? new Date(startTime) : null
);
export const deduceSelectedPackageSubscriptionEndTimeDate = createSelector(selectSelectedPackageSubscriptionEndTime, (endTime) =>
  endTime ? new Date(endTime) : null
);
export const deduceSelectedPackageSubscriptionLastRequestTimeDate = createSelector(
  selectSelectedPackageSubscriptionLastRequestTime,
  (lastRequestTime) => (lastRequestTime ? new Date(lastRequestTime) : null)
);
export const deduceDataPackageSubscriptionRequestPayload = createSelector(
  selectSelectedProfileId,
  selectSelectedPackageProfileVendorId,
  (selectedProfileId, selectedPackageProfileVendorId) => ({
    selectedProfileId,
    selectedPackageProfileVendorId
  })
);
