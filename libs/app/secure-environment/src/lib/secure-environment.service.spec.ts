/* eslint-disable @typescript-eslint/no-empty-function */
import { TestBed } from '@angular/core/testing';

import { SecureEnvironmentService } from './secure-environment.service';

describe('SecureEnvironmentService', () => {
  let service: SecureEnvironmentService;
  let xmlHttpRequest: any;

  beforeEach(() => {
    xmlHttpRequest = {
      open: () => {},
      addEventListener: (_, c) => {
        c();
      },
      readyState: undefined,
      status: undefined,
      responseText: undefined,
      send: () => {},
      setRequestHeader: () => {}
    };

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        {
          provide: SecureEnvironmentService,
          useFactory: () => {
            return new SecureEnvironmentService(() => xmlHttpRequest, 'http://test');
          }
        }
      ]
    });

    service = TestBed.inject(SecureEnvironmentService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
    expect(service.secureEnvironment).toBeUndefined();
  });

  it('should console.log when fails to load', async () => {
    const spyOnConsole = jest.spyOn(console, 'log');
    xmlHttpRequest.readyState = XMLHttpRequest.DONE;
    const accessToken = 'Bearer Token';
    await service.load(accessToken);
    expect(spyOnConsole).toHaveBeenCalledWith('Environment keys load failed');
  });

  it('should use api settings return results', async () => {
    xmlHttpRequest.readyState = XMLHttpRequest.DONE;
    xmlHttpRequest.status = 200;
    xmlHttpRequest.responseText = '{ "mapAppKey": "testMapAppKey", "test": "testValue" }';
    const accessToken = 'Bearer Token';
    await service.load(accessToken);
    expect(service.secureEnvironment).toEqual({
      mapAppKey: 'testMapAppKey',
      test: 'testValue'
    });
  });

  it('should not call endpoint if env has value', async () => {
    (service as any).env = { test: '' };
    const accessToken = 'Bearer Token';
    await service.load(accessToken);
    expect(service.secureEnvironment).toEqual({ test: '' });
  });
});
