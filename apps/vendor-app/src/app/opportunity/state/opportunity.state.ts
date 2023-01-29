import {
  IOpportunity,
  IOpportunityConfidentialProfile,
  IOpportunityDetails,
  IOpportunityMapRepresentation,
  IOpportunityProfile,
  IOpportunityRequest,
  IOpportunityVDRPayload,
  IOppSubscription,
  OpportunityType
} from '@apollo/app/services/opportunity';

export interface IOpportunityState {
  creation: {
    details: {
      isDetailsValid: boolean;
      isOpenInfoValid: boolean;
      isConfidentialInfoValid: boolean;
      isAdditionalServicesInfoValid: boolean;
      isAssetShapeValid: boolean;
      opportunityName: string;
      opportunityType: OpportunityType;
      countries: string[];
      phase: string[];
      opportunityDetails: IOpportunityDetails | null;
      profile: IOpportunityProfile | null;
      confidentialProfile: IOpportunityConfidentialProfile | null;
      opportunityVDR: IOpportunityVDRPayload | null;
    };
    draftOpportunity: IOpportunity;
  };
  isOpportunityReadyToPublish: boolean;
  opportunity: IOpportunity | null;
  opportunityRequests: IOpportunityRequest[] | null;
  pendingRequests: IOpportunityRequest[] | null;
  approvedRequests: IOpportunityRequest[] | null;
  rejectedRequests: IOpportunityRequest[] | null;
  isLoadingWhileCreating: boolean;
  isOpportunitySaved: boolean;
  isOpportunityPublished: boolean;
  isAssetShapeDeleted: boolean;
  savedOpportunityTimeStamp: string;
  assetShapeDetails: IOpportunityMapRepresentation[] | null;
  opportunitySubscriptions: IOppSubscription[] | null;
  publicPublishedOpportunities: IOpportunity[] | null;
  showLoader: boolean;
  opportunitySubscriptionIds: string[] | null;
  isLoadingWhileCreatingSubscription: boolean;
  isOpportunityRequestRejected: boolean;
  isSubscriptionUpdated: boolean;
  hiddenLayers: string[]; 
  hiddenMRs: IOpportunityMapRepresentation[]; 
  isGlobalVisible: boolean;
}

export const initialState: IOpportunityState = {
  creation: {
    details: {
      isDetailsValid: false,
      isOpenInfoValid: false,
      isConfidentialInfoValid: false,
      isAdditionalServicesInfoValid: false,
      isAssetShapeValid: false,
      opportunityName: null,
      opportunityType: null,
      profile: { documents: [], media: [], overview: '' },
      countries: null,
      phase: null,
      confidentialProfile: { documents: [], media: [], overview: '' },
      opportunityVDR: null,
      opportunityDetails: null
    },
    draftOpportunity: null
  },
  opportunity: null,
  opportunityRequests: [],
  pendingRequests: [],
  approvedRequests: [],
  rejectedRequests: [],
  isLoadingWhileCreating: false,
  isOpportunitySaved: false,
  isOpportunityPublished: false,
  isAssetShapeDeleted: false,
  savedOpportunityTimeStamp: null,
  assetShapeDetails: [],
  opportunitySubscriptions: [],
  publicPublishedOpportunities: null,
  showLoader: false,
  opportunitySubscriptionIds: [],
  isLoadingWhileCreatingSubscription: false,
  isOpportunityRequestRejected: false,
  isSubscriptionUpdated: false,
  isOpportunityReadyToPublish: false,
  hiddenLayers: [],
  hiddenMRs: [],
  isGlobalVisible: true
};
