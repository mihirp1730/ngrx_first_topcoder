import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { DocumentsComponent } from './components/documents.component';

@NgModule({
  imports: [
    CommonModule,
    MatProgressSpinnerModule
  ],
  exports: [DocumentsComponent],
  declarations: [DocumentsComponent]
})
export class AppComponentsDocumentsModule {}
