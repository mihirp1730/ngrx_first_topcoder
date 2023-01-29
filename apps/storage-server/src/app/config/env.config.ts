import { IStorageConfig } from '@apollo/api/interfaces';
import { Injectable } from '@nestjs/common';

import { BaseConfig } from './base.config';

@Injectable()
export class EnvConfig extends BaseConfig {
  constructor(public readonly process: NodeJS.Process) {
    super();
  }

  public async getEnvironment(): Promise<IStorageConfig> {
    return {
      key: this.process.env.APP_KEY,
    }
  };
}
