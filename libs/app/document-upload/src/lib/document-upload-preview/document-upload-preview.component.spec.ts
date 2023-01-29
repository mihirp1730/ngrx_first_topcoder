import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DELFI_USER_CONTEXT } from '@apollo/app/delfi-gui-auth-config';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';
import { COMMON_FILE_MANAGER_URL, IFile, MediaDocumentUploaderService } from '@apollo/app/services/media-document-uploader';
import { NotificationService } from '@apollo/app/ui/notification';
import { SlbDropzoneComponent } from '@slb-dls/angular-material/dropzone';
import { BehaviorSubject, of } from 'rxjs';

import { DocumentUploadPreviewComponent } from './document-upload-preview.component';

const mockMediaDocumentUploaderService = {
  upload: jest.fn(),
  resetFileQueue: jest.fn(),
  downloadMedia: jest.fn().mockReturnValue(of('test-url')),
  filesQueue$: new BehaviorSubject<Array<IFile>>({} as any)
};

const mockNotificationService = {
  send: jest.fn()
};

describe('DocumentUploadPreviewComponent', () => {
  let component: DocumentUploadPreviewComponent;
  let fixture: ComponentFixture<DocumentUploadPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DocumentUploadPreviewComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
          provide: MediaDocumentUploaderService,
          useValue: mockMediaDocumentUploaderService
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService
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
        }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentUploadPreviewComponent);
    component = fixture.componentInstance;
    component.componentIdentifier = 'open-info';
    fixture.detectChanges();
    const fileList = [
      {
        id: 'file-id',
        name: 'sample-doc',
        fileType: 'pdf',
        componentIdentifier:'open-info',
        progress: {
          errorMessage: null,
          percentage: 0,
          started: false,
          canceled: false,
          completed: false,
          associated: false
        },
        file: {} as any
      },
      {
        id: 'file-id-1',
        name: 'sample-doc-1',
        fileType: 'pdf',
        componentIdentifier:'open-info',
        progress: {
          errorMessage: null,
          percentage: 0,
          started: false,
          canceled: false,
          completed: true,
          associated: false
        },
        file: {} as any
      }
    ];
    component.files = fileList;
    mockMediaDocumentUploaderService.filesQueue$.next(fileList);
  });

  afterEach(()=> {
    jest.clearAllMocks();
   });

  afterAll(() => {
    fixture.destroy();
  });

  it('should modify caption of the selected document item in documentList', () => {
    component.files = [
      {
        id: 'test-id-1',
        name: 'test-doc-name',
        fileType: 'pdf',
        caption: 'caption',
      },
      {
        id: 'test-id-2',
        name: 'test-doc-name',
        fileType: 'pdf',
        caption: 'caption'
      }
    ];
    const eventData= {id: 'test-id-2', caption: 'modified-caption'};
    jest.spyOn(component, 'prepareDocData');

    component.captionEdited(eventData);
    expect( component.files[1].caption).toBe('modified-caption');
    expect(component.prepareDocData).toHaveBeenCalled();
  });

  it('should removes selected document from the docList', () => {
    const id = 'test-id-1';
    component.files = [
      {
        id: 'test-id-1',
        name: 'test-doc-name',
        fileType: 'pdf'
      },
      {
        id: 'test-id-2',
        name: 'test-doc-name',
        fileType: 'pdf'
      }
    ];
    jest.spyOn(component, 'prepareDocData');
    component.removeDocument(id);
    expect(component.files.length).toBe(1);
    expect(component.prepareDocData).toHaveBeenCalled();
  });

  it('should process existing document', () => {
    component.existingDocFileList = [
      {
        fileId: 'file-id',
        fileName: 'sample-doc',
        fileType: 'doc',
        caption: 'caption',
      }
    ];
    component.processExistingDoc();
    expect(component.files[0].signedUrl).toBe('test-url');
  });

    it('should not process existing document', () => {
    const change: any = {};
    const spy = jest.spyOn(component, 'processExistingDoc').mockImplementation();
    component.ngOnChanges(change);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show file type error notification', () => {
    const fileList1 = [new File([new ArrayBuffer(1)], 'filetest1.odt'), new File([new ArrayBuffer(1)], 'file1test2.jpg')];
    const dropzoneComponent: SlbDropzoneComponent = new SlbDropzoneComponent();
    component.onFileSelected(fileList1, dropzoneComponent);
    expect(mockNotificationService.send).toHaveBeenCalled();
    expect(mockMediaDocumentUploaderService.upload).not.toHaveBeenCalled();
  });

  it('should show file name error notification', () => {
    const fileList1 = [new File([new ArrayBuffer(1)], '@#$.pdf')];
    const dropzoneComponent: SlbDropzoneComponent = new SlbDropzoneComponent();
    component.onFileSelected(fileList1, dropzoneComponent);
    expect(mockNotificationService.send).toHaveBeenCalled();
    expect(mockMediaDocumentUploaderService.upload).not.toHaveBeenCalled();
  });

  it('should upload file', () => {
    const fileList = [
      new File([new ArrayBuffer(1)], 'file.pdf'),
      new File([new ArrayBuffer(1)], 'file1.pdf'),
    ];
    const dropzoneComponent: SlbDropzoneComponent = new SlbDropzoneComponent();
    const dropzoneComponentspy = jest.spyOn(dropzoneComponent, 'clearAllFiles');
    component.onFileSelected(fileList, dropzoneComponent);
    expect(mockMediaDocumentUploaderService.upload).toHaveBeenCalled();
    expect(dropzoneComponentspy).toHaveBeenCalled();
  });
  it('should validate', () => {
    component.files = [];
    const error = component.validate();
    expect(error.mediaReqError).toBeTruthy();
  });
  it('should writeValue', () => {
    expect(component.writeValue()).toBeUndefined();
  });
  it('should registerOnTouched', () => {
    expect(component.registerOnTouched()).toBeUndefined();
  });
  it('should propagateChange', () => {
    expect(component['propagateChange']([1,2,3] as any)).toBeUndefined();
  });
  it('should registerOnChange', () => {
    expect(component.registerOnChange({})).toBeUndefined();
  });
});
