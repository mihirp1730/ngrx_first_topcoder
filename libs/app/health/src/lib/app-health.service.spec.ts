import { Test } from '@nestjs/testing';
import { AppHealthService } from './app-health.service';

describe('AppHealthService', () => {
  let service: AppHealthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AppHealthService]
    }).compile();

    service = module.get(AppHealthService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });

  it('health check should work', () => {
    const res = service.healthCheck('test');
    expect(res.statusCode == 200 && res.message == 'OK');
  });

  it('health check should give 404', () => {
    expect(() => service.healthCheck(null)).toThrow();
  });
});
