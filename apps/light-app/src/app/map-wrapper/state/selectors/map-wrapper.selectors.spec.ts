import { SidePanelViews } from '../../enums';
import * as mapWrapperSelectors from './map-wrapper.selectors';

describe('state selectors', () => {
  describe('selectMapSelectionSpatialQuery', () => {
    it('should select showingHamburgerMenu from the provided state', () => {
      const spatialQuery = {};
      const state = { map: { selection: { spatialQuery } } };
      const selection = mapWrapperSelectors.selectMapSelectionSpatialQuery.projector(state);
      expect(selection).toBe(spatialQuery);
    });
  });
  describe('selectShowingHamburgerMenu', () => {
    it('should select showingHamburgerMenu from the provided state', () => {
      const state = { showingHamburgerMenu: {} };
      const selection = mapWrapperSelectors.selectShowingHamburgerMenu.projector(state);
      expect(selection).toBe(state.showingHamburgerMenu);
    });
  });
  describe('selectShowingLayerPanel', () => {
    it('should select showingLayerPanel from the provided state', () => {
      const state = { showingLayerPanel: {} };
      const selection = mapWrapperSelectors.selectShowingLayerPanel.projector(state);
      expect(selection).toBe(state.showingLayerPanel);
    });
  });
  describe('selectShowingRecordDetailsPanel', () => {
    it('should select showingRecordDetailsPanel from the provided state', () => {
      const state = { showingRecordDetailsPanel: {} };
      const selection = mapWrapperSelectors.selectShowingRecordDetailsPanel.projector(state);
      expect(selection).toBe(state.showingRecordDetailsPanel);
    });
  });
  describe('selectShowingRecordListPanel', () => {
    it('should select showingRecordListPanel from the provided state', () => {
      const state = { showingRecordListPanel: {} };
      const selection = mapWrapperSelectors.selectShowingRecordListPanel.projector(state);
      expect(selection).toBe(state.showingRecordListPanel);
    });
  });
  describe('selectSelectedOpportunityId', () => {
    it('should select selectedOpportunityId from the provided state', () => {
      const state = { selectedOpportunityId: '123' };
      const selection = mapWrapperSelectors.selectSelectedOpportunityId.projector(state);
      expect(selection).toBe(state.selectedOpportunityId);
    });
  });
  describe('selectShowingBasemap', () => {
    it('should select showingRecordListPanel from the provided state', () => {
      const state = { showingBasemap: false };
      const selection = mapWrapperSelectors.selectShowingBasemap.projector(state);
      expect(selection).toBe(state.showingBasemap);
    });
  });
  describe('selectUseMapExtents', () => {
    it('should select useMapExtents from the provided state', () => {
      const state = { useMapExtents: {} };
      const selection = mapWrapperSelectors.selectUseMapExtents.projector(state);
      expect(selection).toBe(state.useMapExtents);
    });
  });

  describe('selectLayersOrFiltersHaveChanged', () => {
    it('should select layersOrFiltersHaveChanged from the provided state', () => {
      const state = { layersOrFiltersHaveChanged: true };
      const selection = mapWrapperSelectors.selectLayersOrFiltersHaveChanged.projector(state);
      expect(selection).toBe(state.layersOrFiltersHaveChanged);
    });
  });

  describe('selectSearchTerm', () => {
    it('should select searchTerm from the provided state', () => {
      const state = { searchTerm: 'test' };
      const selection = mapWrapperSelectors.selectSearchTerm.projector(state);
      expect(selection).toBe(state.searchTerm);
    });
  });
});

describe('state deductions', () => {
  describe('deduceCurrentSidepanel', () => {
    it('should return Layer panel', () => {
      const result = mapWrapperSelectors.deduceCurrentSidepanel.projector(false, true, false, false);
      expect(result).toBe(SidePanelViews.LAYERS);
    });
    it('should return hamburger menu', () => {
      const result = mapWrapperSelectors.deduceCurrentSidepanel.projector(true, false, false, false);
      expect(result).toBe(SidePanelViews.MENU);
    });
    it('should return detail panel', () => {
      const result = mapWrapperSelectors.deduceCurrentSidepanel.projector(false, false, true, false);
      expect(result).toBe(SidePanelViews.DETAIL);
    });
    it('should return results panel', () => {
      const result = mapWrapperSelectors.deduceCurrentSidepanel.projector(false, false, false, true);
      expect(result).toBe(SidePanelViews.RESULTS);
    });
    it('should return no panel', () => {
      const result = mapWrapperSelectors.deduceCurrentSidepanel.projector(false, false, false, false);
      expect(result).toBe(SidePanelViews.EMPTY);
    });
  });
  describe('deduceShowSearchBar', () => {
    it('should return false with a layers sidepanel view', () => {
      const sidePanelView = SidePanelViews.LAYERS;
      const result = mapWrapperSelectors.deduceShowSearchBar.projector(sidePanelView);
      expect(result).toBe(false);
    });
    it('should return true by default ', () => {
      const sidePanelView = null;
      const result = mapWrapperSelectors.deduceShowSearchBar.projector(sidePanelView);
      expect(result).toBe(true);
    });
  });
  describe('selectFilterWhereClause', () => {
    it('should return selected filter clause', () => {
      const state = {
        whereClause: 'where clause'
      };
      const result = mapWrapperSelectors.selectFilterWhereClause.projector(state);
      expect(result).toBe(state.whereClause);
    });
  });
  describe('selectLassoArea', () => {
    it('should return selected lasso area', () => {
      const state = {
        selectedLassoArea: 'lasso area'
      };
      const result = mapWrapperSelectors.selectLassoArea.projector(state);
      expect(result).toBe(state.selectedLassoArea);
    });
  });
  describe('selectGISMapClickShape', () => {
    it('should return selectGISMapClickShape flag', () => {
      const state = {
        isShapeSelected: true
      };
      const result = mapWrapperSelectors.selectGISMapClickShape.projector(state);
      expect(result).toBeTruthy();
    });
  });
  describe('selectFilteredLayers', () => {
    it('should return selected filter clause', () => {
      const state = {
        selectedLayers: 'lasso area'
      };
      const result = mapWrapperSelectors.selectFilteredLayers.projector(state);
      expect(result).toBe(state.selectedLayers);
    });
  });
  describe('selectFilteredOpportunities', () => {
    it('should return selected filter opportunities', () => {
      const state = {
        filteredOpportunities: []
      };
      const result = mapWrapperSelectors.selectFilteredOpportunities.projector(state);
      expect(result).toBe(state.filteredOpportunities);
    });
  });
  describe('totalOpportunities', () => {
    it('should return selected filter total opportunities', () => {
      const state = {
        totalOpportunities: 10
      };
      const result = mapWrapperSelectors.selectTotalOpportunities.projector(state);
      expect(result).toBe(state.totalOpportunities);
    });
  });
  describe('deduceShowSidepanel', () => {
    it('should return false with no sidepanel view', () => {
      const sidePanelView = SidePanelViews.EMPTY;
      const result = mapWrapperSelectors.deduceShowSidepanel.projector(sidePanelView);
      expect(result).toBe(false);
    });
    it('should return true by default ', () => {
      const sidePanelView = null;
      const result = mapWrapperSelectors.deduceShowSidepanel.projector(sidePanelView);
      expect(result).toBe(true);
    });
  });
  describe('deduceGisGetSearchResultRequest', () => {
    it('should return layersOrFiltersHaveChanged and searchTerm', () => {
      const myValues = { layersOrFiltersHaveChanged: true, spatialQuery: 'WKT', searchTerm: 'test' };
      const result = mapWrapperSelectors.deduceGisGetSearchResultRequest.projector(true, 'WKT', 'test');
      expect(result).toEqual(myValues);
    });
  });
});
