import * as opportunityActions from '../actions/opportunity.actions';
import * as opportunityCatalogActions from '../../../dashboard/state/actions/opportunity-catalog.actions';
import * as opportunitySelectors from '../selectors/opportunity.selectors';

import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { IGetOpportunityResponse, IOppSubscription, IOpportunityRequest, OpportunityService } from '@apollo/app/services/opportunity';
import { catchError, concatMap, map, mergeMap, switchMap, tap } from 'rxjs/operators';

import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NotificationService } from '@apollo/app/ui/notification';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';

@Injectable()
export class OpportunityEffects {
  createOpportunity$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityActions.createOpportunity),
      concatLatestFrom(() => this.store.select(opportunitySelectors.selectCreationDetails)),
      mergeMap(([, { opportunityName, opportunityType }]) =>
        this.opportunityService
          .createOpportunity({
            opportunityName,
            opportunityType
          })
          .pipe(
            map(({ opportunityId }) =>
              opportunityActions.createOpportunitySuccess({
                opportunity: {
                  opportunityName,
                  opportunityType,
                  opportunityId
                }
              })
            ),
            catchError((err: HttpErrorResponse) => {
              console.error('An error occurred while creating opportunity.', err.message);
              return of(opportunityActions.createOpportunityFail({ errorMessage: null }));
            })
          )
      )
    )
  );

  createOpportunityWithError$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(opportunityActions.createOpportunityFail),
        tap(({ errorMessage }) =>
          this.notificationService.send({
            severity: 'Error',
            title: 'Create Opportunity',
            message: errorMessage ?? 'An error occurred while creating opportunity.'
          })
        )
      ),
    { dispatch: false }
  );

  saveOpportunity$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityActions.createOpportunitySuccess),
      concatLatestFrom(() => [
        this.store.select(opportunitySelectors.selectCreatedOpportunityId),
        this.store.select(opportunitySelectors.selectOpportunityDetails),
        this.store.select(opportunitySelectors.selectOpportunity)
      ]),
      switchMap(
        ([
          ,
          opportunityId,
          {
            opportunityName,
            opportunityType,
            countries,
            phase,
            assetType,
            deliveryType,
            offerType,
            contractType,
            offerStartDate,
            offerEndDate,
            ccusAttributes
          },
          { opportunityStatus }
        ]) =>
          this.opportunityService
            .saveOpportunity({
              opportunityId,
              opportunityName,
              opportunityType,
              countries,
              phase,
              assetType,
              deliveryType,
              offerType,
              contractType,
              offerStartDate,
              offerEndDate,
              ccusAttributes
            })
            .pipe(
              switchMap(({ opportunityId: savedOpportunityId }) => {
                if (opportunityType === 'PRIVATE') {
                  return [
                    opportunityActions.saveOpportunitySuccess({
                      opportunity: {
                        opportunityId: savedOpportunityId,
                        opportunityName,
                        opportunityStatus,
                        opportunityType,
                        countries,
                        phase,
                        assetType,
                        deliveryType,
                        offerType,
                        contractType,
                        offerStartDate,
                        offerEndDate,
                        ccusAttributes
                      }
                    }),
                    opportunityActions.resetMapRepresentation()
                  ];
                } else {
                  return [
                    opportunityActions.saveOpportunitySuccess({
                      opportunity: {
                        opportunityId,
                        opportunityName,
                        opportunityStatus,
                        opportunityType,
                        countries,
                        phase,
                        assetType,
                        deliveryType,
                        offerType,
                        contractType,
                        offerStartDate,
                        offerEndDate,
                        ccusAttributes
                      }
                    })
                  ];
                }
              }),
              catchError((err: HttpErrorResponse) => {
                console.error('An error occurred while updating opportunity profile.', err.message);
                return of(opportunityActions.saveOpportunityFail({ errorMessage: null }));
              })
            )
      )
    )
  );

  editOpportunity$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityActions.editOpportunity),
      concatLatestFrom(() => [
        this.store.select(opportunitySelectors.selectCreatedOpportunityId),
        this.store.select(opportunitySelectors.selectOpportunityDetails),
        this.store.select(opportunitySelectors.selectCreationDetailsProfile),
        this.store.select(opportunitySelectors.selectCreationDetailsConfidentialProfile),
        this.store.select(opportunitySelectors.selectCreationDetailsAdditionalServices)
      ]),
      switchMap(
        ([
          ,
          opportunityId,
          {
            opportunityName,
            opportunityType,
            countries,
            phase,
            assetType,
            deliveryType,
            offerType,
            contractType,
            offerStartDate,
            offerEndDate,
            ccusAttributes
          },
          profile,
          confidentialProfile,
          opportunityVDR
        ]) =>
          this.opportunityService
            .saveOpportunitySteps(
              {
                opportunityId,
                opportunityName,
                opportunityType,
                countries,
                phase,
                assetType,
                deliveryType,
                offerType,
                contractType,
                offerStartDate,
                offerEndDate,
                ccusAttributes
              },
              profile,
              confidentialProfile,
              opportunityVDR,
              opportunityId
            )
            .pipe(
              switchMap(() => {
                const opportunity = {
                  opportunityId,
                  opportunityName,
                  opportunityType,
                  countries,
                  phase,
                  assetType,
                  deliveryType,
                  offerType,
                  contractType,
                  offerStartDate,
                  offerEndDate,
                  ccusAttributes
                };
                if (opportunityType === 'PRIVATE') {
                  return [
                    opportunityActions.resetMapRepresentation(),
                    opportunityActions.saveOpportunityKeyDetailsSuccess({ opportunity }),
                    opportunityActions.saveOpportunityProfileStepInEdit({ profile }),
                    opportunityActions.saveOpportunityConfidentialProfileSuccessEditFlow({ confidentialProfile }),
                    opportunityActions.additionalServicesChangedSuccess({ opportunityVDR })
                  ];
                } else {
                  return [
                    opportunityActions.saveOpportunityKeyDetailsSuccess({ opportunity }),
                    opportunityActions.saveOpportunityProfileStepInEdit({ profile }),
                    opportunityActions.saveOpportunityConfidentialProfileSuccessEditFlow({ confidentialProfile }),
                    opportunityActions.additionalServicesChangedSuccess({ opportunityVDR })
                  ];
                }
              }),
              catchError((err: HttpErrorResponse) => {
                console.error('An error occurred while updating opportunity profile.', err.message);
                return of(opportunityActions.saveOpportunityFail({ errorMessage: null }));
              })
            )
      )
    )
  );

  saveOpportunityWithError$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(opportunityActions.saveOpportunityFail),
        tap(({ errorMessage }) =>
          this.notificationService.send({
            severity: 'Error',
            title: 'Update Opportunity details',
            message: errorMessage ?? 'An error occurred while saving opportunity details.'
          })
        )
      ),
    { dispatch: false }
  );

  saveOpportunityProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityActions.saveOpportunitySuccess),
      concatLatestFrom(() => [
        this.store.select(opportunitySelectors.selectCreatedOpportunityId),
        this.store.select(opportunitySelectors.selectCreationDetailsProfile)
      ]),
      switchMap(([, opportunityId, profile]) =>
        this.opportunityService.saveOpportunityProfile(opportunityId, profile).pipe(
          map(() => opportunityActions.saveOpportunityProfileSuccess({ profile })),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while saving opportunity profile.', err.message);
            return of(opportunityActions.saveOpportunityProfileFail({ errorMessage: null }));
          })
        )
      )
    )
  );

  saveOpportunityProfileWithError$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(opportunityActions.saveOpportunityProfileFail),
        tap(({ errorMessage }) =>
          this.notificationService.send({
            severity: 'Error',
            title: 'Save Opportunity details',
            message: errorMessage ?? 'An error occurred while saving opportunity details.'
          })
        )
      ),
    { dispatch: false }
  );

  saveOpportunityConfidentialProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityActions.saveOpportunityProfileSuccess),
      concatLatestFrom(() => [
        this.store.select(opportunitySelectors.selectCreatedOpportunityId),
        this.store.select(opportunitySelectors.selectCreationDetailsConfidentialProfile)
      ]),
      switchMap(([, opportunityId, confidentialProfile]) =>
        this.opportunityService.saveOpportunityConfidentialProfile(opportunityId, confidentialProfile).pipe(
          map(() => opportunityActions.saveOpportunityConfidentialProfileSuccess({ confidentialProfile })),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while saving opportunity profile.', err.message);
            return of(opportunityActions.saveOpportunityConfidentialProfileFail({ errorMessage: null }));
          })
        )
      )
    )
  );

  saveOpportunityConfidentialProfileWithError$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(opportunityActions.saveOpportunityConfidentialProfileFail),
        tap(({ errorMessage }) =>
          this.notificationService.send({
            severity: 'Error',
            title: 'Save Opportunity Confidential details',
            message: errorMessage ?? 'An error occurred while saving opportunity confidentials details.'
          })
        )
      ),
    { dispatch: false }
  );

  saveOpportunityAdditionalServices$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityActions.saveOpportunityConfidentialProfileSuccess),
      concatLatestFrom(() => [
        this.store.select(opportunitySelectors.selectCreatedOpportunityId),
        this.store.select(opportunitySelectors.selectCreationDetailsAdditionalServices),
        this.store.select(opportunitySelectors.selectOpportunity)
      ]),
      switchMap(([, opportunityId, opportunityVDR, { opportunityStatus }]) =>
        this.opportunityService.addVdrToOpportunity(opportunityId, opportunityVDR).pipe(
          switchMap(() => {
            return [opportunityActions.additionalServicesChangedSuccess({ opportunityVDR })];
          }),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while saving opportunity additional services.', err.message);
            return of(opportunityActions.additionalServicesChangedFail({ errorMessage: null }));
          })
        )
      )
    )
  );

  saveOpportunityAdditionalServicesWithError$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(opportunityActions.additionalServicesChangedFail),
        tap(({ errorMessage }) =>
          this.notificationService.send({
            severity: 'Error',
            title: 'Save Opportunity Additional services details',
            message: errorMessage ?? 'An error occurred while saving opportunity additional services details.'
          })
        )
      ),
    { dispatch: false }
  );

  getOpportunity$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityActions.getOpportunity),
      mergeMap(({ opportunityId }) =>
        this.opportunityService.getOpportunityById(opportunityId).pipe(
          switchMap((opportunity) => {
            if (opportunity.opportunityType != 'PRIVATE') {
              return [
                opportunityActions.getOpportunitySuccess({ opportunity }),
                opportunityActions.getMapRepresentation({ opportunityId })
              ];
            } else {
              return [opportunityActions.getOpportunitySuccess({ opportunity })];
            }
          }),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while getting opportunity.', err.message);
            return of(opportunityActions.getOpportunityFail({ errorMessage: null }));
          })
        )
      )
    )
  );

  getOpportunityError$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(opportunityActions.getOpportunityFail),
        tap(({ errorMessage }) => {
          this.notificationService.send({
            severity: 'Error',
            title: 'Load Opportunity',
            message: errorMessage ?? 'An error occurred while loading the selected opportunity details.'
          });
          this.router.navigateByUrl('vendor');
        })
      ),
    { dispatch: false }
  );

  getMapRepresentation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityActions.getMapRepresentation),
      mergeMap(({ opportunityId }) =>
        this.opportunityService.getMapRepresentationById(opportunityId).pipe(
          map((mapRepresentationData) => {
            const mapRepresentations = mapRepresentationData?.mapRepresentations.map((item) => ({
              type: item.type,
              fileName: item.fileName,
              fileId: item.fileId,
              mapRepresentationId: item.mapRepresentationId
            }));
            return opportunityActions.replaceMapRepresentations({ mapRepresentations });
          }),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while getting opportunity map-representation details.', err.message);
            return of();
          })
        )
      )
    )
  );

  deleteMapRepresentation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityActions.deleteMapRepresentation),
      mergeMap(({ mapRepresentationId, opportunityId }) =>
        this.opportunityService.deleteMapRepresentation(opportunityId, mapRepresentationId).pipe(
          map((data) => {
            return opportunityActions.deleteMapRepresentationSuccess({ mapRepresentationId: data.mapRepresentationId });
          }),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while deleting this map-representation.', err.message);
            return of(opportunityActions.deleteMapRepresentationFail({ errorMessage: null }));
          })
        )
      )
    )
  );

  deleteMapRepresentationFailed$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(opportunityActions.deleteMapRepresentationFail),
        tap(({ errorMessage }) =>
          this.notificationService.send({
            severity: 'Error',
            title: 'Deleting map-representation',
            message: errorMessage ?? 'An error occurred while deleting this map-representation.'
          })
        )
      ),
    { dispatch: false }
  );

  publishOpportunity$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityActions.publishOpportunity),
      concatLatestFrom(() => [this.store.select(opportunitySelectors.selectCreatedOpportunityId)]),
      switchMap(([, opportunityId]) =>
        this.opportunityService.publishOpportunity(opportunityId).pipe(
          concatMap(() => {
            return [
              //store opportunity ids to validate publish state
              opportunityCatalogActions.setPendingPublishOpportunityState({ id: opportunityId }),
              opportunityActions.publishOpportunitySuccess({ opportunityId })
            ];
          }),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while publishing the opportunity.', err.message);
            return of(opportunityActions.publishOpportunityFail({ errorMessage: null }));
          })
        )
      )
    )
  );

  publishOpportunitySuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(opportunityActions.publishOpportunitySuccess),
        tap(({ opportunityId }) =>
          this.notificationService.send({
            severity: 'Success',
            title: 'Success',
            message: 'The opportunity publish is in progress. You will be notified once it is published.'
          })
        )
      ),
    { dispatch: false }
  );

  publishOpportunityFailed$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(opportunityActions.publishOpportunityFail),
        tap(({ errorMessage }) =>
          this.notificationService.send({
            severity: 'Error',
            title: 'Publishing Opportunity',
            message: errorMessage ?? 'An error occurred while publishing the opportunity.'
          })
        )
      ),
    { dispatch: false }
  );

  getOpportunityRequestList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityActions.getOpportunityRequestList),
      mergeMap(() =>
        this.opportunityService.getOpportunityRequestList().pipe(
          map((opportunityRequests: IOpportunityRequest[]) => {
            return opportunityActions.getOpportunityRequestListSuccess({ opportunityRequests });
          }),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while getting opportunity requests list.', err.message);
            return of(opportunityActions.getOpportunityRequestListFail({ errorMessage: null }));
          })
        )
      )
    )
  );

  getOpportunityRequestListFail$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(opportunityActions.getOpportunityRequestListFail),
        tap(({ errorMessage }) =>
          this.notificationService.send({
            severity: 'Error',
            title: 'Opportunity Subscription Request',
            message: errorMessage ?? 'An error occurred while getting the subscription requests.'
          })
        )
      ),
    { dispatch: false }
  );

  getOpportunitySubscriptionList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityActions.getOpportunitySubscriptions),
      mergeMap(() =>
        this.opportunityService.getOpportunitySubscriptions().pipe(
          map((opportunitySubscriptions: IOppSubscription[]) => {
            return opportunityActions.getOpportunitySubscriptionsSuccess({ opportunitySubscriptions });
          }),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while getting subscriptions.', err.message);
            return of(opportunityActions.getOpportunitySubscriptionsFail({ errorMessage: null }));
          })
        )
      )
    )
  );

  getOpportunitySubscriptionListFail$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(opportunityActions.getOpportunitySubscriptionsFail),
        tap(({ errorMessage }) =>
          this.notificationService.send({
            severity: 'Error',
            title: 'Opportunity Subscription',
            message: errorMessage ?? 'An error occurred while getting the opportunity subscriptions.'
          })
        )
      ),
    { dispatch: false }
  );

  createOpportunitySubscription$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityActions.createOpportunitySubscription),
      mergeMap(({ payload }) =>
        this.opportunityService.createSubscription(payload).pipe(
          map(({ opportunitySubscriptionIds }) => {
            this.notificationService.send({
              severity: 'Success',
              title: 'Opportunity Subscription Created',
              message: 'Subscription have been created successfully.'
            });
            return opportunityActions.createOpportunitySubscriptionSuccess({
              opportunitySubscriptionIds
            });
          }),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while fetching requests.', err.message);
            return of(opportunityActions.createOpportunitySubscriptionFail({ errorMessage: null }));
          })
        )
      )
    )
  );

  createOpportunitySubscriptionFail$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(opportunityActions.createOpportunitySubscriptionFail),
        tap(({ errorMessage }) =>
          this.notificationService.send({
            severity: 'Error',
            title: 'Opportunity Subscription Creation',
            message: errorMessage ?? 'An error occurred while creating the opportunity subscription.'
          })
        )
      ),
    { dispatch: false }
  );

  rejectOpportunityRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityActions.rejectOpportunityRequest),
      mergeMap(({ payload, subscriptionRequestId }) =>
        this.opportunityService.rejectOpportunityRequest(payload, subscriptionRequestId).pipe(
          map(() => {
            this.notificationService.send({
              severity: 'Success',
              title: 'Opportunity Request Rejected',
              message: 'Request has been rejected successfully.'
            });
            return opportunityActions.rejectOpportunityRequestSuccess({ subscriptionRequestId });
          }),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while getting subscriptions.', err.message);
            return of(opportunityActions.rejectOpportunityRequestFail({ errorMessage: null }));
          })
        )
      )
    )
  );

  rejectOpportunityRequestFail$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(opportunityActions.rejectOpportunityRequestFail),
        tap(({ errorMessage }) =>
          this.notificationService.send({
            severity: 'Error',
            title: 'Rejecting Opportunity Request',
            message: errorMessage ?? 'An error occurred while rejecting the opportunity request.'
          })
        )
      ),
    { dispatch: false }
  );

  updateOpportunitySubscription$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityActions.updateOpportunitySubscription),
      mergeMap(({ payload }) =>
        this.opportunityService.updateSubscription(payload).pipe(
          map(({ opportunitySubscriptionId }) => {
            this.notificationService.send({
              severity: 'Success',
              title: 'Opportunity Subscription Updated',
              message: 'Subscription has been updated successfully.'
            });
            return opportunityActions.updateOpportunitySubscriptionSuccess({
              opportunitySubscriptionId
            });
          }),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while fetching requests.', err.message);
            return of(opportunityActions.updateOpportunitySubscriptionFail({ errorMessage: null }));
          })
        )
      )
    )
  );

  updateOpportunitySubscriptionFail$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(opportunityActions.updateOpportunitySubscriptionFail),
        tap(({ errorMessage }) =>
          this.notificationService.send({
            severity: 'Error',
            title: 'Opportunity Subscription Update',
            message: errorMessage ?? 'An error occurred while updating the opportunity subscription.'
          })
        )
      ),
    { dispatch: false }
  );

  getOpportunitiesList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(opportunityActions.getPublishedPublicOpportunities),
      mergeMap(() =>
        this.opportunityService.getPublicPublishedOpportunities().pipe(
          map((res: IGetOpportunityResponse) => {
            return opportunityActions.getOpportunitiesSuccess({ opportunities: res.opportunities });
          }),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while getting opportunities list.', err.message);
            return of(opportunityActions.getOpportunitiesFail({ errorMessage: null }));
          })
        )
      )
    )
  );

  getOpportunitiesListFail$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(opportunityActions.getOpportunitiesFail),
        tap(({ errorMessage }) =>
          this.notificationService.send({
            severity: 'Error',
            title: 'Public published opportunity list',
            message: errorMessage ?? 'An error occurred while fetching the opportunity list.'
          })
        )
      ),
    { dispatch: false }
  );

  constructor(
    public readonly actions$: Actions,
    public readonly router: Router,
    public readonly store: Store,
    public readonly opportunityService: OpportunityService,
    public readonly notificationService: NotificationService
  ) {}
}
