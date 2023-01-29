import { Component, OnInit } from '@angular/core';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { DocumentRef, WindowRef } from '@apollo/app/ref';
import { GoogleAnalyticsService } from 'ngx-google-analytics';
import { take } from 'rxjs';

@Component({
  selector: 'apollo-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  public discoverMoreOptions = {
    background: '/assets/images/discover-more.png',
    description:
      'The Asset Transaction is the one stop for all data in the<br />Energy life cycle, leading to better decisions, faster<br />responses, and improved efficiency.',
    italicStyle: true,
    link: 'https://www.software.slb.com/delfi/delfi-experience/gaia',
    buttonText: 'DISCOVER MORE'
  };
  public joinUsOptions = {
    title: 'Join Us',
    description: 'Now you can create and sell your content<br />by joining the Asset Transaction.',
    buttonText: 'JOIN HERE'
  };

  public constructor(
    private authCodeFlowService: AuthCodeFlowService,
    private googleAnalyticsService: GoogleAnalyticsService,
    private readonly windowRef: WindowRef,
    private readonly documentRef: DocumentRef
  ) {}

  ngOnInit() {
    this.googleAnalyticsService.pageView('', 'consumer_landing_page_view', '/');
  }

  public redirectToLogin() {
    this.googleAnalyticsService.gtag('event', 'login', { method: 'consumer' });
    this.authCodeFlowService.signIn();
  }

  public onScrollClick() {
    this.documentRef.nativeDocument.querySelector('apollo-icon-card').scrollIntoView({
      behavior: 'smooth'
    });
  }

  public redirectToGuestMap() {
    this.authCodeFlowService
      .isSignedIn()
      .pipe(take(1))
      .subscribe((isSignedIn) => {
        if (isSignedIn) {
          // For guest, we redirect to map.
          this.windowRef.nativeWindow.location.assign('/map');
        } else {
          // For non-signed in user in develop environment, we redirect to log in.
          this.redirectToLogin();
        }
      });
  }
}
