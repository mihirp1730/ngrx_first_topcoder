import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { SlbFormFieldModule } from '@slb-dls/angular-material/form-field';
import { SlbSearchModule } from '@slb-dls/angular-material/search';

import { PackageFilterComponent } from './package-filter.component';

@NgModule({
  declarations: [PackageFilterComponent],
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, SlbFormFieldModule, SlbSearchModule],
  exports: [PackageFilterComponent]
})
export class PackageFilterModule {}
