import { Provider } from '@angular/core';
import { get, invoke } from 'lodash';
import { v4 as uuid } from 'uuid';

import { TrafficManagerServiceModule } from './app-traffic-manager.module';
import { SetTimeoutFactoryToken } from './traffic-manager.service';

describe('TrafficManagerServiceModule', () => {
  describe('forRoot', () => {
    it('should return the provided config', () => {
      const mockConfig = uuid() as unknown as Provider;
      const result = TrafficManagerServiceModule.forRoot(mockConfig);
      expect(result.providers[0]).toBe(mockConfig);
    });
    it('should return a setTimeout factory', () => {
      const result = TrafficManagerServiceModule.forRoot(null);
      expect(result).toBeTruthy();
      const provider = result.providers.find(p => get(p, 'provide') === SetTimeoutFactoryToken);
      expect(provider).toBeTruthy();
      const useValue = invoke(provider, 'useValue');
      expect(useValue).toBe(setTimeout);
    });
  });
});
