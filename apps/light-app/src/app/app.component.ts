import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CookieService } from 'ngx-cookie-service';
/* istanbul ignore next */

import { Component, Inject, InjectionToken, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { EnvironmentService } from '@apollo/app/environment';
import { FeatureFlagService, FeaturesEnum } from '@apollo/app/feature-flag';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';
import { CommunicationService } from '@apollo/app/services/communication';
import { ThemeService } from '@slb-dls/angular-material/core';
import * as moment from 'moment';
import { GoogleAnalyticsService } from 'ngx-google-analytics';
import { Observable, tap } from 'rxjs';

import { Env } from '../environments/environment.interface';
import { ENV } from '../environments/environment.provider';
import { CookiesAcceptanceComponent } from './cookies-acceptance/cookies-acceptance-modal.component';
import { Themes } from './themes/theme.config';

export const HOST_APP_URL = new InjectionToken<string>('hostAppUrl');

@Component({
  selector: 'apollo-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // Feature Flags
  public whatFix$: Observable<boolean>;
  public hasSidenav = false;
  public userEmail: string;
  public userName: string;
  public userInitials: string;
  public vendorAppUrl: string;
  unreadChatsCount$ = this.communicationService.unreadChats$;

  constructor(
    @Inject(ENV) private env: Env,
    @Inject(HOST_APP_URL) private readonly hostAppUrl: string,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private featureFlagService: FeatureFlagService,
    private secureEnvironmentService: SecureEnvironmentService,
    private authCodeFlowService: AuthCodeFlowService,
    private googleAnalyticsService: GoogleAnalyticsService,
    private themeService: ThemeService,
    private router: Router,
    private communicationService: CommunicationService,
    public dialog: MatDialog,
    public cookieService: CookieService
  ) {
    // Register DLS icons
    this.matIconRegistry.addSvgIconSet(this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/svg-symbols.svg'));

    this.registerApolloIcons();
    this.registerDependenciesIcons();

    this.themeService.switchTheme(Themes.Dark);
    this.vendorAppUrl = this.hostAppUrl;
  }

  public ngOnInit(): void {
    this.initializeConfig();
    this.googleAnalyticsService.pageView('/map', 'map_view');
    this.authCodeFlowService
      .getUser()
      .pipe(tap((user) => this.communicationService.getChatThreads(user.email)))
      .subscribe((user) => {
        this.userEmail = user.email;
        this.userName = user.name;
        this.userInitials = this.userEmail.slice(0, 2).toUpperCase();
        this.featureFlagService.setSauthToken(user?.accessToken);
      });

    this.whatFix$ = this.featureFlagService.featureEnabled(FeaturesEnum.whatFix);
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        if (event.url !== '/') {
          this.hasSidenav = true;
        } else {
          this.hasSidenav = false;
        }
      }
    });

    // only show the modal for guest user
    if (!this.userEmail) {
      const getCookieExpiry = this.cookieService.get('cookie-acceptance-date');
      if (!getCookieExpiry || moment(getCookieExpiry) < moment(new Date())) {
        // open the cookies acceptance modal
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        dialogConfig.panelClass = 'cookies-acceptance-modal-panel';
        dialogConfig.disableClose = true;
        this.dialog.open(CookiesAcceptanceComponent, dialogConfig);
      }
    }
  }

  public signout() {
    const host = EnvironmentService.getHost(document);
    this.authCodeFlowService.signOut(`https://${host}`);
    this.hasSidenav = false;
  }

  private registerApolloIcons(): void {
    const path = 'assets/';
    const icons = [
      { name: 'basemap', folder: 'icons/', svg: 'basemap' },
      { name: 'earth', svg: 'earth' },
      { name: 'freehand-selection', svg: 'freehand-selection' },
      { name: 'polygon-selection', svg: 'polygon-selection' },
      { name: 'rectangle-selection', svg: 'rectangle-selection' },
      { name: 'packages', folder: 'layers/', svg: 'packages' },
      { name: 'SeismicSurvey3d', folder: 'layers/', svg: 'SeismicSurvey3d' },
      { name: 'Well', folder: 'layers/', svg: 'Well' },
      // Communication
      { name: 'profile', folder: 'icons/', svg: 'profile' },
      { name: 'team', folder: 'icons/', svg: 'team' },
      // Opportunity
      { name: 'oppType', folder: 'icons/', svg: 'icon-opp-type' },
      { name: 'assetType', folder: 'icons/', svg: 'icon-asset-type' },
      { name: 'offerType', folder: 'icons/', svg: 'icon-offer-type' },
      { name: 'contract', folder: 'icons/', svg: 'icon-contract-type' },
      { name: 'dateTime', folder: 'icons/', svg: 'icon-date-time' },
      { name: 'region', folder: 'icons/', svg: 'icon-region' },
      { name: 'scheduler', folder: 'icons/', svg: 'scheduler' },
      { name: 'phase', folder: 'icons/', svg: 'icon-phase-type' },
      { name: 'carbonAbated', folder: 'icons/', svg: 'carbon-abated' },
      { name: 'sequestration', folder: 'icons/', svg: 'sequestration' },
      { name: 'dataObject', folder: 'icons/', svg: 'data-objects' },
      // start initial layer icons
      { name: '2d-seismic', folder: 'layers/', svg: '2d-seismic' },
      { name: '3d-grid', folder: 'layers/', svg: '3d-grid' },
      { name: '3d-seismic', folder: 'layers/', svg: '3d-seismic' },
      { name: '3d-space', folder: 'layers/', svg: '3d-space' },
      { name: 'basin', folder: 'layers/', svg: 'basin' },
      { name: 'bathymetry', folder: 'layers/', svg: 'bathymetry' },
      { name: 'block', folder: 'layers/', svg: 'block' },
      { name: 'brownfield', folder: 'layers/', svg: 'brownfield' },
      { name: 'company', folder: 'layers/', svg: 'company' },
      { name: 'completion', folder: 'layers/', svg: 'completion' },
      { name: 'core-sample', folder: 'layers/', svg: 'core-sample' },
      { name: 'drilling-risk', folder: 'layers/', svg: 'drilling-risk' },
      { name: 'facilities', folder: 'layers/', svg: 'facilities' },
      { name: 'field', folder: 'layers/', svg: 'field' },
      { name: 'formation', folder: 'layers/', svg: 'formation' },
      { name: 'fracture', folder: 'layers/', svg: 'fracture' },
      { name: 'free-air', folder: 'layers/', svg: 'free-air' },
      { name: 'gas', folder: 'layers/', svg: 'gas' },
      { name: 'geo-play', folder: 'layers/', svg: 'geo-play' },
      { name: 'gravity-field', folder: 'layers/', svg: 'gravity-field' },
      { name: 'greenfield', folder: 'layers/', svg: 'greenfield' },
      { name: 'horizon', folder: 'layers/', svg: 'horizon' },
      { name: 'lease-block', folder: 'layers/', svg: 'lease-block' },
      { name: 'lithology', folder: 'layers/', svg: 'lithology' },
      { name: 'log-set', folder: 'layers/', svg: 'log-set' },
      { name: 'log', folder: 'layers/', svg: 'log' },
      { name: 'mud-test', folder: 'layers/', svg: 'mud-test' },
      { name: 'offshore', folder: 'layers/', svg: 'offshore' },
      { name: 'onshore', folder: 'layers/', svg: 'onshore' },
      { name: 'petrel-project', folder: 'layers/', svg: 'petrel-project' },
      { name: 'pipeline', folder: 'layers/', svg: 'pipeline' },
      { name: 'platform', folder: 'layers/', svg: 'platform' },
      { name: 'points', folder: 'layers/', svg: 'points' },
      { name: 'polygonset', folder: 'layers/', svg: 'polygonset' },
      { name: 'polylineset', folder: 'layers/', svg: 'polylineset' },
      { name: 'production-history', folder: 'layers/', svg: 'production-history' },
      { name: 'prospect', folder: 'layers/', svg: 'prospect' },
      { name: 'regular-height-field', folder: 'layers/', svg: 'regular-height-field' },
      { name: 'reservoir', folder: 'layers/', svg: 'reservoir' },
      { name: 'rig', folder: 'layers/', svg: 'rig' },
      { name: 'seismic-generic', folder: 'layers/', svg: 'seismic-generic' },
      { name: 'survey', folder: 'layers/', svg: 'survey' },
      { name: 'railroad', folder: 'layers/', svg: 'railroad' },
      { name: 'powerline', folder: 'layers/', svg: 'powerline' },
      { name: 'wind-turbine', folder: 'layers/', svg: 'wind-turbine' },
      { name: 'transmission-lines', folder: 'layers/', svg: 'transmission-lines' },
      { name: 'wind-turbines', folder: 'layers/', svg: 'wind-turbines' },
      // end initial layer icons
      { name: 'connect', folder: 'icons/', svg: 'icon-connect' },
      { name: 'find', folder: 'icons/', svg: 'icon-find' },
      { name: 'utilize', folder: 'icons/', svg: 'icon-utilize' }
    ];

    icons.forEach(({ name, folder, svg }) => this.registerIconsInNamespace('apollo', name, `${path}${folder || ''}${svg}.svg`));
  }

  private registerDependenciesIcons(): void {
    const path = 'assets/';
    const icons = [
      { name: 'filter-reset', folder: 'gis-canvas/', svg: 'clear-all' },
      { name: 'filter-icon', folder: 'gis-canvas/', svg: 'filter-icon' }
    ];

    icons.forEach(({ name, folder, svg }) => this.registerIcon(name, `${path}${folder || ''}${svg}.svg`));
  }

  private registerIcon(iconName, path) {
    this.matIconRegistry.addSvgIcon(iconName, this.domSanitizer.bypassSecurityTrustResourceUrl(path));
  }

  private registerIconsInNamespace(namespace, iconName, path) {
    this.matIconRegistry.addSvgIconInNamespace(namespace, iconName, this.domSanitizer.bypassSecurityTrustResourceUrl(path));
  }

  private async initializeConfig() {
    this.featureFlagService.setConfig({
      production: this.env.production,
      appKey: this.secureEnvironmentService.secureEnvironment?.app.splitKey
    });
  }
}
