import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthUser } from '@apollo/api/interfaces';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { FeatureFlagService, FeaturesEnum } from '@apollo/app/feature-flag';
import { CommunicationService } from '@apollo/app/services/communication';
import { NotificationService } from '@apollo/app/ui/notification';
import { Store } from '@ngrx/store';
import { ThemeService } from '@slb-dls/angular-material/core';
import { distinctUntilChanged, filter, retry, Subscription, take, tap } from 'rxjs';

import { Themes } from '../../themes/theme.config';
import * as communicationActions from '../state/actions/communication.actions';
import { IChatItems, IMetadata } from '../state/communication.state';
import * as communicationSelectors from '../state/selectors/communication.selectors';

@Component({
  selector: 'apollo-communication-container',
  templateUrl: './communication-container.component.html',
  styleUrls: ['./communication-container.component.scss']
})
export class CommunicationContainerComponent implements OnInit, OnDestroy {
  public subscription = new Subscription();
  public userData: AuthUser;

  public chats$ = this.store.select(communicationSelectors.selectChats);
  public filteredChat$ = this.store.select(communicationSelectors.deduceChats);
  public loadingChats$ = this.store.select(communicationSelectors.selectLoadingChats);
  public isLoadingWhileGettingMessages$ = this.store.select(communicationSelectors.selectIsLoadingWhileGettingMessages);

  public selectedChatId: string;
  public isDataOpportunityWorkflow = false;
  public vendorContactDetailsReceived = false;
  private chatPending = false;
  private chatLoaded = false;
  private chatInitiated = false;

  public constructor(
    public communicationService: CommunicationService,
    public notificationService: NotificationService,
    public readonly authCodeFlowService: AuthCodeFlowService,
    public readonly store: Store,
    private themeService?: ThemeService,
    private featureFlagService?: FeatureFlagService,
    private router?: Router
  ) {
    setTimeout(() => this.themeService?.switchTheme(Themes.Light), 1000);
    if (this.router?.getCurrentNavigation().extras.state) {
      this.store.dispatch(communicationActions.setMetadata({ metadata: this.router.getCurrentNavigation().extras.state as IMetadata }));
    }
  }

  ngOnInit(): void {
    // load initial chats
    this.loadChats();
    this.subscription.add(
      this.featureFlagService.featureEnabled(FeaturesEnum.dataOpportunityWorkflow).subscribe((flag) => {
        if (flag) {
          this.isDataOpportunityWorkflow = true;
        }
      })
    );

    this.store
      .select(communicationSelectors.selectVendorContactDetails)
      .pipe(filter((data) => !!data))
      .subscribe(() => {
        this.vendorContactDetailsReceived = true;
        if (this.chatPending && this.chatLoaded) {
          this.dispatchCreateChatAction();
        }
      });

    this.store
      .select(communicationSelectors.selectChats)
      .pipe(filter((chat) => chat !== null))
      .subscribe(() => {
        this.chatLoaded = true;
        if (this.chatPending && this.vendorContactDetailsReceived) {
          this.dispatchCreateChatAction();
        }
      });

    this.connectWebSocket();

    this.subscription.add(
      this.filteredChat$
        .pipe(
          distinctUntilChanged(),
          filter((chat) => chat !== null)
        )
        .subscribe((filteredChat: IChatItems[]) => {
          if (filteredChat.length === 0) {
            this.startChat();
          } else {
            this.selectedChatId = filteredChat[0].id;
            this.onChatClick(filteredChat[0].id);
          }
        })
    );
  }

  public ngOnDestroy(): void {
    if (!this.isDataOpportunityWorkflow) {
      this.themeService.switchTheme(Themes.Dark);
    }
    this.communicationService.closeSocket();
    this.subscription.unsubscribe();
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

  connectWebSocket() {
    this.subscription.add(
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

  startChat() {
    if (this.vendorContactDetailsReceived && this.chatLoaded) {
      this.dispatchCreateChatAction();
    } else {
      this.chatPending = true;
    }
  }

  dispatchCreateChatAction() {
    if (!this.chatInitiated) {
      this.chatInitiated = true;
      this.store.dispatch(communicationActions.createChat());
      this.chatPending = false;
    }
  }

  onChatClick(chatId: string): void {
    this.store.dispatch(communicationActions.openChat({ chatId, isModular: false }));
  }
}
