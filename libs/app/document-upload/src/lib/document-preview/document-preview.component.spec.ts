import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { DocumentPreviewComponent } from './document-preview.component';

describe('DocumentPreviewComponent', () => {
  let component: DocumentPreviewComponent;
  let fixture: ComponentFixture<DocumentPreviewComponent>;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      declarations: [ DocumentPreviewComponent ],
      imports: [ NoopAnimationsModule, ReactiveFormsModule, FormsModule ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentPreviewComponent);
    component = fixture.componentInstance;
    component.docTextForm = new FormGroup({
      docCaption: new FormControl('test')
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
      name: 'sample-doc',
      fileType: 'pdf',
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
    component.docTextForm.patchValue({
      docCaption: 'Test 1'
    });

    tick(2500);

    component.docTextForm.patchValue({
      docCaption: 'Test 2'
    });
    fixture.detectChanges();

    expect(captionEditEmit).toHaveBeenCalled();
    discardPeriodicTasks();
  }));

  it('should set input and call ngOnChanges', () => {
    component.file = {
      id: 'file-id',
      name: 'sample-doc',
      fileType: 'pdf',
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
  });

  it('should set source of the document', () => {
    component.file = {
      id: 'file-id',
      name: 'sample-doc',
      fileType: 'pdf',
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
  });

  it('should set filetype', () => {
    component.file = {
      id: 'file-id',
      name: 'sample-doc',
      fileType: 'pdf',
      signedUrl: 'signed-url'
    };
    let fileType = 'test/plain';
    component.updateFileType(fileType);
    expect(component.file.fileType).toBe('txt');

    fileType = 'test/zip';
    component.updateFileType(fileType);
    expect(component.file.fileType).toBe('apollo:zip');

    fileType = 'test/document';
    component.updateFileType(fileType);
    expect(component.file.fileType).toBe('doc');

    fileType = 'test/pdf';
    component.updateFileType(fileType);
    expect(component.file.fileType).toBe('pdf');
});

  it('should emit removeDocument event', () => {
    const spyEmit = jest.spyOn(component.removeDocument, 'emit');
    component.removeDocEmit('file-id');
    expect(spyEmit).toHaveBeenCalled();
  });
});
