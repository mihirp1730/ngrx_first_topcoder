import { GaiaTraceClass } from '@apollo/tracer';
import { Inject, Injectable } from '@nestjs/common';
import * as request from 'request-promise-native';

import { Config, CONFIG_TOKEN } from '../../modules/config';
import { LOCAL_USER, LOCAL_USER_SUBSCRIPTIONS } from './local-user.constants';
import { ResponseUserSubscription, UserProfile, UserValidationData } from './user.models';

/**
 * Handles the HTTP requests for the AccountValidatorService.
 *
 * Based from call-validation-service "defaultContextFunctions".
 */
@Injectable()
@GaiaTraceClass
export class AccountValidatorDataService {
  private _http: request.RequestPromiseAPI;

  /**
   * Gets the local "mocked" user profile and subscription data, with verification as passed.
   *
   * Intended for for local/development usage.
   */
  static getLocalUserValidatedData(): UserValidationData {
    return {
      pass: true,
      userProfile: LOCAL_USER,
      subscriptions: LOCAL_USER_SUBSCRIPTIONS
    };
  }

  constructor(@Inject(CONFIG_TOKEN) private _appConfig: Config) {
    this._http = request;
  }

  /**
   * Gets a valid account name response from the external CCM service.
   *
   * Rejects if account name was missing on response.
   */
  async requestUserProfile(authorizationToken: string): Promise<UserProfile> {
    const { ccmServiceHost, ccmAppKey } = this._appConfig;
    const reqOptions: request.OptionsWithUrl = {
      json: true,
      method: 'GET',
      url: `${ccmServiceHost}/userContext/v1/currentContext`,
      headers: {
        accept: 'application/json',
        appkey: ccmAppKey,
        authorization: `Bearer ${authorizationToken}`,
        'cache-control': 'no-cache'
      }
    };

    const response = await this._http.get(reqOptions);
    if (response?.account?.name) {
      return response;
    }
    throw new Error(`Missing account name in the response [${response}]`);
  }

  /**
   * Gets a valid list response from the external CCM service.
   */
  async requestUserSubscriptions(authorizationToken: string): Promise<ResponseUserSubscription[]> {
    const { ccmAppCode, ccmServiceHost, ccmAppKey } = this._appConfig;
    const reqOptions = {
      json: true,
      method: 'GET',
      qs: {
        appCode: ccmAppCode
      },
      url: `${ccmServiceHost}/userSubscription/v1/userSubscriptions`,
      headers: {
        accept: 'application/json',
        appkey: ccmAppKey,
        authorization: `Bearer ${authorizationToken}`,
        'cache-control': 'no-cache'
      }
    };

    const response = await this._http.get(reqOptions);
    if (!Array.isArray(response)) {
      return [];
    }
    return response;
  }
}
