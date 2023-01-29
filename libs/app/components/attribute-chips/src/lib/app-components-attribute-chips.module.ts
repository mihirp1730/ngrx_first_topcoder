import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AttributeChipsComponent } from './components/attribute-chips.component';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatTooltipModule
  ],
  exports: [AttributeChipsComponent],
  declarations: [AttributeChipsComponent]
})
export class AppComponentsAttributeChipsModule {}
