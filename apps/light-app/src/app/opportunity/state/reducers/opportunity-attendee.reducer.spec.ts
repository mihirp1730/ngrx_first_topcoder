import * as opportunityActions from '../actions/opportunity-attendee.actions';
import { initialState } from '../opportunity-attendee.state';
import { opportunityAttendeeReducer } from './opportunity-attendee.reducer';
import * as opportunityAttendeeActions from '../actions/opportunity-attendee.actions';

describe('opportunityAttendeeReducer', () => {
  describe('unknown action', () => {
    it('should return the default state', () => {
      const action = { type: 'Unknown' };
      const state = opportunityAttendeeReducer(initialState, action);
      expect(state).toBe(initialState);
    });
  });

  describe('getOpportunities', () => {
    it('should return isLoadingWhileGetting as true', () => {
      const action = opportunityActions.getOpportunities();
      const newState = opportunityAttendeeReducer(initialState, action);
      expect(newState.isLoading).toBeTruthy();
    });
  });

  describe('getOpportunitiesSuccess', () => {
    it('should return isLoadingWhileGetting as false', () => {
      const action = opportunityActions.getOpportunitiesSuccess({ opportunities: [] });
      const newState = opportunityAttendeeReducer(initialState, action);
      expect(newState.opportunities.length).toBe(0);
    });
  });

  describe('getOpportunitiesFail', () => {
    it('should return isLoadingWhileGetting as false', () => {
      const action = opportunityActions.getOpportunitiesFail({ errorMessage: null });
      const newState = opportunityAttendeeReducer(initialState, action);
      expect(newState.isLoading).toBeFalsy;
    });
  });

  describe('getOpportunityById', () => {
    it('should set isLoading as true', () => {
      const action = opportunityActions.getOpportunityById({ opportunityId: 'someId' });
      const newState = opportunityAttendeeReducer(initialState, action);
      expect(newState.isLoading).toBeTruthy();
    });
  });

  describe('getOpportunityByIdSuccess', () => {
    it('should update opportunity', () => {
      const newInitialState = {
        ...initialState,
        opportunities: [
          {
            opportunityId: '123',
            opportunityName: 'opp name 1'
          }
        ]
      };
      const updatedOpportunity = {
        ...newInitialState.opportunities[0],
        opportunityName: 'updated name 1'
      };
      const action = opportunityActions.getOpportunityByIdSuccess({ opportunity: updatedOpportunity as any });
      const newState = opportunityAttendeeReducer(newInitialState, action);
      expect(newState.opportunities[0]).toEqual(updatedOpportunity);
      expect(newState.isLoading).toBeFalsy();
    });

    it('should insert new opportunity', () => {
      const newInitialState = {
        ...initialState,
        opportunities: [
          {
            opportunityId: '123',
            opportunityName: 'opp name 1'
          }
        ]
      };
      const newOpportunity = {
        opportunityId: '456',
        opportunityName: 'opp name 2'
      };
      const action = opportunityActions.getOpportunityByIdSuccess({ opportunity: newOpportunity as any });
      const newState = opportunityAttendeeReducer(newInitialState, action);
      expect(newState.opportunities[newState.opportunities.length - 1]).toEqual(newOpportunity);
      expect(newState.isLoading).toBeFalsy();
    });
  });

  describe('getOpportunityByIdFail', () => {
    it('should set opportunity error', () => {
      const action = opportunityActions.getOpportunityByIdFail({ errorMessage: null });
      const newState = opportunityAttendeeReducer(initialState, action);
      expect(newState.isLoading).toBeFalsy();
      expect(newState.opportunityError).toBeTruthy();
    });
  });
});

describe('userChangesAttendeeFilter', () => {
  it('should return opportunityName as null', () => {
    const filters = {
      opportunityName: null,
      accessType: null,
      host: null,
      status: null
    };
    const action = opportunityAttendeeActions.userChangesFilter(filters);
    const newState = opportunityAttendeeReducer(initialState, action);
    expect(newState.filters.opportunityName).toBeNull();
  });
});

describe('userLeavesCatalogPage', () => {
  it('should set filter to the initial state', () => {
    const action = opportunityAttendeeActions.userLeavesRequestPage();
    const newState = opportunityAttendeeReducer(initialState, action);
    expect(newState.filters).toEqual(
      expect.objectContaining({
        opportunityName: null,
        accessType: null,
        host: null,
        status: null
      })
    );
  });
});
