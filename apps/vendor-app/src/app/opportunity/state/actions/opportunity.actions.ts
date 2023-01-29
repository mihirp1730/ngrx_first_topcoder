import {
  IOppSubscription,
  IOpportunity,
  IOpportunityConfidentialProfile,
  IOpportunityDetails,
  IOpportunityMapRepresentation,
  IOpportunityProfile,
  IOpportunityRequest,
  IOpportunitySubscription,
  IOpportunityVDRPayload,
  OpportunityType
} from '@apollo/app/services/opportunity';
import { createAction, props } from '@ngrx/store';

export const createOpportunity = createAction('[Opportunity] Create Opportunity');

export const createIsDetailsValidChanged = createAction(
  '[Opportunity] Create Is Details Valid Changed',
  props<{ isDetailsValid: boolean }>()
);

export const createIsOpenInfoValidChanged = createAction(
  '[Opportunity] Create Is Open Info Valid Changed',
  props<{ isOpenInfoValid: boolean }>()
);

export const createIsConfidentialInfoValidChanged = createAction(
  '[Opportunity] Create Is Confidential Info Valid Changed',
  props<{ isConfidentialInfoValid: boolean }>()
);

export const createIsAdditionalServicesInfoValidChanged = createAction(
  '[Opportunity] Create Is Additional Services Info Valid Changed',
  props<{ isAdditionalServicesInfoValid: boolean }>()
);

export const createOpportunityNameChanged = createAction(
  '[Opportunity] Create Opportunity Name Changed',
  props<{ opportunityName: string }>()
);

export const createOpportunityTypeChanged = createAction(
  '[Opportunity] Create Opportunity Type Changed',
  props<{ opportunityType: OpportunityType }>()
);

export const updateOpportunityProfileChanged = createAction(
  '[Opportunity] Update Opportunity Profile Changed',
  props<{ profile: IOpportunityProfile | null }>()
);

export const createOpportunitySuccess = createAction('[Opportunity] Create Opportunity Success', props<{ opportunity: IOpportunity }>());

export const saveOpportunityKeyDetailsSuccess = createAction(
  '[Opportunity] Save Opportunity Key Details Success',
  props<{ opportunity: IOpportunity }>()
);

export const createOpportunityFail = createAction('[Opportunity] Create Opportunity Fail', props<{ errorMessage: string | null }>());
export const saveOpportunityProfileSuccess = createAction(
  '[Opportunity] Save Opportunity Profile Success',
  props<{ profile: IOpportunityProfile | null }>()
);
export const saveOpportunityProfileStepInEdit = createAction(
  '[Opportunity] Save Opportunity Profile Success Edit Flow',
  props<{ profile: IOpportunityProfile | null }>()
);
export const saveOpportunityProfileFail = createAction(
  '[Opportunity] Save Opportunity Profile Fail',
  props<{ errorMessage: string | null }>()
);
export const resetOpportunitySaveStatus = createAction('[Opportunity] Reset Opportunity Save Status');
export const updateAdditionalServicesChanged = createAction(
  '[Opportunity] Update Opportunity Additional Services Changed',
  props<{ opportunityVDR: IOpportunityVDRPayload | null }>()
);
export const additionalServicesChangedSuccess = createAction(
  '[Opportunity] Save Opportunity Additional Services Success',
  props<{ opportunityVDR: IOpportunityVDRPayload | null }>()
);
export const additionalServicesChangedFail = createAction(
  '[Opportunity] Save Opportunity Additional Services Fail',
  props<{ errorMessage: string | null }>()
);
export const updateOpportunityConfidentialInfoChanged = createAction(
  '[Opportunity] Update Opportunity Confidential Info Changed',
  props<{ confidentialProfile: IOpportunityConfidentialProfile | null }>()
);
export const saveOpportunityConfidentialProfileSuccess = createAction(
  '[Opportunity] Save Opportunity Confidential Profile Success',
  props<{ confidentialProfile: IOpportunityConfidentialProfile | null }>()
);
export const saveOpportunityConfidentialProfileSuccessEditFlow = createAction(
  '[Opportunity] Save Opportunity Confidential Profile Success Edit Flow',
  props<{ confidentialProfile: IOpportunityConfidentialProfile | null }>()
);
export const saveOpportunityConfidentialProfileFail = createAction(
  '[Opportunity] Save Opportunity Confidential Profile Fail',
  props<{ errorMessage: string | null }>()
);
export const addMapRepresentation = createAction(
  '[Opportunity] Add Map Representation',
  props<{ mapRepresentation: IOpportunityMapRepresentation }>()
);
export const replaceMapRepresentations = createAction(
  '[Opportunity] Replace Map Representations',
  props<{ mapRepresentations: Array<IOpportunityMapRepresentation> }>()
);

export const publishOpportunity = createAction('[Opportunity] Publish Opportunity');

export const publishOpportunitySuccess = createAction('[Opportunity] Publish Opportunity Success', props<{ opportunityId: string }>());

export const publishOpportunityFail = createAction('[Opportunity] Publish Opportunity Fail', props<{ errorMessage: string | null }>());
export const createIsAssetShapeValidChanged = createAction(
  '[Opportunity] Create Is Asset Shape Valid Changed',
  props<{ isAssetShapeValid: boolean }>()
);

export const saveOpportunitySuccess = createAction('[Opportunity] Save Opportunity Success', props<{ opportunity: IOpportunity }>());

export const saveOpportunityFail = createAction('[Opportunity] Save Opportunity Fail', props<{ errorMessage: string | null }>());

export const getOpportunity = createAction('[Opportunity] Get Opportunity', props<{ opportunityId: string }>());

export const getOpportunitySuccess = createAction('[Opportunity] Get Opportunity Success', props<{ opportunity: IOpportunity }>());

export const getOpportunityFail = createAction('[Opportunity] Get Opportunity Fail', props<{ errorMessage: string | null }>());

export const getMapRepresentation = createAction('[Opportunity] Get MapRepresentation', props<{ opportunityId: string }>());

export const deleteMapRepresentation = createAction(
  '[Opportunity] Delete MapRepresentation',
  props<{ mapRepresentationId: string; opportunityId: string }>()
);

export const deleteMapRepresentationFail = createAction(
  '[Opportunity] Delete MapRepresentation Fail',
  props<{ errorMessage: string | null }>()
);

export const deleteMapRepresentationSuccess = createAction(
  '[Opportunity] Delete MapRepresentation Success',
  props<{ mapRepresentationId: string }>()
);

export const resetMapRepresentation = createAction('[Opportunity] Reset MapRepresentation');

export const editOpportunity = createAction('[Opportunity] Edit Opportunity');

export const editOpportunityFail = createAction('[Opportunity] Edit Opportunity Fail', props<{ errorMessage: string | null }>());

export const getOpportunityRequestList = createAction('[Opportunity] Get Opportunity Request List');

export const getOpportunityRequestListSuccess = createAction(
  '[Opportunity] Get Opportunity Request List Success',
  props<{ opportunityRequests: IOpportunityRequest[] }>()
);

export const getOpportunityRequestListFail = createAction(
  '[Opportunity] Get Opportunity Request List Fail',
  props<{ errorMessage: string | null }>()
);

export const updateOpportunityDetails = createAction(
  '[Opportunity] update Opportunity Details',
  props<{ opportunityDetails: IOpportunityDetails }>()
);
export const getOpportunitySubscriptions = createAction('[Opportunity] Get Opportunity Subscriptions');

export const getOpportunitySubscriptionsSuccess = createAction(
  '[Opportunity] Get Opportunity Subscriptions Success',
  props<{ opportunitySubscriptions: IOppSubscription[] }>()
);

export const getOpportunitySubscriptionsFail = createAction(
  '[Opportunity] Get Opportunity Subscriptions Fail',
  props<{ errorMessage: string | null }>()
);

export const createOpportunitySubscription = createAction(
  '[Opportunity] Create Opportunity Subscription',
  props<{ payload: IOpportunitySubscription | null }>()
);

export const createOpportunitySubscriptionSuccess = createAction(
  '[Opportunity] Create Opportunity Subscription Success',
  props<{ opportunitySubscriptionIds: string[] }>()
);

export const createOpportunitySubscriptionFail = createAction(
  '[Opportunity] Create Opportunity Subscription Fail',
  props<{ errorMessage: string | null }>()
);

export const rejectOpportunityRequest = createAction(
  '[Opportunity] Reject Opportunity Request',
  props<{ payload: { rejectionReason: string }; subscriptionRequestId: string }>()
);

export const rejectOpportunityRequestSuccess = createAction(
  '[Opportunity] Reject Opportunity Request Success',
  props<{ subscriptionRequestId: string }>()
);

export const rejectOpportunityRequestFail = createAction(
  '[Opportunity] Reject Opportunity Request Fail',
  props<{ errorMessage: string | null }>()
);
export const updateOpportunitySubscription = createAction(
  '[Opportunity] Update Opportunity Subscription',
  props<{ payload: IOpportunitySubscription | null }>()
);

export const updateOpportunitySubscriptionSuccess = createAction(
  '[Opportunity] Update Opportunity Subscription Success',
  props<{ opportunitySubscriptionId: string }>()
);

export const updateOpportunitySubscriptionFail = createAction(
  '[Opportunity] Update Opportunity Subscription Fail',
  props<{ errorMessage: string | null }>()
);

export const getPublishedPublicOpportunities = createAction('[Opportunity] Get Published Public Opportunities');

export const getOpportunitiesSuccess = createAction(
  '[Opportunities] Get Opportunities Success',
  props<{ opportunities: IOpportunity[] }>()
);

export const getOpportunitiesFail = createAction('[Opportunities] Get Opportunities Fail', props<{ errorMessage: string | null }>());

export const removeSubscriptionId = createAction('[Opportunity] Remove Subscription Id');

export const addHiddenLayer = createAction('[Opportunity] add Hidden Layer', props<{ layerName: string | null }>());

export const removeHiddenLayer = createAction('[Opportunity] remove Hidden Layer', props<{ layerName: string | null }>());

export const addHiddenMR = createAction('[Opportunity] add Hidden MR', props<{ mapRepresentation: IOpportunityMapRepresentation }>());

export const removeHiddenMR = createAction('[Opportunity] remove Hidden MR', props<{ mapRepresentation: IOpportunityMapRepresentation }>());

export const hideAllLayers = createAction('[Opportunity] hideAllLayers');

export const showAllLayers = createAction('[Opportunity] showAllLayers');
