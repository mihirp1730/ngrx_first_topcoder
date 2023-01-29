import { IDiscoveryConfig } from '@apollo/api/interfaces';
import { Injectable } from '@nestjs/common';

import { BaseConfig } from './base.config';

/**
 * Class instantiates config data.
 */
@Injectable()
export class LocalConfig extends BaseConfig {
  constructor(public readonly process: NodeJS.Process) {
    super();
  }

  public async getEnvironment(): Promise<IDiscoveryConfig> {
    return {
        key: this.process.env.APP_KEY
    };
  }
}
