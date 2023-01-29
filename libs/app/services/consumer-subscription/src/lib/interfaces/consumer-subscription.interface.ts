export interface IGetSubscriptionsResponse {
    items: Array<ISubscription>;
}

export interface ISubscription {
    vendorId: string;
    dataSubscriptionId: string;
    billingAccountId: string;
    dataPackageId: string;
    dataSubscriptionStatus: string;
    subscriptionRequestId: string;
    subscriptionPrice: number;
    subscriptionDuration: number;
    requestedOn?: string;
    requestedBy: string;
    status: string;
    transactionId: string;
    startDate: string;
    endDate: string;
    subscriptionFor: string;
    dataItems: string[];
}

export interface ISubscriptionIdentifier {
    dataSubscriptionId: string;
    billingAccountId: string;
    dataItemId: string;
}

export interface IDataItemID {
    dataItemId: string;
}
export interface IDataItems {
    items: IDataItemID[];
}