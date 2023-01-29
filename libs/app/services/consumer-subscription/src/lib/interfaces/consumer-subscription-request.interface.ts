export interface ISubscriptionRequestsResponse {
    items: Array<ISubscriptionRequest>;
}

export interface ISubscriptionRequest {
    subscriptionRequestId: string;
    dataPackageId: string;
    dataPackageName: string;
    requestedBy: string;
    requestedOn: string;
    requestStatus: string;
}
