import { IDocumentDetail } from '@apollo/api/discovery/summary-cards';
import { createAction, props } from '@ngrx/store';

export const selectRecordDocumentFromWidget = createAction(
  '[Documents] Select Record Document From Widget',
  props<{ document: IDocumentDetail; recordId: string }>()
);

export const selectRecordDocumentFromWidgetLoaded = createAction(
  '[Documents] Select Record Document From Widget Loaded',
  props<{ documentId: string }>()
);
