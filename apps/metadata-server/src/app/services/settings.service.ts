import { IDatabaseConfig, IEnvironmentSettings, IMapAccountData } from '@apollo/api/interfaces';
import { GaiaTraceClass } from '@apollo/tracer';
import { Injectable } from '@nestjs/common';
import { BaseConfig } from '../config/base.config';

@Injectable()
@GaiaTraceClass
export class SettingsService {
  constructor(private config: IEnvironmentSettings, private baseConfig: BaseConfig) {}

  public getEnvironmentSettings(): IEnvironmentSettings {
    return { ...this.config };
  }

  public getMapConfiguration(host: string, emailId: string): IMapAccountData {
    return this.baseConfig.getMapConfiguration(host, emailId);
  }

  public getDatabaseConfiguration(host: string, emailId: string): IDatabaseConfig {
    return this.baseConfig.getDatabaseConfig(host, emailId);
  }

  public getHostAssociatedConsumerUrl(host:string, emailId: string, vendorid: string) {
    return this.baseConfig.getConsumerAppUrl(host,emailId, vendorid);
  }
}
