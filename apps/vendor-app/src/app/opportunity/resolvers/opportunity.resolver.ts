import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';

import * as opportunityActions from '../../opportunity/state/actions/opportunity.actions';

@Injectable({
  providedIn: 'root'
})
export class OpportunityResolver implements Resolve<boolean> {
  constructor(public readonly store: Store) {}

  resolve(route: ActivatedRouteSnapshot): Observable<boolean> {
    const opportunityId = route.params['id'];
    this.store.dispatch(opportunityActions.getOpportunity({ opportunityId }));
    return of(true);
  }
}
