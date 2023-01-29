import { IGisSettingsConfig } from '@slb-innersource/gis-canvas';

export interface IMapSettings {
  gisCanvas: IGisSettingsConfig;
  zoomToRadius: {
    [zoomLevel: string]: number;
  };
}
