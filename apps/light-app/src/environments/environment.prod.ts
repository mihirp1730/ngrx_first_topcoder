import { EnvironmentService } from '@apollo/app/environment';
import { Environment, Env } from './environment.interface';

// Get the environment file path, considering private releases or other locations:
const host = EnvironmentService.getHost(document);
const environmentJsonPath = `https://${host}/environments/environment.json`;

// PRODUCTION_HOST comes from the release-time variable library.
const local: { key: string; value: string }[] = [
  { key: 'PRODUCTION_HOST', value: host }
];

// Replace environment variables with array values
export const environment: Environment = EnvironmentService.getEnvironment(environmentJsonPath, local);

export const env: Env = {
  production: true
};
