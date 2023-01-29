export interface CommonState {
  assetShapeFillStyles: AssetShapeFillStyle[];
}

export const initialCommonState: CommonState = {
  assetShapeFillStyles: []
}

export interface AssetShapeFillStyle {
  assetType: string;
  fillColor: string;
}
