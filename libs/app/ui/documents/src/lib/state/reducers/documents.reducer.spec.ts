import * as documentsActions from '../actions/documents.actions';
import { initialState } from '../documents.state';
import { documentsReducer } from './documents.reducer';

describe('DocumentsReducer', () => {
  describe('unknown action', () => {
    it('should return the default state', () => {
      const action = { type: 'Unknown' };
      const state = documentsReducer(initialState, action);
      expect(state).toBe(initialState);
    });
  });

  describe('selectRecordDocumentFromWidget', () => {
    it('should return record document from widget', () => {
      const action = documentsActions.selectRecordDocumentFromWidget({ document: {name: 'testName', fileType: 'pdf', documentId: 'docId'}, recordId: 'recordId' });
      const newState = documentsReducer(initialState, action);
      expect(newState.selectedLoadingDocuments.length).toBe(1);
      expect(newState.selectedLoadingDocuments[0]).toBe('docId');
    });
  });
  
  describe('selectRecordDocumentFromWidgetLoaded', () => {
    it('should remove record after loading completed', () => {
      const action = documentsActions.selectRecordDocumentFromWidgetLoaded({ documentId: 'docId' });
      const preparedState = {
        ...initialState,
        selectedLoadingDocuments: ['docId']
      };
      const newState = documentsReducer(preparedState, action);
      expect(newState.selectedLoadingDocuments.length).toBe(0);
    });
  });
});
