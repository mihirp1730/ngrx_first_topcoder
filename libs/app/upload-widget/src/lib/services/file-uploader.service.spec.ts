/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { DELFI_USER_CONTEXT } from '@apollo/app/delfi-gui-auth-config';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';
import { NotificationService } from '@apollo/app/ui/notification';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { combineLatest, of } from 'rxjs';

import { FileUploaderService, FILE_UPLOAD_CONFIGURATION } from './file-uploader.service';
import { FileType } from '../interfaces';

jest.mock('@azure/storage-blob', () => {
  return {
    BlockBlobClient: jest.fn().mockImplementation(() => {
      return {
        uploadData: () => Promise.resolve()
      };
    }),
    AnonymousCredential : jest.fn().mockImplementation(),
    newPipeline :jest.fn().mockImplementation()
  };
});

jest.mock('mime', () => {
  return {
    define: jest.fn(),
    getType: jest.fn().mockImplementation(() => {
      return 'application/zip'
    })
  };
});

const mockNotificationService = {
  send: jest.fn()
};

describe('FileUploaderService', () => {
  let service: FileUploaderService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        FileUploaderService,
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
          provide: FILE_UPLOAD_CONFIGURATION,
          useValue: {
            fileManager: {
              common: 'common-api',
              osdu: 'osdu-api'
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
          provide: NotificationService,
          useValue: mockNotificationService
        }
      ]
    });

    service = TestBed.inject(FileUploaderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('upload get file id', () => {
    it('should return the file id and add the file to the queue', (done) => {
      const mockFile = {
        name: 'shape.zip',
        type: 'zip'
      } as File;

      service.upload('parent-id', 'group', mockFile, FileType.Shape).subscribe((fileId) => {
        expect(fileId).toEqual('file-id');
        done();
      });

      httpMock.expectOne('common-api').flush({ fileId: 'file-id' });
    });

    it('should return the file id and add the file to the queue with empty file type', (done) => {
      const mockFile = {
        name: 'shape.zipx',
        type: ''
      } as File;

      service.upload('parent-id', 'group', mockFile, FileType.Deliverable).subscribe((fileId) => {
        expect(fileId).toEqual('file-id');
        done();
      });

      httpMock.expectOne('osdu-api').flush({ fileId: 'file-id' });
    });

    it('should return null and throw an error', (done) => {
      const mockFile = {
        name: 'shape.zip',
        type: 'zip'
      } as File;

      service.upload('parent-id', 'group', mockFile, FileType.Shape).subscribe((fileId) => {
        expect(mockNotificationService.send).toHaveBeenCalled();
        expect(fileId).toEqual(null);
        done();
      });

      httpMock.expectOne('common-api').flush({}, { status: 400, statusText: 'Error' });
    });
  });

  it('should return the file from the queue', (done) => {
    const mockFile = {
      name: 'shape.zip',
      type: 'zip'
    } as File;

    combineLatest([service.upload('parent-id', 'group', mockFile, FileType.Shape), service.getFile('test-id')]).subscribe(([_, file]) => {
      expect(file.parentId).toEqual('parent-id');
      done();
    });

    httpMock.expectOne('common-api').flush({ fileId: 'test-id' });
  });

  it('should return the files from the queue', (done) => {
    const mockFile = {
      name: 'shape.zip',
      type: 'zip'
    } as File;

    combineLatest([service.upload('parent-id', 'group', mockFile, FileType.Shape), service.getFiles(['test-id'])]).subscribe(([_, files]) => {
      expect(files[0].parentId).toEqual('parent-id');
      done();
    });

    httpMock.expectOne('common-api').flush({ fileId: 'test-id' });

    httpMock.verify();
  });

  it('should return the files from the queue with a parent id', (done) => {
    const mockFile = {
      name: 'shape.zip',
      type: 'zip'
    } as File;

    combineLatest([
      service.upload('parent-id', 'group', mockFile, FileType.Shape),
      service.upload('parent-id', 'group', { ...mockFile, name: 'deliverable.zip' }, FileType.Deliverable),
      service.getFilesByParentId('parent-id')
    ]).subscribe(([_, __, files]) => {
      expect(files.length).toEqual(2);
      done();
    });

    httpMock.expectOne('common-api').flush({ fileId: 'test-id-shape' });
    httpMock.expectOne('osdu-api').flush({ fileId: 'test-id-osdu' });
  });

  describe('process upload', () => {
    it('should start the process', () => {
      const mockFile = {
        id: 'test-id',
        parentId: 'parent-id',
        associatedId: null,
        name: 'shape.zip',
        progress: {
          percentage: 0,
          started: false,
          canceled: false,
          completed: false,
          associated: false
        },
        type: FileType.Shape,
        file: null
      };
      (service as any).updateFiles([mockFile]);
      (service as any).startUploadProcess(mockFile);
      const completeSpy = jest.spyOn(service, 'updateProgress');

      httpMock.expectOne('common-api/test-id/upload').flush({ signedURL: 'signed-url' });
      httpMock.expectOne('signed-url').flush({ type: 'None' });
      httpMock.expectOne('common-api/test-id/complete').flush({});

      expect(completeSpy).toHaveBeenCalled();
    });

    it('should start the process (deliverable)', fakeAsync(() => {
      const mockFile = {
        id: 'test-id',
        parentId: 'parent-id',
        associatedId: null,
        name: 'deliverable.zip',
        progress: {
          percentage: 0,
          started: false,
          canceled: false,
          completed: false,
          associated: false
        },
        type: FileType.Deliverable,
        file: {
          type: 'zip'
        }
      };
      (service as any).updateFiles([mockFile]);
      (service as any).startUploadProcess(mockFile);
      const completeSpy = jest.spyOn(service, 'updateProgress');

      httpMock
        .expectOne('osdu-api/test-id/upload')
        .flush({ signedURL: 'http://account.osdu.link/container/name/file-name?sasToken=token' });
      tick();
      httpMock.expectOne('osdu-api/test-id/complete').flush({});

      expect(completeSpy).toHaveBeenCalled();
    }));
  });

  describe('cancel upload', () => {
    const mockCallback = jest.fn();
    
    it('should cancel the upload', () => {
      const updateSpy = jest.spyOn(service, 'updateProgress').mockImplementation();
      (service as any).filesSubscriptions = [{ id: 'test-id', subscription: of('').subscribe() }];

      service.cancelUpload('test-id', mockCallback );
      expect(updateSpy).toHaveBeenCalled();
      expect((service as any).filesSubscriptions.length).toEqual(0);
    });

    it('should call callback when no files on soft delete', () => {
      const updateSpy = jest.spyOn(service, 'updateProgress').mockImplementation();
      (service as any).filesSubscriptions = [];

      service.cancelUpload('test-id', mockCallback );
      expect(updateSpy).not.toHaveBeenCalled();
      expect((service as any).filesSubscriptions.length).toEqual(0);

      expect(mockCallback).toHaveBeenCalled();
    });
  });

  it('should call updateAssociatedId', () => {
    (service as any).updateFiles([{
      ...(service as any)._filesQueue,
      id: 'fileId',
      parentId: 'parentId',
      associatedId: null,
      group: '',
      name: 'fileName',
      progress: {
        errorMessage: null,
        percentage: 0,
        started: false,
        canceled: false,
        completed: false,
        associated: false
      },
      type: 'Shape',
      file: {} as File
    }]);

    const fileId = 'fileId';
    const associatedId = 'MR-Id'
    jest.spyOn((service as any), 'updateFiles').mockImplementation();
    service.updateAssociatedId(fileId, associatedId);
    expect((service as any).updateFiles).toHaveBeenCalled();
  });
});
