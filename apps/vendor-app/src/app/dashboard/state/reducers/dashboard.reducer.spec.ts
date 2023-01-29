import * as dashboardActions from '../actions/dashboard.actions';
import { initialState } from '../dashboard.state';
import { dashboardReducer } from './dashboard.reducer';

describe('MapWrapperReducer', () => {

  describe('unknown action', () => {
    it('should return the default state', () => {
      const action = { type: 'Unknown' };
      const state = dashboardReducer(initialState, action);
      expect(state).toBe(initialState);
    });
  });

  describe('userChangedFilters action', () => {
    it('should handle user filter selection of filters', () => {
      const preparedState = {
        ...initialState,
        filters: {
          status: ['Draft'],
          regions: ['Africa'],
          dataType: ['Well']
        }
      };
      const action = dashboardActions.userChangedFilters(preparedState);
      const newState = dashboardReducer(preparedState, action);
      expect(newState).toEqual({
        filters: {
          status: ['Draft'],
          regions: ['Africa'],
          dataType: ['Well']
        }
      });
    });
  });
});