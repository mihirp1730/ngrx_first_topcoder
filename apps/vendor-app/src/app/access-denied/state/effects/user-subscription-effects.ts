import { Inject, Injectable } from '@angular/core';
import { AT_APP_Code, IUserSubscriptionResponse, UserSubscriptionService } from '@apollo/app/services/user-subscriptions';
import { VendorAppService } from '@apollo/app/vendor';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as userSubscriptionActions from '../actions/user-subscription.action';

@Injectable()
export class UserAccessEffects {
  constructor(
    public readonly actions$: Actions,
    public readonly userSubscriptionService: UserSubscriptionService,
    @Inject(AT_APP_Code) private readonly assetTransactionAppCode: string,
    private vendorAppService: VendorAppService,
  ) {}

  getDelfiAccessDetails$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(userSubscriptionActions.getUserSubscription),
      switchMap(() =>
        this.userSubscriptionService.getUserSubscription().pipe(
          map((response: IUserSubscriptionResponse) => {
            const { delfiAccess, userContext } = this.validateATAccess(response);
            return userSubscriptionActions.getUserSubscriptionSuccess({ delfiAccess, userContext });
          }),
          catchError(() => {
            return of(userSubscriptionActions.getUserSubscriptionSuccess({ delfiAccess: false, userContext: false }));
          })
        )
      )
    );
  });

  validateATAccess(subscriptionResp: IUserSubscriptionResponse): { delfiAccess: boolean; userContext: boolean } {
    const userHasAccess = subscriptionResp.userSubscriptions.filter(
      (userSubscription) => userSubscription.billingAccountId === this.vendorAppService.userContext.crmAccountId
    );
    if (userHasAccess.length === 0) {
      return { delfiAccess: false, userContext: false };
    }

    const delfiAccess = !!userHasAccess.find((userSubscriptions) =>
      userSubscriptions.subscriptions.find((subscription) =>
        subscription.product.featureSets.find(
          (feature) => feature.applicationCode.toLowerCase() === this.assetTransactionAppCode.toLowerCase()
        )
      )
    );
    return { delfiAccess: delfiAccess, userContext: true };
  }
}
