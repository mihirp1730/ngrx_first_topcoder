import { createFeatureSelector, createSelector } from '@ngrx/store';

import { IOpportunityState } from '../opportunity.state';
import { isEqual } from 'lodash';
import { opportunityFeatureKey } from '../reducers/opportunity.reducer';

export const selectFeature = createFeatureSelector<IOpportunityState>(opportunityFeatureKey);
export const selectCreation = createSelector(selectFeature, (opportunityState) => opportunityState.creation);
export const selectCreationDetails = createSelector(selectCreation, (creation) => creation.details);
export const selectCreationIsDetailsValid = createSelector(selectCreationDetails, (details) => details.isDetailsValid);
export const selectCreationIsOpenInfoValid = createSelector(selectCreationDetails, (details) => details.isOpenInfoValid);
export const selectCreationIsConfidentialInfoValid = createSelector(selectCreationDetails, (details) => details.isConfidentialInfoValid);
export const selectCreationDetailsProfile = createSelector(selectCreationDetails, (details) => details.profile);
export const selectIsLoadingWhileCreating = createSelector(selectFeature, (opportunityState) => opportunityState.isLoadingWhileCreating);
export const selectIsOpportunitySaved = createSelector(selectFeature, (opportunityState) => opportunityState.isOpportunitySaved);
export const selectSavedOpportunityTimeStamp = createSelector(
  selectFeature,
  (opportunityState) => opportunityState.savedOpportunityTimeStamp
);
export const lastModifiedTimeStamp = createSelector(selectFeature, (opportunityState) => opportunityState.opportunity?.lastModifiedDate);

export const selectOpportunity = createSelector(selectFeature, (opportunityState) => opportunityState.opportunity);
export const selectCreatedOpportunityId = createSelector(selectFeature, (state) => state.opportunity?.opportunityId);
export const selectCreationDetailsConfidentialProfile = createSelector(selectCreationDetails, (details) => details.confidentialProfile);
export const selectCreationDetailsAdditionalServices = createSelector(selectCreationDetails, (details) => details.opportunityVDR);
export const selectMapRepresentationDetails = createSelector(selectFeature, (state) => state.assetShapeDetails);
export const deduceMapRepresentationIds = createSelector(selectFeature, (state) =>
  state.assetShapeDetails.map((item) => item.mapRepresentationId)
);

export const selectCreationIsAssetShapeValid = createSelector(selectCreationDetails, (details) => details.isAssetShapeValid);

export const selectIsAssetShapeDeleted = createSelector(selectFeature, (opportunityState) => opportunityState.isAssetShapeDeleted);

export const selectIsOpportunityPublished = createSelector(selectFeature, (opportunityState) => opportunityState.isOpportunityPublished);

export const selectOpportunityRequestList = createSelector(selectFeature, (opportunityState) => opportunityState.opportunityRequests);

export const selectOpportunityDetails = createSelector(selectCreationDetails, (details) => details.opportunityDetails);

export const selectPendingOpportunityRequests = createSelector(selectFeature, (opportunityState) => opportunityState.pendingRequests);

export const selectApprovedOpportunityRequests = createSelector(selectFeature, (opportunityState) => opportunityState.approvedRequests);

export const selectRejectedOpportunityRequests = createSelector(selectFeature, (opportunityState) => opportunityState.rejectedRequests);

export const selectOpportunitySubscriptions = createSelector(
  selectFeature,
  (opportunityState) => opportunityState.opportunitySubscriptions
);

export const selectShowLoader = createSelector(selectFeature, (state) => state.showLoader);

export const selectOpportunitySubscriptionId = createSelector(selectFeature, (state) => state.opportunitySubscriptionIds);

export const selectIsLoadingWhileCreatingSubscription = createSelector(selectFeature, (state) => state.isLoadingWhileCreatingSubscription);

export const selectIsOpportunityRequestRejected = createSelector(selectFeature, (state) => state.isOpportunityRequestRejected);

export const selectIsSubscriptionUpdated = createSelector(selectFeature, (state) => state.isSubscriptionUpdated);

export const selectProfileMedia = createSelector(selectFeature, (state) =>
  state.opportunity.opportunityProfile?.media.map((element) => {
    const { profileImage, ...media } = element;
    return media;
  })
);

export const selectConfidentialProfileMedia = createSelector(selectFeature, (state) =>
  state.opportunity.confidentialOpportunityProfile?.media.map((element) => {
    const { profileImage, ...media } = element;
    return media;
  })
);
export const selectDraftOpportunity = createSelector(selectFeature, (state) => state.creation.draftOpportunity);

export const selectIsOpportunityReadyToPublish = createSelector(selectFeature, (state) => state.isOpportunityReadyToPublish);
export const deduceIsOpportunityChanged = createSelector(
  selectDraftOpportunity,
  selectOpportunity,
  selectProfileMedia,
  selectConfidentialProfileMedia,
  (newOpportunity, oldOpportunity, profileMedia, confidentialProfileMedia) => {
    const { dateRange, ...updatedDraftOpportunity } = newOpportunity as any;
    const opportunityToCompare = {
      ...oldOpportunity,
      opportunityProfile: {
        ...oldOpportunity.opportunityProfile,
        media: profileMedia
      },
      confidentialOpportunityProfile: {
        ...oldOpportunity.confidentialOpportunityProfile,
        media: confidentialProfileMedia
      },
      ccusAttributes: null,
      expectedSequestration: oldOpportunity.ccusAttributes?.expectedSequestration || 0,
      costOfCarbonAbated: oldOpportunity.ccusAttributes?.costOfCarbonAbated || 0,
      certifier: oldOpportunity.ccusAttributes?.certifier || '',
      lastValidatedOrVerified: oldOpportunity.ccusAttributes?.lastValidatedOrVerified || ''
    };
    let isObjectEqual = true;
    const keysToIgnore = ['dataVendorId', 'opportunityVDRId', 'lastModifiedDate'];
    Object.keys(updatedDraftOpportunity).forEach((key) => {
      if (typeof updatedDraftOpportunity[key] === 'object') {
        if (updatedDraftOpportunity[key] !== null) {
          Object.keys(updatedDraftOpportunity[key]).forEach((childKey) => {
            // if any of the objects is present, keys are not to ignore and not eqaul then return false
            if (
              (updatedDraftOpportunity[key]?.[childKey] || opportunityToCompare[key]?.[childKey]) &&
              !keysToIgnore.includes(childKey) &&
              !isEqual(updatedDraftOpportunity[key]?.[childKey], opportunityToCompare[key]?.[childKey])
            ) {
              isObjectEqual = false;
            }
          });
        }
      } else {
        // if keys are not to ignore and values are not same then return false
        if (
          keysToIgnore.indexOf(key) === -1 &&
          (updatedDraftOpportunity[key] || opportunityToCompare[key]) &&
          updatedDraftOpportunity[key] !== opportunityToCompare[key]
        ) {
          isObjectEqual = false;
        }
      }
    });
    return !isObjectEqual;
  }
);
export const selectPublicPublishedOpportunities = createSelector(selectFeature, (state) => state.publicPublishedOpportunities);

export const selectHiddenLayers = createSelector(selectFeature, (opportunityState) => opportunityState.hiddenLayers);
export const selectIsGlobalVisible = createSelector(selectFeature, (opportunityState) => opportunityState.isGlobalVisible);
export const selectHiddenMRs = createSelector(selectFeature, (opportunityState) => opportunityState.hiddenMRs);
