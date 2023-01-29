import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { AppActions } from '../enums';

@Injectable({
  providedIn: 'root'
})
export class MapWrapperService {
  private currentAppAction: BehaviorSubject<AppActions> = new BehaviorSubject<AppActions>(AppActions.None);
  public currentAppAction$: Observable<AppActions> = this.currentAppAction.asObservable();
  public previousAppAction: AppActions;

  public getCurrentAppAction(): Observable<AppActions> {
    return this.currentAppAction$.pipe(take(1));
  }

  public updateCurrentAppAction(action: AppActions) {
    this.previousAppAction = this.currentAppAction.value;
    this.currentAppAction.next(action);
  }
}
