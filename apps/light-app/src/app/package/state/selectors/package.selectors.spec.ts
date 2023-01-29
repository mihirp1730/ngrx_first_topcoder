import { v4 as uuid } from 'uuid';

import * as packageSelectors from './package.selectors';

describe('state selectors', () => {
  describe('selectSelectedProfileId', () => {
    it('should select selectedProfileId from the provided state', () => {
      const selectedProfileId = uuid();
      const state = { selectedProfileId };
      const selection = packageSelectors.selectSelectedProfileId.projector(state);
      expect(selection).toBe(selectedProfileId);
    });
  });
  describe('selectSelectedPackageProfileVendorId', () => {
    it('should return the vendor id', () => {
      const vendorId = uuid();
      const state = { selectedPackageProfile: { vendorId } };
      const selection = packageSelectors.selectSelectedPackageProfileVendorId.projector(state);
      expect(selection).toBe(vendorId);
    });
    it('should return null upon missing data', () => {
      const state = {};
      const selection = packageSelectors.selectSelectedPackageProfileVendorId.projector(state);
      expect(selection).toBe(null);
    });
  });
  describe('selectSelectedPackage', () => {
    it('should return selectedPackage', () => {
      const selectedPackage = uuid();
      const state = { selectedPackage };
      const selection = packageSelectors.selectSelectedPackage.projector(state);
      expect(selection).toBe(selectedPackage);
    });
  });
  describe('selectSelectedPackageSubscription', () => {
    it('should return subscription', () => {
      const subscription = uuid();
      const state = { subscription };
      const selection = packageSelectors.selectSelectedPackageSubscription.projector(state);
      expect(selection).toBe(subscription);
    });
    it('should default to null', () => {
      const state = {};
      const selection = packageSelectors.selectSelectedPackageSubscription.projector(state);
      expect(selection).toBe(null);
    });
  });
  describe('selectSelectedPackageSubscriptionStatus', () => {
    it('should return status', () => {
      const status = uuid();
      const state = { status };
      const selection = packageSelectors.selectSelectedPackageSubscriptionStatus.projector(state);
      expect(selection).toBe(status);
    });
    it('should default to null', () => {
      const state = {};
      const selection = packageSelectors.selectSelectedPackageSubscriptionStatus.projector(state);
      expect(selection).toBe(null);
    });
  });
  describe('selectSelectedPackageSubscriptionStartTime', () => {
    it('should return start time', () => {
      const subscriptionStartTime = uuid();
      const state = { subscriptionStartTime };
      const selection = packageSelectors.selectSelectedPackageSubscriptionStartTime.projector(state);
      expect(selection).toBe(subscriptionStartTime);
    });
    it('should default to null', () => {
      const state = {};
      const selection = packageSelectors.selectSelectedPackageSubscriptionStartTime.projector(state);
      expect(selection).toBe(null);
    });
  });
  describe('selectSelectedPackageSubscriptionEndTime', () => {
    it('should return end time', () => {
      const subscriptionEndTime = uuid();
      const state = { subscriptionEndTime };
      const selection = packageSelectors.selectSelectedPackageSubscriptionEndTime.projector(state);
      expect(selection).toBe(subscriptionEndTime);
    });
    it('should default to null', () => {
      const state = {};
      const selection = packageSelectors.selectSelectedPackageSubscriptionEndTime.projector(state);
      expect(selection).toBe(null);
    });
  });
  describe('selectSelectedPackageSubscriptionLastRequestTime', () => {
    it('should return last request time', () => {
      const lastRequestTime = uuid();
      const state = { lastRequestTime };
      const selection = packageSelectors.selectSelectedPackageSubscriptionLastRequestTime.projector(state);
      expect(selection).toBe(lastRequestTime);
    });
    it('should default to null', () => {
      const state = {};
      const selection = packageSelectors.selectSelectedPackageSubscriptionLastRequestTime.projector(state);
      expect(selection).toBe(null);
    });
  });
  describe('selectSelectedPackageDownloading', () => {
    it('should return selected package downloading', () => {
      const selectedPackageDownloading = uuid();
      const state = { selectedPackageDownloading };
      const selection = packageSelectors.selectSelectedPackageDownloading.projector(state);
      expect(selection).toBe(selectedPackageDownloading);
    });
  });
  describe('selectSelectedPackageRequesting', () => {
    it('should return selectedPackageRequesting', () => {
      const selectedPackageRequesting = uuid();
      const state = { selectedPackageRequesting };
      const selection = packageSelectors.selectSelectedPackageRequesting.projector(state);
      expect(selection).toBe(selectedPackageRequesting);
    });
  });
});

describe('state deductions', () => {
  describe('deduceHasProfileSelected', () => {
    it('should return false on null', () => {
      const result = packageSelectors.deduceHasProfileSelected.projector(null);
      expect(result).toBe(false);
    });
    it('should return true on anything non-null', () => {
      const result = packageSelectors.deduceHasProfileSelected.projector(uuid());
      expect(result).toBe(true);
    });
  });
  describe('deduceSelectedPackageSubscriptionStartTimeDate', () => {
    it('should return null on bad data', () => {
      const result = packageSelectors.deduceSelectedPackageSubscriptionStartTimeDate.projector(null);
      expect(result).toBe(null);
    });
    it('should return a date object on non-null', () => {
      const mockDate = new Date();
      const mockDateString = mockDate.toISOString();
      const result = packageSelectors.deduceSelectedPackageSubscriptionStartTimeDate.projector(mockDateString);
      expect(result.getTime()).toBe(mockDate.getTime());
    });
  });
  describe('deduceSelectedPackageSubscriptionEndTimeDate', () => {
    it('should return null on bad data', () => {
      const result = packageSelectors.deduceSelectedPackageSubscriptionEndTimeDate.projector(null);
      expect(result).toBe(null);
    });
    it('should return a date object on non-null', () => {
      const mockDate = new Date();
      const mockDateString = mockDate.toISOString();
      const result = packageSelectors.deduceSelectedPackageSubscriptionEndTimeDate.projector(mockDateString);
      expect(result.getTime()).toBe(mockDate.getTime());
    });
  });
  describe('deduceSelectedPackageSubscriptionLastRequestTimeDate', () => {
    it('should return null on bad data', () => {
      const result = packageSelectors.deduceSelectedPackageSubscriptionLastRequestTimeDate.projector(null);
      expect(result).toBe(null);
    });
    it('should return a date object on non-null', () => {
      const mockDate = new Date();
      const mockDateString = mockDate.toISOString();
      const result = packageSelectors.deduceSelectedPackageSubscriptionLastRequestTimeDate.projector(mockDateString);
      expect(result.getTime()).toBe(mockDate.getTime());
    });
  });
  describe('deduceDataPackageSubscriptionRequestPayload', () => {
    it('should return the existing selectors', () => {
      const selectedProfileId = uuid();
      const selectedPackageProfileVendorId = uuid();
      const result = packageSelectors.deduceDataPackageSubscriptionRequestPayload.projector(
        selectedProfileId,
        selectedPackageProfileVendorId
      );
      expect(result).toEqual({
        selectedProfileId,
        selectedPackageProfileVendorId
      });
    });
  });
});
