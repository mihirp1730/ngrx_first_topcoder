import { ResultsResponseResult } from '@apollo/api/data-packages/vendor';
import { GaiaTraceClass } from '@apollo/tracer';

import * as mockData from '../../mock-data';
import { BaseDataSource } from './base.data-source';

/* istanbul ignore next */
@GaiaTraceClass
export class InMemoryDataSource extends BaseDataSource {
  readonly mockPackages: ResultsResponseResult[] = [];

  constructor(
    public readonly mockPackageCount: number
  ) {
    super();
    // TODO: remove later once actual data source is connected:
    this.mockPackages = mockData.generateMockData(this.mockPackageCount);
  }

  public async init(): Promise<BaseDataSource> {
    return this;
  }

  public async queryPackages(): Promise<ResultsResponseResult[]> {
    return [...this.mockPackages];
  }
}
