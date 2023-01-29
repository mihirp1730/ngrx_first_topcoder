import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { RichTextEditorComponent } from './rich-text-editor/rich-text-editor.component';

@NgModule({
  imports: [CommonModule],
  exports:[RichTextEditorComponent],
  declarations: [
    RichTextEditorComponent
  ]
})
export class AppUiRichTextEditorModule {}
