import { CatalogMedia, IMlConnectionInfo, IOpportunity, IOpportunitySubscription } from '@apollo/app/services/opportunity';
import { createAction, props } from '@ngrx/store';

import { IMarketingRepresentation } from '@apollo/api/interfaces';

export const getOpportunities = createAction(
  '[Opportunity Catalog] Get all opportunity',
  props<{ isLoading: boolean }>()
);

export const updateOpportunitiesStore = createAction(
  '[Opportunity Catalog] Update opportunities in store',
  props<{ opportunities: IOpportunity[] }>()
)

export const setPendingPublishOpportunityState  = createAction(
  '[Opportunity Catalog] Store opportunity ids with pending state',
  props<{ id: string }>()
);

export const removePendingPublishedOpportunityIds  = createAction(
  '[Opportunity Catalog] Remove published opportunity from pending state array',
  props<{ id: string }>()
);

export const validatePublishStatus = createAction(
  '[Opportunity Catalog] Validate if opportunity published if not recall opportunity API',
  props<{ opportunities: IOpportunity[] }>()
);

export const getOpportunitiesSuccess = createAction(
  '[Opportunities Catalog] Get Success',
  props<{ opportunities: IOpportunity[] }>()
);

export const getOpportunitiesFail = createAction(
  '[Opportunities Catalog] Get Fail',
  props<{ errorMessage: string | null }>()
);

export const userChangesCatalogFilter = createAction(
  '[Opportunities Catalog] User Changes Catalog Filter',
  props<{
    opportunityName: string | null,
    assetType: string[] | null,
    offerType: string[] | null,
    deliveryType: string[] | null,
    status: string[] | null
  }>()
);

export const userLeavesCatalogPage = createAction(
  '[Opportunities Catalog] User Leaves Catalog Page',
);

export const deleteOpportunity = createAction(
  '[Opportunities Catalog] Delete Opportunity',
  props<{ id: string }>()
);

export const deleteOpportunitySuccess = createAction(
  '[Opportunities Catalog] Delete Opportunity Success',
  props<{ id: string }>()
);

export const deleteOpportunityFail = createAction(
  '[Opportunities Catalog] Delete Opportunity Fail',
  props<{ errorMessage: string | null }>()
);

export const inviteAttendees = createAction(
  '[Opportunities Catalog] Invite Attendees',
  props<{ opportunitySubscription: IOpportunitySubscription }>()
);

export const inviteAttendeesSuccess = createAction(
  '[Opportunities Catalog] Invite Attendees Success',
  props<{ opportunitySubscriptionIds: string[] }>()
);

export const inviteAttendeesFail = createAction(
  '[Opportunities Catalog] Invite Attendees Fail',
  props<{ errorMessage: string | null }>()
);

export const unPublishOpportunity = createAction(
  '[Opportunities Catalog] UnPublish Opportunity',
  props<{ id: string, isLoading?: boolean }>()
);

export const unPublishOpportunitySuccess = createAction(
  '[Opportunities Catalog] UnPublish Opportunity Success',
  props<{ id: string }>()
);

export const updateMedia = createAction(
  '[Opportunities Catalog] Update Media',
  props<{ catalogMedia: CatalogMedia[] }>()
);

export const unPublishOpportunityFail = createAction(
  '[Opportunities Catalog] UnPublish Opportunity Fail',
  props<{ errorMessage: string | null }>()
);

export const getMlConnectionInfo = createAction(
  '[Opportunity Catalog] Get mlConnectionInfo'
);

export const getMlConnectionInfoSuccess = createAction(
  '[Opportunities Catalog] Get mlConnectionInfo Success',
  props<{ mlConnectionInfo: IMlConnectionInfo }>()
);

export const getMlConnectionInfoFail = createAction(
  '[Opportunities Catalog] Get mlConnectionInfo Fail',
  props<{ errorMessage: string | null }>()
);

export const getDataObjectCountSuccess = createAction(
  '[Opportunities Catalog] Get Data Object Count Success',
  props<{ dataObjects: any[] }>()
);
export const getDataObjectCountFail = createAction(
  '[Opportunities Catalog] Get Data Object Count Fail',
  props<{ errorMessage: string }>()
);
export const getLayerMetadata = createAction(
  '[Opportunities Catalog] Get Layer Metadata'
);

export const getLayerMetadataFail = createAction(
  '[Opportunities Catalog] Get Layer Metadata Fail',
  props<{ errorMessage: string | null }>()
);

export const getLayerMetadataSuccess = createAction(
  '[Opportunities Catalog] Get Layer Metadata Success',
  props<{ layerMetadata: IMarketingRepresentation[] }>()
);


export const getActiveTablesSuccess = createAction(
  '[Opportunities Catalog] Get Active Tables Success',
  props<{ tables: any[] }>()
);

export const getActiveTablesFail = createAction(
  '[Opportunities Catalog] Get Active Tables Fail',
  props<{ errorMessage: string | null }>()
);
