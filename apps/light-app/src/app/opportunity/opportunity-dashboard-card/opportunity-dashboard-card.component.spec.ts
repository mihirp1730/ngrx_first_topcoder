import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { OpportunityDashboardCardComponent } from './opportunity-dashboard-card.component';

describe('OpportunityDashboardCardComponent', () => {
  let component: OpportunityDashboardCardComponent;
  let fixture: ComponentFixture<OpportunityDashboardCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OpportunityDashboardCardComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpportunityDashboardCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set opportunityDetails', () => {
    const opportunityDetails = {
      opportunityProfile: {
        offerStartDate: '2022-01-01',
        offerEndDate: '2022-01-31'
      }
    } as any;
    const getDurationSpy = jest.spyOn(component, 'getDuration').mockReturnValue(30);
    component.opportunityDetails = opportunityDetails;
    expect(getDurationSpy).toHaveBeenCalled();
    expect(component.duration).toEqual(30);
  });

  it('should getDuration days', () => {
    const opportunityDetails = {
      opportunityProfile: {
        offerStartDate: '2022-01-01',
        offerEndDate: '2022-01-31'
      }
    } as any;
    expect(component.getDuration(opportunityDetails)).toEqual(30);
  });
});
