import {
  IConfigOptions,
  IDatabaseConfig,
  IEnvironmentSettings,
  IMapAccountData,
  ITracingConfig,
  ITypeORMConfig
} from '@apollo/api/interfaces';
import { GaiaTraceClass } from '@apollo/tracer';
import { Injectable } from '@nestjs/common';

import { BaseConfig } from './base.config';
import { localVariables } from './local-variables';

/**
 * Class instantiates config data.
 */
@Injectable()
@GaiaTraceClass
export class LocalConfig extends BaseConfig {
  constructor(public readonly process: NodeJS.Process) {
    super();
  }

  public async getConfiguration(): Promise<IConfigOptions> {
    return {
      enableCsrfProtection: false,
      endpoint: '/api/metadata/',
      name: 'metadata-server',
      port: 3334,
      requestValidations: null,
      sourceFileFolder: 'apps/metadata-server/src/data/metadata'
    };
  }

  public async getTypeORMConfig(): Promise<ITypeORMConfig> {
    return {
      port: localVariables.TYPEORM_PORT,
      username: localVariables.TYPEORM_USERNAME,
      password: localVariables.TYPEORM_PASSWORD,
      database: localVariables.TYPEORM_DATABASE,
      schema: localVariables.TYPEORM_SCHEMA
    };
  }

  public async getEnvironment(): Promise<IEnvironmentSettings> {
    return {
      app: {
        key: this.process.env.APP_KEY,
        splitKey: null,
        usersnapUrl: localVariables.USERSNAP_URL
      },
      map: {
        deploymentUrl: this.process.env.MAP_DEPLOYMENT_URL,
        layerConfigUrl: this.process.env.MAP_LAYER_CONFIG_URL,
        productId: this.process.env.MAP_PRODUCT_ID
      },
      wellbore: {
        serviceURL: this.process.env.WELLBORE_SERVICE_URL,
        apiKey: this.process.env.WELLBORE_API_KEY
      },
      xchange: {
        mlAccount: localVariables.XCHANGE_ML_ACCOUNT
      },
      whatFix: {
        whatFixUrl: localVariables.WHATFIX_URL
      }
    };
  }

  public getTracingConfig(): ITracingConfig {
    return {
      metricsInterval: localVariables.METRICS_INTERVAL,
      metricsPort: localVariables.METRICS_PORT,
      spanProcessorHost: localVariables.SPAN_PROCESSOR_HOST,
      spanProcessorPort: localVariables.SPAN_PROCESSOR_PORT,
      serviceName: localVariables.METADATA_SERVER_NAME,
      isDev: localVariables.DEV_MODE
    };
  }

  private getFilteredConfiguration(host: string, emailId: string) {
    const mapConfigurationList = localVariables.CONSUMER_DETAILS_FE as any;
    const parsedMapConfigData = JSON.parse(mapConfigurationList.replace(/'/g, '"'));
    const currentHostConfig = parsedMapConfigData.find((mapConfiguration) => mapConfiguration.consumerURL === host);
    const accountDetails = currentHostConfig.accountDetails.find((accountDetail) => accountDetail.testUsers.includes(emailId));
    if (accountDetails) {
      return accountDetails;
    }
    return currentHostConfig.accountDetails.find((accountDetail) => accountDetail.accountName === 'live');
  }

  public getMapConfiguration(host: string, emailId: string): IMapAccountData {
    const mapConfiguration = this.getFilteredConfiguration(host, emailId);
    return {
      mapAccount: mapConfiguration.mapAccount
    };
  }

  public getDataBaseInfo(host: string, emailId: string, object: { key: string; value: string; }) {
    const { dbId } = this.getFilteredConfiguration(host, emailId);
    const databaseConfiguration = localVariables.DATABASE_DETAILS_FE as any;
    const parsedDBConfig = JSON.parse(databaseConfiguration.replace(/'/g, '"'));
    const { dbDetails } = parsedDBConfig.find((dbConfig) => dbConfig.dbId === dbId);
    return { dbDetails, databaseConfig: dbDetails.relatedVendorDetails.find((config) => config[object.key] === object.value)};
  }

  public getDatabaseConfig(host: string, emailId: string): IDatabaseConfig {
    const { dbDetails, databaseConfig } = this.getDataBaseInfo(host,emailId,{ key: 'associatedConsumerUrl',value: host});
    return {
      schema: databaseConfig.vendorPublishedSchemaName,
      username: dbDetails.dbUsername,
      password: dbDetails.dbPassword
    };
  }

  public getConsumerAppUrl(host: string, emailId: string, vendorid:string): string {
    const { databaseConfig } = this.getDataBaseInfo(host,emailId,{ key:'vendorId', value: vendorid });
    return databaseConfig.associatedConsumerUrl;
  }
}
