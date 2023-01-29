import { Injectable } from '@angular/core';
import { IOnDataSelectionResult } from '@slb-innersource/gis-canvas/gis-canvas-widget/services/gis-map.service';

@Injectable({
  providedIn: 'root'
})
export class GisLayerService {
  // Using 'any[]' because there is no type provided by GisCanvas yet.
  gisLayers: any[];
  // We put selection results into this service because we can't yet
  // put them into the NgRx store. The GisCanvas mutates the results
  // and when they're in the store the results are immutable and an
  // error occurs.
  selectionResults: IOnDataSelectionResult;
}
