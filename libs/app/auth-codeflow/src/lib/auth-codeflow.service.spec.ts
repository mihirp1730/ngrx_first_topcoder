import { Location as NgLocation } from '@angular/common';
import { AuthConfig } from '@apollo/api/interfaces';
import { BroadcastChannel, LeaderElector } from 'broadcast-channel';
import { invoke, noop, set } from 'lodash';
import { take } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

import { AuthCodeFlowService } from './auth-codeflow.service';

const MOCK_TOKEN = [
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  'eyJmaXJzdG5hbWUiOiJmaXJzdG5hbWUiLCJsYXN0bmFtZSI6Imxhc3RuYW1lIiwiZW1haWwiOiJlbWFpbCIsImhkIjoiaGQifQ',
  'xOJ9HzmWiVYHb3PvrjJdZUV_174rraCNmwIyiAJ0tsw'
].join('.');

describe('GaiaCodeFlowService', () => {
  let mockChannel: BroadcastChannel;
  let mockElector: LeaderElector;
  let authCodeFlowService: AuthCodeFlowService;
  let mockConfig: AuthConfig;
  let xmlHttpRequest: XMLHttpRequest;
  let ngLocation: NgLocation;
  let locationRef: Location;

  beforeEach(() => {
    mockChannel = {
      onmessage: null,
      postMessage: () => null
    } as unknown as BroadcastChannel;
    mockElector = {
      awaitLeadership: () => Promise.resolve(),
      onduplicate: null,
    } as unknown as LeaderElector;
    mockConfig = {
      authProxyApi: 'http://www.authproxyapi.com',
      timeoutInterval: 15
    };
    xmlHttpRequest = {
      open: noop,
      overrideMimeType: noop,
      send: noop,
      status: undefined,
      responseText: undefined
    } as unknown as XMLHttpRequest;
    ngLocation = {
      prepareExternalUrl: () => '/map'
    } as unknown as NgLocation;
    locationRef = {
      assign: noop,
      reload: noop
    } as unknown as Location;
    authCodeFlowService = new AuthCodeFlowService(
      mockChannel,
      mockElector,
      mockConfig,
      () => xmlHttpRequest,
      ngLocation,
      locationRef
    );
  });

  it('should be initialized', () => {
    expect(authCodeFlowService).toBeTruthy();
  });

  it('should handle channel messages', () => {
    const mockMessage = uuid()
    const spy = jest.spyOn(authCodeFlowService, 'handleChannelMessage').mockImplementation();
    mockChannel.onmessage(mockMessage);
    expect(spy).toHaveBeenCalledWith(mockMessage);
  });

  it('should handle elector duplicates', () => {
    const spy = jest.spyOn(locationRef, 'reload').mockImplementation();
    invoke(mockElector, 'onduplicate');
    expect(spy).toHaveBeenCalled();
  });

  describe('handleChannelMessage', () => {
    it('should handle refreshes', () => {
      const spy = jest.spyOn(locationRef, 'reload').mockImplementation();
      authCodeFlowService.handleChannelMessage('Refresh token finished');
      expect(spy).toHaveBeenCalled();
    });
    it('should update if leader', () => {
      authCodeFlowService.isLeader = true;
      authCodeFlowService.handleChannelMessage('New leader is set');
      expect(authCodeFlowService.isLeader).toBeFalsy();
    });
    it('should handle sign out', () => {
      const spy = jest.spyOn(locationRef, 'reload').mockImplementation();
      authCodeFlowService.handleChannelMessage('User sign out');
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('init', () => {
    it('should call the XMLHttpRequest', () => {
      const spy = jest.spyOn(xmlHttpRequest, 'send').mockImplementation();
      authCodeFlowService.init();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('signIn', () => {
    it('should re-assign the location', async () => {
      const spy = jest.spyOn(locationRef, 'assign').mockImplementation();
      expect(await authCodeFlowService.signIn()).toBeNull();
      expect(spy).toHaveBeenCalledWith('http://www.authproxyapi.com/login?state=xxx;%2Fmap');
    });
  });

  describe('signOut', () => {
    it('should re-assign the location', async () => {
      const mockIdToken = uuid();
      const channelSpy = jest.spyOn(mockChannel, 'postMessage').mockImplementation();
      const spy = jest.spyOn(locationRef, 'assign').mockImplementation();
      jest.spyOn(authCodeFlowService.user$, 'getValue').mockReturnValue({
        idToken: mockIdToken
      } as any);
      expect(await authCodeFlowService.signOut()).toBe(undefined);
      expect(channelSpy).toHaveBeenCalledWith('User sign out');
      expect(spy).toHaveBeenCalledWith(`http://www.authproxyapi.com/logout?id_token=${mockIdToken}`);
    });

    it('should re-assign the location with redirect url', async () => {
      const mockIdToken = uuid();
      const channelSpy = jest.spyOn(mockChannel, 'postMessage').mockImplementation();
      const spy = jest.spyOn(locationRef, 'assign').mockImplementation();
      jest.spyOn(authCodeFlowService.user$, 'getValue').mockReturnValue({
        idToken: mockIdToken
      } as any);
      expect(await authCodeFlowService.signOut('test')).toBe(undefined);
      expect(channelSpy).toHaveBeenCalledWith('User sign out');
      expect(spy).toHaveBeenCalledWith(`http://www.authproxyapi.com/logout?id_token=${mockIdToken}&redirect_url=test`);
    });
  });

  describe('checkUserTokenInfo', () => {
    it('should emit a stream of user data', (done) => {
      authCodeFlowService.getUser()
        .pipe(take(1))
        .subscribe((user) => {
          expect(user.accessToken).toBe(MOCK_TOKEN);
          authCodeFlowService.isSignedIn()
            .pipe(take(1))
            .subscribe((value) => {
              console.log(value);
              done();
            });
        });
      set(xmlHttpRequest, 'status', 200);
      set(xmlHttpRequest, 'responseText', JSON.stringify({
        access_token: MOCK_TOKEN
      }));
      authCodeFlowService.checkUserTokenInfo();
    });
    it('should identify user as non-signed in user when HTTP request errors', (done) => {
      authCodeFlowService.getUser()
        .pipe(take(1))
        .subscribe((user) => {
          expect(user.accessToken).toBe('');
          expect(user.isGuest).toBe(false);
          authCodeFlowService.isSignedIn()
            .pipe(take(1))
            .subscribe((value) => {
              console.log(value);
              done();
            });
        });
      set(xmlHttpRequest, 'status', 400);
      authCodeFlowService.checkUserTokenInfo();
    });
  });

});
