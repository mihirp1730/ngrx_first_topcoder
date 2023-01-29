import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SlbButtonModule } from '@slb-dls/angular-material/button';
import { SlbDropzoneModule } from '@slb-dls/angular-material/dropzone';
import { SlbFormFieldModule } from '@slb-dls/angular-material/form-field';

import { MediaPreviewComponent } from './media-preview/media-preview.component';
import { MediaUploadPreviewComponent } from './media-upload-preview/media-upload-preview.component';

@NgModule({
  imports: [ CommonModule, SlbDropzoneModule, MatIconModule, SlbButtonModule, MatInputModule, FormsModule, ReactiveFormsModule,
    SlbFormFieldModule, MatProgressSpinnerModule ],
  declarations: [ MediaUploadPreviewComponent, MediaPreviewComponent ],
  exports: [ MediaUploadPreviewComponent ]
})
export class AppMediaUploadPreviewModule {}
