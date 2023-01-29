import { RouterModule, Routes } from '@angular/router';

import { ManageAccessComponent } from './manage-access/manage-access.component';
import { NgModule } from '@angular/core';
import { OpportunityCatalogComponent } from '../dashboard/opportunity-catalog/opportunity-catalog.component';
import { OpportunityContainerComponent } from './opportunity-container/opportunity-container.component';
import { OpportunityCreatorComponent } from './opportunity-creator/opportunity-creator.component';
import { OpportunityRequestComponent } from './opportunity-request/opportunity-request.component';
import { OpportunityResolver } from './resolvers/opportunity.resolver';
import { CreateOpportunityGuard } from './opportunity-creator/create-opportunity.guard';

export const layoutRoutes: Routes = [
  {
    path: '',
    component: OpportunityContainerComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: OpportunityCatalogComponent
      },
      {
        path: 'create',
        component: OpportunityCreatorComponent,
        canDeactivate: [CreateOpportunityGuard]
      },
      {
        path: 'edit/:id',
        component: OpportunityCreatorComponent,
        data: {
          editMode: true
        },
        resolve: {
          opportunity: OpportunityResolver
        },
        canDeactivate: [CreateOpportunityGuard]
      },
      {
        path: 'requests',
        component: OpportunityRequestComponent
      },
      {
        path: 'manageaccess',
        component: ManageAccessComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(layoutRoutes)],
  exports: [RouterModule]
})
export class OpportunityRoutingModule {}
