import * as commonActions from '../actions/common.actions';

import { CommonState, initialCommonState } from '../common.state';
import { createReducer, on } from '@ngrx/store';

export const commonDataFeatureKey = 'common';

const _commonReducer = createReducer(
  initialCommonState,
  on(commonActions.saveAssetShapeFillStyle, (state, { assetShapeFillStyles }): CommonState => {
    return {
      ...state,
      assetShapeFillStyles
    };
  })
);

export function commonReducer(state, action) {
  return _commonReducer(state, action);
}
