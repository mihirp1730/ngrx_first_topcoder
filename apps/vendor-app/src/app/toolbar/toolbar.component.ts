import { Component } from '@angular/core';
import { ASSET_HELP_WIDGET, HelpSupportOptions } from '@apollo/api/interfaces';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { EnvironmentService } from '@apollo/app/environment';
import { WindowRef } from '@apollo/app/ref';
import { VendorAppService } from '@apollo/app/vendor';
import { Subscription } from 'rxjs';

@Component({
  selector: 'apollo-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  supportConfig: HelpSupportOptions;
  redirectConsumerAppUrl: string;
  public subscriptions: Subscription[] = [];
  requestUrl: string;
  constructor(private windowRef: WindowRef, private authCodeFlowService: AuthCodeFlowService, private vendorAppService: VendorAppService) {
    this.supportConfig = {
      supportPortalName: ASSET_HELP_WIDGET.SPPORT_PORTAL_NAME,
      guruServicePlatformId: ASSET_HELP_WIDGET.PLATFORM_ID
    };
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.vendorAppService.consumerUrl$.subscribe((url) => {
        this.requestUrl = `https://${url}/map`;
      })
    );
  }

  public onContextChanges() {
    this.windowRef.nativeWindow.location.reload();
  }

  public signout() {
    const host = EnvironmentService.getHost(document);
    this.authCodeFlowService.signOut(`https://${host}`);
  }
}
