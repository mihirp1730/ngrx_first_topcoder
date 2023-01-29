import * as YAML from 'yamljs';

import * as thisModule from './convert.functions';
import { replaceAllInsensitive } from './replace-all-insensitive.function';

// Safely import 'api-spec-converter' in case it isn't installed (due of it being a devDependency because of its
//  RAML converter forced dependency with vulnerability) code won't crash on this ES2015 module import.
let apiSpecConverter: any;
try {
  // tslint:disable-next-line: no-var-requires
  apiSpecConverter = require('api-spec-converter');
  // tslint:disable-next-line: no-empty
} catch (e) {
  console.error('error:',e);
}

/**
 * Converts a spec object (v3 or v2) to a Yaml string.
 * - If a spec of Open API v3 is given, it will be converted to Swagger v2, then to Yaml.
 * - If a spec of Swagger v2 is given, it will be straightforward converted to Yaml.
 */
export async function convertSpecObjToYamlStr(swaggerDoc: any): Promise<string> {
  if ('openapi' in swaggerDoc) {
    return await thisModule.convert3to2YamlStr(swaggerDoc);
  }
  return thisModule.convertJsonToYamlStr(swaggerDoc);
}

export function convertJsonToYamlStr(obj: any): string {
  return YAML.stringify(obj, 10, 2);
}

/**
 * Creates a Swagger (v2) YAML string, from a OpenAPI (v3) object document.
 * Supports Shell variables ($) on the "Server URL" string.
 *
 * **NOTE:** Don't use this function unless `api-spec-converter` package dependency is previously checked as installed.
 *
 * Steps done the following:
 * 1. Replaces $ with a `tempReplacementToken`.
 *    This is needed as conversion will fail if server URL has invalid characters.
 * 2. Converts v3 object to v2 with a library.
 * 3. Restores the $ symbol and letter casing from the Shell variables on the equivalent "host" string.
 * 4. Add additional non-v3 global "consumes" and "produces" properties.
 * 5. Gets a YAML string from the v2 object.
 *
 * @param source OpenAPI (v3) object document spec.
 * @param tempReplacementToken Token to temporary repalce before conversion. Defaults to `z0-.`.
 *
 * @returns Promise with the v2 converted spec as a YAML string, or
 * rejected promise if the `api-spec-converter` package dependency is not installed.
 */
export async function convert3to2YamlStr(source: any, tempReplacementToken = 'z0-.'): Promise<string> {
  // Fail-safe for when function is used when 'api-spec-converter' isn't installed.
  if (!apiSpecConverter) {
    throw Error('`convert3to2YamlStr()` required dependency `api-spec-converter` is not installed.');
  }

  // Before conversion, make URL shell variables URI parsable by replacing '$' with 'z0-.' (clone src obj before edits).
  source = JSON.parse(JSON.stringify(source));
  const originalUrl = source.servers && source.servers[0] && source.servers[0].url;
  if (typeof originalUrl === 'string') {
    source.servers[0].url = replaceAllInsensitive(originalUrl, '$', tempReplacementToken);
  }

  const converted = await apiSpecConverter.convert({
    from: 'openapi_3',
    to: 'swagger_2',
    source
  });
  const spec = converted.spec;

  // Restore the shell variables.
  if (typeof spec.host === 'string') {
    spec.host = replaceAllInsensitive(spec.host, tempReplacementToken, '$');
    // Get the original casing from the original URL (for the shell variables).
    const hostIndxOnOriginal = (originalUrl as string).toLowerCase().indexOf(spec.host);
    spec.host = (originalUrl as string).substr(hostIndxOnOriginal, spec.host.length);
  }

  // Add additional non-v3 global "consumes" and "produces" properties.
  spec.consumes = ['application/json'];
  spec.produces = ['application/json'];

  return converted.stringify({ syntax: 'yaml', order: 'openapi' });
}
