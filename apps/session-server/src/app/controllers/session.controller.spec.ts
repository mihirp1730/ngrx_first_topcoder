import { ISauth } from '@apollo/server/jwt-token-middleware';
import { Enums, Interfaces } from '@apollo/server/services';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppHealthService } from '@apollo/app/health';
import { noop } from 'lodash';

import { SessionService } from '../services/session.service';
import { SessionController } from './session.controller';

const session = {
  subid: 'subid-test'
} as ISauth;

class MockSessionService {
  getUserSession = noop;
  getUserSessionIds = noop;
  deleteUserSession = noop;
  postSessionComponentState = noop;
  postSessionComponentInstanceData = noop;
}

class MockServerHealthService {
  healthCheck = jest.fn();
}

describe('Session Controller', () => {
  let controller: SessionController;
  let mockSessionService: MockSessionService;
  let mockServerHealthService: MockServerHealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionController],
      providers: [
        {
          provide: SessionService,
          useClass: MockSessionService
        },
        {
          provide: AppHealthService,
          useClass: MockServerHealthService
        }
      ]
    }).compile();

    controller = module.get(SessionController);
    mockSessionService = module.get(SessionService);
    mockServerHealthService = module.get(AppHealthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return error on getSession', () => {
    const mockResponse = { error: 'ERROR' } as Interfaces.Api.Session.GetSessionResponse;
    jest.spyOn(controller, 'getSession').mockReturnValue(Promise.resolve(mockResponse));
    return controller.getNewSession(session).catch((e) => expect(e).toEqual(mockResponse));
  });

  it('should get new session successfully', () => {
    const mockResponse = {
      error: null,
      session: {
        components: []
      }
    } as Interfaces.Api.Session.GetSessionResponse;
    jest.spyOn(controller, 'getSession').mockReturnValue(Promise.resolve(mockResponse));

    return controller.getNewSession(session).then((result) => {
      expect(result.error).toBeNull();
      expect(result.messageStatus).toEqual(Enums.Legacy.EMessageStatus.SUCCESS);
      expect(result.sessionLayout).toBeDefined();
    });
  });

  it('should return error on delete session', () => {
    const mockResponse = { error: 'ERROR' } as Interfaces.Legacy.IResponseMessage;
    jest.spyOn(controller, 'deleteSession').mockReturnValue(Promise.resolve(mockResponse));
    return controller.deleteDeleteSession(session, '').catch((e) => expect(e).toEqual(mockResponse));
  });

  it('should delete session successfully', () => {
    const mockResponse = {
      messageStatus: Enums.Legacy.EMessageStatus.SUCCESS,
      error: null
    } as Interfaces.Legacy.IResponseMessage;

    jest.spyOn(controller, 'deleteSession').mockReturnValue(Promise.resolve(mockResponse));
    return controller.deleteDeleteSession(session, '').then((result) => expect(result).toEqual(mockResponse));
  });

  it('should return component state error', () => {
    const mockResponse = {
      error: 'ERROR'
    } as Interfaces.Api.Session.PostSessionComponentStateResponse;
    const body = {} as any;
    jest.spyOn(controller, 'postSessionComponentState').mockReturnValue(Promise.resolve(mockResponse));

    return controller.postChangeSessionComponent(session, body).catch((e) => {
      expect(e.messageStatus).toEqual(Enums.Legacy.EMessageStatus.ERROR);
      expect(e.error).toMatch('ERROR');
      expect(e.sessionComponent).toBeNull();
    });
  });

  it('should return success on postChangeSessionComponent', () => {
    const stateResponse = {
      error: null
    } as Interfaces.Api.Session.PostSessionComponentStateResponse;
    jest.spyOn(controller, 'postSessionComponentState').mockReturnValue(Promise.resolve(stateResponse));

    const sessionResponse = {
      error: 'ERROR',
      session: {}
    } as Interfaces.Api.Session.GetSessionResponse;
    jest.spyOn(controller, 'getSession').mockReturnValue(Promise.resolve(sessionResponse));

    const body = {} as any;
    return controller.postChangeSessionComponent(session, body).then((e) => {
      expect(e.messageStatus).toEqual(Enums.Legacy.EMessageStatus.ERROR);
      expect(e.error).toMatch('ERROR');
      expect(e.sessionComponent).toBeNull();
    });
  });

  it('should return success on postChangeSessionComponent', () => {
    const stateResponse = {
      error: null
    } as Interfaces.Api.Session.PostSessionComponentStateResponse;
    jest.spyOn(controller, 'postSessionComponentState').mockReturnValue(Promise.resolve(stateResponse));

    const sessionResponse = {
      error: null,
      session: {
        components: []
      }
    } as Interfaces.Api.Session.GetSessionResponse;
    jest.spyOn(controller, 'getSession').mockReturnValue(Promise.resolve(sessionResponse));

    jest.spyOn(Interfaces.Legacy.Adapters, 'NewUserSessionComponentToSessionComponentInstance').mockReturnValue({} as any);

    const body = {} as any;
    return controller.postChangeSessionComponent(session, body).then((r) => {
      expect(r.messageStatus).toEqual(Enums.Legacy.EMessageStatus.SUCCESS);
      expect(r.error).toBeNull();
      expect(r.sessionComponent).not.toBeNull();
    });
  });

  it('should return postSessionComponentInstanceData error', () => {
    const mockResponse = {
      error: 'ERROR'
    } as Interfaces.Api.Session.PostSessionComponentInstanceDataResponse;
    const body = {} as any;
    jest.spyOn(controller, 'postSessionComponentInstanceData').mockReturnValue(Promise.resolve(mockResponse));
    return controller.postChangeSessionComponentInstanceData(session, body).catch((e) => {
      expect(e.messageStatus).toEqual(Enums.Legacy.EMessageStatus.ERROR), expect(e.error).toMatch('ERROR');
    });
  });

  it('should return postSessionComponentInstanceData successfully', () => {
    const mockResponse = {
      error: null
    } as Interfaces.Api.Session.PostSessionComponentInstanceDataResponse;
    const body = {} as any;
    jest.spyOn(controller, 'postSessionComponentInstanceData').mockReturnValue(Promise.resolve(mockResponse));
    return controller.postChangeSessionComponentInstanceData(session, body).then((r) => {
      expect(r.messageStatus).toEqual(Enums.Legacy.EMessageStatus.SUCCESS);
      expect(r.error).toBeNull();
    });
  });

  it('should call getUserSessionIds', () => {
    const spy = jest.spyOn(mockSessionService, 'getUserSessionIds');
    controller.getSessions(session);
    expect(spy).toHaveBeenCalled();
  });

  it('should call getUserSession', () => {
    const spy = jest.spyOn(mockSessionService, 'getUserSession');
    controller.getSession(session, '', '');
    expect(spy).toHaveBeenCalled();
  });

  it('should call deleteUserSession', () => {
    const spy = jest.spyOn(mockSessionService, 'deleteUserSession');
    controller.deleteSession(session, '');
    expect(spy).toHaveBeenCalled();
  });

  it('should return postSessionComponentState error', () => {
    const body = {} as any;
    return controller.postSessionComponentState(session, '', '', body).catch((e) => {
      expect(e.error).toMatch('An invalid state was provided.');
    });
  });

  it('should return postSessionComponentState successfully', () => {
    const body = {
      state: Enums.Atlas.Component.State.Hidden
    } as any;

    const spy = jest.spyOn(mockSessionService, 'postSessionComponentState');
    controller.postSessionComponentState(session, '', '', body);
    expect(spy).toHaveBeenCalled();
  });

  it('should call postSessionComponentInstanceData', () => {
    const spy = jest.spyOn(mockSessionService, 'postSessionComponentInstanceData');
    controller.postSessionComponentInstanceData(session, '', '', '');
    expect(spy).toHaveBeenCalled();
  });

  describe('Health Check', () => {
    it('should perform health check successfully', async () => {
      mockServerHealthService.healthCheck.mockReturnValue({ statusCode: 200, message: 'OK', error: 'No Error' });
      const res = controller.getHealthCheck('test');

      expect(res).toEqual({ statusCode: 200, message: 'OK', error: 'No Error' });
    });

    it('should raise NotFoundException for health check', async () => {
      mockServerHealthService.healthCheck.mockImplementation(() => {
        throw new NotFoundException({
          statusCode: 404,
          message: 'App Key not found in headers to make call to this /health endpoint',
          error: 'Not Found'
        });
      });

      expect(() => controller.getHealthCheck(null)).toThrow(
        new NotFoundException({
          statusCode: 404,
          message: 'App Key not found in headers to make call to this /health endpoint',
          error: 'Not Found'
        })
      );
    });
  });
});
