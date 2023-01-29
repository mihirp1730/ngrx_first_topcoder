import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardContainerComponent } from './dashboard-container/dashboard-container.component';
import { OpportunityDashboardComponent } from './opportunity-dashboard/opportunity-dashboard.component';
import { OpportunityDetailsComponent } from './opportunity-details/opportunity-details.component';
import { OpportunityRequestsSubscriptionsComponent } from './opportunity-requests-subscriptions/opportunity-requests-subscriptions.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardContainerComponent,
    children: [
      {
        path: 'dashboard',
        component: OpportunityDashboardComponent
      },
      {
        path: 'requests',
        component: OpportunityRequestsSubscriptionsComponent
      },
      {
        path: ':id',
        component: OpportunityDetailsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OpportunityRoutingModule {}
