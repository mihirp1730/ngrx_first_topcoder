import * as opportunityCatalogSelectors from './opportunity-catalog.selectors';

import { CatalogMedia, IOpportunity } from '@apollo/app/services/opportunity';

import { v4 as uuid } from 'uuid';

describe('state selectors', () => {
  describe('selectOpportunities', () => {
    it('should select selectOpportunities from the provided state', () => {
      const state: IOpportunity[] = [{
        opportunityId: uuid(),
        opportunityName: 'test 1',
        opportunityType: 'Public' as any
      }];
      const selection = opportunityCatalogSelectors.selectOpportunities.projector({ opportunities: state });
      expect(selection[0].opportunityName).toBe('test 1');
    });
  });

  describe('selectFilters', () => {
    it('should select selectFilters from the provided state', () => {
      const filters = { opportunityName: 'test 1', assetType: null };
      const selection = opportunityCatalogSelectors.selectFilters.projector({filters});
      expect(selection).toBe(filters);
    });
  });

  describe('selectIsLoadingWhileGetting', () => {
    it('should select isLoadingWhileGetting from the provided state', () => {
      const state = { isLoadingWhileGetting: true };
      const selection = opportunityCatalogSelectors.selectIsLoadingWhileGetting.projector(state);
      expect(selection).toBeTruthy();
    });
  });

  describe('selectPendingPublishOpportunityIds', () => {
    it('should select selectPendingPublishOpportunityIds from the provided state', () => {
      const state = { pendingPublishedOpportunityIds: [] };
      const selection = opportunityCatalogSelectors.selectPendingPublishOpportunityIds.projector(state);
      expect(selection.length).toBe(state.pendingPublishedOpportunityIds.length);
    });
  });

  describe('deduceOpportunities', () => {
    it('should filter opportunity with name', () => {
      const state = [
        {
          opportunityId: uuid(),
          opportunityName: 'test 1',
          opportunityType: 'Public' as any,
          deliveryType: null,
          status: 'Draft'
        },
        {
          opportunityId: uuid(),
          opportunityName: 'test 2',
          opportunityType: 'Private' as any,
          deliveryType: null,
          status: 'Published'
        }
      ];
      const filters = { opportunityName: 'test 1', assetType: null, offerType: null, deliveryType: null, status: null };
      const selection = opportunityCatalogSelectors.deduceOpportunities.projector(state, filters);
      expect(selection[0].opportunityName).toEqual(state[0].opportunityName);
    });

    it('should filter opportunity with assets type', () => {
      const state = [
        {
          opportunityId: uuid(),
          opportunityName: 'test 1',
          opportunityType: 'Public' as any,
          assetType: ['Test assetType 1']
        },
        {
          opportunityId: uuid(),
          opportunityName: 'test 2',
          opportunityType: 'Private' as any,
          assetType: ['Test assetType 2']
          
        }
      ];
      const filters = { opportunityName: '', assetType: ['Test assetType 1'], offerType: null, deliveryType: null, status: null  };
      const selection = opportunityCatalogSelectors.deduceOpportunities.projector(state, filters);
      expect(selection[0].opportunityName).toEqual(state[0].opportunityName);
    });

    it('should filter opportunity with offer type', () => {
      const state = [
        {
          opportunityId: uuid(),
          offerType: ['offer type 1']
          
        },
        {
          opportunityId: uuid(),
          offerType: ['offer type 2']
        }
      ];
      const filters = { opportunityName: '', assetType: null, offerType: ['offer type 1'], deliveryType: null, status: null };
      const selection = opportunityCatalogSelectors.deduceOpportunities.projector(state, filters);
      expect(selection[0]).toBe(state[0]);
    });

    it('should filter opportunity with Delivery type', () => {
      const state = [
        {
          opportunityId: uuid(),
          deliveryType: ['delivery type 1']
        },
        {
          opportunityId: uuid(),
          deliveryType: ['delivery type 2']
        }
      ];
      const filters = { opportunityName: '', assetType: null, offerType: null, deliveryType: ['delivery type 1'], status: null };
      const selection = opportunityCatalogSelectors.deduceOpportunities.projector(state, filters);
      expect(selection[0]).toBe(state[0]);
    });

    it('should filter opportunity having Not available', () => {
      const state = [
        {
          opportunityId: uuid(),
          deliveryType: [''],
          assetType: [''],
          offerType: ['']
        }
      ];
      const filters = { opportunityName: '', assetType: ['Not available'], offerType: ['Not available'], deliveryType: ['Not available'], status: null };
      const selection = opportunityCatalogSelectors.deduceOpportunities.projector(state, filters);
      expect(selection[0]).toBe(state[0]);
    });

    describe('selectMedia', () => {
      it('should select media from the provided state', () => {
        const state: CatalogMedia[] = [{
          fileId: "test",
          signedUrl: 'test url',
        }];
        const selection = opportunityCatalogSelectors.selectMedia.projector({ catalogMedia: state });
        expect(selection[0].fileId).toBe('test');
        expect(selection[0].signedUrl).toBe('test url');
      });
    });
  });
});

