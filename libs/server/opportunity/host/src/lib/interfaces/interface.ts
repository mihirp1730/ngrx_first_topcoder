export interface IOpportunityRequest {
  opportunityId: string;
  opportunityName: string;
  status: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  requestedOn: string;
  requestedBy: string;
  comment: string;
  requestedFor: string[];
  accessLevels: string[];
  vendorId: string;
  companyName: string;
  subscriptionRequestId: string;
  accessDetails?: Array<IAccessDetails>;
  opportunitySubscriptionId?: string;
}

export interface IOpportunitySubscription {
  subscriptionRequestId?: any;
  firstName?: string;
  lastName?: string;
  opportunitySubscriptionId?: string;
  opportunitySubscriptionRequestId?: string;
  opportunityId?: string;
  opportunityName?: string;
  attendeeId?: string;
  accessDetails?: Array<IAccessDetails>;
  isConfInfo?: boolean;
  isVDR?: boolean;
  companyName?: string;
}

export interface IAccessDetails {
  accessLevel: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface IOpportunityHostRequestConfig {
  hostBaseUrl: string;
}

export interface ServerOpportunityHostModuleOptions {
  config: IOpportunityHostRequestConfig;
}

export interface IOpportunityRequests {
  response: IOpportunityRequest[];
  header: string;
}
export interface IOpportunityRequestHeader {
  requestData: IOpportunityRequest[];
  correlationId: string;
}
