export interface IOpportunityDetails {
  opportunityId: string;
  opportunityName: string;
  opportunityType: string;
  dataVendorId?: string;
  opportunityProfile?: IOpportunityProfile | null;
  confidentialOpportunityProfile?: IOpportunityConfidentialProfile | null;
  opportunityStatus?: string;
  countries?: string[];
  phase?: string[];
  opportunityVDR: IOpportunityVDR | null;
  requests: IOpportunityRequest[];
  subscriptions: IOpportunitySubscription[];
  ccusAttributes: ICCUSAttributes;
  contractType: string[];
  offerType: string[];
  deliveryType: string[];
  assetType: string[];
}

export interface IOpportunityProfile {
  overview: string | null;
  media: IMediaFile[] | null;
  documents: IDocFile[] | null;
}

export interface IOpportunityConfidentialProfile {
  overview: string | null;
  media: IMediaFile[] | null;
  documents: IDocFile[] | null;
  hasAccess?: boolean;
}
export interface IMediaFile {
  fileId: string;
  fileName: string;
  fileType: string;
  caption: string;
}
export interface IDocFile {
  fileId: string;
  fileName: string;
  fileType: string;
  caption: string;
}

export interface IGetPublicOpportunityResponse {
  opportunity_id: string;
  countries: string[];
  phase: string[];
  opportunity_name: string;
  opportunity_type: string;
  data_vendor_id: string;
  opportunity_status: string;
  opportunity_profile: IGetOpportunityProfileRes | null;
  confidential_opportunity_profile: IGetOpportunityConfidentialProfileRes | null;
  opportunity_VDR: IOpportunity_VDR | null;
  ccus_attributes: ICCUS_Attributes;
  contract_type: string[];
  offer_type: string[];
  delivery_type: string[];
  asset_type: string[];
}

export interface ICCUSAttributes {
  expectedSequestration?: string | null;
  costOfCarbonAbated?: string | null;
  certifier?: string | null;
  lastValidatedOrVerified?: string | null;
}

export interface IGetOpportunityProfileRes {
  overview: string;
  media: IGetMediaFileRes[] | null;
  documents: IGetDocFileRes[] | null;
}

export interface IGetOpportunityConfidentialProfileRes {
  overview: string;
  media: IGetMediaFileRes[] | null;
  documents: IGetDocFileRes[] | null;
  hasAccess?: boolean;
}
export interface IGetMediaFileRes {
  file_id: string;
  file_name: string;
  fileType: string;
  caption: string;
}
export interface IGetDocFileRes {
  file_id: string;
  file_name: string;
  fileType: string;
  caption: string;
}

export interface GrpcDetails {
  grpcHost: string;
  grpcPort: string;
  protoPath: string;
}

export interface IOpportunityRequest {
  opportunityId: string;
  opportunityName: string;
  subscriptionRequestId: string;
  status: string;
  requestedOn: string;
  requestStatus: string;
  accessLevels: string[];
  vendorId: string;
}

export interface IAccessDetails {
  accessLevel: string;
  startDate: string;
  endDate: string;
  accessStatus: string;
}

export interface IOpportunitySubscription {
  accessDetails: Array<IAccessDetails>;
  approvedOn: string;
  apporvedBy: string;
  opportunityId: string;
  opportunityName: string;
  subscriptionId: string;
  subscriptionRequestId: string;
  vendorId: string;
}

export interface IOpportunity_VDR {
  opportunity_VDR_id: string;
  account_name: string;
  department_name: string;
  vdr_link: string;
  hasAccess: boolean;
}

export interface ICCUS_Attributes {
  expected_sequestration: string;
  cost_of_carbon_abated: string;
  certifier: string;
  last_validated_or_verified: string;
}

export interface IOpportunityVDR {
  opportunityVDRId: string | null;
  accountName: string | null;
  departmentName: string | null;
  vdrLink: string | null;
  hasAccess: boolean | null;
}

export enum OpportunityStatus {
  Published = 'PUBLISHED',
  Draft = 'DRAFT',
  Unpublished = 'UNPUBLISHED',
  Expired = 'EXPIRED'
}
