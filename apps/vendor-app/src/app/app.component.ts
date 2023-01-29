import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { AuthUser } from '@apollo/api/interfaces';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { FeatureFlagService, FeaturesEnum } from '@apollo/app/feature-flag';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';
import { CommunicationService } from '@apollo/app/services/communication';
import { VendorAppService } from '@apollo/app/vendor';
import { Store } from '@ngrx/store';
import { ThemeService } from '@slb-dls/angular-material/core';
import { filter, mergeMap, Observable, Subscription } from 'rxjs';

import * as userSubscriptionActions from './access-denied/state/actions/user-subscription.action';
import * as accessSelectors from './access-denied/state/selectors/user-subscription.selectors';

import { Env } from '../environments/environment.interface';
import { ENV } from '../environments/environment.provider';
import { Themes } from './themes/theme.config';
const CATALOG_PATHS = ['/vendor','/vendor/create'];
const CATALOG_PARAMETERISED_PATHS = ['/vendor/edit','vendor/edit'];
@Component({
  selector: 'apollo-root',
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html'
})
export class AppComponent implements  OnInit, AfterViewInit, OnDestroy {
  public userAuth: AuthUser;
  // Feature Flags
  public whatFix$: Observable<boolean>;
  hasSidenav = false;
  subscriptions = new Subscription();
  unreadChatsCount$ = this.communicationService.unreadChats$;
  public opportunityCatalogIsActive = false;
  public delfiAccessStatus$ = this.store.select(accessSelectors.delfiAccessStatus)

  constructor(
    @Inject(ENV) private env: Env,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private authCodeFlowService: AuthCodeFlowService,
    private secureEnvironmentService: SecureEnvironmentService,
    private featureFlagService: FeatureFlagService,
    private themeService: ThemeService,
    private router: Router,
    private communicationService: CommunicationService,
    public readonly store: Store,
    private vendorAppService: VendorAppService,
    private eleRef: ElementRef
  ) {
    // Register DLS icons
    this.matIconRegistry.addSvgIconSet(this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/svg-symbols.svg'));

    this.registerApolloIcons();

    this.themeService.switchTheme(Themes.Light);
  }

  ngOnInit(): void {
    this.initializeConfig();
    this.authCodeFlowService.getUser().subscribe((user) => {
      this.userAuth = user;
      this.featureFlagService.setSauthToken(this.userAuth?.accessToken);
    });
    this.whatFix$ = this.featureFlagService.featureEnabled(FeaturesEnum.whatFix);
    //layout
    this.store.dispatch(userSubscriptionActions.getUserSubscription());
    this.subscriptions.add(
      this.authCodeFlowService
        .getUser()
        .pipe(
          mergeMap((user) => {
            if(this.vendorAppService?.dataVendors !== null)
              return this.communicationService.getChatThreads(user.email, this.vendorAppService?.dataVendors[0].dataVendorId);
          })
        )
        .subscribe()
    );
    
    this.isOpportunityCatalogRouteActive(window.location.pathname); /*for page reload where navigation events are not fired*/

    this.subscriptions.add(
      this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
        this.isOpportunityCatalogRouteActive(event.url);
        this.toggleOpporLandingClass();
      })
    );

    if (this.router.url.search('package') > -1) {
      this.hasSidenav = false;
    } else {
      this.hasSidenav = true;
    }
  }

  isOpportunityCatalogRouteActive(path) {
    let parameterisedPathMatch = false;
    CATALOG_PARAMETERISED_PATHS.forEach((name) => {
      if (path.includes(name)) {
        parameterisedPathMatch = true;
      }
    });
    this.opportunityCatalogIsActive = CATALOG_PATHS.includes(path) || parameterisedPathMatch;
  }

  toggleOpporLandingClass() {
    if (this.router.url === '/vendor') {
      this.eleRef.nativeElement.classList.add('oppor-landing-page');
    } else {
      this.eleRef.nativeElement.classList.remove('oppor-landing-page');
    }
  }

  ngAfterViewInit() {
    this.toggleOpporLandingClass();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private registerApolloIcons(): void {
    const path = 'assets/';
    const icons = [
      { name: 'info', folder: 'icons/', svg: 'info' },
      { name: 'earth', folder: 'icons/', svg: 'earth' },
      { name: 'polygon-selection', svg: 'polygon-selection' },
      { name: 'rectangle-selection', svg: 'rectangle-selection' },
      { name: 'packages', folder: 'layers/', svg: 'packages' },
      { name: 'SeismicSurvey3d', folder: 'layers/', svg: 'SeismicSurvey3d' },
      { name: 'Well', folder: 'layers/', svg: 'Well' },
      { name: 'union', folder: 'icons/', svg: 'union' },
      { name: 'dateTime', folder: 'icons/', svg: 'icon-date-time' },
      { name: 'contract', folder: 'icons/', svg: 'icon-contract-type' },
      { name: 'assetType', folder: 'icons/', svg: 'icon-asset-type' },
      { name: 'offerType', folder: 'icons/', svg: 'icon-offer-type' },
      { name: 'deliveryType', folder: 'icons/', svg: 'icon-delivery-type' },
      { name: 'phase', folder: 'icons/', svg: 'icon-phase-type' },
      { name: 'oppType', folder: 'icons/', svg: 'icon-opp-type' },
      { name: 'region', folder: 'icons/', svg: 'icon-region' },
      { name: 'details', folder: 'icons/', svg: 'icon-opportunity-details' },
      { name: 'viewRequest', folder: 'icons/', svg: 'icon-view-request' },
      { name: 'edit', folder: 'icons/', svg: 'icon-edit' },
      { name: 'inviteAttendee', folder: 'icons/', svg: 'icon-invite-attendee' },
      { name: 'unpublish', folder: 'icons/', svg: 'icon-unpublish' },
      { name: 'zip', folder: 'icons/', svg: 'icon-zip-type' },
      { name: 'profile', folder: 'icons/', svg: 'profile' },
      { name: 'team', folder: 'icons/', svg: 'team' },
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
      { name: 'wind-turbines', folder: 'layers/', svg: 'wind-turbines' }
      // end initial layer icons
    ];

    icons.forEach(({ name, folder, svg }) => this.registerIconsInNamespace('apollo', name, `${path}${folder || ''}${svg}.svg`));
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
