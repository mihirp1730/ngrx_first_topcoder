import * as communicationActions from '../actions/communication.actions';
import * as communicationSelectors from '../selectors/communication.selectors';

import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';

import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { CommunicationService } from '@apollo/app/services/communication';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NotificationService } from '@apollo/app/ui/notification';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { VendorAppService } from '@apollo/app/vendor';
import { of } from 'rxjs';

@Injectable()
export class CommunicationEffects {
  loadChats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(communicationActions.loadChats),
      mergeMap(({ email }) =>
        this.communicationService.getChatThreads(email, this.vendorAppService?.dataVendors[0].dataVendorId).pipe(
          map((chats: any) => {
            return communicationActions.loadChatsSuccess({ chats });
          }),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while getting the chat list.', err.message);
            return of(communicationActions.loadChatsFail({ errorMessage: null }));
          })
        )
      )
    )
  );

  handleFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          communicationActions.loadChatsFail,
          communicationActions.openChatFail,
          communicationActions.createChatFail,
          communicationActions.getParticipantsFail
        ),
        tap(({ errorMessage }) =>
          this.notificationService.send({
            severity: 'Error',
            title: 'Something went wrong.',
            message: errorMessage ?? 'An error occurred while getting the chat list.'
          })
        )
      ),
    { dispatch: false }
  );

  openChat$ = createEffect(() =>
    this.actions$.pipe(
      ofType(communicationActions.openChat),
      mergeMap(({ chatId }) =>
        this.communicationService.getMessagesByChatId(chatId).pipe(
          map((messages) => {
            return communicationActions.openChatSuccess({ chatId, messages });
          }),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while creating the chat.', err.message);
            return of(communicationActions.openChatFail({ errorMessage: null }));
          })
        )
      )
    )
  );

  openChatSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(communicationActions.openChatSuccess),
      tap(({ chatId }) => {
        this.router.navigateByUrl(`vendor/communication/${chatId}`);
      }),
      map(({ chatId, messages }) => {
        return communicationActions.updateStatus({ chatId, messages });
      })
    )
  );

  updateStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(communicationActions.updateStatus),
      mergeMap(({ chatId, messages }) => {
        const lastChatMessageId = { chatMessageId: messages?.[messages.length - 1]?.chatMessageId };
        return this.communicationService.updateStatus(chatId, lastChatMessageId).pipe(
          map(() => {
            return communicationActions.updateCount({ chatId });
          })
        );
      })
    )
  );

  updateCount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(communicationActions.updateCount),
      concatLatestFrom(() => this.store.select(communicationSelectors.selectChats)),
      tap(([{ chatId }, chats]) => {
        chats.forEach((chat) => {
          if (chat.id === chatId && chat.newMessages > 0) {
            const currentValue = this.communicationService.getChatCount();
            this.communicationService.changeCount(currentValue - 1);
          }
        });
      }),
      map(([{ chatId }]) => {
        return communicationActions.updateCountSuccess({ chatId });
      })
    )
  );

  updateNewChatCount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(communicationActions.newUnreadMessage),
      concatLatestFrom(() => [
        this.store.select(communicationSelectors.selectChats),
        this.store.select(communicationSelectors.selectActiveChatId)
      ]),
      tap(([{ payload }, chats, activeChatId]) => {
        chats.forEach((chat) => {
          if (chat.id === payload.chatThreadId && chat.newMessages === 0 && activeChatId !== payload.chatThreadId) {
            const currentValue = this.communicationService.getChatCount();
            this.communicationService.changeCount(currentValue + 1);
          }
        });
      }),
      map(([{ payload, currentTime }]) => {
        return communicationActions.newUnreadMessageSuccess({ payload, currentTime });
      })
    )
  );

  connectWebSocket$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(communicationActions.createChatSuccess, communicationActions.openChat),
        tap(() => this.communicationService.connect())
      ),
    { dispatch: false }
  );

  sendMessage$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(communicationActions.sendMessage),
        tap(({ payload }) => this.communicationService.sendMessage(payload))
      ),
    { dispatch: false }
  );

  loadLoggedInUserDetails$ = createEffect(() =>
    this.actions$.pipe(
      ofType(communicationActions.loadLoggedInUserDetails),
      mergeMap(() =>
        this.authCodeFlowService.getUser().pipe(
          map((user) => {
            return communicationActions.loadLoggedInUserDetailsSuccess({ user });
          }),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while getting the user details.', err.message);
            return of(communicationActions.loadLoggedInUserDetailsFail({ errorMessage: null }));
          })
        )
      )
    )
  );

  addParticipants$ = createEffect(() =>
    this.actions$.pipe(
      ofType(communicationActions.addParticipants),
      concatLatestFrom(() => this.store.select(communicationSelectors.deduceCurrentUserAddingParticipantsToActiveChat)),
      switchMap(([{ participants }, { addedBy, chatId }]) =>
        this.communicationService.addParticipantToChat(chatId, { participants, addedBy }).pipe(
          map(() => communicationActions.addParticipantsSuccess({ participants })),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while adding participants.', err.message);
            return of(communicationActions.addParticipantsFail({ errorMessage: null }));
          })
        )
      )
    )
  );

  getParticipants$ = createEffect(() =>
    this.actions$.pipe(
      ofType(communicationActions.getParticipants),
      switchMap(() => this.store.select(communicationSelectors.selectActiveChatId)),
      mergeMap((chatId) =>
        this.communicationService.getParticipantsInChat(chatId).pipe(
          map((participants) => {
            return communicationActions.getParticipantsSuccess({ participants });
          }),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while getting participants.', err.message);
            return of(communicationActions.getParticipantsFail({ errorMessage: null }));
          })
        )
      )
    )
  );

  constructor(
    public readonly actions$: Actions,
    public readonly store: Store,
    private router: Router,
    public readonly communicationService: CommunicationService,
    public readonly notificationService: NotificationService,
    public readonly authCodeFlowService: AuthCodeFlowService,
    private vendorAppService: VendorAppService
  ) {}
}
