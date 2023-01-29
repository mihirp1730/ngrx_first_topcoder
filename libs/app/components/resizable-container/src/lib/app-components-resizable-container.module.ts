import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { ResizableContainerComponent } from './components/resizable-container.component';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule
  ],
  declarations: [ResizableContainerComponent],
  exports: [ResizableContainerComponent]
})
export class AppComponentsResizableContainerModule {}
