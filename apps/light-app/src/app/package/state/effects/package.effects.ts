import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { ConsumerSubscriptionService } from '@apollo/app/services/consumer-subscription';
import { DataPackagesService, IGetDataPackageResponse } from '@apollo/app/services/data-packages';
import { DataSubscriptionService } from '@apollo/app/services/data-subscription';
import { MediaDownloadService } from '@apollo/app/services/media-download';
import { NotificationService } from '@apollo/app/ui/notification';
import { IDataVendor, VendorAppService } from '@apollo/app/vendor';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { GoogleAnalyticsService } from 'ngx-google-analytics';
import { forkJoin, from, of } from 'rxjs';
import { catchError, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { DataPackage, DataPackageStatusState } from '@apollo/api/data-packages/consumer';

import * as mapWrapperActions from '../../../map-wrapper/state/actions/map-wrapper.actions';
import { ContentDownloaderService } from '../../../subscription/services/content-downloader.service';
import { OpportunityModalNonpublicSigninComponent } from '../../opportunity-modal-nonpublic-signin/opportunity-modal-nonpublic-signin.component';
import * as packageActions from '../actions/package.actions';
import * as packageSelectors from '../selectors/package.selectors';

@Injectable()
export class PackageEffects {
  handleNavigatingAwayFromPackage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        mapWrapperActions.closeSidepanel,
        mapWrapperActions.searchExecuted,
        mapWrapperActions.handleGisCanvasBackToPreviousResults,
        mapWrapperActions.handleGisCanvasSelection,
        mapWrapperActions.toggleHamburgerMenu,
        mapWrapperActions.openRecordResultsList,
        mapWrapperActions.showLayerPanel
      ),
      map(() => packageActions.userNavigatedAwayFromPackage())
    )
  );

  downloadSelectedPackage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(packageActions.userDownloadsSelectedPackage),
      concatLatestFrom(() => this.store.select(packageSelectors.selectSelectedProfileId)),
      // The `[, { ... }]` syntax skips the first argument (`action`) and resolves ESLint errors of "unused variables".
      switchMap(([, selectedPackageId]) =>
        this.consumerSubscriptionService
          .getConsumerSubscriptions({
            after: 0,
            limit: 1,
            status: 'ACTIVE',
            onlyActive: true,
            dataPackageId: selectedPackageId
          })
          .pipe(
            switchMap((subscriptions) => {
              if (subscriptions.length < 1) {
                return of(
                  packageActions.userDownloadsSelectedPackageWithNoSubscription(),
                  packageActions.userDownloadsSelectedPackageDoneProcessing()
                );
              }
              return from(this.contentDownloaderService.download(subscriptions[0].dataSubscriptionId)).pipe(
                map(() => packageActions.userDownloadsSelectedPackageDoneProcessing())
              );
            })
          )
      )
    )
  );

  userDownloadsSelectedPackageNoSubscription$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(packageActions.userDownloadsSelectedPackageWithNoSubscription),
        tap(() =>
          this.notificationService.send({
            severity: 'Error',
            title: 'Active Subscription',
            message: 'No active subscription was found and no download could be started. Please try again.'
          })
        )
      ),
    { dispatch: false }
  );

  lookupSelectedProfile$ = createEffect(() =>
    this.store.select(packageSelectors.selectSelectedProfileId).pipe(
      filter((packageId) => packageId !== null),
      switchMap((packageId) => {
        return forkJoin([
          this.dataPackagesService.getConsumerDataPackage(packageId),
          this.dataPackagesService.getPublishedDataPackageById(packageId).pipe(
            switchMap((pkg: IGetDataPackageResponse) => {
              const media = pkg?.dataPackageProfile?.profile?.media || [];
              if (media.length > 0) {
                return forkJoin(media.map((element) => this.mediaDownloadService.downloadMedia(element?.fileId))).pipe(
                  map((mediaUrls: string[]) => {
                    return {
                      ...pkg,
                      dataPackageProfile: {
                        ...pkg.dataPackageProfile,
                        profile: {
                          ...pkg.dataPackageProfile.profile,
                          media: mediaUrls.map((item, index) => ({ signedUrl: item, caption: media[index].caption }))
                        }
                      }
                    };
                  })
                );
              }
              return of(pkg);
            }),
            switchMap((pkg: IGetDataPackageResponse) => {
              return this.vendorAppService.retrieveDataVendors().pipe(
                take(1),
                map((vendors: IDataVendor[]) => {
                  return {
                    ...pkg,
                    vendorName: vendors.find((vendor) => vendor.dataVendorId === pkg.vendorId).name
                  };
                })
              );
            })
          )
        ]).pipe(
          map(([{ subscription, dataPackageStatusState, dataPackageStatus, dataPackageProfile }, dataPackage]) => {
            return {
              ...dataPackage,
              subscription,
              dataPackageStatusState: dataPackageStatusState as DataPackageStatusState,
              dataPackageStatus,
              dataPackageProfile: {
                ...dataPackage.dataPackageProfile,
                dataPackageProfileId: dataPackageProfile.dataPackageProfileId
              }
            } as DataPackage;
          }),
          map((dataPackage) => packageActions.loadedSelectedPackage({ dataPackage })),
          catchError(() => of(packageActions.loadedSelectedPackageWithError({ errorMessage: null })))
        );
      })
    )
  );

  lookupSelectedProfileWithError$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(packageActions.loadedSelectedPackageWithError),
        tap(({ errorMessage }) =>
          this.notificationService.send({
            severity: 'Error',
            title: 'Package Profile',
            message: errorMessage ?? 'An error occurred while loading your selected package profile.'
          })
        )
      ),
    { dispatch: false }
  );

  requestPackageSubscription$ = createEffect(() =>
    this.actions$.pipe(
      ofType(packageActions.userRequestsPackageSubscription),
      concatLatestFrom(() => this.store.select(packageSelectors.deduceDataPackageSubscriptionRequestPayload)),
      switchMap(([{ comment, company }, { selectedProfileId, selectedPackageProfileVendorId }]) => {
        this.googleAnalyticsService.gtag('event', 'request_package', {
          vendorId: selectedPackageProfileVendorId ?? '',
          dataPackageId: selectedProfileId,
          comment
        });
        return this.dataSubscriptionService.createSubscriptionRequests(selectedProfileId, comment, company).pipe(
          map(() => packageActions.userRequestsPackageSubscriptionCompleted()),
          catchError(() => of(packageActions.userRequestsPackageSubscriptionWithError({ errorMessage: null })))
        );
      })
    )
  );

  requestPackageSubscriptionCompleted$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(packageActions.userRequestsPackageSubscriptionCompleted),
        tap(() =>
          this.notificationService.send({
            severity: 'Success',
            title: 'Package Subscription',
            message: 'Your request has been sent'
          })
        )
      ),
    { dispatch: false }
  );

  requestPackageSubscriptionWithError$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(packageActions.userRequestsPackageSubscriptionWithError),
        tap(({ errorMessage }) =>
          this.notificationService.send({
            severity: 'Error',
            title: 'Package Profile',
            message: errorMessage ?? 'Something went wrong requesting your subscription, please try again.'
          })
        )
      ),
    { dispatch: false }
  );

  userSelectedNonpublicPackage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(packageActions.userSelectedNonpublicPackage),
      concatLatestFrom(() => this.authCodeFlowService.getUser()),
      map(([{ id }, { isGuest }]) => {
        if (isGuest) {
          return packageActions.userSelectedNonpublicPackageAsGuest();
        }
        return packageActions.userSelectedPackage({ id });
      })
    )
  );

  userSelectedNonpublicPackageAsGuest$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(packageActions.userSelectedNonpublicPackageAsGuest),
        tap(() => this.dialog.open(OpportunityModalNonpublicSigninComponent))
      ),
    { dispatch: false }
  );

  constructor(
    public readonly dialog: MatDialog,
    public readonly store: Store,
    public readonly actions$: Actions,
    public readonly authCodeFlowService: AuthCodeFlowService,
    public readonly consumerSubscriptionService: ConsumerSubscriptionService,
    public readonly contentDownloaderService: ContentDownloaderService,
    public readonly googleAnalyticsService: GoogleAnalyticsService,
    public readonly notificationService: NotificationService,
    public readonly dataPackagesService: DataPackagesService,
    public readonly dataSubscriptionService: DataSubscriptionService,
    public readonly vendorAppService: VendorAppService,
    public readonly mediaDownloadService: MediaDownloadService
  ) {}
}
