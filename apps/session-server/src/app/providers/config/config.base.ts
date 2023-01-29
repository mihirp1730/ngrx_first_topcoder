import { Interfaces } from '@apollo/server/services';
import { ITracingConfig } from '@apollo/api/interfaces';

export abstract class ConfigBase {
  public abstract isDeployed(): Promise<boolean>;

  public abstract logStorage(): Promise<LogStorage>;

  public abstract sessionStorage(): Promise<SessionStorage>;

  public abstract getTracingConfig(): ITracingConfig;
}

export interface LogStorage {
  type: string;
}

export interface SessionStorage {
  defaultUserSession: Interfaces.Atlas.Session.UserSession;
  type: string;
}
