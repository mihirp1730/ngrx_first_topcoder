/* istanbul ignore file */

export interface FiltersResponse {
  dataTypes: null | PackageDataType[];
  regions: null | string[];
  lastModifiedDateRange: null | {
    max: string;
    min: string;
  };
  sortByOptions: SortByOption[];
}

export interface FilterRequest {
  filters: {
    status: {
      value: null | PackageStatuses[];
    }
    region: {
      value: null | string[];
    }
    dataType: {
      value: null | string[];
    }
  };
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ResultsRequest {
}

export interface ResultsResponse {
  totalResults: number;
  results: ResultsResponseResult[];
}

export interface ResultsResponseResult {
  id: string;
  image: IMedia | null;
  name: string;
  status: PackageStatuses;
  dataType: string[];
  region: string[];
  createdBy: string;
  createdOn: string;
  lastUpdatedBy: string;
  lastUpdatedOn: string;
  subscriptionsActive: number;
  subscriptionsPending: number;
}

export enum PackageStatuses {
  Draft = 'draft',
  Publishing = 'publishing',
  Published = 'published',
  Unpublished = 'unpublished'
}

export interface PackageDataType {
  id: string;
  name: string;
  shape: string;
}

export interface SortByOption {
  id: string;
  name: string;
}

export interface IDataPackageDetails {
  dataPackageId: string;
  name: string;
  status: string;
  dataPackageProfile: IDataPackageProfile | null;
  createdBy: string;
  createdDate: string;
  lastModifiedBy: string;
  lastModifiedDate: string;
  vendorId: string;
}

export interface IDataPackageProfile {
  overview: IOverview | null;
  featuresAndContents: IFeaturesAndContents | null;
  dataPackagePrice: IDataPackagePrice | null;
  regions: string[];
  media: IMedia[];
}

export interface IOverview {
  overview: string;
  keyPoints: string[];
}

export interface IFeaturesAndContents {
  keyPoints: string[];
}

export interface IDataPackagePrice {
  price: number | string;
  onRequest: boolean;
  durationTerm: number;
}

export interface IMedia {
  fileId: string;
  fileName: string;
  fileType: string;
  caption: string;
  profileImage: boolean;
}
