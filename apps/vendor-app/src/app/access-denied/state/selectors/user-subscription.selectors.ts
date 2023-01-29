import { createFeatureSelector, createSelector } from '@ngrx/store';
import { accessFeatureKey } from '../reducers/user-subscription.reducer';

export const selectFeature = createFeatureSelector<any>(accessFeatureKey);

export const delfiAccessStatus = createSelector(selectFeature, (state) => state);

export const selectLoggedInUserDetails = createSelector(selectFeature, (state) => state.loggedInUserDetails);
