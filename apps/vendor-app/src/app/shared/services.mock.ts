/* istanbul ignore file */

import { of } from 'rxjs';

export const mockAuthCodeFlowService = {
  getUser: jest.fn(() => of({})),
  signIn: jest.fn(),
  checkUserTokenInfo: jest.fn(() => of()),
  handleChannelMessage: jest.fn(() => of()),
  signOut: jest.fn()
};

export const mockFeatureFlagService = {
  featureEnabled: jest.fn().mockReturnValue(of(false))
};

export const mockRouter = {
  navigateByUrl: jest.fn(),
  getCurrentNavigation: jest.fn().mockReturnValue({ extras: { state: {} } }),
  navigate: jest.fn()
};

export const mockActivatedRoute = {
  snapshot: {
    data: {
      package: {
        id: 'test-id',
        dataPackageId: 'test-id',
        name: 'Test name',
        dataPackageProfile: {
          profile: {
            regions: [],
            overview: {
              overView: null,
              keyPoints: []
            },
            featuresAndContents: {
              keyPoints: []
            }
          },
          price: {
            onRequest: true,
            price: null,
            durationTerm: null
          }
        },
        marketingRepresentations: [
          {
            fileId: 'test-id-1',
            type: 'Type1',
            fileName: 'shape-file.zip'
          }
        ],
        deliverables: [
          {
            recordId: 'test-file-1'
          }
        ]
      },
      editMode: false
    }
  }
};

export const mockVendorAppService = {
  createSubscriptionRequest: jest.fn().mockReturnValue(of({ dataSubscriptionRequestId: 'test' })),
  retrieveVendorProfile: jest.fn().mockReturnValue(of({})),
  consumerUrl$: of('url'),
  retrieveAssociatedConsumerAppUrl: jest.fn().mockReturnValue(of('/test')),
  retrieveDataVendors: jest.fn().mockReturnValue(
    of([
      {
        dataVendorId: 'DataVendorId',
        name: 'Test Data Vendor'
      }
    ])
  ),
  dataVendors: [{ dataVendorId: 'VD7' }]
};

export const mockSettingsService = {
  getSettings: jest.fn().mockReturnValue(of(['uno']))
};

export const mockMetadataService = {
  marketingLayers$: of([
    {
      layerName: 'Well'
    },
    {
      layerName: 'Seismic 3D Survey'
    }
  ]),
  metadata$: of([]),
  regions$: of([]),
  opportunity$: of([]),
  opportunitiesMetadata$: of({}),
  assetTypesMetadata$: of(['test1', 'test 2']),
  contractTypesMetadata$: of([]),
  deliveryTypesMetadata$: of([]),
  offerTypesMetadata$: of([]),
  phaseTypesMetadata$: of([]),
  countryList$: of([])
};

export const mockMapLargeHelperService = {
  getDeployment: jest.fn(() => of({})),
  getActiveTables: jest.fn(() =>
    of({
      tables: [
        {
          acctcode: 'slb',
          columns: [
            {
              id: 'slb/test',
              name: 'source',
              type: 'Poly'
            }
          ],
          created: '2020-03-16T11:58:58.5990123Z',
          folder: null,
          host: 'host',
          id: 'slb/tenant',
          inram: false,
          name: 'tenant1_wke_well_1_0_0',
          rowCount: 4,
          tags: [],
          version: '637199567385990123'
        }
      ]
    })
  ),
  getCountFromMl: jest.fn(() =>
    of({
      data: {
        allGeo: {},
        totals: {
          Records: 1
        },
        tablename: 'slb/Test',
        data: {
          OpportunityId: ['OP-VD7-smmqrhmt8m0g-674696414093'],
          OpportunityId_Count: [1]
        }
      }
    })
  )
};

export const mockSecureEnvironmentService = {
  secureEnvironment: {
    app: {
      key: '',
      splitKey: ''
    },
    xchange: {
      mlAccount: ''
    },
    map: {
      deploymentUrl: ''
    },
    whatFix: {
      whatFixUrl: ''
    }
  }
};

export const mockGisMapLargeService = {
  reloadLayers: jest.fn(() => of()),
  setZoom: jest.fn(),
  layersChange$: of([]),
  map: {
    zoomToExtents: jest.fn(),
    layers: [
      {
        originalTableName: 'slb/Well',
        originalOptions: {
          name: 'Well',
          query: {
            table: {
              name: 'slb/Well'
            }
          }
        },
        visible: { zzfieldValue: true },
        show: () => {
          mockGisMapLargeService.map.layers[0].visible.zzfieldValue = true;
        },
        hide: () => {
          mockGisMapLargeService.map.layers[0].visible.zzfieldValue = false;
        }
      }
    ]
  },
  settingsService: {
    layersConfiguration: [
      {
        id: 'Well',
        name: 'Well',
        originalTableName: 'slb/Well',
        originalOptions: {
          name: 'Well',
          query: {
            table: {
              name: 'slb/Well'
            }
          }
        }
      }
    ]
  }
};

export const mockGisSearchResultActionService = {
  getSearchResults: jest.fn(),
  closeSearchResult: jest.fn(),
  getSelectionResults: jest.fn(),
  onButtonClick: jest.fn(),
  detailRecord: jest.fn(),
  getDisableLayers: jest.fn(),
  setMetaData: jest.fn(),
  getSingleObjectSelection: jest.fn(),
  transformedData: of({})
};

export const mockGisLayerPanelService = {
  initializeLayerPanel: jest.fn().mockReturnValue([
    {
      originalOptions: {
        query: {}
      }
    }
  ])
};

export const mockFileUploaderService = {
  upload: jest.fn(),
  getFiles: jest.fn(),
  getFile: jest.fn(),
  updateProgress: jest.fn(),
  cancelUpload: jest.fn(),
  updateAssociatedId: jest.fn()
};

export const mockUserService = {
  getContext: jest.fn()
};

export const mockDataPackagesService = {
  createDataPackage: jest.fn().mockReturnValue(of({ id: 'test' })),
  createMarketingRepresentation: jest.fn().mockReturnValue(of({})),
  publishPackage: jest.fn(),
  associateDeliverable: jest.fn().mockReturnValue(of({})),
  getDataPackages: jest.fn().mockReturnValue(of({})),
  getDataPackage: jest.fn().mockReturnValue(of({})),
  getPublishedDataPackageById: jest.fn().mockReturnValue(of({ id: 'test', dataPackageProfile: { price: 1200, durationTerm: 6 } })),
  savePackageProfile: jest.fn().mockReturnValue(of({ id: 'test-id' })),
  deleteDraftPackage: jest.fn().mockReturnValue(of({})),
  unpublishPackage: jest.fn().mockReturnValue(of({})),
  updatePackageName: jest.fn().mockReturnValue(of({ id: 'test' })),
  getMarketingRepresentations: jest.fn().mockReturnValue(of([])),
  getAssociateDeliverables: jest.fn().mockReturnValue(of([])),
  deleteMarketingRepresentation: jest.fn().mockReturnValue(of({})),
  deleteAssociatedDeliverables: jest.fn().mockReturnValue(of())
};

export const mockDataSubscriptionService = {
  getRequests: jest.fn().mockReturnValue(of([])),
  createSubscription: jest.fn().mockReturnValue(of({}))
};

export const mockNotificationService = {
  send: jest.fn(),
  close: jest.fn()
};

export const mockMessageService = {
  add: jest.fn()
};

export const mockMatDialogModal = {
  open: jest.fn(),
  closeAll: jest.fn()
};

export const mockMatDialogRefModal = {
  close: jest.fn()
};

export const mockMatDialogData = {
  data: {
    packageName: 'Wells',
    item: [
      {
        attendeeId: 'test@test.com',
        opportunityId: 'test'
      }
    ]
  }
};

export const mockManageSubscriptionService = {
  getManageSubscription: jest.fn().mockReturnValue(of([]))
};

export const mockShareDataService = {
  getIsMRCreated: jest.fn().mockReturnValueOnce(of(false)),
  setIsMRCreated: jest.fn()
};

export const mockLeaveForm = {
  canLeave: jest.fn()
};

export const mockGoogleAnalyticsService = {
  gtag: jest.fn(),
  pageView: jest.fn()
};

export const mockMediaDownloadService = {
  downloadMedia: jest.fn().mockReturnValue(of('signed-url')),
  downloadMultipleMedia: jest.fn().mockReturnValue(
    of([
      {
        fileId: 'fileId1',
        signedUrl: 'signedUrl1'
      },
      {
        fileId: 'fileId2',
        signedUrl: 'signedUrl2'
      }
    ])
  )
};

export const mockOpportunityService = {
  createOpportunity: jest.fn().mockReturnValue(of({ opportunityId: 'test' })),
  getOpportunityList: jest.fn().mockReturnValue(of([])),
  getOpportunityById: jest.fn().mockReturnValue(of({})),
  saveOpportunitySteps: jest.fn().mockReturnValue(of([])),
  getMapRepresentationById: jest.fn().mockReturnValue(
    of({
      mapRepresentations: [
        { shapeType: 'Opportunity', shapeFileName: 'file-name-1', shapeFileId: 'file-id-1', mapRepresentationId: 'map-rep-id-1' }
      ]
    } as any)
  ),
  deleteMapRepresentation: jest.fn().mockReturnValue(of({ mapRepresentationId: 'map-rep-id-1' })),
  saveOpportunityProfile: jest.fn().mockReturnValue(of({ opportunityProfileId: 'test' })),
  saveOpportunityConfidentialProfile: jest.fn().mockReturnValue(of({ confidentialOpportunityProfileId: 'test' })),
  publishOpportunity: jest.fn().mockReturnValueOnce(of(true)),
  createMarketingRepresentation: jest.fn().mockReturnValueOnce(of({ mapRepresentationId: 'test' })),
  saveOpportunity: jest.fn().mockReturnValue(of({ opportunityId: 'test' })),
  getOpportunityRequestList: jest
    .fn()
    .mockReturnValue(of([{ opportunityId: 'test', firstName: 'test', lastName: 'test', requestedFor: ['test', 'test2'] }])),
  getOpportunitySubscriptions: jest.fn().mockReturnValue(of([])),
  createSubscription: jest.fn().mockReturnValue(of({ opportunitySubscriptionId: 'test' })),
  addVdrToOpportunity: jest.fn().mockReturnValue(of({})),
  rejectOpportunityRequest: jest.fn().mockReturnValue(of({})),
  updateSubscription: jest.fn().mockReturnValue(of({})),
  getPublicPublishedOpportunities: jest.fn().mockReturnValue(of({})),
  getOpportunityConsumerUrl: jest.fn().mockReturnValue('test-url')
};

export const mockCommunicationService = {
  getChatThreads: jest.fn().mockReturnValue(of([])),
  createChatThread: jest.fn().mockReturnValue(of({ chatThreadId: 'test' })),
  getMessagesByChatId: jest.fn().mockReturnValue(of([])),
  addParticipantToChat: jest.fn().mockReturnValue(of(null)),
  getParticipantsInChat: jest.fn().mockReturnValue(of([])),
  connect: jest.fn(),
  sendMessage: jest.fn(),
  messages$: of({}),
  unreadChats: of(0),
  updateStatus: jest.fn().mockReturnValue(of({})),
  getChatCount: jest.fn().mockReturnValue(0),
  changeCount: jest.fn()
};

export const mockUserSubscriptionService = {
  getUserSubscription: jest.fn().mockReturnValue(
    of({
      hasAcceptedTerms: true,
      userSubscriptions: [
        {
          billingAccountId: '2S21QQGC6J',
          billingAccountName: 'VD7',
          contractId: '2S21QQGASF',
          subscriptions: [
            {
              departmentId: '5019b7cf84e8e30d0e2d9032c2eb0ac2',
              departmentName: 'Default',
              durationId: '1m',
              endpointID: '79911a0f79c59dc000973947211ccee3',
              instance: 'https://evq.gaia-osdu.gaiaops.cloud.slb-ds.com/xchange/vendor/opportunity',
              product: {
                code: 'asset-transaction-host',
                description: 'Host access to portal for promotion of energy assets',
                featureSets: [
                  {
                    applicationCode: 'assettransactionportal',
                    applicationName: 'Asset Transaction Portal',
                    claims: ['atp_base'],
                    name: 'Base',
                    type: 'Base'
                  }
                ],
                groupId: 'AssetTransactionPortal',
                name: 'Asset Transaction Host',
                partNumber: 'ASTH-TO-SUBU',
                productType: 'ApplicationAccess'
              },
              region: 'EVQ',
              subscriptionId: 'd62152363a9b8adfe75a4a6b96219b57',
              userId: 'graghuvanshi@slb.com'
            }
          ]
        }
      ]
    })
  )
};
