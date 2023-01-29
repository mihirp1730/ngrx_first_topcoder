/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IGisLayerSettings {
  id?: string;
  tenantName?: any;
  name?: string;
  service?: any;
  server?: any;
  query?: any;
  tableInfo?: string | any;
  attemptFlattening?: boolean;
  defaultLayer?: boolean;
  style?: any;
  creator?: any;
  visibility?: boolean;
  zOrder?: number;
  opacity?: string;
  icon?: any;
  onClick?: any;
  clickTemplate?: string;
  onHover?: any;
  hoverTemplate?: string;
  hoverFieldsCommaDel?: string;
  smoothReload?: boolean;
  mergeLayer?: string;
  compositeKey?: any;
}
