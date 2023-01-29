import { createFeatureSelector, createSelector } from '@ngrx/store';

import { State } from '../documents.state';
import { documentsFeatureKey } from '../reducers/documents.reducer';

//
// State Selectors:
//

export const selectFeature = createFeatureSelector< State>(documentsFeatureKey);
export const selectedLoadingDocuments = createSelector(
  selectFeature,
  (documentsState) => documentsState.selectedLoadingDocuments
);
