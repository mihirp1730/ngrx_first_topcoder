import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { IChatMessagePayload } from '@apollo/app/services/communication';
import { ModalComponent } from '@apollo/app/ui/notification';
import { Store } from '@ngrx/store';
import { combineLatest } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

import * as communicationActions from '../state/actions/communication.actions';
import * as communicationSelectors from '../state/selectors/communication.selectors';

@Component({
  selector: 'apollo-communication-chat',
  templateUrl: './communication-chat.component.html',
  styleUrls: ['./communication-chat.component.scss']
})
export class CommunicationChatComponent {
  public sender$ = this.store.select(communicationSelectors.selectLoggedInUserDetails).pipe(map((user) => {
    return {
      name: user.name,
      email: user.email
    };
  }));
  public participants$ = this.store.select(communicationSelectors.selectParticipants);
  public messages$ = this.store.select(communicationSelectors.selectMessages);
  public activeChatId$ = this.store.select(communicationSelectors.selectActiveChatId);
  public chatGroup$ = this.participants$.pipe(
    switchMap((participants) => this.sender$.pipe(map((sender) => participants.filter((r) => r.emailId !== sender.email))))
  );

  constructor(public readonly store: Store, public dialog: MatDialog) {
    this.store.dispatch(communicationActions.loadLoggedInUserDetails());
    this.store.dispatch(communicationActions.loadVendorContactDetails());
  }

  public sendMessage(message: any): void {
    combineLatest([
      this.store.select(communicationSelectors.selectLoggedInUserDetails),
      this.store.select(communicationSelectors.selectActiveChatId)
    ])
      .pipe(take(1))
      .subscribe(([{ email, name }, chatId]) => {
        const payload: IChatMessagePayload = {
          sender: email,
          content: message,
          type: 'TEXT',
          chatThreadId: chatId,
        };

        this.store.dispatch(communicationActions.sendMessage({ payload }));
      });
  }

  public openModal(event: boolean) {
    if (event) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.autoFocus = true;
      dialogConfig.panelClass = 'participants-modal-panel';
      dialogConfig.disableClose = false;
      dialogConfig.data = {
        options: {
          cancelButtonText: 'Cancel',
          modalType: 'chat',
          confirmButtonText: 'Add',
          customData: {
            chatModalData: {
              companyName: 'Not Available',
              hint: 'Add participants emails separated by commas',
              placeholder: 'Start Typing...',
              opportunity: 'Not Available'
            }
          },
          label: 'Participants Emails',
          title: 'Add participants to this conversation'
        }
      };
      const dialogRef = this.dialog.open(ModalComponent, dialogConfig);

      dialogRef.componentInstance.yesClickEvent.subscribe((participants) => {
        const payload = this.newParticipants(participants);
        this.store.dispatch(communicationActions.addParticipants(payload));
      });
    }
  }

  public newParticipants(value: string[] = []) {
    return {
      participants: value.map((emailId) => {
        const displayName = emailId.split('@')[0];

        return {
          emailId,
          displayName
        };
      })
    };
  }

  public getParticipants() {
    // TODO: dispatch getParticipants action
  }
}
