import { DataPackageSubscriptionStatus } from '@apollo/api/data-packages/consumer';
import { createReducer, on } from '@ngrx/store';

import * as packageActions from '../actions/package.actions';
import { initialState, State } from '../package.state';

export const packageFeatureKey = 'package';

const _packageReducer = createReducer(
  initialState,
  on(packageActions.loadedSelectedPackage, (state, { dataPackage }): State => {
    if (!dataPackage) {
      return state;
    }
    if (state.selectedProfileId !== dataPackage.dataPackageId) {
      return state;
    }
    return {
      ...state,
      selectedPackage: dataPackage,
      selectedPackageDownloading: false
    };
  }),
  on(packageActions.userDownloadsSelectedPackage, (state): State => {
    return {
      ...state,
      selectedPackageDownloading: true
    };
  }),
  on(packageActions.userDownloadsSelectedPackageDoneProcessing, (state): State => {
    return {
      ...state,
      selectedPackageDownloading: false
    };
  }),
  on(packageActions.userNavigatedAwayFromPackage, (state): State => {
    return {
      ...state,
      selectedProfileId: null,
      selectedPackage: null
    };
  }),
  on(packageActions.userRequestsPackageSubscription, (state): State => {
    return {
      ...state,
      selectedPackageRequesting: true
    };
  }),
  on(packageActions.userRequestsPackageSubscriptionCompleted, (state): State => {
    return {
      ...state,
      selectedPackageRequesting: null,
      // Remove the below once the backend services work and return us the actual subscription info:
      selectedPackage: {
        ...(state.selectedPackage ?? initialState.selectedPackage),
        subscription: {
          ...(state.selectedPackage?.subscription ?? initialState.selectedPackage?.subscription),
          status: DataPackageSubscriptionStatus.Requested,
          lastRequestTime: new Date().toUTCString()
        }
      }
    };
  }),
  on(packageActions.userRequestsPackageSubscriptionWithError, (state): State => {
    return {
      ...state,
      selectedPackageRequesting: null
    };
  }),
  on(packageActions.userSelectedPackage, (state, { id }): State => {
    if (state.selectedProfileId === id) {
      return state;
    }
    return {
      ...state,
      selectedProfileId: id,
      selectedPackage: null,
      selectedPackageDownloading: false,
      selectedPackageRequesting: null
    };
  })
);

export function packageReducer(state, action) {
  return _packageReducer(state, action);
}
