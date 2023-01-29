import { INestApplication } from '@nestjs/common';
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';

import * as thisModule from './server-swagger';
import { convert3to2YamlStr, convertSpecObjToYamlStr } from './convert.functions';

/**
 * Setups:
 * - When the app will **act as builder** of a v2 Swagger YAML spec file.
 * - When the Swagger UI endpoints will be attached.
 *
 * #### Run as spec builder
 * The trigger of making the app act as a builder when the app is launched with the
 * **_swagger-build_** argument value (`process.argv`). Note that arg. value can be
 * changed with `options.buildTriggerArgv`).
 *
 * The Swagger YAML spec file path is by _'./build/deploy/swagger.yaml'_, but can be
 * changed with `options.buildFilePath`.
 *
 * Please call this setup function with `await` in order to avoid mounting the app
 * when running as builder.
 *
 * #### Swagger UI
 * The Swagger UI web page can be created and shown when the Environment variable
 * `SWAGGER_UI` is set to `on`, and the dependency 'api-spec-converter' exists (as it's a devDependency).
 *
 * It will be mounted to `/api` by default, and sets `/api-json` and `/api-yaml`
 * where the generated spec files can be viewed. The "_/api_" path/prefix can be
 * changed with `options.swaggerUiPath`.
 *
 * @param app Express / NestJS with Express app.
 * @param appSpecDoc Open API v3 spec object (a.k.a. document).
 * @param options Change default values used in setup.
 */
export async function setupSwagger(
  app: INestApplication,
  appSpecDoc: OpenAPIObject,
  options: {
    buildTriggerArgv?: string;
    buildFilePath?: string;
    swaggerUiPath?: string;
  } = {}
): Promise<void> {
  const { buildTriggerArgv = 'swagger-build', buildFilePath = './build/deploy/swagger.yaml', swaggerUiPath = '/api' } = options;

  // Builds a v2 Swagger spec file if executed for that, then stops the app.
  if (process.argv.includes(buildTriggerArgv)) {
    try {
      await thisModule.buildSwaggerFile(appSpecDoc, buildFilePath);
      process.exit();
    } catch (e) {
      // tslint:disable-next-line: no-console
      console.error(e);
      process.exit(1);
    }
  }

  // Setups the UI based on the env variable, and if the converter package for V3 to V2 is installed.
  let isApiSpecConverterInstalled = false;
  try {
    isApiSpecConverterInstalled = !!require.resolve('api-spec-converter');
    // tslint:disable-next-line: no-empty
  } catch (e) {
    console.error('error',e);
  }
  if (process.env.SWAGGER_UI === 'on') {
    if (isApiSpecConverterInstalled) {
      thisModule.setupSwaggerUI(app, appSpecDoc, swaggerUiPath);
    } else {
      // tslint:disable-next-line: no-console
      console.warn('Swagger UI required dependency `api-spec-converter` is not installed.');
    }
  }
}

/**
 * Creates Swagger UI endpoints.
 *
 * **NOTE:** Don't use this function unless `api-spec-converter` package dependency is previously checked as installed.
 * Otherwise an error will be thrown.
 *
 * @param app Express / NestJS with Express app.
 * @param specDoc Open API v3 spec object.
 * @param path Path where to mount the Swagger UI web page. Defaults to '/api'
 *  Also mounts a `<path>-json` and `<path>-yaml` endpoints to spec generated source.
 */
export function setupSwaggerUI(app: INestApplication, specDoc: OpenAPIObject, path = '/api'): void {
  // Create the API web pages. Setup also creates a '<path>-json' version.
  SwaggerModule.setup(path, app, specDoc, {
    swaggerOptions: { showExtensions: true }
  });

  // Serve YAML versions of the spec definitions.
  app.getHttpAdapter().get(`${path}-yaml`, async (req, res) => {
    const yamlStr = await convert3to2YamlStr(specDoc);
    res.type('.yaml');
    res.send(Buffer.from(yamlStr));
  });
}

/**
 * Builds a v2 Swagger spec file.
 *
 * First converts a v3 spec object (or uses a v2 one) to a Yaml string,
 * then writes it down to file.
 *
 * @param specDoc An Open API (v3) or Swagger (v2) spec object.
 * @param filePath Path of file to write on, relative to project path.
 */
export async function buildSwaggerFile(specDoc: any, filePath = 'swagger.yaml'): Promise<void> {
  const yamlStr: string = await convertSpecObjToYamlStr(specDoc);
  writeFileSync(filePath, yamlStr);
}
