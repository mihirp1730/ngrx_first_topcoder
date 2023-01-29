/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { Inject, Injectable, InjectionToken } from '@angular/core';
import * as Comlink from 'comlink';

import { GeojsonFileProcessor } from './geojson-file-processor';

export const GEOJSON_FILE_VALIDATOR_WORKER_FACTORY = new InjectionToken<() => Worker>('geojsonFileProcessor');

@Injectable({
  providedIn: 'root'
})
export class GeoJsonFileValidatorService {

  selectedDataType = '';

  constructor(@Inject(GEOJSON_FILE_VALIDATOR_WORKER_FACTORY) private readonly geojsonFileProcessorWorker: any) {}

  async initValidation(file: File, shapeType): Promise<boolean | { valid: boolean; message: string }> {
    const worker = this.geojsonFileProcessorWorker;
    const GeojsonFileProcessorWrapper = <typeof GeojsonFileProcessor>(Comlink.wrap(worker) as unknown);
    const geojsonFileProcessor = await new GeojsonFileProcessorWrapper();
    return new Promise<boolean | { valid: boolean; message: string }>((resolve, reject) => {
      geojsonFileProcessor
        .load(file, shapeType)
        .then((res) => {
          if (res.valid) {
            resolve(true);
          } else {
            reject(res);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}
