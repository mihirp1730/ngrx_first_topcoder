import { IOpportunitiesDetails, IOpportunityRequest, IOpportunitySubscription } from '@apollo/app/services/opportunity-attendee';

export interface State {
  opportunities: IOpportunitiesDetails[];
  isLoading: boolean;
  opportunityError: boolean;
  opportunityRequests: IOpportunityRequest[];
  opportunitySubscriptions: IOpportunitySubscription[];
  filters: {
    opportunityName: string | null;
    accessType: string[] | '' | null;
    host: string[] | '' | null;
    status: string[] | '' | null;
  };
  showRequestLoader: boolean;
  showSubscriptionLoader: boolean;
  openModularChat: boolean;
}

export const initialState: State = {
  opportunities: [],
  isLoading: true,
  opportunityError: false,
  opportunityRequests: [],
  opportunitySubscriptions: [],
  filters: {
    opportunityName: null,
    accessType: null,
    host: null,
    status: null
  },
  showRequestLoader: false,
  showSubscriptionLoader: false,
  openModularChat: false
};
