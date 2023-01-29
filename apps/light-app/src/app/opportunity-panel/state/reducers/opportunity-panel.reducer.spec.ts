import * as opportunityPanelActions from '../actions/opportunity-panel.actions';
import { initialState } from '../opportunity-panel.state';
import { opportunityPanelReducer } from './opportunity-panel.reducer';

describe('OpportunityPanelReducer', () => {
  describe('unknown action', () => {
    it('should return the default state', () => {
      const action = { type: 'Unknown' };
      const state = opportunityPanelReducer(initialState, action);
      expect(state).toBe(initialState);
    });
  });

  describe('getOpportunitiesSuccess', () => {
    it('should set the state of opportunity panel', () => {
      const action = opportunityPanelActions.getOpportunitiesSuccess({ opportunities: [] as any, totalOpportunities: 10 });
      const newState = opportunityPanelReducer(initialState, action);
      expect(newState.error).toBeNull();
      expect(newState.opportunities).toEqual([]);
    });
  });

  describe('getOpportunitiesFail', () => {
    it('should set the state of opportunity panel', () => {
      const action = opportunityPanelActions.getOpportunitiesFail({ errorMessage: 'Error' });
      const newState = opportunityPanelReducer(initialState, action);
      expect(newState.error).toBe('Error');
      expect(newState.opportunities).toEqual([]);
    });
  });

  describe('setSelectedOpportunityId', () => {
    it('should set the selected opportunity Id', () => {
      const action = opportunityPanelActions.setSelectedOpportunityId({ opportunityId: 'test12' });
      const newState = opportunityPanelReducer(initialState, action);
      expect(newState.selectedOpportunityId).toBe('test12');
    });
  });

  describe('setGISMapClickSelection', () => {
    it('should set the setGISMapClickSelection flag', () => {
      const action = opportunityPanelActions.setGISMapClickSelection({ isShapeSelected: true });
      const newState = opportunityPanelReducer(initialState, action);
      expect(newState.isShapeSelected).toBeTruthy();
    });
  });

  describe('setLoaderFlag', () => {
    it('should set the setGISMapClickSelection flag', () => {
      const action = opportunityPanelActions.setLoaderFlag({ showLoader: true });
      const newState = opportunityPanelReducer(initialState, action);
      expect(newState.showLoader).toBeTruthy();
    });
  });

  describe('setSearchTerm', () => {
    it('should set the search term', () => {
      const action = opportunityPanelActions.setSearchTerm({ searchTerm: 'test12' });
      const newState = opportunityPanelReducer(initialState, action);
      expect(newState.searchTerm).toBe('test12');
    });
  });

  describe('setLassoSelection', () => {
    it('should set the LassoSelection polygon', () => {
      const action = opportunityPanelActions.setLassoSelection({ selectedLassoArea: 'test' } as any);
      const newState = opportunityPanelReducer(initialState, action);
      expect(newState.selectedLassoArea).toBe('test');
    });
  });

  describe('setLayerAttributes', () => {
    it('should set the LassoSelection polygon', () => {
      const whereClause = [
        {
          col: 'Asset',
          test: 'EqualAny',
          value: 'test'
        }
      ];
      const action = opportunityPanelActions.setLayerAttributes({ whereClause });
      const newState = opportunityPanelReducer(initialState, action);
      expect(newState.whereClause).toBe(whereClause);
    });
  });

  describe('getFilteredOpportunitiesSuccess', () => {
    it('should set the filtered opportunities', () => {
      const opportunity = [
        {
          opportunityId: 'test'
        }
      ];
      const action = opportunityPanelActions.getFilteredOpportunitiesSuccess({
        filteredOpportunities: opportunity,
        totalOpportunities: 10
      });
      const newState = opportunityPanelReducer(initialState, action);
      expect(newState.filteredOpportunities).toStrictEqual(opportunity);
    });
  });

  describe('getFilteredOpportunitiesFail', () => {
    it('should set the filtered opportunities', () => {
      const action = opportunityPanelActions.getFilteredOpportunitiesFail({ errorMessage: '' });
      const newState = opportunityPanelReducer(initialState, action);
      expect(newState.filteredOpportunities).toStrictEqual([]);
    });
  });

  describe('getDataObjectCountSuccess', () => {
    it('should set the data object count', () => {
      const opportunities = [
        {
          opportunityId: 'OP-VD7-1lmzzpkfpcmo-492307820393',
          dataObjects: [
            {
              count: 6,
              name: 'Seismic 3D Survey',
              entityIcon: 'apollo:SeismicSurvey3d'
            },
            {
              count: 3,
              name: 'Well',
              entityIcon: 'apollo:Well'
            }
          ]
        }
      ];
      initialState.filteredOpportunities = [
        {
          opportunityId: 'OP-VD7-1lmzzpkfpcmo-492307820393',
          dataObjects: [
            {
              count: 6,
              name: 'Seismic 3D Survey',
              entityIcon: 'apollo:SeismicSurvey3d'
            }
          ]
        }
      ];
      const action = opportunityPanelActions.getDataObjectCountSuccess({ opportunities });
      const newState = opportunityPanelReducer(initialState, action);
      expect(newState.filteredOpportunities).toStrictEqual(opportunities);
    });
  });

  describe('setSelectedLayers', () => {
    it('should set the selected layers', () => {
      const action = opportunityPanelActions.setSelectedLayers({ selectedLayers: ['Asset'], filterSelected: true });
      const newState = opportunityPanelReducer(initialState, action);
      expect(newState.selectedLayers).toStrictEqual(['Asset']);
    });
  });

  describe('setLayers', () => {
    it('should set layers', () => {
      const action = opportunityPanelActions.setLayers({ selectedLayers: ['Asset'], filterSelected: true });
      const newState = opportunityPanelReducer(initialState, action);
      expect(newState.selectedLayers).toStrictEqual(['Asset']);
    });
  });

  describe('loadMoreOpportunities', () => {
    it('should fetch opportunities', () => {
      const action = opportunityPanelActions.loadMoreOpportunities({ pageNumber: 2 });
      const newState = opportunityPanelReducer(initialState, action);
      expect(newState.currentPageNumber).toStrictEqual(2);
    });
  });

  describe('getMlConnectionInfoSuccess', () => {
    it('should fetch mlConnectionInfo', () => {
      const mlConnectionInfo = {
        accessToken: "testtoken",
        baseUrl: "testurl",
        userId: "test_user"
      }
      const action = opportunityPanelActions.getMlConnectionInfoSuccess({ mlConnectionInfo });
      const newState = opportunityPanelReducer(initialState, action);
      expect(newState.mlConnectionInfo).toStrictEqual(mlConnectionInfo);
    });
  });

  describe('should set isMapLoaded State', () => {
    it('should set isMapLoaded', () => {
      const action = opportunityPanelActions.isMapLoaded({ isMapLoaded: true });
      const newState = opportunityPanelReducer(initialState, action);
      expect(newState.isMapLoaded).toStrictEqual(true);
    });
  });
});
