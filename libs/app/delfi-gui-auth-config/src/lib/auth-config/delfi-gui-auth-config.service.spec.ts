import { TestBed } from '@angular/core/testing';
import { DelfiGuiAuthConfigService } from './delfi-gui-auth-config.service';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { AuthUser, DelfiGuiAuthConfig } from '@apollo/api/interfaces';
import { v4 as uuid } from 'uuid';
import { of } from 'rxjs';

const mockAuthCodeFlowService = {
  getUser: jest.fn(() => of({})),
  signIn: jest.fn()
};

describe('DelfiGuiAuthConfigService', () => {
  let delfiGuiAuthConfigService: DelfiGuiAuthConfigService;
  const delfiGuiBaseUrlConfig = {
    delfiGuiBaseUrl: 'delfiGuiBaseUrl'
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DelfiGuiAuthConfigService,
        {
          provide: AuthCodeFlowService,
          useValue: mockAuthCodeFlowService
        },
        {
          provide: DelfiGuiAuthConfig,
          useValue: delfiGuiBaseUrlConfig
        }
      ]
    });
    delfiGuiAuthConfigService = TestBed.inject(DelfiGuiAuthConfigService);
  });

  it('should be created', () => {
    expect(delfiGuiAuthConfigService).toBeTruthy();
  });

  describe('getSauthToken', () => {
    it('should get the Sauth Token', () => {
      const mockToken = uuid();
      delfiGuiAuthConfigService.userAuth = {
        idToken: mockToken
      } as unknown as AuthUser;
      const { idToken } = delfiGuiAuthConfigService.getSauthToken();
      expect(idToken).toEqual(mockToken);
    });
    it('should not get the Sauth Token', () => {
      delfiGuiAuthConfigService.userAuth = null;
      const { idToken } = delfiGuiAuthConfigService.getSauthToken();
      expect(idToken).toEqual('');
    });
  });
});
