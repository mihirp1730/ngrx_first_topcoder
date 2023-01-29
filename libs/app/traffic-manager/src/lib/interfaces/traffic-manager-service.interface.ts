import { InjectionToken } from '@angular/core';

import { ITrafficManagerConfiguration } from './traffic-manager-configuration.interface';

export const TRAFFIC_MANAGER_SERVICE = new InjectionToken<string>('TRAFFIC_MANAGER_SERVICE');

export interface ITrafficManagerService {
  initialize(configuration: ITrafficManagerConfiguration): Promise<void>;
  getToken(): string;
  setToken(token: string);
  validateTokenExpiration(token: string): boolean;
}
