import { Test } from '@nestjs/testing';
import { v4 as uuid } from 'uuid';

import { ServerRequestContextModel } from './server-request-context.model';
import { ServerRequestContextService } from './server-request-context.service';
import * as tokens from './server-request-context.tokens';

describe('ServerRequestContextService', () => {
  let service: ServerRequestContextService;
  let mockServerRequestContext: ServerRequestContextModel;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: tokens.SERVER_REQUEST_CONTEXT_FACTORY_TOKEN,
          useValue: () => mockServerRequestContext
        },
        ServerRequestContextService
      ]
    }).compile();
    mockServerRequestContext = { req: null } as unknown as ServerRequestContextModel;
    service = module.get(ServerRequestContextService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });

  describe('contextualHeaders', () => {
    it('should return an empty object by default', () => {
      mockServerRequestContext = null;
      const result = service.contextualHeaders();
      expect(result).toEqual({});
    });
    it('should return an object with x-request-id', () => {
      const id = uuid();
      mockServerRequestContext = { req: { id } } as unknown as ServerRequestContextModel;
      const result = service.contextualHeaders();
      expect(result).toEqual({
        'X-Request-Id': id
      });
    });
  });

  describe('requesterAccessToken', () => {
    it('should return a token', () => {
      const mockTokenValue = uuid();
      const authorization = `Bearer ${mockTokenValue}`;
      const headers = { authorization };
      mockServerRequestContext = { req: { headers } } as unknown as ServerRequestContextModel;
      const result = service.requesterAccessToken();
      expect(result).toBe(mockTokenValue);
    });
    it('should return null if there is no token', () => {
      mockServerRequestContext = { req: { } } as unknown as ServerRequestContextModel;
      const result = service.requesterAccessToken();
      expect(result).toBe(null);
    });
    it('should return null without context', () => {
      mockServerRequestContext = null;
      const result = service.requesterAccessToken();
      expect(result).toBe(null);
    });
  });

});
