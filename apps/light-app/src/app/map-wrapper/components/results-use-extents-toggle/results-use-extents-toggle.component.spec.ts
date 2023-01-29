import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { mockFeatureFlagService } from './../../../shared/services.mock';

import { FeatureFlagService } from '@apollo/app/feature-flag';
import { ResultsUseExtentsToggleComponent } from './results-use-extents-toggle.component';

describe('ResultsUseExtentsToggleComponent', () => {
  let component: ResultsUseExtentsToggleComponent;
  let fixture: ComponentFixture<ResultsUseExtentsToggleComponent>;
  let store: MockStore;
  const initialState = {};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatCheckboxModule],
      declarations: [ResultsUseExtentsToggleComponent],
      providers: [
        provideMockStore({ initialState }),
        {
          provide: FeatureFlagService,
          useValue: mockFeatureFlagService
        }
      ]
    }).compileComponents();
    store = TestBed.inject(MockStore);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultsUseExtentsToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('resultsExtentsToggle', () => {
    it('should dispatch an action', () => {
      const spy = jest.spyOn(store, 'dispatch').mockImplementation();
      component.resultsExtentsToggle();
      expect(spy).toHaveBeenCalled();
    });
  });
});
