import { ICategory, IConfigOptions, IMarketingRepresentation } from '@apollo/api/interfaces';
import { GaiaTraceClass } from '@apollo/tracer';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class MetadataFileReaderService {
  readDir(sourceFileFolder: string) {
    return fs.readdirSync(sourceFileFolder);
  }
  readFile(sourceFileFolder: string, filename: string) {
    return fs.readFileSync(sourceFileFolder + filename, 'utf8');
  }
}

@Injectable()
@GaiaTraceClass
export class MetadataService {
  private filenames: string[] = [];
  private cachedCategories: ICategory[] = [];

  constructor(
    private readonly fileReaderService: MetadataFileReaderService,
    private config: IConfigOptions) {
    // // Load all category data only once on construction
    const sourceFilesNames = this.fileReaderService.readDir(this.config.sourceFileFolder);
    if (!this.config.sourceFileFolder.endsWith('/')) {
      this.config.sourceFileFolder += '/';
    }

    sourceFilesNames.forEach((filename: string) => {
      this.filenames.push(filename.toLowerCase());
      this.cachedCategories.push(JSON.parse(this.fileReaderService.readFile(this.config.sourceFileFolder, filename)));
    });
  }

  public getLayers(): ICategory[] {
    // In categories we will have an array of the information in data/metadata/*.json
    return [...this.cachedCategories].sort((category1, category2) => category1.displaySequence - category2.displaySequence);
  }

  public postLayer(layer: ICategory): void {
    let existingLayer = false;
    this.cachedCategories.forEach((category, index) => {
      if (category.name.toLowerCase() === layer.name.toLowerCase()) {
        this.cachedCategories[index] = layer;
        existingLayer = true;
      }
    });
    if (!existingLayer) {
      this.cachedCategories.push(layer);
    }
  }

  public getLayer(layerName: string): ICategory | undefined {
    return this.cachedCategories.find((category) => category.name.toLowerCase() === layerName.toLowerCase());
  }

  public getMarketingLayers(): IMarketingRepresentation[] {
    return this.cachedCategories.reduce((result: IMarketingRepresentation[], category: ICategory) => {
      if (category.displayInMap) {
        result.push(this.convertCategoryToMR(category));
      }
      return result;
    }, []);
  }

  public getPublicLayers(): Array<string> {
    // Change to DB request to get only "Final" and "Predefine" layers
    return this.cachedCategories.map((c) => c.name.toLowerCase());
  }

  private convertCategoryToMR(category: ICategory): IMarketingRepresentation {
    const tableName = category.mapLargeTable?.split('/')?.[1];
    const shape = category.attributes.filter((attribute) => attribute.name === 'Shape')?.[0]?.type;
    return {
      layerName: category.name,
      displayName: category.displayName,
      maplargeTable: tableName,
      shapeType: shape,
      primaryKey: category.primaryKeyCol,
      icon: category.entityIcon
    };
  }
}
