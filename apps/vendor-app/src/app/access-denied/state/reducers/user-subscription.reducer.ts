export const accessFeatureKey = 'access';

import { createReducer, on } from '@ngrx/store';
import * as userSubscriptionActions from '../actions/user-subscription.action';

import { initialState, State } from '../user-subscription.state';

const _userAccessReducer = createReducer(
  initialState,

  on(userSubscriptionActions.getUserSubscriptionSuccess, (state, { delfiAccess, userContext }): State => {
    return {
      ...state,
      delfiAccess,
      userContext
    };
  })
);

export function userAccessReducer(state, action) {
  return _userAccessReducer(state, action);
}
