/**
 * User profile data.
 * Structure from `ccmServiceHost` API endpoint `userContext/v1/currentContext`.
 */
export interface UserProfile {
  account: {
    billingAccountId: string;
    name: string;
  };
  contract: {
    contractId: string;
    name: string;
  };
  dataPartition: {
    dataPartitionId: string;
    name: string;
  };
  department: {
    departmentId: string;
    name: string;
  };
}

/**
 * User subscription data.
 * Structure from `ccmServiceHost` API endpoint `userSubscription/v1/userSubscriptions`.
 * Generated from sample JSON data on 2020-06-22.
 */
export interface ResponseUserSubscription {
  billingAccountId: string;
  billingAccountName: string;
  contractId: string;
  subscriptions: UserSubscription[];
}

/**
 * Extracted subscription data from the ResponseUserSubscription
 */
export interface UserSubscription {
  departmentId: string;
  departmentName: string;
  product: {
    code: string;
    featureSets: {
      applicationCode: string;
      applicationName: string;
      claims: string[];
      name: string;
    }[];
    groupId: string;
    name: string;
    partNumber: string;
  };
  region: string;
  subscriptionId: string;
  userId: string;
}

/**
 * List of alphanumeric part numbers of a product, from an user subscriptions.
 *
 * The data is obtained from `ResponseUserSubscriptions` structure.
 */
export type UserSubsProductsPartNumbers = string[];

/**
 * Response data returned from User account validation methods.
 *
 * Indicates if validation passed, and user data (if available).
 */
export interface UserValidationData {
  pass: boolean;
  userProfile?: UserProfile;
  subscriptions?: UserSubscription[];
}
