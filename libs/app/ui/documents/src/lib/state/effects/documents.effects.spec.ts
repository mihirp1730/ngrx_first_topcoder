import { TestBed } from '@angular/core/testing';
import { IDocumentDetail } from '@apollo/api/discovery/summary-cards';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { ReplaySubject, of } from 'rxjs';
import { take } from 'rxjs/operators';

import { DocumentsService } from '../../services/documents.service';
import * as documentsActions from '../actions/documents.actions';
import { DocumentsEffects } from './documents.effects';

class MockDocumentsService {
  getDocumentSignedUrl = jest.fn().mockReturnValue(of({ signedUrl: null }));
  openDocumentUrl = jest.fn();
  downloadDocument = jest.fn();
}

describe('DocumentsEffects', () => {
  let actions$: ReplaySubject<Action>;
  let effects: DocumentsEffects;
  let mockDocumentsService: MockDocumentsService;

  beforeEach(() => {
    actions$ = new ReplaySubject(1);
    TestBed.configureTestingModule({
      providers: [
        provideMockActions(() => actions$),
        provideMockStore(),
        DocumentsEffects,
        {
          provide: DocumentsService,
          useClass: MockDocumentsService
        }
      ]
    });
    effects = TestBed.inject(DocumentsEffects);
    mockDocumentsService = TestBed.inject(DocumentsService) as unknown as MockDocumentsService;
  });

  afterEach(() => {
    actions$.complete();
  });

  describe('selectDocumentFromWidget$', () => {
    it('should call openDocumentUrl', (done) => {
      effects.selectDocumentFromWidget$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toEqual(documentsActions.selectRecordDocumentFromWidgetLoaded.type);
        expect(mockDocumentsService.openDocumentUrl).toHaveBeenCalled();
        done();
      });
      actions$.next(
        documentsActions.selectRecordDocumentFromWidget({
          document: {
            documentId: 'documentId',
            fileType: 'pdf'
          } as IDocumentDetail,
          recordId: 'recordId'
        })
      );
    });
  });
});
