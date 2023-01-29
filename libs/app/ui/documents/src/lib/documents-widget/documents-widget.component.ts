import { Store } from '@ngrx/store';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { IDocumentDetail } from '@apollo/api/discovery/summary-cards';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { DocumentsService } from '../services/documents.service';
import * as documentsSelectors from '../state/selectors/documents.selectors';

@Component({
  selector: 'apollo-documents-widget',
  templateUrl: './documents-widget.component.html',
  styleUrls: ['./documents-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentsWidgetComponent implements OnChanges {
  @Input() recordId = '';
  @Output() documentClick: EventEmitter<any> = new EventEmitter<any>();

  public documents$: Observable<IDocumentDetail[]> = of([]);

  constructor(
    public readonly store: Store,
    public readonly documentsService: DocumentsService
  ) {}

  public ngOnChanges(simpleChanges: SimpleChanges): void {
    if(simpleChanges.recordId.currentValue) {
      this.documents$ = this.documentsService.getDocumentsDetailWithFileType(this.recordId);
    }
  }

  public clickDocument(document: IDocumentDetail) {
    this.documentClick.emit(document);
  }

  public documentIcon(document: IDocumentDetail): string {
    if (document.fileType === 'pdf') {
      return 'pdf';
    }
    return 'document';
  }

  public documenLoading(document: IDocumentDetail): Observable<boolean> {
    return this.store.select(documentsSelectors.selectedLoadingDocuments).pipe(
      map((loadingDocuments) => loadingDocuments.includes(document.documentId))
    );
  }
}
