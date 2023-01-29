import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { IDetailViewResponse, IDocumentDetail, ISignedUrlResponse } from '@apollo/api/discovery/summary-cards';
import { WindowRef, DocumentRef } from '@apollo/app/ref';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export const DISCOVERY_API_URL = new InjectionToken('DISCOVERY_API_URL');

@Injectable()
export class DocumentsService {
  constructor(
    public readonly httpClient: HttpClient,
    @Inject(DISCOVERY_API_URL)
    @Optional()
    public readonly discoveryApiUrl: string,
    private windowRef: WindowRef,
    private documentRef: DocumentRef
  ) {}

  private getDocumentsDetail(recordId: string): Observable<IDocumentDetail[]> {
    const url = `${this.discoveryApiUrl}/summary-detail-view/${recordId}`;
    //eslint-disable-next-line
    const headers = {
      'Content-Type': 'application/json',
      'data-partition-id': recordId.split(':')[0]
    };
    return this.httpClient.get<IDetailViewResponse>(url, { headers }).pipe(map((response) => response.result.documents));
  }

  public getDocumentsDetailWithFileType(recordId: string) {
    return this.getDocumentsDetail(recordId).pipe(
      map((response) =>
        response.map((item) => {
          let type = item.fileType;
          if (type === null) {
            type = item.name.split('.')[1];
          }

          return {
            ...item,
            documentId: item.documentId,
            name: item.name,
            fileType: type.toLowerCase()
          };
        })
      )
    );
  }

  public getDocumentSignedUrl(documentId: string, recordId: string) {
    const url = `${this.discoveryApiUrl}/document-signed-url/${documentId}`;
    //eslint-disable-next-line
    const headers = {
      'Content-Type': 'application/json',
      'data-partition-id': recordId.split(':')[0]
    };
    return this.httpClient.get<ISignedUrlResponse>(url, { headers });
  }

  public async openDocumentUrl(url: string): Promise<void> {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      this.windowRef.nativeWindow.open(url);
    }
  }

  public downloadDocument(url: string): void {
    const frame = this.documentRef.nativeDocument.createElement('iframe');
    frame.setAttribute('src', `${url}`);
    this.documentRef.nativeDocument.body.appendChild(frame);
    setTimeout(() => this.documentRef.nativeDocument.body.removeChild(frame), 10000);
  }
}
