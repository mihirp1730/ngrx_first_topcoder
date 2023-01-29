import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of, throwError } from 'rxjs';

import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { CommunicationService } from '@apollo/app/services/communication';
import { NotificationService } from '@apollo/app/ui/notification';

import { mockCommunicationService, mockNotificationService } from '../../shared/services.mock';
import * as communicationActions from '../state/actions/communication.actions';
import * as communicationSelectors from '../state/selectors/communication.selectors';
import { mockAuthCodeFlowService } from './../../shared/services.mock';
import { CommunicationContainerComponent } from './communication-container.component';

describe('CommunicationContainerComponent', () => {
  let component: CommunicationContainerComponent;
  let mockStore: MockStore;
  let fixture: ComponentFixture<CommunicationContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, FormsModule, ReactiveFormsModule],
      declarations: [CommunicationContainerComponent],
      providers: [
        provideMockStore({
          selectors: [
            {
              selector: communicationSelectors.selectLoggedInUserDetails,
              value: {
                name: 'Test',
                email: 'test@email.com'
              }
            }
          ]
        }),
        {
          provide: CommunicationService,
          useValue: mockCommunicationService
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService
        },
        {
          provide: AuthCodeFlowService,
          useValue: mockAuthCodeFlowService
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunicationContainerComponent);
    mockStore = TestBed.inject(Store) as MockStore;
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadChats', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  it('should not invoke newUnreadMessage action if chat user does not match with logged in user', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    mockAuthCodeFlowService.getUser.mockImplementation(() => of({ user: { email: 'test1@email.com' } }) as any);
    const payload = { sender: 'test@email.com', content: 'message', type: 'TEXT', chatThreadId: '222' };
    mockCommunicationService.messages$ = of(payload);
    expect(spy).not.toHaveBeenCalledWith(communicationActions.newUnreadMessage({ payload, currentTime: new Date() }));
  });

  it('should dispatch openChat action', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.onChatClick('test-id');
    expect(spy).toHaveBeenCalledWith(communicationActions.openChat({ chatId: 'test-id' }));
  });

  it('should test web socket failure scenario, expect notification service to be called', () => {
    mockCommunicationService.messages$ = throwError(() => new Error('some error'));
    component.ngOnInit();
    expect(mockNotificationService.send).toHaveBeenCalled();
  });
});
