import { opportunityRequestStatus, opportunitySubscriptionStatus } from '@apollo/app/services/opportunity-attendee';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { accessLevelsName } from '../../opportunity-consumer.interface';

import { State } from '../opportunity-attendee.state';
import { opportunityAttendeeFeatureKey } from '../reducers/opportunity-attendee.reducer';

export const selectFeature = createFeatureSelector<State>(opportunityAttendeeFeatureKey);
export const selectOpportunities = createSelector(selectFeature, (opportunityAttendeeState) => opportunityAttendeeState.opportunities);
export const selectOpportunityById = (props: { opportunityId: string }) =>
  createSelector(selectOpportunities, (opportunities) => {
    return opportunities.find((opportunity) => opportunity.opportunityId === props.opportunityId);
  });
export const selectIsLoading = createSelector(selectFeature, (opportunityState) => opportunityState.isLoading);
export const selectOpportunityRequests = createSelector(
  selectFeature,
  (opportunityAttendeeState) => opportunityAttendeeState.opportunityRequests
);
export const selectOpportunitySubscriptions = createSelector(
  selectFeature,
  (opportunityAttendeeState) => opportunityAttendeeState.opportunitySubscriptions
);
export const selectOpportunityVDR = (props: { opportunityId: string }) =>
  createSelector(selectOpportunityById(props), (opportunityDetails) => opportunityDetails.opportunityVDR);

export const selectOpportunityVDRRequests = (props: { opportunityId: string }) =>
  createSelector(selectOpportunityById(props), (opportunityDetails) => {
    return opportunityDetails?.requests?.filter((item) => {
      return (
        item.opportunityId === props.opportunityId &&
        item.accessLevels.includes('VDR') &&
        item.requestStatus.toUpperCase() === opportunityRequestStatus.Pending
      );
    });
  });
export const selectOpportunityVDRSubscription = (props: { opportunityId: string }) =>
  createSelector(selectOpportunityById(props), (opportunityDetails) => {
    return opportunityDetails?.subscriptions?.filter((item) => {
      return (
        item.opportunityId === props.opportunityId &&
        item.accessDetails.filter((accessDetail) => {
          accessDetail.status === opportunitySubscriptionStatus.Approved && accessDetail.accessLevel === 'VDR';
        })
      );
    });
  });
export const selectOpportunityCIRequest = (props: { opportunityId: string }) =>
  createSelector(selectOpportunityById(props), (opportunityDetails) => {
    return opportunityDetails?.requests?.filter((item) => {
      return (
        item.opportunityId === props.opportunityId &&
        item.accessLevels.includes(accessLevelsName.CI) &&
        item.requestStatus.toUpperCase() === opportunityRequestStatus.Pending
      );
    });
  });
export const selectOpportunityCISubscription = (props: { opportunityId: string }) =>
  createSelector(selectOpportunityById(props), (opportunityDetails) => {
    return opportunityDetails?.subscriptions?.filter((item) => {
      return (
        item.opportunityId === props.opportunityId &&
        item.accessDetails.filter((accessDetail) => {
          accessDetail.status === opportunitySubscriptionStatus.Approved && accessDetail.accessLevel === accessLevelsName.CI;
        })
      );
    });
  });
export const selectShowRequestLoader = createSelector(selectFeature, (opportunityState) => opportunityState.showRequestLoader);
export const selectShowSubscriptionLoader = createSelector(selectFeature, (opportunityState) => opportunityState.showSubscriptionLoader);
export const selectOpenModularChat = createSelector(selectFeature, (opportunityState) => opportunityState.openModularChat);
