import { StatusEnum } from '../../../commons/enums/meta-data.enum';
import { IGisLayerSettings } from '../../../commons/interfaces/gis-settings';

export class LayerSetting {
  name: string;
  fkey: string;
  setting: IGisLayerSettings;
  status: StatusEnum;
  createDateTime: Date;
  createdBy: string;
  lastChangedDateTime: Date;
  lastChangedBy: string;
}
