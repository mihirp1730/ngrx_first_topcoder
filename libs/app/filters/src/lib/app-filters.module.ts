import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalFiltersDialogComponent } from './global-filters/global-filters-dialog.component';
import { GisGlobalFiltersComponent } from './global-filters/global-filters.component';
import { FiltersModule } from '@slb-innersource/gis-canvas';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { SlbPopoverModule } from '@slb-dls/angular-material/popover';
import { SlbButtonModule } from '@slb-dls/angular-material/button';

@NgModule({
  imports: [CommonModule, MatChipsModule, MatIconModule, FiltersModule, SlbPopoverModule, SlbButtonModule],
  declarations: [GisGlobalFiltersComponent, GlobalFiltersDialogComponent],
  exports: [GisGlobalFiltersComponent]
})
export class AppFiltersModule { }
