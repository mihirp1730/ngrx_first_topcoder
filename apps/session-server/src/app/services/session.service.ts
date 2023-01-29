import { Interfaces } from '@apollo/server/services';
import { GaiaTraceClass } from '@apollo/tracer';
import { Injectable } from '@nestjs/common';

import { SessionStorageBase, SessionStorageErrors } from '../providers/session-storage/session-storage.base';

@Injectable()
@GaiaTraceClass
export class SessionService {
  constructor(private readonly sessionStorageBase: SessionStorageBase) {
  }

  public async deleteUserSession(
    subid: string,
    sessionId: string
  ): Promise<Interfaces.Api.Session.DeleteSessionResponse> {
    let error: string = null;

    try {
      await this.sessionStorageBase.deleteUserSession({
        subid,
        sessionId
      });
    } catch (e) {
      error = e.message;
    }

    return { error };

  }

  public async getUserSession(
    subid: string,
    sessionId: string,
    createIfNotExists?: boolean
  ): Promise<Interfaces.Api.Session.GetSessionResponse> {
    let error: string = null;
    let session: Interfaces.Atlas.Session.UserSession = null;

    // Try and get the session from the storage service.
    try {
      session = await this.sessionStorageBase.getUserSession({
        subid,
        sessionId
      });
      if (session) {
        return { error, session };
      }
    } catch (e) {
      error = e.message;
    }

    // If we can create a non-existent user session, do so.
    if ((error === SessionStorageErrors.SessionIdDoesNotExist
      || error === SessionStorageErrors.SubIdDoesNotExist)
      && createIfNotExists
    ) {
      // Reset any previous error.
      error = null;
      try {
        session = await this.sessionStorageBase.createUserSession({
          subid,
          sessionId
        });
      } catch (e) {
        error = e.message;
      }
    }

    return { error, session };

  }

  public async getUserSessionIds(
    subid: string
  ): Promise<Interfaces.Api.Session.GetSessionsResponse> {
    let error: string = null;
    let ids: string[] = null;

    // Try and get the session ids from the storage service.
    try {
      ids = await this.sessionStorageBase.getUserSessionIds({
        subid
      });
      if (ids) {
        return { error, ids };
      }
    } catch (e) {
      error = e.message;
    }

    // If the user is making this call for the first time and they do not have
    // a subid in the database then go ahead and return them an empty array as
    // this is an OK error to encounter.
    if (error === SessionStorageErrors.SubIdDoesNotExist) {
      error = null;
      ids = [];
    }

    return { error, ids };

  }

  public async postSessionComponentInstanceData(
    subid: string,
    sessionId: string,
    componentId: string,
    instanceData: string
  ): Promise<Interfaces.Api.Session.PostSessionComponentInstanceDataResponse> {
    let error: string = null;

    try {
      await this.sessionStorageBase.updateSessionComponentInstanceData({
        sessionId,
        subid,
        componentId,
        instanceData
      });
    } catch (e) {
      error = e.message;
    }

    return {error};
  }

  public async postSessionComponentState(
    r: Interfaces.Api.Session.PostSessionComponentStateRequest
  ): Promise<Interfaces.Api.Session.PostSessionComponentStateResponse> {
    const {componentId, sessionId, state, subid} = r;
    let error: string = null;

    try {
      await this.sessionStorageBase.updateSessionComponentState({
        componentId,
        sessionId,
        state,
        subid
      });
    } catch (e) {
      error = e.message;
    }

    return { error };
  }

}
