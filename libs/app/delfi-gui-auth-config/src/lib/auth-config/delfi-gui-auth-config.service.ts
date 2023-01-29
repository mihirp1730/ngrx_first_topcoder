import { Injectable, InjectionToken } from '@angular/core';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { AuthUser, DelfiGuiAuthConfig } from '@apollo/api/interfaces';
import { ContextModel } from '@delfi-gui/components/lib/model/context.model';

export const DELFI_USER_CONTEXT = new InjectionToken<ContextModel>('DelfiUserContext');

@Injectable({
  providedIn: 'root'
})
export class DelfiGuiAuthConfigService {
  apiBaseUrl: string;
  userAuth: AuthUser;

  constructor(
    private readonly config: DelfiGuiAuthConfig,
    private authCodeFlowService: AuthCodeFlowService
  ) {
    this.authCodeFlowService.getUser().subscribe((user) => {
      this.userAuth = user;
    });
    this.apiBaseUrl = this.config.delfiGuiBaseUrl;
  }

  public getSauthToken(): { idToken: string } {
    if (this.userAuth) {
      return { idToken: this.userAuth.idToken };
    } else {
      return { idToken: '' };
    }
  }
}
