import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PackageContainerComponent } from './package-container/package-container.component';
import { PackageDetailsComponent } from './package-details/package-details.component';
import { PackageDashboardComponent } from './package-dashboard/package-dashboard.component';
import { AuthenticationGuard } from '@apollo/app/auth-codeflow';

const routes: Routes = [
  {
    path: '',
    component: PackageContainerComponent,
    children: [
      {
        path: ':id',
        component: PackageDetailsComponent
      },
      {
        path: '',
        component: PackageDashboardComponent,
        canActivate: [
          // Implement AuthGuard
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PackageRoutingModule {}
