import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { OpportunityResolver } from './opportunity.resolver';

describe('PackageResolver', () => {
  let resolver: OpportunityResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore()
      ],
    });
    resolver = TestBed.inject(OpportunityResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  describe('resolve', () => {
    it('should resolve as true', fakeAsync(() => {
      const routeObj = { params: { id: '123' } };
      resolver.resolve(routeObj as any).subscribe((res) => {
        expect(res).toBe(true);
      });
      flush();
    }));
  });

});
