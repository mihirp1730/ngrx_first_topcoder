import { IDocFile } from '@apollo/app/document-upload';
import { IMediaFile } from '@apollo/app/media-upload-preview';

export interface ICreateOpportunityRequest {
  opportunityName: string;
  opportunityType: OpportunityType;
}

export interface ISaveOpportunity {
  opportunityId: string;
  opportunityName: string;
  opportunityType: OpportunityType;
  countries: string[];
  phase: string[];
  assetType: string[];
  deliveryType: string[];
  offerType: string[];
  contractType: string[];
  offerStartDate: string;
  offerEndDate: string;
  ccusAttributes?: ICCUSAttributes | null;
}

export interface ICreateOpportunityResponse {
  opportunityId: string;
}

export interface IGetOpportunityResponse {
  opportunities: IOpportunity[];
}

export interface ISaveOpportunityProfileResponse {
  opportunityProfileId: string;
}

export interface ISaveOpportunityConfidentialProfileResponse {
  confidentialOpportunityProfileId: string;
}

export interface IOpportunityMapRepresentationPayload {
  type: string;
  fileId: string;
}

export interface IOpportunityMapRepresentationResponse {
  mapRepresentations: IOpportunityMapRepresentation[];
}

export interface IOpportunityDeleteMapRepresentationResponse {
  mapRepresentationId: string;
}

export interface IOpportunityMapRepresentation {
  mapRepresentationId: string;
  type: string;
  fileId: string;
  fileName: string;
  hidden?: boolean;
}

export interface MapRepresentationOptions {
  icon: string;
  value: string;
  viewText: string;
  disabled: boolean;
}

export enum OpportunityType {
  Public = 'PUBLIC',
  Partial = 'PARTIALLY PUBLIC',
  Private = 'PRIVATE'
}

export enum AccessType {
  ci = 'confidentialInfo',
  vdr = 'vdrInfo'
}

export enum OpportunityStatus {
  Draft = 'Draft',
  Published = 'Published',
  Unpublished = 'Unpublished',
  Expired = 'Expired',
  Publishing = 'Publishing'
}

export enum AccessStatus {
  Approved = 'APPROVED',
  Revoked = 'REVOKED',
  Expired = 'EXPIRED',
  Pending = 'PENDING'
}

export interface IOpportunityConfidentialProfile {
  overview?: string | null;
  media?: IMediaFile[] | null;
  documents?: IDocFile[] | null;
}

export interface IOpportunityProfile {
  overview: string;
  media: IMediaFile[] | null;
  documents: IDocFile[] | null;
}

export interface IOpportunityDetails {
  opportunityName: string;
  opportunityType: OpportunityType;
  countries: string[];
  phase: string[] | null;
  assetType: string[] | null;
  deliveryType: string[] | null;
  offerType: string[] | null;
  contractType: string[] | null;
  offerStartDate: string | null;
  offerEndDate: string | null;
  ccusAttributes?: ICCUSAttributes | null;
}

export interface IOpportunity {
  opportunityId: string;
  opportunityName: string;
  opportunityType: OpportunityType;
  userId?: string | null;
  billingAccountId?: string | null;
  dataVendorId?: string;
  opportunityProfile?: IOpportunityProfile;
  confidentialOpportunityProfile?: IOpportunityConfidentialProfile;
  opportunityVDR?: IOpportunityVDRPayload;
  opportunityStatus?: string;
  countries?: string[] | null;
  phase?: string[] | null;
  assetType?: string[] | null;
  deliveryType?: string[] | null;
  offerType?: string[] | null;
  contractType?: string[] | null;
  offerStartDate?: string | null;
  offerEndDate?: string | null;
  signedUrl?: string | null;
  ccusAttributes?: ICCUSAttributes | null;
  dataObjects?: IDataObject[];
  lastModifiedDate?: string;
}

export interface ICCUSAttributes {
  expectedSequestration?: string | null;
  costOfCarbonAbated?: string | null;
  certifier?: string | null;
  lastValidatedOrVerified?: string | null;
}

export interface IOpportunitySubscription {
  opportunityId: string;
  subscriptionRequestId?: string;
  attendeeId?: string;
  accessLevels?: string[];
  startDate?: string;
  endDate?: string;
  description?: string;
  accessDetails?: Array<IAccessDetails>;
  subscriptionId?: string;
  statusChangeComment?: string;
  companyName?: string;
  attendeeDetails?: Array<IAttendeeDetails>;
}

export interface IOpportunityRequest {
  opportunityId: string;
  opportunityName: string;
  opportunityStatus?: string;
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
  subscriptionRequestId?: string;
  opportunitySubscriptionId?: string;
  accessDetails?: Array<IAccessDetails>;
  accessLevelsGranted?: string[];
}

export interface IAccessDetails {
  accessLevel: string;
  startDate: string;
  endDate: string;
  status?: string;
}

export interface IAttendeeDetails {
  attendeeId: string;
  firstName: string;
  lastName: string;
  companyName: string;
}

/*
 This Interface will be used to map get subscriptions from API
*/
export interface IOppSubscription {
  firstName: string;
  lastName: string;
  opportunitySubscriptionId: string;
  opportunitySubscriptionRequestId: string;
  opportunityId: string;
  opportunityName: string;
  attendeeId: string;
  accessDetails: Array<IAccessDetails>;
  isConfInfo?: boolean;
  isVDR?: boolean;
  companyName: string;
  opportunityStatus?: string;
  confiInfoStatus?: string;
  vdrStatus?: string;
  fullName?: string;
}

export interface IFilteredValues {
  fullName: string;
  opportunityName: string;
  companyName: string;
}

export interface IOpportunityVDRPayload {
  accountName: string;
  departmentName: string;
  vdrLink: string;
}

export interface CatalogMedia {
  fileId: string;
  signedUrl: string;
}

export interface IMlConnectionInfo {
  accessToken: string;
  baseUrl: string;
  userId: string;
}

export interface IDataObject {
  name: string;
  count: number;
}

export interface IOpportunityDuration {
  viewText: string;
  value: number;
}
