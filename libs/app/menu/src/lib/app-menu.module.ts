import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MenuComponent } from './menu/menu.component';

@NgModule({
  imports: [CommonModule, RouterModule, MatTooltipModule],
  declarations: [MenuComponent],
  exports: [MenuComponent]
})
export class AppMenuModule {}
