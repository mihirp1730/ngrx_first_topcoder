import { SummaryButtonEventType } from '../enums';

export interface IButtonDisplayConfig {
    [SummaryButtonEventType.DOCUMENT]: boolean | Array<string>;
    [SummaryButtonEventType.WELL_LOG]: boolean | Array<string>;
    [SummaryButtonEventType.SEISMIC_2D]: boolean | Array<string>;
}