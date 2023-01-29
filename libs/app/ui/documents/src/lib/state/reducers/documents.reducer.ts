import { createReducer, on } from '@ngrx/store';

import * as documentsActions from '../actions/documents.actions';
import { initialState, State } from '../documents.state';

export const documentsFeatureKey = 'documents';

const _documentsReducer = createReducer(
  initialState,
  on(documentsActions.selectRecordDocumentFromWidget, (state, { document }): State => {
    return {
      ...state,
      selectedLoadingDocuments: [
        ...state.selectedLoadingDocuments, 
        document.documentId
      ]
    };
  }),
  on(documentsActions.selectRecordDocumentFromWidgetLoaded, (state, { documentId }): State => {
    return {
      ...state,
      selectedLoadingDocuments: state.selectedLoadingDocuments.filter((docId) => {
        return docId !== documentId;
      })
    };
  })
);

export function documentsReducer(state: any, action: any) {
  return _documentsReducer(state, action);
}
