import { ITracingConfig } from '@apollo/api/interfaces';
import { DataSourceTypes as ConsumerDataSourceTypes } from '@apollo/server/data-packages/consumer';
import { DataSourceTypes as VenderDataSourceTypes } from '@apollo/server/data-packages/vendor';
import { GrpcDetails as IOpportunityAttendeeGrpc } from '@apollo/server/opportunity/attendee';
import { IOpportunityHostRequestConfig } from '@apollo/server/opportunity/host';

export interface IEnvironment {
  production: boolean;
  consumerDataSourceTypes: ConsumerDataSourceTypes;
  venderDataSourceTypes: VenderDataSourceTypes;
  tracingConfig: ITracingConfig;
  opportunityAttendeeGrpcDetails: IOpportunityAttendeeGrpc;
  opportunityHostConfig: IOpportunityHostRequestConfig;
}
