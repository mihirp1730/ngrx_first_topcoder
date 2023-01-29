import { Injectable } from "@angular/core";
import {GisMapLargeService,} from "@slb-innersource/gis-canvas";

@Injectable({
    providedIn: 'root'
})
export class LassoPersistenceService{

    private _drawingId :string|undefined;

    constructor(private gisMapLargeService: GisMapLargeService){}

    drawLassoShape(spatialQuery: string) :void{
        this._drawingId = this.gisMapLargeService.drawingManager?.addDrawingFromWKT(spatialQuery);
    }

    clearLassoShape(): void{
        if(this._drawingId){
            this.gisMapLargeService.drawingManager.removeDrawing(this._drawingId);
        }
    }
}