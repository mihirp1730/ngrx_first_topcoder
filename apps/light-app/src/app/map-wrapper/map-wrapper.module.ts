import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppFiltersModule } from '@apollo/app/filters';
import { AppDraggableModalModule } from '@apollo/app/draggable-modal';
import { AppComponentsResizableContainerModule } from '@apollo/app/components/resizable-container';
import { AppLassoToolsModule } from '@apollo/app/lasso-tools';
import { AppMainSearchModule } from '@apollo/app/main-search';
import { AppMenuModule } from '@apollo/app/menu';
import { AppSidePanelModule } from '@apollo/app/side-panel';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SlbButtonModule } from '@slb-dls/angular-material/button';
import {
  GisComponentsModule,
  GisLayerPanelModule,
  GisResultDetailModule,
  GisSearchResultModule,
  HighlightOnHoverDirective
} from '@slb-innersource/gis-canvas';

import { GlobeLoaderModule } from '../globe-loader/globe-loader.module';
import { OpportunityModule } from '../opportunity/opportunity.module';
import { PackageModule } from '../package/package.module';
import { ItemHeaderComponent } from './components/item-header/item-header.component';
import { PackagesPanelItemComponent } from './components/packages-panel-item/packages-panel-item.component';
import { PackagesPanelListComponent } from './components/packages-panel-list/packages-panel-list.component';
import { ResultsLockIconComponent } from './components/results-lock-icon/results-lock-icon.component';
import { ResultsUseExtentsToggleComponent } from './components/results-use-extents-toggle/results-use-extents-toggle.component';
import { MapWrapperRoutingModule } from './map-wrapper-routing.module';
import { MapWrapperComponent } from './map-wrapper.component';
import { MapWrapperEffects } from './state/effects/map-wrapper.effects';
import { mapWrapperFeatureKey, mapWrapperReducer } from './state/reducers/map-wrapper.reducer';
import { OpportunityPanelModule } from '../opportunity-panel/opportunity-panel.module';
import { communicationFeatureKey, communicationReducer } from '../communication/state/reducers/communication.reducer';
import { CommunicationModularChatComponent } from '../communication/communication-modular-chat/communication-modular-chat.component';
import { CommunicationEffects } from '../communication/state/effects/communication.effects';
import { AppChatWindowModule } from '@apollo/app/chat-window';

@NgModule({
  declarations: [
    MapWrapperComponent,
    PackagesPanelItemComponent,
    PackagesPanelListComponent,
    ResultsUseExtentsToggleComponent,
    ItemHeaderComponent,
    ResultsLockIconComponent,
    CommunicationModularChatComponent
  ],
  imports: [
    CommonModule,
    StoreModule.forFeature(mapWrapperFeatureKey, mapWrapperReducer),
    StoreModule.forFeature(communicationFeatureKey, communicationReducer),
    EffectsModule.forFeature([MapWrapperEffects, CommunicationEffects]),
    MapWrapperRoutingModule,
    AppSidePanelModule,
    AppMainSearchModule,
    AppLassoToolsModule,
    AppChatWindowModule,
    AppMenuModule,
    PackageModule,
    OpportunityPanelModule,
    GisLayerPanelModule,
    GisSearchResultModule,
    GisResultDetailModule,
    GisComponentsModule,
    GlobeLoaderModule,
    SlbButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    ScrollingModule,
    AppDraggableModalModule,
    OpportunityModule,
    AppComponentsResizableContainerModule,
    AppFiltersModule,
    AppDraggableModalModule,
    OpportunityModule,
    AppComponentsResizableContainerModule
  ],
  providers: [HighlightOnHoverDirective]
})
export class MapWrapperModule {}
