import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';
import { of, Subject } from 'rxjs';
import exp = require('constants');

import { CommunicationService, COMMUNICATION_SERVICE_API_URL, WEBSOCKET_FACTORY } from './communication.service';
import { IChatMessagePayload } from './interfaces/communication.interface';
import { VendorAppService } from '@apollo/app/vendor';

export const mockAuthCodeFlowService = {
  getUser: jest.fn(() => of({ accessToken: 'token' })),
  signIn: jest.fn(),
  checkUserTokenInfo: jest.fn(() => of()),
  handleChannelMessage: jest.fn(() => of()),
  signOut: jest.fn()
};
export const mockVendorAppService = {
  consumerUrl$: of('url'),
  retrieveAssociatedConsumerAppUrl: jest.fn().mockReturnValue(of('/test'))
};

describe('CommunicationService', () => {
  let service: CommunicationService;
  let httpMock: HttpTestingController;
  let mockWebsocketStream: Subject<any>;

  beforeEach(() => {
    mockWebsocketStream = new Subject<any>();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: COMMUNICATION_SERVICE_API_URL,
          useValue: 'http://communication-api'
        },
        {
          provide: SecureEnvironmentService,
          useValue: {
            secureEnvironment: {
              app: {
                key: 'app-key'
              }
            }
          }
        },
        {
          provide: WEBSOCKET_FACTORY,
          useValue: () => mockWebsocketStream
        },
        CommunicationService,
        {
          provide: AuthCodeFlowService,
          useValue: mockAuthCodeFlowService
        },
        {
          provide: VendorAppService,
          useValue: mockVendorAppService
        }
      ]
    });

    service = TestBed.inject(CommunicationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    mockWebsocketStream.unsubscribe();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getChatCount', () => {
    it('should get the unread chat count', () => {
      expect(service.getChatCount()).toEqual(service['unreadChats'].value);
    });
  });

  describe('getChatThreads', () => {
    it('should call the get chat threads endpoint', (done) => {
      const mockResponse = { chatThreadItems: [{ chatThreadId: 1, topic: 'test', newMessages: 3 }] };
      service.getChatThreads('test@email.com').subscribe((response) => {
        expect(response[0].id).toEqual(mockResponse.chatThreadItems[0].chatThreadId);
        done();
      });

      httpMock.expectOne('http://communication-api').flush(mockResponse);
    });

    it('should call the get chat threads endpoint, with vendorId', (done) => {
      const mockResponse = { chatThreadItems: [{ chatThreadId: 1, topic: 'test', newMessages: 3 }] };
      const httpSpy = jest.spyOn((service as any).httpClient, 'get').mockReturnValue(of(mockResponse));
      service.getChatThreads('test@email.com', 'VD7').subscribe((response) => {
        expect(response[0].id).toEqual(mockResponse.chatThreadItems[0].chatThreadId);
        expect(httpSpy).toHaveBeenCalledWith('http://communication-api?vendorId=VD7');
      });
      done();
    });
  });

  describe('createChatThread', () => {
    it('should call the post method to create a chat thread', (done) => {
      const mockResponse = { chatThreadId: 'test-id' };
      const createChatPayload = {
        participants: [{ emailId: 'test@slb.com', displayName: 'user1' }],
        metadata: {},
        topic: 'testChat'
      };
      service.createChatThread(createChatPayload as any).subscribe((response) => {
        expect(response).toEqual(mockResponse.chatThreadId);
        done();
      });
      httpMock.expectOne('http://communication-api').flush(mockResponse);
    });
  });

  describe('getMessagesByChatId', () => {
    it('should call the get messages by chat id', (done) => {
      const mockResponse = { chatMessages: [] };
      service.getMessagesByChatId('chatId').subscribe((response) => {
        expect(response).toEqual([]);
        done();
      });

      httpMock.expectOne('http://communication-api/chatId/messages/').flush(mockResponse);
    });
  });

  describe('connect and send message', () => {
    it('should connect', () => {
      service['socket'] = null;
      service.connect();
      expect(service['socket']).toBeDefined();
    });

    describe('send message', () => {
      it('should sendMessage', (done) => {
        const data = { content: 'test' } as IChatMessagePayload;
        service.connect();
        service['socket$'].subscribe((res) => {
          expect(res).toBe(data);
          done();
        });

        service.sendMessage(data);
      });

      it('should set closed as false, if web socket connect returns an error', (done) => {
        const data = { content: 'test' } as IChatMessagePayload;
        service.connect();
        service.sendMessage(data);
        mockWebsocketStream.error('web socket exception');
        expect(service['socket$'].closed).toBeTruthy();
        service.connect();
        done();
      });

      it('should set offline messages if the user is offline', (done) => {
        const firstMessage = { content: 'test' } as IChatMessagePayload;
        const secondMessage = { content: 'test' } as IChatMessagePayload;
        service.connect();
        service.isUserOffline = true;
        service.sendMessage(firstMessage);
        service.sendMessage(secondMessage);
        expect(service['pendingMessageQueue'].length).toBe(2);
        done();
      });

      it('should invoke sendingQueuedMessage method to send offline messages, no offline message', (done) => {
        const firstMessage = { content: 'test' } as IChatMessagePayload;
        const secondMessage = { content: 'test' } as IChatMessagePayload;
        service.connect();
        service.sendMessage(firstMessage);
        service.sendMessage(secondMessage);
        const response = service.sendingQueuedMessage();
        expect(response).toBeUndefined();
        done();
      });

      it('should invoke sendingQueuedMessage method to send offline messages, no offline message', (done) => {
        const firstMessage = { content: 'test' } as IChatMessagePayload;
        const secondMessage = { content: 'test' } as IChatMessagePayload;
        const spy = jest.spyOn(service, 'sendingQueuedMessage');
        service.connect();
        service.isUserOffline = true;
        service.sendMessage(firstMessage);
        service.sendMessage(secondMessage);
        service.isUserOffline = false;
        service.sendingQueuedMessage(service['pendingMessageQueue']);
        expect(spy).toHaveBeenCalledTimes(4);
        done();
      });

      it('should throw error', () => {
        service['socket$'] = undefined;
        const data = { content: 'test' } as IChatMessagePayload;
        service.sendMessage(data);
        expect(service['socket$']).toBeUndefined();
      });
    });

    it('should close', () => {
      service.connect();
      service.close();
      expect(service['socket$'].isStopped).toBeTruthy();
    });
  });

  describe('addParticipantToChat', () => {
    it('should call the post addParticipants endpoint', (done) => {
      const body = {
        participants: [
          {
            emailId: 'test@slb.com',
            displayName: 'name'
          }
        ],
        addedOn: 'date',
        addedBy: 'date'
      };

      service.addParticipantToChat('chatId', body).subscribe((response) => {
        expect(response).toBeTruthy();
        done();
      });

      httpMock.expectOne('http://communication-api/chatId/participants/').flush('successful');
    });
  });

  describe('getParticipantsInChat', () => {
    it('should call the get participants in chat', (done) => {
      const mockResponse = { chatThreadParticipants: [] };
      service.getParticipantsInChat('chatId').subscribe((response) => {
        expect(response).toEqual([]);
        done();
      });

      httpMock.expectOne('http://communication-api/chatId/participants/').flush(mockResponse);
    });
  });

  describe('updateStatus', () => {
    it('should update the status', (done) => {
      const mockResponse = '';
      const body = {
        chatMessageId: '123'
      };
      service.updateStatus('chatid', body).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        done();
      });

      httpMock.expectOne('http://communication-api/chatid/readReceipts/').flush(mockResponse);
    });
  });
});
