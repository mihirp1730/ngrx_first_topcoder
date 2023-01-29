import { IOpportunitiesDetails, IOpportunityRequest, IOpportunitySubscription } from '@apollo/app/services/opportunity-attendee';
import { createAction, props } from '@ngrx/store';

export const getOpportunities = createAction('[Opportunities Attendee] Get Opportunities');

export const getOpportunitiesSuccess = createAction(
  '[Opportunities Attendee] Get Opportunities Success',
  props<{ opportunities: IOpportunitiesDetails[] }>()
);

export const getOpportunitiesFail = createAction(
  '[Opportunities Attendee] Get Opportunities Fail',
  props<{ errorMessage: string | null }>()
);

export const getOpportunityById = createAction('[Opportunity Attendee] Get Opportunity By Id', props<{ opportunityId: string }>());

export const getOpportunityByIdSuccess = createAction(
  '[Opportunities Attendee] Get Opportunity By Id Success',
  props<{ opportunity: IOpportunitiesDetails }>()
);

export const getOpportunityByIdFail = createAction(
  '[Opportunities Attendee] Get Opportunity By Id Fail',
  props<{ errorMessage: string | null }>()
);

export const getOpportunityRequests = createAction('[Opportunity Requests] Get Opportunity Requests');

export const getOpportunityRequestsSuccess = createAction(
  '[Opportunity Requests] Get Opportunity Requests Success',
  props<{ opportunityRequests: IOpportunityRequest[] }>()
);

export const getOpportunityRequestsFail = createAction(
  '[Opportunity Requests] Get Opportunity Requests Fail',
  props<{ errorMessage: string | null }>()
);

export const userChangesFilter = createAction(
  '[Opportunity Requests] User Changes Requests Filter',
  props<{
    opportunityName: string | null;
    accessType: string[] | null;
    status: string[] | null;
    host: string[] | null;
  }>()
);

export const userLeavesRequestPage = createAction('[Opportunity Requests] User Leaves Opportunity Requests Page');

export const getOpportunitySubscriptions = createAction('[Opportunity Subscriptions] Get Opportunity Subscriptions');

export const getOpportunitySubscriptionsSuccess = createAction(
  '[Opportunity Subscriptions] Get Opportunity Subscriptions Success',
  props<{ opportunitySubscriptions: IOpportunitySubscription[] }>()
);

export const getOpportunitySubscriptionsFail = createAction(
  '[Opportunity Subscriptions] Get Opportunity Subscriptions Fail',
  props<{ errorMessage: string | null }>()
);

export const userLeavesSubscriptionPage = createAction('[Opportunity Subscriptions] User Leaves Opportunity Subscriptions Page');

export const openModularChatPanel = createAction(
  '[Opportunity Subscriptions] Open Modular Chat Window',
  props<{ openModularChat: boolean }>()
);
