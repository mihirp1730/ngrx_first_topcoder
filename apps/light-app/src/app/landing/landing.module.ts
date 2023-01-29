import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SlbButtonModule } from '@slb-dls/angular-material/button';
import { environment } from '../../environments/environment';

import { CallToActionComponent } from './components/call-to-action/call-to-action.component';
import { ENABLE_GUEST_LOGIN, HeroBannerComponent } from './components/hero-banner/hero-banner.component';
import { IconCardComponent } from './components/icon-card/icon-card.component';
import { LearnMoreComponent } from './components/learn-more/learn-more.component';
import { LandingRoutingModule } from './landing-routing.module';
import { LandingComponent } from './landing.component';

@NgModule({
  imports: [CommonModule, LandingRoutingModule, MatIconModule, SlbButtonModule],
  declarations: [LandingComponent, CallToActionComponent, HeroBannerComponent, IconCardComponent, LearnMoreComponent],
  providers: [
    {
      provide: ENABLE_GUEST_LOGIN,
      useValue: environment.enableGuestLogin
    }
  ]
})
export class LandingModule {}
