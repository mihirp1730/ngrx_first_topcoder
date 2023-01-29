export interface IGetRequestsResponse {
  items: Array<IRequest>;
}

export interface IRequest {
  subscriptionRequestId: string;
  dataPackageId: string;
  dataPackageName: string;
  comment: string;
  requestedBy: string;
  vendorId: string;
  requestStatus: string;
  requestedOn: string;
  requesterName: string;
}

export interface ICreateSubscriptionReqBody {
  dataPackageId: string;
  subscriptionRequestId: string;
  subscriptionPrice: number;
  subscriptionDuration: number;
  startDate: string;
  endDate: string;
  transactionDetail: {
    transactionId: string;
  };
  customerDetail: {
    customerId: string;
    customerName: string;
    companyName: string;
  };
}

export interface ICreateSubscriptionResponse {
  dataSubscriptionId: string;
}

export interface IGetManageSusbcriptionResponse {
  items: Array<IManageSubscription>;
}

export interface IManageSubscription {
  subscriptionRequestId: string;
  dataPackageName:string;
  subscriptionId: string;
  subscriptionPrice: number;
  subscriptionDuration: number;
  startDate: string;
  endDate: string;
  transactionDetail: {
    transactionId: string;
  };
  customerDetail: {
    customerId: string;
    customerName: string;
  };
  dataSubscriptionStatus:string;
}

export interface ISubscriptionRequestsBody {
  dataPackageId: string;
  comment: string;
  companyName: string;
}

export interface ICreateSubscriptionResponse {
  dataSubscriptionRequestId: string;
}
