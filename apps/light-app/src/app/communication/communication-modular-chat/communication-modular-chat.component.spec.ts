import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommunicationService } from '@apollo/app/services/communication';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { mockAuthCodeFlowService, mockCommunicationService, mockNotificationService } from '../../shared/services.mock';

import * as communicationActions from '../state/actions/communication.actions';
import * as communicationSelectors from '../state/selectors/communication.selectors';
import * as opportunityAttendeeActions from '../../opportunity/state/actions/opportunity-attendee.actions';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { NotificationService } from '@apollo/app/ui/notification';
import { Store } from '@ngrx/store';
import { take, throwError } from 'rxjs';
import { CommunicationModularChatComponent } from './communication-modular-chat.component';
import { IMetadata } from '../state/communication.state';

describe('CommunicationModularChatComponent', () => {
  let component: CommunicationModularChatComponent;
  let fixture: ComponentFixture<CommunicationModularChatComponent>;
  let mockStore: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CommunicationModularChatComponent],
      providers: [
        {
          provide: CommunicationService,
          useValue: mockCommunicationService
        },
        {
          provide: AuthCodeFlowService,
          useValue: mockAuthCodeFlowService
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService
        },
        provideMockStore({
          selectors: [
            { selector: communicationSelectors.selectLoggedInUserDetails, value: { email: 'test@slb.com', name: 'test_user' } },
            { selector: communicationSelectors.selectActiveChatId, value: 'id_1' },
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
                  chatId: 'test',
                  metadata: { opportunityId: 'op-1', vendorId: 'v-1' }
                }
              ]
            }
          ]
        })
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunicationModularChatComponent);
    mockStore = TestBed.inject(Store) as MockStore;
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch sendMessage action', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.sendMessage('message');
    expect(spy).toHaveBeenCalledWith(
      communicationActions.sendMessage({
        payload: {
          sender: 'test@slb.com',
          content: 'message',
          type: 'TEXT',
          chatThreadId: 'id_1'
        }
      })
    );
  });

  it('should call loadChats', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.loadChats();
    expect(spy).toHaveBeenCalled();
  });

  it('should test web socket failure scenario, expect notification service to be called', () => {
    mockCommunicationService.messages$ = throwError(() => new Error('some error'));
    component.connectToWebSocket();
    expect(mockNotificationService.send).toHaveBeenCalled();
  });

  it('should dispatch close modular chat action', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.closeModularChatPanel();
    expect(spy).toHaveBeenCalledWith(opportunityAttendeeActions.openModularChatPanel({ openModularChat: false }));
  });

  it('should create chat when no filtered chats ', (done) => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.opportunityDetails = { opportunityId: 'op-1', dataVendorId: 'v-2' };
    component.ngOnInit();
    component.filteredChats$.pipe(take(1)).subscribe((chats) => {
      if (chats.length === 0) {
        expect(spy).toHaveBeenCalled();
      }
      done();
    });
  });

  it('should open chat when  filtered chat thread ', (done) => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.opportunityDetails = { opportunityId: 'op-1', dataVendorId: 'v-1' };
    component.ngOnInit();
    component.filteredChats$.pipe(take(1)).subscribe((chats) => {
      if (chats.length > 0) {
        expect(spy).toHaveBeenCalled();
      }
      done();
    });
  });

  it('should dispatch  set meta data action', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    const metadata: IMetadata = { opportunityId: '', opportunityName: '', dataVendorId: '' };
    component.opportunityDetails = { opportunityId: '', opportunityName: '', dataVendorId: '' };
    expect(spy).toHaveBeenCalledWith(communicationActions.setMetadata({ metadata }));
  });
});
