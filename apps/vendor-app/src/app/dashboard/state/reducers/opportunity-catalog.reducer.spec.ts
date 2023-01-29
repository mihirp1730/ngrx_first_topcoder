import * as opportunityActions from '../actions/opportunity-catalog.actions';
import { initialState } from '../opportunity-catalog.state';
import { opportunityCatalogReducer } from './opportunity-catalog.reducer';

describe('opportunityCatalogReducer', () => {
  describe('unknown action', () => {
    it('should return the default state', () => {
      const action = { type: 'Unknown' };
      const state = opportunityCatalogReducer(initialState, action);
      expect(state).toBe(initialState);
    });
  });

  describe('getOpportunities', () => {
    it('should return isLoadingWhileGetting as true', () => {
      const action = opportunityActions.getOpportunities({isLoading: true});
      const newState = opportunityCatalogReducer(initialState, action);
      expect(newState.isLoadingWhileGetting).toBeTruthy();
    });
  });

  describe('updateOpportunitiesStore', () => {
    it('should update opportunity data in store', () => {
      const action = opportunityActions.updateOpportunitiesStore({ opportunities: [] });
      const newState = opportunityCatalogReducer(initialState, action);
      expect(newState.opportunities.length).toBe(0);
    });
  });

  describe('getOpportunitiesSuccess', () => {
    it('should return isLoadingWhileGetting as false', () => {
      const action = opportunityActions.getOpportunitiesSuccess({ opportunities: [] });
      const newState = opportunityCatalogReducer(initialState, action);
      expect(newState.opportunities.length).toBe(0);
    });
  });

  describe('unPublishOpportunityFail', () => {
    it('should return same state as false', () => {
      const action = opportunityActions.unPublishOpportunityFail({ errorMessage: 'error message' });
      const newState = opportunityCatalogReducer(initialState, action);
      expect(newState).toStrictEqual(initialState);
    });
  });

  describe('inviteAttendees', () => {
    it('should set isLoadingWhileGetting flag as true ', () => {
      const action = opportunityActions.inviteAttendees({
        opportunitySubscription: {
          opportunityId: '123'
        }
      });
      const newState = opportunityCatalogReducer(initialState, action);
      expect(newState.isLoadingWhileGetting).toBeTruthy();
    });
  });

  describe('deleteOpportunitySuccess', () => {
    it('should return filtered opportunities as empty array', () => {
      const action = opportunityActions.deleteOpportunitySuccess({ id: '1' });
      const newState = opportunityCatalogReducer(initialState, action);
      expect(newState.opportunities.length).toBe(0);
    });

    describe('setPendingPublishOpportunityState', () => {
      it('should set pending publish opportunity ids in store', () => {
        const action = opportunityActions.setPendingPublishOpportunityState({ id: '3' });
        const newState = opportunityCatalogReducer(initialState, action);
        expect(newState.pendingPublishedOpportunityIds.length).toBe(1);
      });
    });

    describe('removePendingPublishedOpportunityIds', () => {
      it('should reset pending publish opportunity ids in store', () => {
        const state = { pendingPublishedOpportunityIds: ["12", "23"]};
        const action = opportunityActions.removePendingPublishedOpportunityIds({id: "12"});
        const newState = opportunityCatalogReducer(state, action);
        expect(newState.pendingPublishedOpportunityIds.length).toBe(1);
      });
    });

    it('should return filtered opportunities', () => {
      const newInitialState = {
        ...initialState,
        opportunities: [
          {
            opportunityId: '123',
            opportunityStatus: 'Published'
          }
        ]
      };
      const action = opportunityActions.deleteOpportunitySuccess({ id: '11' });
      const newState = opportunityCatalogReducer(newInitialState, action);
      expect(newState.opportunities[0]).toEqual(newInitialState.opportunities[0]);
    });
  });

  describe('unPublishOpportunity', () => {
    it('should return isLoadingWhileGetting as false', () => {
      const action = opportunityActions.unPublishOpportunitySuccess({ id: '' });
      const newState = opportunityCatalogReducer(initialState, action);
      expect(newState.isLoadingWhileGetting).toBeFalsy();
    });

    it('should update opportunity status with unpublished', () => {
      const newInitialState = {
        ...initialState,
        opportunities: [
          {
            opportunityId: '123',
            opportunityStatus: 'Published'
          }
        ]
      };
      const updatedOpportunity = {
        ...newInitialState.opportunities[0],
        opportunityStatus: 'Unpublished'
      };
      const action = opportunityActions.unPublishOpportunitySuccess({ id: updatedOpportunity.opportunityId });
      const newState = opportunityCatalogReducer(newInitialState, action);
      expect(newState.opportunities[0]).toEqual(updatedOpportunity);
    });

    it('should update opportunity status with published, opportunity do not match', () => {
      const newInitialState = {
        ...initialState,
        opportunities: [
          {
            opportunityId: '123',
            opportunityStatus: 'Published'
          }
        ]
      };
      const updatedOpportunity = {
        ...newInitialState.opportunities[0],
        opportunityStatus: 'Published'
      };
      const action = opportunityActions.unPublishOpportunitySuccess({ id: '111' });
      const newState = opportunityCatalogReducer(newInitialState, action);
      expect(newState.opportunities[0]).toEqual(updatedOpportunity);
    });
  });

  describe('getOpportunitiesFail', () => {
    it('should return isLoadingWhileGetting as false', () => {
      const action = opportunityActions.getOpportunitiesFail({ errorMessage: null });
      const newState = opportunityCatalogReducer(initialState, action);
      expect(newState.isLoadingWhileGetting).toBeFalsy;
    });
  });

  describe('userChangesCatalogFilter', () => {
    it('should return opportunityName as null', () => {
      const filters = {
        opportunityName: null,
        assetType: null,
        offerType: null,
        deliveryType: null,
        status: null
      };
      const action = opportunityActions.userChangesCatalogFilter(filters);
      const newState = opportunityCatalogReducer(initialState, action);
      expect(newState.filters.opportunityName).toBeNull();
    });
  });

  describe('userLeavesCatalogPage', () => {
    it('should set filter to the initial state', () => {
      const action = opportunityActions.userLeavesCatalogPage();
      const newState = opportunityCatalogReducer(initialState, action);
      expect(newState.filters).toEqual(
        expect.objectContaining({
          opportunityName: null,
          assetType: null,
          offerType: null,
          deliveryType: null,
          status: null
        })
      );
    });
  });

  describe('inviteAttendeesSuccess', () => {
    it('should return isLoadingWhileGetting as false', () => {
      const action = opportunityActions.inviteAttendeesSuccess({ opportunitySubscriptionIds: [] });
      const newState = opportunityCatalogReducer(initialState, action);
      expect(newState.isLoadingWhileGetting).toBeFalsy();
    });
  });

  describe('inviteAttendeesFail', () => {
    it('should return isLoadingWhileGetting as false', () => {
      const action = opportunityActions.inviteAttendeesFail({ errorMessage: null });
      const newState = opportunityCatalogReducer(initialState, action);
      expect(newState.isLoadingWhileGetting).toBeFalsy;
    });
  });

  describe('Update media', () => {
    it('should return updated media for catalog', () => {
      const action = opportunityActions.updateMedia({ catalogMedia: [{ fileId: 'test', signedUrl: 'signedUrl' }] });
      const newState = opportunityCatalogReducer(initialState, action);
      expect(newState.catalogMedia.length).toBe(1);
    });
  });

  describe('data objects workflow', () => {
    it('should return getMlConnectionInfo', () => {
      const action = opportunityActions.getMlConnectionInfoSuccess({
        mlConnectionInfo: {
          baseUrl: '',
          userId: 'mlUser',
          accessToken: 'mlToken'
        }
      });
      const newState = opportunityCatalogReducer(initialState, action);
      expect(newState.mlConnectionInfo).toEqual({
        baseUrl: '',
        userId: 'mlUser',
        accessToken: 'mlToken'
      });
    });

    it('should return getActiveTables', () => {
      const action = opportunityActions.getActiveTablesSuccess({
        tables: []
      });
      const newState = opportunityCatalogReducer(initialState, action);
      expect(newState.activeTables.length).toEqual(0);
    });

    it('should return dataObjectsFetched', () => {
      const action = opportunityActions.getDataObjectCountFail({
        errorMessage: 'Error'
      });
      const newState = opportunityCatalogReducer(initialState, action);
      expect(newState.dataObjectsFetched).toBeTruthy();
    });
    it('should return getLayerMetadata for active tables', () => {
      const action = opportunityActions.getLayerMetadataSuccess({
        layerMetadata: [
          {
            layerName: 'Seismic2D',
            displayName: 'Seismic2D',
            maplargeTable: 'SeismicSurvey2d',
            shapeType: 'geo.line',
            primaryKey: 'recordId',
            icon: 'apollo:2d-seismic'
          }
        ]
      });
      initialState.activeTables = [
        {
          id: 'test/SeismicSurvey2d',
          name: 'SeismicSurvey2d'
        }
      ];
      const newState = opportunityCatalogReducer(initialState, action);
      expect(newState.layerMetadata.length).toEqual(1);
    });
    it('should return getDataObjectCount', () => {
      const action = opportunityActions.getDataObjectCountSuccess({
        dataObjects: [
          {
            id: 'd812a8f7b5694b8087a86b3f968ba5d8',
            hash: null,
            success: true,
            processingComplete: true,
            isCached: false,
            authorized: true,
            errors: [],
            timestamp: 1660812011,
            data: {
              OpportunityId: ['OP-VD7-00'],
              OpportunityId_Count: [1],
              layer: 'Seismic2D',
              icon: 'apollo:2d-seismic'
            },
            core: 'ML',
            actionCategory: 'table',
            actionVerb: 'query',
            incompleteRequestID: null,
            incompleteRequestServer: null,
            post: 'success'
          },
          {
            id: 'd812a8f7b5694b8087a86b3f968ba5d8',
            hash: null,
            success: true,
            processingComplete: true,
            isCached: false,
            authorized: true,
            errors: [],
            timestamp: 1660812011,
            data: {
              OpportunityId: ['OP-VD7-00'],
              OpportunityId_Count: [5],
              layer: 'Asset',
              icon: 'apollo:2d-seismic'
            },
            core: 'ML',
            actionCategory: 'table',
            actionVerb: 'query',
            incompleteRequestID: null,
            incompleteRequestServer: null,
            post: 'success'
          }
        ]
      });
      initialState.opportunities = [
        <any>{
          opportunityId: 'OP-VD7-00'
        },
        <any>{
          opportunityId: 'OP-VD7-01'
        }
      ];
      const newState = opportunityCatalogReducer(initialState, action);
      expect(newState.opportunities[0].dataObjects.length).toEqual(2);
    });
  });
});
