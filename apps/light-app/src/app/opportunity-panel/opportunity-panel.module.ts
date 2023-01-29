import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AppFiltersModule } from '@apollo/app/filters';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SlbButtonModule } from '@slb-dls/angular-material/button';
import { SlbPopoverModule } from '@slb-dls/angular-material/popover';
import { SlbSearchModule } from '@slb-dls/angular-material/search';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { SlbDropdownPanelModule } from '@slb-dls/angular-material/dropdown-panel';
import { MatListModule } from '@angular/material/list';

import { OpportunityModule } from '../opportunity/opportunity.module';
import { HighlightDirective } from './directive/highlight.directive';
import { OpportunityCardWrapperComponent } from './opportunity-card-wrapper/opportunity-card-wrapper.component';
import { OpportunityCardsComponent } from './opportunity-cards/opportunity-cards.component';
import { OpportunityCatalogueComponent } from './opportunity-catalogue/opportunity-catalogue.component';
import { OpportunityHeaderComponent } from './opportunity-header/opportunity-header.component';
import { OpportunityPanelService } from './services/opportunity-panel.service';
import { OpportunityPanelEffects } from './state/effects/opportunity-panel.effects';
import { opportunityPanelFeatureKey, opportunityPanelReducer } from './state/reducers/opportunity-panel.reducer';
import { LayerFilterComponent } from './layer-filter/layer-filter.component';

@NgModule({
  imports: [
    AppFiltersModule,
    CommonModule,
    MatIconModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatInputModule,
    MatFormFieldModule,
    OpportunityModule,
    FormsModule,
    SlbDropdownPanelModule,
    MatListModule,
    SlbSearchModule,
    StoreModule.forFeature(opportunityPanelFeatureKey, opportunityPanelReducer),
    EffectsModule.forFeature([OpportunityPanelEffects]),
    ReactiveFormsModule,
    SlbPopoverModule,
    MatChipsModule,
    SlbButtonModule
  ],
  declarations: [
    OpportunityCardsComponent,
    OpportunityCatalogueComponent,
    OpportunityCardWrapperComponent,
    OpportunityHeaderComponent,
    HighlightDirective,
    LayerFilterComponent
  ],
  exports: [
    OpportunityCardsComponent,
    OpportunityCatalogueComponent,
    OpportunityCardWrapperComponent,
    OpportunityHeaderComponent,
    OpportunityCardWrapperComponent
  ],
  providers: [OpportunityPanelService, HighlightDirective]
})
export class OpportunityPanelModule {}
