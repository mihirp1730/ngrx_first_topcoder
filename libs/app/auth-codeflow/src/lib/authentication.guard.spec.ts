import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { take } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

import { AuthCodeFlowService } from './auth-codeflow.service';
import { AuthenticationGuard } from './authentication.guard';

const mockAuthCodeFlowService = {
  getUser: jest.fn().mockReturnValue(of({ isGuest: false, email: 'test@slb.com', enableGuestLogin: false, authenticateUser: true}))
};

describe('AuthenticationGuardService', () => {
  let authenticationGuard: AuthenticationGuard;
  let testingRouter: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AuthenticationGuard,
        {
          provide: AuthCodeFlowService,
          useValue: mockAuthCodeFlowService
        }
      ]
    });
    authenticationGuard = TestBed.inject(AuthenticationGuard);
    testingRouter = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(authenticationGuard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should handle no route', (done) => {
      const navigateSpy = jest.spyOn(testingRouter, 'navigate').mockImplementation();
      authenticationGuard
        .canActivate(null)
        .pipe(take(1))
        .subscribe((canActivate) => {
          expect(navigateSpy).not.toHaveBeenCalled();
          expect(canActivate).toBe(false);
          done();
        });
    });
    it('should handle no route data', (done) => {
      const navigateSpy = jest.spyOn(testingRouter, 'navigate').mockImplementation();
      const mockRoute = {} as unknown as ActivatedRouteSnapshot;
      authenticationGuard
        .canActivate(mockRoute)
        .pipe(take(1))
        .subscribe((canActivate) => {
          expect(navigateSpy).not.toHaveBeenCalled();
          expect(canActivate).toBe(false);
          done();
        });
    });
    it('should handle no auth route data', (done) => {
      const navigateSpy = jest.spyOn(testingRouter, 'navigate').mockImplementation();
      const mockRoute = {
        data: {}
      } as unknown as ActivatedRouteSnapshot;
      authenticationGuard
        .canActivate(mockRoute)
        .pipe(take(1))
        .subscribe((canActivate) => {
          expect(navigateSpy).not.toHaveBeenCalled();
          expect(canActivate).toBe(false);
          done();
        });
    });
    it('should not redirect if no url is provided', (done) => {
      const navigateSpy = jest.spyOn(testingRouter, 'navigate').mockImplementation();
      const mockRoute = {
        data: {
          auth: {
            requireUser: false
          }
        }
      } as unknown as ActivatedRouteSnapshot;
      authenticationGuard
        .canActivate(mockRoute)
        .pipe(take(1))
        .subscribe((canActivate) => {
          expect(navigateSpy).not.toHaveBeenCalled();
          expect(canActivate).toBe(false);
          done();
        });
    });
    it('delfi user should redirect', (done) => {
      const navigateSpy = jest.spyOn(testingRouter, 'navigate').mockImplementation();
      const redirectUrl = uuid();
      const mockRoute = {
        data: AuthenticationGuard.CreateAuthRouteData('guest', redirectUrl)
      } as unknown as ActivatedRouteSnapshot;
      authenticationGuard
        .canActivate(mockRoute)
        .pipe(take(1))
        .subscribe((canActivate) => {
          expect(navigateSpy).toHaveBeenCalledWith([redirectUrl]);
          expect(canActivate).toBe(false);
          done();
        });
    });
    it('delfi user should not redirect', (done) => {
      const navigateSpy = jest.spyOn(testingRouter, 'navigate').mockImplementation();
      const redirectUrl = uuid();
      const mockRoute = {
        data: AuthenticationGuard.CreateAuthRouteData('user', redirectUrl, {
          whitelistedGuestList : "@slb.com",
          authenticateUser : true 
        })
      } as unknown as ActivatedRouteSnapshot;
      authenticationGuard
        .canActivate(mockRoute)
        .pipe(take(1))
        .subscribe((canActivate) => {
          expect(navigateSpy).not.toHaveBeenCalled();
          expect(canActivate).toBe(true);
          done();
        });
    });

    it('delfi user should not redirect for vendor', (done) => {
      const navigateSpy = jest.spyOn(testingRouter, 'navigate').mockImplementation();
      const redirectUrl = uuid();
      const mockRoute = {
        data: AuthenticationGuard.CreateAuthRouteData('user', redirectUrl)
      } as unknown as ActivatedRouteSnapshot;
      authenticationGuard
        .canActivate(mockRoute)
        .pipe(take(1))
        .subscribe((canActivate) => {
          expect(navigateSpy).not.toHaveBeenCalled();
          expect(canActivate).toBe(true);
          done();
        });
    });

    it('delfi user should redirect to unauthorized', (done) => {
      const navigateSpy = jest.spyOn(testingRouter, 'navigate').mockImplementation();
      const redirectUrl = uuid();
      const mockRoute = {
        data: AuthenticationGuard.CreateAuthRouteData('user', redirectUrl, {
          whitelistedGuestList : "test.com",
          authenticateUser: true
        })
      } as unknown as ActivatedRouteSnapshot;
      authenticationGuard
        .canActivate(mockRoute)
        .pipe(take(1))
        .subscribe((canActivate) => {
          expect(navigateSpy).toHaveBeenCalled();
          expect(canActivate).toBe(false);
          done();
        });
    });
    it('guest user should redirect', (done) => {
      const navigateSpy = jest.spyOn(testingRouter, 'navigate').mockImplementation();
      mockAuthCodeFlowService.getUser.mockReturnValue(of({ isGuest: true }));
      const redirectUrl = uuid();
      const mockRoute = {
        data: AuthenticationGuard.CreateAuthRouteData('user', redirectUrl)
      } as unknown as ActivatedRouteSnapshot;
      authenticationGuard
        .canActivate(mockRoute)
        .pipe(take(1))
        .subscribe((canActivate) => {
          expect(navigateSpy).toHaveBeenCalledWith([redirectUrl]);
          expect(canActivate).toBe(false);
          done();
        });
    });
    it('guest user should not redirect', (done) => {
      const navigateSpy = jest.spyOn(testingRouter, 'navigate').mockImplementation();
      mockAuthCodeFlowService.getUser.mockReturnValue(of({ isGuest: true }));
      const redirectUrl = uuid();
      const mockRoute = {
        data: AuthenticationGuard.CreateAuthRouteData('guest', redirectUrl)
      } as unknown as ActivatedRouteSnapshot;
      authenticationGuard
        .canActivate(mockRoute)
        .pipe(take(1))
        .subscribe((canActivate) => {
          expect(navigateSpy).not.toHaveBeenCalled();
          expect(canActivate).toBe(true);
          done();
        });
    });

    it('non-signed in user should direct to landing page', (done) => {
      const navigateSpy = jest.spyOn(testingRouter, 'navigate').mockImplementation();
      mockAuthCodeFlowService.getUser.mockReturnValue(of({ accessToken: '', isGuest: false }));
      const redirectUrl = '/';
      const mockRoute = {
        data: AuthenticationGuard.CreateAuthRouteData('guest', redirectUrl, "test.com" ,true)
      } as unknown as ActivatedRouteSnapshot;
      authenticationGuard
        .canActivate(mockRoute)
        .pipe(take(1))
        .subscribe((canActivate) => {
          expect(navigateSpy).not.toHaveBeenCalled();
          expect(canActivate).toBe(true);
          done();
        });
    });
  });
});
