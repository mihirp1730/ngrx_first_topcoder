import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DELFI_USER_CONTEXT } from '@apollo/app/delfi-gui-auth-config';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';
import { COMMON_FILE_MANAGER_URL, IFile, MediaDocumentUploaderService } from '@apollo/app/services/media-document-uploader';
import { NotificationService } from '@apollo/app/ui/notification';
import { SlbDropzoneComponent } from '@slb-dls/angular-material/dropzone';
import { BehaviorSubject, of } from 'rxjs';

import { MediaUploadPreviewComponent } from './media-upload-preview.component';

const mockMediaDocumentUploaderService = {
  upload: jest.fn(),
  resetFileQueue: jest.fn(),
  downloadMedia: jest.fn(),
  filesQueue$: new BehaviorSubject<Array<IFile>>({} as any)
};

const mockNotificationService = {
  send: jest.fn()
};
describe('MediaUploadPreviewComponent', () => {
  let component: MediaUploadPreviewComponent;
  let fixture: ComponentFixture<MediaUploadPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MediaUploadPreviewComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
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
        },
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
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaUploadPreviewComponent);
    component = fixture.componentInstance;
    component.componentIdentifier = 'open-info';
    fixture.detectChanges();
    const fileList = [
      {
        id: 'file-id',
        name: 'sample-media',
        fileType: 'image/jpg',
        componentIdentifier: 'open-info',
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
        name: 'sample-media-1',
        fileType: 'image/jpg',
        componentIdentifier: 'open-info',
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
    mockMediaDocumentUploaderService.filesQueue$.next(fileList);
  });

   afterEach(()=> {
    jest.clearAllMocks();
   });

  afterAll(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should upload file', () => {
    const fileList = [
      new File([new ArrayBuffer(1)], 'file.jpg'),
      new File([new ArrayBuffer(1)], 'file1.jpg'),
    ];
    const dropzoneComponent: SlbDropzoneComponent = new SlbDropzoneComponent();
    const dropzoneComponentspy = jest.spyOn(dropzoneComponent, 'clearAllFiles');
    component.onFileSelected(fileList, dropzoneComponent);
    expect(mockMediaDocumentUploaderService.upload).toHaveBeenCalled();
    expect(dropzoneComponentspy).toHaveBeenCalled();
  });

  it('should show error notification', () => {
    const fileList = [
      new File([new ArrayBuffer(1)], 'file%test.jpg'),
      new File([new ArrayBuffer(1)], 'file1_#_test.jpg'),
    ];
    const dropzoneComponent: SlbDropzoneComponent = new SlbDropzoneComponent();
    component.onFileSelected(fileList, dropzoneComponent);
    expect(mockNotificationService.send).toHaveBeenCalled();
  });

  it('should show file type error notification', () => {
    const fileList1 = [new File([new ArrayBuffer(1)], 'filetest1.odt'), new File([new ArrayBuffer(1)], 'file1test2.txt')];
    const dropzoneComponent: SlbDropzoneComponent = new SlbDropzoneComponent();
    component.onFileSelected(fileList1, dropzoneComponent);
    expect(mockNotificationService.send).toHaveBeenCalled();
    expect(mockMediaDocumentUploaderService.upload).not.toHaveBeenCalled();
  });

  it('should show file size error notification', () => {
    const file = new File([""], 'darthvader1.png');
    Object.defineProperty(file, 'size', { value: 1024*1024*20 })
    const fileList2 = [file];
    const dropzoneComponent: SlbDropzoneComponent = new SlbDropzoneComponent();
    component.onFileSelected(fileList2, dropzoneComponent);
    expect(mockNotificationService.send).toHaveBeenCalled();
    expect(mockMediaDocumentUploaderService.upload).not.toHaveBeenCalled();
  });
 
  it('should not show error notification', () => {
    const file = new File([""], 'darthvader2.png');
    Object.defineProperty(file, 'size', { value: 1024*1024*10 })
    const fileList3 = [file];
    const dropzoneComponent: SlbDropzoneComponent = new SlbDropzoneComponent();
    component.onFileSelected(fileList3, dropzoneComponent);
    expect(mockNotificationService.send).not.toHaveBeenCalled();
    expect(mockMediaDocumentUploaderService.upload).toHaveBeenCalled();
  });

  it('should process existing media', () => {
    component.existingMediaFileList = [
      {
        fileId: 'file-id',
        fileName: 'sample-media',
        fileType: 'image/jpg',
        caption: 'caption',
      }
    ];
    const change: any = {
      existingMediaFileList: {
        currentValue : {}
      }
    };
    mockMediaDocumentUploaderService.downloadMedia.mockReturnValue(of('signed-url'));
    component.ngOnChanges(change);

    expect(mockMediaDocumentUploaderService.downloadMedia).toHaveBeenCalled();
  });

  it('should not process existing media if existingMediaFileList is empty', () => {
    component.existingMediaFileList = [];
    component.processExistingMedia();
    const spyOnchanges = jest.spyOn(component, 'processExistingMedia').mockImplementation();
    expect(spyOnchanges).not.toHaveBeenCalled();
    expect(mockMediaDocumentUploaderService.downloadMedia).not.toHaveBeenCalled();
  });

  it('should not process existing media', () => {
    const change: any = {};
    const spy = jest.spyOn(component, 'processExistingMedia').mockImplementation();
    component.ngOnChanges(change);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should modify caption of the selected media item in mediaList', () => {
    component.files = [
      {
        id: 'test-id-1',
        name: 'test-media-name',
        fileType: 'jpeg',
        caption: 'caption'
      },
      {
        id: 'test-id-2',
        name: 'test-media-name',
        fileType: 'jpeg',
        caption: 'caption'
      }
    ];
    const eventData= {id: 'test-id-2', caption: 'modified-caption'};
    jest.spyOn(component, 'prepareMediaData');
  
    component.captionEdited(eventData);
    expect( component.files[1].caption).toBe('modified-caption');
    expect(component.prepareMediaData).toHaveBeenCalled();
  });

  it('should removes selected media from the mediaList', () => {
    const id = 'test-id-1';
    component.files = [
      {
        id: 'test-id-1',
        name: 'test-media-name',
        fileType: 'jpeg'
      },
      {
        id: 'test-id-2',
        name: 'test-media-name',
        fileType: 'jpeg'
      }
    ];
    jest.spyOn(component, 'prepareMediaData');
    component.removeMedia(id);
    expect(component.files.length).toBe(1);
    expect(component.prepareMediaData).toHaveBeenCalled();
  });

  it('should validate', () => {
    const error = component.validate();
    expect(error.mediaReqError).toBeTruthy();
  });
  it('should writeValue', () => {
    expect(component.writeValue()).toBeUndefined();
  })
  it('should registerOnTouched', () => {
    expect(component.registerOnTouched()).toBeUndefined();
  })
  it('should propagateChange', () => {
    expect(component['propagateChange']([1,2,3] as any)).toBeUndefined();
  })
  it('should registerOnChange', () => {
    expect(component.registerOnChange({})).toBeUndefined();
  })
});
