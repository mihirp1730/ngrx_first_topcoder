/* istanbul ignore next */
import { IRequestValidationModel } from '@slb-delfi-exploration/dd-infrastructure';

export function GetRequestValidationsConfig(processEnv: NodeJS.ProcessEnv): IRequestValidationModel[] {
  const requestValidations: IRequestValidationModel[] = [];
  const cacheTimeout = Number(processEnv.VALIDATION_CACHE_TIMEOUT_SEC);
  const numberOfRetries = Number(processEnv.VALIDATION_NUMBERS_OF_RETRIES);
  const retryInterval = Number(processEnv.VALIDATION_RETRY_INTERVAL);
  //if (processEnv.TRAFFIC_MANAGER_IS_ENABLED === 'true') {
  //  requestValidations.push({
  //    cacheTimeout,
  //    numberOfRetries,
  //    retryInterval,
 //     url: processEnv.TRAFFIC_MANAGER_VALIDATION_ENDPOINT,
  //    validationKey: processEnv.TRAFFIC_MANAGER_VALIDATION_CACHE_KEY
  //  });
  //}
  return requestValidations;
}
