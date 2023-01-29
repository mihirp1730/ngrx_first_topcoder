import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap } from 'rxjs/operators';

import * as documentsActions from '../actions/documents.actions';
import { DocumentsService } from '../../services/documents.service';

@Injectable()
export class DocumentsEffects {
  selectDocumentFromWidget$ = createEffect(() =>
    this.actions$.pipe(
      ofType(documentsActions.selectRecordDocumentFromWidget),
      switchMap(({ document: { documentId, fileType }, recordId }) =>
        this.documentsService.getDocumentSignedUrl(documentId, recordId).pipe(
          map(({ signedUrl }) => {
            this.documentsService.openDocumentUrl(signedUrl);
            return documentsActions.selectRecordDocumentFromWidgetLoaded({ documentId });
          })
        )
      )
    )
  );

  constructor(public readonly actions$: Actions, public readonly documentsService: DocumentsService) {}
}
