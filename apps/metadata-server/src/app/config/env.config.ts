import {
  IConfigOptions,
  IDatabaseConfig,
  IEnvironmentSettings,
  IMapAccountData,
  ITracingConfig,
  ITypeORMConfig
} from '@apollo/api/interfaces';
import { GaiaTraceClass } from '@apollo/tracer';
import { Injectable, Logger } from '@nestjs/common';
import { IRequestValidationModel } from '@slb-delfi-exploration/dd-infrastructure';

import { BaseConfig } from './base.config';

@Injectable()
@GaiaTraceClass
export class EnvConfig extends BaseConfig {
  constructor(public readonly process: NodeJS.Process, private _logger: Logger) {
    super();
  }

  public async getConfiguration(): Promise<IConfigOptions> {
    return {
      enableCsrfProtection: this.process.env.METADATA_SERVER_CSRF_PROTECTION === 'true',
      endpoint: this.process.env.METADATA_SERVER_ENDPOINT,
      name: this.process.env.METADATA_SERVER_NAME || null,
      port: Number(this.process.env.METADATA_SERVER_PORT) || null,
      requestValidations: this.getRequestValidationsConfig(),
      sourceFileFolder: this.process.env.METADATA_SERVER_SOURCE_FILE_FOLDER
    };
  }

  private getRequestValidationsConfig(): IRequestValidationModel[] {
    const requestValidations = new Array<IRequestValidationModel>();

    if (this.process.env.TRAFFIC_MANAGER_IS_ENABLED === 'true') {
      //  requestValidations.push({
      // cacheTimeout: Number(this.process.env.VALIDATION_CACHE_TIMEOUT_SEC),
      // numberOfRetries: Number(this.process.env.VALIDATION_NUMBERS_OF_RETRIES),
      // retryInterval: Number(this.process.env.VALIDATION_RETRY_INTERVAL),
      // url: this.process.env.TRAFFIC_MANAGER_VALIDATION_ENDPOINT,
      // validationKey: this.process.env.TRAFFIC_MANAGER_VALIDATION_CACHE_KEY
      // });
    }

    return requestValidations;
  }

  public async getTypeORMConfig(): Promise<ITypeORMConfig> {
    return {
      port: Number(this.process.env.DB_PORT || '5432'),
      username: this.process.env.DB_USER,
      password: this.process.env.DB_PASS,
      database: this.process.env.DB_NAME,
      schema: this.process.env.DB_SCHEMA || 'xchange'
    };
  }

  public async getEnvironment(): Promise<IEnvironmentSettings> {
    return {
      app: {
        key: this.process.env.APP_KEY,
        splitKey: this.process.env.SPLITIO_KEY,
        usersnapUrl: this.process.env.USERSNAP_URL
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
        mlAccount: this.process.env.XCHANGE_ML_ACCOUNT
      },
      whatFix: {
        whatFixUrl: this.process.env.WHATFIX_URL
      }
    };
  }

  public getTracingConfig(): ITracingConfig {
    return {
      metricsInterval: Number(this.process.env.METRICS_INTERVAL),
      metricsPort: Number(this.process.env.METRICS_PORT),
      spanProcessorHost: this.process.env.SPAN_PROCESSOR_HOST,
      spanProcessorPort: Number(this.process.env.SPAN_PROCESSOR_PORT),
      serviceName: this.process.env.METADATA_SERVER_NAME
    };
  }

  private getFilteredConfiguration(host: string, emailId: string) {
    try {
      const mapConfigurationList = this.process.env.CONSUMER_DETAILS_FE as any;
      const parsedMapConfigData = JSON.parse(mapConfigurationList.replace(/'/g, '"'));
      const currentHostConfig = parsedMapConfigData.find((mapConfiguration) => mapConfiguration.consumerURL === host);
      const accountDetails = currentHostConfig.accountDetails.find((accountDetail) => accountDetail.testUsers.includes(emailId));
      if (accountDetails) {
        return accountDetails;
      }
      return currentHostConfig.accountDetails.find((accountDetail) => accountDetail.accountName === 'live');
    } catch (error) {
      this._logger.error(`Consumer config parsing failed, ${error}`);
    }
  }

  public getMapConfiguration(host: string, emailId: string): IMapAccountData {
    const mapConfiguration = this.getFilteredConfiguration(host, emailId);
    return {
      mapAccount: mapConfiguration.mapAccount
    };
  }

  public getDataBaseInfo(host: string, emailId: string, object: { key: string; value: string; }) {
    try {
      const { dbId } = this.getFilteredConfiguration(host, emailId);
      const databaseConfiguration = this.process.env.DATABASE_DETAILS_FE as any;
      const parsedDBConfig = JSON.parse(databaseConfiguration.replace(/'/g, '"'));
      const { dbDetails } = parsedDBConfig.find((dbConfig) => dbConfig.dbId === dbId);
      return { dbDetails, databaseConfig: dbDetails.relatedVendorDetails.find((config) => config[object.key] === object.value)};
    } catch (error) {
      this._logger.error(`Consumer database info parsing failed, ${error}`);
    }
  }

  public getDatabaseConfig(host: string, emailId: string): IDatabaseConfig {
    try {
      const { dbDetails, databaseConfig } = this.getDataBaseInfo(host,emailId,{ key: 'associatedConsumerUrl', value: host});
      return {
        schema: databaseConfig.vendorPublishedSchemaName,
        username: dbDetails.dbUsername,
        password: dbDetails.dbPassword
      };
    } catch (error) {
      this._logger.error(`Database config parsing failed, ${error}`);
    }
  }

  public getConsumerAppUrl(host: string,emailId: string, vendorid:string): string {
    try {
      const { databaseConfig } = this.getDataBaseInfo(host,emailId,{ key: 'vendorId', value: vendorid });
      return databaseConfig.associatedConsumerUrl;
    } catch(error) {
      this._logger.error(`Fetching consumer url failed. ${error}`)
    }
  }
}
