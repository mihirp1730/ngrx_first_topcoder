import { ISauth } from '@apollo/server/jwt-token-middleware';
import { Enums, Interfaces } from '@apollo/server/services';
import { AppHealthService } from '@apollo/app/health';
import { GaiaTraceMethod } from '@apollo/tracer';
import { Body, Controller, Delete, Get, Param, Post, Query, Session, Headers } from '@nestjs/common';
import { includes } from 'lodash';

import { SessionService } from '../services/session.service';

@Controller()
export class SessionController {
  constructor(private readonly sessionService: SessionService, private readonly appHealthService: AppHealthService) {}

  @Get('/session/health')
  @GaiaTraceMethod
  public getHealthCheck(@Headers('appKey') appKey: string): any {
    return this.appHealthService.healthCheck(appKey);
  }

  // Legacy endpoints:

  @Get('NewSession')
  @GaiaTraceMethod
  public async getNewSession(@Session() sauth: ISauth): Promise<Interfaces.Legacy.ISessionLayoutResponseMessage> {
    // Try and get a "default" session, creating one if one does not exist.
    const response = await this.getSession(sauth, 'default', 'true');

    // If there was any sort of error, including any error creating a new session, handle here.
    if (response.error) {
      return {
        error: response.error,
        messageStatus: Enums.Legacy.EMessageStatus.ERROR,
        sessionLayout: null
      };
    }

    // Convert new session components to legacy components.
    const components = response.session.components.map(Interfaces.Legacy.Adapters.NewUserSessionComponentToSessionComponentInstance);

    // We need to return a "legacy" session layout until the client is updated.
    return {
      error: null,
      messageStatus: Enums.Legacy.EMessageStatus.SUCCESS,
      sessionLayout: {
        components,
        sessionLayoutKey: response.session.id,
        systemLayoutKey: '', // This has never been used / no plan to use.
        user: sauth.email
      }
    };
  }

  @Delete('DeleteSession/:sessionLayoutKey')
  @GaiaTraceMethod
  public async deleteDeleteSession(
    @Session() sauth: ISauth,
    @Param('sessionLayoutKey') sessionLayoutKeyParam: string
  ): Promise<Interfaces.Legacy.IResponseMessage> {
    const response = await this.deleteSession(sauth, sessionLayoutKeyParam);
    if (response.error) {
      return {
        messageStatus: Enums.Legacy.EMessageStatus.ERROR,
        error: response.error
      };
    }
    return {
      messageStatus: Enums.Legacy.EMessageStatus.SUCCESS,
      error: null
    };
  }

  @Post('ChangeSessionComponent')
  @GaiaTraceMethod
  public async postChangeSessionComponent(
    @Session() sauth: ISauth,
    @Body() body: Interfaces.Legacy.IChangeSessionComponentRequest
  ): Promise<Interfaces.Legacy.ISessionComponentResponseMessage> {
    const { sessionComponentKey, sessionLayoutKey } = body;
    const state = Interfaces.Legacy.Adapters.LegacyComponentStateToNewComponentState(body.state);
    // First, update the component's state with the new endpoint.
    const componentStateResponse = await this.postSessionComponentState(sauth, sessionLayoutKey, sessionComponentKey, { state } as any);
    if (componentStateResponse.error) {
      return {
        messageStatus: Enums.Legacy.EMessageStatus.ERROR,
        error: componentStateResponse.error,
        sessionComponent: null
      };
    }
    // Lastly, get the newly updated session to get the updated component in order
    // satisfy the old endpoint interface.
    const sessionResponse = await this.getSession(sauth, sessionLayoutKey);
    if (sessionResponse.error) {
      return {
        messageStatus: Enums.Legacy.EMessageStatus.ERROR,
        error: sessionResponse.error,
        sessionComponent: null
      };
    }
    // With the session, get the updated component, and pass it back to the
    // legacy consumer.
    const targetComponent = sessionResponse.session.components.find((c) => c.id === sessionComponentKey);
    const sessionComponentInstance = Interfaces.Legacy.Adapters.NewUserSessionComponentToSessionComponentInstance(targetComponent);
    return {
      messageStatus: Enums.Legacy.EMessageStatus.SUCCESS,
      error: null,
      sessionComponent: sessionComponentInstance
    };
  }

  // // This legacy endpoint from gaia-atlas-service has never been used.
  // @Post('ChangeSessionComponents')
  // public async postChangeSessionComponents(
  //   @Session() sauth: ISauth,
  //   @Body() body: Interfaces.Legacy.IChangeSessionComponentCollectionRequest
  // ): Promise<Interfaces.Legacy.ISessionComponentResponseMessage[]> {
  //   return null;
  // }

  @Post('ChangeSessionComponentInstanceData')
  @GaiaTraceMethod
  public async postChangeSessionComponentInstanceData(
    @Session() sauth: ISauth,
    @Body() body: Interfaces.Legacy.IChangeSessionComponentInstanceDataRequest
  ): Promise<Interfaces.Legacy.IResponseMessage> {
    const { instanceData, sessionComponentKey, sessionLayoutKey } = body;
    const response = await this.postSessionComponentInstanceData(sauth, sessionLayoutKey, sessionComponentKey, instanceData);
    if (response.error) {
      return {
        messageStatus: Enums.Legacy.EMessageStatus.ERROR,
        error: response.error
      };
    }
    return {
      messageStatus: Enums.Legacy.EMessageStatus.SUCCESS,
      error: null
    };
  }

  // New endpoints:
  // Move the `session/` prefix of these paths to the controller once the legacy
  // endpoints above have been deprecated and removed.

  @Get('session/sessions')
  @GaiaTraceMethod
  public async getSessions(@Session() sauth: ISauth): Promise<Interfaces.Api.Session.GetSessionsResponse> {
    const { subid } = sauth;
    return this.sessionService.getUserSessionIds(subid);
  }

  @Get('session/:sessionId')
  public async getSession(
    @Session() sauth: ISauth,
    @Param('sessionId') sessionId: string,
    @Query('createIfNotExists') createIfNotExists?: string
  ): Promise<Interfaces.Api.Session.GetSessionResponse> {
    const { subid } = sauth;
    return this.sessionService.getUserSession(subid, sessionId, !!createIfNotExists);
  }

  @Delete('session/:sessionId')
  @GaiaTraceMethod
  public async deleteSession(
    @Session() sauth: ISauth,
    @Param('sessionId') sessionId: string
  ): Promise<Interfaces.Api.Session.DeleteSessionResponse> {
    const { subid } = sauth;
    return this.sessionService.deleteUserSession(subid, sessionId);
  }

  @Post('session/:sessionId/component/:componentId/state')
  @GaiaTraceMethod
  public async postSessionComponentState(
    @Session() sauth: ISauth,
    @Param('sessionId') sessionId: string,
    @Param('componentId') componentId: string,
    @Body() body: Interfaces.Api.Session.PostSessionComponentStateRequest
  ): Promise<Interfaces.Api.Session.PostSessionComponentStateResponse> {
    const { subid } = sauth;
    const state = body.state;
    if (!includes(Enums.Atlas.Component.State, state)) {
      return {
        error: 'An invalid state was provided.'
      };
    }
    return this.sessionService.postSessionComponentState({
      componentId,
      sessionId,
      state,
      subid
    });
  }

  @Post('session/:sessionId/component/:componentId/instanceData')
  @GaiaTraceMethod
  public async postSessionComponentInstanceData(
    @Session() sauth: ISauth,
    @Param('sessionId') sessionId: string,
    @Param('componentId') componentId: string,
    @Body() instanceData: string
  ): Promise<Interfaces.Api.Session.PostSessionComponentInstanceDataResponse> {
    const { subid } = sauth;
    return this.sessionService.postSessionComponentInstanceData(subid, sessionId, componentId, instanceData);
  }
}
