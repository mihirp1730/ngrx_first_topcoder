export interface ITreatmentConfig {
  enable: boolean;
  config?: {
    oldLayers: string[],
    newLayers: string[]
  };
}