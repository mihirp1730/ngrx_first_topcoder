import { RouterModule, Routes } from '@angular/router';

import { AuthenticationGuard } from '@apollo/app/auth-codeflow';
import { HomeComponent } from './home/home.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'vendor'
  },
  // [Not to remove] Added path to redirect to /vendor from /map as
  // we have redirect path defiened in auth-codeflow.service.ts singin method.
  {
    path: 'map',
    redirectTo: 'vendor'
  },
  {
    path: 'vendor',
    children: [
      {
        path: '',
        loadChildren: () => import('./opportunity/opportunity.module').then((m) => m.OpportunityModule),
        canActivate: [AuthenticationGuard],
        data: AuthenticationGuard.CreateAuthRouteData('user', '/')
      },
      {
        path: 'datapackage',
        component: HomeComponent
      },
      {
        path: 'package',
        loadChildren: () => import('./package/package.module').then((m) => m.DataPackageModule),
        canActivate: [AuthenticationGuard],
        data: AuthenticationGuard.CreateAuthRouteData('user', '/')
      },
      {
        path: 'communication',
        loadChildren: () => import('./communication/communication.module').then((m) => m.CommunicationModule),
        canActivate: [AuthenticationGuard],
        data: AuthenticationGuard.CreateAuthRouteData('user', '/')
      }
    ],
  },
  {
    path: '**',
    redirectTo: 'vendor'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthenticationGuard]
})
export class AppRoutingModule {}
