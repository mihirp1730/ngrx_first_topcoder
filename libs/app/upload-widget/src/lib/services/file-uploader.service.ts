/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { HttpClient, HttpEventType } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { DELFI_USER_CONTEXT } from '@apollo/app/delfi-gui-auth-config';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';
import { NotificationService } from '@apollo/app/ui/notification';
import { BlobUploadCommonResponse, BlockBlobClient, AnonymousCredential, newPipeline } from '@azure/storage-blob';
import { ContextModel } from '@delfi-gui/components/lib/model/context.model';
import { define, getType } from 'mime';
import { BehaviorSubject, interval, Observable, of, Subscription } from 'rxjs';
import { catchError, filter, finalize, map, switchMap, tap } from 'rxjs/operators';

import { FileType, IFile, IFileProgress, IFileUploadConfig } from '../interfaces';

export const FILE_UPLOAD_CONFIGURATION = new InjectionToken<IFileUploadConfig>('FileUploadConfiguration');

@Injectable({
  providedIn: 'root'
})
export class FileUploaderService {
  private appKey;
  private headers;

  private _filesQueue: Array<IFile> = [];
  private filesQueue: BehaviorSubject<Array<IFile>> = new BehaviorSubject<Array<IFile>>(this._filesQueue);
  public filesQueue$: Observable<Array<IFile>> = this.filesQueue.asObservable();

  private filesSubscriptions: Array<{ id: string; subscription: Subscription }> = [];

  constructor(
    private http: HttpClient,
    @Inject(FILE_UPLOAD_CONFIGURATION) private readonly configuration: IFileUploadConfig,
    @Inject(DELFI_USER_CONTEXT) private readonly userContext: ContextModel,
    private secureEnvironmentService: SecureEnvironmentService,
    private notificationService: NotificationService
  ) {
    this.appKey = this.secureEnvironmentService.secureEnvironment.app.key;
    this.headers = { appKey: this.appKey, billingAccountId: this.userContext.crmAccountId };

    // Add custom extensions
    define({
      'application/zip': ['zip', 'zipx'],
      'application/segy': ['segy', 'sgy'],
      'application/las': ['las'],
      'application/lis': ['lis'],
      'application/dlis': ['dlis'],
      'application/zgy': ['zgy']
    }, true);

    // Interval to check if there are files in the queue waiting to be uploaded
    interval(1000 * 5)
      .pipe(
        switchMap((_) => this.filesQueue$),
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

  // This method initialize the upload process and returns a file id
  public upload(parentId: string, group: string, file: File, uploadType: FileType): Observable<string> {
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

    return this.getFileId(body, uploadType).pipe(
      tap((fileId) => {
        if (!fileId) {
          this.notificationService.send({
            severity: 'Error',
            title: 'Error',
            message: 'Something went wrong getting the file id'
          });
          return;
        }

        this.updateFiles([
          ...this._filesQueue,
          {
            id: fileId,
            parentId,
            associatedId: null,
            group,
            name: file.name,
            progress: {
              errorMessage: null,
              percentage: 0,
              started: false,
              canceled: false,
              completed: false,
              associated: false
            },
            type: uploadType,
            file
          }
        ]);
      })
    );
  }

  public getFile(fileId: string): Observable<IFile> {
    return this.filesQueue$.pipe(map((files) => files.filter((f) => f.id === fileId)[0]));
  }

  public getFiles(fileIds: Array<string>): Observable<Array<IFile>> {
    return this.filesQueue$.pipe(map((files) => files.filter((f) => fileIds.includes(f.id))));
  }

  public getFilesByParentId(parentId: string): Observable<Array<IFile>> {
    return this.filesQueue$.pipe(map((files) => files.filter((f) => f.parentId === parentId)));
  }

  public cancelUpload(id: string, callback: () => void): void {
    const index = this.filesSubscriptions.findIndex((f) => f.id === id);

    if (index > -1) {
      const { subscription } = this.filesSubscriptions[index];
      subscription.unsubscribe();
      this.filesSubscriptions.splice(index, 1);

      this.updateProgress(id, { canceled: true });
    } else {
      callback();
    }
  }

  private getFileId(body: any, uploadType: FileType): Observable<string> {
    return this.http
      .post<{ fileId: string }>(this.getUrl(uploadType), body, { headers: this.headers })
      .pipe(
        map(({ fileId }) => fileId),
        catchError(() => of(null))
      );
  }

  private startUploadProcess(file: IFile): void {
    const errorMessage = 'Upload failed. Please try again';
    this.getSignedUrl(file.id, file.type).subscribe(async ({ signedURL }) => {
      if (file.type === FileType.Deliverable) {
        await this.uploadDeliverablesToAzure(signedURL, file.file)
          .then((response) => {
            this.complete(file.id, file.type)
              .subscribe((_) => {
                this.updateProgress(file.id, { completed: true });
              }, () => {
                this.updateProgress(file.id, { errorMessage });
              });
          })
          .catch(() => {
            this.updateProgress(file.id, { errorMessage });
          });
        return;
      }

      this.filesSubscriptions.push({
        id: file.id,
        subscription: this.uploadToSignedUrl(signedURL, file)
      });
    }, () => {
      this.updateProgress(file.id, { errorMessage });
    });
  }

  private getSignedUrl(fileId: string, uploadType: FileType): Observable<any> {
    return this.http.post(`${this.getUrl(uploadType)}/${fileId}/upload`, {}, { headers: this.headers });
  }

  private uploadToSignedUrl(signedURL: string, file: IFile): Subscription {
    const formData = new FormData();
    formData.append('file', file.file);

    return this.http
      .post(signedURL, formData, {
        reportProgress: true,
        observe: 'events'
      })
      .pipe(
        catchError(() => {
          this.notificationService.send({
            severity: 'Error',
            title: 'Error',
            message: 'Something went wrong trying to upload the file'
          });
          return of({ type: 'Error' });
        }),
        finalize(() => {
          console.log('Finalize upload process');
        })
      )
      .subscribe((event) => {
        const errorMessage = 'Upload failed. Please try again';
        let removeSubscription = false;
        switch (event.type) {
          case HttpEventType.UploadProgress: {
            const progress = Math.round(100 * (event.loaded / event.total));
            this.updateProgress(file.id, { percentage: progress });
            break;
          }
          case HttpEventType.Response: {
            this.complete(file.id, file.type).subscribe((_) => {
              this.updateProgress(file.id, { completed: true });
            }, () => {
              this.updateProgress(file.id, { errorMessage });
            });
            removeSubscription = true;
            break;
          }
          case 'Error': {
            this.updateProgress(file.id, { errorMessage });
            removeSubscription = true;
            break;
          }
        }
        if (removeSubscription) {
          const subIndex = this.filesSubscriptions.findIndex((f) => f.id === file.id);
          this.filesSubscriptions.splice(subIndex, 1);
        }
      });
  }

  private updateFiles(value: Array<IFile>): void {
    this.filesQueue.next((this._filesQueue = value));
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

  public updateAssociatedId(fileId: string, associatedId: string): void {
    this.updateFiles(
      this._filesQueue.map((f) => {
        if (f.id === fileId) {
          return {
            ...f,
            associatedId
          };
        }

        return f;
      })
    );
  }

  private complete(fileId: string, uploadType: FileType) {
    return this.http.post(`${this.getUrl(uploadType)}/${fileId}/complete`, {}, { headers: this.headers, responseType: 'text' });
  }

  private getUrl(uploadType: FileType): string {
    return uploadType === FileType.Deliverable ? this.configuration.fileManager.osdu : this.configuration.fileManager.common;
  }

  private uploadDeliverablesToAzure(sasURI: string, file: File): Promise<BlobUploadCommonResponse> {
    const blockBlobClient = new BlockBlobClient(
      sasURI,
      newPipeline(new AnonymousCredential(), {
        retryOptions: { maxTries: 5 }, // Retry options
      })
    );
    const options = {
      blobHTTPHeaders: { blobContentType: file.type },
      //100MB block size is applicable when file >256 MB. When file < 256MB Azure SDK internally uploads that in single request. 
      blockSize: 100 * 1024 * 1024,
      concurrency: 10,
    };
    return blockBlobClient.uploadData(file, options);
  }
}
