import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SidePanelComponent } from './side-panel/side-panel.component';

@NgModule({
  imports: [CommonModule],
  declarations: [SidePanelComponent],
  exports: [SidePanelComponent]
})
export class AppSidePanelModule {}
