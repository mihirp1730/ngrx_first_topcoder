import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SlbButtonModule } from '@slb-dls/angular-material/button';
import { SlbDropzoneModule } from '@slb-dls/angular-material/dropzone';
import { SlbProgressIndicatorModule } from '@slb-dls/angular-material/progress-indicator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { UploadWidgetComponent } from './upload-widget/upload-widget.component';
import { FileProgressComponent } from './file-progress/file-progress.component';

@NgModule({
  imports: [CommonModule, MatIconModule, SlbButtonModule, SlbProgressIndicatorModule, SlbDropzoneModule, MatProgressSpinnerModule],
  declarations: [UploadWidgetComponent, FileProgressComponent],
  exports: [UploadWidgetComponent, FileProgressComponent]
})
export class AppUploadWidgetModule {}
