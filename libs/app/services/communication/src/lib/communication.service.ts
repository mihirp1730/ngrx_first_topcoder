import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { AuthUser } from '@apollo/api/interfaces';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';
import { VendorAppService } from '@apollo/app/vendor';
import { BehaviorSubject, fromEvent, Observable, Subject, Subscription, take, tap, throwError } from 'rxjs';
import { catchError, map, mergeAll } from 'rxjs/operators';
import { WebSocketSubject } from 'rxjs/webSocket';

import * as interfaces from './interfaces/communication.interface';

export const COMMUNICATION_SERVICE_API_URL = new InjectionToken<string>('CommunicationServiceApiUrl');
export const WEBSOCKET_FACTORY = new InjectionToken('WEBSOCKET_FACTORY');

@Injectable()
export class CommunicationService {
  private socket$: WebSocketSubject<any>;
  private messagesSubject$ = new Subject();
  private pendingMessageQueue: interfaces.IChatMessagePayload[] = [];
  public messages$ = this.messagesSubject$.pipe(
    mergeAll(),
    catchError((e) => {
      throw e;
    })
  );
  private unreadChats = new BehaviorSubject<number>(0);
  public unreadChats$ = this.unreadChats.asObservable();

  public onlineEvent: Observable<Event>;
  public offlineEvent: Observable<Event>;
  public subscriptions: Subscription[] = [];
  public isUserOffline = false;
  public requestUrl;

  constructor(
    private httpClient: HttpClient,
    private readonly environment: SecureEnvironmentService,
    @Inject(COMMUNICATION_SERVICE_API_URL) private readonly communicationServiceApiUrl: string,
    @Inject(WEBSOCKET_FACTORY) private readonly websocketFactory: any,
    public readonly authCodeFlowService: AuthCodeFlowService,
    public vendorAppService: VendorAppService
  ) {
    this.onlineEvent = fromEvent(window, 'online');
    this.offlineEvent = fromEvent(window, 'offline');

    this.subscriptions.push(
      this.onlineEvent.subscribe((e) => {
        this.isUserOffline = false;
        if (this.socket$.closed) {
          this.connect();
        } else {
          this.sendingQueuedMessage(this.pendingMessageQueue);
        }
      })
    );

    this.subscriptions.push(
      this.vendorAppService.consumerUrl$.subscribe((url) => {
        this.requestUrl = url;
      })
    );

    this.subscriptions.push(
      this.offlineEvent.subscribe((e) => {
        this.isUserOffline = true;
      })
    );
  }

  public changeCount(items: number) {
    this.unreadChats.next(items);
  }

  public getChatCount() {
    return this.unreadChats.value;
  }

  public closeSocket() {
    this.socket$.complete();
  }

  private getRequestOptions(customHeader: any = {}) {
    const headers = {
      appKey: this.environment.secureEnvironment.app.key,
      'Content-Type': 'application/json',
      requestUrl: this.requestUrl,
      ...customHeader
    };
    return { headers };
  }

  public getChatThreads(participantId: string, vendorId?: string): Observable<interfaces.IChatItem[]> {
    const url = vendorId ? `${this.communicationServiceApiUrl}?vendorId=${vendorId}` : `${this.communicationServiceApiUrl}`;
    const options = this.getRequestOptions({ participantId });
    return this.httpClient.get<interfaces.IGetChatThreadsResponse>(url, options).pipe(
      map(({ chatThreadItems }) => {
        let count = 0;
        const chats = chatThreadItems.map((chat) => {
          const chatThread = {
            id: chat.chatThreadId,
            title: chat.topic,
            metadata: chat.metadata,
            createdBy: chat.createdBy,
            createdDate: chat.createdDate,
            newMessages: chat.newMessages,
            totalMessages: chat.totalMessages,
            topic: chat.topic,
            lastModifiedDate: chat.lastModifiedDate
          };
          if (chat.newMessages >= 1) {
            count++;
          }
          this.changeCount(count);
          return chatThread;
        });
        return chats;
      })
    );
  }

  public createChatThread(payload: interfaces.ICreateChatPayload): Observable<string> {
    const url = `${this.communicationServiceApiUrl}`;
    const options = this.getRequestOptions();
    return this.httpClient.post<{ chatThreadId: string }>(url, payload, options).pipe(map(({ chatThreadId }) => chatThreadId));
  }

  public getMessagesByChatId(chatThreadId: string): Observable<Array<interfaces.IChatThreadMessage>> {
    const url = `${this.communicationServiceApiUrl}/${chatThreadId}/messages/`;
    const options = this.getRequestOptions();
    return this.httpClient.get<interfaces.IGetChatThreadByIdResponse>(url, options).pipe(map(({ chatMessages }) => chatMessages));
  }

  public addParticipantToChat(chatThreadId: string, body: interfaces.IAddPartipantsRequest) {
    const url = `${this.communicationServiceApiUrl}/${chatThreadId}/participants/`;
    const newBody = {
      ...body,
      addedOn: new Date().toUTCString()
    };
    const options = this.getRequestOptions();
    (options as any).responseType = 'text';
    return this.httpClient.post(url, newBody, options);
  }

  public getParticipantsInChat(chatThreadId: string): Observable<interfaces.IParticipantDetail[]> {
    const url = `${this.communicationServiceApiUrl}/${chatThreadId}/participants/`;
    const options = this.getRequestOptions();
    return this.httpClient
      .get<interfaces.IGetParticipantsResponse>(url, options)
      .pipe(map(({ chatThreadParticipants }) => chatThreadParticipants));
  }

  public updateStatus(chatThreadId: string, payload: { chatMessageId: string }): Observable<void> {
    const url = `${this.communicationServiceApiUrl}/${chatThreadId}/readReceipts/`;
    const options = this.getRequestOptions();
    // changing responseType to text as api response is not in JSON
    (options as any).responseType = 'text';
    return this.httpClient.put<void>(url, payload, options);
  }

  //#region Chat Window
  public connect(): void {
    if (!this.socket$ || this.socket$.closed) {
      this.authCodeFlowService
        .getUser()
        .pipe(take(1))
        .subscribe((user: AuthUser) => {
          if (user.accessToken) {
            this.socket$ = this.websocketFactory(user.accessToken, this.requestUrl);
            const messages = this.socket$.pipe(
              tap({ error: (error) => console.log(error) }),
              catchError((err) => {
                return throwError(() => err);
              })
            );

            messages.subscribe({
              // Called if at any point WebSocket API signals some kind of error.
              error: () => {
                console.error('[Communication Service]: web socket connection error');
                // setting the socket observable as complete to start the new web socket connect on next msg
                this.socket$.closed = true;
              },
              // Called when connection is closed (for whatever reason).
              complete: () => {
                // setting the socket observable as complete to start the new web socket connect on next msg
                this.socket$.closed = true;
              }
            });
            this.messagesSubject$.next(messages);
            // send the queued message which were lost during re-connection
            this.sendingQueuedMessage(this.pendingMessageQueue);
          }
        });
    }
  }

  public sendMessage(data: interfaces.IChatMessagePayload): void {
    try {
      if (this.socket$.closed) {
        this.pendingMessageQueue.push(data);
        return this.connect();
      }
      if (this.isUserOffline) {
        this.pendingMessageQueue.push(data);
      } else {
        this.socket$.next(data);
      }
    } catch (err) {
      console.log(err);
    }
  }

  public sendingQueuedMessage(pendingMessages: interfaces.IChatMessagePayload[] = []): void {
    if (pendingMessages.length === 0) {
      return;
    }
    this.sendMessage(pendingMessages[0]);
    pendingMessages.splice(0, 1);
    this.sendingQueuedMessage(pendingMessages);
  }

  public close(): void {
    this.socket$.complete();
  }
  //#endregion Chat Window
}
