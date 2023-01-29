import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  GISCANVAS_FACTORY,
  OpportunityMapWrapperComponent
} from './opportunity-creator/opportunity-map-wrapper/opportunity-map-wrapper.component';
import { GisCanvas, GisComponentsModule } from '@slb-innersource/gis-canvas';
import { opportunityFeatureKey, opportunityReducer } from './state/reducers/opportunity.reducer';

import { AdditionalServicesComponent } from './opportunity-creator/additional-services/additional-services.component';
import { ApolloFormPatcherModule } from '@apollo/app/directives/form-patcher';
import { AppDocumentUploadModule } from '@apollo/app/document-upload';
import { AppMediaUploadPreviewModule } from '@apollo/app/media-upload-preview';
import { AppUiDataGridModule } from '@apollo/app/ui/data-grid';
import { AppUploadWidgetModule } from '@apollo/app/upload-widget';
import { ApproveRequestModalComponent } from './opportunity-request/approve-request-modal/approve-request-modal.component';
import { ApprovedRequestsComponent } from './opportunity-request/approved-requests/approved-requests.component';
import { AssetShapeComponent } from './opportunity-creator/asset-shape/asset-shape.component';
import { CommonModule } from '@angular/common';
import { ConfidentialInformationComponent } from './opportunity-creator/confidential-information/confidential-information.component';
import { CreateOpportunityModalComponent } from './opportunity-creator/create-opportunity-modal/create-opportunity-modal.component';
import { EffectsModule } from '@ngrx/effects';
import { ManageAccessComponent } from './manage-access/manage-access.component';
import { ManageSubscriptionModalComponent } from './manage-access/manage-subscription-modal/manage-subscription-modal.component';
import { MapHighlightDirective } from './directive/map-highlight.directive';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { NgModule } from '@angular/core';
import { OpenInformationComponent } from './opportunity-creator/open-information/open-information.component';
import { OpportunityContainerComponent } from './opportunity-container/opportunity-container.component';
import { OpportunityCreatorComponent } from './opportunity-creator/opportunity-creator.component';
import { OpportunityDetailsComponent } from './opportunity-creator/opportunity-details/opportunity-details.component';
import { OpportunityEffects } from './state/effects/opportunity.effects';
import { OpportunityRequestComponent } from './opportunity-request/opportunity-request.component';
import { OpportunityRoutingModule } from './opportunity-routing.module';
import { PendingRequestsComponent } from './opportunity-request/pending-requests/pending-requests.component';
import { QuillModule } from 'ngx-quill';
import { RejectRequestModalComponent } from './opportunity-request/reject-request-modal/reject-request-modal.component';
import { RejectedRequestsComponent } from './opportunity-request/rejected-requests/rejected-requests.component';
import { RequestTableComponent } from './opportunity-request/request-table/request-table.component';
import { SlbAutocompleteModule } from '@slb-dls/angular-material/autocomplete';
import { SlbButtonModule } from '@slb-dls/angular-material/button';
import { SlbDatePickerModule } from '@slb-dls/angular-material/date-picker';
import { SlbDatePickerRangeModule } from '@slb-dls/angular-material/date-range-picker';
import { SlbDropdownModule } from '@slb-dls/angular-material/dropdown';
import { SlbFormFieldModule } from '@slb-dls/angular-material/form-field';
import { SlbNotificationModule } from '@slb-dls/angular-material/notification';
import { SlbNumericInputControlModule } from '@slb-dls/angular-material/numeric-input-control';
import { SlbPaginationControlModule } from '@slb-dls/angular-material/pagination-control';
import { SlbSearchModule } from '@slb-dls/angular-material/search';
import { SlbSharedModule } from '@slb-dls/angular-material/shared';
import { SlbTabControlModule } from '@slb-dls/angular-material/tab-control';
import { StoreModule } from '@ngrx/store';

@NgModule({
  declarations: [
    OpportunityContainerComponent,
    OpportunityCreatorComponent,
    OpportunityDetailsComponent,
    OpenInformationComponent,
    ConfidentialInformationComponent,
    AdditionalServicesComponent,
    AssetShapeComponent,
    OpportunityMapWrapperComponent,
    OpportunityRequestComponent,
    PendingRequestsComponent,
    ManageAccessComponent,
    ApprovedRequestsComponent,
    RejectedRequestsComponent,
    ApproveRequestModalComponent,
    ManageSubscriptionModalComponent,
    RejectRequestModalComponent,
    RequestTableComponent,
    MapHighlightDirective,
    CreateOpportunityModalComponent
  ],
  imports: [
    CommonModule,
    OpportunityRoutingModule,
    GisComponentsModule,
    SlbButtonModule,
    FormsModule,
    MatCheckboxModule,
    MatChipsModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatTabsModule,
    MatTableModule,
    MatSlideToggleModule,
    QuillModule.forRoot(),
    ReactiveFormsModule,
    SlbAutocompleteModule,
    SlbDatePickerModule,
    SlbDatePickerRangeModule,
    SlbDropdownModule,
    SlbFormFieldModule,
    SlbNotificationModule,
    SlbNumericInputControlModule,
    SlbPaginationControlModule,
    SlbSharedModule,
    StoreModule.forFeature(opportunityFeatureKey, opportunityReducer),
    EffectsModule.forFeature([OpportunityEffects]),
    SlbTabControlModule,
    AppDocumentUploadModule,
    AppMediaUploadPreviewModule,
    AppUploadWidgetModule,
    ApolloFormPatcherModule,
    AppUiDataGridModule,
    SlbSearchModule
  ],
  providers: [
    {
      provide: GISCANVAS_FACTORY,
      useValue: () => {
        return GisCanvas;
      }
    }
  ]
})
export class OpportunityModule {}
