import { IRequestValidationModel } from '@slb-delfi-exploration/dd-infrastructure';

export interface IConfigOptions {
  endpoint: string;
  enableCsrfProtection: boolean;
  name: string;
  port: number;
  requestValidations: IRequestValidationModel[];
  sourceFileFolder?: string;
}
