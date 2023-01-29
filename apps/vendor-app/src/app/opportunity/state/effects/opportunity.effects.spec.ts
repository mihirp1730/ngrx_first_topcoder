import * as mocks from '../../../shared/services.mock';
import * as opportunityActions from '../actions/opportunity.actions';
import * as opportunitySelectors from '../selectors/opportunity.selectors';

import { OpportunityService, OpportunityType } from '@apollo/app/services/opportunity';
import { Action, Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ReplaySubject, throwError } from 'rxjs';

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NotificationService } from '@apollo/app/ui/notification';
import { provideMockActions } from '@ngrx/effects/testing';
import { take } from 'rxjs/operators';
import { mockNotificationService } from '../../../shared/services.mock';
import { OpportunityEffects } from './opportunity.effects';

describe('OpportunityEffects', () => {
  let actions$: ReplaySubject<Action>;
  let effects: OpportunityEffects;
  let mockOpportunityService: OpportunityService;
  let mockStore: MockStore;

  beforeEach(() => {
    actions$ = new ReplaySubject(1);
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        provideMockActions(() => actions$),
        provideMockStore({
          selectors: [
            {
              selector: opportunitySelectors.selectOpportunity,
              value: {
                value: {
                  opportunityId: 'test-id',
                  opportunityName: 'test',
                  opportunityStatus: 'Published',
                  opportunityType: 'PUBLIC'
                }
              }
            },
            {
              selector: opportunitySelectors.selectCreationDetails,
              value: {
                details: {
                  isDetailsValid: true,
                  isOpenInfo: true,
                  opportunityName: 'test',
                  opportunityType: 'Public' as any
                }
              }
            },
            {
              selector: opportunitySelectors.selectCreatedOpportunityId,
              value: {
                opportunityId: 'test 1'
              }
            },
            {
              selector: opportunitySelectors.selectOpportunityDetails,
              value: {
                opportunityName: 'test 1'
              }
            },
            {
              selector: opportunitySelectors.selectCreationDetailsProfile,
              value: {
                profile: {
                  assetType: ['asset Type 1']
                }
              }
            },
            {
              selector: opportunitySelectors.selectCreationDetailsConfidentialProfile,
              value: {
                confidentialInformation: {
                  overview: 'test 1'
                }
              }
            }
          ]
        }),
        {
          provide: OpportunityService,
          useValue: mocks.mockOpportunityService
        },
        {
          provide: NotificationService,
          useValue: mocks.mockNotificationService
        },
        {
          provide: Router,
          useValue: mocks.mockRouter
        },
        OpportunityEffects
      ]
    });
    effects = TestBed.inject(OpportunityEffects);
    mockOpportunityService = TestBed.inject(OpportunityService);
    mockStore = TestBed.inject(Store) as MockStore;
  });
  afterEach(() => {
    actions$.complete();
  });

  describe('createOpportunity$', () => {
    it('should return a createOpportunitySuccess action', (done) => {
      effects.createOpportunity$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity] Create Opportunity Success');
        done();
      });
      actions$.next(opportunityActions.createOpportunity());
    });

    it('should return a createOpportunityFail action', (done) => {
      jest.spyOn(mockOpportunityService, 'createOpportunity').mockImplementation(() => throwError(new Error('')));
      effects.createOpportunity$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity] Create Opportunity Fail');
        done();
      });
      actions$.next(opportunityActions.createOpportunity());
    });
  });

  describe('createOpportunityWithError$', () => {
    it('should send out a notification with error', (done) => {
      effects.createOpportunityWithError$.pipe(take(1)).subscribe(() => {
        expect(mockNotificationService.send).toHaveBeenCalled();
        done();
      });
      actions$.next(opportunityActions.createOpportunityFail({ errorMessage: 'Something went wrong!' }));
    });
  });

  describe('saveOpportunity$', () => {
    it('should return a saveOpportunitySuccess with create opportunity success action', (done) => {
      effects.saveOpportunity$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity] Save Opportunity Success');
        done();
      });
      actions$.next(opportunityActions.createOpportunitySuccess({} as any));
    });

    it('should return a saveOpportunitySuccess with create opportunity success action', (done) => {
      effects.saveOpportunity$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity] Save Opportunity Success');
        done();
      });
      actions$.next(opportunityActions.createOpportunitySuccess({} as any));
    });

    it('should return a saveOpportunitySuccess with create opportunity success action', (done) => {
      mockStore.overrideSelector(opportunitySelectors.selectOpportunityDetails, {
        opportunityName: 'test 2',
        opportunityType: OpportunityType.Private
      } as any);
      effects.saveOpportunity$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity] Save Opportunity Success');
        done();
      });
      actions$.next(opportunityActions.createOpportunitySuccess({} as any));
    });

    it('should return a saveOpportunityFail action', (done) => {
      jest.spyOn(mockOpportunityService, 'saveOpportunity').mockImplementation(() => throwError(new Error('')));
      effects.saveOpportunity$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity] Save Opportunity Fail');
        done();
      });
      actions$.next(opportunityActions.createOpportunitySuccess({} as any));
    });
  });

  describe('editOpportunity', () => {
    xit('should return a additionalServicesChangedSuccess with edit opportunity action', (done) => {
      effects.editOpportunity$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity] Save Opportunity Profile Success Edit Flow');
        done();
      });
      actions$.next(opportunityActions.editOpportunity());
    });

    xit('should return a additionalServicesChangedSuccess with edit opportunity action, private opportunity', (done) => {
      mockStore.overrideSelector(opportunitySelectors.selectOpportunityDetails, {
        opportunityName: 'test 2',
        opportunityType: OpportunityType.Private
      } as any);
      effects.editOpportunity$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity] Reset MapRepresentation');
        done();
      });
      actions$.next(opportunityActions.editOpportunity());
    });

    xit('should return a saveOpportunityFail action', (done) => {
      jest.spyOn(mockOpportunityService, 'saveOpportunitySteps').mockImplementation(() => throwError(new Error('')));
      effects.editOpportunity$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity] Save Opportunity Fail');
        done();
      });
      actions$.next(opportunityActions.editOpportunity());
    });
  });

  describe('saveOpportunityProfile$', () => {
    it('should return a saveOpportunityProfileSuccess action', (done) => {
      effects.saveOpportunityProfile$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity] Save Opportunity Profile Success');
        done();
      });
      actions$.next(opportunityActions.saveOpportunitySuccess({} as any));
    });

    it('should return a saveOpportunityProfileFail action', (done) => {
      jest.spyOn(mockOpportunityService, 'saveOpportunityProfile').mockImplementation(() => throwError(new Error('')));
      effects.saveOpportunityProfile$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity] Save Opportunity Profile Fail');
        done();
      });
      actions$.next(opportunityActions.saveOpportunitySuccess({} as any));
    });
  });

  describe('saveOpportunityConfidentialProfile$', () => {
    it('should return a saveOpportunityConfidentialProfileSuccess action', (done) => {
      effects.saveOpportunityConfidentialProfile$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity] Save Opportunity Confidential Profile Success');
        done();
      });
      actions$.next(opportunityActions.saveOpportunityProfileSuccess({} as any));
    });

    it('should return a saveOpportunityConfidentialProfileFail action', (done) => {
      jest.spyOn(mockOpportunityService, 'saveOpportunityConfidentialProfile').mockImplementation(() => throwError(new Error('')));
      effects.saveOpportunityConfidentialProfile$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity] Save Opportunity Confidential Profile Fail');
        done();
      });
      actions$.next(opportunityActions.saveOpportunityProfileSuccess({} as any));
    });

    it('should send out a notification with error', (done) => {
      effects.saveOpportunityConfidentialProfileWithError$.pipe(take(1)).subscribe(() => {
        expect(mockNotificationService.send).toHaveBeenCalled();
        done();
      });
      actions$.next(opportunityActions.saveOpportunityConfidentialProfileFail({ errorMessage: 'Something went wrong!' }));
    });
  });

  describe('saveOpportunityAdditionalServices$', () => {
    it('should return an additionalServicesChangedSuccess action', (done) => {
      effects.saveOpportunityAdditionalServices$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity] Save Opportunity Additional Services Success');
        done();
      });
      actions$.next(opportunityActions.saveOpportunityConfidentialProfileSuccess({} as any));
    });

    it('should return an additionalServicesChangedFail action', (done) => {
      jest.spyOn(mockOpportunityService, 'addVdrToOpportunity').mockImplementation(() => throwError(new Error('')));
      effects.saveOpportunityAdditionalServices$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity] Save Opportunity Additional Services Fail');
        done();
      });
      actions$.next(opportunityActions.saveOpportunityConfidentialProfileSuccess({} as any));
    });

    it('should send out a notification with error', (done) => {
      effects.saveOpportunityAdditionalServicesWithError$.pipe(take(1)).subscribe(() => {
        expect(mockNotificationService.send).toHaveBeenCalled();
        done();
      });
      actions$.next(opportunityActions.additionalServicesChangedFail({ errorMessage: 'Something went wrong!' }));
    });
  });

  describe('saveOpportunityProfileWithError$', () => {
    it('should send out a notification with error', (done) => {
      effects.saveOpportunityProfileWithError$.pipe(take(1)).subscribe(() => {
        expect(mockNotificationService.send).toHaveBeenCalled();
        done();
      });
      actions$.next(opportunityActions.saveOpportunityProfileFail({ errorMessage: 'Something went wrong!' }));
    });
  });

  describe('getOpportunityError$', () => {
    it('should send a notification with error on getOpportunityFail', (done) => {
      effects.getOpportunityError$.pipe(take(1)).subscribe(() => {
        expect(mockNotificationService.send).toHaveBeenCalled();
        done();
      });
      actions$.next(opportunityActions.getOpportunityFail({ errorMessage: 'Something went wrong!' }));
    });

    it('should navigate back to opportunity dashbaord on getOpportunityFail', (done) => {
      const spy = jest.spyOn(mocks.mockRouter, 'navigateByUrl').mockImplementation();
      effects.getOpportunityError$.pipe(take(1)).subscribe(() => {
        expect(mockNotificationService.send).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith('vendor');
        done();
      });
      actions$.next(opportunityActions.getOpportunityFail({ errorMessage: 'Something went wrong!' }));
    });
  });

  describe('getOpportunity$', () => {
    const opportunityId = 'OP-id';
    it('should fetch opportunity success action', (done) => {
      effects.getOpportunity$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity] Get Opportunity Success');
        done();
      });
      actions$.next(opportunityActions.getOpportunity({ opportunityId }));
    });
  });

  describe('getMapRepresentation$', () => {
    const opportunityId = 'OP-id';
    it('should generate Replace Map Representations action', (done) => {
      effects.getMapRepresentation$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity] Replace Map Representations');
        done();
      });
      actions$.next(opportunityActions.getMapRepresentation({ opportunityId }));
    });
  });

  describe('deleteMapRepresentation$', () => {
    const mapRepresentationId = 'map-rep-id-1';
    const opportunityId = 'op-id-1';
    it('should generate Replace Map Representations action', (done) => {
      effects.deleteMapRepresentation$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity] Delete MapRepresentation Success');
        done();
      });
      actions$.next(opportunityActions.deleteMapRepresentation({ mapRepresentationId, opportunityId }));
    });
  });

  describe('publishOpportunity$', () => {
    it('should send a notification with success on publishOpportunitySuccess', (done) => {
      const opportunityId = 'OP-id';
      effects.publishOpportunitySuccess$.pipe(take(1)).subscribe(() => {
        expect(mockNotificationService.send).toHaveBeenCalled();
        done();
      });
      actions$.next(opportunityActions.publishOpportunitySuccess({ opportunityId }));
    });
    it('should send a notification with error on publishOpportunityFail', (done) => {
      effects.publishOpportunityFailed$.pipe(take(1)).subscribe(() => {
        expect(mockNotificationService.send).toHaveBeenCalled();
        done();
      });
      actions$.next(opportunityActions.publishOpportunityFail({ errorMessage: 'Something went wrong!' }));
    });
  });

  describe('getOpportunityRequestList$', () => {
    it('should return a getOpportunityRequestListSuccess action', (done) => {
      effects.getOpportunityRequestList$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity] Get Opportunity Request List Success');
        done();
      });
      actions$.next(opportunityActions.getOpportunityRequestList());
    });

    it('should send a notification with error on getOpportunityRequestListFail', (done) => {
      effects.getOpportunityRequestListFail$.pipe(take(1)).subscribe(() => {
        expect(mockNotificationService.send).toHaveBeenCalled();
        done();
      });
      actions$.next(opportunityActions.getOpportunityRequestListFail({ errorMessage: 'Something went wrong!' }));
    });
  });

  describe('getOpportunitySubscriptionList$', () => {
    it('should return a getOpportunitySubscriptionsSuccess action', (done) => {
      effects.getOpportunitySubscriptionList$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity] Get Opportunity Subscriptions Success');
        done();
      });
      actions$.next(opportunityActions.getOpportunitySubscriptions());
    });

    it('should send a notification with error on getOpportunitySubscriptionsFail', (done) => {
      effects.getOpportunitySubscriptionListFail$.pipe(take(1)).subscribe(() => {
        expect(mockNotificationService.send).toHaveBeenCalled();
        done();
      });
      actions$.next(opportunityActions.getOpportunitySubscriptionsFail({ errorMessage: 'Something went wrong!' }));
    });
  });

  describe('createOpportunitySubscription$', () => {
    it('should return a createOpportunitySubscriptionSuccess action', (done) => {
      const payload = {
        subscriptionRequestId: 'test'
      };
      effects.createOpportunitySubscription$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity] Create Opportunity Subscription Success');
        done();
      });
      actions$.next(opportunityActions.createOpportunitySubscription({ payload } as any));
    });

    it('should send a notification with error on createOpportunitySubscriptionFail', (done) => {
      effects.createOpportunitySubscriptionFail$.pipe(take(1)).subscribe(() => {
        expect(mockNotificationService.send).toHaveBeenCalled();
        done();
      });
      actions$.next(opportunityActions.createOpportunitySubscriptionFail({ errorMessage: 'Something went wrong!' }));
    });
  });

  describe('rejectOpportunityRequest$', () => {
    it('should return a rejectOpportunityRequestSuccess action', (done) => {
      const payload = {
        rejectionReason: 'test'
      };
      const subscriptionRequestId = 'test';
      effects.rejectOpportunityRequest$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity] Reject Opportunity Request Success');
        done();
      });
      actions$.next(opportunityActions.rejectOpportunityRequest({ payload, subscriptionRequestId } as any));
    });

    it('should send a notification with error on rejectOpportunityRequestFail', (done) => {
      effects.rejectOpportunityRequestFail$.pipe(take(1)).subscribe(() => {
        expect(mockNotificationService.send).toHaveBeenCalled();
        done();
      });
      actions$.next(opportunityActions.rejectOpportunityRequestFail({ errorMessage: 'Something went wrong!' }));
    });
  });
  describe('updateOpportunitySubscription$', () => {
    it('should return a updateOpportunitySubscriptionSuccess action', (done) => {
      const payload = {
        opportunitySubscriptionId: 'test_1'
      };
      effects.updateOpportunitySubscription$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunity] Update Opportunity Subscription Success');
        done();
      });
      actions$.next(opportunityActions.updateOpportunitySubscription({ payload } as any));
    });

    it('should send a notification with error on updateOpportunitySubscriptionFail', (done) => {
      effects.updateOpportunitySubscriptionFail$.pipe(take(1)).subscribe(() => {
        expect(mockNotificationService.send).toHaveBeenCalled();
        done();
      });
      actions$.next(opportunityActions.updateOpportunitySubscriptionFail({ errorMessage: 'Something went wrong!' }));
    });
  });

  describe('getPublicPublishedOpportunity$', () => {
    it('should return a opportunities List ', (done) => {
      effects.getOpportunitiesList$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe('[Opportunities] Get Opportunities Success');
        done();
      });
      actions$.next(opportunityActions.getPublishedPublicOpportunities());
    });

    it('should send a notification with error on getOpportunitiesListFail', (done) => {
      effects.getOpportunitiesListFail$.pipe(take(1)).subscribe(() => {
        expect(mockNotificationService.send).toHaveBeenCalled();
        done();
      });
      actions$.next(opportunityActions.getOpportunitiesFail({ errorMessage: 'Something went wrong!' }));
    });
  });
});
