import { IMlConnectionInfo } from '@apollo/app/services/opportunity';
import { createAction, props } from '@ngrx/store';

export const getOpportunities = createAction('[Opportunity Panel] Get Opportunities');

export const getAllOpportunities = createAction('[Opportunity Panel] Get All Opportunities');

export const getOpportunitiesSuccess = createAction(
  '[Opportunity Panel] Get Opportunities Success',
  props<{ opportunities: any[] | null; totalOpportunities: number }>()
);
export const getOpportunitiesFail = createAction('[Opportunity Panel] Get Opportunities Fail', props<{ errorMessage: string | null }>());

export const setSelectedOpportunityId = createAction(
  '[Opportunity Panel] Set Selected OpportunityId',
  props<{ opportunityId: string | null }>()
);

export const setSearchTerm = createAction('[Opportunity Panel] Set Search Term', props<{ searchTerm: string | '' }>());

export const getFilteredOpportunitiesSuccess = createAction(
  '[Opportunity Panel] get Filtered Opportunities Success',
  props<{ filteredOpportunities: any | null; totalOpportunities: number }>()
);

export const getFilteredOpportunitiesFail = createAction(
  '[Opportunity Panel] get Filtered Opportunities Fail',
  props<{ errorMessage: string | null }>()
);

export const setLayerAttributes = createAction('[Opportunity Panel] Set Layer Attributes', props<{ whereClause: any[] | [] }>());

export const setLassoSelection = createAction('[Opportunity Panel] Lasso Selection', props<{ selectedLassoArea: any }>());

export const setGISMapClickSelection = createAction('[Opportunity Panel] MAP Selection clicked', props<{ isShapeSelected: boolean }>());

export const setSelectedLayers = createAction(
  '[Opportunity Panel] Set Selected Layers',
  props<{ selectedLayers: string[]; filterSelected: boolean }>()
);

export const getDataObjectCount = createAction(
  '[Opportunity Panel] Get Data Object Count',
  props<{ filteredOpportunities: any[] | null }>()
);

export const getDataObjectCountSuccess = createAction(
  '[Opportunity Panel] Get Data Object Count Success',
  props<{ opportunities: any[] | null }>()
);

export const getDataObjectCountFail = createAction(
  '[Opportunity Panel] Get Data Object Count Fail',
  props<{ errorMessage: string | null }>()
);

export const getOpportunitiesOnLoad = createAction(
  '[Opportunity Panel] Get Opportunities On Load',
);

export const getMlConnectionInfo = createAction(
  '[Opportunity Panel] Get mlConnectionInfo'
);

export const getMlConnectionInfoSuccess = createAction(
  '[Opportunities Panel] Get mlConnectionInfo Success',
  props<{ mlConnectionInfo: IMlConnectionInfo }>()
);

export const getMlConnectionInfoFail = createAction(
  '[Opportunities Panel] Get mlConnectionInfo Fail',
  props<{ errorMessage: string | null }>()
);

export const getActiveTablesSuccess = createAction(
  '[Opportunities Panel] Get Active Tables Success',
  props<{ tables: any[], mlConnectionInfo: IMlConnectionInfo  }>()
);

export const getActiveTablesFail = createAction(
  '[Opportunities Panel] Get Active Tables Fail',
  props<{ errorMessage: string | null }>()
);

export const isMapLoaded = createAction(
  '[Opportunities Panel] Is Map Loaded',
  props<{ isMapLoaded: boolean }>()
);

export const loadMoreOpportunities = createAction('[Opportunity Panel] Load More Opportunities', props<{ pageNumber: number | null }>());

export const setLayers = createAction('[Opportunity Panel] Set Layers', props<{ selectedLayers: string[]; filterSelected: boolean }>());

export const setLoaderFlag = createAction('[Opportunity Panel] show loader flag', props<{ showLoader: boolean }>());
