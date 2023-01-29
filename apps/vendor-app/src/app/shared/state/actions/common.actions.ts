import { createAction, props } from "@ngrx/store";

import { AssetShapeFillStyle } from "../common.state";

export const saveAssetShapeFillStyle = createAction(
  '[Common] Save Asset Shape Fill Style',
  props<{ assetShapeFillStyles: AssetShapeFillStyle[] }>()
);
