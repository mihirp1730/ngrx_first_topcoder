import { HttpClient, HttpEventType } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { DELFI_USER_CONTEXT } from '@apollo/app/delfi-gui-auth-config';
/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { SecureEnvironmentService } from '@apollo/app/secure-environment';
import { ContextModel } from '@delfi-gui/components/lib/model/context.model';
import { getType } from 'mime';
import { BehaviorSubject, interval, Observable, of, Subscription } from 'rxjs';
import { catchError, filter, finalize, map, switchMap } from 'rxjs/operators';

import { IFile, IFileProgress } from './interfaces/media-document-uploader.interfaces';

export const COMMON_FILE_MANAGER_URL = new InjectionToken<string>('CommonFileMangerURL');
export const IS_BILLING_ACCOUNT_ID_REQUIRED = new InjectionToken<boolean>('isBillingAccountIdRequiredDocFile');

@Injectable({
  providedIn: 'root'
})
export class MediaDocumentUploaderService {
  private appKey;
  private headers;

  private _filesQueue: Array<IFile> = [];
  private filesQueue: BehaviorSubject<Array<IFile>> = new BehaviorSubject<Array<IFile>>(this._filesQueue);
  public filesQueue$: Observable<Array<IFile>> = this.filesQueue.asObservable();

  private filesSubscriptions: Array<{ id: string; subscription: Subscription }> = [];

  constructor(
    private http: HttpClient,
    @Inject(COMMON_FILE_MANAGER_URL) private readonly commonFileMangerURL: string,
    @Inject(DELFI_USER_CONTEXT) private readonly userContext: ContextModel,
    @Inject(IS_BILLING_ACCOUNT_ID_REQUIRED) private readonly isBillingAccountIdRequiredDocFile: boolean,
    private secureEnvironmentService: SecureEnvironmentService
  ) {
    this.appKey = this.secureEnvironmentService.secureEnvironment.app.key;
    this.headers = { appKey: this.appKey, billingAccountId: this.userContext.crmAccountId };

    this.startUploadOnInterval();
  }

  public startUploadOnInterval() {
    // Interval to check if there are files in the queue waiting to be uploaded
    interval(1000 * 5)
    .pipe(
      switchMap(() => this.filesQueue$),
      map((files) => files.filter((f) => !f.progress.started)),
      filter((files) => files.length > 0)
    )
    .subscribe((filesToProcess) => {
      // Obtain the files that doesn't start the upload process
      filesToProcess.forEach((file) => {
        this.updateFiles(
          this._filesQueue.map((f) => {
            if (f.id === file.id) {
              const newFile = {
                ...f,
                progress: {
                  ...f.progress,
                  started: true
                }
              };
              this.startUploadProcess(newFile);

              return newFile;
            }

            return f;
          })
        );
      });
    });
  }

  public downloadMedia(fileId: string): Observable<string> {
    if (!this.isBillingAccountIdRequiredDocFile) {
      delete ((this.headers as unknown) as any).billingAccountId;
    }
    return this.http
      .get<{ signedURL: string }>(`${this.commonFileMangerURL}/${fileId}/download`, { headers: this.headers })
      .pipe(
        map(({ signedURL }) => {
          return signedURL;
        }),
        catchError((err: any) => {
          console.log('Error', err);
          return of(null);
        })
      );
  }

  // This method initialize the upload process and returns a file id
  public upload(file: File, componentIdentifier: string = '') {
    const fileNameSplit = file.name.split('.');
    const fileExtension = fileNameSplit[fileNameSplit.length - 1];
    let fileType = file.type;

    if (file.type === '') {
      fileType = getType(fileExtension.toLowerCase()) || 'application/octet-stream';
    }

    const body = {
      fileName: file.name,
      fileType
    };

    this.getFileId(body).subscribe({
      next: (fileId) => {
        this.updateFiles([
          ...this._filesQueue,
          {
            id: fileId,
            name: file.name,
            fileType,
            progress: {
              errorMessage: null,
              percentage: 0,
              started: false,
              canceled: false,
              completed: false,
              associated: false
            },
            file,
            componentIdentifier
          }
        ]);
      },
    error: () => {
      // show toaster 
    }
    });
  }

  private getFileId(body: any): Observable<string | null> {
    return this.http
      .post<{ fileId: string }>(this.commonFileMangerURL, body, { headers: this.headers })
      .pipe(
        map(({ fileId }) => {
          return fileId;
        }),
        catchError((err: any) => {
          console.log('Error', err);
          return of(null);
        })
      );
  }

  private startUploadProcess(file: IFile): void {
    const errorMessage = 'Upload failed. Please try again';
    this.getSignedUrl(file.id).subscribe({
      next: ({ signedURL }) => {
        this.filesSubscriptions.push({
          id: file.id,
          subscription: this.uploadToSignedUrl(signedURL, file)
        });
      },
      error: () => {
        this.updateProgress(file.id, { errorMessage });
      }
    });
  }

  private getSignedUrl(fileId: string): Observable<any> {
    return this.http.post(`${this.commonFileMangerURL}/${fileId}/upload`, {}, { headers: this.headers });
  }

  private complete(fileId: string) {
    return this.http.post(`${this.commonFileMangerURL}/${fileId}/complete`, {}, { headers: this.headers, responseType: 'text' });
  }
  private uploadToSignedUrl(signedURL: string, fileObj: IFile): Subscription {
    const formData = new FormData();
    formData.append('file', fileObj.file);

    return this.http
      .post(signedURL, formData, {
        reportProgress: true,
        observe: 'events'
      })
      .pipe(
        catchError(() => {
          // to show toaster
          return of({ type: 'Error' });
        }),
        finalize(() => {
          console.log('Finalize upload process');
        })
      )
      .subscribe((event: any) => {
        const errorMessage = 'Upload failed. Please try again';
        let removeSubscription = false;
        switch (event.type) {
          case HttpEventType.UploadProgress: {
            const progress = Math.round(100 * (event.loaded / event.total));
            this.updateProgress(fileObj.id, { percentage: progress });
            break;
          }
          case HttpEventType.Response: {
            this.complete(fileObj.id).subscribe({
              next: () => {
                this.updateProgress(fileObj.id, { completed: true });
              },
              error: () => {
                this.updateProgress(fileObj.id, { errorMessage });
              }
            });
            removeSubscription = true;
            break;
          }
          case 'Error': {
            this.updateProgress(fileObj.id, { errorMessage });
            removeSubscription = true;
            break;
          }
        }
        if (removeSubscription) {
          const subIndex = this.filesSubscriptions.findIndex((f) => f.id === fileObj.id);
          this.filesSubscriptions.splice(subIndex, 1);
        }
      });
  }

  private updateFiles(value: Array<IFile>): void {
    this._filesQueue = value;
    this.filesQueue.next(value);
  }

  public resetFileQueue() {
    this._filesQueue = [];
    this.filesQueue.next([]);
  }

  public updateProgress(fileId: string, values: Partial<IFileProgress>): void {
    this.updateFiles(
      this._filesQueue.map((f) => {
        if (f.id === fileId) {
          return {
            ...f,
            progress: {
              ...f.progress,
              ...values
            }
          };
        }

        return f;
      })
    );
  }
}
