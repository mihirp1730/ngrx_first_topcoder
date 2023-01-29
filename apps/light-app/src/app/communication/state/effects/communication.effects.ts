import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { CommunicationService, ICreateChatPayload, UserRole } from '@apollo/app/services/communication';
import { NotificationService } from '@apollo/app/ui/notification';
import { VendorAppService } from '@apollo/app/vendor';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';

import * as communicationActions from '../actions/communication.actions';
import * as communicationSelectors from '../selectors/communication.selectors';

@Injectable()
export class CommunicationEffects {
  loadChats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(communicationActions.loadChats),
      mergeMap(({ email }) =>
        this.communicationService.getChatThreads(email).pipe(
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
          communicationActions.getParticipantsFail,
          communicationActions.updateStatusFail
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

  createChat$ = createEffect(() =>
    this.actions$.pipe(
      ofType(communicationActions.createChat),
      concatLatestFrom(() => [
        this.store.select(communicationSelectors.selectMetadata),
        this.store.select(communicationSelectors.selectLoggedInUserDetails),
        this.store.select(communicationSelectors.selectVendorContactDetails)
      ]),
      switchMap(([, metadata, { email: loggedInUseremail, name: loggedInUsername }, vendorContactDetails]) => {
        const _vendorContactDetails = vendorContactDetails.map((vendor) => {
          return {
            role: UserRole.VENDOR,
            ...vendor
          };
        });
        const createChatPayload: ICreateChatPayload = {
          participants: [
            {
              emailId: loggedInUseremail,
              displayName: loggedInUsername,
              role: UserRole.CONSUMER
            },
            ..._vendorContactDetails
          ],
          metadata: {
            opportunityId: metadata.opportunityId,
            vendorId: metadata.dataVendorId
          },
          topic: metadata.opportunityName
        };
        return this.communicationService.createChatThread(createChatPayload).pipe(
          tap(() => this.store.dispatch(communicationActions.loadChats({ email: loggedInUseremail }))),
          map((chatThreadId) => {
            return communicationActions.createChatSuccess({
              chatId: chatThreadId,
              topic: createChatPayload.topic,
              participants: createChatPayload.participants
            });
          }),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while creating the chat.', err.message);
            return of(communicationActions.createChatFail({ errorMessage: null }));
          })
        );
      })
    )
  );

  openChat$ = createEffect(() =>
    this.actions$.pipe(
      ofType(communicationActions.openChat),
      mergeMap(({ chatId, isModular }) =>
        this.communicationService.getMessagesByChatId(chatId).pipe(
          map((messages) => {
            return communicationActions.openChatSuccess({ chatId, messages, isModular });
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
      concatLatestFrom(() => this.store.select(communicationSelectors.selectLoggedInUserDetails)),
      tap(([{ chatId, isModular }]) => {
        if (!isModular) {
          this.router.navigateByUrl(`communication/${chatId}`);
        }
      }),
      map(([{ chatId, messages }, { email }]) => {
        const lastMessageCreator = messages?.[messages.length - 1]?.sender;
        if (messages?.length > 0 && lastMessageCreator !== email) {
          return communicationActions.updateStatus({ chatId, messages });
        } else {
          return communicationActions.noReadReceipts();
        }
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
          }),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while update status.', err.message);
            return of(communicationActions.updateStatusFail({ errorMessage: 'An error occurred while updating the status.' }));
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

  loadVendorContactDetails$ = createEffect(() =>
    this.actions$.pipe(
      ofType(communicationActions.loadVendorContactDetails),
      concatLatestFrom(() => this.store.select(communicationSelectors.selectMetadata)),
      mergeMap(([, metadata]) =>
        this.vendorAppService.retrieveVendorContactPerson(metadata?.dataVendorId).pipe(
          map((vendorContactDetails) => {
            return communicationActions.loadVendorContactDetailsSuccess({ vendorContactDetails });
          }),
          catchError((err: HttpErrorResponse) => {
            console.error('An error occurred while vendor contact person details.', err.message);
            return of(communicationActions.loadVendorContactDetailsFail({ errorMessage: null }));
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
