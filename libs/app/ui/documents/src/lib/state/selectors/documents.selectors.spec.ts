import * as documentsSelectors from './documents.selectors';

describe('state selectors', () => {
  describe('selectedLoadingDocuments', () => {
    it('should select the loading document', () => {
      const state = {
        selectedLoadingDocuments: []
      };
      const selection = documentsSelectors.selectedLoadingDocuments.projector(state);
      expect(selection).toBe(state.selectedLoadingDocuments);
    });
  });
});
