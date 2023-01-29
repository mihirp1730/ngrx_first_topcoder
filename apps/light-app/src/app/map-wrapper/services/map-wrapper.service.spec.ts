import { TestBed } from '@angular/core/testing';

import { AppActions } from '../enums';
import { MapWrapperService } from './map-wrapper.service';

describe('MapWrapperService', () => {
  let service: MapWrapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapWrapperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return current AppAction', () => {
    service.updateCurrentAppAction(AppActions.Search);
    service.getCurrentAppAction();
    service.currentAppAction$.subscribe((x) => {
      expect(x).toBe(AppActions.Search);
    });
  });

  it('should update current AppAction', () => {
    service.updateCurrentAppAction(AppActions.MapSelection);
    service.currentAppAction$.subscribe((x) => {
      expect(x).toBe(AppActions.MapSelection);
    });
  });
});
