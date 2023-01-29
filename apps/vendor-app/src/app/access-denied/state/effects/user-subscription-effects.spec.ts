import * as userSubscriptionActon from '../actions/user-subscription.action';

import { AT_APP_Code, UserSubscriptionService } from '@apollo/app/services/user-subscriptions';
import { ReplaySubject, of, take, throwError } from 'rxjs';

import { Action } from '@ngrx/store';
import { TestBed } from '@angular/core/testing';
import { UserAccessEffects } from './user-subscription-effects';
import { VendorAppService } from '@apollo/app/vendor';
import { mockUserSubscriptionService } from '../../../shared/services.mock';
import { provideMockActions } from '@ngrx/effects/testing';

describe('UserSubscriptionEffects', () => {
  let actions$: ReplaySubject<Action>;
  let effects: UserAccessEffects;

  beforeEach(() => {
    actions$ = new ReplaySubject(1);
    TestBed.configureTestingModule({
      providers: [
        provideMockActions(() => actions$),
        {
          provide: UserSubscriptionService,
          useValue: mockUserSubscriptionService
        },
        {
          provide: VendorAppService,
          useValue: { userContext: { crmAccountId: '2S21QQGC6J' } }
        },
        {
          provide: AT_APP_Code,
          useValue: 'assettransactionportal'
        },
        UserAccessEffects
      ]
    });

    effects = TestBed.inject(UserAccessEffects);
  });

  afterEach(() => {
    actions$.complete();
  });

  describe('getDelfiAccessDetails$', () => {
    it('should return a getUserSubscriptionSuccess action', (done) => {
      effects.getDelfiAccessDetails$.pipe(take(1)).subscribe((action) => {
        expect(action.delfiAccess).toBeTruthy();
        expect(action.userContext).toBeTruthy();
        expect(action.type).toBe('[access-denied] Access details Success');
        done();
      });
      actions$.next(userSubscriptionActon.getUserSubscription());
    });

    it('should return a getUserSubscriptionSuccess action, with no access', (done) => {
      effects.getDelfiAccessDetails$.pipe(take(1)).subscribe((action) => {
        expect(action.delfiAccess).toBeFalsy();
        expect(action.userContext).toBeFalsy();
        expect(action.type).toBe('[access-denied] Access details Success');
        done();
      });
      mockUserSubscriptionService.getUserSubscription.mockImplementation(() => throwError(new Error('')));
      actions$.next(userSubscriptionActon.getUserSubscription());
    });
    it('should return a getUserSubscriptionSuccess action, user do not have access in account', (done) => {
      effects.getDelfiAccessDetails$.pipe(take(1)).subscribe((action) => {
        expect(action.delfiAccess).toBeFalsy();
        expect(action.userContext).toBeFalsy();
        expect(action.type).toBe('[access-denied] Access details Success');
        done();
      });
      mockUserSubscriptionService.getUserSubscription.mockImplementation(() =>
        of({
          hasAcceptedTerms: true,
          userSubscriptions: []
        })
      );
      actions$.next(userSubscriptionActon.getUserSubscription());
    });
  });
});
