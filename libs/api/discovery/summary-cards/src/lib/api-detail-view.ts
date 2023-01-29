export interface IDetailViewResponse {
  result: IDetailView;
}

export interface IDetailView {
  recordId: string;
  documents: IDocumentDetail[];
}

export interface IDocumentDetail {
  name: string;
  fileType: string | null;
  documentId: string;
}

export interface ISignedUrlResponse {
  signedUrl: string
}
