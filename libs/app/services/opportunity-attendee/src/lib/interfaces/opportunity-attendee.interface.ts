import { IVendorProfile } from '@apollo/app/vendor';

export interface IAttendeeOpportunitiesResponse {
  opportunities: Array<IOpportunitiesDetails>;
}

export interface IOpportunitiesDetails {
  opportunityId: string;
  opportunityName: string;
  opportunityStatus: OpportunityStatus;
  opportunityType: OpportunityType;
  countries: Array<string>;
  opportunityProfile: IOpportunityProfile;
  confidentialOpportunityProfile: IConfidentialOpportunityProfile;
  dataObjects?: DataObjects;
  dataVendorId: string;
  vendorProfile?: IVendorProfile;
  opportunityVDR?: IOpportunityVDR;
  requests?: Array<IOpportunityRequest>;
  subscriptions?: Array<IOpportunitySubscription>;
  ccusAttributes?: ICCUSAttributes;
}

export interface ICCUSAttributes {
  expectedSequestration?: string | null;
  costOfCarbonAbated?: string | null;
  certifier?: string | null;
  lastValidatedOrVerified?: string | null;
}

export enum OpportunityStatus {
  Published = 'PUBLISHED',
  Draft = 'DRAFT',
  Pending = 'PENDING',
  OnOffer = 'ONOFFER',
  Expired = 'Expired',
  Unpublished = 'Unpublished'
}

export enum OpportunityType {
  Public = 'PUBLIC',
  Partial = 'PARTIALLY PUBLIC',
  Private = 'PRIVATE'
}

export enum accessLevelsName {
  CI = 'Details',
  VDR = 'VDR'
}

export enum opportunityRequestStatus {
  Pending = 'PENDING',
  Rejected = 'REJECTED',
  Cancelled = 'CANCELLED'
}

export enum opportunitySubscriptionStatus {
  Approved = 'APPROVED',
  NotAvailable = 'NOT AVAILABLE',
  Expired = 'EXPIRED',
  Revoked = 'REVOKED'
}

export interface IOpportunityProfile {
  asset: Array<string>;
  assetType: Array<string>;
  offer: Array<string>;
  contract: Array<string>;
  offerStartDate: string;
  offerEndDate: string;
  overview: string;
  media: Array<IMedia>;
  documents: Array<IMedia>;
  ccusAttributes?: ICCUSAttributes;
}

export interface IConfidentialOpportunityProfile {
  overview: string;
  media: Array<IMedia>;
  documents: Array<IMedia>;
}

export interface IMedia {
  fileId: string;
  fileName: string;
  fileType: string;
  caption: string;
  signedUrl?: string;
}

export interface IDocuments {
  fileId: string;
  fileName: string;
  fileType: string;
  caption: string;
}

export interface IOpportunitySubscriptionRequestsPayload {
  opportunityId: string;
  comment: string;
  companyName: string;
  requesterId: string;
  accessLevels: Array<string>;
}

export interface IOpportunitySubscriptionRequestsResponse {
  opportunitySubscriptionRequestId: string;
}

export interface IOpportunityRequestsResponse {
  items: Array<IOpportunityRequest>;
}

export interface IOpportunityVDR {
  opportunityVDRId: string | null;
  accountName: string | null;
  departmentName: string | null;
  vdrLink: string | null;
  hasAccess: boolean | null;
}

export interface IOpportunityRequest {
  subscriptionRequestId: string;
  opportunityId: string;
  opportunityName: string;
  requestedOn: string;
  requestStatus: string;
  accessLevels: string[];
  vendorId: string;
  vendorProfile?: IVendorProfile;
  opportunityStatus?: OpportunityStatus;
}

export interface IOpportunitySubscriptionsResponse {
  items: Array<IOpportunitySubscription>;
}

export interface IOpportunitySubscription {
  vendorId: string;
  subscriptionId: string;
  subscriptionRequestId: string;
  subscriptionRequestIds?: Array<any>;
  opportunityId: string;
  opportunityName: string;
  requestedOn: string;
  status?: string;
  approvedBy: string;
  approvedOn: string;
  accessDetails: Array<IAccessDetails>;
  vendorProfile?: IVendorProfile;
  opportunityStatus?: OpportunityStatus;
}

export interface IAccessDetails {
  accessLevel: string;
  startDate: string;
  endDate: string;
  status?: string;
}

export interface DataObjects {
  count: number;
  name: string;
  entityIcon: string;
}
