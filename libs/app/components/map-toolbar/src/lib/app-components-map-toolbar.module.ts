import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GisTopToolbarModule } from '@slb-innersource/gis-canvas';
import { MatIconModule } from '@angular/material/icon';

import { MapToolbarComponent } from './components/map-toolbar.component';

@NgModule({
  imports: [
    CommonModule,
    GisTopToolbarModule,
    MatIconModule
  ],
  declarations: [
    MapToolbarComponent
  ],
  exports: [
    MapToolbarComponent
  ]
})
export class AppComponentsMapToolbarModule {}
