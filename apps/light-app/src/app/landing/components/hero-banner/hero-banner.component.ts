import { ChangeDetectionStrategy, Component, EventEmitter, Inject, InjectionToken, Output } from '@angular/core';

export const ENABLE_GUEST_LOGIN = new InjectionToken('ENABLE_GUEST_LOGIN');

@Component({
  selector: 'apollo-hero-banner',
  templateUrl: './hero-banner.component.html',
  styleUrls: ['./hero-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroBannerComponent {
  @Output() loginClick: EventEmitter<void> = new EventEmitter<void>();
  @Output() scrollClick: EventEmitter<void> = new EventEmitter<void>();
  @Output() openMapClick: EventEmitter<void> = new EventEmitter<void>();

  constructor(@Inject(ENABLE_GUEST_LOGIN) private readonly enableGuestLogin: any) {}

  public goToLogin(): void {
    this.loginClick.emit();
  }

  public goToInfo(): void {
    this.scrollClick.emit();
  }

  public goToOpenMap(): void {
    // Enable guest feature only if enableGuestLogin flag is set to true
    if (this.enableGuestLogin === 'true') {
      this.openMapClick.emit();
    } else {
      this.loginClick.emit();
    }
  }
}
