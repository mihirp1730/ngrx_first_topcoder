import * as opportunityPanelSelectors from './opportunity-panel.selectors';

describe('state selectors', () => {
  describe('selectOpportunities', () => {
    it('should select the opportunities', () => {
      const state = {
        opportunities: []
      };
      const selection = opportunityPanelSelectors.selectOpportunities.projector(state);
      expect(selection).toBe(state.opportunities);
    });
  });

  describe('selectOpportunitiesError', () => {
    it('should select the opportunities error', () => {
      const state = {
        error: 'Error'
      };
      const selection = opportunityPanelSelectors.selectOpportunitiesError.projector(state);
      expect(selection).toBe(state.error);
    });
  });
  describe('selectLoaderFlag', () => {
    it('should select the show loader flag', () => {
      const state = {
        showLoader: true
      };
      const selection = opportunityPanelSelectors.selectLoaderFlag.projector(state);
      expect(selection).toBe(state.showLoader);
    });
  });

  describe('selectCurrentPageNumber', () => {
    it('should select the current page number', () => {
      const state = {
        currentPageNumber: 2
      };
      const selection = opportunityPanelSelectors.selectCurrentPageNumber.projector(state);
      expect(selection).toBe(state.currentPageNumber);
    });
  });

  describe('selectFilteredOpportunities', () => {
    it('should select the filtered opportunities id', () => {
      const state = {
        filteredOpportunities: []
      };
      const selection = opportunityPanelSelectors.selectFilteredOpportunities.projector(state);
      expect(selection).toBe(state.filteredOpportunities);
    });
  });

  describe('selectedOpportunityId', () => {
    it('should select the opportunity id', () => {
      const state = {
        selectedOpportunityId: 'test12'
      };
      const selection = opportunityPanelSelectors.selectedOpportunityId.projector(state);
      expect(selection).toBe(state.selectedOpportunityId);
    });
  });

  describe('selectSearchTerm', () => {
    it('should select search term', () => {
      const state = {
        searchTerm: 'test1'
      };
      const selection = opportunityPanelSelectors.selectSearchTerm.projector(state);
      expect(selection).toBe(state.searchTerm);
    });
  });

  describe('selectLassoArea', () => {
    it('should select Lasso selected area', () => {
      const state = {
        selectedLassoArea: 'test polygon'
      };
      const selection = opportunityPanelSelectors.selectLassoArea.projector(state);
      expect(selection).toBe(state.selectedLassoArea);
    });
  });

  describe('selectFilterWhereClause', () => {
    it('should select where clause related with filters', () => {
      const state = {
        whereClause: [
          {
            col: 'Asset',
            test: 'EqualAny',
            value: 'test'
          }
        ]
      };
      const selection = opportunityPanelSelectors.selectFilterWhereClause.projector(state);
      expect(selection).toBe(state.whereClause);
    });
  });

  describe('deduceOpportunities', () => {
    it('should filter opportunity with name', () => {
      const state = [
        {
          opportunityName: 'test 1'
        },
        {
          opportunityName: 'test 2'
        }
      ];
      const filters = 'test 1';
      const selection = opportunityPanelSelectors.deduceOpportunities.projector(state, filters);
      expect(selection[0].opportunityName).toEqual(state[0].opportunityName);
    });
  });

  describe('selectFilteredLayers', () => {
    it('should select filtered layer', () => {
      const state = {
        selectedLayers: ['Asset']
      };
      const selection = opportunityPanelSelectors.selectFilteredLayers.projector(state);
      expect(selection).toBe(state.selectedLayers);
    });
  });

  describe('selectIsFilterSelected', () => {
    it('should select is filter selected', () => {
      const state = {
        filterSelected: true
      };
      const selection = opportunityPanelSelectors.selectIsFilterSelected.projector(state);
      expect(selection).toBe(true);
    });
  });

  describe('selectTotalOpportunities', () => {
    it('should select total opportunities', () => {
      const state = {
        totalOpportunities: 10
      };
      const selection = opportunityPanelSelectors.opportunitiesTotal.projector(state);
      expect(selection).toBe(10);
    });
  });

  describe('selectUseMapExtents', () => {
    it('should select total useMapExtends from map wrapper selector', () => {
      const state = {
        useMapExtents: true
      };
      const selection = opportunityPanelSelectors.selectUseMapExtents.projector(state);
      expect(selection).toBeTruthy();
    });
  });

  describe('dataOpportunityWorkFlow', () => {
    it('should select total dataOpportunityWorkflow from map wrapper selector', () => {
      const state = {
        dataOpportunityWorkflow: true
      };
      const selection = opportunityPanelSelectors.dataOpportunityWorkFlow.projector(state);
      expect(selection).toBeTruthy();
    });
  });

  describe('selectisMapLoaded', () => {
    it('should select is map loaded selector', () => {
      const state = {
        isMapLoaded: true
      };
      const selection = opportunityPanelSelectors.selectIsMapLoaded.projector(state);
      expect(selection).toBeTruthy();
    });
  });

  describe('selectLoader', () => {
    it('should select loader selector', () => {
      const state = {
        isLoading: true
      };
      const selection = opportunityPanelSelectors.selectLoader.projector(state);
      expect(selection).toBeTruthy();
    });
  });

  describe('selectMlConnectionInfor', () => {
    it('should select ml connection info selector', () => {
      const state = {
        mlConnectionInfo: {
          acessToken: "testtoken",
          baseUrl: "testurl",
          userId: "test_user"
        }
      };
      const selection = opportunityPanelSelectors.selectMlConnectionInfo.projector(state);      
      expect(selection).toBe(state.mlConnectionInfo);
    });
  });
});
