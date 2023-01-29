import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { opportunityAttendeeFeatureKey, opportunityAttendeeReducer } from './state/reducers/opportunity-attendee.reducer';

import { AccessLevelDetailsComponent } from './access-level-details/access-level-details.component';
import { AccessStatusApprovedComponent } from './access-status-granted/access-status-approved.component';
import { AccessStatusLockedComponent } from './shared/access-status-locked/access-status-locked.component';
import { AccessStatusPendingComponent } from './access-status-pending/access-status-pending.component';
import { AppComponentsAttributeChipsModule } from '@apollo/app/components/attribute-chips';
import { AppComponentsCarouselModule } from '@apollo/app/components/carousel';
import { AppComponentsDocumentsModule } from '@apollo/app/components/documents';
import { AppComponentsRichTextViewerModule } from '@apollo/app/components/rich-text-viewer';
import { CommonModule } from '@angular/common';
import { DashboardContainerComponent } from './dashboard-container/dashboard-container.component';
import { EffectsModule } from '@ngrx/effects';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgModule } from '@angular/core';
import { OpportunityAttendeeEffects } from './state/effects/opportunity-attendee.effects';
import { OpportunityDashboardCardComponent } from './opportunity-dashboard-card/opportunity-dashboard-card.component';
import { OpportunityDashboardComponent } from './opportunity-dashboard/opportunity-dashboard.component';
import { OpportunityDetailsComponent } from './opportunity-details/opportunity-details.component';
import { OpportunityMediaViewerComponent } from './opportunity-media-viewer/opportunity-media-viewer.component';
import { OpportunityRequestsSubscriptionsComponent } from './opportunity-requests-subscriptions/opportunity-requests-subscriptions.component';
import { OpportunityRoutingModule } from './opportunity-routing.module';
import { RequestAccessModalComponent } from './request-access-modal/request-access-modal.component';
import { RequestsComponent } from './opportunity-requests-subscriptions/request-card/request-card.component';
import { SlbButtonModule } from '@slb-dls/angular-material/button';
import { SlbCarouselModule } from '@slb-dls/angular-material/carousel';
import { SlbFacetTextModule } from '@slb-dls/angular-material/facet-text';
import { SlbFormFieldModule } from '@slb-dls/angular-material/form-field';
import { SlbModalModule } from '@slb-dls/angular-material/modal';
import { SlbSplitButtonModule } from '@slb-dls/angular-material/split-button';
import { SlbTabControlModule } from '@slb-dls/angular-material/tab-control';
import { StoreModule } from '@ngrx/store';
import { SubscriptionsComponent } from './opportunity-requests-subscriptions/subscriptions-card/subscriptions-card.component';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature(opportunityAttendeeFeatureKey, opportunityAttendeeReducer),
    EffectsModule.forFeature([OpportunityAttendeeEffects]),
    FormsModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTabsModule,
    MatFormFieldModule,
    MatExpansionModule,
    AppComponentsRichTextViewerModule,
    OpportunityRoutingModule,
    ReactiveFormsModule,
    SlbModalModule,
    SlbButtonModule,
    SlbCarouselModule,
    SlbSplitButtonModule,
    SlbFacetTextModule,
    SlbFormFieldModule,
    SlbTabControlModule,
    AppComponentsCarouselModule,
    AppComponentsAttributeChipsModule,
    AppComponentsDocumentsModule,
    MatTooltipModule
  ],
  declarations: [
    AccessLevelDetailsComponent,
    AccessStatusApprovedComponent,
    AccessStatusLockedComponent,
    AccessStatusPendingComponent,
    DashboardContainerComponent,
    OpportunityDashboardComponent,
    OpportunityDashboardCardComponent,
    OpportunityDetailsComponent,
    OpportunityMediaViewerComponent,
    OpportunityRequestsSubscriptionsComponent,
    RequestAccessModalComponent,
    SubscriptionsComponent,
    RequestsComponent
  ],
  exports: [OpportunityDetailsComponent]
})
export class OpportunityModule {}
