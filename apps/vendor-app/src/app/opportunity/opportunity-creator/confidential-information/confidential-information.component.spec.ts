import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ApolloFormPatcherModule } from '@apollo/app/directives/form-patcher';
import { IMediaFile } from '@apollo/app/media-upload-preview';
import { provideMockStore } from '@ngrx/store/testing';

import * as opportunitySelectors from '../../state/selectors/opportunity.selectors';
import { ConfidentialInformationComponent } from './confidential-information.component';

describe('ConfidentialInformationComponent', () => {
  let component: ConfidentialInformationComponent;
  let fixture: ComponentFixture<ConfidentialInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfidentialInformationComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, ApolloFormPatcherModule],
      providers: [
        provideMockStore({
          selectors: [
            {
              selector: opportunitySelectors.selectOpportunity,
              value: {
                opportunityId: '123',
                confidentialOpportunityProfile: {
                  overview: 'test',
                  documents: []
                }
              }
            },
            {
              selector: opportunitySelectors.selectCreationDetails,
              value: {
                opportunityId: '123',
                confidentialProfile: {
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
    fixture = TestBed.createComponent(ConfidentialInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should trigger value change opportunity confidential profile ', () => {
    const newValue = 'test';
    component.isConfidentialInformationDirty.subscribe((value) => {
      expect(value).toBe(true);
    });
    component.confidentialInformationDetails.patchValue({
      overview: newValue
    });
  });

  it('should trigger dirty check opportunity confidential profile ', () => {
    const newValue = 'test';
    component.confidentialInformationChanged.subscribe((value) => {
      expect(value).toBe(newValue);
    });
    component.confidentialInformationDetails.patchValue({
      overview: newValue
    });
  });

  it('should trigger value form valid', () => {
    component.formIsValid.subscribe((value) => {
      expect(value).toBeTruthy();
    });
    component.confidentialInformationDetails.patchValue({
      overview: 'test'
    });
  });

  it('should trigger value for confidential documents', () => {
    const documentFileValues = [
      {
        fileId: 'xi-test-hjkhdfhiojihr345'
      }
    ];
    component.uploadDocFileIds(documentFileValues as any);
    expect(component.confidentialInformationDetails.controls.documents.value).toBe(documentFileValues);
  });

  it('should trigger value for confidential information documents', () => {
    const mediaFileValues: IMediaFile[] = [
      {
        fileId: 'f-xtr45-75675',
        fileName: 'image1.png',
        fileType: 'image',
        caption: 'caption'
      }
    ];
    component.uploadedMediaFileIds(mediaFileValues);
    expect(component.confidentialInformationDetails.controls.media.value).toBe(mediaFileValues);
  });
});
