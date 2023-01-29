import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MediaDownloadService } from '@apollo/app/services/media-download';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { mockMediaDownloadService } from '../../shared/services.mock';
import { OpportunityPanelService } from '../services/opportunity-panel.service';
import * as opportunityPanelSelectors from '../state/selectors/opportunity-panel.selectors';
import { OpportunityCardsComponent } from './opportunity-cards.component';

class MockOpportunityPanelService {
  zoomToExtents = jest.fn();
}

describe('OpportunityCardsComponent', () => {
  let component: OpportunityCardsComponent;
  let fixture: ComponentFixture<OpportunityCardsComponent>;
  let mockStore: MockStore;
  let mockOpportunityPanelService: MockOpportunityPanelService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OpportunityCardsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        provideMockStore({
          selectors: [
            {
              selector: opportunityPanelSelectors.selectOpportunities,
              value: []
            }
          ]
        }),
        {
          provide: MediaDownloadService,
          useValue: mockMediaDownloadService
        },
        {
          provide: OpportunityPanelService,
          useClass: MockOpportunityPanelService
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpportunityCardsComponent);
    mockStore = TestBed.inject(Store) as MockStore;
    mockOpportunityPanelService = TestBed.inject(OpportunityPanelService) as unknown as MockOpportunityPanelService;
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call select opportunity', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component._cardInfo = {
      opportunityId: 'test'
    };
    component.selectOpportunity();
    expect(spy).toHaveBeenCalled();
  });

  it('should set cardInfo Input value', () => {
    const value = [
      {
        opportunityId: 'OP-123'
      }
    ];
    component.cardInfo = value;
    expect(component._cardInfo).toStrictEqual({ ...value });
  });

  it('should sort the data objects on basis of counts', () => {
    const dataObjects = [
      { count: 4, name: 'Asset' },
      { count: 5, name: 'Play' },
      { count: 6, name: 'Basin' }
    ];
    const sortedDataObjects = [
      { count: 6, name: 'Basin' },
      { count: 5, name: 'Play' },
      { count: 4, name: 'Asset' }
    ];
    component.sortDataObjects(dataObjects);
    expect(component.sortDataObjects(dataObjects)).toStrictEqual(sortedDataObjects);
  });

  describe('should call ngOnChanges', () => {
    const dataObjects = [
      { count: 4, name: 'Asset' },
      { count: 5, name: 'Play' },
      { count: 6, name: 'Basin' }
    ];
    const change: any = {
      cardInfo: {
        currentValue: { dataObjects, profileImage: 'fileid-12' }
      }
    };
    it('should sort the data', () => {
      component._cardInfo = {
        dataObjects,
        profileImage: 'fileid-12'
      };
      component.ngOnChanges(change);
      expect(component.signedUrl).toBe('signed-url');
    });
  });

  it('should call zoomToExtents', () => {
    const spy = jest.spyOn(mockOpportunityPanelService, 'zoomToExtents').mockImplementation();
    const value = [
      {
        opportunityId: 'OP-123'
      }
    ];
    component.cardInfo = value;
    component.zoomToExtent(null);
    expect(spy).toHaveBeenCalled();
  });
});
