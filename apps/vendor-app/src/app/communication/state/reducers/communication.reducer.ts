import { createReducer, on } from '@ngrx/store';
import * as communicationActions from '../actions/communication.actions';

import { MessageType } from '@apollo/app/services/communication';
import { initialState, State } from '../communication.state';

export const communicationFeatureKey = 'communication';

const _communicationReducer = createReducer(
  initialState,
  on(communicationActions.loadChats, (state): State => {
    return {
      ...state,
      loadingChats: true
    };
  }),
  on(communicationActions.loadChatsSuccess, (state, { chats }): State => {
    return {
      ...state,
      loadingChats: false,
      chats
    };
  }),
  on(communicationActions.loadChatsFail, (state): State => {
    return {
      ...state,
      loadingChats: false,
      chats: []
    };
  }),
  on(communicationActions.createChat, (state): State => {
    return {
      ...state,
      activeChat: {
        ...state.activeChat,
        chatId: null,
        topic: null,
        participants: [],
        messages: []
      }
    };
  }),
  on(communicationActions.createChatSuccess, (state, { chatId, topic, participants }): State => {
    // TODO : Add chat to chat list
    return {
      ...state,
      activeChat: {
        ...state.activeChat,
        chatId,
        topic,
        participants
      }
    };
  }),
  on(communicationActions.openChat, (state, { chatId }): State => {
    return {
      ...state,
      activeChat: {
        ...state.activeChat,
        chatId
      }
    };
  }),
  on(communicationActions.openChatSuccess, (state, { messages }): State => {
    return {
      ...state,
      activeChat: {
        ...state.activeChat,
        messages
      }
    };
  }),
  on(communicationActions.sendMessage, (state): State => {
    return {
      ...state,
      activeChat: {
        ...state.activeChat,
        sendingMessage: true
      }
    };
  }),
  on(communicationActions.sendMessageSuccess, (state, { payload, currentTime }): State => {
    const activeChatThreadIndex = state.chats.findIndex((item) => item.id === state.activeChat.chatId);
    return {
      ...state,
      chats: [
        {
          ...state.chats[activeChatThreadIndex],
          lastModifiedDate: currentTime
        },
        ...state.chats.slice(0, activeChatThreadIndex),
        ...state.chats.slice(activeChatThreadIndex + 1)
      ],
      activeChat: {
        ...state.activeChat,
        sendingMessage: false,
        messages: [
          ...state.activeChat.messages,
          {
            chatThreadId: payload.chatThreadId,
            content: payload.content,
            createdOn: currentTime,
            sender: payload.sender,
            type: MessageType.Text,
            chatMessageId: ''
          }
        ]
      }
    };
  }),

  on(communicationActions.newUnreadMessageSuccess, (state, { payload, currentTime }): State => {
    const activeChatThreadIndex = state.chats.findIndex((item) => item.id === payload.chatThreadId);
    return {
      ...state,
      chats: [
        {
          ...state.chats[activeChatThreadIndex],
          newMessages: state.activeChat.chatId !== payload.chatThreadId ? state.chats[activeChatThreadIndex].newMessages + 1 : 0,
          lastModifiedDate: currentTime
        },
        ...state.chats.slice(0, activeChatThreadIndex),
        ...state.chats.slice(activeChatThreadIndex + 1)
      ],
      activeChat:
        state.activeChat.chatId === payload.chatThreadId
          ? {
              ...state.activeChat,
              sendingMessage: false,
              messages: [
                ...state.activeChat.messages,
                {
                  chatThreadId: payload.chatThreadId,
                  content: payload.content,
                  createdOn: currentTime,
                  sender: payload.sender,
                  type: MessageType.Text,
                  chatMessageId: ''
                }
              ]
            }
          : state.activeChat
    };
  }),

  on(communicationActions.loadLoggedInUserDetailsSuccess, (state, { user }): State => {
    return {
      ...state,
      loggedInUserDetails: user
    };
  }),
  on(communicationActions.addParticipantsSuccess, (state, { participants }): State => {
    return {
      ...state,
      activeChat: {
        ...state.activeChat,
        participants: [...state.activeChat.participants, ...participants]
      }
    };
  }),
  on(communicationActions.getParticipantsSuccess, (state, { participants }): State => {
    return {
      ...state,
      activeChat: {
        ...state.activeChat,
        participants
      }
    };
  }),
  on(communicationActions.updateCountSuccess, (state, { chatId }): State => {
    return {
      ...state,
      chats: state.chats.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            newMessages: 0
          };
        } else {
          return chat;
        }
      })
    };
  })
);

export function communicationReducer(state, action) {
  return _communicationReducer(state, action);
}
