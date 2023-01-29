import { Component, Inject, InjectionToken, Input } from '@angular/core';
import { WindowRef } from '@apollo/app/ref';

export const DELFI_PORTAL_APP = new InjectionToken<string>('delfiPortalApp');

@Component({
  selector: 'apollo-access-denied',
  templateUrl: './access-denied.component.html',
  styleUrls: ['./access-denied.component.scss']
})
export class AccessDeniedComponent {
  @Input() userContext: boolean;

  constructor(@Inject(DELFI_PORTAL_APP) private readonly delfiPortalApp: string, private windowInstance: WindowRef) {}

  redirectToDelfiPortal() {
    this.windowInstance.nativeWindow.open(this.delfiPortalApp, '_blank');
  }
}
