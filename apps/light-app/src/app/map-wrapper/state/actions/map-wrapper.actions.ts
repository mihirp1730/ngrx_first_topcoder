import { createAction, props } from '@ngrx/store';
import { GisMappedSearchResult } from '@slb-innersource/gis-canvas';

export const newZoomToRadiusMap = createAction(
  '[Map-Wrapper] New Zoom To Radius Map',
  props<{ zoomToRadius: { [zoomLevel: string]: number } }>()
);
export const closeSidepanel = createAction('[Map-Wrapper] Close Sidepanel');
export const handleGisCanvasBackToPreviousResults = createAction('[Map-Wrapper] Handle GIS Canvas Back To Previous Results');
export const handleGisCanvasClick = createAction('[Map-Wrapper] Handle GIS Canvas Click', props<{ lat: number; lng: number }>());
export const handleGisCanvasSelection = createAction('[Map-Wrapper] Handle GIS Canvas Selection', props<{ spatialQuery: string }>());
export const handleGisCanvasCenterChange = createAction(
  '[Map-Wrapper] Handle GIS Canvas Center Change',
  props<{ center: { lat: number; lng: number } }>()
);
export const handleGisCanvasLoadedLayers = createAction('[Map-Wrapper] Handle GIS Canvas Loaded Layers');
export const handleGisCanvasToolBarAction = createAction(
  '[Map-Wrapper] Handle GIS Canvas Toolbar Action',
  props<{ action: 'Back' | 'Cleared' | 'Close' | 'Toggled' }>()
);
export const handleGisCanvasZoomChange = createAction('[Map-Wrapper] Handle GIS Canvas Zoom Change', props<{ zoom: number }>());
export const handleGisCanvasIsFilterExtentChange = createAction('[Map-Wrapper] Handle GIS Canvas Is Filter Extent Change');
export const openMapWrapperComponent = createAction('[Map-Wrapper] Open Map Wrapper Component');
export const openRecordDetails = createAction('[Map-Wrapper] Open Record Details');
export const setSelectedOpportunityId = createAction(
  '[Map-Wrapper] Set Selected Opportunity Id',
  props<{ opportunityId: string; record?: GisMappedSearchResult }>()
);
export const openRecordDetailsFromSingleResult = createAction('[Map-Wrapper] Open Record Details From Single Result');
export const openRecordResultsList = createAction('[Map-Wrapper] Open Record Results List');
export const showLayerPanel = createAction('[Map-Wrapper] Show Layer Panel');
export const toggleHamburgerMenu = createAction('[Map-Wrapper] Toggle Hamburger Menu');
export const toggleUseMapExtents = createAction('[Map-Wrapper] Toggle Use Map Extents', props<{ dataOpportunityWorkflow: boolean }>());
export const toggleBasemap = createAction('[Map-Wrapper] Toggle Basemap');
export const changeLayerOrFilter = createAction('[Map-Wrapper] Change Layer or Filter');
export const filterAttributeValuesUpdated = createAction(
  '[Map-Wrapper] Filter Attribute Values Updated',
  props<{ layerName: string; forceRefresh: boolean }>()
);
export const resetLayersAndFilters = createAction('[Map-Wrapper] Reset Layers and Filters');
export const resetLayersAndFiltersSuccess = createAction('[Map-Wrapper] Reset Layers and Filters Success');
export const searchExecuted = createAction('[Map-Wrapper] Search Executed', props<{ term: string | null }>());
export const setMapExtentMapArea = createAction('[Map-Wrapper] Set Map Extend Area', props<{ selectedMapArea: string }>());
