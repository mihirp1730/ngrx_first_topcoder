import { Interfaces } from '@apollo/server/services';
import { GaiaTraceClass } from '@apollo/tracer';
import { Injectable } from '@nestjs/common';
import { keys, without } from 'lodash';

import {
  CreateUserSessionRequest,
  DeleteUserSessionRequest,
  GetUserSessionIdsRequest,
  GetUserSessionRequest,
  SessionStorageBase as Base,
  SessionStorageErrors as Errors,
  UpdateSessionComponentInstanceDataRequest,
  UpdateSessionComponentStateRequest
} from './session-storage.base';

@Injectable()
@GaiaTraceClass
export class MemorySessionStorage extends Base {
  constructor(private readonly defaultUserSession: Interfaces.Atlas.Session.UserSession) {
    super();
  }

  private userSessions: {
    [subid: string]: {
      [sessionId: string]: Interfaces.Atlas.Session.UserSession;
    };
  } = {};

  public async createUserSession(r: CreateUserSessionRequest): Promise<Interfaces.Atlas.Session.UserSession> {
    const { sessionId, subid } = r;
    const { defaultUserSession } = this;
    const id = sessionId;
    const name = 'New GAIA Light session';
    const user = subid;
    const components = defaultUserSession.components.map((component) => {
      return {
        ...component,
        session: id
      };
    });
    if (this.userSessions[subid] === undefined) {
      this.userSessions[subid] = {};
    }
    this.userSessions[subid][sessionId] = {
      ...defaultUserSession,
      components,
      id,
      name,
      user
    };
    // Return it:
    return this.userSessions[subid][sessionId];
  }

  public async deleteUserSession(r: DeleteUserSessionRequest): Promise<void> {
    const { sessionId, subid } = r;
    if (this.userSessions[subid] === undefined) {
      throw new Error(Errors.SubIdDoesNotExist);
    }
    if (this.userSessions[subid][sessionId] === undefined) {
      throw new Error(Errors.SessionIdDoesNotExist);
    }
    delete this.userSessions[subid][sessionId];
  }

  public async getUserSession(r: GetUserSessionRequest): Promise<Interfaces.Atlas.Session.UserSession> {
    const { sessionId, subid } = r;
    if (this.userSessions[subid] === undefined) {
      throw new Error(Errors.SubIdDoesNotExist);
    }
    if (this.userSessions[subid][sessionId] === undefined) {
      throw new Error(Errors.SessionIdDoesNotExist);
    }
    return this.userSessions[subid][sessionId];
  }

  public async getUserSessionIds(r: GetUserSessionIdsRequest): Promise<string[]> {
    const { subid } = r;
    if (this.userSessions[subid] === undefined) {
      throw new Error(Errors.SubIdDoesNotExist);
    }
    return keys(this.userSessions[subid]);
  }

  private validateAndUpdateSession(r, type) {
    const { componentId, sessionId, subid, instanceData, state } = r;
    if (this.userSessions[subid] === undefined) {
      throw new Error(Errors.SubIdDoesNotExist);
    }
    if (this.userSessions[subid][sessionId] === undefined) {
      throw new Error(Errors.SessionIdDoesNotExist);
    }
    const component = this.userSessions[subid][sessionId].components.find((c) => c.id === componentId);
    if (!component) {
      throw new Error(Errors.ComponentIdDoesNotExist);
    }

    const session = this.userSessions[subid][sessionId];
    if (type === 'instance') {
      this.userSessions[subid][sessionId] = {
        ...session,
        components: [
          ...without(session.components, component),
          {
            ...component,
            instanceData
          }
        ]
      };
    } else if (type === 'state') {
      this.userSessions[subid][sessionId] = {
        ...session,
        components: [
          ...without(session.components, component),
          {
            ...component,
            state
          }
        ]
      };
    }
  }

  public async updateSessionComponentInstanceData(r: UpdateSessionComponentInstanceDataRequest): Promise<void> {
    this.validateAndUpdateSession(r, 'instance');
  }

  public async updateSessionComponentState(r: UpdateSessionComponentStateRequest): Promise<void> {
    this.validateAndUpdateSession(r, 'state');
  }
}
