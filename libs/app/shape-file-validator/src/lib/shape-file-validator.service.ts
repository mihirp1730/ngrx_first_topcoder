/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { IMarketingRepresentation } from '@apollo/api/interfaces';
import { MetadataService } from "@apollo/app/metadata";
import * as Comlink from 'comlink';
import { find } from 'lodash';

import { EShapeType, IValidationErrorResponse, IValidationSuccessResponse } from './interfaces';
import { ShapeFileProcessor } from './shape-file-processor';

export const SHAPE_FILE_VALIDATOR_WORKER_FACTORY = new InjectionToken<() => Worker>('shapeFileValidatorWorker');

@Injectable({
  providedIn: 'root'
})
export class ShapeFileValidatorService {

  selectedDataType = '';

  constructor(
    @Inject(SHAPE_FILE_VALIDATOR_WORKER_FACTORY) private readonly shapeFileValidatorWorker: any,
    private metadataService: MetadataService
  ) { }

  async initValidation(file: File, selectedDataType: string): Promise<boolean | IValidationErrorResponse> {
    let error: IValidationErrorResponse = { message: '' };

    this.selectedDataType = selectedDataType;
    const worker = this.shapeFileValidatorWorker;
    const ShapeFileProcessorWrapper = <typeof ShapeFileProcessor>(Comlink.wrap(worker) as unknown);
    const shapeFileProcessor = await new ShapeFileProcessorWrapper();

    // Getting shapetype from Metadata service
    const filteredShapeType = await this.getShapeFromLayer();

    return new Promise<boolean | IValidationErrorResponse>((resolve, reject) => {
      shapeFileProcessor.load(file).then((res: IValidationSuccessResponse) => {
        if(res.geometry) {
          if(filteredShapeType) {
            const message = this.validateGeometry(filteredShapeType, res);
            if(message) {
              error.message = message;
              reject(error);
            } else {
              resolve(true);
            }
          } else {
            error.message = 'Something went wrong!';
            reject(error);
          }
        } else {
          error.message = 'Invalid shape type!';
          reject(error);
        }

      }).catch((err: IValidationErrorResponse) => {
        error = err;
        reject(error);
      });
    });
  }

  async getShapeFromLayer(): Promise<string> {
    const mrLayerDetails = await this.metadataService.marketingLayers$.toPromise();
    const filteredLayer: IMarketingRepresentation = find(mrLayerDetails, (item) => item.layerName === this.selectedDataType);
    const filteredShapeType = filteredLayer?.shapeType || '';
    return filteredShapeType.split('.').length > 1 ? filteredShapeType.split('.')[1] : '';
  }

  validateGeometry(filteredShapeType: string, response: IValidationSuccessResponse): string {
    let validationMessage;
    switch (filteredShapeType) {
      case 'poly':
        if(response.geometry !== EShapeType.Polygon && response.geometry !== EShapeType.PolygonZ) {
          validationMessage = "Upload failed! Expected Geometry type is 'Polygon' for selected data type";
        }
        break;
      case 'dot':
        if(response.geometry !== EShapeType.Point && response.geometry !== EShapeType.PointZ) {
          validationMessage = "Upload failed! Expected Geometry type is 'Point' for selected data type";
        }
        break;
      case 'line':
        if(response.geometry !== EShapeType.PolyLine && response.geometry !== EShapeType.PolyLineZ) {
          validationMessage = "Upload failed! Expected Geometry type is 'Line' for selected data type";
        }
        break;
    }
    return validationMessage;
  }
}
