import { DataPackage } from '@apollo/api/data-packages/consumer';
import { IGetDataPackageResponse } from '@apollo/app/services/data-packages';
import { createAction, props } from '@ngrx/store';

export const loadedSelectedPackage = createAction('[Package] Loaded Selected Package', props<{ dataPackage: DataPackage | null }>());

export const loadedSelectedPackageWithError = createAction(
  '[Package] Loaded Selected Package With Error',
  props<{ errorMessage: string | null }>()
);

export const loadedSelectedPackageProfile = createAction(
  '[Package] Loaded Selected Package Profile',
  props<{ profile: IGetDataPackageResponse }>()
);

export const userDownloadsSelectedPackage = createAction('[Package] User Downloads Selected Package');

export const userDownloadsSelectedPackageWithNoSubscription = createAction(
  '[Package] User Downloads Selected Package With No Subscription'
);

export const userDownloadsSelectedPackageDoneProcessing = createAction('[Package] User Downloads Selected Package Done Processing');

export const userNavigatedAwayFromPackage = createAction('[Package] User Navigated Away From Package');

export const userRequestsPackageSubscription = createAction(
  '[Package] User Requests Package Subscription',
  props<{ comment: string; company: string }>()
);

export const userRequestsPackageSubscriptionCompleted = createAction('[Package] User Requests Package Subscription Completed');

export const userRequestsPackageSubscriptionWithError = createAction(
  '[Package] User Requests Package Subscription With Error',
  props<{ errorMessage: string | null }>()
);

export const userSelectedNonpublicPackage = createAction('[Package] User Selected Nonpublic Package', props<{ id: string }>());

export const userSelectedNonpublicPackageAsGuest = createAction('[Package] User Selected Nonpublic Package As Guest');

export const userSelectedPackage = createAction('[Package] User Selected Package', props<{ id: string }>());
