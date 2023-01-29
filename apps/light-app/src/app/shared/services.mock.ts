import { AuthUser } from '@apollo/api/interfaces';
import { of, Subject } from 'rxjs';

export const mockFeatureFlagService = {
  featureEnabled: jest.fn().mockReturnValue(of(true))
};

export const mockMetadataService = {
  metadata$: of([])
};

export const mockRouter = {
  navigate: jest.fn().mockReturnValue(Promise.resolve()),
  navigateByUrl: jest.fn(),
  getCurrentNavigation: jest.fn().mockReturnValue({ extras: { state: { opportunityId: '123', opportunityName: 'test' } } }),
  createUrlTree: jest.fn(),
  serializeUrl: jest.fn(),
  events: of()
};

export const mockSettingsService = {
  getSettings: jest.fn().mockReturnValue(of(['uno'])),
  getExclusiveMapConfig: jest.fn().mockReturnValue(of({ consumerURL: 'localhost', mapType: 'Public' }))
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
    }
  }
};

export const mockActivatedRoute = {
  snapshot: {
    data: {
      package: {
        dataPackageId: 'D-XIN-1-WG-5572726251061248',
        dataPackageName: 'USA Well Data',
        profile: {
          overview: {
            overView: 'overview'
          },
          featuresAndContents: {},
          regions: ['Europe', 'North America'],
          media: {
            images: [
              {
                title: 'string'
              }
            ],
            videos: []
          }
        },
        price: {
          price: 1200,
          onRequest: true,
          durationTerm: 12
        },
        vendor: {},
        status: 'PUBLISHED',
        vendorId: 'vendor_test'
      }
    },
    params: {
      id: 'test-id'
    }
  }
};

export const mockAuthCodeFlowService = {
  getUser: jest.fn(() => of({ token: '', isGuest: false } as unknown as AuthUser)),
  checkUserTokenInfo: jest.fn(() => of()),
  handleChannelMessage: jest.fn(() => of()),
  signIn: jest.fn(),
  isSignedIn: jest.fn(() => of(true)),
  signOut: jest.fn()
};

export class MockHighlightOnHoverDirective {
  highlightResult = jest.fn();
}

export class MockAuthCodeFlowService {
  _getUser = new Subject();
  getUser = () => this._getUser.asObservable();
}

export class MockGisMapDataService {
  gisMapInstance = {
    layers: []
  };
}

export const mockGisMapLargeService = {
  getInitialStyleRules: jest.fn(),
  setZoom: jest.fn(),
  drawLassoToSelect: jest.fn(() => of({})),
  drawRectangleToSelect: jest.fn(() => of({})),
  drawPolygonToSelect: jest.fn(() => of({})),
  click$: new Subject(),
  centerChange$: new Subject(),
  zoomChange$: new Subject(),
  onClickResult$: of({}),
  layersChange$: of([]),
  singleObjectwktSession: '',
  map: {
    getVisibleBB: jest.fn(() => ({
      maxLat: 0,
      minLat: 0,
      maxLng: 0,
      minLng: 0
    })),
    layers: [
      {
        originalOptions: {
          visible: true
        },
        originalTableName: 'Asset'
      }
    ]
  },
  drawingManager: {
    disable: jest.fn(),
    addDrawingFromWKT: jest.fn(),
    removeDrawing: jest.fn(),
    layers: []
  }
};

export const mockGisSearchResultActionService = {
  getSearchResults: jest.fn(),
  getSearchResult: jest.fn(),
  closeSearchResult: jest.fn(),
  getSelectionResults: jest.fn(),
  onButtonClick: jest.fn(),
  detailRecord: jest.fn(),
  getDisableLayers: jest.fn(),
  setMetaData: jest.fn(),
  getSingleObjectSelection: jest.fn(),
  transformedData: of({}),
  searchResultService: {
    query: {}
  }
};

export class MockGisSearchResultService {
  getMapExtentData = jest.fn();
  isGisMapFilterExtent = false;
  isGroupMapExtent = null;
  mapExtentWkt = null;
  zoomToExtents = jest.fn();
}

export class MockGisLayersService {
  gisLayers: null;
  selectionResults: null;
}

export class MockGisSearchResultActionService {
  getSearchResults = jest.fn();
}

export const mockGisLayerPanelService = {
  initializeLayerPanel: jest.fn().mockReturnValue([{}])
};

export const mockPerformanceIndicatorService = {
  startTiming: jest.fn(),
  endTiming: jest.fn(),
  cleanRecord: jest.fn()
};

export const mockDataPackagesService = {
  getPublishedDataPackageById: jest.fn().mockReturnValue(of({ id: 'test' }))
};

export class MockDataPackagesService {
  getConsumerDataPackage = jest.fn().mockReturnValue(of({}));
  getPublishedDataPackageById = jest.fn().mockReturnValue(of({}));
}

export const mockPackageService = {
  getPackage: jest.fn().mockReturnValue(of({})),
  getPackages: jest.fn().mockReturnValue(of([{}])),
  getDownloadUrl: jest.fn().mockReturnValue(of([{}]))
};

export const mockGoogleAnalyticsService = {
  gtag: jest.fn(),
  pageView: jest.fn()
};

export class MockGoogleAnalyticsService {
  gtag = jest.fn();
}

export const mockMessageService = {
  add: jest.fn()
};

export const mockMatDialogModal = {
  open: jest.fn()
};

export const mockMatDialogRefModal = {
  close: jest.fn()
};

export const mockUserService = {
  getContext: jest.fn()
};

export const mockNotificationService = {
  send: jest.fn()
};

export class MockNotificationService {
  send = jest.fn();
}

export const mockResultPanelService = {
  packagesIds$: jest.fn().mockReturnValue(of()),
  showingDataLayers$: jest.fn().mockReturnValue(of()),
  showingPackages$: jest.fn().mockReturnValue(of()),
  totalMessage$: jest.fn().mockReturnValue(of()),
  search$: jest.fn().mockReturnValue(of()),
  showDataLayers: jest.fn(),
  showPackages: jest.fn(),
  updateState: jest.fn(),
  updatSearchTerm: jest.fn()
};

export const mockSubscriptionService = {
  getSubscription: jest.fn().mockReturnValue(of({})),
  getActiveSubscriptions: jest.fn().mockReturnValue(of([{}])),
  getRequestedSubscriptions: jest.fn().mockReturnValue(of([{}])),
  getExpiredSubscriptions: jest.fn().mockReturnValue(of([{}])),
  getPackage: jest.fn().mockReturnValue(of([{}])),
  getConsumerSubscription: jest.fn().mockReturnValue(of({ dataSubscriptionStatus: 'EXPIRED' })),
  getConsumerSubscriptionDataItems: jest.fn().mockReturnValue(of([]))
};

export const mockConsumerSubscriptionService = {
  getConsumerSubscription: jest.fn()
};

export class MockConsumerSubscriptionService {
  _getConsumerSubscriptions = new Subject();
  getConsumerSubscriptions = () => this._getConsumerSubscriptions.asObservable();
}

export const mockMapWrapperService = {
  getCurrentAppAction: jest.fn(),
  updateCurrentAppAction: jest.fn()
};

export const mockLassoToolsService = {
  getCurrentLasso: jest.fn(),
  updateCurrentLasso: jest.fn(),
  clearCurrentLasso: jest.fn()
};

export const mockConfigurationLoaderService = {
  load: jest.fn()
};

export const mockGisHandlerService = {
  configure: jest.fn(),
  setup: jest.fn(),
  listen: jest.fn(),
  search: jest.fn(),
  clearSearch: jest.fn(),
  select: jest.fn(),
  click: jest.fn(),
  inspect: jest.fn(),
  back: jest.fn(),
  resultClick: jest.fn(),
  setZoom: jest.fn(),
  isActionValid: jest.fn(),
  gisLayerService: {
    gisLayers: [
      { name: 'Well' },
      { name: 'Seismic 3D Survey' },
      {
        name: 'Opportunity',
        filter: {
          attributes: [
            {
              name: 'AssetType',
              displayName: 'Asset Type',
              isFilterable: true,
              mapLargeAttribute: 'AssetType',
              values: [
                {
                  name: 'Carbon Trading',
                  selected: true,
                  count: 27
                }
              ]
            }
          ]
        }
      }
    ]
  },
  onSearchTerm: new Subject<string>()
};

export const mockGisTopToolbarService = {
  queryPanelAction: new Subject<string>(),
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onSelectedAction: () => {},
  tooltipAction: new Subject<string>()
};

export const mockGisSearchBoxService = {
  setKeyword: jest.fn()
};

export const mockLassoPersistenceService = {
  drawLassoShape: jest.fn(),
  clearLassoShape: jest.fn()
};

export const mockDataSubscriptionService = {
  createSubscriptionRequests: jest.fn().mockReturnValue(of({ dataSubscriptionRequestId: 'test' }))
};

export class MockDataSubscriptionService {
  createSubscriptionRequests = jest.fn();
}

export const mockContentService = {
  downloadSubscriptionContent: jest.fn()
};

export const mockContentDownloaderService = {
  download: jest.fn()
};

export class MockContentDownloaderService {
  download = jest.fn();
}

export const mockMediaDocumentUploaderService = {
  downloadMedia: jest.fn()
};

export const mockMediaDownloadService = {
  downloadMedia: jest.fn().mockReturnValue(of('signed-url'))
};

export const mockLogoMediaDownloadService = {
  downloadLogoImageSrc: jest.fn().mockReturnValue(of('signed-url'))
};

export class MockMediaDownloadService {
  downloadMedia = jest.fn();
}

export const mockVendorAppService = {
  retrieveDataVendors: jest.fn().mockReturnValue(
    of([
      {
        dataVendorId: 'DataVendorId',
        name: 'Test Data Vendor'
      }
    ])
  ),
  retrieveVendorProfile: jest.fn().mockReturnValue(
    of({
      name: 'Test Data Vendor'
    })
  ),
  retrieveVendorContactPerson: jest.fn().mockReturnValue(of([]))
};

export class MockVendorAppService {
  retrieveDataVendors = jest.fn().mockReturnValue(
    of([
      {
        dataVendorId: 'DataVendorId',
        name: 'Test Data Vendor'
      }
    ])
  );
  retrieveVendorProfile = jest.fn().mockReturnValue(
    of({
      name: 'Test Data Vendor'
    })
  );
}

export const mockOpportunityAttendeeService = {
  getListPublishedOpportunities: jest.fn().mockReturnValue(of([])),
  getPublishedOpportunityById: jest.fn().mockReturnValue(of({})),
  createRequestAccess: jest.fn().mockReturnValue(of({})),
  getOpportunityRequestsList: jest.fn().mockReturnValue(of([])),
  getOpportunitySubscriptions: jest.fn().mockReturnValue(of([]))
};

export const mockCommunicationService = {
  getChatThreads: jest.fn().mockReturnValue(of([])),
  createChatThread: jest.fn().mockReturnValue(of({ chatThreadId: 'test' })),
  getMessagesByChatId: jest.fn().mockReturnValue(of([])),
  addParticipantToChat: jest.fn().mockReturnValue(of(null)),
  getParticipantsInChat: jest.fn().mockReturnValue(of([])),
  connect: jest.fn(),
  closeSocket: jest.fn(),
  sendMessage: jest.fn(),
  messages$: of({}),
  unreadChats: of(0),
  updateStatus: jest.fn().mockReturnValue(of({})),
  getChatCount: jest.fn().mockReturnValue(0),
  changeCount: jest.fn()
};

export class MockHighlightDirective {
  highlightResult = jest.fn();
  removeHighlightResult = jest.fn();
}

export const mockCookieService = {
  get: jest.fn(),
  set: jest.fn()
};

export const mockOpportunityPanelService = {
  runMapLargeQuery: jest.fn().mockReturnValue(
    of({
      opportunities: [
        {
          opportunityId: 'test'
        }
      ],
      totalOpportunities: 1
    })
  )
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
