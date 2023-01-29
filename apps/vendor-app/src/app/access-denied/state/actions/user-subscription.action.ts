import { createAction, props } from '@ngrx/store';

export const getUserSubscription = createAction('[access-denied] Get Access details');

export const getUserSubscriptionSuccess = createAction(
  '[access-denied] Access details Success',
  props<{ delfiAccess: boolean; userContext: boolean }>()
);
