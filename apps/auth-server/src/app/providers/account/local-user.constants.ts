import { UserProfile, UserSubscription } from './user.models';

/** User profile data for local/development usage. */
export const LOCAL_USER: UserProfile = {
  account: {
    billingAccountId: '1-wg-multiclient-ba',
    name: 'wg-multiclient-ba'
  },
  contract: {
    contractId: 'wg-multiclient-dev-1',
    name: 'wg-multiclient-dev-1'
  },
  dataPartition: {
    dataPartitionId: 'wgmc',
    name: 'wgmc'
  },
  department: {
    departmentId: '123eeb9a-fba4-435a-a144-e086ae81fe56',
    name: 'Default'
  }
};

/** User subscription data for local/development usage. */
export const LOCAL_USER_SUBSCRIPTIONS: UserSubscription[] = [
  {
    departmentId: '123eeb9a-fba4-435a-a144-e086ae81fe56',
    departmentName: 'Default',
    product: {
      code: 'gaia-viz-base',
      featureSets: [{ applicationCode: 'gaia', applicationName: 'Gaia', claims: ['Gaia_View'], name: 'Base' }],
      groupId: 'Gaia',
      name: 'GAIA',
      partNumber: 'MCVW-TO-SUBU'
    },
    region: 'dev',
    subscriptionId: '',
    userId: ''
  }
];
