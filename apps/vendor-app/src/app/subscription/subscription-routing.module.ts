import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SubscriptionContainerComponent } from './subscription-container/subscription-container.component';
import { CreateSubscriptionComponent } from './create-subscription/create-subscription.component';
import { ManageSubscriptionComponent } from './manage-subscription/manage-subscription.component';

const routes: Routes = [
  {
    path: '',
    component: SubscriptionContainerComponent,
    children: [
      {
        path: 'create',
        component: CreateSubscriptionComponent
      },
      {
        path: 'manage',
        component: ManageSubscriptionComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubscriptionRoutingModule {}