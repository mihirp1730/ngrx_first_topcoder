import { TestBed } from '@angular/core/testing';

import { DocumentRef } from './document-ref.service';

describe('DocumentRef', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DocumentRef]
    });
  });

  it('should be created', () => {
    const service: DocumentRef = TestBed.get(DocumentRef);
    expect(service).toBeTruthy();
  });

  it('should return a document', () => {
    const service: DocumentRef = TestBed.get(DocumentRef);
    expect(service.nativeDocument).toBeTruthy();
  });
});
