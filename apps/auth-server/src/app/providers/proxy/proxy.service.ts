import { HttpErrorResponse } from '@angular/common/http';
import { FeatureFlagService, Features } from '@apollo/server/feature-flag';
import { GaiaTraceClass } from '@apollo/tracer';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import * as buildUrl from 'build-url';
import * as crypto from 'crypto';
import * as jwtDecode from 'jwt-decode';
import { stringify } from 'querystring';
import { catchError, map } from 'rxjs/operators';

import { Config, CONFIG_TOKEN } from '../../modules/config';

@Injectable()
@GaiaTraceClass
export class ProxyService {
  constructor(
    public readonly http: HttpService,
    public readonly logger: Logger,
    @Inject(CONFIG_TOKEN) private _appConfig: Config,
    private readonly featureFlagService: FeatureFlagService
  ) {}

  public authenticate(state: string, host: string): [string, string] {
    // get target URL from request
    const nonce = crypto.randomBytes(32).toString('hex');
    let redirectUrl: string;
    const { sauthUrl, clientId, tokenAudience } = this._appConfig;
    if (host.includes('localhost')) {
      redirectUrl = 'https://localhost:4200/api/auth/callback';
    } else {
      redirectUrl = `${host}/api/auth/callback`;
    }
    const requestUrl = buildUrl(`${sauthUrl}/auth`, {
      queryParams: {
        response_type: 'code',
        client_id: clientId,
        redirect_uri: redirectUrl,
        scope: tokenAudience,
        state,
        nonce
      }
    });
    // redirect browser (application) to this sauth URL to authenticate with APP id
    return [requestUrl, nonce];
  }

  public async getSauthTokenFromCode(code: string, host: string): Promise<any> {
    const { clientId, clientSecret, tokenServiceUrl } = this._appConfig;
    let redirect_uri;
    if (host.includes('localhost')) {
      redirect_uri = 'https://localhost:4200/api/auth/callback';
    } else {
      redirect_uri = `https://${host}/api/auth/callback`;
    }
    const body = {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri
    };
    const basicAuthorizationBuffer = Buffer.from(`${clientId}:${clientSecret}`, 'utf-8');
    const basicAuthorization = basicAuthorizationBuffer.toString('base64');
    const headers = { Authorization: `Basic ${basicAuthorization}` };
    const config = { headers };

    return this.http
      .post(tokenServiceUrl, body, config)
      .pipe(
        map((response) => {
          this.logger.log('api auth: getSauthTokenFromCode executed successfully');
          return [response.data['id_token'], response.data['access_token'], response.data['refresh_token']];
        }),
        catchError((err: HttpErrorResponse) => {
          this.logger.error({ message: `Get sauth token from code error: ${JSON.stringify(err)}` });
          return err.message;
        })
      )
      .toPromise();
  }

  public async refreshToken(refreshToken: string): Promise<any> {
    const { clientId, clientSecret, tokenServiceUrl } = this._appConfig;
    const body = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    };
    const basicAuthorizationBuffer = Buffer.from(`${clientId}:${clientSecret}`, 'utf-8');
    const basicAuthorization = basicAuthorizationBuffer.toString('base64');
    const headers = { Authorization: `Basic ${basicAuthorization}` };
    const config = { headers };
    return this.http
      .post(tokenServiceUrl, body, config)
      .pipe(
        map((response) => {
          return [response.data['access_token'], response.data['refresh_token'], response.data['id_token']];
        }),
        catchError((err) => {
          this.logger.error({ message: `Refresh sauth token error: ${JSON.stringify(err)}` });
          return err.message;
        })
      )
      .toPromise();
  }

  public async tokenExchangeService(accessToken: string): Promise<any> {
    const { clientId, clientSecret, tokenServiceUrl, gisClientId } = this._appConfig;
    const body = {
      grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
      subject_token: accessToken,
      requested_token_type: 'access_token',
      audience: gisClientId
    };
    const basicAuthorizationBuffer = Buffer.from(`${clientId}:${clientSecret}`, 'utf-8');
    const basicAuthorization = basicAuthorizationBuffer.toString('base64');
    const headers = { Authorization: `Basic ${basicAuthorization}` };
    const config = { headers };
    return this.http
      .post(tokenServiceUrl, body, config)
      .pipe(
        map((response) => {
          return [response.data['access_token']];
        }),
        catchError((err) => {
          this.logger.error({ message: `Exchange token error: ${JSON.stringify(err)}` });
          return err.message;
        })
      )
      .toPromise();
  }

  public async getUserInfo(accessToken: string): Promise<any> {
    const { sauthUrl } = this._appConfig;
    const user: any = jwtDecode(accessToken);
    const subid = user.subid;

    const sauthClaimChanges = this.featureFlagService.getFeatureFlag(Features.sauthClaimChanges, subid);

    const headers = { Authorization: `Bearer ${accessToken}` };
    const config = { headers };
    this.logger.log('api auth: start getUserInfo API invoke');
    return this.http
      .get(`${sauthUrl}/userinfo`, config)
      .pipe(
        map((response) => {
          this.logger.log('api auth: success getUserInfo API invoke');
          return [
            response.data['email'],
            response.data['hd'],
            sauthClaimChanges ? response.data['given_name'] : response.data['firstname'],
            sauthClaimChanges ? response.data['family_name'] : response.data['lastname']
          ];
        }),
        catchError((err) => {
          this.logger.error({ message: `Get user info error: ${JSON.stringify(err)}` });
          return err.message;
        })
      )
      .toPromise();
  }

  public async getGuestToken(): Promise<string> {
    const { guestClientId, guestClientSecret, tokenServiceUrl, tokenAudience, clientId } = this._appConfig;
    const bearerToken = `${guestClientId}:${guestClientSecret}`;
    const bearerTokenUtf8 = Buffer.from(bearerToken, 'utf8');
    const bearerTokenBase64 = bearerTokenUtf8.toString('base64');
    try {
      const response = await this.http
        .request({
          headers: {
            Authorization: `Basic ${bearerTokenBase64}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          method: 'POST',
          url: tokenServiceUrl,
          responseType: 'json',
          data: stringify({
            grant_type: 'client_credentials',
            scope: `${tokenAudience} ${clientId}`
          })
        })
        .toPromise();
      return response?.data?.access_token ?? null;
    } catch (e) {
      this.logger.error({ message: `Get guest token error: ${JSON.stringify(e)}` });
      return null;
    }
  }

  public getLogoutURL(token: string, redirectUrl?: string) {
    let post_logout_redirect_uri;
    if (redirectUrl) {
      post_logout_redirect_uri = redirectUrl;
    } else {
      post_logout_redirect_uri = this._appConfig.postLogoutRedirectUri;
    }
    return buildUrl(`${this._appConfig.sauthUrl}/slo`, {
      queryParams: {
        id_token_hint: token,
        post_logout_redirect_uri
      }
    });
  }
}
