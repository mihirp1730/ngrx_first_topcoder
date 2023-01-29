import { createAction, props } from '@ngrx/store';

export const userChangedFilters = createAction(
  '[Dashboard] User Changed Filters',
  props<{ filters: { status: Array<string | number>; dataType: Array<string | number>; regions: Array<string | number> } }>()
);
