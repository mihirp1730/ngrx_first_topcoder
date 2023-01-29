import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { ActiveComponent } from './active.component';

describe('ActiveComponent', () => {
  let component: ActiveComponent;
  let mockStore: MockStore;
  let fixture: ComponentFixture<ActiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActiveComponent],
      imports: [MatProgressSpinnerModule],
      providers: [provideMockStore()]
    }).compileComponents();
    mockStore = TestBed.inject(Store) as unknown as MockStore;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('download', () => {
    it('should dispatch user downloads selected package', () => {
      const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
      component.download();
      expect(spy).toHaveBeenCalled();
    });
  });
});
