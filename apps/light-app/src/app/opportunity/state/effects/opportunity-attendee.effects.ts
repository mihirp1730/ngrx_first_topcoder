import * as opportunityAttendeeActions from '../actions/opportunity-attendee.actions';

import {
  IAttendeeOpportunitiesResponse,
  IOpportunitiesDetails,
  IOpportunityRequestsResponse,
  IOpportunitySubscriptionsResponse,
  OpportunityAttendeeService
} from '@apollo/app/services/opportunity-attendee';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { orderBy, uniqBy } from 'lodash';
import { combineLatest, forkJoin, of } from 'rxjs';
import { catchError, defaultIfEmpty, map, mergeMap, switchMap, tap } from 'rxjs/operators';

import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MediaDownloadService } from '@apollo/app/services/media-download';
import { NotificationService } from '@apollo/app/ui/notification';
import { VendorAppService } from '@apollo/app/vendor';
import { Store } from '@ngrx/store';
import { OpportunityPanelService } from '../../../opportunity-panel/services/opportunity-panel.service';

@Injectable()
export class OpportunityAttendeeEffects {
  getOpportunitiesList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityAttendeeActions.getOpportunities),
      mergeMap(() =>
        this.opportunityAttendeeService.getListPublishedOpportunities().pipe(
          map((res: IAttendeeOpportunitiesResponse) => {
            return opportunityAttendeeActions.getOpportunitiesSuccess({ opportunities: res.opportunities });
          }),
          catchError((err: HttpErrorResponse) => {
            return of(opportunityAttendeeActions.getOpportunitiesFail({ errorMessage: null }));
          })
        )
      )
    )
  );

  getOpportunitiesFailed$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(opportunityAttendeeActions.getOpportunitiesFail, opportunityAttendeeActions.getOpportunityByIdFail),
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

  getOpportunityById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityAttendeeActions.getOpportunityById),
      mergeMap((action) =>
        this.opportunityAttendeeService.getPublishedOpportunityById(action.opportunityId).pipe(
          switchMap((opportunity: IOpportunitiesDetails) => {
            const profileMedia = opportunity?.opportunityProfile?.media || [];
            const confidentialMedia = opportunity?.confidentialOpportunityProfile?.media || [];

            if (profileMedia.length > 0 || confidentialMedia.length > 0) {
              return combineLatest([
                forkJoin(profileMedia.map((element) => this.mediaDownloadService.downloadMedia(element?.fileId))).pipe(
                  defaultIfEmpty(null),
                  map((mediaUrls: string[]) => {
                    return profileMedia.map((item, index) => ({ ...item, signedUrl: mediaUrls[index] }));
                  })
                ),
                forkJoin(confidentialMedia.map((element) => this.mediaDownloadService.downloadMedia(element?.fileId))).pipe(
                  defaultIfEmpty(null),
                  map((mediaUrls: string[]) => {
                    return confidentialMedia.map((item, index) => ({ ...item, signedUrl: mediaUrls[index] }));
                  })
                ),
                forkJoin([
                  this.opportunityPanelService.getCountRunner(action.opportunityId).pipe(
                    map((availableDataObjects) => {
                      return availableDataObjects.map((dataObjs) => dataObjs.dataObjects);
                    })
                  )
                ])
              ]).pipe(
                map(([profileMedia, confidentialMedia, availableDataObjects]) => {
                  return {
                    ...opportunity,
                    opportunityProfile: {
                      ...opportunity.opportunityProfile,
                      media: profileMedia || []
                    },
                    confidentialOpportunityProfile: {
                      ...opportunity.confidentialOpportunityProfile,
                      media: confidentialMedia || []
                    },
                    dataObjects: availableDataObjects.length > 0 ? availableDataObjects[0][0] : []
                  };
                })
              );
            }
            return of(opportunity);
          }),
          switchMap((opportunity) => {
            return this.vendorAppService.retrieveVendorProfile(opportunity['dataVendorId']).pipe(
              map((vendorProfile) => {
                return {
                  ...opportunity,
                  vendorProfile
                };
              })
            );
          }),
          map((opportunity) => {
            return opportunityAttendeeActions.getOpportunityByIdSuccess({ opportunity });
          }),
          catchError((err: HttpErrorResponse) => {
            return of(
              opportunityAttendeeActions.getOpportunityByIdFail({
                errorMessage: `An error occurred while getting opportunity with id ${action.opportunityId}`
              })
            );
          })
        )
      )
    )
  );

  getOpportunityRequestsList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityAttendeeActions.getOpportunityRequests),
      mergeMap(() =>
        this.opportunityAttendeeService.getOpportunityRequestsList().pipe(
          switchMap((res: IOpportunityRequestsResponse) => {
            const uniqRequestsOnVendorIds = uniqBy(res.items, 'vendorId');
            return forkJoin(
              uniqRequestsOnVendorIds.map((request) => {
                if (request.vendorId !== '') {
                  return this.vendorAppService.retrieveVendorProfile(request.vendorId);
                } else {
                  return of(null);
                }
              })
            ).pipe(
              defaultIfEmpty(null),
              map((vendorProfile) => {
                return res.items.map((item) => {
                  const index = uniqRequestsOnVendorIds.findIndex((request) => {
                    return item.vendorId == request.vendorId;
                  });
                  return { ...item, vendorProfile: vendorProfile[index] };
                });
              })
            );
          }),
          map((res) => {
            res = res.filter((item) => item.requestStatus !== 'Approved');
            return opportunityAttendeeActions.getOpportunityRequestsSuccess({ opportunityRequests: res });
          }),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while getting opportunity requests list.', err.message);
            return of(opportunityAttendeeActions.getOpportunityRequestsFail({ errorMessage: null }));
          })
        )
      )
    )
  );

  getOpportunityRequestsFailed$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(opportunityAttendeeActions.getOpportunityRequestsFail),
        tap(({ errorMessage }) =>
          this.notificationService.send({
            severity: 'Error',
            title: 'Fetching Request Opportunity',
            message: errorMessage ?? 'An error occurred while getting request opportunity list.'
          })
        )
      ),
    { dispatch: false }
  );

  getOpportunitySubscriptions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityAttendeeActions.getOpportunitySubscriptions),
      mergeMap(() =>
        this.opportunityAttendeeService.getOpportunitySubscriptions().pipe(
          switchMap((res: IOpportunitySubscriptionsResponse) => {
            const uniqSubsOnVendorIds = uniqBy(res.items, 'vendorId');
            return forkJoin(
              uniqSubsOnVendorIds.map((subscription) => {
                if (subscription.vendorId !== '') {
                  return this.vendorAppService.retrieveVendorProfile(subscription.vendorId);
                } else {
                  return of(null);
                }
              })
            ).pipe(
              defaultIfEmpty(null),
              map((vendorProfile) => {
                return res.items.map((item) => {
                  const index = uniqSubsOnVendorIds.findIndex((subscription) => {
                    return item.vendorId == subscription.vendorId;
                  });
                  return { ...item, vendorProfile: vendorProfile[index] };
                });
              })
            );
          }),
          map((res) => {
            res = res.map((item) => {
              item.accessDetails = orderBy(item.accessDetails, ['accessLevel']); // sorting the data for accessLevel.
              return item;
            });
            return opportunityAttendeeActions.getOpportunitySubscriptionsSuccess({ opportunitySubscriptions: res });
          }),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while getting opportunity Subscriptions list.', err.message);
            return of(opportunityAttendeeActions.getOpportunitySubscriptionsFail({ errorMessage: null }));
          })
        )
      )
    )
  );

  getOpportunitySubscriptionsFailed$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(opportunityAttendeeActions.getOpportunitySubscriptionsFail),
        tap(({ errorMessage }) =>
          this.notificationService.send({
            severity: 'Error',
            title: 'Fetching Subscription Opportunity',
            message: errorMessage ?? 'An error occurred while getting Opportunity Subscription list.'
          })
        )
      ),
    { dispatch: false }
  );

  constructor(
    public readonly actions$: Actions,
    public readonly store: Store,
    public readonly opportunityAttendeeService: OpportunityAttendeeService,
    public readonly notificationService: NotificationService,
    public readonly vendorAppService: VendorAppService,
    public readonly mediaDownloadService: MediaDownloadService,
    public readonly opportunityPanelService: OpportunityPanelService
  ) {}
}
