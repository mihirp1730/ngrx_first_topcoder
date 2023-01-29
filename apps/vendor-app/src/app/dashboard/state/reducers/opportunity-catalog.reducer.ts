import * as opportunityCatalogActions from '../actions/opportunity-catalog.actions';

import { State, initialState } from '../opportunity-catalog.state';
import { createReducer, on } from '@ngrx/store';

import { OpportunityStatus } from '@apollo/app/services/opportunity';

export const opportunityCatalogFeatureKey = 'opportunity-catalog';

const _opportunityCatalogReducer = createReducer(
  initialState,
  on(opportunityCatalogActions.getOpportunities, opportunityCatalogActions.unPublishOpportunity, (state, props): State => {
    return {
      ...state,
      isLoadingWhileGetting: props.isLoading
    };
  }),
  on(opportunityCatalogActions.getOpportunitiesSuccess, opportunityCatalogActions.updateOpportunitiesStore, (state, { opportunities }): State => {
    return {
      ...state,
      opportunities,
      isLoadingWhileGetting: false
    };
  }),
  on(opportunityCatalogActions.getOpportunitiesFail, (state): State => {
    return {
      ...state,
      isLoadingWhileGetting: false
    };
  }),
  on(opportunityCatalogActions.userChangesCatalogFilter, (state, props): State => {
    return {
      ...state,
      filters: {
        ...state.filters,
        opportunityName: props.opportunityName,
        assetType: props.assetType,
        offerType: props.offerType,
        deliveryType: props.deliveryType,
        status: props.status
      }
    };
  }),
  on(opportunityCatalogActions.userLeavesCatalogPage, (state): State => {
    return {
      ...state,
      filters: {
        ...state.filters,
        opportunityName: null,
        assetType: null,
        offerType: null,
        deliveryType: null,
        status: null
      }
    };
  }),
  on(opportunityCatalogActions.deleteOpportunitySuccess, (state, props): State => {
    const filteredOpportunities = state.opportunities.filter((item) => item.opportunityId != props.id);
    return {
      ...state,
      opportunities: filteredOpportunities
    };
  }),
  on(opportunityCatalogActions.setPendingPublishOpportunityState, (state, {id}): State => {
    return {
      ...state,
      pendingPublishedOpportunityIds: [id, ...state.pendingPublishedOpportunityIds]
    };
  }),
  on(opportunityCatalogActions.removePendingPublishedOpportunityIds, (state, props): State => {
    return {
      ...state,
      pendingPublishedOpportunityIds: [...state.pendingPublishedOpportunityIds.filter(item => item !== props.id)]
    };
  }),
  on(opportunityCatalogActions.unPublishOpportunitySuccess, (state, props): State => {
    return {
      ...state,
      opportunities: state.opportunities
        .map((opp) => ({ ...opp }))
        .map((opp) => {
          if (opp.opportunityId === props.id) {
            return {
              ...opp,
              opportunityStatus: OpportunityStatus.Unpublished
            };
          } else {
            return opp;
          }
        }),
      isLoadingWhileGetting: false
    };
  }),
  on(opportunityCatalogActions.unPublishOpportunityFail, (state): State => {
    return {
      ...state
    };
  }),
  on(opportunityCatalogActions.inviteAttendees, (state): State => {
    return {
      ...state,
      isLoadingWhileGetting: true,
      opportunitySubscriptionIds: []
    };
  }),
  on(opportunityCatalogActions.inviteAttendeesSuccess, (state, { opportunitySubscriptionIds }): State => {
    return {
      ...state,
      isLoadingWhileGetting: false,
      opportunitySubscriptionIds
    };
  }),
  on(opportunityCatalogActions.inviteAttendeesFail, (state): State => {
    return {
      ...state,
      isLoadingWhileGetting: false,
      opportunitySubscriptionIds: []
    };
  }),
  on(opportunityCatalogActions.updateMedia, (state, props): State => {
    return {
      ...state,
      catalogMedia: props.catalogMedia
    };
  }),
  on(opportunityCatalogActions.getMlConnectionInfoSuccess, (state, { mlConnectionInfo }): State => {
    return {
      ...state,
      mlConnectionInfo
    };
  }),
  on(opportunityCatalogActions.getActiveTablesSuccess, (state, { tables }): State => {
    return {
      ...state,
      dataObjectsFetched: tables.length > 0,
      activeTables: tables
    };
  }),
  on(opportunityCatalogActions.getDataObjectCountSuccess, (state, props): State => {
    return {
      ...state,
      dataObjectsFetched: true,
      opportunities: state.opportunities
        .map((opp) => ({ ...opp }))
        .map((opp) => {
          const dataObjects = [];
          props.dataObjects.forEach((newArr) => {
            if (newArr.data.OpportunityId.indexOf(opp.opportunityId) > -1) {
              dataObjects.push({
                count: newArr.data.OpportunityId_Count[newArr.data.OpportunityId.indexOf(opp.opportunityId)],
                name: newArr.data.layer,
                entityIcon: newArr.data.icon
              });
            } else {
              dataObjects.push({
                count: 0,
                name: newArr.data.layer,
                entityIcon: newArr.data.icon
              });
            }
          });
          dataObjects.sort((a, b) => {
            return b.count - a.count;
          });
          opp['dataObjects'] = dataObjects;
          return opp;
        }),
      isLoadingWhileGetting: false
    };
  }),
  on(opportunityCatalogActions.getLayerMetadataSuccess, (state, { layerMetadata }): State => {
    return {
      ...state,
      layerMetadata: layerMetadata
        .map((mappedLayerMetadata) => ({ ...mappedLayerMetadata }))
        .filter((filteredLayerMetadata) => {
          return state.activeTables.findIndex((table) => table.name === filteredLayerMetadata.maplargeTable) > -1;
        })
    };
  }),
  on(
    opportunityCatalogActions.getDataObjectCountFail,
    opportunityCatalogActions.getLayerMetadataFail,
    opportunityCatalogActions.getActiveTablesFail,
    (state): State => {
      return {
        ...state,
        dataObjectsFetched: true
      };
    }
  )
);

export function opportunityCatalogReducer(state, action) {
  return _opportunityCatalogReducer(state, action);
}
