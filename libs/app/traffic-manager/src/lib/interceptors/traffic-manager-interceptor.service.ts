import { Injectable, Inject } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  TRAFFIC_MANAGER_SERVICE,
  TRAFFIC_MANAGER_CONFIGURATION,
  ITrafficManagerService,
  ITrafficManagerConfiguration
} from '../interfaces';

@Injectable()
export class TrafficManagerInterceptor implements HttpInterceptor {
  constructor(
    @Inject(TRAFFIC_MANAGER_SERVICE) private trafficManagerService: ITrafficManagerService,
    @Inject(TRAFFIC_MANAGER_CONFIGURATION) private configuration: ITrafficManagerConfiguration
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.configuration.isEnabled) {
      return next.handle(req);
    }

    const trafficManagerToken = this.trafficManagerService.getToken();
    if (!trafficManagerToken) {
      return next.handle(req);
    }

    return next.handle(
      req.clone({
        setHeaders: {
          'x-traffic-manager': trafficManagerToken
        }
      })
    );
  }
}
