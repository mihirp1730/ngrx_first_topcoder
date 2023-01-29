import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

import { AuthUser } from '@apollo/api/interfaces';
import { AuthCodeFlowService } from './auth-codeflow.service';

/**
 * if user is signed in, authorization header will be added
 */
@Injectable()
export class AuthenticationInterceptorService implements HttpInterceptor {
  constructor(private authCodeFlowService: AuthCodeFlowService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Note: use take(1) to ensure we don't indefinitely subscribe to the stream.
    return this.authCodeFlowService.getUser().pipe(
      take(1),
      switchMap<AuthUser, Observable<HttpEvent<any>>>((user) => {
        if (!user) {
          return next.handle(req);
        }
        if (!req.headers.has('Authorization')) {
          const request = req.clone({
            setHeaders: {
              Authorization: `Bearer ${user.accessToken}`
            }
          });
          return next.handle(request);
        }
        return next.handle(req);
      })
    );
  }
}
