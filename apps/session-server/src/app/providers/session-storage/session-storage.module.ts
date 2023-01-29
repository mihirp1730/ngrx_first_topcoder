import { Enums, Interfaces } from '@apollo/server/services';
import { Module } from '@nestjs/common';
import * as uuid from 'uuid';

import { ConfigBase } from '../config/config.base';
import { ConfigModule } from '../config/config.module';
import { MemorySessionStorage } from './memory.session-storage';
import { SessionStorageBase } from './session-storage.base';

// In this module we will provide a local token for our session storage factory:
const DEFAULT_USER_SESSION_TOKEN = '[Session Storage] Default User Session Token';

@Module({
  imports: [
    ConfigModule
  ],
  providers: [
    {
      provide: DEFAULT_USER_SESSION_TOKEN,
      inject: [ConfigBase],
      useFactory: DefaultUserSessionFactory
    },
    {
      provide: SessionStorageBase,
      inject: [ConfigBase, DEFAULT_USER_SESSION_TOKEN],
      useFactory: SessionStorageBaseFactory
    }
  ],
  exports: [
    SessionStorageBase
  ]
})
export class SessionStorageModule {}

// When a user has no sessions (i.e. first visit) this factory provides the application
// a "default" user session to refer to and build off of. This is introduced here in the module
// as it is specific to our session storage implementations. No matter the implementation, this
// factory will provide us a common reference.
export async function DefaultUserSessionFactory(
  config: ConfigBase
): Promise<Interfaces.Atlas.Session.UserSession> {
  // Get configuration of the components and the user session from the provided config.
  const {defaultUserSession} = await config.sessionStorage();
  // We can use the `sessionStorage` from the config to help drive the default user session.
  const id = defaultUserSession.id || 'default';
  const components: Interfaces.Atlas.Component.SessionComponent[] = [];
  // If there is any configured "map" from the provided config, add it to the default user session.
  if (defaultUserSession.components.some((c) => c.id === 'map')) {
    components.push({
      id: uuid.v4(),
      instanceData: '{}',
      name: 'Map Wrapper Component',
      session: id,
      state: Enums.Atlas.Component.State.Max,
      type: Enums.Atlas.Component.Type.Module,
      types: {
        [Enums.Atlas.Component.Type.Module]: {
          path: 'projects/map-wrapper-component/src/app/app.module#AppModule',
        }
      }
    });
  }
  // Return the built, default user session to allow other providers reference.
  return {
    ...defaultUserSession,
    components, id,
  }
}

export async function SessionStorageBaseFactory(
  configBase: ConfigBase,
  defaultUserSession: Interfaces.Atlas.Session.UserSession
): Promise<SessionStorageBase> {
  await configBase.sessionStorage();
  return new MemorySessionStorage(defaultUserSession);
}
