export { ISubscription as Subscription } from '@apollo/app/services/consumer-subscription';

export interface ISubscriptionFilters {
  id: string;
  label: string;
  value: string;
  values: Array<ISubscriptionFilter>;
}

export interface ISubscriptionFilter {
  value: string;
  label: string;
  count?: number;
}

export interface ISubscriptionRequest {
  subscriptionRequestId: string;
  dataPackageId: string;
  dataPackageName: string;
  requestedBy: string;
  requestedOn: string;
  requestStatus: string;
}

export interface SubscriptionQuery {
  search: string;
  // Attributes for queries to be defined in another user story.
  dataType?: string;
  region?: string;
  requestDate?: string;
  lastDownload?: string;
  status?: string;
}

//Filters
export interface ISortFilter {
  label: string;
  field: string;
  order: string;
}

export const enum IDataType {
  // Define data types for subscriptions
  Wells = 'Wells',
  Seismic = 'Seismic',
  NoType = 'NoType'
}

export const enum IRegion {
  // Define regions for subscriptions
  Region1 = 'Region1',
  Region2 = 'Region2',
  Region3 = 'Region3'
}

export const enum IStatus {
  // Define status for subscriptions
  Expired = 'Expired',
  Active = 'Active',
  Subscribed = 'Subscribed'
}
