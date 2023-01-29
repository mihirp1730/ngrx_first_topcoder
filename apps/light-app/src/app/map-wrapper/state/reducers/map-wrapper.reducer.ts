import { createReducer, on } from '@ngrx/store';

import * as mapWrapperActions from '../actions/map-wrapper.actions';
import { initialState, State } from '../map-wrapper.state';

export const mapWrapperFeatureKey = 'map-wrapper';

const _mapWrapperReducer = createReducer(
  initialState,
  on(mapWrapperActions.closeSidepanel, (state): State => {
    return {
      ...state,
      map: {
        ...state.map,
        selection: {
          ...state.map.selection,
          spatialQuery: null
        }
      },
      searchTerm: null,
      showingHamburgerMenu: false,
      showingLayerPanel: false,
      showingRecordDetailsPanel: false,
      showingRecordListPanel: false,
      useMapExtents: false
    };
  }),
  on(mapWrapperActions.handleGisCanvasClick, (state, { lat, lng }): State => {
    const radius = state.map.zoomToRadius[state.map.zoom] ?? null;
    if (radius === null) {
      return state;
    }
    return {
      ...state,
      map: {
        ...state.map,
        selection: {
          ...state.map.selection,
          spatialQuery: `CIRCLE(${lng} ${lat},${radius})`
        }
      }
    };
  }),
  on(mapWrapperActions.handleGisCanvasCenterChange, (state, { center }): State => {
    // If the center hasn't changed, despite the dispatched action,
    //  then ignore and return the state.
    const { lat, lng } = state.map.center;
    if (lat === center?.lat && lng === center?.lng) {
      return state;
    }
    // Otherwise, update the state with the new center values;
    return {
      ...state,
      map: {
        ...state.map,
        center: {
          ...center
        }
      }
    };
  }),
  on(mapWrapperActions.handleGisCanvasLoadedLayers, (state): State => {
    return {
      ...state,
      map: {
        ...state.map,
        isLoading: false
      }
    };
  }),
  on(mapWrapperActions.handleGisCanvasSelection, (state, { spatialQuery }): State => {
    return {
      ...state,
      map: {
        ...state.map,
        selection: {
          ...state.map.selection,
          spatialQuery
        }
      }
    };
  }),
  on(mapWrapperActions.handleGisCanvasToolBarAction, (state, { action }): State => {
    switch (action) {
      case 'Back':
        return {
          // Leave the layer panel and go back:
          ...state,
          showingLayerPanel: false
        };
      case 'Close':
        return {
          // Close the layer panel:
          ...state,
          showingHamburgerMenu: false,
          showingLayerPanel: false,
          showingRecordDetailsPanel: false,
          showingRecordListPanel: false,
          useMapExtents: false
        };
    }
    return state;
  }),
  on(mapWrapperActions.handleGisCanvasZoomChange, (state, { zoom }): State => {
    // If the zoom hasn't changed, despite the dispatched action,
    //  then ignore and return the state.
    if (state.map.zoom === zoom) {
      return state;
    }
    // Otherwise, update the state with the new zoom value;
    return {
      ...state,
      map: {
        ...state.map,
        zoom
      }
    };
  }),
  on(mapWrapperActions.newZoomToRadiusMap, (state, { zoomToRadius }): State => {
    return {
      ...state,
      map: {
        ...state.map,
        zoomToRadius
      }
    };
  }),
  on(mapWrapperActions.openMapWrapperComponent, (state): State => {
    return {
      ...state,
      map: {
        ...state.map,
        selection: {
          ...state.map.selection,
          spatialQuery: null
        },
        isLoading: true
      },
      searchTerm: null,
      showingHamburgerMenu: false,
      showingLayerPanel: false,
      showingRecordDetailsPanel: false,
      showingRecordListPanel: false,
      useMapExtents: false
    };
  }),
  on(mapWrapperActions.openRecordDetails, (state): State => {
    return {
      ...state,
      showingHamburgerMenu: false,
      showingRecordDetailsPanel: true,
      useMapExtents: false
    };
  }),
  on(mapWrapperActions.openRecordDetailsFromSingleResult, (state): State => {
    return {
      ...state,
      showingHamburgerMenu: false,
      showingLayerPanel: false,
      showingRecordListPanel: false,
      showingRecordDetailsPanel: true,
      useMapExtents: false
    };
  }),
  on(mapWrapperActions.openRecordResultsList, (state): State => {
    return {
      ...state,
      showingHamburgerMenu: false,
      showingLayerPanel: false,
      showingRecordDetailsPanel: false,
      showingRecordListPanel: true
    };
  }),
  on(mapWrapperActions.setSelectedOpportunityId, (state, { opportunityId }): State => {
    return {
      ...state,
      selectedOpportunityId: opportunityId
    };
  }),
  on(mapWrapperActions.toggleHamburgerMenu, (state): State => {
    return {
      ...state,
      showingHamburgerMenu: !state.showingHamburgerMenu,
      useMapExtents: false
    };
  }),
  on(mapWrapperActions.showLayerPanel, (state): State => {
    return {
      ...state,
      showingLayerPanel: true,
      useMapExtents: false,
      layersOrFiltersHaveChanged: false
    };
  }),
  on(mapWrapperActions.toggleUseMapExtents, (state, { dataOpportunityWorkflow }): State => {
    return {
      ...state,
      useMapExtents: !state.useMapExtents,
      dataOpportunityWorkflow
    };
  }),
  on(mapWrapperActions.toggleBasemap, (state): State => {
    return {
      ...state,
      showingBasemap: !state.showingBasemap
    };
  }),
  on(mapWrapperActions.changeLayerOrFilter, (state): State => {
    return {
      ...state,
      layersOrFiltersHaveChanged: true
    };
  }),
  on(mapWrapperActions.resetLayersAndFiltersSuccess, (state): State => {
    return {
      ...state,
      layersOrFiltersHaveChanged: false
    };
  }),
  on(mapWrapperActions.searchExecuted, (state, { term }): State => {
    // If the executed term is 'null' (from GisCanvas) then
    // default to an empty string to search for everything.
    // We use 'null' in our state to capture no searching is
    // happening i.e. a closed or cleared sidepanel.
    const searchTerm = term || '';
    return {
      ...state,
      map: {
        ...state.map,
        selection: {
          ...state.map.selection,
          spatialQuery: null
        }
      },
      searchTerm
    };
  })
);

export function mapWrapperReducer(state, action) {
  return _mapWrapperReducer(state, action);
}
