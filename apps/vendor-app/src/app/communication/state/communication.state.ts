import { IChatThreadMessage, IParticipantDetail } from '@apollo/app/services/communication';
import { AuthUser } from '@apollo/api/interfaces';

interface IActiveChat {
  chatId: string;
  sendingMessage: boolean;
  topic: string;
  participants: Array<IParticipantDetail>;
  messages: Array<IChatThreadMessage>;
}

export interface State {
  chats: Array<any>;
  loadingChats: boolean;
  activeChat: IActiveChat;
  loggedInUserDetails: AuthUser | null;
}

export const initialState: State = {
  chats: [],
  loadingChats: false,
  activeChat: {
    chatId: null,
    sendingMessage: false,
    topic: null,
    participants: [],
    messages: []
  },
  loggedInUserDetails: null
};
