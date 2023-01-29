import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ApolloFormPatcherModule } from '@apollo/app/directives/form-patcher';
import { provideMockStore } from '@ngrx/store/testing';

import { AdditionalServicesComponent } from './additional-services.component';
import * as opportunitySelectors from '../../state/selectors/opportunity.selectors';

describe('AdditionalServicesComponent', () => {
  let component: AdditionalServicesComponent;
  let fixture: ComponentFixture<AdditionalServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdditionalServicesComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, NoopAnimationsModule, ApolloFormPatcherModule],
      providers: [
        provideMockStore({
          selectors: [
            {
              selector: opportunitySelectors.selectOpportunity,
              value: {
                vdrLink: 'test-value1',
                accountName: 'test-value2',
                departmentName: 'test-value3'
              }
            }
          ]
        })
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdditionalServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should trigger form valid change', (done) => {
    component.formIsValid.subscribe((value) => {
      expect(value).toBeTruthy();
      done();
    });
    component.additionalServicesDetails.patchValue({
      vdrLink: '',
      accountName: '',
      departmentName: ''
    });
  });

  it('should trigger form dirty check', (done) => {
    component.formIsValid.subscribe((value) => {
      expect(value).toBeTruthy();
      done();
    });
    component.additionalServicesDetails.patchValue({
      vdrLink: 'Test1',
      accountName: '',
      departmentName: ''
    });
  });
});
