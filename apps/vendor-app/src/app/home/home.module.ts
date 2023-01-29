import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SlbAutocompleteModule } from '@slb-dls/angular-material/autocomplete';
import { SlbButtonModule } from '@slb-dls/angular-material/button';
import { SlbDatePickerModule } from '@slb-dls/angular-material/date-picker';
import { SlbDatePickerRangeModule } from '@slb-dls/angular-material/date-range-picker';
import { SlbDropdownModule } from '@slb-dls/angular-material/dropdown';
import { SlbFacetTextModule } from '@slb-dls/angular-material/facet-text';
import { SlbFormFieldModule } from '@slb-dls/angular-material/form-field';
import { SlbModalModule } from '@slb-dls/angular-material/modal';
import { SlbNotificationModule } from '@slb-dls/angular-material/notification';
import { SlbPaginationControlModule } from '@slb-dls/angular-material/pagination-control';

import { SlbPopoverModule } from '@slb-dls/angular-material/popover';
import { AddInviteUserModelComponent } from '../add-invite-user-model/add-invite-user-model.component';
import { OpportunityCatalogCardComponent } from '../dashboard/opportunity-catalog-card/opportunity-catalog-card.component';
import { OpportunityCatalogFilterComponent } from '../dashboard/opportunity-catalog-filter/opportunity-catalog-filter.component';
import { OpportunityCatalogComponent } from '../dashboard/opportunity-catalog/opportunity-catalog.component';
import { DataObjectsPipe } from '../dashboard/pipe/data-objects.pipe';
import { MapLargeHelperService } from '../dashboard/services/maplarge-helper.service';
import { dashboardFeatureKey, dashboardReducer } from '../dashboard/state/reducers/dashboard.reducer';
import { VendorDashboardCardComponent } from '../dashboard/vendor-dashboard-card/vendor-dashboard-card.component';
import { VendorDashboardFiltersComponent } from '../dashboard/vendor-dashboard-filters/vendor-dashboard-filters.component';
import { VendorDashboardModalComponent } from '../dashboard/vendor-dashboard-modal/vendor-dashboard-modal.component';
import { VendorDashboardComponent } from '../dashboard/vendor-dashboard/vendor-dashboard.component';
import { InviteAttendeesModalComponent } from '../invite-attendees-modal/invite-attendees-modal.component';
import { ConfirmModalComponent } from './../confirm-modal/confirm-modal.component';
import { OpportunityCatalogEffects } from './../dashboard/state/effects/opportunity-catalog.effects';
import { opportunityCatalogFeatureKey, opportunityCatalogReducer } from './../dashboard/state/reducers/opportunity-catalog.reducer';
import { HomeComponent } from './home.component';

@NgModule({
  declarations: [
    HomeComponent,
    VendorDashboardComponent,
    VendorDashboardCardComponent,
    ConfirmModalComponent,
    VendorDashboardFiltersComponent,
    OpportunityCatalogComponent,
    OpportunityCatalogCardComponent,
    OpportunityCatalogFilterComponent,
    VendorDashboardModalComponent,
    InviteAttendeesModalComponent,
    AddInviteUserModelComponent,
    DataObjectsPipe
  ],
  imports: [
    CommonModule,
    ScrollingModule,
    SlbButtonModule,
    SlbFacetTextModule,
    MatGridListModule,
    MatCardModule,
    MatChipsModule,
    MatBadgeModule,
    MatIconModule,
    MatCheckboxModule,
    SlbNotificationModule,
    SlbPaginationControlModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    SlbModalModule,
    SlbDatePickerModule,
    SlbDatePickerRangeModule,
    SlbDropdownModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    SlbFormFieldModule,
    ReactiveFormsModule,
    SlbAutocompleteModule,
    StoreModule.forFeature(dashboardFeatureKey, dashboardReducer),
    StoreModule.forFeature(opportunityCatalogFeatureKey, opportunityCatalogReducer),
    EffectsModule.forFeature([OpportunityCatalogEffects]),
    SlbPopoverModule
  ],
  providers: [MapLargeHelperService]
})
export class HomeModule {}
