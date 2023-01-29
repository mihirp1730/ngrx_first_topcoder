/**
 * Copyright (c) 2021 Schlumberger. All Rights Reserved. Schlumberger Private.
 */

import { Injectable, InjectionToken } from '@angular/core';

import { IEnvironmentSettings } from '@apollo/api/interfaces';

export const SECURE_ENVIRONMENT_SERVICE_API_URL = new InjectionToken<any>('SecureEnvironmentServiceApiUrl');

@Injectable({
  providedIn: 'root'
})
export class SecureEnvironmentService {
  private env: IEnvironmentSettings;

  constructor(private xmlHttpRequestFactory: () => XMLHttpRequest, private secureEnvironmentServiceApiUrl: string) {}

  public load(accessToken: string): Promise<void> {
    if (this.env) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const xhr = this.xmlHttpRequestFactory();
      xhr.open('GET', `${this.secureEnvironmentServiceApiUrl}/environment`);

      xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);

      xhr.addEventListener('readystatechange', () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
          this.env = JSON.parse(xhr.responseText);
          resolve();
        } else if (xhr.readyState === XMLHttpRequest.DONE) {
          // tslint:disable-next-line:no-console
          console.log('Environment keys load failed');
          resolve();
        }
      });
      xhr.send(null);
    });
  }

  get secureEnvironment(): IEnvironmentSettings {
    return this.env;
  }
}
