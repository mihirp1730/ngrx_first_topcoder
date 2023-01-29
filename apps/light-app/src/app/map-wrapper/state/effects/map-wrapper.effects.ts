import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, EMPTY, of } from 'rxjs';
import { catchError, debounceTime, filter, map, mergeMap, switchMap, tap } from 'rxjs/operators';

import { LassoPersistenceService } from '@apollo/app/services/lasso-persistence';
import {
  GisLayerPanelService,
  GisMapDataService,
  GisMapLargeService,
  GisSearchResultActionService,
  GisSearchResultService,
  HighlightOnHoverDirective
} from '@slb-innersource/gis-canvas';
import { OpportunityPanelService } from '../../../opportunity-panel/services/opportunity-panel.service';
import * as opportunityActions from '../../../opportunity-panel/state/actions/opportunity-panel.actions';
import * as packageActions from '../../../package/state/actions/package.actions';
import { SidePanelViews } from '../../enums';
import { GisLayerService } from '../../services/gis-layer.service';
import * as mapWrapperActions from '../actions/map-wrapper.actions';
import * as mapWrapperSelectors from '../selectors/map-wrapper.selectors';

@Injectable()
export class MapWrapperEffects {
  handleGisCanvasClick$ = createEffect(() =>
    this.gisMapLargeService.click$.pipe(
      filter((data) => !!data),
      distinctUntilChanged(),
      debounceTime(500),
      map((latLng) => mapWrapperActions.handleGisCanvasClick(latLng))
    )
  );

  handleGisCenterChange$ = createEffect(() =>
    this.gisMapLargeService.centerChange$.pipe(
      filter((data) => !!data),
      distinctUntilChanged(),
      debounceTime(500),
      map((latLng) => mapWrapperActions.handleGisCanvasCenterChange({ center: latLng }))
    )
  );

  handleGisZoomChange$ = createEffect(() =>
    this.gisMapLargeService.zoomChange$.pipe(
      filter((data) => !!data),
      distinctUntilChanged(),
      debounceTime(500),
      map((zoom) => mapWrapperActions.handleGisCanvasZoomChange({ zoom }))
    )
  );

  openMapWrapperComponent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(mapWrapperActions.openMapWrapperComponent),
      map(() => packageActions.userNavigatedAwayFromPackage())
    )
  );

  persistLasso$ = createEffect(
    () =>
      this.store.select(mapWrapperSelectors.selectMapSelectionSpatialQuery).pipe(
        tap((spatialQuery) => {
          this.lassoPersistenceService.clearLassoShape();
          if (spatialQuery) {
            this.lassoPersistenceService.drawLassoShape(spatialQuery);
          }
        })
      ),
    { dispatch: false }
  );

  //
  // Whenever the user toggles the "use map extents" checkbox, we must set a matching value
  //   onto the gisSearchResultService to match and for them to use internally.
  //
  setGisMapFilterExtent$ = createEffect(() =>
    this.store.select(mapWrapperSelectors.selectUseMapExtents).pipe(
      switchMap((currentUseMapExtents) => {
        /**
         * Even if the value changes and this effect executes, if the value is the
         * same as the current internal value in GisCanvas, then do nothing.
         */
        if (this.gisSearchResultService.isGisMapFilterExtent === currentUseMapExtents) {
          return EMPTY;
        }
        /**
         * The internals of GisCanvas includes this attribute that we need to set,
         * upon any changes (i.e. mapWrapperActions.toggleUseMapExtents) we take
         * the latest value from state (i.e. concatLatestFrom) and set it to the
         * internal GisCanvas attribute. Other attributes must also be tied to a
         * falsy value.
         */
        this.gisSearchResultService.isGisMapFilterExtent = currentUseMapExtents;
        if (!currentUseMapExtents) {
          this.gisSearchResultService.isGroupMapExtent = true;
          this.gisSearchResultService.mapExtentWkt = undefined;
        }
        /**
         * Similar to the GIS_CANVAS "center" and "zoom" change events, dispatch
         * a new action for any other effect or reducer to know that the value
         * of gisSearchResultService.isGisMapFilterExtent has changed...
         */
        return of(mapWrapperActions.handleGisCanvasIsFilterExtentChange());
      })
    )
  );

  //
  // Whenever a certain type of related action is made, try and update the data.
  //
  updateResultsUsingMapExtents$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          mapWrapperActions.handleGisCanvasCenterChange,
          mapWrapperActions.handleGisCanvasIsFilterExtentChange,
          mapWrapperActions.handleGisCanvasZoomChange
        ),
        debounceTime(500),
        concatLatestFrom(() => this.store.select(mapWrapperSelectors.deduceCurrentSidepanel)),
        // The `[, { ... }]` syntax skips the first argument (`action`) and resolves ESLint errors of "unused variables".
        filter(([, currentSidepanel]) => currentSidepanel === SidePanelViews.RESULTS),
        tap(() => {
          if (this.gisSearchResultService.isGisMapFilterExtent) {
            this.gisSearchResultService.getMapExtentData(this.getMapExtendArea());
          }
        })
      ),
    { dispatch: false }
  );

  getMapExtendOpportunities$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        mapWrapperActions.setMapExtentMapArea,
        mapWrapperActions.handleGisCanvasCenterChange,
        mapWrapperActions.handleGisCanvasIsFilterExtentChange,
        mapWrapperActions.handleGisCanvasZoomChange,
        mapWrapperActions.toggleUseMapExtents
      ),
      concatLatestFrom(() => [
        this.store.select(mapWrapperSelectors.selectFilterWhereClause),
        this.store.select(mapWrapperSelectors.selectLassoArea),
        this.store.select(mapWrapperSelectors.selectSearchTerm),
        this.store.select(mapWrapperSelectors.selectFilteredLayers),
        this.store.select(mapWrapperSelectors.selectUseMapExtents),
        this.store.select(mapWrapperSelectors.dataOpportunityWorkFlow),
        this.store.select(mapWrapperSelectors.selectGISMapClickShape)
      ]),
      debounceTime(500),
      filter(([, , , , , currentUseMapExtents, dataOpportunityWorkFlow]) => currentUseMapExtents && dataOpportunityWorkFlow),
      mergeMap(([, whereClause, lassoSelection, searchTerm, selectedLayers, , , selectGISMapClickShape]) => {
        this.store.dispatch(opportunityActions.setLoaderFlag({ showLoader: true }));
        const finalLassoQuery = [this.getMapExtendArea()];
        if (lassoSelection && selectGISMapClickShape) {
          finalLassoQuery.push(lassoSelection);
        }
        return this.opportunityPanelService.runMapLargeQuery({ start: 1 }, searchTerm, whereClause, finalLassoQuery, selectedLayers).pipe(
          map(({ opportunities, totalOpportunities }) => {
            this.store.dispatch(opportunityActions.setLoaderFlag({ showLoader: false }));
            return opportunityActions.getFilteredOpportunitiesSuccess({
              filteredOpportunities: opportunities,
              totalOpportunities: totalOpportunities
            });
          }),
          catchError((err: HttpErrorResponse) => {
            this.store.dispatch(opportunityActions.setLoaderFlag({ showLoader: false }));
            console.error('An error occurred while getting opportunities.', err.message);
            return of(opportunityActions.getFilteredOpportunitiesFail({ errorMessage: err.message }));
          })
        );
      })
    )
  );

  resetMapExtentOpportunities$ = createEffect(() =>
    this.actions$.pipe(
      ofType(mapWrapperActions.toggleUseMapExtents),
      concatLatestFrom(() => [
        this.store.select(mapWrapperSelectors.selectUseMapExtents),
        this.store.select(mapWrapperSelectors.dataOpportunityWorkFlow),
        this.store.select(mapWrapperSelectors.selectFilterWhereClause),
        this.store.select(mapWrapperSelectors.selectLassoArea),
        this.store.select(mapWrapperSelectors.selectSearchTerm),
        this.store.select(mapWrapperSelectors.selectFilteredLayers)
      ]),
      filter(([, currentUseMapExtents, dataOpportunityWorkFlow]) => !currentUseMapExtents && dataOpportunityWorkFlow),
      mergeMap(([, , , whereClause, lassoSelection, searchTerm, selectedLayers]) => {
        this.store.dispatch(opportunityActions.setLoaderFlag({ showLoader: true }));
        return this.opportunityPanelService.runMapLargeQuery({ start: 1 }, searchTerm, whereClause, [lassoSelection], selectedLayers).pipe(
          map(({ opportunities, totalOpportunities }) => {
            this.store.dispatch(opportunityActions.setLoaderFlag({ showLoader: false }));
            return opportunityActions.getFilteredOpportunitiesSuccess({
              filteredOpportunities: opportunities,
              totalOpportunities: totalOpportunities
            });
          }),
          catchError((err: HttpErrorResponse) => {
            this.store.dispatch(opportunityActions.setLoaderFlag({ showLoader: false }));
            console.error('An error occurred while getting opportunities.', err.message);
            return of(opportunityActions.getFilteredOpportunitiesFail({ errorMessage: err.message }));
          })
        );
      })
    )
  );

  resetLayersAndFilters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(mapWrapperActions.resetLayersAndFilters),
      concatLatestFrom(() => this.store.select(mapWrapperSelectors.deduceGisGetSearchResultRequest)),
      // The `[, { ... }]` syntax skips the first argument (`action`) and resolves ESLint errors of "unused variables".
      map(([, { layersOrFiltersHaveChanged, spatialQuery, searchTerm }]) => {
        if (layersOrFiltersHaveChanged) {
          const { gisLayers, selectionResults } = this.gisLayerService;
          // If 'spatialQuery' is set, then we have selection data. Selection data
          // takes priority over search data, so execute a new selection query. When
          // we implement better data hierarchy, we need to update both search and
          // selection data, not just one or the other.
          if (spatialQuery) {
            this.gisSearchResultActionService.getSelectionResults(gisLayers, selectionResults);
          } else if (searchTerm !== null) {
            // If our 'searchTerm' is an empty string, convert that to 'null' for the
            // GisCanvas. We use 'null' in our own state to signal there is no search
            // being performed i.e. after a closed sidepanel. We must convert our empty
            // string to 'null' for the GisCanvas because that's what they use when
            // searching for everything.
            const term = searchTerm === '' ? null : searchTerm;
            this.gisSearchResultActionService.getSearchResults(gisLayers, term);
          }
        }
        return mapWrapperActions.resetLayersAndFiltersSuccess();
      })
    )
  );

  filterAttributeValuesUpdated = createEffect(() =>
    this.actions$.pipe(
      ofType(mapWrapperActions.filterAttributeValuesUpdated),
      tap(({ layerName, forceRefresh }) => forceRefresh && this.gisLayerPanelService.refreshAttributeValues(layerName)),
      map(() => mapWrapperActions.changeLayerOrFilter())
    )
  );

  zoomAndHighlightOnMap$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(mapWrapperActions.setSelectedOpportunityId),
        debounceTime(200),
        tap(({ opportunityId, record }) => {
          if (opportunityId && record) {
            this.highlightOnHoverDirective.highlightResult(record);
            this.gisSearchResultService.zoomToExtents(record);
          } else {
            const selectedLayer = this.gisMapDataService.gisMapInstance.layers.find((l) => l.originalOptions.name == '_gis_highlight_');
            if (selectedLayer) {
              selectedLayer.originalOptions.visible = false;
              selectedLayer.hide();
            }
          }
        })
      ),
    { dispatch: false }
  );

  getMapExtendArea(): string {
    const { maxLat, minLat, maxLng, minLng } = this.gisMapLargeService.map.getVisibleBB();
    const topLeft = `${minLng} ${maxLat}`;
    const topRight = `${maxLng} ${maxLat}`;
    const bottomRight = `${maxLng} ${minLat}`;
    const bottomLeft = `${minLng} ${minLat}`;
    const coords = [topLeft, topRight, bottomRight, bottomLeft, topLeft].join(',');
    return `POLYGON(${coords})`;
  }

  constructor(
    public readonly actions$: Actions,
    public readonly store: Store,
    public readonly gisLayerService: GisLayerService,
    public readonly gisSearchResultActionService: GisSearchResultActionService,
    public readonly gisSearchResultService: GisSearchResultService,
    public readonly gisMapLargeService: GisMapLargeService,
    public readonly gisLayerPanelService: GisLayerPanelService,
    public readonly lassoPersistenceService: LassoPersistenceService,
    private highlightOnHoverDirective: HighlightOnHoverDirective,
    private gisMapDataService: GisMapDataService,
    public readonly opportunityPanelService: OpportunityPanelService
  ) {}
}
