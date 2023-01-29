import { Unzipped, unzipSync } from 'fflate';
import { EShapeType, IShapeHeader, IValidationErrorResponse, IValidationSuccessResponse, REQUIRED_FILES_IN_SHAPE_FILE } from './interfaces';

import { ShapeHeaderReader } from './shape-file-header-reader';

export class ShapeFileProcessor {

  errorResponse: IValidationErrorResponse = { message: '' };
  successResponse: IValidationSuccessResponse = { geometry: EShapeType.Null };

  async load(file: File): Promise<IValidationSuccessResponse | IValidationErrorResponse> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const zippedOutput = unzipSync(new Uint8Array(reader.result as ArrayBuffer), {
            // You may optionally supply a filter for files. By default, all files in a
            // ZIP archive are extracted, but a filter can save resources by telling
            // the library not to decompress certain files
            filter(fileInZip) {
              const extension = fileInZip.name.split('.')[fileInZip.name.split('.').length-1];
              return REQUIRED_FILES_IN_SHAPE_FILE.includes(extension);
            }
          });
          if (this.checkRequiredFilesInFile(zippedOutput)) {
            this.successResponse.geometry = (await this.extractGeometry(zippedOutput)).type;
            resolve(this.successResponse);
          } else {
            this.errorResponse.message = `Invalid shape file -
            Shape file needs to be a zip file containing a 'dbf',
            a 'shp', and a 'shx' file' (Upload failed.
            Missing one or more mandatory files)`;
            reject(this.errorResponse);
          }
        } catch(error) {
          this.errorResponse.message = 'Something went wrong!';
          reject(this.errorResponse);
        }
      };
      reader.onerror = () => reject(false);
      reader.readAsArrayBuffer(file);
    });
  }

  checkRequiredFilesInFile(zippedOutput) {
    const fileExts = Object.keys(zippedOutput).map(key => key.split('.')[key.split('.').length-1]);
    return REQUIRED_FILES_IN_SHAPE_FILE.every(item => fileExts.includes(item));
  }

  async extractGeometry(zippedOutput: Unzipped): Promise<IShapeHeader> {
    for (const [fileName, content] of Object.entries(zippedOutput)) {
      if (fileName.includes('.shx')) {
        const shapeReader = await ShapeHeaderReader.fromArrayBuffer(content.buffer);
        return shapeReader.shpHeader;
      }
    }
  }
}
