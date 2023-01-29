import { Component, Inject, InjectionToken } from '@angular/core';

export const MAP_BASE_URL = new InjectionToken<any>('appBaseUrl');
@Component({
  selector: 'apollo-access-denied',
  templateUrl: './access-denied.component.html',
  styleUrls: ['./access-denied.component.scss']
})
export class AccessDeniedComponent {
  constructor(@Inject(MAP_BASE_URL) public readonly appBaseUrl: string) {}
}
