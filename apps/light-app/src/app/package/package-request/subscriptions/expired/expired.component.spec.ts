import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { SlbButtonModule } from '@slb-dls/angular-material/button';
import { SlbFormFieldModule } from '@slb-dls/angular-material/form-field';
import { v4 as uuid } from 'uuid';

import { MockAuthCodeFlowService } from '../../../../shared/services.mock';
import * as packageSelectors from '../../../state/selectors/package.selectors';
import { ExpiredComponent } from './expired.component';

describe('ExpiredComponent', () => {
  let component: ExpiredComponent;
  let fixture: ComponentFixture<ExpiredComponent>;
  let mockStore: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExpiredComponent],
      imports: [
        NoopAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
        SlbButtonModule,
        SlbFormFieldModule
      ],
      providers: [
        provideMockStore({
          selectors: [
            {
              selector: packageSelectors.selectSelectedPackageRequesting,
              value: false
            }
          ]
        }),
        {
          provide: AuthCodeFlowService,
          useClass: MockAuthCodeFlowService
        }
      ]
    }).compileComponents();
    mockStore = TestBed.inject(Store) as unknown as MockStore;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpiredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onRequestPackage', () => {
    it('should dispatch with comment and company', () => {
      const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
      component.subRequestFormGroup.patchValue({
        comment: uuid(),
        company: uuid()
      });
      component.onRequestPackage();
      expect(spy).toHaveBeenCalled();
    });
  });
});
