import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { DELFI_USER_CONTEXT } from '@apollo/app/delfi-gui-auth-config';
/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { SecureEnvironmentService } from '@apollo/app/secure-environment';

import { IS_BILLING_ACCOUNT_ID_REQUIRED, COMMON_FILE_MANAGER_URL, MediaDocumentUploaderService } from './media-document-uploader.service';

describe('MediaDocumentUploaderService', () => {
  let service: MediaDocumentUploaderService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: SecureEnvironmentService,
          useValue: {
            secureEnvironment: {
              app: {
                key: 'app-key'
              }
            }
          }
        },
        {
          provide: DELFI_USER_CONTEXT,
          useValue: {
            crmAccountId: 'test-account-id'
          }
        },
        {
          provide: COMMON_FILE_MANAGER_URL,
          useValue: 'http://test'
        },
        {
          provide: IS_BILLING_ACCOUNT_ID_REQUIRED,
          useValue: false
        }
      ]
    });
    service = TestBed.inject(MediaDocumentUploaderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should trigger interval', fakeAsync(() => {
    const mockFile = {
      id: 'test-id',
      name: 'media.png',
      progress: {
        percentage: 0,
        started: false,
        canceled: false,
        completed: false,
        associated: false
      },
      file: null
    };
    (service as any).updateFiles([mockFile]);
    (service as any).startUploadProcess(mockFile);
    const completeSpy = jest.spyOn(service, 'updateProgress');

    service.startUploadOnInterval();

    tick(6000);

    httpMock.match('http://test/test-id/upload')[0].flush({ signedURL: 'signed-url' });
    httpMock.expectOne('signed-url').flush({ type: 'None' });
    httpMock.expectOne('http://test/test-id/complete').flush({});

    expect(completeSpy).toHaveBeenCalled();

    discardPeriodicTasks();
  }));

  describe('get uploded file id', () => {
    it('should return the file id and add the file to the queue', (done) => {
      const mockFile = {
        name: 'test.jpg',
        type: 'jpeg'
      } as File;

      service.upload(mockFile);

      httpMock.expectOne('http://test').flush({ fileId: 'file-id' });
      done();
    });
    it('should return null and throw an error', (done) => {
      const mockFile = {
        name: 'media.png',
        type: 'png'
      } as File;

      service.upload(mockFile);

      httpMock.expectOne('http://test').flush({}, { status: 400, statusText: 'Error' });
      done();
    });

    it('should get file type if no type is provided', (done) => {
      const mockFile = {
        name: 'media.png',
        type: ''
      } as File;

      service.upload(mockFile);

      httpMock.expectOne('http://test').flush({ fileId: 'file-id' });
      done();
    });
  });

  describe('process upload', () => {
    it('should start the process', () => {
      const mockFile = {
        id: 'test-id',
        name: 'media.png',
        progress: {
          percentage: 0,
          started: false,
          canceled: false,
          completed: false,
          associated: false
        },
        file: null
      };
      (service as any).updateFiles([mockFile]);
      (service as any).startUploadProcess(mockFile);
      const completeSpy = jest.spyOn(service, 'updateProgress');

      httpMock.expectOne('http://test/test-id/upload').flush({ signedURL: 'signed-url' });
      httpMock.expectOne('signed-url').flush({ type: 'None' });
      httpMock.expectOne('http://test/test-id/complete').flush({});

      expect(completeSpy).toHaveBeenCalled();
    });
    it('should start the process with UploadProgress event', (done) => {
      const mockFile = {
        id: 'test-id',
        name: 'media.png',
        progress: {
          percentage: 0,
          started: false,
          canceled: false,
          completed: false,
          associated: false
        },
        file: null
      };
      (service as any).updateFiles([mockFile]);
      (service as any).startUploadProcess(mockFile);
      const completeSpy = jest.spyOn(service, 'updateProgress');
      const mockProgressEvent = { type: 1 };

      httpMock.expectOne('http://test/test-id/upload').flush({ signedURL: 'signed-url' });
      httpMock.expectOne('signed-url').event(mockProgressEvent);
      done();

      expect(completeSpy).toHaveBeenCalled();
    });

    it('should start the process with error event', (done) => {
      const mockFile = {
        id: 'test-id',
        name: 'media.png',
        progress: {
          percentage: 0,
          started: false,
          canceled: false,
          completed: false,
          associated: false
        },
        file: null
      };
      (service as any).updateFiles([mockFile]);
      (service as any).startUploadProcess(mockFile);
      const completeSpy = jest.spyOn(service, 'updateProgress');
      const mockProgressEvent = { type: 'Error' };

      httpMock.expectOne('http://test/test-id/upload').flush({ signedURL: 'signed-url' });
      httpMock.expectOne('signed-url').event(mockProgressEvent as any);
      done();

      expect(completeSpy).toHaveBeenCalled();
    });

    it('should start the process with error message', (done) => {
      const mockFile = {
        id: 'test-id',
        name: 'media.png',
        progress: {
          percentage: 0,
          started: false,
          canceled: false,
          completed: false,
          associated: false
        },
        file: null
      };
      (service as any).updateFiles([mockFile]);
      (service as any).startUploadProcess(mockFile);
      const completeSpy = jest.spyOn(service, 'updateProgress');
      const mockProgressEvent = { type: 'Error' };

      httpMock.expectOne('http://test/test-id/upload').flush({}, { status: 400, statusText: 'Error' });
      done();

      expect(completeSpy).toHaveBeenCalled();
    });
  });

  describe('reset file queue', () => {
    it('should reset file queue', (done) => {
      service.resetFileQueue();
      service.filesQueue$.subscribe((value) => {
        expect(value).toEqual([]);
        done();
      });
    });
  });

});
