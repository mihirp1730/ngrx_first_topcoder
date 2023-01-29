import { JwtTokenMiddleware } from '@apollo/server/jwt-token-middleware';
import { Test } from '@nestjs/testing';

import { ConfigModule } from '../config/config.module';
import { SettingsService } from '../services/settings.service';
import { DatabaseMiddleware } from './database-connection';

jest.mock('typeorm', () => {
  return {
    getConnection: jest.fn((name) => {
      return {};
    }),
    createConnection: jest.fn(() => {
      return Promise.resolve();
    }),
    PrimaryColumn: jest.fn(() => {
      return () => void 0;
    }),
    Column: jest.fn(() => {
      return () => void 0;
    }),
    VersionColumn: jest.fn(() => {
      return () => void 0;
    }),
    CreateDateColumn: jest.fn(() => {
      return () => void 0;
    }),
    UpdateDateColumn: jest.fn(() => {
      return () => void 0;
    }),
    Entity: jest.fn(() => {
      return () => void 0;
    }),
    JoinColumn: jest.fn(() => {
      return () => void 0;
    }),
    OneToOne: jest.fn(() => {
      return () => void 0;
    })
  };
});

class MockBaseConfig {
  getTypeORMConfig = jest.fn().mockReturnValue({ port: 'port', username: 'username', password: 'password', database: 'database' });
}

class MockSettingsService {
  getDatabaseConfiguration = jest.fn().mockReturnValue({
    schema: 'schema',
    username: 'username',
    password: 'password'
  });
}

class MockLogger {
  error = jest.fn();
  log = jest.fn();
}

describe('DatabaseMiddleware', () => {
  let provider: DatabaseMiddleware;

  beforeAll(async () => {
    await ConfigModule.BaseConfigFactory(
      {
        env: {
          METADATA_SERVER_DEPLOY: 'true'
        }
      } as unknown as NodeJS.Process,
      MockLogger as any
    );
    await Test.createTestingModule({
      providers: [
        {
          provide: SettingsService,
          useClass: MockSettingsService
        }
      ]
    }).compile();
    provider = new DatabaseMiddleware(new MockSettingsService() as any, new MockBaseConfig() as any);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('should return the connection and return context to the original request', (done) => {
    const nextFn = jest.fn();
    jest
      .spyOn(JwtTokenMiddleware, 'getToken')
      .mockReturnValue(
        'eyJhbGciOiJSUzI1NiIsImtpZCI6Ik1UWTNNRGs0TXpJeE1RPT0iLCJ0eXAiOiJKV1QifQ.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      );
    provider.use({ host: 'localhost', headers: {} }, {}, nextFn).then(() => {
      expect(nextFn).toHaveBeenCalled();
      done();
    });
  });
});
