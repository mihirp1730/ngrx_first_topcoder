import * as mocks from './../../../shared/services.mock';
import * as opportunitySelectors from '../../state/selectors/opportunity.selectors';

import { ActivatedRoute, Router } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GISCANVAS_FACTORY, OpportunityMapWrapperComponent } from './opportunity-map-wrapper.component';
import { GisLayerPanelService, GisMapLargeService, GisSearchResultActionService } from '@slb-innersource/gis-canvas';

import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { DELFI_USER_CONTEXT } from '@apollo/app/delfi-gui-auth-config';
import { FileUploaderService } from '@apollo/app/upload-widget';
import { MetadataService } from '@apollo/app/metadata';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PerformanceIndicatorService } from '@apollo/app/performance';
import { RouterTestingModule } from '@angular/router/testing';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';
import { SettingsService } from '@apollo/app/settings';
import { provideMockStore } from '@ngrx/store/testing';

describe('OpportunityMapWrapperComponent', () => {
  let component: OpportunityMapWrapperComponent;
  let fixture: ComponentFixture<OpportunityMapWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OpportunityMapWrapperComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule],
      providers: [
        {
          provide: Router,
          useValue: mocks.mockRouter
        },
        {
          provide: MetadataService,
          useValue: mocks.mockMetadataService
        },
        {
          provide: SettingsService,
          useValue: mocks.mockSettingsService
        },
        {
          provide: SecureEnvironmentService,
          useValue: mocks.mockSecureEnvironmentService
        },
        {
          provide: AuthCodeFlowService,
          useValue: mocks.mockAuthCodeFlowService
        },
        {
          provide: GisMapLargeService,
          useValue: mocks.mockGisMapLargeService
        },
        {
          provide: GisSearchResultActionService,
          useValue: mocks.mockGisSearchResultActionService
        },
        {
          provide: GisLayerPanelService,
          useValue: mocks.mockGisLayerPanelService
        },
        {
          provide: PerformanceIndicatorService,
          useValue: ''
        },
        {
          provide: DELFI_USER_CONTEXT,
          useValue: {
            crmAccountId: 'test-account-id'
          }
        },
        {
          provide: FileUploaderService,
          useValue: mocks.mockFileUploaderService
        },
        {
          provide: ActivatedRoute,
          useValue: mocks.mockActivatedRoute
        },
        {
          provide: GISCANVAS_FACTORY,
          useValue: () => {
            return {
              hideGisIndecator: jest.fn(),
              showGisIndecator: jest.fn()
            };
          }
        },
        provideMockStore({
          selectors: [
            {
              selector: opportunitySelectors.selectHiddenMRs,
              value: [
                {
                  type: 'Opportunity',
                  fileName: 'file_name_0',
                  fileId: 'file_id_0',
                  mapRepresentationId: 'map_representation_id_0'
                }
              ]
            },
            {
              selector: opportunitySelectors.deduceMapRepresentationIds,
              value: [
                {
                  type: 'Opportunity',
                  fileName: 'file_name_0',
                  fileId: 'file_id_0',
                  mapRepresentationId: 'map_representation_id_0'
                }
              ]
            },
            {
              selector: opportunitySelectors.selectHiddenLayers,
              value: ['Opportunity']
            },
            {
              selector: opportunitySelectors.selectCreatedOpportunityId,
              value: 'op-id'
            }
          ]
        })
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpportunityMapWrapperComponent);
    component = fixture.componentInstance;
    component.mapRepresentationIdList = ['map_rep_id'];
    jest.spyOn(mocks.mockGisLayerPanelService, 'initializeLayerPanel').mockReturnValue([
      {
        originalOptions: {
          query: {}
        },
        entityType: 'Opportunity'
      }
    ]);
    fixture.detectChanges();
  });

  it('should create', () => {
    const config = mockConfig;
    expect(component).toBeTruthy();
  });
  describe('load layers', () => {
    it('should replace table names', () => {
      component.billingAccountID = 'billingAccountID';
      const config = mockConfig;
      const metadata = [{ mapLargeTable: 'test/metadata' }];
      component.updateTableNames(config, metadata);
      expect(config.gisCanvas.gisMap.layersConfiguration[0].tableInfo.table.name).toEqual('billingAccountID/config');
      expect(metadata[0].mapLargeTable).toEqual('billingAccountID/metadata');
    });
  });

  it('should call onZoomToWorldView', () => {
    global.innerWidth = 2000;
    expect(component.onZoomToWorldView()).toBeUndefined();
    global.innerWidth = 1600;
    expect(component.onZoomToWorldView()).toBeUndefined();
    global.innerWidth = 1200;
    expect(component.onZoomToWorldView()).toBeUndefined();
  });
});

const mockConfig = {
  gisCanvas: {
    gisMap: {
      layersConfiguration: [
        {
          id: 'Opportunity',
          tableInfo: { table: { name: 'test/config' } },
          style: {
            rules: [
              {
                style: {
                  lineDash: null,
                  fillColor: 'rgba(206,200,47,0.3)',
                  borderColor: 'rgba(206,200,47,1)',
                  borderWidth: '1'
                },
                where: [
                  [
                    {
                      col: 'AssetType',
                      test: 'Equal',
                      value: 'CCUS'
                    }
                  ]
                ]
              }
            ]
          }
        }
      ]
    }
  }
};
