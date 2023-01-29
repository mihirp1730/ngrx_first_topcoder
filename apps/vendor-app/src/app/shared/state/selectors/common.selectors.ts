import { createFeatureSelector, createSelector } from '@ngrx/store';

import { CommonState } from '../common.state';
import { commonDataFeatureKey } from '../reducers/common.reducer';

export const selectFeature = createFeatureSelector<CommonState>(commonDataFeatureKey);

export const selectAssetShapeFillStyles = createSelector(selectFeature, (commonState) => commonState.assetShapeFillStyles);
