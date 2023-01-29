import * as mocks from '../../../shared/services.mock';
import * as opportunityAttendeeActions from '../actions/opportunity-attendee.actions';

import { ReplaySubject, of, throwError } from 'rxjs';
import {
  mockMediaDownloadService,
  mockNotificationService,
  mockOpportunityAttendeeService,
  mockVendorAppService
} from '../../../shared/services.mock';

import { Action } from '@ngrx/store';
import { MediaDownloadService } from '@apollo/app/services/media-download';
import { NotificationService } from '@apollo/app/ui/notification';
import { OpportunityAttendeeEffects } from './opportunity-attendee.effects';
import { OpportunityAttendeeService } from '@apollo/app/services/opportunity-attendee';
import { OpportunityPanelService } from '../../../opportunity-panel/services/opportunity-panel.service';
import { TestBed } from '@angular/core/testing';
import { VendorAppService } from '@apollo/app/vendor';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { take } from 'rxjs/operators';

class MockOpportunityPanelService {
  getCountRunner = jest.fn();
}
describe('OpportunityAttendeeEffects', () => {
  let actions$: ReplaySubject<Action>;
  let effects: OpportunityAttendeeEffects;
  let mockOpportunityService: OpportunityAttendeeService;
  let mockOpportunityPanelService: MockOpportunityPanelService;
  beforeEach(() => {
    actions$ = new ReplaySubject(1);
    TestBed.configureTestingModule({
      providers: [
        provideMockActions(() => actions$),
        provideMockStore(),
        {
          provide: OpportunityAttendeeService,
          useValue: mockOpportunityAttendeeService
        },
        {
          provide: VendorAppService,
          useValue: mockVendorAppService
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService
        },
        {
          provide: MediaDownloadService,
          useValue: mockMediaDownloadService
        },
        {
          provide: OpportunityPanelService,
          useClass: MockOpportunityPanelService
        },
        OpportunityAttendeeEffects
      ]
    });
    effects = TestBed.inject(OpportunityAttendeeEffects);
    mockOpportunityService = TestBed.inject(OpportunityAttendeeService);
    mockOpportunityPanelService = TestBed.inject(OpportunityPanelService) as unknown as MockOpportunityPanelService;
  });
  afterEach(() => {
    actions$.complete();
  });

  describe('getOpportunitiesList$', () => {
    it('should return a getOpportunitiesSuccess action', (done) => {
      effects.getOpportunitiesList$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunities Attendee] Get Opportunities Success');
        done();
      });
      actions$.next(opportunityAttendeeActions.getOpportunities());
    });

    it('should return a getOpportunitiesFail action', (done) => {
      jest.spyOn(mockOpportunityService, 'getListPublishedOpportunities').mockImplementation(() => throwError(new Error('')));
      effects.getOpportunitiesList$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunities Attendee] Get Opportunities Fail');
        done();
      });
      actions$.next(opportunityAttendeeActions.getOpportunities());
    });
  });

  describe('getOpportunitiesFailed$', () => {
    it('should send out a notification with error', (done) => {
      effects.getOpportunitiesFailed$.pipe(take(1)).subscribe(() => {
        expect(mockNotificationService.send).toHaveBeenCalled();
        done();
      });
      actions$.next(opportunityAttendeeActions.getOpportunitiesFail({ errorMessage: 'Something went wrong!' }));
    });
  });

  describe('getOpportunityById$', () => {
    it('should return a getOpportunityByIdSuccess action', (done) => {
      const opportunity = {
        opportunityId: 'someId',
        dataVendorId: 'someId',
        opportunityProfile: {
          media: [
            {
              fileId: 'fileId_1'
            },
            {
              fileId: 'fileId_2'
            }
          ]
        },
        confidentialOpportunityProfile: {
          media: [
            {
              fileId: 'fileId_1'
            },
            {
              fileId: 'fileId_2'
            }
          ]
        },
        dataObjects: [
          { count: 7, name: 'Seismic 3D Survey', entityIcon: 'apollo:SeismicSurvey3d' },
          { count: 9, name: 'Well', entityIcon: 'apollo:Well' }
        ]
      };
      jest.spyOn(mockMediaDownloadService, 'downloadMedia').mockImplementation((_) => of(['signedurl_1']));
      jest
        .spyOn(mockOpportunityPanelService, 'getCountRunner')
        .mockImplementation((oppId) => of([{ dataObjects: opportunity.dataObjects, opportunityId: opportunity.opportunityId }]));
      jest.spyOn(mockOpportunityService, 'getPublishedOpportunityById').mockImplementation((oppId) => of(opportunity as any));

      effects.getOpportunityById$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunities Attendee] Get Opportunity By Id Success');
        done();
      });
      actions$.next(opportunityAttendeeActions.getOpportunityById({ opportunityId: 'someId' }));
    });

    it('should return a getOpportunityByIdFail action', (done) => {
      jest.spyOn(mockOpportunityService, 'getPublishedOpportunityById').mockImplementation(() => throwError(new Error('')));
      effects.getOpportunityById$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunities Attendee] Get Opportunity By Id Fail');
        done();
      });
      actions$.next(opportunityAttendeeActions.getOpportunityById({ opportunityId: 'someId' }));
    });
  });

  describe('getOpportunityRequestList$', () => {
    it('should return a getOpportunityRequestSuccess action', (done) => {
      const requests = { items: [{ requestStatus: 'Approved' }] };
      jest.spyOn(mockOpportunityService, 'getOpportunityRequestsList').mockImplementation(() => of(requests as any));
      effects.getOpportunityRequestsList$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity Requests] Get Opportunity Requests Success');
        done();
      });
      actions$.next(opportunityAttendeeActions.getOpportunityRequests());
    });

    it('should return a getOpportunityRequestFail action', (done) => {
      jest.spyOn(mockOpportunityAttendeeService, 'getOpportunityRequestsList').mockImplementation(() => throwError(new Error('')));
      effects.getOpportunityRequestsList$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity Requests] Get Opportunity Requests Fail');
        done();
      });
      actions$.next(opportunityAttendeeActions.getOpportunityRequests());
    });
  });

  describe('getOpportunityRequestFailed$', () => {
    it('should send out a notification with error', (done) => {
      effects.getOpportunityRequestsFailed$.pipe(take(1)).subscribe(() => {
        expect(mocks.mockNotificationService.send).toHaveBeenCalled();
        done();
      });
      actions$.next(opportunityAttendeeActions.getOpportunityRequestsFail({ errorMessage: 'Something went wrong!' }));
    });
  });

  describe('getOpportunitySubscriptions$', () => {
    it('should return a getOpportunitySubscriptionSuccess action', (done) => {
      const subscriptions = { items: [{ accessDetails: [{ accessLevel: 'test' }] }] };
      jest.spyOn(mockOpportunityService, 'getOpportunitySubscriptions').mockImplementation(() => of(subscriptions as any));
      effects.getOpportunitySubscriptions$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity Subscriptions] Get Opportunity Subscriptions Success');
        done();
      });
      actions$.next(opportunityAttendeeActions.getOpportunitySubscriptions());
    });

    it('should return a getOpportunityRSubscriptionFail action', (done) => {
      jest.spyOn(mockOpportunityAttendeeService, 'getOpportunitySubscriptions').mockImplementation(() => throwError(new Error('')));
      effects.getOpportunitySubscriptions$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity Subscriptions] Get Opportunity Subscriptions Fail');
        done();
      });
      actions$.next(opportunityAttendeeActions.getOpportunitySubscriptions());
    });
  });

  describe('getOpportunitySubscriptionFailed$', () => {
    it('should send out a notification with error', (done) => {
      effects.getOpportunitySubscriptionsFailed$.pipe(take(1)).subscribe(() => {
        expect(mocks.mockNotificationService.send).toHaveBeenCalled();
        done();
      });
      actions$.next(opportunityAttendeeActions.getOpportunitySubscriptionsFail({ errorMessage: 'Something went wrong!' }));
    });
  });
});
