import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SlbButtonModule } from '@slb-dls/angular-material/button';

import { DraggableModalComponent } from './draggable-modal/draggable-modal.component';

@NgModule({
  imports: [CommonModule, DragDropModule, MatIconModule, SlbButtonModule],
  declarations: [DraggableModalComponent],
  exports: [DraggableModalComponent]
})
export class AppDraggableModalModule {}
