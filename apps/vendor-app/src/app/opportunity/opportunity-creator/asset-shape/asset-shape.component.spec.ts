import * as commonSelectors from '../../../shared/state/selectors/common.selectors'
import * as mocks from '../../../shared/services.mock';
import * as opportunityActions from '../../state/actions/opportunity.actions';
import * as opportunitySelectors from '../../state/selectors/opportunity.selectors';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { OpportunityService, OpportunityStatus, OpportunityType } from '@apollo/app/services/opportunity';

import { AssetShapeComponent } from './asset-shape.component';
import { FileUploaderService } from '@apollo/app/upload-widget';
import { GisMapLargeService } from '@slb-innersource/gis-canvas';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageService } from '@slb-dls/angular-material/notification';
import { MetadataService } from '@apollo/app/metadata';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ShareDataService } from '../../../shared/services/share-data.service';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';

const mockMessageService = {
  add: jest.fn().mockReturnValue(of(true))
};

export const mockMetadataService = {
  marketingLayers$: of([
    {
      layerName: 'datatype_1',
      shapeType: 'abc.poly'
    }
  ])
};

describe('AssetShapeComponent', () => {
  let component: AssetShapeComponent;
  let mockStore: MockStore;
  let fixture: ComponentFixture<AssetShapeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssetShapeComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: FileUploaderService,
          useValue: mocks.mockFileUploaderService
        },
        {
          provide: ShareDataService,
          useValue: mocks.mockShareDataService
        },
        {
          provide: MetadataService,
          useValue: mockMetadataService
        },
        {
          provide: MessageService,
          useValue: mockMessageService
        },
        {
          provide: OpportunityService,
          useValue: mocks.mockOpportunityService
        },
        {
          provide: GisMapLargeService,
          useValue: mocks.mockGisMapLargeService
        },
        provideMockStore({
          selectors: [
            {
              selector: opportunitySelectors.selectOpportunity,
              value: {
                opportunityId: 'opp_rep_id_1',
                opportunityName: 'opp_rep_name_1',
                opportunityType: OpportunityType.Public,
                opportunityStatus: OpportunityStatus.Published
              }
            },
            {
              selector: opportunitySelectors.selectOpportunityDetails,
              value: {
                opportunityId: 'opp_rep_id_1',
                opportunityName: 'opp_rep_name_1',
                assetType: ['Oil & Gas']
              }
            },
            {
              selector: commonSelectors.selectAssetShapeFillStyles,
              value: [
                {
                  assetType: 'Oil & Gas',
                  fillColor: 'rgba(209,159,255,0.3)'
                }
              ]
            },
            {
              selector: opportunitySelectors.selectCreatedOpportunityId,
              value: 'opp_rep_id'
            },
            {
              selector: opportunitySelectors.selectIsGlobalVisible,
              value: true
            },
            {
              selector: opportunitySelectors.selectMapRepresentationDetails,
              value: [
                {
                  type: 'Opportunity',
                  fileName: 'file_name_0',
                  fileId: 'file_id_0',
                  mapRepresentationId: 'map_representation_id_0'
                },
                {
                  type: 'Seismic3dSurvey',
                  fileName: 'file_name_1',
                  fileId: 'file_id_1',
                  mapRepresentationId: 'map_representation_id_1'
                },
                {
                  type: 'Well',
                  fileName: 'file_name_2',
                  fileId: 'file_id_2',
                  mapRepresentationId: 'map_representation_id_2'
                }
              ]
            }
          ]
        })
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetShapeComponent);
    mockStore = TestBed.inject(Store) as MockStore;
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    const selectedAsset = {
      assetType: 'Oil & Gas',
      fillColor: 'rgba(209,159,255,0.3)'
    }
    expect(component.selectedAssetType).toEqual(selectedAsset);
  });

  it('should turn removeGroup to false after deleteMapRepresentationFilesByGroup execution complete', () => {
    const type = 'Seismic2dSurvey';
    component.removeGroup = true;
    component.deletingShapeType = 'Seismic2dSurvey';
    component.deleteMapRepresentationFilesByGroup(type);
    expect(component.removeGroup).toBe(false);
  });

  describe('optionConsumed', () => {
    it('should optionConsumed return true', () => {
      const type = 'Seismic2dSurvey';
      component.shapeUploaders = [{ type: 'Seismic2dSurvey', visible: false }];
      component.mrStartUploadDetails = [{ group: 'Seismic2dSurvey' }];
      component.mapRepresentationIdList = [{ type: 'Seismic2dSurvey' }];
      const result = component.optionConsumed(type);
      expect(result).toBe(true);
    });
  });

  describe('shapeTypeSelection', () => {
    it('should shapeTypeSelection call, update shapeUploaders', () => {
      const event = { value: 'Seismic3dSurvey' };
      const index = 2;
      component.shapeUploaders = [{ type: 'Opportunity', visible: false }, { type: 'Seismic2dSurvey', visible: false}];
      component.shapeUploaders.push({ type: '', visible: false });
      component.shapeTypeSelection(event, index);
      expect(component.shapeUploaders).toHaveLength(3);
    });
  });

  describe('onMRStartUpload', () => {
    it('should handle the upload start', async () => {
      mocks.mockFileUploaderService.upload.mockReturnValueOnce(of('file-id'));
      mocks.mockFileUploaderService.getFile.mockReturnValueOnce(
        of({ id: 'file-id', parentId: 'parent-id', progress: { completed: true, associated: false } })
      );
      const type = '';
      await component.onMRStartUpload({} as File, type);
      expect(mocks.mockFileUploaderService.updateProgress).toHaveBeenCalledWith('file-id', { associated: true });
    });
  });

  describe('deleteExistingMRFile', () => {
    it('should call the confirmation message service', () => {
      const mapRepresentationId = 'map-rep-id-1';
      const shapeType = 'Well';
      component.deleteExistingMRFile(mapRepresentationId, shapeType);
      expect(mockMessageService.add).toHaveBeenCalled();
    });
    it('should call the deleteMapRepresentation', () => {
      const spydeleteMapRep = jest.spyOn(component, 'deleteMapRepresentation').mockImplementation();
      mockMessageService.add().subscribe(() => {
        expect(spydeleteMapRep).toHaveBeenCalled();
      });
    });

    it('should dispatch action for deleting the selected map representation', () => {
      const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
      const data = { mapRepresentationId: 'map-rep-id-1' };
      const mapRepresentationId = 'map-rep-id-1';
      const opportunityId = 'opp_rep_id';
      component.deleteMapRepresentation(data);
      expect(spy).toHaveBeenCalledWith(opportunityActions.deleteMapRepresentation({ opportunityId, mapRepresentationId }));
    });
  });

  describe('addDataType', () => {
    it('should increase shape uploaders count', () => {
      component.shapeUploaders = [{ type: 'Opportunity', visible: false }];
      component.dataTypes.length = 3;
      component.addDataType();
      expect(component.shapeUploaders.length).toBe(2);
    });
    it('should not increase shape uploaders count', () => {
      component.shapeUploaders = [{ type: 'Opportunity' , visible: false}, { type: 'Well', visible: false }, { type: 'Seismic3dSurvey', visible: false }];
      component.dataTypes.length = 3;
      component.addDataType();
      expect(component.shapeUploaders.length).toBe(component.dataTypes.length);
    });
  });

  describe('deleteMapRepresentationFilesByGroup', () => {
    it('should call deleteMapRepresentation', () => {
      const type = 'Well';
      component.mapRepresentationIdList = [
        {
          type: 'Seismic3dSurvey',
          fileName: 'file_name_1',
          fileId: 'file_id_1',
          mapRepresentationId: 'map_representation_id_1'
        },
        {
          type: 'Well',
          fileName: 'file_name_2',
          fileId: 'file_id_2',
          mapRepresentationId: 'map_representation_id_2'
        },
        {
          type: 'Well',
          fileName: 'file_name_3',
          fileId: 'file_id_3',
          mapRepresentationId: 'map_representation_id_3'
        }
      ];
      const deleteMapRepSpy = jest.spyOn(component, 'deleteMapRepresentation').mockImplementation();
      component.deleteMapRepresentationFilesByGroup(type);
      expect(deleteMapRepSpy).toHaveBeenCalledTimes(2);
      expect(component.removeGroup).toBe(true);
      expect(component.deletingShapeType).toEqual('Well');
    });
  });

  describe('isdisableAddMoreBtn', () => {
    it('should return false if all selected shapes have mapReprensentation already associated', () => {
      component.shapeUploaders = [{ type: 'Opportunity', visible: false }, { type: 'Well', visible: false }];
      component.mapRepresentationIdList = [
        {
          type: 'Opportunity',
          fileName: 'file_name_1',
          fileId: 'file_id_1',
          mapRepresentationId: 'map_representation_id_1'
        },
        {
          type: 'Well',
          fileName: 'file_name_2',
          fileId: 'file_id_2',
          mapRepresentationId: 'map_representation_id_2'
        },
        {
          type: 'Well',
          fileName: 'file_name_3',
          fileId: 'file_id_3',
          mapRepresentationId: 'map_representation_id_3'
        }
      ];
      const result = component.doUploadersHaveFiles();
      expect(result).toBe(false);
    });
  });

  it('should unsubscribe observable on destroy', () => {
    component.ngOnDestroy();
    expect(component.subscriptions.closed).toBe(true);
  });
  it('should toggle layer', () => {
    const layer = { type: 'Well', visible: true}
    component.toggleLayer(layer);
    expect(layer.visible).toBe(false);
    component.toggleLayer(layer);
    expect(layer.visible).toBe(true);
  });
  it('should hide all layers', () => {
    component.isGlobalVisible = true;
    component.toggleGlobalOption();
    expect(component.shapeUploaders[0].visible).toBe(false);
  });
  it('should show all layers', () => {
    component.isGlobalVisible = false;
    component.toggleGlobalOption();
    expect(component.shapeUploaders[0].visible).toBe(true);
  });

  it('should toggle mr', () => {
    const layer = {
      type: 'Opportunity',
      fileName: 'poly1.zip',
      fileId: 'FL-2S2-luoh020e1mo1-992996316364',
      mapRepresentationId: 'MR-VD7-ldfbxi4ufthd-384772581054',
      hidden: true
    };
    component.toggleMR(layer);
    expect(component.shapeUploaders[0].visible).toBe(true);
  });

  it('should toggle mr', () => {
    const layer = {
      type: 'Opportunity',
      fileName: 'poly1.zip',
      fileId: 'FL-2S2-luoh020e1mo1-992996316364',
      mapRepresentationId: 'MR-VD7-384772581054',
      hidden: false
    };
    component.mapRepresentationIdList = [
      {
        type: 'Well',
        fileName: 'file_name_3',
        fileId: 'file_id_3',
        mapRepresentationId: 'MR-VD7-384772581054',
        hidden: true
      },
      {
        type: 'Opportunity',
        fileName: 'file_name_3',
        fileId: 'file_id_3',
        mapRepresentationId: 'MR-VD7-384772581054',
        hidden: true
      }
    ];
    component.toggleMR(layer);
    expect(component.shapeUploaders[0].visible).toBe(false);
  });

});
