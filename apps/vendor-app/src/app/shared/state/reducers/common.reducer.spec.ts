import * as commonActions from '../actions/common.actions';

import { commonReducer } from './common.reducer';
import { initialCommonState } from '../common.state';

describe('commonReducer', () => {
  describe('saveAssetShapeFillStyle', () => {
    it('should return isDetailsValid as true', () => {
      const fillStyles = [
        {
          assetType: 'CCUS',
          fillColor: 'rgb(230, 104, 0.3, 23)'
        }
      ]
      const action = commonActions.saveAssetShapeFillStyle({ assetShapeFillStyles: fillStyles });
      const newState = commonReducer(initialCommonState, action);
      expect(newState.assetShapeFillStyles).toBeTruthy();
    });
  });
});
