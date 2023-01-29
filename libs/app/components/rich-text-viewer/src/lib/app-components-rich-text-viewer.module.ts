import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { QuillModule } from 'ngx-quill';

import { RichTextViewerComponent } from './components/rich-text-viewer.component';

@NgModule({
  imports: [
    CommonModule,
    QuillModule
  ],
  exports: [RichTextViewerComponent],
  declarations: [RichTextViewerComponent]
})
export class AppComponentsRichTextViewerModule {}
