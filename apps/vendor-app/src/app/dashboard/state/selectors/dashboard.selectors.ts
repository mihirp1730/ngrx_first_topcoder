import { createFeatureSelector, createSelector } from '@ngrx/store';

import { State } from '../dashboard.state';
import { dashboardFeatureKey } from '../reducers/dashboard.reducer';

//
// State Selectors:
//

export const selectFeature = createFeatureSelector< State>(dashboardFeatureKey);
export const selectFilters = createSelector(
    selectFeature,
    (dashboardState) => dashboardState.filters
);


