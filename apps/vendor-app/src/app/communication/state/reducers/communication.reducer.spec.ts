import * as comunicationActions from '../actions/communication.actions';
import { initialState } from '../communication.state';
import { communicationReducer } from './communication.reducer';

describe('communicationReducer', () => {
  describe('unknown action', () => {
    it('should return the default state', () => {
      const action = { type: 'Unknown' };
      const state = communicationReducer(initialState, action);
      expect(state).toBe(initialState);
    });
  });

  describe('loadChats', () => {
    it('should return loadingChats as true', () => {
      const action = comunicationActions.loadChats({ email: 'someuser@slb.com' });
      const newState = communicationReducer(initialState, action);
      expect(newState.loadingChats).toBeTruthy();
    });
  });

  describe('loadChatsSuccess', () => {
    it('should return loadingChats as false', () => {
      const action = comunicationActions.loadChatsSuccess({ chats: [{}] });
      const newState = communicationReducer(initialState, action);
      expect(newState.chats.length).toBe(1);
    });
  });

  describe('loadChatsFail', () => {
    it('should return loadingChats as false', () => {
      const action = comunicationActions.loadChatsFail({ errorMessage: null });
      const newState = communicationReducer(initialState, action);
      expect(newState.loadingChats).toBeFalsy;
    });
  });

  describe('createChat', () => {
    it('should set the state of activeChat', () => {
      const action = comunicationActions.createChat({ topic: null, participants: [] });
      const newState = communicationReducer(initialState, action);
      expect(newState.activeChat).toEqual({
        chatId: null,
        sendingMessage: false,
        participants: [],
        messages: [],
        topic: null
      });
    });
  });

  describe('createChatSuccess', () => {
    it('should set the state of activeChat', () => {
      const action = comunicationActions.createChatSuccess({
        chatId: 'testId',
        topic: '',
        participants: [{ emailId: 'test@slb.com', displayName: 'user1' }]
      });
      const newState = communicationReducer(initialState, action);
      expect(newState.activeChat).toEqual({
        chatId: 'testId',
        sendingMessage: false,
        participants: [{ emailId: 'test@slb.com', displayName: 'user1' }],
        messages: [],
        topic: ''
      });
    });
  });

  describe('sendMessage', () => {
    it('should set the state of activeChat.sendingMessage to true', () => {
      const payload = { sender: 'test@slb.com', content: 'message', type: 'TEXT', chatThreadId: '123' };
      const action = comunicationActions.sendMessage({ payload });
      const newState = communicationReducer(initialState, action);
      expect(newState.activeChat).toEqual({
        chatId: null,
        sendingMessage: true,
        participants: [],
        messages: [],
        topic: null
      });
    });
  });

  describe('sendMessageSuccess', () => {
    it('should set the state of activeChat.sendingMessage to false and add the message', () => {
      const payload = { sender: 'test@slb.com', content: 'message', type: 'TEXT', chatThreadId: '123' };
      const currentTime = new Date();
      const dummyState = {
        chats: [
          {
            id: '1',
            newMessages: 4,
            lastModifiedDate: currentTime
          },
          {
            id: '2',
            newMessages: 4,
            lastModifiedDate: currentTime
          },
          {
            id: '3',
            newMessages: 4,
            lastModifiedDate: currentTime
          }
        ],
        activeChat: {
          chatId: '2',
          messages: [],
          topic: null
        }
      };
      const action = comunicationActions.sendMessageSuccess({ payload, currentTime });
      const newState = communicationReducer(dummyState, action);
      expect(newState).toStrictEqual({
        chats: [
          {
            id: '2',
            newMessages: 4,
            lastModifiedDate: currentTime
          },
          {
            id: '1',
            newMessages: 4,
            lastModifiedDate: currentTime
          },
          {
            id: '3',
            newMessages: 4,
            lastModifiedDate: currentTime
          }
        ],
        activeChat: {
          chatId: '2',
          sendingMessage: false,
          messages: [
            {
              chatThreadId: '123',
              chatMessageId: '',
              content: payload.content,
              createdOn: currentTime,
              sender: payload.sender,
              type: payload.type
            }
          ],
          topic: null
        }
      });
    });
  });

  describe('newUnreadMessageSuccess', () => {
    it('should set the state of activeChat.newMessages to 0 ', () => {
      const payload = { sender: 'test@slb.com', content: 'message', type: 'TEXT', chatThreadId: '2' };
      const currentTime = new Date();
      const dummyState = {
        chats: [
          {
            id: '1',
            newMessages: 4,
            lastModifiedDate: currentTime
          },
          {
            id: '2',
            newMessages: 4,
            lastModifiedDate: currentTime
          },
          {
            id: '3',
            newMessages: 4,
            lastModifiedDate: currentTime
          }
        ],
        activeChat: {
          chatId: '2',
          messages: [],
          topic: null
        }
      };
      const action = comunicationActions.newUnreadMessageSuccess({ payload, currentTime });
      const newState = communicationReducer(dummyState, action);
      expect(newState.chats[0].newMessages).toBe(0);
    });

    it('should increment the state of activeChat.newMessages by 1 ', () => {
      const payload = { sender: 'test@slb.com', content: 'message', type: 'TEXT', chatThreadId: '1' };
      const currentTime = new Date();
      const dummyState = {
        chats: [
          {
            id: '1',
            newMessages: 4,
            lastModifiedDate: currentTime
          },
          {
            id: '2',
            newMessages: 4,
            lastModifiedDate: currentTime
          },
          {
            id: '3',
            newMessages: 4,
            lastModifiedDate: currentTime
          }
        ],
        activeChat: {
          chatId: '2',
          messages: [],
          topic: null
        }
      };
      const action = comunicationActions.newUnreadMessageSuccess({ payload, currentTime });
      const newState = communicationReducer(dummyState, action);
      expect(newState.chats[0].newMessages).toBe(5);
    });
  });

  describe('loadLoggedInUserDetailsSuccess', () => {
    it('should set the state of logged in user details success', () => {
      const email = 'test@slb.com';
      const payload = { user: { email } };
      const action = comunicationActions.loadLoggedInUserDetailsSuccess(payload as any);
      const newState = communicationReducer(initialState, action);
      expect(newState.loggedInUserDetails.email).toEqual(email);
    });
  });

  describe('openChat', () => {
    it('should set the state of an openChat', () => {
      const action = comunicationActions.openChat({ chatId: 'testId' });
      const newState = communicationReducer(initialState, action);
      expect(newState.activeChat).toEqual({
        chatId: 'testId',
        sendingMessage: false,
        participants: [],
        messages: [],
        topic: null
      });
    });
  });

  describe('openChatSuccess', () => {
    it('should set the state of an openChat', () => {
      const action = comunicationActions.openChatSuccess({ chatId: 'testId', messages: [] });
      const newState = communicationReducer(initialState, action);
      expect(newState.activeChat).toEqual({
        chatId: null,
        sendingMessage: false,
        participants: [],
        messages: [],
        topic: null
      });
    });
  });

  describe('addParticipantsSuccess', () => {
    it('should set the state of participants', () => {
      const action = comunicationActions.addParticipantsSuccess({ participants: [{ emailId: 'test@slb.com', displayName: 'test' }] });
      const newState = communicationReducer(initialState, action);
      expect(newState.activeChat).toEqual({
        chatId: null,
        messages: [],
        participants: [{ emailId: 'test@slb.com', displayName: 'test' }],
        sendingMessage: false,
        topic: null
      });
    });
  });

  describe('getParticipantsSuccess', () => {
    it('should set the state of participants', () => {
      const action = comunicationActions.getParticipantsSuccess({
        participants: [{ emailId: 'test@slb.com', displayName: 'test', addedBy: 'email', addedOn: 'date' }]
      });
      const newState = communicationReducer(initialState, action);
      expect(newState.activeChat).toEqual({
        chatId: null,
        messages: [],
        participants: [{ emailId: 'test@slb.com', displayName: 'test', addedBy: 'email', addedOn: 'date' }],
        sendingMessage: false,
        topic: null
      });
    });
  });

  describe('updateCountSuccess', () => {
    it('should set the state of participants', () => {
      const action = comunicationActions.updateCountSuccess({ chatId: '123' });
      const dummyState = {
        chats: [
          {
            id: '123',
            newMessages: 4
          }
        ]
      };
      const newState = communicationReducer(dummyState, action);
      expect(newState.chats).toEqual([
        {
          id: '123',
          newMessages: 0
        }
      ]);
    });
    it('should not update the new chatmessages count', () => {
      const action = comunicationActions.updateCountSuccess({ chatId: '123' });
      const dummyState = {
        chats: [
          {
            id: '1234',
            newMessages: 4
          }
        ]
      };
      const newState = communicationReducer(dummyState, action);
      expect(newState.chats).toEqual([
        {
          id: '1234',
          newMessages: 4
        }
      ]);
    });
  });
});
