import { GaiaTraceClass } from '@apollo/tracer';
import { Inject, Injectable, Logger } from '@nestjs/common';
import * as NodeCache from 'node-cache';

import { Config, CONFIG_TOKEN } from '../../modules/config';
import { ValidatorAbstract } from '../classes/validator.abstract';
import { AccountValidatorDataService } from './account-validator-data.service';
import { ResponseUserSubscription, UserProfile, UserSubscription, UserSubsProductsPartNumbers, UserValidationData } from './user.models';

interface AccountValidatorOptions {
  authorizationToken: string;
  userId: string;
}

/**
 * Handles validation of an User ID (by checking cache of previously verified User ID)
 * or verification (by checking external services to see if user matches values as specified from CCM env. variables),
 * given an User ID (usually coming from a JWT) and an authorization string coming from the client.
 *
 * Based from call-validation-service.
 */
@Injectable()
@GaiaTraceClass
export class AccountValidatorService extends ValidatorAbstract<AccountValidatorOptions> {
  /**
   * A local "mocked" user profile and subscription data object, with verification as passed.
   * Intended for for local/development usage.
   */
  static readonly LOCAL_USER_VALIDATED_DATA: UserValidationData = AccountValidatorDataService.getLocalUserValidatedData();

  constructor(
    @Inject(CONFIG_TOKEN) private _appConfig: Config,
    private _dataService: AccountValidatorDataService,
    logger: Logger,
    nodeCache: NodeCache
  ) {
    super(logger, nodeCache);
  }

  public async validate(options: AccountValidatorOptions): Promise<any> {
    return this._getAndCacheValidationResult(options.authorizationToken, options.userId);
  }

  protected _getCacheKey(userId: string): string {
    return `validation-result-${userId}`;
  }

  protected async createSubscriptionsList(currentAccount: UserProfile, authorizationToken: string): Promise<UserSubscription[]> {
    const subscriptions: UserSubscription[] = [];
    const userSubscriptionsList = await this._dataService.requestUserSubscriptions(authorizationToken);
    userSubscriptionsList
      .filter((acct: ResponseUserSubscription) => acct.billingAccountId === currentAccount.account.billingAccountId)
      .forEach((account: ResponseUserSubscription) => {
        if (Object.hasOwnProperty.call(account, 'subscriptions') && account.subscriptions.length > 0) {
          subscriptions.push(...account.subscriptions.filter(
            (subs: UserSubscription) => subs.region.toLowerCase() === this._appConfig.regionIdentifier
          ));
        }
      });
    return subscriptions;
  }

  private async _getAndCacheValidationResult(authorizationToken: string, userId: string): Promise<UserValidationData> {
    this._logger.log({ message: 'validating user authorization', userId });

    // Check if User ID exists on validated cache.
    const cacheKey = this._getCacheKey(userId);
    const fromCache = this._nodeCache.get<UserValidationData>(cacheKey);
    if (fromCache && fromCache.pass === true) {
      this._logger.log({ message: `Account validation result from cache. Result: ${JSON.stringify(fromCache)}` });
      return fromCache;
    }

    // Get commonly used configuration variables.
    const { correctAccountNames, ccmPartNumbers } = this._appConfig;

    let userProfile: UserProfile;
    try {
      userProfile = await this._dataService.requestUserProfile(authorizationToken);
    } catch (error) {
      this._logger.log({ message: `Account retrieval failed with error: ${error}` });

      return { pass: false };
    }

    // Account is valid if:
    // - If `correctAccountNames` (from env. variables (from app config.)) include the user profile's account name,
    // - OR if `correctAccountNames` were NOT specified.
    const isAccountValid = correctAccountNames.length > 0 ? correctAccountNames.includes(userProfile.account.name) : true;
    this._logger.log({ correctAccountNames, message: `Account validation finished. Result :  ${isAccountValid}` });

    // Account is considered subscribed if:
    // - If `ccmPartNumbers` (from env. variables (from app config.)) matches any
    //   from the user subscriptions (which are requested only if `ccmPartNumbers` are specified),
    const userSubsPartNumbers: UserSubsProductsPartNumbers =
      ccmPartNumbers.length > 0 ? await this._getUserSubsProductsPartNumbers(authorizationToken) : [];
    const isSubscribed = userSubsPartNumbers.some(partNum => ccmPartNumbers.includes(partNum));
    this._logger.log({ message: `Subscription validation finished. Result :  ${isSubscribed}`, userSubsPartNumbers, ccmPartNumbers });

    // Extracting subscription data from `ResponseUserSubscription` to send with userAccount
    // subscriptions type = UserSubscription[] instead of `userSubsPartNumbers`
    const userSubscriptions = await this.createSubscriptionsList(userProfile, authorizationToken);
    this._logger.log({ message: `Get user subscriptions finished.` });
    const userAccount = { pass: isAccountValid && isSubscribed, userProfile, subscriptions: userSubscriptions };

    this._nodeCache.set(cacheKey, userAccount, this._appConfig.validationCacheExpiration);
    return userAccount;
  }

  /**
   * Gets the part numbers of the user subscriptions products by making an external HTTP request.
   */
  private async _getUserSubsProductsPartNumbers(authorizationToken: string): Promise<UserSubsProductsPartNumbers> {
    this._logger.log({ message: 'Start getUserSubsProdcutsPartNumbers.'});
    const userSubscriptionsList = await this._dataService.requestUserSubscriptions(authorizationToken);

    // Process the list of user subscriptions, extracting their product part numbers from it.

    /** Part numbers (seems alphanumeric), to avoid duplicates. */
    const partNumbersAsSet: Set<string> = new Set();
    for (const userSubsData of userSubscriptionsList) {
      if (!Array.isArray(userSubsData.subscriptions)) {
        break;
      }
      for (const sub of userSubsData.subscriptions) {
        if (sub?.product?.partNumber) {
          partNumbersAsSet.add(sub.product.partNumber);
        }
      }
    }

    return Array.from(partNumbersAsSet);
  }
}
