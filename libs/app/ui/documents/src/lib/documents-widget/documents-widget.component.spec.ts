import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { IDocumentDetail } from '@apollo/api/discovery/summary-cards';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { take } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

import * as documentsSelectors from '../state/selectors/documents.selectors';
import { DocumentsService } from '../services/documents.service';
import { DocumentsWidgetComponent } from './documents-widget.component';

class MockDocumentsService {
  getDocumentsDetailWithFileType = jest.fn();
}

describe('DocumentsWidgetComponent', () => {
  let component: DocumentsWidgetComponent;
  let mockStore: MockStore;
  let fixture: ComponentFixture<DocumentsWidgetComponent>;
  let mockDocumentsService: MockDocumentsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DocumentsWidgetComponent],
      providers: [
        provideMockStore({}),
        {
          provide: DocumentsService,
          useClass: MockDocumentsService
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentsWidgetComponent);
    mockDocumentsService = TestBed.inject(DocumentsService) as unknown as MockDocumentsService;
    mockStore = TestBed.inject(Store) as unknown as MockStore;
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should create a documents with getDocumentsDetailWithFileType', () => {
      const recordId = uuid();
      const change: any = { recordId: { currentValue: recordId } };
      const mockRef = {};
      mockDocumentsService.getDocumentsDetailWithFileType.mockReturnValue(mockRef);
      component.recordId = recordId;
      component.ngOnChanges(change);
      expect(component.documents$).toBe(mockRef);
      expect(mockDocumentsService.getDocumentsDetailWithFileType).toHaveBeenCalledWith(recordId);
    });
  });

  describe('clickDocument', () => {
    it('should emit documentClick', (done) => {
      const mockRef = {};
      component.documentClick
        .pipe(take(1))
        .subscribe((clickedDocument) => {
        expect(clickedDocument).toBe(mockRef);
        done();
      });
      component.clickDocument(mockRef as IDocumentDetail);
    });
  });

  describe('documentIcon', () => {
    it('should return "pdf"', () => {
      const mockDocument = { fileType: 'pdf' } as IDocumentDetail;
      const result = component.documentIcon(mockDocument);
      expect(result).toEqual('pdf');
    });
    it('should return "document"', () => {
      const mockDocument = { fileType: 'zip '} as IDocumentDetail;
      const result = component.documentIcon(mockDocument);
      expect(result).toEqual('document');
    });
  });

  describe('documenLoading', () => {
    it('should return false', (done) => {
      mockStore.overrideSelector(documentsSelectors.selectedLoadingDocuments, []);
      const mockDocument = { documentId: 'documentId' } as IDocumentDetail;
      component.documenLoading(mockDocument)
        .pipe(take(1))
        .subscribe((isLoading) => {
          expect(isLoading).toBeFalsy();
          done();
        });
    });
    it('should return true', (done) => {
      mockStore.overrideSelector(documentsSelectors.selectedLoadingDocuments, ['documentId']);
      const mockDocument = { documentId: 'documentId' } as IDocumentDetail;
      component.documenLoading(mockDocument)
        .pipe(take(1))
        .subscribe((isLoading) => {
          expect(isLoading).toBeTruthy();
          done();
        });
    });
  });

});
