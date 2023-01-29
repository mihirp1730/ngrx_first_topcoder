import { GeoJsonShapes } from '../lib/interfaces';

export class GeojsonFileProcessor {
  public response = { valid: false, message: '' };
  public fileReaderFactory = () => new FileReader();
  async load(file: File, shapeType): Promise<{ valid: boolean; message: string }> {
    const reader = this.fileReaderFactory();
    return new Promise((resolve, reject) => {
      reader.onloadend = () => {
        const fileContent = JSON.parse(<string>reader.result);
        this.validateGeojson(fileContent, shapeType);
        if (this.response.valid) {
          resolve(this.response);
        } else {
          reject(this.response);
        }
      };
      reader.onerror = () => {
        this.response = { valid: false, message: 'File read error occurred!' };
        reject(this.response);
      };
      reader.readAsText(file);
    });
  }

  validateGeojson(fileContent, shapeType) {
    if(shapeType === 'geo.dot') {
      if (fileContent?.features?.length) {
        const validity = fileContent.features.every((element) => {
          return element?.geometry?.type === GeoJsonShapes.Point || element?.geometry?.type === GeoJsonShapes.MultiPoint;
        });
        if (!validity) {
          this.response.message = 'This geojson file contains invalid geometry type!. Allowed types are Point and MultiPoint only';
          this.response.valid = false;
        } else {
          this.response.valid = true;
        }
      } else {
        this.response.message = 'This geojson contains invalid data!. Please upload a valid one';
        this.response.valid = false;
      }
    } else if (shapeType === 'geo.line') {
      if (fileContent?.features?.length) {
        const validity = fileContent.features.every((element) => {
          return element?.geometry?.type === GeoJsonShapes.Line;
        });
        if (!validity) {
          this.response.message = 'This geojson file contains invalid geometry type!. Allowed types is Line only';
          this.response.valid = false;
        } else {
          this.response.valid = true;
        }
      } else {
        this.response.message = 'This geojson contains invalid data!. Please upload a valid one';
        this.response.valid = false;
      }
    } else {
      if (fileContent?.features?.length) {
        const validity = fileContent.features.every((element) => {
          return element?.geometry?.type === GeoJsonShapes.MultiPolygon || element?.geometry?.type === GeoJsonShapes.Polygon;
        });
        if (!validity) {
          this.response.message = 'This geojson file contains invalid geometry type!. Allowed types are Polygon and MultiPolygon only';
          this.response.valid = false;
        } else {
          this.response.valid = true;
        }
      } else {
        this.response.message = 'This geojson contains invalid data!. Please upload a valid one';
        this.response.valid = false;
      }

    }
   
  }
}
