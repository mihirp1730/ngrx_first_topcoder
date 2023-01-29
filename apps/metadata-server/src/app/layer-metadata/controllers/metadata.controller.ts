import { ICategory } from '@apollo/api/interfaces';
import { AppHealthService } from '@apollo/app/health';
import { FeatureFlagService, Features } from '@apollo/server/feature-flag';
import { ISauth } from '@apollo/server/jwt-token-middleware';
import { GaiaTraceMethod } from '@apollo/tracer';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Session
} from '@nestjs/common';

import { StatusEnum } from '../../../commons/enums/meta-data.enum';
import * as oppurtunityMetadata from '../../../data/opportunity/oppurtunityMetadata.json';
import { Validators } from '../../helpers/validators.helper';
import { LayerMetadataEntityMapper } from '../mapper/layer-metadata-entity.mapper';
import { LayerMetadataRepositoryService } from '../repository/layer-metadata-repository.service';

@Controller()
export class MetadataController {
  constructor(
    private readonly featureFlagService: FeatureFlagService,
    private readonly layerMetadataRepositoryService: LayerMetadataRepositoryService,
    private readonly appHealthService: AppHealthService
  ) {}

  @Get('health')
  @GaiaTraceMethod
  public getHealthCheck(@Headers('appKey') appKey: string): any {
    return this.appHealthService.healthCheck(appKey);
  }

  @Get('layers')
  @GaiaTraceMethod
  public async getLayers(@Headers() headers: any, @Session() session: ISauth) {
    try {
      const dataPartitionId = this.getDataPartitionId(headers);
      const showExperimentalLayers = this.featureFlagService.getFeatureFlag(
        Features.showExperimentalLayers,
        session.subid,
        dataPartitionId
      );
      const res = await this.layerMetadataRepositoryService.getAll();

      return LayerMetadataEntityMapper.fromEntityList(res).reduce((acc, layer) => {
        // Just add the layer if feature flag is enable or the status is different to "Experimental"
        if (showExperimentalLayers || layer.status !== StatusEnum.EXPERIMENTAL) {
          acc.push(layer.metadata);
        }

        return acc;
      }, []);
    } catch (error) {
      const errorMsg = `An error occurred during 'getLayers' execution: ${error}!`;
      throw new HttpException({ errors: [errorMsg] }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('layers/:layerName')
  @GaiaTraceMethod
  public async getLayer(@Param('layerName') layerName: string) {
    try {
      const res = await this.layerMetadataRepositoryService.getLayer(layerName);
      return LayerMetadataEntityMapper.fromEntity(res).metadata;
    } catch (error) {
      const errorMsg = `An error occurred during 'getLayer' execution: ${error}!`;
      throw new HttpException({ errors: [errorMsg] }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('regions')
  @GaiaTraceMethod
  public getRegions() {
    return ['Global', 'North America', 'South America', 'Europe', 'Africa', 'Antarctica', 'Asia', 'Australia'];
  }

  @Post('layer')
  @GaiaTraceMethod
  public async postLayer(@Session() sauth: ISauth, @Body() layer: ICategory) {
    // Attribute types validation
    const nameIsValid = Validators.hasValidName(layer);
    const attributesValidation = Validators.hasValidAttributes(layer);
    const isRequestValid = {
      valid: Boolean(nameIsValid.valid && attributesValidation.valid),
      errors: [...attributesValidation.errors, ...nameIsValid.errors]
    };

    if (!isRequestValid.valid) {
      throw new HttpException({ errors: isRequestValid.errors }, HttpStatus.BAD_REQUEST);
    }

    const layerResponse = await this.layerMetadataRepositoryService.upsertLayerMetaData({ layer, userId: sauth.sub });

    return LayerMetadataEntityMapper.fromEntity(layerResponse).metadata;
  }

  @Post('finalize')
  @GaiaTraceMethod
  public async promoteLayers(@Session() sauth: ISauth, @Body() layerNames: string[]) {
    try {
      await this.layerMetadataRepositoryService.promoteLayers({ userId: sauth.sub, layerNames });
      return;
    } catch (e) {
      if (!(e instanceof NotFoundException) && !(e instanceof BadRequestException)) {
        throw new InternalServerErrorException(`An error occurred during 'promoteLayer' execution: ${e}!`);
      }
      throw e;
    }
  }

  @Get('marketing-layers')
  @GaiaTraceMethod
  public getMarketingLayers(@Headers() headers: any, @Session() session: ISauth) {
    try {
      const dataPartitionId = this.getDataPartitionId(headers);
      const showExperimentalLayers = this.featureFlagService.getFeatureFlag(
        Features.showExperimentalLayers,
        session.subid,
        dataPartitionId
      );

      return this.layerMetadataRepositoryService.getMarketingLayers(showExperimentalLayers);
    } catch (error) {
      const errorMsg = `An error occurred during 'getMarketingLayers' execution: ${error}!`;
      throw new HttpException({ errors: [errorMsg] }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('layer/:layerName')
  @GaiaTraceMethod
  public async deleteLayer(@Param('layerName') layerName: string) {
    return this.layerMetadataRepositoryService.deleteLayer(layerName);
  }

  private getDataPartitionId(headers: any): string {
    const dataPartitionId = headers['slb-data-partition-id'];
    if (!dataPartitionId) {
      return '';
    }
    return dataPartitionId;
  }

  @Get('opportunities')
  @GaiaTraceMethod
  public getOppurtunityMetadata() {
    return oppurtunityMetadata;
  }
}
