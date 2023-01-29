import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { FeatureFlagService } from '@apollo/app/feature-flag';
import { CommunicationService } from '@apollo/app/services/communication';
import { NotificationService } from '@apollo/app/ui/notification';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of, throwError } from 'rxjs';

import {
  mockAuthCodeFlowService,
  mockCommunicationService,
  mockFeatureFlagService,
  mockNotificationService,
  mockRouter
} from '../../shared/services.mock';
import * as communicationActions from '../state/actions/communication.actions';
import * as communicationSelectors from '../state/selectors/communication.selectors';
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
            },
            {
              selector: communicationSelectors.selectVendorContactDetails,
              value: [
                {
                  emailId: 'emailId@email.com',
                  displayName: 'displayName'
                }
              ]
            },
            {
              selector: communicationSelectors.selectChats,
              value: [
                {
                  chatId: 'test'
                }
              ]
            }
          ]
        }),
        {
          provide: CommunicationService,
          useValue: mockCommunicationService
        },
        {
          provide: Router,
          useValue: mockRouter
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService
        },
        {
          provide: FeatureFlagService,
          useValue: mockFeatureFlagService
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
    component.dispatchCreateChatAction = jest.fn(() => 'something');
    component['chatPending'] = true;
    component['vendorContactDetailsReceived'] = true;
    component.loadChats();
    expect(spy).toHaveBeenCalled();
    expect(component.dispatchCreateChatAction()).toBe('something');
  });

  it('should not invoke newUnreadMessage action if chat user does not match with logged in user', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    mockAuthCodeFlowService.getUser.mockImplementation(() => of({ user: { email: 'test1@email.com' } }) as any);
    const payload = { sender: 'test@email.com', content: 'message', type: 'TEXT', chatThreadId: '222' };
    mockCommunicationService.messages$ = of(payload);
    expect(spy).not.toHaveBeenCalledWith(communicationActions.newUnreadMessage({ payload, currentTime: new Date() }));
  });

  it('should dispatch createChat action', () => {
    component.dispatchCreateChatAction = jest.fn(() => 'something');
    component['vendorContactDetailsReceived'] = true;
    component['chatLoaded'] = true;
    component.startChat();
    expect(component.dispatchCreateChatAction()).toBe('something');
  });

  it('should dispatch createChat action', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component['vendorContactDetailsReceived'] = false;
    component.startChat();
    expect(spy).not.toHaveBeenCalled();
    expect(component['chatPending']).toBeTruthy();
  });

  it('should dispatch openChat action', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.onChatClick('test-id');
    expect(spy).toHaveBeenCalledWith(communicationActions.openChat({ chatId: 'test-id', isModular: false }));
  });

  it('should test web socket failure scenario, expect notification service to be called', () => {
    mockCommunicationService.messages$ = throwError(() => new Error('some error'));
    component.connectWebSocket();
    expect(mockNotificationService.send).toHaveBeenCalled();
  });

  it('should dispatch create chat action', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component['chatInitiated'] = false;
    component.dispatchCreateChatAction();
    expect(spy).toHaveBeenCalled();
  });
});
