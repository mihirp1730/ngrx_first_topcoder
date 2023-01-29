import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { AuthConfig, AuthUser } from '@apollo/api/interfaces';
import { Subject } from 'rxjs';

import { AuthCodeFlowService } from './auth-codeflow.service';
import { AuthenticationInterceptorService } from './authentication-interceptor.service';

describe('AuthenticationInterceptorService', () => {
  describe('without openid config', () => {
    const subject = new Subject<AuthUser>();

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          AuthenticationInterceptorService,
          {
            provide: AuthConfig,
            useValue: {}
          },
          {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthenticationInterceptorService,
            multi: true
          },
          {
            provide: AuthCodeFlowService,
            useValue: {
              getUser: () => {
                return subject;
              }
            }
          }
        ]
      });
    });

    it('should be created', inject([AuthenticationInterceptorService], (service: AuthenticationInterceptorService) => {
      expect(service).toBeTruthy();
    }));

    it('should add authorization header if user is signin ', inject(
      [HttpClient, HttpTestingController, AuthCodeFlowService],
      (http: HttpClient, httpMock: HttpTestingController, userService: AuthCodeFlowService) => {
        const user: AuthUser = {
          accessToken: 'accessToken',
          name: 'name',
          email: 'email',
          idToken: 'idToken',
          company: 'companyName',
          isGuest: false,
          gisToken: 'gisToken'
        };

        http.get('/data').subscribe((response) => {
          expect(response).toBeTruthy();
        });

        subject.next(user);

        httpMock.expectOne((req) => req.headers.has('Authorization') && req.headers.get('Authorization') === 'Bearer accessToken');

        httpMock.verify();
      }
    ));
  });
});
