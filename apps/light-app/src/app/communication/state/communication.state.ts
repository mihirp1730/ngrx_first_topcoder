import { AuthUser } from '@apollo/api/interfaces';
import { IChatThreadMessage, IParticipantDetail } from '@apollo/app/services/communication';
import { IVendorContactDetails } from '@apollo/app/vendor';

interface IActiveChat {
  chatId: string;
  sendingMessage: boolean;
  topic: string;
  participants: Array<IParticipantDetail>;
  messages: Array<IChatThreadMessage>;
}

export interface IMetadata {
  opportunityId: string;
  opportunityName: string;
  dataVendorId: string;
}

export interface State {
  chats: Array<any> | null;
  loadingChats: boolean;
  activeChat: IActiveChat;
  loggedInUserDetails: AuthUser | null;
  metadata: IMetadata | null;
  vendorContactDetails: IVendorContactDetails[] | null;
  isLoadingWhileGettingMessages: boolean;
}

export interface IChatItems {
  id: string;
  title: string;
  metadata: IMetadata;
  createdBy: string;
  createdDate: string;
  lastModifiedDate: string;
}

export const initialState: State = {
  chats: null,
  loadingChats: false,
  activeChat: {
    chatId: null,
    sendingMessage: false,
    topic: null,
    participants: [],
    messages: []
  },
  loggedInUserDetails: null,
  metadata: null,
  vendorContactDetails: null,
  isLoadingWhileGettingMessages: false
};
