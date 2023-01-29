import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { LogViewerButtonComponent } from './log-viewer-button/log-viewer-button.component';

@NgModule({
  imports: [CommonModule, MatIconModule, MatMenuModule, MatTooltipModule],
  declarations: [LogViewerButtonComponent],
  exports: [LogViewerButtonComponent]
})
export class SendToButtonsModule {}
