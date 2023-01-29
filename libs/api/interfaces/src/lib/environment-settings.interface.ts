export interface IEnvironmentSettings {
  app: IAppConfig;
  map: IMapConfig;
  wellbore: IWellboreConfig;
  xchange: IXChangeConfig;
  whatFix?: IWhatFixConfig;
}

export interface IExclusiveMapConfig {
  consumerURL: string;
  mapType: string;
  dbId: string;
  mapDetails: {
    mapAccount: string;
    mapUrl: string;
    schema: string;
  };
}

export interface IMapConfig {
  deploymentUrl: string;
  layerConfigUrl: string;
  productId: string;
}

export interface IAppConfig {
  key: string;
  splitKey: string;
  usersnapUrl: string;
}

export interface IWellboreConfig {
  serviceURL: string;
  apiKey: string;
}

export interface IXChangeConfig {
  mlAccount: string;
}

export interface IWhatFixConfig {
  whatFixUrl: string;
}

export interface IDiscoveryConfig {
  key: string;
}

export interface IStorageConfig {
  key: string;
}
