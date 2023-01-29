import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { WindowRef, DocumentRef } from '@apollo/app/ref';
import { noop } from 'lodash';
import { of } from 'rxjs';

import { DISCOVERY_API_URL, DocumentsService } from './documents.service';

class MockWindowRef {
  nativeWindow = {
    open: noop
  }
};

const mockDocumentRef = {
  nativeDocument: {
    createElement: jest.fn(),
    body: {
      appendChild: jest.fn()
    }
  }
};

describe('DocumentsService', () => {
  let mockHttpClient: HttpTestingController;
  let service: DocumentsService;
  let mockDebounceExecute: boolean;
  let mockWindowRef: MockWindowRef;

  beforeEach(() => {
    mockDebounceExecute = true;
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: DISCOVERY_API_URL,
          useValue: 'DISCOVERY_API_URL'
        },
        {
          provide: WindowRef,
          useClass: MockWindowRef
        },
        {
          provide: DocumentRef,
          useValue: mockDocumentRef
        },
        DocumentsService
      ]
    });
    mockHttpClient = TestBed.inject(HttpTestingController);
    service = TestBed.inject(DocumentsService);
    mockWindowRef = TestBed.inject(WindowRef as any);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getDocumentsDetail', () => {
    it('should call the get documents details', (done) => {
      const recordId =
        'sandbox-weu-des-prod-testing-e:master-data--Wellbore:wks-017978ba01dcd1a4a4bda9725aa165af83c50d69.osdu.wks.master-data--Wellbore.1';
      const mockResponse = { result: { documents: [{} as any] } };
      (service as any).getDocumentsDetail(recordId).subscribe((response: string) => {
        expect(response).toEqual(mockResponse.result.documents);
        done();
      });
      mockHttpClient.expectOne(`DISCOVERY_API_URL/summary-detail-view/${recordId}`).flush(mockResponse);
    });

    it('should getDocumentsDetailWithFileType', (done) => {
      const recordId =
        'sandbox-weu-des-prod-testing-e:master-data--Wellbore:wks-017978ba01dcd1a4a4bda9725aa165af83c50d69.osdu.wks.master-data--Wellbore.1';
      const mockResponse = [ {fileType: 'pdf', name: 'testName', documentId: 'documentId' } ];
      const spy = jest.spyOn((service as any), 'getDocumentsDetail').mockReturnValue(of(mockResponse));
      service.getDocumentsDetailWithFileType(recordId).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        done();
      });
      expect(spy).toHaveBeenCalled();
    })
  });

  describe('getDocumentSignedUrl', () => {
    it('should call the get signed url endpoint', (done) => {
      const recordId =
        'sandbox-weu-des-prod-testing-e:master-data--Wellbore:wks-017978ba01dcd1a4a4bda9725aa165af83c50d69.osdu.wks.master-data--Wellbore.1';
      const documentId = 'sandbox-weu-des-prod-testing-e:document:bd5293cdcdcb4533948e4f572043230d';
      const mockResponse = { signedUrl: 'signedURL' };
      (service as any).getDocumentSignedUrl(documentId, recordId).subscribe((response: string) => {
        expect(response).toEqual({ signedUrl: 'signedURL' });
        done();
      });
      mockHttpClient.expectOne(`DISCOVERY_API_URL/document-signed-url/${documentId}`).flush(mockResponse);
    });
  });

  it('should open URL', () => {
    const spy = jest.spyOn(mockWindowRef.nativeWindow, 'open').mockImplementation();
    service.openDocumentUrl('https://www.google.com/');
    expect(spy).toHaveBeenCalled();
  });

  it('should download document', () => {
    const mockElement = {
      setAttribute: jest.fn()
    };
    const spy = jest.spyOn(mockDocumentRef.nativeDocument, 'createElement').mockReturnValue(mockElement as any);
    service.downloadDocument('https://www.google.com/');
    expect(spy).toHaveBeenCalled();
    expect(mockDocumentRef.nativeDocument.body.appendChild).toHaveBeenCalled();
  });
});
