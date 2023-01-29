import { Injectable } from '@angular/core';
import { GisMapLargeService } from '@slb-innersource/gis-canvas';

@Injectable({
  providedIn: 'root'
})
export class GisHandlerService {
  constructor(private gisMapLargeService: GisMapLargeService) {}

  setZoom(width: number) {
    let zoom = 0;
    if (width > 2000) {
      zoom = 3;
    } else if (width > 1600) {
      zoom = 2;
    }
    this.gisMapLargeService.setZoom(zoom);
  }
}
