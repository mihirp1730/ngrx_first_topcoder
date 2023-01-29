import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SplitFactory } from '@splitsoftware/splitio';
import * as jwtDecode from 'jwt-decode';

import { JwtDecoderToken, SplitFactoryToken } from './feature-flag.service';

@NgModule({
  imports: [CommonModule],
  providers: [
    {
      provide: JwtDecoderToken,
      useValue: jwtDecode
    },
    {
      provide: SplitFactoryToken,
      useValue: SplitFactory
    }
  ]
})
export class AppFeatureFlagModule {
}
