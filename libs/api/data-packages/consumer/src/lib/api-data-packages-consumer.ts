/* istanbul ignore file */

export interface DataPackage {
  dataPackageId: string; // "DP-XXX-XXXXXXXXXXXX-XXXXXXXXXXXX"
  subscription: DataPackageSubscription,
  name: string; // "NAM Well Package",
  dataPackageStatus: DataPackageStatus;
  dataPackageStatusState: DataPackageStatusState;
  dataPackageProfile: {
    dataPackageProfileId: string; // "DPP-hj67-90809",
    profile: {
      regions: string[]; // ["North America", "Europe"],
      overview: {
        overView: string; // "This package is a collection of more than four million digital well logs.",
        keyPoints: string[]; // ["Key Point 1", "Key Point 2"]
      },
      featuresAndContents: {
        keyPoints: string[]; // ["Key Point 1", "Key Point 2"]
      },
      media: DataPackageProfileMedia[];
      documents: DataPackageProfileDocuments[];
      opportunity: {
        opportunity: string;
      };
    },
    price: {
      price: number; // 1200,
      onRequest: boolean; // true,
      durationTerm: number; // 12
    }
  },
  vendorId: string; // "v-ad-1256"
}

export interface DataPackageSubscription {
  status: DataPackageSubscriptionStatus;
  subscriptionStartTime: string; // "2021-08-03T11:08:21.21+00:00",
  subscriptionEndTime: string; // "2021-08-03T11:08:21.21+00:00",
  lastRequestTime: string; // "2021-08-03T11:08:21.21+00:00"
}

export enum DataPackageSubscriptionStatus {
  Active = 'Active',
  Approved = 'Approved',
  Requested = 'Requested',
  Expired = 'Expired',
  Void = 'Void'
}

export enum DataPackageStatus {
  Draft = 'Draft',
  Published = 'Published',
  Unpublished = 'Unpublished',
  Unpublishing = 'Unpublishing',
  Publishing = 'Publishing'
}

export enum DataPackageStatusState {
  Success = 'Success',
  Fail = 'Fail',
  InProgress = 'In Progress'
}

export interface DataPackageProfileMedia {
  fileId: string; // "f-xtr45-75675",
  fileName: string; // "image1.png",
  fileType: string; // "image",
  caption: string; // "caption"
}

export interface DataPackageProfileDocuments {
  fileId: string; // "f-xtr45-75676",
  fileName: string; // "report.pdf",
  fileType: string; // "pdf",
  caption: string; // "caption"
}
export interface DataSubscriptions {
  vendorId: string;
  dataSubscriptionId: string;
  dataPackageId: string;
  billingAccountId: string;
  dataSubscriptionStatus: string;
  subscriptionRequestId: string;
  subscriptionPrice: number;
  subscriptionDuration: number;
  requestedBy: string;
  status?: null;
  transactionId: string;
  startDate: string;
  endDate: string;
  subscriptionFor: string;
}

export interface DataRequests {
  subscriptionRequestId: string;
  requestedBy: string;
  dataPackageId: string;
  dataPackageName: string;
  requestStatus: string;
  userId: string;
  requestedOn: string;
}
