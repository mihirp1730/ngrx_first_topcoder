import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationGuard } from '@apollo/app/auth-codeflow';

import { environment } from './../environments/environment';
import { AccessDeniedComponent } from './access-denied/access-denied.component';

const guestLoginDetails = {
  whitelistedGuestList: environment.whitelistedGuestList,
  enableGuestLogin: environment.enableGuestLogin,
  authenticateUser: true
};
const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadChildren: () => import('./landing/landing.module').then((m) => m.LandingModule),
    canActivate: [AuthenticationGuard],
    data: AuthenticationGuard.CreateAuthRouteData('guest', '/map', guestLoginDetails, true)
  },
  {
    path: 'communication',
    loadChildren: () => import('./communication/communication.module').then((m) => m.CommunicationModule),
    canActivate: [AuthenticationGuard],
    data: AuthenticationGuard.CreateAuthRouteData('user', '/', guestLoginDetails)
  },
  {
    path: 'map',
    loadChildren: () => import('./map-wrapper/map-wrapper.module').then((m) => m.MapWrapperModule),
    canActivate: [AuthenticationGuard],
    data: AuthenticationGuard.CreateAuthRouteData('guest, user', '/', guestLoginDetails)
  },
  {
    path: 'packages',
    loadChildren: () => import('./package/package.module').then((m) => m.PackageModule),
    canActivate: [AuthenticationGuard],
    data: AuthenticationGuard.CreateAuthRouteData('user', '/', guestLoginDetails)
  },
  {
    path: 'subscriptions',
    loadChildren: () => import('./subscription/subscription.module').then((m) => m.SubscriptionModule),
    canActivate: [AuthenticationGuard],
    data: AuthenticationGuard.CreateAuthRouteData('user', '/', guestLoginDetails)
  },
  {
    path: 'opportunity',
    loadChildren: () => import('./opportunity/opportunity.module').then((m) => m.OpportunityModule),
    canActivate: [AuthenticationGuard],
    data: AuthenticationGuard.CreateAuthRouteData('user', '/', guestLoginDetails)
  },
  {
    path: 'unauthorized',
    component: AccessDeniedComponent,
    canActivate: [AuthenticationGuard],
    data: AuthenticationGuard.CreateAuthRouteData('user', '/', { authenticateUser: false })
  },
  {
    path: '**',
    redirectTo: 'map'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthenticationGuard]
})
export class AppRoutingModule {}
