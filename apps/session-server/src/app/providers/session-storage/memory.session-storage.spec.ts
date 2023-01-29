import { Enums, Interfaces } from '@apollo/server/services';
import { Test, TestingModule } from '@nestjs/testing';
import * as BaseSessionStorage from './session-storage.base';
import { SessionStorageErrors as Errors } from './session-storage.base';
import { MemorySessionStorage } from './memory.session-storage';

describe('MemorySessionStorage', () => {
  let provider: MemorySessionStorage;
  let mockDefaultUserSession: Interfaces.Atlas.Session.UserSession;
  let r: BaseSessionStorage.CreateUserSessionRequest;
  let rUpdate: BaseSessionStorage.UpdateSessionComponentInstanceDataRequest;
  let rState: BaseSessionStorage.UpdateSessionComponentStateRequest;

  beforeEach(async () => {
    mockDefaultUserSession = {
      components: [
        {
          id: 'componentID',
          instanceData: 'instanceData',
          name: 'name',
          session: 'session',
          state: Enums.Atlas.Component.State.Max,
          type: Enums.Atlas.Component.Type.Module,
          types: {}
        }
      ],
      id: 'test',
      name: 'fakeName',
      user: 'user'
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: MemorySessionStorage,
          useFactory: () => {
            return new MemorySessionStorage(mockDefaultUserSession);
          }
        }
      ]
    }).compile();

    provider = module.get(MemorySessionStorage);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('should return session created', () => {
    r = { sessionId: 'testId', subid: 'testSubid' };
    return provider.createUserSession(r).then((r) => {
      expect(r).toBeDefined();
    });
  });

  it('should return session created subid', () => {
    (provider as any).userSessions['testSubid'] = { testId: 'sessionId' };
    return provider.createUserSession(r).then((r) => {
      expect(r).toBeDefined();
    });
  });

  it('should throw error if subid is undefined', () => {
    return provider.deleteUserSession(r).catch((e) => {
      expect(e).toEqual(new Error(Errors.SubIdDoesNotExist));
    });
  });

  it('should throw error if sessionId is undefined', () => {
    (provider as any).userSessions['testSubid'] = 'sessionID';
    return provider.deleteUserSession(r).catch((e) => {
      expect(e).toEqual(new Error(Errors.SessionIdDoesNotExist));
    });
  });

  it('should delete session', () => {
    (provider as any).userSessions['testSubid'] = { testId: 'sessionId' };
    expect(provider.deleteUserSession(r)).resolves.not.toThrow();
  });

  it('should throw subid error', () => {
    return provider.getUserSession(r).catch((e) => {
      expect(e).toEqual(new Error(Errors.SubIdDoesNotExist));
    });
  });

  it('should throw sessionId error', () => {
    (provider as any).userSessions['testSubid'] = 'sessionID';
    return provider.getUserSession(r).catch((e) => {
      expect(e).toEqual(new Error(Errors.SessionIdDoesNotExist));
    });
  });

  it('should return session', () => {
    (provider as any).userSessions['testSubid'] = { testId: 'sessionId' };
    return provider.getUserSession(r).then((s) => {
      expect(s).toBeDefined();
    });
  });

  it('should throw error subid does not exist', () => {
    return provider.getUserSessionIds(r).catch((e) => {
      expect(e).toEqual(new Error(Errors.SubIdDoesNotExist));
    });
  });

  it('should return sessions array', () => {
    (provider as any).userSessions['testSubid'] = { testId: 'sessionId' };
    return provider.getUserSessionIds(r).then((s) => {
      expect(s).toBeDefined();
    });
  });

  it('should throw error if subid is undefined', () => {
    rUpdate = {
      sessionId: 'testId',
      subid: undefined,
      componentId: 'component ID',
      instanceData: 'data'
    };
    return provider.updateSessionComponentInstanceData(rUpdate).catch((e) => {
      expect(e).toEqual(new Error(Errors.SubIdDoesNotExist));
    });
  });

  it('should throw error if sessionId is undefined', () => {
    rUpdate = {
      sessionId: undefined,
      subid: 'testSubid',
      componentId: 'component ID',
      instanceData: 'data'
    };
    (provider as any).userSessions['testSubid'] = { testId: 'sessionId' };
    return provider.updateSessionComponentInstanceData(rUpdate).catch((e) => {
      expect(e).toEqual(new Error(Errors.SessionIdDoesNotExist));
    });
  });

  it('should throw component does not exist error', () => {
    rUpdate = {
      sessionId: 'testId',
      subid: 'testSubid',
      componentId: 'component ID',
      instanceData: 'data'
    };

    (provider as any).userSessions['testSubid'] = { testId: 'sessionId' };
    (provider as any).userSessions['testSubid']['testId'] = { components: [] };
    return provider.updateSessionComponentInstanceData(rUpdate).catch((e) => {
      expect(e).toEqual(new Error(Errors.ComponentIdDoesNotExist));
    });
  });

  it('should update instance data', () => {
    rUpdate = {
      sessionId: 'testId',
      subid: 'testSubid',
      componentId: 'componentID',
      instanceData: 'data'
    };

    const components: Interfaces.Atlas.Component.SessionComponent[] = [
      {
        id: 'componentID',
        instanceData: 'instanceData',
        name: 'name',
        session: 'session',
        state: Enums.Atlas.Component.State.Max,
        type: Enums.Atlas.Component.Type.Module,
        types: {}
      }
    ];
    (provider as any).userSessions['testSubid'] = { testId: 'sessionId' };
    (provider as any).userSessions['testSubid']['testId'] = { components: components };
    expect(provider.updateSessionComponentInstanceData(rUpdate)).resolves.not.toThrow();
  });

  it('should throw error if subid does not exist', () => {
    rState = {
      subid: undefined,
      sessionId: 'session id',
      componentId: 'component',
      state: {} as any
    };
    return provider.updateSessionComponentState(rState).catch((e) => {
      expect(e).toEqual(new Error(Errors.SubIdDoesNotExist));
    });
  });

  it('should throw error if seesionId does not exist', () => {
    rState = {
      subid: 'subid',
      sessionId: undefined,
      componentId: 'component',
      state: {} as any
    };
    (provider as any).userSessions['subid'] = { testId: 'sessionId' };
    return provider.updateSessionComponentState(rState).catch((e) => {
      expect(e).toEqual(new Error(Errors.SessionIdDoesNotExist));
    });
  });

  it('should throw error if componentId does not exist', () => {
    rState = {
      subid: 'subid',
      sessionId: 'testId',
      componentId: 'component',
      state: {} as any
    };
    const components: Interfaces.Atlas.Component.SessionComponent[] = [
      {
        id: 'componentID',
        instanceData: 'instanceData',
        name: 'name',
        session: 'session',
        state: Enums.Atlas.Component.State.Max,
        type: Enums.Atlas.Component.Type.Module,
        types: {}
      }
    ];
    (provider as any).userSessions['subid'] = { testId: 'sessionId' };
    (provider as any).userSessions['subid']['testId'] = { components: components };
    return provider.updateSessionComponentState(rState).catch((e) => {
      expect(e).toEqual(new Error(Errors.ComponentIdDoesNotExist));
    });
  });

  it('should update session component state', () => {
    rState = {
      subid: 'subid',
      sessionId: 'testId',
      componentId: 'component',
      state: {} as any
    };
    const components: Interfaces.Atlas.Component.SessionComponent[] = [
      {
        id: 'component',
        instanceData: 'instanceData',
        name: 'name',
        session: 'session',
        state: Enums.Atlas.Component.State.Max,
        type: Enums.Atlas.Component.Type.Module,
        types: {}
      }
    ];
    (provider as any).userSessions['subid'] = { testId: 'sessionId' };
    (provider as any).userSessions['subid']['testId'] = { components: components };
    expect(provider.updateSessionComponentState(rState)).resolves.not.toThrow();
  });
});
