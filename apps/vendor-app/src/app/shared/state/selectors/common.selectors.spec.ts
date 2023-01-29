import * as commonSelectors from './common.selectors';

describe('state selectors', () => {
  describe('selectAssetShapeFillStyles', () => {
    it('should select asset shape fill styles', () => {
      const state = {
        assetShapeFillStyles: [
          {
            assetType: 'CCUS',
            fillColor: 'rgb(230, 104, 0.3, 23)'
          }
        ]
      };
      const selection = commonSelectors.selectAssetShapeFillStyles.projector(state);
      expect(selection).toBe(state.assetShapeFillStyles);
    });
  });
});
