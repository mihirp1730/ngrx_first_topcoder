import { CUSTOM_ELEMENTS_SCHEMA, SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsLockIconComponent } from './results-lock-icon.component';

describe('ResultsLockIconComponent', () => {
  let component: ResultsLockIconComponent;
  let fixture: ComponentFixture<ResultsLockIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResultsLockIconComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultsLockIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    it('should set showLock to false', () => {
      component.ngOnChanges({
        result: {
          currentValue: {
            properties: [
              {
                name: 'OpportunityType',
                value: 'Public'
              }
            ]
          }
        },
        isGuest: {
          currentValue: true
        }
      } as unknown as SimpleChanges);
      expect(component.showLock).toBe(false);
    });
  });
});

describe('ResultsLockIconComponent.getIsPublicValue', () => {
  it('should return false by default', () => {
    expect(ResultsLockIconComponent.getIsPublicValue(undefined)).toBe(false);
    expect(ResultsLockIconComponent.getIsPublicValue({})).toBe(false);
    expect(ResultsLockIconComponent.getIsPublicValue({ properties: undefined })).toBe(false);
    expect(
      ResultsLockIconComponent.getIsPublicValue({
        properties: [
          undefined,
          {},
          {
            name: 'something'
          },
          {
            name: 'OpportunityType'
          }
        ]
      })
    ).toBe(false);
  });
  it('should return true', () => {
    expect(
      ResultsLockIconComponent.getIsPublicValue({
        properties: [
          {
            name: 'OpportunityType',
            value: 'Public'
          }
        ]
      })
    ).toBe(true);
  });
});
