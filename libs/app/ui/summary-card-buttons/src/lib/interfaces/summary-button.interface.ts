import { SummaryButtonEventType } from "../enums/event-type.enum";

export interface ISummaryButtonEvent {
    recordId: string;
    eventType: SummaryButtonEventType;
    data?: any;
}