import { CatalogMedia, IMlConnectionInfo, IOpportunity } from '@apollo/app/services/opportunity';

import { IMarketingRepresentation } from '@apollo/api/interfaces';

type MyType = string[] | '' | null;
export interface State {
  opportunities: IOpportunity[];
  catalogMedia: CatalogMedia[];
  isLoadingWhileGetting: boolean;
  opportunitySubscriptionIds: string[];
  pendingPublishedOpportunityIds: string[];
  filters: {
    opportunityName: string | null;
    assetType: MyType;
    offerType: MyType;
    deliveryType: MyType;
    status: MyType;
  },
  mlConnectionInfo: IMlConnectionInfo,
  layerMetadata: IMarketingRepresentation[],
  activeTables: any[],
  dataObjectsFetched: boolean
}

export const initialState: State = {
  opportunities: [],
  catalogMedia: [],
  isLoadingWhileGetting: false,
  opportunitySubscriptionIds: [],
  pendingPublishedOpportunityIds: [],
  filters: {
    opportunityName: null,
    assetType: null,
    offerType: null,
    deliveryType: null,
    status: null
  },
  mlConnectionInfo: null,
  layerMetadata: [],
  activeTables: [],
  dataObjectsFetched: false
};
