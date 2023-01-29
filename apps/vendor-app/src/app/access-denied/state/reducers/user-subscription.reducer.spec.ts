import * as userSubscriptionAction from '../actions/user-subscription.action';
import { initialState } from '../user-subscription.state';
import { userAccessReducer } from './user-subscription.reducer';

describe('UserSubscription Reducer', () => {
  describe('Actions', () => {
    it('should return the default state', () => {
      const action = userSubscriptionAction.getUserSubscription();
      const state = userAccessReducer(initialState, action);
      expect(state).toBe(initialState);
    });
    it('should return the default state', () => {
      const action = userSubscriptionAction.getUserSubscriptionSuccess({ delfiAccess: true, userContext: true });
      const newState = {
        ...initialState,
        delfiAccess: true,
        userContext: true
      };
      const state = userAccessReducer(initialState, action);
      expect(state).toEqual(newState);
    });
  });
});
