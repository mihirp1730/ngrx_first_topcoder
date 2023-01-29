import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RequestContainerComponent } from './request-container/request-container.component';
import { RequestDashboardComponent } from './request-dashboard/request-dashboard.component';

export const layoutRoutes: Routes = [
  {
    path: '',
    component: RequestContainerComponent,
    children: [
      {
        path: '',
        component: RequestDashboardComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(layoutRoutes)],
  exports: [RouterModule]
})
export class RequestRoutingModule {}
