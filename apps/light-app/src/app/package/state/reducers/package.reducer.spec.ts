import { DataPackage } from '@apollo/api/data-packages/consumer';
import { v4 as uuid } from 'uuid';

import * as packageActions from '../actions/package.actions';
import { initialState } from '../package.state';
import { packageReducer } from './package.reducer';

describe('PackageReducer', () => {
  describe('unknown action', () => {
    it('should return the default state', () => {
      const action = { type: 'Unknown' };
      const state = packageReducer(initialState, action);
      expect(state).toBe(initialState);
    });
  });

  describe('loadedSelectedPackage', () => {
    it('should return the state if the action is null', () => {
      const mockAction = { dataPackage: null };
      const action = packageActions.loadedSelectedPackage(mockAction);
      const newState = packageReducer(initialState, action);
      expect(newState).toBe(initialState);
    });
    it('should return the state if the action is out of sync with what is selected', () => {
      const dataPackageId = uuid();
      const mockAction = { dataPackage: { dataPackageId } as unknown as DataPackage };
      const preparedState = {
        ...initialState,
        selectedProfileId: uuid()
      };
      const action = packageActions.loadedSelectedPackage(mockAction);
      const newState = packageReducer(preparedState, action);
      expect(newState).toBe(preparedState);
    });
    it('should update the selectedPackage', () => {
      const dataPackageId = uuid();
      const mockAction = { dataPackage: { dataPackageId } as unknown as DataPackage };
      const preparedState = {
        ...initialState,
        selectedProfileId: dataPackageId
      };
      const action = packageActions.loadedSelectedPackage(mockAction);
      const newState = packageReducer(preparedState, action);
      expect(newState).not.toBe(preparedState);
      expect(newState.selectedPackage).toBe(mockAction.dataPackage);
    });
  });

  describe('userNavigatedAwayFromPackage action', () => {
    it('should clear the selected profile id', () => {
      const preparedState = {
        ...initialState,
        selectedProfileId: uuid()
      };
      const action = packageActions.userNavigatedAwayFromPackage();
      const newState = packageReducer(preparedState, action);
      expect(newState).not.toBe(preparedState);
      expect(newState).toEqual({
        ...preparedState,
        selectedProfileId: null
      });
    });
  });

  describe('userRequestsPackageSubscription', () => {
    it('should set selectedPackageRequesting to true', () => {
      const comment = uuid();
      const company = uuid();
      const action = packageActions.userRequestsPackageSubscription({ comment, company });
      const newState = packageReducer(initialState, action);
      expect(initialState.selectedPackageRequesting).not.toBe(true);
      expect(newState).not.toBe(initialState);
      expect(newState.selectedPackageRequesting).toBe(true);
    });
  });

  describe('userRequestsPackageSubscriptionCompleted', () => {
    it('should reset selectedPackageRequesting', () => {
      const action = packageActions.userRequestsPackageSubscriptionCompleted();
      const preparedState = {
        ...initialState,
        selectedPackageRequesting: true
      };
      const newState = packageReducer(preparedState, action);
      expect(newState).not.toBe(preparedState);
      expect(newState.selectedPackageRequesting).toBe(null);
    });
  });

  describe('userRequestsPackageSubscriptionWithError', () => {
    it('should reset selectedPackageRequesting', () => {
      const errorMessage = uuid();
      const action = packageActions.userRequestsPackageSubscriptionWithError({ errorMessage });
      const preparedState = {
        ...initialState,
        selectedPackageRequesting: true
      };
      const newState = packageReducer(preparedState, action);
      expect(newState).not.toBe(preparedState);
      expect(newState.selectedPackageRequesting).toBe(null);
    });
  });

  describe('userSelectedPackage action', () => {
    it('should set the selected profile id', () => {
      const id = uuid();
      const action = packageActions.userSelectedPackage({ id });
      const newState = packageReducer(initialState, action);
      expect(newState).not.toBe(initialState);
      expect(newState).toEqual({
        ...initialState,
        selectedProfileId: id
      });
    });
  });
});
