import { v4 as uuid } from 'uuid';

import { TrafficManagerService } from './traffic-manager.service';

describe('TrafficManagerService', () => {
  let mockDocument: Document;
  let mockHistoryRef: History;
  let mockJwtDecodeValue: { exp: number };
  let mockJwtDecode: (token: string) => typeof mockJwtDecodeValue;
  let mockLocalStorage: Storage;
  let mockLocationRef: Location;
  let mockSetTimeoutMethod: typeof setTimeout;
  let mockSetTimeoutFactory: () => typeof setTimeout;
  let trafficManagerService: TrafficManagerService;

  beforeEach(() => {
    mockDocument = {
      title: uuid()
    } as unknown as Document;
    mockHistoryRef = {
      pushState: () => null
    } as unknown as History;
    mockJwtDecodeValue = { exp: 0 };
    mockJwtDecode = () => {
      if (mockJwtDecodeValue) {
        return mockJwtDecodeValue;
      }
      throw new Error();
    };
    mockLocalStorage = {
      getItem: () => null,
      removeItem: () => null,
      setItem: () => null,
    } as unknown as Storage;
    mockLocationRef = {
      reload: () => null
    } as unknown as Location;
    mockSetTimeoutMethod = function() {
      return null;
    } as unknown as typeof setTimeout;
    mockSetTimeoutFactory = () => mockSetTimeoutMethod;
    trafficManagerService = new TrafficManagerService(
      mockDocument,
      mockHistoryRef,
      mockJwtDecode,
      mockLocalStorage,
      mockLocationRef,
      mockSetTimeoutFactory
    );
  });

  it('should be created', () => {
    expect(trafficManagerService).toBeTruthy();
  });

  describe('initialize', () => {
    it('should reject and redirect to the traffic manager', (done) => {
      jest.spyOn(mockLocalStorage, 'getItem').mockReturnValue(uuid());
      jest.spyOn(mockLocationRef, 'toString').mockReturnValue('http://slb.com');
      jest.spyOn(trafficManagerService, 'validateTokenExpiration').mockReturnValue(false);
      trafficManagerService.initialize({
        isEnabled: true
      }).catch((err) => {
        expect(err).toBeTruthy();
        done();
      });
    });
    it('should reject and redirect to a path', (done) => {
      jest.spyOn(mockLocalStorage, 'getItem').mockReturnValue(uuid());
      jest.spyOn(mockLocationRef, 'toString').mockReturnValue('http://slb.com/create-data-package');
      jest.spyOn(trafficManagerService, 'validateTokenExpiration').mockReturnValue(false);
      trafficManagerService.initialize({
        isEnabled: true
      }).then(() => {
        throw new Error('"then" should not execute');
      }).catch((err) => {
        expect(err).toBeTruthy();
        done();
      });
    });
    it('should resolve with good validation', (done) => {
      jest.spyOn(mockLocalStorage, 'getItem').mockReturnValue(uuid());
      jest.spyOn(mockLocationRef, 'toString').mockReturnValue('http://slb.com');
      jest.spyOn(trafficManagerService, 'validateTokenExpiration').mockReturnValue(true);
      trafficManagerService.initialize({
        isEnabled: true
      }).then(() => done());
    });
    it('should reject with a bad code', (done) => {
      jest.spyOn(mockLocalStorage, 'getItem').mockReturnValue(uuid());
      jest.spyOn(mockLocationRef, 'toString').mockReturnValue('http://slb.com?traffic-manager-code=1');
      jest.spyOn(trafficManagerService, 'validateTokenExpiration').mockReturnValue(true);
      trafficManagerService.initialize({
        isEnabled: true
      }).then(() => {
        throw new Error('"then" should not execute');
      }).catch((err) => {
        expect(err).toBeTruthy();
        done();
      });
    });
    it('should reject with a bad token', (done) => {
      jest.spyOn(mockLocalStorage, 'getItem').mockReturnValue(uuid());
      jest.spyOn(mockLocationRef, 'toString').mockReturnValue([
        'http://slb.com?',
        'traffic-manager-code=200',
        '&traffic-manager-token='
      ].join(''));
      jest.spyOn(trafficManagerService, 'validateTokenExpiration').mockReturnValue(true);
      trafficManagerService.initialize({
        isEnabled: true
      }).then(() => {
        throw new Error('"then" should not execute');
      }).catch((err) => {
        expect(err).toBeTruthy();
        done();
      });
    });
    it('should resolve with setToken', (done) => {
      const mockToken = uuid();
      jest.spyOn(mockLocalStorage, 'getItem').mockReturnValue(uuid());
      jest.spyOn(mockLocationRef, 'toString').mockReturnValue([
        'http://slb.com?',
        'traffic-manager-code=200',
        `&traffic-manager-token=${mockToken}`
      ].join(''));
      jest.spyOn(trafficManagerService, 'validateTokenExpiration').mockReturnValue(true);
      const spy = jest.spyOn(trafficManagerService, 'setToken').mockImplementation();
      trafficManagerService.initialize({
        isEnabled: true
      }).then(() => {
        expect(spy).toHaveBeenCalledWith(mockToken);
        done();
      });
    });
  });

  describe('getToken', () => {
    it('should get the storage key from local storage', () => {
      const mockValue = uuid();
      const spy = jest.spyOn(mockLocalStorage, 'getItem').mockReturnValue(mockValue)
      const result = trafficManagerService.getToken();
      expect(spy).toHaveBeenCalledWith('traffic-manager-token');
      expect(result).toBe(mockValue);
    });
  });

  describe('setToken', () => {
    it('should set token into local storage and handle expiration', (done) => {
      const mockToken = uuid();
      const setItemSpy = jest.spyOn(mockLocalStorage, 'setItem').mockImplementation();
      const removeItemSpy = jest.spyOn(mockLocalStorage, 'removeItem').mockImplementation();
      const reloadSpy = jest.spyOn(mockLocationRef, 'reload').mockImplementation();
      mockJwtDecodeValue = { exp: (Date.now() / 1000) + 60 * 30 };
      mockSetTimeoutMethod = function(handler, expirationTime) {
        expect(expirationTime).toBeGreaterThan(150000 - 100);
        handler();
        expect(removeItemSpy).toHaveBeenCalledWith('traffic-manager-token');
        expect(reloadSpy).toHaveBeenCalled();
        done();
      } as unknown as typeof setTimeout;
      trafficManagerService.setToken(mockToken);
      expect(setItemSpy).toHaveBeenCalledWith('traffic-manager-token', mockToken);
    });
    it('should not set bad token ', () => {
      const mockToken = uuid();
      const spy = jest.spyOn(mockLocalStorage, 'setItem').mockImplementation();
      mockJwtDecodeValue = null;
      trafficManagerService.setToken(mockToken);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('validateTokenExpiration', () => {
    it('should set token into local storage and handle expiration', () => {
      const mockToken = uuid();
      mockJwtDecodeValue = { exp: (Date.now() / 1000) + 60 * 40 };
      const result = trafficManagerService.validateTokenExpiration(mockToken);
      expect(result).toBeTruthy();
    });
    it('should not set bad token ', () => {
      const mockToken = uuid();
      mockJwtDecodeValue = null;
      const result = trafficManagerService.validateTokenExpiration(mockToken);
      expect(result).toBeFalsy();
    });
  });

});
