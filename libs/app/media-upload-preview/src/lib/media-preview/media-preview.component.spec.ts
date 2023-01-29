import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MediaPreviewComponent } from './media-preview.component';

class MockFileReaderFactory {
  readAsDataURL = () => null;
  onload = () => jest.fn();
}

describe('MediaPreviewComponent', () => {
  let component: MediaPreviewComponent;
  let fixture: ComponentFixture<MediaPreviewComponent>;
  let mockFileReaderFactory: MockFileReaderFactory;

  beforeEach(async () => {
    mockFileReaderFactory = new MockFileReaderFactory();

    TestBed.overrideComponent(MediaPreviewComponent,
      {
        set: {
          providers: [{
            provide: 'FileReaderFactory',
            useValue: () => mockFileReaderFactory
          }]
        }
      }
    );

    await TestBed.configureTestingModule({
      declarations: [ MediaPreviewComponent ],
      imports: [ NoopAnimationsModule, ReactiveFormsModule, FormsModule ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        {
          provide: DomSanitizer,
          useValue: {
            sanitize: jest.fn(),
            bypassSecurityTrustUrl: jest.fn().mockReturnValue('media-source')
          }
        }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaPreviewComponent);
    component = fixture.componentInstance;
    component.mediaTextForm = new FormGroup({
      mediaCaption: new FormControl('test')
    });
    fixture.detectChanges();


  });

  afterEach(()=> {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should generateControls', fakeAsync(() => {
    const captionEditEmit = jest.spyOn(component.captionEdit, 'emit');
    component.file = {
      id: 'file-id',
      name: 'sample-media',
      fileType: 'image/jpg',
      progress: {
        errorMessage: null,
        percentage: 0,
        started: false,
        canceled: false,
        completed: false,
        associated: false
      },
      file: { } as any
    };
    component.generateControls();
    component.mediaTextForm.patchValue({
      mediaCaption: 'Test 1'
    });

    tick(2500);

    component.mediaTextForm.patchValue({
      mediaCaption: 'Test 2'
    });
    fixture.detectChanges();

    expect(captionEditEmit).toHaveBeenCalled();
    discardPeriodicTasks();
  }));

  it('should set input and call ngOnChanges', () => {
    component.file = {
      id: 'file-id',
      name: 'sample-media',
      fileType: 'image/jpg',
      progress: {
        errorMessage: null,
        percentage: 0,
        started: false,
        canceled: false,
        completed: false,
        associated: false
      },
      file: { } as any
    };
    const change: any = {
      file: {
        currentValue : {
        }
      }
    };
    component.ngOnChanges(change);
    mockFileReaderFactory.onload();
    expect(component.altText).toEqual(component.file.name);
  });

  it('should call neither userPreview nor generatePreview', () => {
    component.file = {
      id: 'file-id1',
      name: 'sample-media',
      fileType: 'image/jpg',
      progress: {
        errorMessage: null,
        percentage: 0,
        started: false,
        canceled: false,
        completed: false,
        associated: false
      },
      file: {
        currentValue : {
          signedUrl: ''
        }
      } as any
    };
    const change: any = {
      file: {}
    }
    const spyUsePreview = jest.spyOn(component, 'usePreview').mockImplementation();
    const spyGeneratePreview = jest.spyOn(component, 'generatePreview').mockImplementation();
    component.ngOnChanges(change);
    expect(spyUsePreview).not.toHaveBeenCalled();
    expect(spyGeneratePreview).not.toHaveBeenCalled();
  });

  it('should call userPreview but not call generatePreview', () => {
    component.file = {
      id: 'file-id1',
      name: 'sample-media',
      fileType: 'image/jpg',
      progress: {
        errorMessage: null,
        percentage: 0,
        started: false,
        canceled: false,
        completed: false,
        associated: false
      },
      file: {
        currentValue : {
          signedUrl: ''
        }
      } as any
    };
    const change: any = {
      file: {
        currentValue : {
          signedUrl: 'signed-url'
        }
      }
    }
    const spyUsePreview = jest.spyOn(component, 'usePreview').mockImplementation();
    const spyGeneratePreview = jest.spyOn(component, 'generatePreview').mockImplementation();
    component.ngOnChanges(change);
    expect(spyUsePreview).toHaveBeenCalled();
    expect(spyGeneratePreview).not.toHaveBeenCalled();
  });

  it('should not call userPreview but call generatePreview', () => {
    component.file = {
      id: 'file-id1',
      name: 'sample-media',
      fileType: 'image/jpg',
      progress: {
        errorMessage: null,
        percentage: 0,
        started: false,
        canceled: false,
        completed: false,
        associated: false
      },
      file: {
        currentValue : {
          signedUrl: ''
        }
      } as any
    };
    const change: any = {
      file: {
        currentValue : {}
      }
    }
    const spyUsePreview = jest.spyOn(component, 'usePreview').mockImplementation();
    const spyGeneratePreview = jest.spyOn(component, 'generatePreview').mockImplementation();
    component.ngOnChanges(change);
    expect(spyUsePreview).not.toHaveBeenCalled();
    expect(spyGeneratePreview).toHaveBeenCalled();
  });
  it('should set source of the image', () => {
    component.file = {
      id: 'file-id',
      name: 'sample-media',
      fileType: 'image/jpg',
      signedUrl: 'signed-url'
    };
    const change: any = {
      file: {
        currentValue : {
          signedUrl: 'signed-url'
        }
      }
    };
    component.ngOnChanges(change);
    expect(component.source).toEqual(component.file.signedUrl);
  });

  it('should emit removeMedia event', () => {
    const spyEmit = jest.spyOn(component.removeMedia, 'emit');
    component.removeMediaEmit('file-id');
    expect(spyEmit).toHaveBeenCalled();
  });
});
