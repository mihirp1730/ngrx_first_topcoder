export interface ICreateDataPackageRequest {
  dataPackageName: string;
}

export interface ICreateDataPackageResponse {
  dataPackageId: string;
}

export interface ICreateMarketingRepresentationRequest {
  type: string;
  fileId: string;
}

export interface ICreateMarketingRepresentationResponse {
  marketingRepresentationId: string;
}

export interface IGetMarketingRepresentationsResponse {
  marketingRepresentations: Array<IMarketingRepresentation>;
}

export interface IMarketingRepresentation {
  marketingRepresentationId: string;
  type: string;
  fileId: string;
  fileName: string;
}

export interface IDeleteMarketingRepresentationsResponse {
  marketingRepresentationId: string;
}

export interface IGetPublishedDataPackagesResponse {
  dataPackages: Array<IGetDataPackageResponse>;
}

export const enum IDataPackageStatus {
  Draft = 'DRAFT',
  Published = 'PUBLISHED'
}

export interface IPublishPackageResponse {
  data: {
    traceId: string;
    message: string;
  };
}

export interface IAssociateDeliverableRequest {
  recordId: string;
  dataType: string;
}

export interface IAssociateDeliverableResponse {
  dataItemId: string;
}

export interface ISavePackageProfileRequest {
  profile: {
    regions: Array<string>;
    overview: {
      overView: string;
      keyPoints: Array<string>;
    };
    featuresAndContents: {
      keyPoints: Array<string>;
    };
    media: Array<IMediaFile>;
    documents: Array<IDocumentFile>;
    opportunity: {
      opportunity: string;
    }
  };
  price: {
    onRequest: boolean;
    price: number;
    durationTerm: number;
  };
}

export interface ISavePackageProfileResponse {
  dataPackageProfileId: string;
}

export interface IRetrieveDeliverableResponse {
  dataItems: Array<IDataItem>;
}

export interface IDataItem {
  recordId: string;
  fileName?: string;
}

export interface IUpdatePackageNameRequest {
  dataPackageId: string;
  dataPackageName: string;
}

export interface IRegionOptions {
  viewText: string;
}

export interface IGetDataPackageResponse {
  dataPackageId: string;
  name: string;
  dataPackageStatus?: string;
  dataPackageProfile: IDataPackageProfileResponse;
  vendorId: string;
  vendorName?: string;
}

export interface IDataPackageProfileResponse {
  profile: {
    regions: Array<string>;
    overview: {
      overView: string;
      keyPoints: Array<string>;
    };
    featuresAndContents: {
      keyPoints: Array<string>;
    };
    media: Array<IMediaFile>;
    documents: Array<IDocumentFile>;
    opportunity: {
      opportunity: string;
    }
  };
  price: {
    onRequest: boolean;
    price: number;
    durationTerm: number;
  };
}

export interface ISignedUrlResponse {
  signedURL: string;
}

// App interfaces to convert API responses

export interface IDataPackage {
  id: string;
  name: string;
  status: string;
  profile: IDataPackageProfile;
  price: IDataPackagePrice;
  marketingRepresentations: Array<IMarketingRepresentation>;
  deliverables: Array<IDataItem>;
}

export interface IDataPackageProfile {
  regions: Array<string>;
  overview: {
    description: string;
    keypoints: Array<string>;
  };
  featuresAndContents: {
    keypoints: Array<string>;
  };
  media: Array<IMediaFile>;
  documents: Array<IDocumentFile>;
  opportunity: {
    opportunity: string;
  }
}

export interface IDataPackagePrice {
  onRequest: boolean;
  price: number;
  duration: number;
}

export interface IMediaFile {
  fileId: string;
  fileName: string;
  fileType: string;
  caption: string;
}

export interface IDocumentFile {
  fileId: string;
  fileName: string;
  fileType: string;
  caption: string;
}