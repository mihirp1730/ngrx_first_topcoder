
import { Injectable } from '@angular/core';
import { UserService } from '@delfi-gui/components';
import { ContextModel } from '@delfi-gui/components/lib/model/context.model';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserContextService {
  private context = null;

  constructor(private userService: UserService) {}

  get userContext(): ContextModel {
    return this.context;
  }

  loadContext() {
    return this.getContext();
  }

  getContext() {
    return this.userService.getContext()
      .pipe(tap(context => (this.context = context)));
  }
}