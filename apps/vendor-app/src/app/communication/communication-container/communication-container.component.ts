import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { retry, Subscription, take, tap } from 'rxjs';

import { AuthUser } from '@apollo/api/interfaces';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { CommunicationService } from '@apollo/app/services/communication';
import { NotificationService } from '@apollo/app/ui/notification';
import { ThemeService } from '@slb-dls/angular-material/core';

import { Themes } from '../../themes/theme.config';
import * as communicationActions from '../state/actions/communication.actions';
import * as communicationSelectors from '../state/selectors/communication.selectors';

@Component({
  selector: 'apollo-communication-container',
  templateUrl: './communication-container.component.html',
  styleUrls: ['./communication-container.component.scss']
})
export class CommunicationContainerComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();
  private userData: AuthUser;

  public chats$ = this.store.select(communicationSelectors.selectChats);

  public constructor(
    private themeService: ThemeService,
    public readonly store: Store,
    private communicationService: CommunicationService,
    private notificationService: NotificationService,
    public readonly authCodeFlowService: AuthCodeFlowService
  ) {
    this.themeService.switchTheme(Themes.Light);
  }

  ngOnInit(): void {
    this.authCodeFlowService
      .getUser()
      .pipe(take(1))
      .subscribe((user: AuthUser) => {
        this.userData = user;
        this.store.dispatch(communicationActions.loadChats({ email: user.email }));
      });

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
        .subscribe((payload) => {
          if (this.userData.email === payload.sender) {
            this.store.dispatch(communicationActions.sendMessageSuccess({ payload, currentTime: new Date() }));
          } else {
            this.store.dispatch(communicationActions.newUnreadMessage({ payload, currentTime: new Date() }));
          }
        })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onChatClick(chatId: string): void {
    this.store.dispatch(communicationActions.openChat({ chatId }));
  }
}
