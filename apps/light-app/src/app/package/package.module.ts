import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlbButtonModule } from '@slb-dls/angular-material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SlbCarouselModule } from '@slb-dls/angular-material/carousel';
import { SlbFormFieldModule } from '@slb-dls/angular-material/form-field';
import { SlbModalModule } from '@slb-dls/angular-material/modal';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AppDashboardModule } from '@apollo/app/dashboard';
import { MediaDocumentUploaderService } from '@apollo/app/services/media-document-uploader';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { OpportunityModalNonpublicSigninComponent } from './opportunity-modal-nonpublic-signin/opportunity-modal-nonpublic-signin.component';
import { PackageContainerComponent } from './package-container/package-container.component';
import { PackageRoutingModule } from './package-routing.module';
import { PackageDashboardComponent } from './package-dashboard/package-dashboard.component';
import { PackageFilterModule } from './package-filter/package-filter.module';
import { PackageCardComponent } from './package-card/package-card.component';
import { PackageRequestComponent } from './package-request/package-request.component';
import { PackageModalCancelRequestComponent } from './package-modal-cancel-request/package-modal-cancel-request.component';
import { PackageDetailsComponent } from './package-details/package-details.component';
import { PackageMediaViewerComponent } from './package-media-viewer/package-media-viewer.component';
import * as PackageRequestSubscriptionComponents from './package-request/subscriptions';
import { packageFeatureKey, packageReducer } from './state/reducers/package.reducer';
import { PackageEffects } from './state/effects/package.effects';

@NgModule({
  declarations: [
    OpportunityModalNonpublicSigninComponent,
    PackageContainerComponent,
    PackageDetailsComponent,
    PackageDashboardComponent,
    PackageCardComponent,
    PackageRequestComponent,
    PackageModalCancelRequestComponent,
    PackageMediaViewerComponent,
    PackageRequestSubscriptionComponents.ActiveComponent,
    PackageRequestSubscriptionComponents.ApprovedComponent,
    PackageRequestSubscriptionComponents.ExpiredComponent,
    PackageRequestSubscriptionComponents.RequestedComponent,
    PackageRequestSubscriptionComponents.VoidComponent
  ],
  imports: [
    CommonModule,
    PackageRoutingModule,
    StoreModule.forFeature(packageFeatureKey, packageReducer),
    EffectsModule.forFeature([PackageEffects]),
    SlbButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    PackageFilterModule,
    AppDashboardModule,
    FormsModule,
    ReactiveFormsModule,
    SlbModalModule,
    SlbCarouselModule,
    SlbFormFieldModule
  ],
  exports: [PackageDetailsComponent],
  providers: [MediaDocumentUploaderService]
})
export class PackageModule {}
