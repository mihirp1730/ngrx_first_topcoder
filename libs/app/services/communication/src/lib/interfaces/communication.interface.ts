export interface IGetChatThreadsResponse {
  chatThreadItems: Array<IChatThreadItems>;
}

export interface IChatThreadItems {
  chatThreadId: string;
  topic: string;
  metadata: any;
  createdBy: string;
  createdDate: string;
  newMessages: number;
  totalMessages: number;
  lastModifiedDate: string;
}

export interface IChatItem {
  id: string;
  title: string;
}

export interface IGetChatThreadByIdResponse {
  chatMessages: Array<IChatThreadMessage>;
}

export interface IChatThreadMessage {
  chatThreadId: string;
  chatMessageId?: string;
  content: string;
  createdOn?: Date | null;
  sender: string;
  type: MessageType;
}

export enum MessageType {
  ParticipantAdded = 'ParticipantAdded',
  Text = 'TEXT'
}

export interface IAppServicesCommunicationModuleOptions {
  webSocketUrl?: string;
  communicationServiceApiUrl: string;
  protocolName?: string;
}

export interface IChatMessagePayload {
  sender: string;
  content: string;
  type: string;
  chatThreadId: string;
  createdOn?: Date | null;
  chatMessageId?: string;
  displayName?: string;
}

export interface IGetParticipantsResponse {
  chatThreadParticipants: Array<IParticipantDetail>;
}

export interface IParticipantDetail {
  emailId: string;
  displayName: string;
  addedOn?: string;
  addedBy?: string;
}

export interface IAddPartipantsRequest {
  participants: Array<IParticipant>;
  addedOn?: string;
  addedBy?: string;
}

export interface IParticipant {
  emailId: string;
  displayName: string;
  role?: UserRole;
}

export interface ICreateChatPayload {
  participants: Array<IParticipant>;
  metadata: any;
  topic: string;
}

export enum UserRole {
  CONSUMER = 'CONSUMER',
  VENDOR = 'VENDOR'
}
