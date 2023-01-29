import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileType } from '../interfaces';

import { FileProgressComponent } from './file-progress.component';

describe('FileProgressComponent', () => {
  let component: FileProgressComponent;
  let fixture: ComponentFixture<FileProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FileProgressComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileProgressComponent);
    component = fixture.componentInstance;
    component.file = {
      id: 'id',
      parentId: 'parent-id',
      associatedId: null,
      group: 'group',
      name: 'test.zip',
      progress: {
        errorMessage: null,
        percentage: 10,
        started: false,
        canceled: false,
        completed: false,
        associated: false
      },
      type: FileType.Shape,
      file: null
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the cancel action', () => {
    const spy = jest.spyOn(component.cancelUpload, 'emit').mockImplementation();
    component.onCancelUpload();
    expect(spy).toHaveBeenCalledWith({fileId: 'id', associatedId: null, group: 'group', type: FileType.Shape});
  });
});
