import { random } from 'lodash';

import * as mapWrapperActions from '../actions/map-wrapper.actions';
import { initialState } from '../map-wrapper.state';
import { mapWrapperReducer } from './map-wrapper.reducer';

describe('MapWrapperReducer', () => {
  describe('unknown action', () => {
    it('should return the default state', () => {
      const action = { type: 'Unknown' };
      const state = mapWrapperReducer(initialState, action);
      expect(state).toBe(initialState);
    });
  });

  describe('closeSidepanel action', () => {
    it('should handle "Close" GisCanvas toolbar actions', () => {
      const preparedState = {
        ...initialState,
        showingHamburgerMenu: true,
        showingLayerPanel: true,
        showingRecordDetailsPanel: true,
        showingRecordListPanel: true,
        useMapExtents: true
      };
      const action = mapWrapperActions.closeSidepanel();
      const newState = mapWrapperReducer(preparedState, action);
      expect(newState).not.toBe(preparedState);
      expect(newState).toEqual({
        ...preparedState,
        showingHamburgerMenu: false,
        showingLayerPanel: false,
        showingRecordDetailsPanel: false,
        showingRecordListPanel: false,
        useMapExtents: false
      });
    });
  });

  describe('handleGisCanvasClick action', () => {
    it('should return state with bad default radius', () => {
      const preparedState = {
        ...initialState,
        map: {
          ...initialState.map,
          zoom: 1,
          zoomToRadius: { '0': 123 }
        }
      };
      const action = mapWrapperActions.handleGisCanvasClick({ lat: 1, lng: 2 });
      const newState = mapWrapperReducer(preparedState, action);
      expect(newState).toBe(preparedState);
    });
    it('should return with map selection spatialQuery', () => {
      const preparedState = {
        ...initialState,
        map: {
          ...initialState.map,
          zoom: 1,
          zoomToRadius: { '1': 123 }
        }
      };
      const action = mapWrapperActions.handleGisCanvasClick({ lat: 1, lng: 2 });
      const newState = mapWrapperReducer(preparedState, action);
      expect(newState).not.toBe(preparedState);
      expect(newState).toEqual({
        ...preparedState,
        map: {
          ...preparedState.map,
          selection: {
            ...preparedState.map.selection,
            spatialQuery: 'CIRCLE(2 1,123)'
          }
        }
      });
    });
  });

  describe('handleGisCanvasCenterChange action', () => {
    it('should update the center value', () => {
      const center = {
        lat: random(1, Number.MAX_SAFE_INTEGER),
        lng: random(1, Number.MAX_SAFE_INTEGER)
      };
      expect(initialState.map.center.lat).toBe(null);
      expect(initialState.map.center.lng).toBe(null);
      const action = mapWrapperActions.handleGisCanvasCenterChange({ center });
      const newState = mapWrapperReducer(initialState, action);
      expect(newState).not.toBe(initialState);
      expect(newState.map.center).not.toBe(center);
      expect(newState.map.center).toEqual(center);
    });
    it('should not update the center value if the same', () => {
      const { lat, lng } = initialState.map.center;
      const center = { lat, lng };
      expect(initialState.map.center.lat).toBe(null);
      expect(initialState.map.center.lng).toBe(null);
      const action = mapWrapperActions.handleGisCanvasCenterChange({ center });
      const newState = mapWrapperReducer(initialState, action);
      expect(newState).toBe(initialState);
      expect(newState.map.center).toBe(initialState.map.center);
    });
  });

  describe('handleGisCanvasLoadedLayers action', () => {
    it('should update the map is loading to false', () => {
      const preparedState = {
        ...initialState,
        map: {
          ...initialState.map,
          isLoading: true
        }
      };
      const action = mapWrapperActions.handleGisCanvasLoadedLayers();
      const newState = mapWrapperReducer(preparedState, action);
      expect(newState).not.toBe(preparedState);
      expect(newState.map.isLoading).toBe(false);
    });
  });

  describe('handleGisCanvasSelection action', () => {
    it('should update the map selection spatialQuery', () => {
      const spatialQuery = 'spatialQuery';
      const action = mapWrapperActions.handleGisCanvasSelection({ spatialQuery });
      const newState = mapWrapperReducer(initialState, action);
      expect(newState).not.toBe(initialState);
      expect(newState.map.selection.spatialQuery).toBe('spatialQuery');
    });
  });

  describe('handleGisCanvasToolBarAction action', () => {
    it('should handle "Back" GisCanvas toolbar actions', () => {
      expect(initialState.showingLayerPanel).toBe(false);
      const layerAction = mapWrapperActions.showLayerPanel();
      const newState = mapWrapperReducer(initialState, layerAction);
      expect(newState).not.toBe(initialState);
      expect(newState.showingLayerPanel).toBe(true);
      const action = mapWrapperActions.handleGisCanvasToolBarAction({ action: 'Back' });
      const finalState = mapWrapperReducer(newState, action);
      expect(finalState).not.toBe(newState);
      expect(finalState.showingLayerPanel).toBe(false);
    });
    it('should handle "Close" GisCanvas toolbar actions', () => {
      const preparedState = {
        ...initialState,
        showingHamburgerMenu: true,
        showingLayerPanel: true,
        showingRecordDetailsPanel: true,
        showingRecordListPanel: true,
        useMapExtents: true
      };
      const action = mapWrapperActions.handleGisCanvasToolBarAction({ action: 'Close' });
      const newState = mapWrapperReducer(preparedState, action);
      expect(newState).not.toBe(preparedState);
      expect(newState).toEqual({
        ...preparedState,
        showingHamburgerMenu: false,
        showingLayerPanel: false,
        showingRecordDetailsPanel: false,
        showingRecordListPanel: false,
        useMapExtents: false
      });
    });
    it('should handle unknown GisCanvas toolbar actions', () => {
      const action = mapWrapperActions.handleGisCanvasToolBarAction({ action: null });
      const newState = mapWrapperReducer(initialState, action);
      expect(newState).toBe(initialState);
    });
  });

  describe('handleGisCanvasZoomChange action', () => {
    it('should update the zoom value', () => {
      const zoom = random(1, Number.MAX_SAFE_INTEGER);
      expect(initialState.map.zoom).toBe(null);
      const action = mapWrapperActions.handleGisCanvasZoomChange({ zoom });
      const newState = mapWrapperReducer(initialState, action);
      expect(newState).not.toBe(initialState);
      expect(newState.map.zoom).toBe(zoom);
    });
    it('should not update the zoom value if the same', () => {
      const zoom = initialState.map.zoom;
      expect(initialState.map.zoom).toBe(null);
      const action = mapWrapperActions.handleGisCanvasZoomChange({ zoom });
      const newState = mapWrapperReducer(initialState, action);
      expect(newState).toBe(initialState);
      expect(newState.map.zoom).toBe(zoom);
    });
  });

  describe('newZoomToRadiusMap action', () => {
    it('should switch on the showingRecordDetailsPanel value', () => {
      const zoomToRadius = { '0': 1000 };
      const action = mapWrapperActions.newZoomToRadiusMap({ zoomToRadius });
      const newState = mapWrapperReducer(initialState, action);
      expect(newState).not.toBe(initialState);
      expect(newState.map.zoomToRadius).toBe(zoomToRadius);
    });
  });

  describe('openMapWrapperComponent action', () => {
    it('should update the map is loading to true', () => {
      const preparedState = {
        ...initialState,
        map: {
          ...initialState.map,
          isLoading: false
        }
      };
      const action = mapWrapperActions.openMapWrapperComponent();
      const newState = mapWrapperReducer(preparedState, action);
      expect(newState).not.toBe(preparedState);
      expect(newState.map.isLoading).toBe(true);
    });
  });

  describe('openRecordDetails action', () => {
    it('should switch on the showingRecordDetailsPanel value', () => {
      expect(initialState.showingRecordDetailsPanel).toBe(false);
      const action = mapWrapperActions.openRecordDetails();
      const newState = mapWrapperReducer(initialState, action);
      expect(newState).not.toBe(initialState);
      expect(newState.showingRecordDetailsPanel).toBe(true);
    });
  });

  describe('openRecordDetailsFromSingleResult action', () => {
    it('should turn off the useMapExtents value', () => {
      const preState = { ...initialState, useMapExtents: null };
      const action = mapWrapperActions.openRecordDetailsFromSingleResult();
      const state = mapWrapperReducer(preState, action);
      expect(state).not.toBe(preState);
      expect(state.useMapExtents).toBe(false);
    });
  });

  describe('openRecordResultsList action', () => {
    it('should switch on the showingRecordListPanel value', () => {
      expect(initialState.showingRecordListPanel).toBe(false);
      const action = mapWrapperActions.openRecordResultsList();
      const newState = mapWrapperReducer(initialState, action);
      expect(newState).not.toBe(initialState);
      expect(newState.showingRecordListPanel).toBe(true);
    });
  });

  describe('setSelectedOpportunityId action', () => {
    it('should set Is Selected Record Opportunity value', () => {
      const opportunityId = 'opportunityId';
      expect(initialState.selectedOpportunityId).toBe(null);
      const action = mapWrapperActions.setSelectedOpportunityId({ opportunityId });
      const newState = mapWrapperReducer(initialState, action);
      expect(newState).not.toBe(initialState);
      expect(newState.selectedOpportunityId).toEqual(opportunityId);
    });
  });

  describe('toggleHamburgerMenu action', () => {
    it('should switch the showingHamburgerMenu value', () => {
      expect(initialState.showingHamburgerMenu).toBe(false);
      const action = mapWrapperActions.toggleHamburgerMenu();
      const newState = mapWrapperReducer(initialState, action);
      expect(newState).not.toBe(initialState);
      expect(newState.showingHamburgerMenu).toBe(true);
    });
  });

  describe('showLayerPanel action', () => {
    it('should switch on the showingLayerPanel value', () => {
      expect(initialState.showingLayerPanel).toBe(false);
      const action = mapWrapperActions.showLayerPanel();
      const newState = mapWrapperReducer(initialState, action);
      expect(newState).not.toBe(initialState);
      expect(newState.showingLayerPanel).toBe(true);
    });
  });

  describe('toggleUseMapExtents action', () => {
    it('should switch the useMapExtents value', () => {
      expect(initialState.useMapExtents).toBe(false);
      const action = mapWrapperActions.toggleUseMapExtents({ dataOpportunityWorkflow: false });
      const newState = mapWrapperReducer(initialState, action);
      expect(newState).not.toBe(initialState);
      expect(newState.useMapExtents).toBe(true);
    });
  });

  describe('toggleBasemap action', () => {
    it('should switch the showingBasemap value', () => {
      expect(initialState.showingBasemap).toBe(false);
      const action = mapWrapperActions.toggleBasemap();
      const newState = mapWrapperReducer(initialState, action);
      expect(newState).not.toBe(initialState);
      expect(newState.showingBasemap).toBe(true);
    });
  });

  describe('Change Layer or Filter action', () => {
    it('should set layersOrFiltersHaveChanged to true', () => {
      expect(initialState.layersOrFiltersHaveChanged).toBe(false);
      const action = mapWrapperActions.changeLayerOrFilter();
      const newState = mapWrapperReducer(initialState, action);
      expect(newState).not.toBe(initialState);
      expect(newState.layersOrFiltersHaveChanged).toBe(true);
    });
  });

  describe('resetLayersAndFiltersSuccess action', () => {
    it('should set layersOrFiltersHaveChanged to false', () => {
      const preparedState = {
        ...initialState,
        layersOrFiltersHaveChanged: true
      };
      const action = mapWrapperActions.resetLayersAndFiltersSuccess();
      const newState = mapWrapperReducer(preparedState, action);
      expect(newState).not.toBe(preparedState);
      expect(newState.layersOrFiltersHaveChanged).toBe(false);
    });
  });

  describe('SetSearchTerm action', () => {
    it('should set search term to string value', () => {
      expect(initialState.searchTerm).toBe(null);
      const action = mapWrapperActions.searchExecuted({ term: 'test' });
      const newState = mapWrapperReducer(initialState, action);
      expect(newState).not.toBe(initialState);
      expect(newState.searchTerm).toBe('test');
    });
  });
});
