import { Injectable } from '@angular/core';

// Ref to https://developers.google.com/analytics/devguides/collection/ga4/events
export enum RecommendedEventEnum {
  search = 'search',
  login = 'login'
}

export enum CustomEventEnum {
}

@Injectable({
  providedIn: 'root'
})
export class GoogleAnalyticsService {
  private gtag: any;

  constructor() {
    this.gtag = window['gtag'];
  }

  public send(eventType: RecommendedEventEnum | CustomEventEnum, eventData: {[key: string] : string}) : void {
    this.gtag('event', eventType, eventData);
  }
}
