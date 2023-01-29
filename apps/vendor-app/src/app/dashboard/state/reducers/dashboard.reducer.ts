import { createReducer, on } from '@ngrx/store';

import * as dashboardActions from '../actions/dashboard.actions';
import { initialState, State } from '../dashboard.state';

export const dashboardFeatureKey = 'dashboard';

const _dashboardReducer = createReducer(
  initialState,
  on(dashboardActions.userChangedFilters, (state, { filters }): State => {
    return {
      ...state,
      filters
    };
  })
);

export function dashboardReducer(state, action) {
  return _dashboardReducer(state, action);
}