import { EnvironmentService } from '@apollo/app/environment';
import { Environment, Env } from './environment.interface';

// Get the environment file path, considering private releases or other locations:
const host = EnvironmentService.getHost(document);
const environmentJsonPath = `https://${host}/environments/environment.json`;

/*
 * For vendor-app, which is being deployed to a nested path (i.e. .com/xchange) we must remove
 * the trailing /xchange from the production host in order to integrate with the deployed APIs.
 * Let's use the below private as an example, the `host` is our actual, and `baseUrl` is our
 * `host` + `base href` BUT we need the URL to our deployed services for our private release,
 * hence the removing of `/xchange` and achieving the `deploymentUrl`.
 *
 *   host:          gaia.evd-light.gaiaops.cloud.slb-ds.com
 *   baseUrl:       gaia.evd-light.gaiaops.cloud.slb-ds.com/release-XXXX/xchange
 *   deploymentUrl: gaia.evd-light.gaiaops.cloud.slb-ds.com/release-XXXX
 */
function getDeploymentUrl(productionHost: string): string {
  const searchString = '/xchange';

  if (!productionHost.endsWith(searchString)) {
    return productionHost;
  }

  const lastIndex = productionHost.lastIndexOf(searchString);
  return productionHost.substring(0, lastIndex);
}

// PRODUCTION_HOST comes from the release-time variable library.
const local: { key: string; value: string }[] = [
  { key: 'PRODUCTION_HOST', value: getDeploymentUrl(host) }
];

// Replace environment variables with array values
export const environment: Environment = EnvironmentService.getEnvironment(environmentJsonPath, local);

export const env: Env = {
  production: true
};
