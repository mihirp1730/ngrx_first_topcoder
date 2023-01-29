import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MediaDownloadService } from '@apollo/app/services/media-download';
import { provideMockStore } from '@ngrx/store/testing';
import { mockMediaDownloadService } from '../../shared/services.mock';
import * as opportunitySelectors from '../state/selectors/opportunity-catalog.selectors';

import { OpportunityCatalogComponent } from './opportunity-catalog.component';

describe('OpportunityCatalogComponent', () => {
  let component: OpportunityCatalogComponent;
  let fixture: ComponentFixture<OpportunityCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OpportunityCatalogComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [RouterTestingModule],
      providers: [
        provideMockStore({
          selectors: [
            {
              selector: opportunitySelectors.selectOpportunities,
              value: [
                {
                  opportunityId: 'OP-VD8-87lora5xm1ws-776750329938',
                  opportunityName: 'test',
                  opportunityStatus: 'Published',
                  opportunityType: 'PUBLIC',
                  dataVendorId: 'VD8-2bu4gh7pw2l8-841832760286',
                  countries: ['Afghanistan'],
                  phase: ['Appraisal'],
                  assetType: ['CCUS'],
                  deliveryType: ['DDR'],
                  offerType: ['Direct Negotiation'],
                  contractType: ['Production Sharing Contract'],
                  offerStartDate: '2022-10-12T07:04:38.596Z',
                  offerEndDate: '2023-10-12T18:29:59.999Z',
                  opportunityProfile: {
                    overview: '<p>hjghjhg</p>',
                    media: [
                      {
                        fileId: 'FL-2S2-g14jjk9k7uxn-940176846233',
                        fileName: 'images.png',
                        fileType: 'image/png',
                        caption: '',
                        profileImage: true
                      }
                    ],
                    documents: []
                  },
                  confidentialOpportunityProfile: {
                    overview: '',
                    media: [],
                    documents: []
                  },
                  opportunityVDR: null,
                  ccusAttributes: null,
                  dataObjects: [
                    {
                      count: 1,
                      name: 'Opportunity',
                      entityIcon: 'apollo:polygonset'
                    },
                    {
                      count: 0,
                      name: 'Seismic 3D Survey',
                      entityIcon: 'apollo:SeismicSurvey3d'
                    },
                    {
                      count: 0,
                      name: 'Well',
                      entityIcon: 'apollo:Well'
                    },
                    {
                      count: 0,
                      name: 'Seismic 2D Line',
                      entityIcon: 'apollo:2d-seismic'
                    }
                  ]
                },
                {
                  opportunityId: 'OP-VD8-87lora5xm1ws-776750329938',
                  opportunityName: 'test',
                  opportunityStatus: 'Published',
                  opportunityType: 'PUBLIC',
                  dataVendorId: 'VD8-2bu4gh7pw2l8-841832760286',
                  countries: ['Afghanistan'],
                  phase: ['Appraisal'],
                  assetType: ['CCUS'],
                  deliveryType: ['DDR'],
                  offerType: ['Direct Negotiation'],
                  contractType: ['Production Sharing Contract'],
                  offerStartDate: '2022-10-12T07:04:38.596Z',
                  offerEndDate: '2023-10-12T18:29:59.999Z'
                }
              ]
            }
          ]
        }),
        {
          provide: MediaDownloadService,
          useValue: mockMediaDownloadService
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpportunityCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create', () => {
    const response = component.trackBy(1);
    expect(response).toBe(1);
  });
});
