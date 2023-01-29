import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'apollo-modal-nonpublic-signin',
  templateUrl: './opportunity-modal-nonpublic-signin.component.html',
  styleUrls: ['./opportunity-modal-nonpublic-signin.component.scss']
})
export class OpportunityModalNonpublicSigninComponent {
  constructor(
    public readonly authCodeFlowService: AuthCodeFlowService,
    public readonly dialogRef: MatDialogRef<OpportunityModalNonpublicSigninComponent>
  ) {}

  public signin() {
    // we should provide a redirect url to open the package overlay
    this.authCodeFlowService.signIn();
  }
}
