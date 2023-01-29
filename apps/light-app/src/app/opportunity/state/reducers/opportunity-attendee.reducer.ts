import * as opportunityAttendeeActions from '../actions/opportunity-attendee.actions';

import { State, initialState } from '../opportunity-attendee.state';
import { createReducer, on } from '@ngrx/store';

export const opportunityAttendeeFeatureKey = 'opportunity-attendee';

const _opportunityAttendeeReducer = createReducer(
  initialState,
  on(opportunityAttendeeActions.getOpportunities, (state): State => {
    return {
      ...state,
      isLoading: true
    };
  }),
  on(opportunityAttendeeActions.getOpportunitiesSuccess, (state, { opportunities }): State => {
    return {
      ...state,
      opportunities,
      isLoading: false
    };
  }),
  on(opportunityAttendeeActions.getOpportunitiesFail, (state): State => {
    return {
      ...state,
      isLoading: false,
      opportunities: []
    };
  }),
  on(opportunityAttendeeActions.getOpportunityById, (state): State => {
    return {
      ...state,
      isLoading: true
    };
  }),
  on(opportunityAttendeeActions.getOpportunityByIdSuccess, (state, { opportunity }): State => {
    return {
      ...state,
      opportunities: [...state.opportunities.filter(({ opportunityId }) => opportunityId !== opportunity.opportunityId), opportunity],
      isLoading: false,
      opportunityError: false
    };
  }),
  on(opportunityAttendeeActions.getOpportunityByIdFail, (state): State => {
    return {
      ...state,
      isLoading: false,
      opportunityError: true
    };
  }),
  on(opportunityAttendeeActions.getOpportunityRequests, (state): State => {
    return {
      ...state,
      showRequestLoader: true
    };
  }),
  on(opportunityAttendeeActions.getOpportunityRequestsSuccess, (state, { opportunityRequests }): State => {
    return {
      ...state,
      opportunityRequests,
      showRequestLoader: false
    };
  }),
  on(opportunityAttendeeActions.getOpportunityRequestsFail, (state): State => {
    return {
      ...state,
      showRequestLoader: false,
      opportunityRequests: []
    };
  }),
  on(opportunityAttendeeActions.userLeavesRequestPage, (state): State => {
    return {
      ...state,
      filters: {
        ...state.filters,
        opportunityName: null,
        accessType: null,
        host: null,
        status: null
      }
    };
  }),
  on(opportunityAttendeeActions.getOpportunitySubscriptions, (state): State => {
    return {
      ...state,
      showSubscriptionLoader: true
    };
  }),
  on(opportunityAttendeeActions.getOpportunitySubscriptionsSuccess, (state, { opportunitySubscriptions }): State => {
    return {
      ...state,
      opportunitySubscriptions,
      showSubscriptionLoader: false
    };
  }),
  on(opportunityAttendeeActions.getOpportunitySubscriptionsFail, (state): State => {
    return {
      ...state,
      showSubscriptionLoader: false,
      opportunitySubscriptions: []
    };
  }),
  on(opportunityAttendeeActions.userLeavesSubscriptionPage, (state): State => {
    return {
      ...state,
      filters: {
        ...state.filters,
        opportunityName: null,
        accessType: null,
        host: null,
        status: null
      }
    };
  }),
  on(opportunityAttendeeActions.userChangesFilter, (state, props): State => {
    return {
      ...state,
      filters: {
        ...state.filters,
        opportunityName: props.opportunityName,
        accessType: props.accessType,
        host: props.host,
        status: props.status
      }
    };
  }),
  on(opportunityAttendeeActions.openModularChatPanel, (state, { openModularChat }): State => {
    return { ...state, openModularChat: openModularChat };
  })
);

export function opportunityAttendeeReducer(state, action) {
  return _opportunityAttendeeReducer(state, action);
}
