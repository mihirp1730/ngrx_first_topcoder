import { IOpportunityDuration } from '@apollo/app/services/opportunity';

export const durationDropdownValues: IOpportunityDuration[] = [
  { viewText: 'Unlimited (Manual Expiry)', value: 99 * 12 },
  { viewText: '1 year', value: 12 },
  { viewText: '6 months', value: 6 },
  { viewText: '3 months', value: 3 },
  { viewText: 'Custom', value: -1 }
];
