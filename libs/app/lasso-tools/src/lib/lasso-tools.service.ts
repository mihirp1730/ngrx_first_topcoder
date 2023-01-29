import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { LassoTool } from './lasso-tools/lasso-tools.helper';

@Injectable({
  providedIn: 'root'
})
export class LassoToolsService {
  private currentLasso: BehaviorSubject<LassoTool> = new BehaviorSubject<LassoTool>(LassoTool.NONE);
  public currentLasso$: Observable<LassoTool> = this.currentLasso.asObservable();

  public getCurrentLasso(): Observable<LassoTool> {
    return this.currentLasso$.pipe(take(1));
  }

  public updateCurrentLasso(value: LassoTool): void {
    this.currentLasso.next(value);
  }

  public clearCurrentLasso(): void {
    this.currentLasso.next(LassoTool.NONE);
  }
}
