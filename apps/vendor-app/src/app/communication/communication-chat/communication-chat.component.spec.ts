import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { CommunicationService } from '@apollo/app/services/communication';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { mockCommunicationService, mockMatDialogModal } from '../../shared/services.mock';
import * as communicationActions from '../state/actions/communication.actions';
import * as communicationSelectors from '../state/selectors/communication.selectors';
import { CommunicationChatComponent } from './communication-chat.component';

describe('CommunicationChatComponent', () => {
  let component: CommunicationChatComponent;
  let fixture: ComponentFixture<CommunicationChatComponent>;
  let mockStore: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CommunicationChatComponent],
      providers: [
        {
          provide: CommunicationService,
          useValue: mockCommunicationService
        },
        {
          provide: MatDialog,
          useValue: {
            open: () => {
              return {
                componentInstance: {
                  yesClickEvent: of(['email'])
                }
              }
            }
          }
        },
        provideMockStore({
          selectors: [
            { selector: communicationSelectors.selectParticipants, value: ['test@slb.com'] },
            { selector: communicationSelectors.selectLoggedInUserDetails, value: { email: 'test@slb.com', name: 'test_user'} },
            { selector: communicationSelectors.selectActiveChatId, value: 'id_1' }
          ]
        })
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunicationChatComponent);
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
          chatThreadId: 'id_1',
        }
      })
    );
  });

  it('should openModal', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.openModal(true);
    expect(spy).toHaveBeenCalled();
  });

  it('should add new participants to an array', () => {
    const value = ['test@slb.com'];
    const expectedNewParticipants = {
      ...component.newParticipants(value)
    };
    component.newParticipants(value);
    expect(expectedNewParticipants).toEqual({ participants: [{ emailId: 'test@slb.com', displayName: 'test' }] });
  });
});
