import * as opportunitySelectors from '../../state/selectors/opportunity.selectors';

import { ActivatedRoute, Router } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { mockMatDialogModal, mockRouter } from '../../../shared/services.mock';

import { CreateOpportunityModalComponent } from './create-opportunity-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { provideMockStore } from '@ngrx/store/testing';

describe('CreateOpportunityModalComponent', () => {
  let component: CreateOpportunityModalComponent;
  let fixture: ComponentFixture<CreateOpportunityModalComponent>;
  const route = { data: of({ editMode: false }) } as any as ActivatedRoute;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateOpportunityModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [RouterTestingModule],
      providers: [
        {
          provide: MatDialog,
          useValue: mockMatDialogModal
        },
        {
          provide: Router,
          useValue: mockRouter
        },
        {
          provide: ActivatedRoute,
          useValue: route
        },
        provideMockStore({
          selectors: [
            {
              selector: opportunitySelectors.selectOpportunity,
              value: {
                opportunity: {
                  opportunityName: 'Test create 123',
                  opportunityType: 'PUBLIC',
                  opportunityId: 'OP-VD7-42dzielzdw77-213991505196'
                }
              }
            }
          ]
        })
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateOpportunityModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open opportunity creation modal', () => {
    component.openModal();
    expect(mockMatDialogModal.open).toHaveBeenCalled();
  });

  it('should close modal if edit mode is on', () => {
    component.editMode = true;
    component.cancel();
    expect(mockMatDialogModal.closeAll).toHaveBeenCalled();
  });

  it('should redirect to vendor page if clicked on cancel in case of new opportunity creation', () => {
    component.editMode = false;
    component.cancel();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['vendor']);
  });

  it('should create opportunity on click of create button if form is valid', () => {
    component.opportunityDetails.patchValue({
      opportunityName: 'abc',
      opportunityType: 'Public'
    });
    const createOpportunityFormChangedSpy = jest.spyOn(component.createOpportunityFormChanged, 'emit');
    component.createOpportunity();
    expect(createOpportunityFormChangedSpy).toBeCalled();
  });

  it('should not create opportunity if form is invalid', () => {
    component.opportunityDetails.patchValue({
      opportunityName: ''
    });
    component.createOpportunity();
    expect(component.opportunityDetails.valid).toBe(false);
  });

  it('should open modal on loading page for new opportunity creation', () => {
    component.editMode = true;
    component.ngAfterViewInit();
    expect(mockMatDialogModal.open).toHaveBeenCalled();
  });
});
