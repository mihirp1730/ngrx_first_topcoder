import { Component, ChangeDetectionStrategy, EventEmitter, Input, Output } from '@angular/core';

export interface RenderableDocument {
  caption: string;
  fileId: string;
  fileName: string;
  fileType: string;
  imgUrl: string|null;
}

@Component({
  selector: 'apollo-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentsComponent {
  @Input() documents: RenderableDocument[] = [];
  @Output() openedDocument = new EventEmitter<RenderableDocument>();
}
