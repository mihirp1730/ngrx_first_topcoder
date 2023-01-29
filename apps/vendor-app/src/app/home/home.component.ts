import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '@slb-dls/angular-material/core';
import { GoogleAnalyticsService } from 'ngx-google-analytics';

import { Themes } from '../themes/theme.config';

@Component({
  selector: 'apollo-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  isNewPackageLoaded = window.location.href.includes('create');
  public isDisabled: boolean;

  constructor(
    private route: Router,
    private googleAnalyticsService: GoogleAnalyticsService,
    private themeService: ThemeService) {
    this.themeService.switchTheme(Themes.Dark);
  }

  ngOnInit() {
    this.googleAnalyticsService.pageView('', 'home_view');
  }

  createNewPackage() {
    this.isNewPackageLoaded = true;
    this.route.navigateByUrl('vendor/package/create');
  }

  disableButtons(isDisabled: boolean) {
    this.isDisabled = isDisabled;
  }
}
