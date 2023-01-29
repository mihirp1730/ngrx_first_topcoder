import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SubscriptionContainerComponent } from './subscription-container/subscription-container.component';
import { SubscriptionDashboardComponent } from './subscription-dashboard/subscription-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: SubscriptionContainerComponent,
    children: [
      {
        path: '',
        component: SubscriptionDashboardComponent,
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
export class SubscriptionRoutingModule {}
