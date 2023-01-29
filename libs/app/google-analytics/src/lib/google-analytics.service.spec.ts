import { GoogleAnalyticsService, RecommendedEventEnum } from './google-analytics.service';

describe('GoogleAnalyticsService', () => {

  let service: GoogleAnalyticsService;

  beforeEach(() => {
    (window as any).gtag = jest.fn();
    service = new GoogleAnalyticsService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send an event', () => {
    const spy = jest.spyOn((service as any), 'gtag');
    expect(service.send(RecommendedEventEnum.login, {"test": "test"}));
    expect(spy).toHaveBeenCalled();
  });

});
