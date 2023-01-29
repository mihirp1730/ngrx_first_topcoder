import {
  IConfigOptions,
  IDatabaseConfig,
  IEnvironmentSettings,
  IMapAccountData,
  ITracingConfig,
  ITypeORMConfig
} from '@apollo/api/interfaces';

export abstract class BaseConfig {
  public abstract getConfiguration(): Promise<IConfigOptions>;
  public abstract getEnvironment(): Promise<IEnvironmentSettings>;
  public abstract getTypeORMConfig(): Promise<ITypeORMConfig>;
  public abstract getTracingConfig(): ITracingConfig;
  public abstract getMapConfiguration(host: string, emailId: string): IMapAccountData;
  public abstract getDatabaseConfig(host: string, emailId: string): IDatabaseConfig;
  public abstract getConsumerAppUrl(host: string, emailId: string, vendorid: string): string;
}
