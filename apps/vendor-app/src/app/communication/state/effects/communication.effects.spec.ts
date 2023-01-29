import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { CommunicationService, IChatMessagePayload } from '@apollo/app/services/communication';
import { NotificationService } from '@apollo/app/ui/notification';
import { VendorAppService } from '@apollo/app/vendor';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { of, ReplaySubject, throwError } from 'rxjs';
import { take } from 'rxjs/operators';

import {
  mockAuthCodeFlowService,
  mockCommunicationService,
  mockNotificationService,
  mockRouter,
  mockVendorAppService
} from '../../../shared/services.mock';
import * as comunicationActions from '../actions/communication.actions';
import * as communicationSelectors from '../selectors/communication.selectors';
import { CommunicationEffects } from './communication.effects';

describe('CommunicationEffects', () => {
  let actions$: ReplaySubject<Action>;
  let effects: CommunicationEffects;

  beforeEach(() => {
    actions$ = new ReplaySubject(1);
    TestBed.configureTestingModule({
      providers: [
        provideMockActions(() => actions$),
        provideMockStore({
          selectors: [
            {
              selector: communicationSelectors.selectLoggedInUserDetails,
              value: {
                email: 'test@email.com'
              }
            },
            {
              selector: communicationSelectors.deduceCurrentUserAddingParticipantsToActiveChat,
              value: {
                addedBy: 'addedBy',
                chatId: 'chatId'
              }
            },
            {
              selector: communicationSelectors.selectActiveChatId,
              value: 'chatId'
            },
            {
              selector: communicationSelectors.selectChats,
              value: [
                {
                  id: '123',
                  chatThreadId: '111',
                  newMessages: 4
                },
                {
                  id: '222',
                  chatThreadId: '222',
                  newMessages: 0
                }
              ]
            }
          ]
        }),
        {
          provide: Router,
          useValue: mockRouter
        },
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
        },
        {
          provide: VendorAppService,
          useValue: mockVendorAppService
        },
        CommunicationEffects
      ]
    });

    effects = TestBed.inject(CommunicationEffects);
  });

  afterEach(() => {
    actions$.complete();
  });

  describe('loadChats$', () => {
    it('should return a loadChatsSuccess action', (done) => {
      effects.loadChats$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Communication] Load Chats Success');
        done();
      });

      actions$.next(comunicationActions.loadChats({ email: 'user@slb.com' }));
    });

    it('should return a loadChatsFail action', (done) => {
      mockCommunicationService.getChatThreads.mockImplementation(() => throwError(new Error('')));
      effects.loadChats$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Communication] Load Chats Fail');
        done();
      });

      actions$.next(comunicationActions.loadChats({ email: 'user@slb.com' }));
    });
  });

  describe('loadChatsFail$', () => {
    it('should send out a notification with error', (done) => {
      effects.handleFailure$.pipe(take(1)).subscribe(() => {
        expect(mockNotificationService.send).toHaveBeenCalled();
        done();
      });
      actions$.next(comunicationActions.loadChatsFail({ errorMessage: 'Something went wrong!' }));
    });
  });

  describe('openChat$', () => {
    it('should return a openChatSuccess action', (done) => {
      effects.openChat$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Communication] Open Chat Success');
        done();
      });

      actions$.next(comunicationActions.openChat({ chatId: 'test-id' }));
    });

    it('should return a openChatFail action', (done) => {
      mockCommunicationService.getMessagesByChatId.mockImplementation(() => throwError(new Error('')));
      effects.openChat$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Communication] Open Chat Fail');
        done();
      });

      actions$.next(comunicationActions.openChat({ chatId: 'test-id' }));
    });
  });

  describe('connectWebSocket$', () => {
    it('should call the connect method from communication service', (done) => {
      const chatId = 'chat_id';
      effects.connectWebSocket$.pipe(take(1)).subscribe(() => {
        expect(mockCommunicationService.connect).toHaveBeenCalled();
        done();
      });
      actions$.next(comunicationActions.createChatSuccess({ chatId } as any));
    });
  });

  describe('sendMessage$', () => {
    it('should call the sendMessage method from communication service', (done) => {
      effects.sendMessage$.pipe(take(1)).subscribe(() => {
        expect(mockCommunicationService.sendMessage).toHaveBeenCalled();
        done();
      });
      actions$.next(comunicationActions.sendMessage({ payload: {} as IChatMessagePayload }));
    });
  });

  describe('loadLoggedInUserDetails$', () => {
    it('should call auth Code Flow Servicee and get user details', (done) => {
      mockAuthCodeFlowService.getUser.mockImplementation(() => of({ user: { email: 'test@slb.com' } }) as any);
      effects.loadLoggedInUserDetails$.pipe(take(1)).subscribe(() => {
        expect(mockAuthCodeFlowService.getUser).toHaveBeenCalled();
        done();
      });
      actions$.next(comunicationActions.loadLoggedInUserDetails());
    });
  });

  describe('updateNewChatCount$', () => {
    it('should invoke changeCount method on communication service to increase the unread chat count', (done) => {
      const payload = { sender: 'test@slb.com', content: 'message', type: 'TEXT', chatThreadId: '222' };
      effects.updateNewChatCount$.pipe(take(1)).subscribe(() => {
        expect(mockCommunicationService.changeCount).toHaveBeenCalled();
        done();
      });
      actions$.next(comunicationActions.newUnreadMessage({ payload, currentTime: new Date() }));
    });
  });

  describe('updateCount$', () => {
    it('should invoke changeCount method on communication service to decrease the unread chat count', (done) => {
      effects.updateCount$.pipe(take(1)).subscribe(() => {
        expect(mockCommunicationService.changeCount).toHaveBeenCalled();
        done();
      });
      actions$.next(comunicationActions.updateCount({ chatId: '111' }));
    });
  });

  describe('addParticipants$', () => {
    it('should call the addParticipantToChat method from communication service', (done) => {
      effects.addParticipants$.pipe(take(1)).subscribe(() => {
        expect(mockCommunicationService.addParticipantToChat).toHaveBeenCalled();
        done();
      });
      actions$.next(comunicationActions.addParticipants({ participants: [] }));
    });

    it('should return a addParticipantsSuccess action', (done) => {
      effects.addParticipants$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Communication] Add Participants Success');
        done();
      });
      actions$.next(comunicationActions.addParticipants({ participants: [] }));
    });

    it('should return a addParticipantsFail action', (done) => {
      mockCommunicationService.addParticipantToChat.mockImplementation(() => throwError(new Error('')));
      effects.addParticipants$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Communication] Add Participants Fail');
        done();
      });
      actions$.next(comunicationActions.addParticipants({ participants: [] }));
    });
  });

  describe('getParticipants$', () => {
    it('should return a getParticipantsSuccess action', (done) => {
      effects.getParticipants$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Communication] Get Participants Success');
        done();
      });
      actions$.next(comunicationActions.getParticipants());
    });

    it('should return a getParticipantsFail action', (done) => {
      mockCommunicationService.getParticipantsInChat.mockImplementation(() => throwError(new Error('')));
      effects.getParticipants$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Communication] Get Participants Fail');
        done();
      });
      actions$.next(comunicationActions.getParticipants());
    });
  });

  describe('openChatSuccess$', () => {
    it('should return a updateStatus action', (done) => {
      effects.openChatSuccess$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Communication] Update Status');
        done();
      });
      actions$.next(comunicationActions.openChatSuccess({ chatId: '123', messages: [] as any }));
    });
  });

  describe('updateStatus$', () => {
    it('should return a updateStatus action', (done) => {
      effects.updateStatus$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Communication] Update Count');
        done();
      });
      actions$.next(comunicationActions.updateStatus({ chatId: '123', messages: [{ chatMessageId: '123' }] as any }));
    });
  });
});
