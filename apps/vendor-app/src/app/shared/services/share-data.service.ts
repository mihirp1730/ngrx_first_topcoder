import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ShareDataService {
  private isMRCreated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isMRCreated$: Observable<boolean> = this.isMRCreated.asObservable();

  public setIsMRCreated(isDone: boolean): void {
    this.isMRCreated.next(isDone);
  }
}
