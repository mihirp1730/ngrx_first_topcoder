import { IDiscoveryConfig } from '@apollo/api/interfaces';

export abstract class BaseConfig {
  public abstract getEnvironment(): Promise<IDiscoveryConfig>;
}
