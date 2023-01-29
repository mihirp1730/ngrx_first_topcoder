import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SlbButtonModule } from '@slb-dls/angular-material/button';
import { SlbDropzoneModule } from '@slb-dls/angular-material/dropzone';
import { SlbFormFieldModule } from '@slb-dls/angular-material/form-field';
import { DocumentPreviewComponent } from './document-preview/document-preview.component';
import { DocumentUploadPreviewComponent } from './document-upload-preview/document-upload-preview.component';

@NgModule({
  imports: [CommonModule, SlbDropzoneModule, MatIconModule, SlbButtonModule, MatInputModule, FormsModule, ReactiveFormsModule, SlbFormFieldModule, MatProgressSpinnerModule ],
  declarations: [DocumentUploadPreviewComponent, DocumentPreviewComponent ],
  exports: [ DocumentUploadPreviewComponent ]
})

export class AppDocumentUploadModule {}
