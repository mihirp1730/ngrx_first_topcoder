import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { AuthCodeFlowService } from './auth-codeflow.service';

export type AuthRouteData = {
  requireGuest: boolean;
  requireUser: boolean;
  redirectUrl: string;
  isPublic: boolean;
  whitelistedGuestList: string;
  enableGuestLogin: boolean;
  authenticateUser: boolean;
};

/**
 * Handle route according to user's session (signed-in vs guest)
 */
@Injectable()
export class AuthenticationGuard implements CanActivate {
  static CreateAuthRouteData(require: 'guest' | 'user' | string, redirectUrl: string, guestLoginDetails: any = '', isPublic = false) {
    return {
      auth: {
        requireGuest: require.includes('guest'),
        requireUser: require.includes('user'),
        redirectUrl,
        isPublic,
        whitelistedGuestList : guestLoginDetails?.whitelistedGuestList,
        enableGuestLogin: guestLoginDetails?.enableGuestLogin === 'true',
        authenticateUser: guestLoginDetails?.authenticateUser,
      } as AuthRouteData
    };
  }

  constructor(private authCodeFlowService: AuthCodeFlowService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    return this.authCodeFlowService.getUser().pipe(
      take(1),
      map((user) => {
        const auth: AuthRouteData = route?.data?.auth ?? null;
        if (!auth) {
          console.error(
            'Authentication guard needs route data. Please make sure the below is used:\n' +
              '{\n' +
              '  ...\n' +
              '  canActivate: [AuthenticationGuard],\n' +
              "  data: AuthenticationGuard.CreateAuthRouteData('user', '/login')\n" +
              '}'
          );
          return false;
        }

        let guestList = [] ;
        if (auth.whitelistedGuestList) {
          guestList = auth.whitelistedGuestList?.split(",") ;
        }

        // If user is not a guest and doesn't have access token means we don't want guest login enable, 
        // we handle that scenario with this condition
        if (!user.isGuest && user.accessToken === '') {
          if (auth.isPublic) {
            return true;
          }

        } else {
          // If the user is signed in as a delfi user and the route require to be signed in let him pass
          if (auth.requireUser && !user.isGuest) {
            // If guest login is disabled then authenticate users based on whitelisted ids
            if (auth.authenticateUser && !auth.enableGuestLogin) {

              // check if domain exists in whitelisted ids
              const domainIndex = guestList.findIndex((whitelistedId) => `@${user.email.split('@').pop()}` === whitelistedId.trim());

              // check email id exists in whitelisted ids
              const emailIndex = guestList.findIndex((whitelistedId) => user.email === whitelistedId.trim());

              if (!guestList.length || domainIndex > -1 || emailIndex > -1) {
                return true;
              } else {
                this.router.navigate(['unauthorized']);
                return false;
              }
            } else {
              return true;
            }
          }

          // If the route is accessible by a guest and the user is singed in as a guest let him pass
          if (auth.requireGuest && user.isGuest) {
            return true;
          }
        }

        // If the current user or guest do not meet the
        // route's requirements above, try and redirect.
        if (auth.redirectUrl) {
          this.router.navigate([auth.redirectUrl]);
        }

        // Always return `false` if the route's requirements
        // above are not met. This prevents wrong navigation.
        return false;
      })
    );
  }
}
