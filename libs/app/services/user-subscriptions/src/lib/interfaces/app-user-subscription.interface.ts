export interface IUserSubscriptionResponse {
  hasAcceptedTerms: boolean;
  userSubscriptions: IUserSubscription[];
}

interface IUserSubscription {
  subscriptions: ISubscription[];
  billingAccountId: string;
}

interface ISubscription {
  billingAccountId: string;
  billingAccountName: string;
  contractId: string;
  product: IProduct;
}

interface IProduct {
  code: string;
  featureSets: IFeatureSet[];
}

interface IFeatureSet {
  applicationCode: string;
  applicationName: string;
}
