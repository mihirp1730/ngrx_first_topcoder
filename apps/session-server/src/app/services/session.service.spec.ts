import { Test, TestingModule } from '@nestjs/testing';
import { noop } from 'lodash';

import { SessionStorageBase } from '../providers/session-storage/session-storage.base';
import { SessionService } from './session.service';

class MockSessionStorageBase {
  deleteUserSession = noop;
  getUserSession = noop;
  getUserSessionIds = noop;
  updateSessionComponentInstanceData = noop;
  updateSessionComponentState = noop;
}

describe('SessionService', () => {
  let service: SessionService;
  let mockSessionStorageBase: SessionStorageBase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: SessionStorageBase,
          useClass: MockSessionStorageBase
        },
        SessionService
      ]
    }).compile();

    service = module.get(SessionService);
    mockSessionStorageBase = module.get(SessionStorageBase);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call delete user session', () => {
    const spy = jest.spyOn(mockSessionStorageBase, 'deleteUserSession');
    service.deleteUserSession('', '');
    expect(spy).toHaveBeenCalled();
  });

  it('should call get user session', () => {
    const spy = jest.spyOn(mockSessionStorageBase, 'getUserSession');
    service.getUserSession('', '');
    expect(spy).toHaveBeenCalled();
  });

  it('should call get user session ids', () => {
    const spy = jest.spyOn(mockSessionStorageBase, 'getUserSessionIds');
    service.getUserSessionIds('');
    expect(spy).toHaveBeenCalled();
  });

  it('should call updateSessionComponentInstanceData', () => {
    const spy = jest.spyOn(mockSessionStorageBase, 'updateSessionComponentInstanceData');
    service.postSessionComponentInstanceData('', '', '', '');
    expect(spy).toHaveBeenCalled();
  });

  it('should call updateSessionComponentState', () => {
    const spy = jest.spyOn(mockSessionStorageBase, 'updateSessionComponentState');
    service.postSessionComponentState({} as any);
    expect(spy).toHaveBeenCalled();
  });

});
