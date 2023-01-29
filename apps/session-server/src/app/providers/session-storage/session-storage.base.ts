import { Enums, Interfaces } from '@apollo/server/services';

export abstract class SessionStorageBase {
  public abstract createUserSession(r: CreateUserSessionRequest): Promise<Interfaces.Atlas.Session.UserSession>;
  public abstract deleteUserSession(r: DeleteUserSessionRequest): Promise<void>;
  public abstract getUserSession(r: GetUserSessionRequest): Promise<Interfaces.Atlas.Session.UserSession>;
  public abstract getUserSessionIds(r: GetUserSessionIdsRequest): Promise<string[]>
  public abstract updateSessionComponentInstanceData(r: UpdateSessionComponentInstanceDataRequest): Promise<void>
  public abstract updateSessionComponentState(r: UpdateSessionComponentStateRequest): Promise<void>
}

export enum SessionStorageErrors {
  ComponentIdDoesNotExist = '[Session Storage Error] The provided componentId does not exist.',
  SubIdDoesNotExist = '[Session Storage Error] The provided subid does not exist.',
  SessionIdDoesNotExist = '[Session Storage Error] The provided sessionId does not exist.',
  Unknown = '[Session Storage Error] An unknown error occurred.'
}

export interface CreateUserSessionRequest {
  subid: string;
  sessionId: string;
}

export interface DeleteUserSessionRequest {
  subid: string;
  sessionId: string;
}

export interface GetUserSessionRequest {
  subid: string;
  sessionId: string;
}

export interface GetUserSessionIdsRequest {
  subid: string;
}

export interface UpdateSessionComponentInstanceDataRequest {
  subid: string;
  sessionId: string;
  componentId: string;
  instanceData: string;
}

export interface UpdateSessionComponentStateRequest {
  subid: string;
  sessionId: string;
  componentId: string;
  state: Enums.Atlas.Component.State;
}
