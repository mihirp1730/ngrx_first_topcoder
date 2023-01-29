import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationGuard } from '@apollo/app/auth-codeflow';

import { PackageContainerComponent } from './package-container/package-container.component';
import { PackageCreatorComponent } from './package-creator/package-creator.component';
import { PackageEditGuard } from './package-edit.guard';
import { PackageResolver } from './package.resolver';

export const layoutRoutes: Routes = [
  {
    path: '',
    component: PackageContainerComponent,
    children: [
      {
        path: 'create',
        component: PackageCreatorComponent
      },
      {
        path: 'edit/:id',
        component: PackageCreatorComponent,
        data: {
          editMode: true
        },
        resolve: {
          package: PackageResolver
        },
        canDeactivate: [PackageEditGuard]
      },
      {
        path: 'requests',
        loadChildren: () => import('../request/request.module').then((m) => m.RequestModule),
        canActivate: [AuthenticationGuard],
        data: AuthenticationGuard.CreateAuthRouteData('user', '/')
      },
      {
        path: 'subscription',
        loadChildren: () => import('../subscription/subscription.module').then(m => m.SubscriptionModule),
        canActivate: [AuthenticationGuard],
        data: AuthenticationGuard.CreateAuthRouteData('user', '/')
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(layoutRoutes)],
  exports: [RouterModule]
})
export class PackageRoutingModule {}
