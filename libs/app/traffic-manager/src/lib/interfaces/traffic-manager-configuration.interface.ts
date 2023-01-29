import { InjectionToken } from '@angular/core';

export const TRAFFIC_MANAGER_CONFIGURATION = new InjectionToken<string>('TRAFFIC_MANAGER_CONFIGURATION');

export interface ITrafficManagerConfiguration {
  trafficManagerUrl?: string;
  errorRedirect?: string;
  isEnabled: boolean;
}
