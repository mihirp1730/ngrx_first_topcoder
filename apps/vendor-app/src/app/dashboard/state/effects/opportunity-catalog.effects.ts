import * as opportunityCatalogActions from '../actions/opportunity-catalog.actions';
import * as opportunityCatalogSelectors from '../selectors/opportunity-catalog.selectors';

import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { IGetOpportunityResponse, IOpportunity, OpportunityService, OpportunityStatus } from '@apollo/app/services/opportunity';
import { catchError, concatMap, delay, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MapLargeHelperService } from '../../services/maplarge-helper.service';
import { MetadataService } from '@apollo/app/metadata';
import { NotificationService } from '@apollo/app/ui/notification';
import { Store } from '@ngrx/store';
import { VendorAppService } from '@apollo/app/vendor';

@Injectable()
export class OpportunityCatalogEffects {
  count = 0;
  pendingOpportunities: IOpportunity[] = [];

  getOpportunitiesList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityCatalogActions.getOpportunities),
      mergeMap(() =>
        this.opportunityService.getOpportunityList().pipe(
          delay(this.count * 1000),
          concatMap((res: IGetOpportunityResponse) => {
            //update opportunities in store call
            return [
              opportunityCatalogActions.updateOpportunitiesStore({ opportunities: res.opportunities }),
              opportunityCatalogActions.validatePublishStatus({ opportunities: res.opportunities })
            ];
          }),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while getting opportunities list.', err.message);
            return of(opportunityCatalogActions.getOpportunitiesFail({ errorMessage: null }));
          })
        )
      )
    )
  );

  validatePublishStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityCatalogActions.validatePublishStatus),
      concatLatestFrom(() => [this.store.select(opportunityCatalogSelectors.selectPendingPublishOpportunityIds)]),
      map(([action, publishPendingIds]) => {
        this.pendingOpportunities = [];
        publishPendingIds.forEach((id) => {
          this.pendingOpportunities.push(
            action.opportunities.find(
              (opportunity) => opportunity.opportunityId === id && opportunity.opportunityStatus !== OpportunityStatus.Published
            )
          );
        });
        if ((publishPendingIds.length && this.pendingOpportunities[0] !== undefined) && this.count <= 4) {
          this.count++;
          return opportunityCatalogActions.getOpportunities({ isLoading: false });
        } else {
          this.count = 0;
          publishPendingIds.forEach((id) => {
            const newPublishOpp = this.findNewlyPublishedOpportunities(action, id);
            this.store.dispatch(opportunityCatalogActions.removePendingPublishedOpportunityIds({ id: newPublishOpp?.opportunityId }));
          });
          return opportunityCatalogActions.getOpportunitiesSuccess({ opportunities: action.opportunities });
        }
      })
    )
  );

  getOpportunitiesFailed$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(opportunityCatalogActions.getOpportunitiesFail),
        tap(({ errorMessage }) =>
          this.notificationService.send({
            severity: 'Error',
            title: 'Fetching Opportunity',
            message: errorMessage ?? 'An error occurred while getting opportunity list.'
          })
        )
      ),
    { dispatch: false }
  );

  deleteOpportunity$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityCatalogActions.deleteOpportunity),
      mergeMap(({ id }) =>
        this.opportunityService.deleteOpportunity(id).pipe(
          map(() => {
            return opportunityCatalogActions.deleteOpportunitySuccess({ id });
          }),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while deleting the opportunity.', err.message);
            return of(opportunityCatalogActions.deleteOpportunityFail({ errorMessage: null }));
          })
        )
      )
    )
  );

  deleteOpportunityFailed$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(opportunityCatalogActions.deleteOpportunityFail),
        tap(({ errorMessage }) =>
          this.notificationService.send({
            severity: 'Error',
            title: 'Deleting Opportunity',
            message: errorMessage ?? 'An error occurred while deleting the opportunity.'
          })
        )
      ),
    { dispatch: false }
  );

  unPublishOpportunity$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityCatalogActions.unPublishOpportunity),
      mergeMap(({ id }) =>
        this.opportunityService.unPublishOpportunity(id).pipe(
          map(() => {
            return opportunityCatalogActions.unPublishOpportunitySuccess({ id });
          }),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while un-publishing the opportunity.', err.message);
            return of(opportunityCatalogActions.unPublishOpportunityFail({ errorMessage: null }));
          })
        )
      )
    )
  );

  unPublishOpportunitySuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(opportunityCatalogActions.unPublishOpportunitySuccess),
        tap(() =>
          this.notificationService.send({
            severity: 'Success',
            title: 'Success',
            message: 'The opportunity un-published successfully.'
          })
        )
      ),
    { dispatch: false }
  );

  unPublishOpportunityFailed$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(opportunityCatalogActions.unPublishOpportunityFail),
        tap(({ errorMessage }) =>
          this.notificationService.send({
            severity: 'Error',
            title: 'UnPublish Opportunity',
            message: errorMessage ?? 'An error occurred while unPublishing the opportunity.'
          })
        )
      ),
    { dispatch: false }
  );

  inviteAttendees$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityCatalogActions.inviteAttendees),
      mergeMap(({ opportunitySubscription }) =>
        this.opportunityService.createSubscription(opportunitySubscription).pipe(
          map((opportunitySubscriptionIds) => {
            this.notificationService.send({
              severity: 'Success',
              title: 'Attendee invitation(s)',
              message: 'Attendee invitation(s) sent successfully.'
            });
            return opportunityCatalogActions.inviteAttendeesSuccess(opportunitySubscriptionIds);
          }),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while inviting an attendee.', err.message);
            this.notificationService.send({
              severity: 'Error',
              title: 'Inviting an attendee',
              message: 'An error occurred while inviting an attendee.'
            });
            return of(opportunityCatalogActions.inviteAttendeesFail({ errorMessage: null }));
          })
        )
      )
    )
  );

  inviteAttendeesFailed$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(opportunityCatalogActions.inviteAttendeesFail),
        tap(({ errorMessage }) =>
          this.notificationService.send({
            severity: 'Error',
            title: 'Inviting Ateendee',
            message: errorMessage ?? 'An error occurred while inviting an attendee.'
          })
        )
      ),
    { dispatch: false }
  );

  getMlConnectionInfo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityCatalogActions.getOpportunitiesSuccess),
      mergeMap(() => {
        return this.mapLargeHelperService.getDeployment().pipe(
          map((res) => {
            return opportunityCatalogActions.getMlConnectionInfoSuccess({ mlConnectionInfo: res.connectionInfo });
          }),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while getting ml connection info.', err.message);
            return of(opportunityCatalogActions.getMlConnectionInfoFail({ errorMessage: null }));
          })
        );
      })
    )
  );

  getActiveTables$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityCatalogActions.getMlConnectionInfoSuccess),
      mergeMap(({ mlConnectionInfo }) =>
        this.mapLargeHelperService.getActiveTables(mlConnectionInfo).pipe(
          map((res) => {
            const tables = res.tables.filter((table) => table.acctcode === this.vendorAppService.userContext.crmAccountId);
            return opportunityCatalogActions.getActiveTablesSuccess({ tables });
          }),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while getting active tables.', err.message);
            return of(opportunityCatalogActions.getActiveTablesFail({ errorMessage: null }));
          })
        )
      )
    )
  );

  getLayerMetadata$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityCatalogActions.getActiveTablesSuccess),
      mergeMap(() =>
        this.metadataService.marketingLayers$.pipe(
          map((res) => {
            return opportunityCatalogActions.getLayerMetadataSuccess({ layerMetadata: res });
          }),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while getting getLayer metadata', err.message);
            return of(opportunityCatalogActions.getLayerMetadataFail({ errorMessage: null }));
          })
        )
      )
    )
  );

  getMlConnectionInfoFailed$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(opportunityCatalogActions.getOpportunitiesFail),
        tap(({ errorMessage }) =>
          this.notificationService.send({
            severity: 'Error',
            title: 'Fetching ML Connection Info',
            message: errorMessage ?? 'An error occurred while getting ML Connection Info.'
          })
        )
      ),
    { dispatch: false }
  );

  getDataObjectCount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityCatalogActions.getLayerMetadataSuccess),
      concatLatestFrom(() => [
        this.store.select(opportunityCatalogSelectors.selectOpportunities),
        this.store.select(opportunityCatalogSelectors.selectMlConnectionInfo),
        this.store.select(opportunityCatalogSelectors.selectLayerMetadata)
      ]),
      switchMap(([, opportunities, connectionInfo, layerMetadata]) => {
        const opportunityIds = opportunities.map((opp) => opp.opportunityId);
        const getMlCountQueries = {};
        layerMetadata.forEach((element) => {
          getMlCountQueries[element.maplargeTable] = this.mapLargeHelperService.getCountFromMl(
            opportunityIds,
            element.maplargeTable,
            this.vendorAppService.userContext.crmAccountId,
            connectionInfo
          );
        });
        return forkJoin(getMlCountQueries).pipe(
          map((asset: any) => {
            const layerWithCount = [];
            for (const key in asset) {
              if (Object.prototype.hasOwnProperty.call(asset, key)) {
                const layer = layerMetadata.find((metadata) => metadata.maplargeTable == key);
                const element = asset[key];
                element['data'].data.layer = layer.displayName;
                element['data'] = element['data'].data;
                element['data'].icon = layer.icon;
                layerWithCount.push(element);
              }
            }
            return layerWithCount;
          }),
          map((dataObjects) => opportunityCatalogActions.getDataObjectCountSuccess({ dataObjects })),
          catchError(() => of(opportunityCatalogActions.getDataObjectCountFail({ errorMessage: 'Failed to get count' })))
        );
      })
    )
  );

  constructor(
    public readonly actions$: Actions,
    public readonly store: Store,
    public readonly opportunityService: OpportunityService,
    public readonly notificationService: NotificationService,
    private readonly mapLargeHelperService: MapLargeHelperService,
    private metadataService: MetadataService,
    private vendorAppService: VendorAppService
  ) {}

  private findNewlyPublishedOpportunities(action, id: string): IOpportunity {
    return action.opportunities.find(
      (opportunity) => opportunity.opportunityId === id && opportunity.opportunityStatus === OpportunityStatus.Published
    );
  }
}
