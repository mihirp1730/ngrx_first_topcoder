import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AuthUser } from '@apollo/api/interfaces';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { CommunicationService, IChatMessagePayload } from '@apollo/app/services/communication';
import { NotificationService } from '@apollo/app/ui/notification';
import { Store } from '@ngrx/store';
import { combineLatest, filter, map, Observable, retry, Subscription, take, tap } from 'rxjs';
import * as opportunityAttendeeActions from '../../opportunity/state/actions/opportunity-attendee.actions';
import * as communicationActions from '../state/actions/communication.actions';
import { IMetadata } from '../state/communication.state';
import * as communicationSelectors from '../state/selectors/communication.selectors';

@Component({
  selector: 'apollo-communication-modular-chat',
  templateUrl: './communication-modular-chat.component.html',
  styleUrls: ['./communication-modular-chat.component.scss']
})
export class CommunicationModularChatComponent implements OnInit, OnDestroy {
  private _opportunityDetails: any;
  public modularSubscription = new Subscription();
  filteredChats$: Observable<any>;
  vendorProfile: any;
  vendorContactDetailsReceived: boolean;
  userData: AuthUser;
  showHeader = false;
  isChatPending = false;
  isMetadataSet = false;

  public sender$ = this.store.select(communicationSelectors.selectLoggedInUserDetails).pipe(
    map((user) => {
      return {
        name: user.name,
        email: user.email
      };
    })
  );

  public messages$ = this.store.select(communicationSelectors.selectMessages);
  public loadingChats$ = this.store.select(communicationSelectors.selectLoadingChats);
  public isLoadingWhileGettingMessages$ = this.store.select(communicationSelectors.selectIsLoadingWhileGettingMessages);

  @Input() set opportunityDetails(val) {
    this._opportunityDetails = val;
    const { opportunityId, opportunityName, dataVendorId } = val;
    const metadata: IMetadata = { opportunityId, opportunityName, dataVendorId };
    //set metadata for opp
    this.store.dispatch(communicationActions.setMetadata({ metadata }));
  }

  public get opportunityDetails() {
    return this._opportunityDetails;
  }

  constructor(
    public readonly authCodeFlowService: AuthCodeFlowService,
    public readonly store: Store,
    public communicationService: CommunicationService,
    public notificationService: NotificationService
  ) {
    this.store.dispatch(communicationActions.loadLoggedInUserDetails());
    this.store.dispatch(communicationActions.loadVendorContactDetails());
  }

  ngOnInit(): void {
    this.loadChats();

    this.modularSubscription.add(
      this.store
        .select(communicationSelectors.selectVendorContactDetails)
        .pipe(filter((data) => !!data))
        .subscribe(() => {
          this.vendorContactDetailsReceived = true;
          if (this.isChatPending) {
            this.dispatchCreateChatAction();
          }
        })
    );

    this.connectToWebSocket();

    this.filteredChats$ = this.store.select(communicationSelectors.selectChats).pipe(
      filter((chat) => chat !== null),
      map((chats) => {
        if (chats.length > 0) {
          const filteredChat = chats.filter(
            (chat) =>
              // Filtering chats whose oppId and Vendor Id matches with opp's oppId & vendorId
              chat.metadata.opportunityId === this.opportunityDetails.opportunityId &&
              chat.metadata.vendorId === this.opportunityDetails.dataVendorId
          );
          return filteredChat;
        }
      })
    );

    this.filteredChats$.pipe(take(1)).subscribe((res) => {
      if (res?.length === 0 && this.vendorContactDetailsReceived) {
        this.dispatchCreateChatAction();
        return;
      } else if (res?.length === 0) {
        this.isChatPending = true;
        return;
      }
      // isModular flag is passed to effect to tell whether to route after getting chats
      this.store.dispatch(communicationActions.openChat({ chatId: res[0].id, isModular: true }));
    });
  }

  loadChats() {
    this.authCodeFlowService
      .getUser()
      .pipe(take(1))
      .subscribe((user: AuthUser) => {
        this.userData = user;
        this.store.dispatch(communicationActions.loadChats({ email: user.email }));
      });
  }

  connectToWebSocket() {
    this.modularSubscription.add(
      this.communicationService.messages$
        .pipe(
          tap({
            error: (error) => {
              console.log('[Web Socket] Error:', error);
              this.notificationService.send({
                severity: 'Error',
                title: 'Something went wrong.',
                message: 'An error occurred while connecting with Chat service - You will not be able to do live chat.'
              });
            },
            complete: () => console.log('[Web Socket] Connection Closed')
          }),
          retry({ delay: 1000 })
        )
        .subscribe({
          next: (payload) => {
            if (this.userData.email === payload.sender) {
              this.store.dispatch(communicationActions.sendMessageSuccess({ payload, currentTime: new Date() }));
            } else {
              this.store.dispatch(communicationActions.newUnreadMessage({ payload, currentTime: new Date() }));
            }
          }
        })
    );
  }

  closeModularChatPanel() {
    this.store.dispatch(opportunityAttendeeActions.openModularChatPanel({ openModularChat: false }));
  }

  public dispatchCreateChatAction() {
    this.store.dispatch(communicationActions.createChat());
    this.isChatPending = false;
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
          chatThreadId: chatId
        };
        this.store.dispatch(communicationActions.sendMessage({ payload }));
      });
  }

  ngOnDestroy(): void {
    this.communicationService.closeSocket();
    this.modularSubscription.unsubscribe();
  }
}
