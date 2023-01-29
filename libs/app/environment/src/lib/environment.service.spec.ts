import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { v4 as uuid } from 'uuid';

import { EnvironmentService } from './environment.service';

function mockFetch(status: number, data?: { [key: string]: string }[]) {
  const xhrMockObj = {
    open: jest.fn(),
    send: jest.fn(),
    setRequestHeader: jest.fn(),
    overrideMimeType: jest.fn(),
    readyState: 4,
    status,
    response: JSON.stringify(data),
    responseText: (data[0] as any).path
  };

  const xhrMockClass = () => xhrMockObj;

  // eslint-disable-next-line
  (window.XMLHttpRequest as any) = jest.fn().mockImplementation(xhrMockClass);

  setTimeout(() => {
    // eslint-disable-next-line
    xhrMockObj['onreadystatechange']();
  }, 0);
}

describe('environment service ', () => {
  let service: EnvironmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EnvironmentService]
    });
    service = TestBed.inject(EnvironmentService);
  });

  it('should create a EnvironmentService object', () => {
    expect(service).toBeTruthy();
  });

  describe('getHost', () => {
    it('should return the baseURI', () => {
      const baseURI = uuid();
      const mockDocument = { baseURI } as unknown as Document;
      const result = EnvironmentService.getHost(mockDocument);
      expect(result).toBe(baseURI);
    });
    it('should return the baseURI without a forward slash', () => {
      const uniqueId = uuid();
      const baseURI = `${uniqueId}/`;
      const mockDocument = { baseURI } as unknown as Document;
      const result = EnvironmentService.getHost(mockDocument);
      expect(result).toBe(uniqueId);
    });
    it('should return the baseURI without a http protocol', () => {
      const uniqueId = uuid();
      const baseURI = `http://${uniqueId}/`;
      const mockDocument = { baseURI } as unknown as Document;
      const result = EnvironmentService.getHost(mockDocument);
      expect(result).toBe(uniqueId);
    });
    it('should return the baseURI without a https protocol', () => {
      const uniqueId = uuid();
      const baseURI = `https://${uniqueId}/`;
      const mockDocument = { baseURI } as unknown as Document;
      const result = EnvironmentService.getHost(mockDocument);
      expect(result).toBe(uniqueId);
    });
  });

  describe('getEnvironment', () => {
    it('send http request', () => {
      const spy = jest.spyOn(EnvironmentService as any, 'sendHttpRequest').mockImplementationOnce(() => '');
      EnvironmentService.getEnvironment('test', [{ key: 'abc', value: 'def' }]);
      expect(spy).toHaveBeenCalled();
    });

    it('should get environment', () => {
      (EnvironmentService as any).responseCache = {
        test: '{"test": "test"}'
      };

      const env = EnvironmentService.getEnvironment('test', [{ key: 'abc', value: 'def' }]);
      expect(env).toEqual({ test: 'test' });
    });

    it('should get environment with no variables to replace', () => {
      (EnvironmentService as any).responseCache = {
        test: '{"test": "test"}'
      };

      const env = EnvironmentService.getEnvironment('test');
      expect(env).toEqual({ test: 'test' });
    });

    it('should throw error', async () => {
      try {
        await (EnvironmentService as any).sendHttpRequest('test');
      } catch(e) {
        expect(e).toBeTruthy();
      }
    });

    it('should return data', async () => {
      mockFetch(200, [{path: 'pathTest'}]);
      const response = await (EnvironmentService as any).sendHttpRequest('test');
      expect(response).toEqual('pathTest');
    });

  });

});
