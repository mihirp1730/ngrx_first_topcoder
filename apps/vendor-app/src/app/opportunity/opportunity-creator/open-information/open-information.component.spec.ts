import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApolloFormPatcherModule } from '@apollo/app/directives/form-patcher';
import { IDocFile } from '@apollo/app/document-upload';
import { IMediaFile } from '@apollo/app/media-upload-preview';
import { provideMockStore } from '@ngrx/store/testing';

import * as opportunitySelectors from '../../state/selectors/opportunity.selectors';
import { OpenInformationComponent } from './open-information.component';

describe('OpenInformationComponent', () => {
  let component: OpenInformationComponent;
  let fixture: ComponentFixture<OpenInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OpenInformationComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [FormsModule, ReactiveFormsModule, ApolloFormPatcherModule],
      providers: [
        provideMockStore({
          selectors: [
            {
              selector: opportunitySelectors.selectOpportunity,
              value: {
                opportunityId: '123',
                opportunityProfile: {
                  overview: 'test',
                  media: [],
                  documents: []
                }
              }
            },
            {
              selector: opportunitySelectors.selectCreationDetails,
              value: {
                opportunityId: '123',
                profile: {
                  overview: 'test',
                  media: [],
                  documents: []
                }
              }
            }
          ]
        })
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should trigger value change opportunity Name', () => {
    component.formIsValid.subscribe((value) => {
      expect(value).toBeTruthy();
    });
    component.openInformationDetails.patchValue({
      overview: '<p>test</p>'
    });
  });

  it('should trigger equality check on change overview', (done) => {
    component.isOpenInfoDirty.subscribe((value) => {
      expect(value).toBeFalsy();
      done();
    });
    component.openInformationDetails.patchValue({
      overview: '<p>test</p>'
    });
  });

  it('should trigger openinformation changed', () => {
    const newValue = 'Test 1';
    component.openInformationChanged.subscribe((value) => {
      expect(value).toBe(newValue);
    });
    component.openInformationDetails.patchValue({
      overview: newValue
    });
  });

  it('should trigger value for open information documents', () => {
    const mediaFileValues: IMediaFile[] = [
      {
        fileId: 'f-xtr45-75675',
        fileName: 'image1.png',
        fileType: 'image',
        caption: 'caption'
      }
    ];
    component.uploadedMediaFileIds(mediaFileValues);
    expect(component.openInformationDetails.controls.media.value).toBe(mediaFileValues);
  });

  it('should trigger value for open information documents', () => {
    const documentFileValues: IDocFile[] = [
      {
        fileId: 'f-xtr45-75676',
        fileName: 'report.pdf',
        fileType: 'pdf',
        caption: 'caption'
      }
    ];
    component.uploadDocFileIds(documentFileValues);
    expect(component.openInformationDetails.controls.documents.value).toBe(documentFileValues);
  });
});
