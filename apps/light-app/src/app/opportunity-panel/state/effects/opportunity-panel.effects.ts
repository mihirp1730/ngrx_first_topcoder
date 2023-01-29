import * as opportunityActions from '../actions/opportunity-panel.actions';
import * as opportunitySelector from '../selectors/opportunity-panel.selectors';

import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { catchError, debounceTime, map, mergeMap, switchMap, tap } from 'rxjs/operators';

import { GisMapLargeService } from '@slb-innersource/gis-canvas';
import { HighlightDirective } from '../../directive/highlight.directive';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MapLargeHelperService } from '../../services/maplarge-helper.service';
import { OpportunityPanelService } from '../../services/opportunity-panel.service';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { opportunitiesPageSize } from '../../constants/opportunity-panel.constants';

@Injectable()
export class OpportunityPanelEffects {
  getMlConnectionInfo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityActions.getMlConnectionInfo),
      mergeMap(() => {
        return this.mapLargeHelperService.getDeployment().pipe(
          map((res) => {
            return opportunityActions.getMlConnectionInfoSuccess({ mlConnectionInfo: res.connectionInfo });
          }),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while getting ml connection info.', err.message);
            return of(opportunityActions.getMlConnectionInfoFail({ errorMessage: null }));
          })
        );
      })
    )
  );

  getActiveTables$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityActions.getMlConnectionInfoSuccess),
      mergeMap(({ mlConnectionInfo }) =>
        this.mapLargeHelperService.getActiveTables(mlConnectionInfo).pipe(
          map((res) => {
            const tables = res.tables.filter((table) => table.acctcode === this.opportunityPanelService.getTableName());
            return opportunityActions.getActiveTablesSuccess({ tables, mlConnectionInfo });
          }),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while getting active tables.', err.message);
            return of(opportunityActions.getActiveTablesFail({ errorMessage: null }));
          })
        )
      )
    )
  );

  getAllOpportunitiesOnLoad$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityActions.getActiveTablesSuccess),
      concatLatestFrom(() => [this.store.select(opportunitySelector.selectMlConnectionInfo)]),
      mergeMap(([, mlConnectionInfo]) => {
        return this.opportunityPanelService.getOpportunitiesOnLoad(mlConnectionInfo).pipe(
          switchMap(({ opportunities, totalOpportunities }) => {
            return [
              opportunityActions.getFilteredOpportunitiesSuccess({ filteredOpportunities: opportunities, totalOpportunities }),
              opportunityActions.getAllOpportunities()
            ];
          }),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while getting opportunity requests list.', err.message);
            return of(opportunityActions.getOpportunitiesFail({ errorMessage: null }));
          })
        );
      })
    )
  );

  getAllOpportunities$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityActions.isMapLoaded),
      switchMap(() =>
        this.opportunityPanelService.runMapLargeQuery({ start: 1, end: -1 }).pipe(
          switchMap(({ opportunities, totalOpportunities }) => {
            return [opportunityActions.getOpportunitiesSuccess({ opportunities: opportunities, totalOpportunities: totalOpportunities })];
          }),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while getting opportunity requests list.', err.message);
            return of(opportunityActions.getOpportunitiesFail({ errorMessage: null }));
          })
        )
      )
    )
  );

  getPaginatedOpportunities$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityActions.getOpportunities),
      switchMap(() =>
        this.opportunityPanelService.runMapLargeQuery({ start: 1 }).pipe(
          switchMap(({ opportunities, totalOpportunities }) => {
            return [
              opportunityActions.getFilteredOpportunitiesSuccess({ filteredOpportunities: opportunities, totalOpportunities }),
              opportunityActions.getAllOpportunities()
            ];
          }),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while getting opportunity requests list.', err.message);
            return of(opportunityActions.getOpportunitiesFail({ errorMessage: null }));
          })
        )
      )
    )
  );

  highlightOnMap$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(opportunityActions.setSelectedOpportunityId),
        debounceTime(200),
        tap(({ opportunityId }) => {
          if (opportunityId) {
            this.highlightDirective.highlightResult(opportunityId);
            this.opportunityPanelService.zoomToExtents(opportunityId);
          } else {
            this.highlightDirective.removeHighlightResult();
          }
        })
      ),
    { dispatch: false }
  );

  getFilteredOpportunities$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        opportunityActions.setLayerAttributes,
        opportunityActions.setLassoSelection,
        opportunityActions.setSelectedLayers,
        opportunityActions.setSearchTerm
      ),
      concatLatestFrom(() => [
        this.store.select(opportunitySelector.selectFilterWhereClause),
        this.store.select(opportunitySelector.selectLassoArea),
        this.store.select(opportunitySelector.selectSearchTerm),
        this.store.select(opportunitySelector.selectFilteredLayers),
        this.store.select(opportunitySelector.selectCurrentPageNumber),
        this.store.select(opportunitySelector.selectIsFilterSelected),
        this.store.select(opportunitySelector.selectUseMapExtents),
        this.store.select(opportunitySelector.dataOpportunityWorkFlow)
      ]),
      debounceTime(500),
      mergeMap(
        ([
          ,
          whereClause,
          lassoSelection,
          searchTerm,
          selectedLayers,
          pageNumber,
          isFilterSelected,
          useMapExtent,
          dataOpportunityWorkFlow
        ]) => {
          let end = opportunitiesPageSize;
          if (isFilterSelected === true) {
            end = -1;
          }
          const finalLassoSelection = lassoSelection ? [lassoSelection] : [];
          if (useMapExtent && dataOpportunityWorkFlow) {
            const { maxLat, minLat, maxLng, minLng } = this.gisMapLargeService.map.getVisibleBB();
            const topLeft = `${minLng} ${maxLat}`;
            const topRight = `${maxLng} ${maxLat}`;
            const bottomRight = `${maxLng} ${minLat}`;
            const bottomLeft = `${minLng} ${minLat}`;
            const coords = [topLeft, topRight, bottomRight, bottomLeft, topLeft].join(',');
            finalLassoSelection.push(`POLYGON(${coords})`);
          }
          return this.opportunityPanelService
            .runMapLargeQuery({ start: pageNumber, end }, searchTerm, whereClause, finalLassoSelection, selectedLayers)
            .pipe(
              map(({ opportunities, totalOpportunities }) => {
                return opportunityActions.getFilteredOpportunitiesSuccess({ filteredOpportunities: opportunities, totalOpportunities });
              }),
              catchError((err: HttpErrorResponse) => {
                console.error('An error occurred while getting opportunities.', err.message);
                return of(opportunityActions.getFilteredOpportunitiesFail({ errorMessage: err.message }));
              })
            );
        }
      )
    )
  );

  getNextOpportunities$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityActions.loadMoreOpportunities),
      concatLatestFrom(() => [
        this.store.select(opportunitySelector.selectFilterWhereClause),
        this.store.select(opportunitySelector.selectLassoArea),
        this.store.select(opportunitySelector.selectSearchTerm),
        this.store.select(opportunitySelector.selectFilteredLayers),
        this.store.select(opportunitySelector.selectCurrentPageNumber),
        this.store.select(opportunitySelector.selectFilteredOpportunities)
      ]),
      mergeMap(([, whereClause, lassoSelection, searchTerm, selectedLayers, pageNumber, filteredOpportunities]) =>
        this.opportunityPanelService.runMapLargeQuery({ start: pageNumber }, searchTerm, whereClause, lassoSelection, selectedLayers).pipe(
          map(({ opportunities, totalOpportunities }) => {
            const resultantOpportunties = [...filteredOpportunities, ...opportunities];
            return opportunityActions.getFilteredOpportunitiesSuccess({ filteredOpportunities: resultantOpportunties, totalOpportunities });
          }),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while getting opportunities.', err.message);
            return of(opportunityActions.getFilteredOpportunitiesFail({ errorMessage: err.message }));
          })
        )
      )
    )
  );

  getDataObjectCount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityActions.getFilteredOpportunitiesSuccess, opportunityActions.isMapLoaded),
      concatLatestFrom(() => this.store.select(opportunitySelector.selectFilteredOpportunities)),
      mergeMap(([, filteredOpportunities]) => {
        const opportunityIds = filteredOpportunities?.map((id) => id.opportunityId);
        return this.opportunityPanelService.getCountRunner(opportunityIds).pipe(
          map((opportunities) => {
            return opportunityActions.getDataObjectCountSuccess({ opportunities });
          })
        );
      }),
      catchError((err: HttpErrorResponse) => {
        console.error('An error occurred while getting data object count.', err.message);
        return of(opportunityActions.getDataObjectCountFail({ errorMessage: null }));
      })
    )
  );

  constructor(
    public readonly actions$: Actions,
    public readonly store: Store,
    public readonly opportunityPanelService: OpportunityPanelService,
    private highlightDirective: HighlightDirective,
    public readonly gisMapLargeService: GisMapLargeService,
    public readonly mapLargeHelperService: MapLargeHelperService
  ) {}
}
