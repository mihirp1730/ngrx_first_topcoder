import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

/**
 * Creates a Open API v3 (prev. known as Swagger) spec object (a.k.a. document) from a Nest app.
 */
export function makeSwaggerDoc(app: INestApplication): OpenAPIObject {
  const partialDoc = new DocumentBuilder()
    .setVersion('2.0.0')
    .setTitle('Auth Proxy Service $CONTAINER_CLUSTER $GCLOUD_PROJECT')
    .setDescription('Auth Proxy service.')
    .addTag('Auth Proxy', 'Manages CRUD operations for Auth Server.')
    .addServer('{scheme}://auth-server-$CONTAINER_CLUSTER.endpoints.$GCLOUD_PROJECT.cloud.goog', undefined, {
      scheme: {
        enum: ['https'],
        default: 'https'
      }
    })
    .addSecurity('sauth_token', {
      flows: {
        implicit: {
          authorizationUrl: '',
          scopes: {}
        }
      },
      type: 'oauth2',
      // Extensions:
      'x-google-issuer': '$AUTH_ISSUER',
      'x-google-jwks_uri': '$AUTH_JWK_URI',
      'x-google-audiences': '$AUTH_CLIENT_ID'
    } as SecuritySchemeObject)
    .addSecurityRequirements('sauth_token', [])
    .build();

  return SwaggerModule.createDocument(app, partialDoc);
}
