import { Test } from '@nestjs/testing';
import { v4 as uuid } from 'uuid';

import { GatewayService } from './gateway.service';

describe('GatewayService', () => {
  let gatewayService: GatewayService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [GatewayService]
    }).compile();
    gatewayService = app.get<GatewayService>(GatewayService);
  });

  describe('service', () => {
    const id = uuid();
    [
      {
        input: undefined,
        expected: 'Welcome to gateway-server!'
      },
      {
        input: id,
        expected: `Welcome to gateway-server! The "${id}" endpoint!`
      },
    ].forEach(({ input, expected }) => {
      it(`should return string containing ${input}`, () => {
        expect(gatewayService.getData(input)).toEqual(
          expect.objectContaining({
            message: expect.stringContaining(expected)
          }));
      });
    });
  });
});
