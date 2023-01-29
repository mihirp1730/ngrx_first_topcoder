import { IMapAccountData } from '@apollo/api/interfaces';
import { FeatureFlagService, Features } from '@apollo/server/feature-flag';
import { ISauth, JwtTokenMiddleware } from '@apollo/server/jwt-token-middleware';
import { GaiaTraceMethod } from '@apollo/tracer';
import { Body, Controller, Get, Headers, HttpException, HttpStatus, Logger, Post, Req, Session } from '@nestjs/common';
import { decode } from 'jsonwebtoken';

import { StatusEnum } from '../../../commons/enums/meta-data.enum';
import { IGisLayerSettings } from '../../../commons/interfaces/gis-settings';
import * as mapConfig from '../../../data/settings/map.config.json';
import { Validators } from '../../helpers/validators.helper';
import { SettingsService } from '../../services/settings.service';
import { LayerSettingEntityMapper } from '../mapper/layer-setting-entity.mapper';
import { LayerSettingRepositoryService } from '../repository/layer-setting-repository.service';

@Controller()
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly layerSettingRepositoryService: LayerSettingRepositoryService,
    private logger: Logger
  ) {}

  @Get('environment')
  @GaiaTraceMethod
  public async getEnvironmentSettings() {
    try {
      return this.settingsService.getEnvironmentSettings();
    } catch (error) {
      const errorMsg = `An error occurred when executing 'getEnvironmentComponentSettings', error: ${error}`;
      throw new HttpException({ errors: [errorMsg] }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('map')
  @GaiaTraceMethod
  public async getMapSettings(@Headers() headers: any, @Session() session: ISauth) {
    try {
      this.logger.log(`metadata server: map end point get`);
      const dataPartitionId = this.getDataPartitionId(headers);
      const showExperimentalLayers = this.featureFlagService.getFeatureFlag(
        Features.showExperimentalLayers,
        session.subid,
        dataPartitionId
      );
      const res = await this.layerSettingRepositoryService.getAll();

      return {
        ...mapConfig,
        gisCanvas: {
          ...mapConfig.gisCanvas,
          gisMap: {
            ...mapConfig.gisCanvas.gisMap,
            layersConfiguration: LayerSettingEntityMapper.fromEntityList(res).reduce((acc, layer) => {
              // Just add the layer if feature flag is enable or the status is different to "Experimental"
              if (showExperimentalLayers || layer.status !== StatusEnum.EXPERIMENTAL) {
                acc.push(layer.setting);
              }

              return acc;
            }, [])
          }
        }
      };
    } catch (error) {
      const errorMsg = `An error occurred when executing 'getMapSettings', error: ${error}`;
      throw new HttpException({ errors: [errorMsg] }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('setting')
  @GaiaTraceMethod
  public async postLayerSetting(@Session() sauth: ISauth, @Body() layer: IGisLayerSettings) {
    const isSettingNameValid = Validators.hasValidName(layer);

    if (!isSettingNameValid.valid) {
      throw new HttpException({ errors: isSettingNameValid.errors }, HttpStatus.BAD_REQUEST);
    }
    const layerResponse = await this.layerSettingRepositoryService.upsertLayerSetting({ setting: layer, userId: sauth.sub });
    return LayerSettingEntityMapper.fromEntity(layerResponse).setting;
  }

  private getDataPartitionId(headers: any): string {
    const dataPartitionId = headers['slb-data-partition-id'];
    if (!dataPartitionId) {
      return '';
    }
    return dataPartitionId;
  }

  @Get('map-config')
  @GaiaTraceMethod
  public getExclusiveMapConfiguration(@Req() request: any): { statusCode: number; data: IMapAccountData } {
    try {
      const finalHost = request.headers.requesturl || request.host;
      this.logger.log(`metadata server: map-config end point host: ${finalHost}`);
      const sAuthToken = JwtTokenMiddleware.getToken(request);
      const { payload }: any = decode(sAuthToken, { complete: true });
      this.logger.log(`metadata server: map-config end point email: ${payload.email}`);
      const envConfig = this.settingsService.getMapConfiguration(finalHost, payload.email);
      return { statusCode: 200, data: envConfig };
    } catch (error) {
      this.logger.error(`metadata server: error occured while getting map configuration: ${error}`);
    }
  }

  @Get('consumer-url')
  @GaiaTraceMethod
  public getConsumerUrlConfig(@Req() request: any, @Headers('vendorid') vendorid: string): { statusCode: number; data: string } {
    try {
      const finalHost = request.headers.requesturl || request.host;
      this.logger.log(`metadata server: consumer-url end point host: ${finalHost}`);
      const sAuthToken = JwtTokenMiddleware.getToken(request);
      const { payload }: any = decode(sAuthToken, { complete: true });
      this.logger.log(`metadata server: consumer-url end point email: ${payload.email}`);
      const consumerAppUrl = this.settingsService.getHostAssociatedConsumerUrl(finalHost, payload.email, vendorid);
      return { statusCode: 200, data: consumerAppUrl };
    } catch (error) {
      this.logger.error(`metadata server: error occured while getting consumer-url: ${error}`);
    }
  }
}
